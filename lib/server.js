var router = require("./router"),
	sys = require("sys"),
	url = require("url"),
	qs = require("querystring"),
	Channel = require("./channel").Channel;

// TODO: message backlog limit
// TODO: session timeouts
// TODO: named channels
var servers = [];

function Server() {
	var httpServer = router.createServer();
	handlers.forEach(function(handler) {
		httpServer.get(handler.path, handler.handler);
	});
	
	this.httpServer = httpServer;
	
	// TODO: don't auto-add a channel
	this.channels = [];
	this.addChannel();
}

process.mixin(Server.prototype, {
	listen: function(port, host) {
		this.httpServer.listen(port, host);
	},
	
	addChannel: function() {
		this.channels.push(new Channel());
	},
	
	flushCallbacks: function() {
		this.channels.forEach(function(channel) {
			channel.flushCallbacks();
		});
	},
	
	expireOldSessions: function() {
		this.channels.forEach(function(channel) {
			channel.expireOldSessions();
		});
	}
});

exports.createServer = function() {
	var server = new Server();
	servers.push(server);
	
	return server;
};



var handlers = [
	{ path: "/who", handler: function(request, response) {
		var nicks = [];
		var sessions = servers[0].channels[0].sessions;
		for (var id in sessions) {
			nicks.push(sessions[id].nick);
		}
		response.simpleJSON(200, { nicks: nicks });
	} },
	{ path: "/join", handler: function(request, response) {
		var nick = qs.parse(url.parse(request.url).query).nick;
		var channel = servers[0].channels[0];
		if (!nick) {
			response.simpleJSON(400, { error: "bad nick." });
			return;
		}
		var session = channel.createSession(nick);
		if (!session) {
			response.simpleJSON(400, { error: "nick in use." });
			return;
		}
		
		channel.appendMessage(nick, "join");
		response.simpleJSON(200, { id: session.id, nick: nick });
	} },
	{ path: "/part", handler: function(request, response) {
		var id = qs.parse(url.parse(request.url).query).id;
		var channel = servers[0].channels[0];
		// TODO: can we remove the check and just always call destroySession()?
		if (id && channel.sessions[id]) {
			channel.destroySession(id);
		}
		response.simpleJSON(200, {});
	} },
	{ path: "/recv", handler: function(request, response) {
		var query = qs.parse(url.parse(request.url).query),
			since = query.since,
			id = query.id,
			session;
		var channel = servers[0].channels[0];
		if (!since) {
			response.simpleJSON(400, { error: "Must supply since parameter." });
			return;
		}
	
		since = parseInt(since, 10);
		session = channel.sessions[id];
		if (session) session.poke();
		channel.query(since, function(messages) {
			if (session) session.poke();
			response.simpleJSON(200, { messages: messages });
		});
	} },
	{ path: "/send", handler: function(request, response) {
		var query = qs.parse(url.parse(request.url).query),
			id = query.id,
			text = query.text;
		
		var channel = servers[0].channels[0];
		var session = channel.sessions[id];
		if (!session || !text) {
			response.simpleJSON(400, { error: "No such session id." });
			return;
		}
		
		session.poke();
		
		channel.appendMessage(session.nick, "msg", text);
		response.simpleJSON(200, {});
	} }
];



function flushCallbacks() {
	servers.forEach(function(server) {
		server.flushCallbacks();
	});
	setTimeout(flushCallbacks, 1000);
}
// TODO: don't flush unless we have at least one server with one channel
flushCallbacks();

function expireOldSessions() {
	servers.forEach(function(server) {
		server.expireOldSessions();
	});
	setTimeout(expireOldSessions, 1000);
}
// TODO: don't expire unless we have at least one server with one channel
expireOldSessions();
