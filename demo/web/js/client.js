(function($) {

var title = document.title,
	colors  = ["green", "orange", "yellow", "red", "fuschia", "blue"],
	channel = nodeChat.connect("/chat"),
	log,
	message;

// TODO: handle connectionerror

$(function() {
	log = $("#chat-log");
	message = $("#message");
	
	// Add a button that can be easily styled
	$("<a></a>", {
		id: "submit",
		text: "Send",
		href: "#",
		click: function(event) {
			event.preventDefault();
			$(this).closest("form").submit();
		}
	})
	.appendTo("#entry fieldset");
	
	// Add a message indicator when a nickname is clicked
	$("#users").delegate("li", "click", function() {
		message
			.val($(this).text() + ": " + message.val())
			.focus();
	});
});

// new message posted to channel
// - add to the chat log
$(channel).bind("msg", function(event, message) {
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
	
	row.appendTo(log);
})
// another user joined the channel
// - add to the chat log
.bind("join", function(event, message) {
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
	
	row.appendTo(log);
})
// another user joined the channel
// - add to the user list
.bind("join", function(event, message) {
	var added = false,
		nick  = $("<li></li>", {
			"class": colors[0],
			text: message.nick
		});
	colors.push(colors.shift());
	$("#users > li").each(function() {
		if (message.nick == this.innerHTML) {
			added = true;
			return false;
		}
		if (message.nick < this.innerHTML) {
			added = true;
			nick.insertBefore(this);
			return false;
		}
	});
	if (!added) {
		$("#users").append(nick);
	}
})
// another user left the channel
// - add to the chat log
.bind("part", function(event, message) {
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
	
	row.appendTo(log);
})
// another user left the channel
// - remove from the user list
.bind("part", function(event, message) {
	$("#users > li").each(function() {
		if (this.innerHTML == message.nick) {
			$(this).remove();
			return false;
		}
	});
})

// Auto scroll list to bottom
.bind("join part msg", function() {
	// auto scroll if we're within 50 pixels of the bottom
	if (log.scrollTop() + 50 >= log[0].scrollHeight - log.height()) {
		window.setTimeout(function() {
			log.scrollTop(log[0].scrollHeight);
		}, 10);
	}
});

// handle login (choosing a nick)
$(function() {
	function loginError(error) {
		login
			.unbind("ajaxSuccess.login")
			.addClass("error")
			.find("label")
				.text(error + " Please choose another:")
			.end()
			.find("input")
				.focus();
	}
	
	var login = $("#login");
	login.submit(function() {
		var nick = $.trim($("#nick").val());
		
		if (!nick.length || /[^\w_\-^!]/.exec(nick)) {
			loginError("Invalid Nickname.");
			return false;
		}
		
		channel.join(nick, {
			success: function() {
				$("body")
					.removeClass("login")
					.addClass("channel");
				message.focus();
			},
			error: function() {
				loginError("Nickname in use.");
			}
		});
		
		return false;
	});
	login.find("input").focus();
});

// handle sending a message
$(function() {
	$("#channel form").submit(function() {
		channel.send(message.val());
		message.val("").focus();
		
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
			document.title = title;
		});
	
	$(channel).bind("msg", function(event, message) {
		if (!focused) {
			unread++;
			document.title = "(" + unread + ") " + title;
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
