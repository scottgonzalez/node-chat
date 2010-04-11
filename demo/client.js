(function($) {

var colors  = ["green","orange","yellow","red","fuschia","blue"],
	channel = nodeChat.connect("/chat"),
	scroll  = true,
	log,
	message ;

// TODO: Turn off auto scrolling if user has scrolled up from the bottom

$(function(){
	log = $("#chat-log");
	message = $("#message");
	
	// Add a button that can be easily styled
	$("<a />", {id:"submit", text: "Send", href: "#", click: function(e){
		e.preventDefault();
		$(this).closest('form').submit();
	}}).appendTo("#entry fieldset");
	
	// Add a message indicator when a nickname is clicked
	$("#users").delegate("li", "click", function(){
		message.val( $(this).text() + ": " + message.val()).focus();
	})
});

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
	
	row.appendTo(log);
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
	
	row.appendTo(log);
})
// another user joined the channel
// - add to the user list
.bind("nodechat-join", function(event, message) {
	var added = false,
		nick  = $("<li />", {'class':colors[0], text: message.nick });
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
		
	row.appendTo(log);
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
})

// Auto scroll list to bottom
.bind("nodechat-join nodechat-part nodechat-msg", function(){
	window.setTimeout(function(){
		log.scrollTop(log[0].scrollHeight);
	}, 10);
});

// handle login (choosing a nick)
$(function() {
	var login = $("#login");
	login.submit(function() {
		$(this).one('ajaxSuccess.login', function(){
			login.unbind('ajaxError.login');
			$("body").removeClass("login").addClass("channel");
			$("#message").focus();
		}).one('ajaxError.login', function(){
			login.unbind('ajaxSuccess.login')
			.find('label').text("Nickname in use. Please choose another:").end()
			.addClass("error")
			.find('input').focus();
		});
		
		channel.join($("#nick").val());
		
		return false;
	});
	login.find('input').focus();
});

// handle sending a message
$(function() {
	var message = $("#message");
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
