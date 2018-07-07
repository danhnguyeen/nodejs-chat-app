const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const moment = require('moment');

const isRealString = require('../utils/validation');
const generateMessage = require('../utils/generateMessages');
const Users = require('../utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const app = express();
var users = new Users();
app.use(express.static(publicPath));
const server = http.createServer(app);
const io = socketIO(server);
io.on('connection', (socket) => {
  console.log('New user connected');
  // socket.emit('newMessage', {from: 'Admin', text: 'Welcome to chat app'});
  // socket.broadcast.emit('newMessage', {from: 'Admin', text: 'New user joined'});
  // socket.emit('newEmail', { title: 'Email 1' });
  // socket.on('disconnect', () => {
  //   /* send to all connected user except the current user */
  //   socket.broadcast.emit('newMessage', {from: 'Admin', text: 'The user left'});
  //   console.log('The user was disconnected');
  // });
  // socket.on('createEmail', (email) => {
  //   console.log('Create Email', email);
  // });
  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', {
        from: user.name,
        text: message.text,
        createdAt: moment.valueOf()
      });
    }
    // /* send to all connected user */
    // io.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: moment.valueOf()
    // });
    // socket.broadcast.emit('newMessage', {
    //   from: message.from,
    //   text: message.text,
    //   createdAt: new Date().getTime()
    // });
    callback();
  });
  socket.on('disconnect', () => { 
    /* send to all connected user except the current user */
    var user = users.removeUser(socket.id);    
    if(user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      socket.broadcast.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    }
    // socket.broadcast.emit('newMessage', {from: 'Admin', text: 'The user left'});
    console.log('The user was disconnected');
  });
  // socket.emit('newMessage', { from: 'Danh', text: 'Hello' });
  socket.on('join', (params, callback) => {
    if(!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required');
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat app'));
    socket.broadcast.to(params.room).emit('newMessage', {from: 'Admin', text: `${params.name} has joined`});
    // socket.on('disconnect', () => {
    //   socket.broadcast.to(params.room).emit('newMessage', {from: 'Admin', text: `${params.name} left`});
    //   console.log('The user was disconnected');
    // });
    callback();
  });
  
});
server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});