var chat = require('../lib/server'),
	router = require("../lib/router");

var chatServer = chat.createServer();
chatServer.listen(8001);
chatServer.addChannel({ basePath: "/chat" });
chatServer.passThru("/", router.staticHandler("index.html"));
chatServer.passThru("/style.css", router.staticHandler("style.css"));
chatServer.passThru("/jquery-1.4.2.js", router.staticHandler("jquery-1.4.2.js"));
chatServer.passThru("/nodechat.js", router.staticHandler("nodechat.js"));
chatServer.passThru("/client.js", router.staticHandler("client.js"));
