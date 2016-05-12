var fs = require('fs');
var https = require('https');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

var options = {
  key: fs.readFileSync('./certs/file.pem'),
  cert: fs.readFileSync('./certs/file.crt')
};
var serverPort = 3000;
var server = https.createServer(options, app);
var io = require('socket.io')(server);

app.use(bodyParser.json());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

// turn off unnecessary header
app.disable('x-powered-by');

// turn on strict routing
app.enable('strict routing');

// use the X-Forwarded-* headers
app.enable('trust proxy');

app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]GLOBAL VARIABLES                [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
var usersCon = 0;
var sessionObjs = [];

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]UTILITY FUNCTIONS               [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function createSessionId(){
  return Math.floor(Math.random()*99999) + 10000;
}

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]WEB SOCKETS                     [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
io.on('connection', function(socket){
  usersCon++;
  console.log('users connected:', usersCon);

  socket.on('disconnect', function(){
    usersCon--;
    console.log('users connected:', usersCon);
  });

  socket.on('play', function(){
    io.emit('play');
  });

  socket.on('start sync', function(data){
    console.log('sessionId before resend:', data.sessionId);
    if(data.sessionId != null){
      socket.leave(data.sessionId);
    }
    var sessionToSend = {videoTime: data.videoTime, sessionId: createSessionId()};
    sessionObjs.push(sessionToSend);

    console.log(sessionToSend);

    socket.join(sessionToSend.sessionId);
    socket.emit('session id', sessionToSend);

    //to find current rooms
    // console.log('socket rooms:', socket.rooms);
  });

  socket.on('join sync', function(sessionId){
    var result = sessionObjs.filter(function(obj) {
      return obj.sessionId == sessionId;
    });
    if(result.length == 1){
      socket.join(sessionId);
      socket.emit('init information', result[0]);
    }else{
      socket.emit('sync error');
    }
  });

  socket.on('synced', function(sessionId){
    io.sockets.in(sessionId).emit('synced');
  });

  socket.on('play yt', function(sessionObj){
    io.sockets.in(sessionObj.sessionId).emit('play yt', sessionObj);
  });

  socket.on('pause yt', function(sessionObj){
    io.sockets.in(sessionObj.sessionId).emit('pause yt', sessionObj);
  });

});

server.listen(serverPort, function(){
  console.log('Server is running at port:', serverPort);
});
