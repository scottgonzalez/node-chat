NodeChat
========

NodeChat is a simple, scalable web-based chat server built on [Node.js](http://nodejs.org).


Server
------

Creating a chat server is super simple.

	// create a server at http://localhost:8001
	var chat = require("lib/server");
	var chatServer = chat.createServer();
	chatServer.listen(8001);

Once you've created a server, you can add channels.

	// create a channel at http://localhost:8001/chat
	var channel = chatServer.addChannel({ basePath: "/chat" });

Channels have three options:

* `basePath` (required) - the URL to use for the channel
* `messageBacklog` (default 200) - how many message to keep in memory
* `sessionTimeout` (default 60) - how many seconds to wait before killing inactive sessions


Client
------

NodeChat comes with a client library built on [jQuery](http://jquery.com) to make it easy to connect to a NodeChat server.

	// connect to a channel
	var channel = nodeChat.connect("http://localhost:8001/chat");

	// join the channel
	channel.join("my-nick");

	// send a message to the channel
	channel.send("hello");

	// leave the channel
	channel.part();


Events
------

The server and client both emit events on the channel objects.

* `join` - emitted when someone joins the channel.
* `msg` - emitted when someone sends a message to the channel.
* `part` - emitted when someone leaves the channel.

Each event receives an object with the following properties:

* `id` - unique id for the event (unique per channel).
* `nick` - the nick of the user who performed the action.
* `type` - the type of action (will be same as the event type).
* `text` - text associated with the action.
* `timestamp` - when the action occurred.

In addition, the client emits a `connectionerror` event if the connection to the server is lost.


Installation & Demo
-------------------

To install:

	git clone http://github.com/scottgonzalez/node-chat.git

To run the demo:

	./node-chat/demo/chat.js
Then open `http://localhost:8001` in a browser.


License
-------

Copyright 2013 Scott González. Released under the terms of the MIT license.
