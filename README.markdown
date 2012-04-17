# Hivemind
Turntable.fm authenticated communication server

Hivemind is a node.js server that accepts web connections, sends them an unnecessarily randomized key, and then expected them to send that key to a bot sitting in a private room. If they do, then they can talk to other users by userid or broadcast to the room they're in.

### Why is this significant?

Because they need to private message the bot, the server can confirm that they are definitely logged in from that client. This means that this system can be trusted to ensure that any message sent can only possibly be received by the intended user(s).

Neat!

### So what is is actually going to do?
At the time of writing this, the only feature of many mod that uses this system is jarTT's ability to sync idle times with the room at join time. This is an extremely simple usage of this system, under the 20 lines of code mark, but prooves it's usefulness right away.

I will likely write a group chat very soon to further test the system.

For further reading, check out this blog post: chrisinajar.com/blog/2012/04/turntable-fm-hivemind/

-chrisinajar
