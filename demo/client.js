(function($) {

var channel = nodeChat.connect("/chat");

// new message posted to channel
// - add to the chat log
$(channel).bind("nodechat-msg", function(event, message) {
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-msg");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-text")
		.text(message.text)
		.appendTo(row);
	
	row.appendTo("#chat-log");
})
// another user joined the channel
// - add to the chat log
.bind("nodechat-join", function(event, message) {
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-msg chat-system-msg");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-text")
		.text("joined the room")
		.appendTo(row);
	
	row.appendTo("#chat-log");
})
// another user joined the channel
// - add to the user list
.bind("nodechat-join", function(event, message) {
	var added = false;
	$("#users > li").each(function() {
		if (message.nick == this.innerHTML) {
			added = true;
			return false;
		}
		if (message.nick < this.innerHTML) {
			added = true;
			$("<li>" + message.nick + "</li>").insertBefore(this);
			return false;
		}
	});
	if (!added) {
		$("#users").append("<li>" + message.nick + "</li>");
	}
})
// another user left the channel
// - add to the chat log
.bind("nodechat-part", function(event, message) {
	var time = formatTime(message.timestamp),
		row = $("<div></div>")
			.addClass("chat-msg chat-system-msg");
	
	$("<span></span>")
		.addClass("chat-time")
		.text(time)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-nick")
		.text(message.nick)
		.appendTo(row);
	
	$("<span></span>")
		.addClass("chat-text")
		.text("left the room")
		.appendTo(row);
})
// another user left the channel
// - remove from the user list
.bind("nodechat-part", function(event, message) {
	$("#users > li").each(function() {
		if (this.innerHTML == message.nick) {
			$(this).remove();
			return false;
		}
	});
});

// handle login (choosing a nick)
$(function() {
	var login = $("#login").submit(function() {
		channel.join($("#nick").val());
		
		// TODO: handle unsuccessful login
		$("body").removeClass("login").addClass("channel");
		return false;
	});
});

// handle sending a message
$(function() {
	var message = $("#message");
	$("#channel form").submit(function() {
		channel.send(message.val());
		message.val("");
		
		return false;
	});
});

// update the page title to show if there are unread messages
$(function() {
	var focused = true,
		unread = 0;
	
	$(window)
		.blur(function() {
			focused = false;
		})
		.focus(function() {
			focused = true;
			document.title = "node chat";
		});
	
	$(channel).bind("nodechat-msg", function(event, message) {
		if (!focused) {
			unread++;
			document.title = "(" + unread + ") node chat";
		}
	});
});

// notify the chat server that we're leaving if we close the window
$(window).unload(function() {
	channel.part();
});

function formatTime(timestamp) {
	var date = new Date(timestamp),
		hours = date.getHours(),
		minutes = date.getMinutes(),
		ampm = "AM";
	
	if (hours > 12) {
		hours -= 12;
		ampm = "PM";
	}
	
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	
	return hours + ":" + minutes + " " + ampm;
}

})(jQuery);
