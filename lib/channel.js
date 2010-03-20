var sys = require("sys");
var Session = require("./session").Session;

function Channel() {
	this.messages = [];
	this.callbacks = [];
	this.sessions = {};
}

process.mixin(Channel.prototype, {
	appendMessage: function(nick, type, text) {
		var message = {
			nick: nick,
			type: type,
			text: text,
			timestamp: (new Date()).getTime()
		};
		this.messages.push(message);
		
		switch (type) {
			case "msg":
				sys.puts("<" + nick + "> " + text);
				break;
			case "join":
				sys.puts(nick + " join");
				break;
			case "part":
				sys.puts(nick + " part");
				break;
		}
		
		while (this.callbacks.length > 0) {
			this.callbacks.shift().callback([message]);
		}
	},
	
	query: function(since, callback) {
		// TODO: just use .slice()
		var matching = [];
		for (var i = 0; i < this.messages.length; i++) {
			var message = this.messages[i];
			if (message.timestamp > since) {
				matching.push(message);
			}
		}
		
		if (matching.length) {
			callback(matching);
		} else {
			this.callbacks.push({
				timestamp: new Date(),
				callback: callback
			});
		}
	},
	
	flushCallbacks: function() {
		var now = new Date();
		while (this.callbacks.length && now - this.callbacks[0].timestamp > 30*1000) {
			this.callbacks.shift().callback([]);
		}
	},
	
	createSession: function(nick) {
		var session = new Session(nick);
		if (!session) {
			return;
		}
		
		nick = nick.toLowerCase();
		for (var i in this.sessions) {
			if (this.sessions[i].nick.toLowerCase() === nick) {
				return;
			}
		}
		
		this.sessions[session.id] = session;
		return session;
	},
	
	destroySession: function(id) {
		this.appendMessage(this.sessions[id].nick, "part");
		delete this.sessions[id];
	},
	
	expireOldSessions: function() {
		var now = new Date();
		for (var session in this.sessions) {
			if (now - this.sessions[session].timestamp > 30 * 1000) {
				this.destroySession(session);
			}
		}
	}
});

exports.Channel = Channel;