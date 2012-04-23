# Hivemind
Turntable.fm authenticated communication server

Hivemind is a node.js server that accepts web connections, sends them an unnecessarily randomized key, and then expected them to send that key to a bot sitting in a private room. If they do, then they can talk to other users by userid or broadcast to the room they're in.

### Why is this significant?

Because they need to private message the bot, the server can confirm that they are definitely logged in from that client. This means that this system can be trusted to ensure that any message sent can only possibly be received by the intended user(s).

Neat!

### So what is is actually going to do?
At the time of writing this, the only feature of many mod that uses this system is jarTT's ability to sync idle times with the room at join time. This is an extremely simple usage of this system, under the 20 lines of code mark, but prooves it's usefulness right away.

I will likely write a group chat very soon to further test the system.

### I'm a developer and want to use hivemind
Awesome! Run this to load hivemind:
```javascript
$.getScript('https://raw.github.com/chrisinajar/ttfm-hivemind/master/client.js');
```


Sending a message:

```javascript
// send a message!
hivemind.send(userid, 'Hey');
// send some json!
hivemind.send(userid, {key: 'value'});

// You can also send stuff to the whole room as a broadcast
hivemind.sendRoom({key: 'value'});
```


Listening for a message:

```javascript
// listen for a message
hivemind.on('message', function(data) {
  console.log('Got a message from ' + data.from + ' that says: ', data.msg);
});

// listen for a message that was broadcasted
hivemind.on('room', function(data) {
  hivemind.send(data.from, 'Stop it.'); // Don't do this!
});
```


Errors:

```javascript
// errors be here
hivemind.on('error', function(err) {
  console.log('Oh nooooooo!', err);
});
```

For further reading, check out this blog post: http://chrisinajar.com/blog/2012/04/turntable-fm-hivemind/

-chrisinajar
