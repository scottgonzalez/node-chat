#!/usr/bin/env node
var fs = require("fs"),
    chat = require('../lib/server'),
    router = require("../lib/router");

// create chat server
var chatServer = chat.createServer();
chatServer.listen(8001, function() {
    console.log("Server is running on port 8001");
});

// create a channel and log all activity to stdout
chatServer.addChannel({
    basePath: "/chat"
}).addListener("msg", function(msg) {
    console.log("<" + msg.nick + "> " + msg.text);
}).addListener("join", function(msg) {
    console.log(msg.nick + " join");
}).addListener("part", function(msg) {
    console.log(msg.nick + " part");
});

// server static web files
function serveFiles(localDir, webDir) {
    fs.readdirSync(localDir).forEach(function(file) {
        var local = localDir + "/" + file,
            web = webDir + "/" + file;

        if (fs.statSync(local).isDirectory()) {
            serveFiles(local, web);
        } else {
            chatServer.passThru(web, router.staticHandler(local));
        }
    });
}
serveFiles(__dirname + "/web", "");
chatServer.passThru("/js/nodechat.js", router.staticHandler(__dirname + "/../web/nodechat.js"));
chatServer.passThru("/", router.staticHandler(__dirname + "/web/index.html"));
