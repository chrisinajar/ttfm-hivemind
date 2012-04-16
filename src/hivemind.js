/*
 *
 * TTfm Hivemind Server
 *
 */
var config = null,
	io = require('socket.io').listen(64277),
	sha1 = require('sha1'),
	flow = require('flow'),
	Bot = require('ttapi');

try {
	config = require("./config");
} catch (ex) {
	console.log('You need to create a config.js file to run this. Make your own bot.');
	throw ex;
}
config.configIO(io);

var generateKey = flow.define(
	function(callback) {
		var flow = this,
			lock = flow.MULTI(),
			str = "";
		for (var i = 0; i <= Math.random()*20; ++i) {
			var cb = flow.MULTI();
			setTimeout(function() {
				str = sha1(Math.random() + Math.random() + ""+str);
				cb(str);
			}, (Math.random()>0.5?0:1));
		}
		lock(callback);
	},function(ret) {
		var flow = this;
		if (ret[0]['0'] instanceof Function)
			ret[0]['0'](ret[1]['0']+ret[ret.length-1]['0']);
	}
);

var socketKeys = {};
var authTimers = {};
var rooms = {};
io.sockets.on('connection', function (socket) {
	var timerId = setTimeout(function(){
		socket.disconnect();
	}, 20000);
	socket.on('message', function(data) {
		if (data.to in socketKeys) {
			var target = socketKeys[data.to];
			socket.get('userid', function(err, userid) {
				if (err) {
					console.log('Error! ', err);
					target.emit('hivemind', {
						event: 'error',
						data: {
							err: err,
							type: 'Missing userid'
						}
					});
					return;
				}
				target.emit('hivemind', {
					event: 'message',
					data: {
						from: userid,
						msg: data.msg
					}
				});
			});
		}
	});
	socket.on('room', function(data) {
		
	});
	socket.on('handshake', function (data) {
		flow.exec(
			function() {
				if (!data.userid)
					socket.disconnect();
				generateKey(this.MULTI());

				socketKeys[data.userid] = socket;
				authTimers[data.userid] = timerId;
				socket.set('userid', data.userid, this.MULTI());

			}, function(ret) {
				console.log(ret);
				var key = ret[1	][0];
				
				socket.set('key', key, function(d) {
					console.log(d);
					socket.emit('handshake', {
						key: key,
						userid: config.userid
					});
				});
			}
		);
	});

	socket.on('disconnect', function (data) {
		socket.get('userid', function(err, userid) {
			if (userid in socketKeys)
				delete socketKeys[userid];
			if (userid in authTimers)
				delete authTimers[userid];
		});
	});
});

var bot = new Bot(config.auth, config.userid);
bot.on('ready', function (data) {
	console.log('Bot is ready');
	bot.roomRegister(config.roomid);
});

bot.on('pmmed', function (data) {
	console.log(data);
	var userid = data.senderid;
	if (userid in socketKeys && userid in authTimers && "text" in data && data.text.length > 2) {
	} else
		return console.log('Got pmmed by someone not trying to auth!');
	console.log('Authenticating: ' +userid);
	clearTimeout(authTimers[userid]);
	delete authTimers[userid];
	
	socketKeys[userid].get('key', function(err, key) {
		if (err || key !== data.text) {
			return socketKeys[userid].disconnect();
		}
		console.log('Authenticated client');
	});
});


