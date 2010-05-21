var router = require("./router"),
	url = require("url"),
	qs = require("querystring"),
	Channel = require("./channel").Channel;

var servers = [];

function Server() {
	this.httpServer = router.createServer();
	this.channels = [];
}

extend(Server.prototype, {
	listen: function(port, host) {
		this.httpServer.listen(port, host);
	},
	
	passThru: function(path, handler) {
		this.httpServer.get(path, handler);
	},
	
	addChannel: function(options) {
		var httpServer = this.httpServer,
			channel = new Channel(options);
		
		if (!channel) {
			return false;
		}
		
		this.channels.push(channel);
		
		handlers.forEach(function(handler) {
			httpServer.get(channel.basePath + handler.path,
				handler.handler.partial(channel));
		});
		
		return channel;
	}
});

exports.createServer = function() {
	var server = new Server();
	servers.push(server);
	
	return server;
};



var handlers = [
	{ path: "/who", handler: function(channel, request, response) {
		var nicks = [];
		for (var id in channel.sessions) {
			nicks.push(channel.sessions[id].nick);
		}
		response.simpleJSON(200, { nicks: nicks });
	} },
	{ path: "/join", handler: function(channel, request, response) {
		var nick = qs.parse(url.parse(request.url).query).nick;
		
		if (!nick) {
			response.simpleJSON(400, { error: "bad nick." });
			return;
		}
		var session = channel.createSession(nick);
		if (!session) {
			response.simpleJSON(400, { error: "nick in use." });
			return;
		}
		
		response.simpleJSON(200, { id: session.id, nick: nick, since: session.since });
	} },
	{ path: "/part", handler: function(channel, request, response) {
		var id = qs.parse(url.parse(request.url).query).id;
		
		var eventId = channel.destroySession(id);
		response.simpleJSON(200, { id: eventId });
	} },
	{ path: "/recv", handler: function(channel, request, response) {
		var query = qs.parse(url.parse(request.url).query),
			since = parseInt(query.since, 10),
			session = channel.sessions[query.id];
		
		if (!session) {
			response.simpleJSON(400, { error: "No such session id." });
			return;
		}
		
		if (isNaN(since)) {
			response.simpleJSON(400, { error: "Must supply since parameter." });
			return;
		}
		
		session.poke();
		channel.query(since, function(messages) {
			session.poke();
			response.simpleJSON(200, { messages: messages });
		});
	} },
	{ path: "/send", handler: function(channel, request, response) {
		var query = qs.parse(url.parse(request.url).query),
			text = query.text,
			session = channel.sessions[query.id];
		
		if (!session) {
			response.simpleJSON(400, { error: "No such session id." });
			return;
		}
		
		if (!text || !text.length) {
			response.simpleJSON(400, { error: "Must supply text parameter." });
			return;
		}
		
		session.poke();
		var id = channel.appendMessage(session.nick, "msg", text);
		response.simpleJSON(200, { id: id });
	} }
];



var slice = [].slice;
Function.prototype.partial = function() {
	var fn = this,
		args = slice.call(arguments);
	
	return function() {
		return fn.apply(this, args.concat(slice.call(arguments)));
	};
};

function extend(obj, props) {
	for (var prop in props) {
		obj[prop] = props[prop];
	}
}
