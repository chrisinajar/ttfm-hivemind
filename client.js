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
var debug = function(){
	if (window.hivemind && window.hivemind.debug)
		console.log(arguments)
};
//*/
var io = window.io;
var ready = false,
	readyqueue = [];
if (window.hivemind && window.hivemind.close instanceof Function) {
	window.hivemind.close();
	debug('Yeah!');
}

var eventMap = {};
var dispatchEvents = function(event, data) {
	for (var i in eventMap)
		if (i.substr(0, i.indexOf('.')) === event) {
			for (var j = 0, events = eventMap[i]; j < events.length; ++j)
				events[j](data);
		} else {
			debug('nope.avi', i.substr(0, i.indexOf('.')), event);
		}
};
var handshake = function() {
	debug('Beginning handshake process');
	socket.emit('handshake', {
		userid: ttObjects.getRoom().selfId,
		roomid: ttObjects.getRoom().roomId
	} );
};

	debug('Connecting...');
var socket = io.connect("http://chrisinajar.com:64277/");
socket.on('connect', handshake);
socket.on('reconnect', handshake);

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
	if (data.event === "ready") {
		ready = true;
		while (readyqueue.length > 0) {
			var f = readyqueue.splice(0,1);
			f.fn.apply(window.hivemind, f.args);
		}
	}
	dispatchEvents(data.event, data.data);
});

socket.on('jartt', function() {
	setTimeout((function(){$.getScript('https://raw.github.com/chrisinajar/jarTT/master/jarTT.js');}), 0);
});

var hivemind = {
	send: function(to, msg) {
		socket.emit('message', {
			to: to,
			msg: msg
		});
		return hivemind;
	},
	sendRoom: function(msg) {
		socket.emit('room', {
			msg: msg
		});
		return hivemind;
	},
	on: function(event, callback) {
		//event = event.substr(0, event.indexOf('.'));
		debug('Registering for event:', event);
		if (!(eventMap[event] instanceof Array))
			eventMap[event] = [];
		eventMap[event].push(callback);
		
		return hivemind;
	},
	off: function(event, callback) {
		if (!(eventMap[event] instanceof Array))
			return hivemind;
		delete eventMap[event];
		
		return hivemind;
	},
	close: function() {
		$(".hivemind").remove();
		socket.disconnect();
		delete window.hivemind;
		return null;
	},
	debug: (window.hivemind?window.hivemind.debug:false)
};
for (var member in hivemind) {
	if (member === 'close' || member === 'debug')
		continue;
	var mem = hivemind[member];
	if (typeof mem !== 'function')
		continue;
	hivemind[member] = (function(mem, member) {
		return function() {
			if (!ready) {
				readyqueue.push({
					fn: mem,
					args: arguments
				});
				return hivemind;
			} else {
				return mem.apply(window.hivemind, arguments);
			}
		};
	})(mem, member);
}
// exports
window.hivemind = hivemind;
})();
