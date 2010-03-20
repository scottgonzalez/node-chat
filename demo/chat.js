var chat = require('../lib/server'),
	router = require("../lib/router");

var chatServer = chat.createServer();
chatServer.listen(8001);
httpServer = chatServer.httpServer;
httpServer.get("/", router.staticHandler("index.html"));
httpServer.get("/style.css", router.staticHandler("style.css"));
httpServer.get("/client.js", router.staticHandler("client.js"));
httpServer.get("/jquery-1.2.6.min.js", router.staticHandler("jquery-1.2.6.min.js"));
