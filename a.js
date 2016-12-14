var N = require('./nuve');
N.API.init("584ec844f325f80c52ad35a1", "198510", "http://localhost:3000/");
var roomName = 'mera';
 
N.API.createRoom(roomName, function(room) {
  console.log('Room created with id: ', room._id);
}, console.log(room._id));
