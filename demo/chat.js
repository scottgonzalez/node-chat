var chat = require('../lib/server'),
	router = require("../lib/router");

// create chat server and a single channel
var chatServer = chat.createServer();
chatServer.listen(8001);
chatServer.addChannel({ basePath: "/chat" });

// chat app
chatServer.passThru("/", router.staticHandler("index.html"));

// CSS
chatServer.passThru("/css/layout.css", router.staticHandler("css/layout.css"));
chatServer.passThru("/css/reset.css", router.staticHandler("css/reset.css"));

// Images
["background.png", "button.png", "footer.png", "glows.png", "header-bg.png",
	"inset-border-l.png", "inset-border.png", "metal.jpg", "node-chat.png",
	"send.png"].forEach(function(file) {
		chatServer.passThru("/images/" + file, router.staticHandler("images/" + file));
	});

// JS
chatServer.passThru("/jquery-1.4.2.js", router.staticHandler("jquery-1.4.2.js"));
chatServer.passThru("/nodechat.js", router.staticHandler("nodechat.js"));
chatServer.passThru("/client.js", router.staticHandler("client.js"));
