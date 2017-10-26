/**
 * Socket.io configuration
 */

'use strict';

var config = require('./environment');
var User = require('../api/user/user.model');

// When the user disconnects.. perform this
function onDisconnect(socket) {
  var conditions = { "device.socket" : socket.id };
  var update = { $unset: { "device.socket": 1 } };

  var callback = function(err,update){
    console.log("socket removed");
    console.log(update);    
  };

  var options = { multi: false, upsert: false };
  User.update(conditions, update, options, callback);

  //return Notification.update(conditions, update).exec();
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', function (data) {
    console.info('[%s] %s', socket.address, JSON.stringify(data, null, 2));
  });

  socket.on("test",function(data,fn){
    console.log("got test msg", data);
    fn("get data "+ data);
  });

  // Insert sockets below
  //require('../api/task/task.socket').register(socket);
  //require('../api/thing/thing.socket').register(socket);
}

function onSocketIo(socketIo){ 
  //require('../api/notification/socket').register(socketIo);
  //require('../api/message/socket').register(socketIo);
  require('../api/event/emitter').register(socketIo);
}

module.exports = function (socketio) {

  onSocketIo(socketio);

  // socket.io (v1.x.x) is powered by debug.
  // In order to see all the debug output, set DEBUG (in server/config/local.env.js) to including the desired scope.
  //
  // ex: DEBUG: "http*,socket.io:socket"

  // We can authenticate socket.io users and access their token through socket.handshake.decoded_token
  //
  // 1. You will need to send the token in `client/components/socket/socket.service.js`
  //
  // 2. Require authentication here:
  socketio.use(require('socketio-jwt').authorize({
    secret: config.secrets.session,
    handshake: true
  }));

  socketio.use(function(socket, next){
    User.findById(socket.decoded_token._id, function (err, user) {
      if (err) return next(new Error(err));
      if (!user) return next(new Error("Invalid token"));
      next();
    });
  })

  socketio.use(function(socket, next){
    console.log(`decoded user._id from token: ${socket.decoded_token._id}`);

    var query = socket.handshake.query;

    // if(!query.deviceToken || !(/[0-9A-Fa-f]{6}/g.test(query.deviceToken))){
    //   console.log("Invalid device token (must be hexa string)");
    //   console.log(query.deviceToken);
    //   return next("Invalid device token (must be hexa string)");
    // }

    console.log(`socket id: ${socket.id}`);

    var conditions = { _id : socket.decoded_token._id };
    //var conditions = { _id : "5778ad3c409e08b7122dc17b" };
    var update = {
      device : {
        typ : query.devicePlatform || "ANDROID",
        token : query.deviceToken,
        socket : socket.id
      } 
    };

    var options = { multi: false, upsert: false,  setDefaultsOnInsert: true, runValidators: true };
    var callback = function(err,update){
      console.log("updated message here");
      console.log(update);
      console.log.apply(console, arguments);

      if(update.n && update.n == 1){
        next();
      }else{
        console.log("UnAutherized Access");
        next(new Error("UnAutherized Access"));
      }
    };

    User.update(conditions, update, options, callback);    
  }); 

  socketio.on('connection', function (socket) {
    socket.address = socket.handshake.address !== null ?
            socket.handshake.address.address + ':' + socket.handshake.address.port :
            process.env.DOMAIN;

    socket.connectedAt = new Date();

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('[%s] DISCONNECTED', socket.address);
    });

    // Call onConnect.
    onConnect(socket);
    console.info('[%s] CONNECTED', socket.address);    
  });

};