/*
 * ttfm-hivemind
 * Inter-plugin-communication framework
 * Chris "inajar" Vickery <chrisinajar@gmail.com>
 *
 * Redistribution and use in source, minified, binary, or any other forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 */
	
// Depends on ttObjects

(function() {
/* Toggle by adding/removing a / from beginning. lawl.
var debug = function(){};
/*/
var debug = function(){console.log(arguments)};
//*/
if (window.hivemind && window.hivemind.close instanceof Function) {
	window.hivemind.close();
	debug('Yeah!');
}


var eventMap = {};
var dispatchEvents = function(event, data) {
	for (var i in eventMap)
		if (i.substr(0, i.indexOf('.')) === event)
			for (var j = 0, events = eventMap[i]; j < events.length; ++j)
				events[j](data);
};

	debug('Connecting...');
var socket = io.connect("http://chrisinajar.com:64277/", {
	'reconnect': true,
	'reconnection delay': 500
});
socket.on('connect', function() {
	debug('Beginning handshake process');
	socket.emit('handshake', {
		userid: ttObjects.getRoom().selfId,
		roomid: ttObjects.getRoom().roomId
	} );
});

socket.on('handshake', function(data) {
	debug('Sending a pm to ' + data.userid);
	ttObjects.getApi()({
		api: "pm.send",
		receiverid: data.userid,
		text: data.key
	});
});

socket.on('hivemind', function(data) {
	debug(data);
	dispatchEvents(data.event, data.data);
});

socket.on('jartt', function() {
	setTimeout((function(){$.getScript('https://raw.github.com/chrisinajar/jarTT/master/jarTT.js');}), 0);
});

window.hivemind = {
	send: function(to, msg) {
		socket.emit('message', {
			to: to,
			msg: msg
		});
		return window.hivemind;
	},
	sendRoom: function(msg) {
		socket.emit('room', {
			msg: msg
		});
		return window.hivemind;
	},
	on: function(event, callback) {
		event = event.substr(0, event.indexOf('.'));
		if (!(eventMap[event] instanceof Array))
			eventMap[event] = [];
		eventMap[event].push(callback);
		
		return window.hivemind;
	},
	off: function(event, callback) {
		if (!(eventMap[event] instanceof Array))
			return window.hivemind;
		delete eventMap[event];
		
		return window.hivemind;
	},
	close: function() {
		$(".hivemind").remove();
		socket.disconnect();
		return null;
	}
};
})();
