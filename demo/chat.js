var chat = require('../lib/server'),
	router = require("../lib/router");

// create chat server and a single channel
var chatServer = chat.createServer();
chatServer.listen(8001);
chatServer.addChannel({ basePath: "/chat" });

// chat app
chatServer.passThru("/", router.staticHandler("web/index.html"));

// CSS
chatServer.passThru("/css/layout.css", router.staticHandler("web/css/layout.css"));
chatServer.passThru("/css/reset.css", router.staticHandler("web/css/reset.css"));

// Images
["background.png", "button.png", "footer.png", "glows.png", "header-bg.png",
	"inset-border-l.png", "inset-border.png", "metal.jpg", "node-chat.png",
	"send.png"].forEach(function(file) {
		chatServer.passThru("/images/" + file, router.staticHandler("web/images/" + file));
	});

// JS
chatServer.passThru("/js/jquery-1.4.2.js", router.staticHandler("web/js/jquery-1.4.2.js"));
chatServer.passThru("/js/nodechat.js", router.staticHandler("web/js/nodechat.js"));
chatServer.passThru("/js/client.js", router.staticHandler("web/js/client.js"));
