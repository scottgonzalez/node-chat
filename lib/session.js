function Session(nick) {
	if (nick.length > 50) {
		return;
	}
	if (/[^\w_\-^!]/.exec(nick)) {
		return;
	}
	
	this.nick = nick;
	this.id = Math.floor(Math.random() * 1e10).toString();
	this.timestamp = new Date();
}

Session.prototype.poke = function() {
	this.timestamp = new Date();
};

exports.Session = Session;
