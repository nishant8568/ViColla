/**
 * Created by nishant on 11/29/2015.
 */
var express = require('express');
var app = express();

var port = process.env.PORT || 9000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./server/config/database.js');
var server = require('http').createServer(app);
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./server/config/passport')(passport); // pass passport for configuration

// set up our express application
//app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser({limit: '50mb'})); // get information from html forms
app.use(session({secret: process.env.SESSION_SECRET || '1234567890'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(express.static(__dirname + "/client"));
app.use(express.static('data/img'));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// routes ======================================================================
var apiRouter = express.Router();
require('./server/routes')(apiRouter, passport); // load our routes and pass in our app and fully configured passport
app.use('/api', apiRouter);

//start server
server.listen(port, '0.0.0.0', function () {
    console.log(server.address());
    var io = require('socket.io').listen(server);
    var users = {};
    var room;
    io.sockets.on('connection', function (socket) {

        function log() {
            var array = [">>>>>>>>>> "];
            for (var i = 0; i < arguments.length; i++) {
                array.push(arguments[i]);
            }
            socket.emit('log', array);
        }

        socket.on('message', function (message) {
            log('Got message: ', message);
            log('from : ', socket.username);
            console.log('Got message: ', message);
            console.log("from : " + socket.username);
            socket.broadcast.emit('message', message); // should be room only
        });

        socket.on('create or join', function (userinfo) {

            var userdetail = JSON.parse(userinfo);
            room = userdetail.room;
            var username = userdetail.username;
            var numClients = io.sockets.clients(room).length;

            log('Room ' + room + ' has ' + numClients + ' client(s)');
            log('Request to create or join room', room);

            if (numClients == 0) {
                socket.emit('join', "no users");
            }
            else {
                io.sockets.in(room).emit('join', username);
            }

            socket.join(room);

            joined = {userinfo: username, room: room};

            socket.emit('joined', joined);

        });
        //broadcast to all users in room userslist
        socket.on('users', function (usernames) {
            io.sockets.in(room).emit('onlineusers', usernames);
        });

        socket.on('calling', function (caller) {
            var calldetails = JSON.parse(caller);
            console.log(calldetails);
            console.log(calldetails.callername + "calling....... : " + calldetails.receivername +
                " : in chat room : " + calldetails.roomname);
            io.sockets.in(calldetails.roomname).emit('called', caller);
        });
        socket.on('callending', function (callended) {
            var callend = JSON.parse(callended);
            io.sockets.in(callend.roomname).emit('callended', callended);
        });
        socket.on('userlogout', function (userdetails) {
            var userinfo = JSON.parse(userdetails);
            io.sockets.in(userinfo.roomname).emit('userout', userdetails);
        });

        socket.on('logoutme', function (userdetails) {
            var userinfo = JSON.parse(userdetails);
            console.log("user disconnected " + userinfo.roomname);
            socket.leave(userinfo.roomname);
            delete users[userinfo.username];
            io.sockets.emit('all users', Object.keys(users));

        });

        socket.on('collaborating', function (caller) {
            var calldetails = JSON.parse(caller);
            console.log("user initiating collaboration : ", calldetails);
            io.sockets.in(calldetails.roomname).emit('collaborate', caller);
        });

        socket.on('stopCollaborating', function (caller) {
            var calldetails = JSON.parse(caller);
            console.log("user stopping collaboration : ", calldetails);
            io.sockets.in(calldetails.roomname).emit('stopCollaboration', caller);
        });

        socket.on("callDetails", function(callDetails){
            io.sockets.in(room).emit("callDetails", callDetails);
        });

        socket.on("toState", function(stateChangeDetails){
            io.sockets.in(room).emit("toState", stateChangeDetails);
        });


        socket.on('userLogin', function (username) {
            if (!(username in users)) {
                users[username] = socket;
                socket.username = username;
            }
            io.sockets.emit('all users', Object.keys(users));
        });


        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);

        socket.on('disconnect', function (data) {
            console.log('disconnected', socket.username);
            if (socket.username == undefined) return;
            delete users[socket.username];
            io.sockets.emit('all users', Object.keys(users));
        });

        //});
    });
});

console.log('Server running on port ' + port);