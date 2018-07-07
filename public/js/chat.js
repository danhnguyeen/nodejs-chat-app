var socket = io();
socket.on('connect',  function() {
  var param = jQuery.deparam(window.location.search);
  socket.emit('join', param, function(err) {
    if(err) {
      alert(err);
      window.location.href = "/";
    } else {
      console.log('Success')
    }
  });
  console.log('connected to server');
});
function scrollToBottom() {
  var messages = jQuery('#messages');
  var newMessage = messages.children("li:last-child");

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}
socket.on('newMessage', function(message) {
  var template = jQuery("#message-template").html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  // li.text(`${message.from} ${moment(message.createdAt).format('h:mm a')}: ${message.text}`);
  jQuery("#messages").append(html);
  setTimeout(() => {
    scrollToBottom();
  });
});
socket.on('updateUserList', function(users) {
  console.log(users);
  var ol = jQuery("<ol></ol>");
  users.forEach(function(user) {
    ol.append(`<li>${user.name}</li>`)
  });
  jQuery("#users").html(ol);
});
// socket.emit('createMessage', { from: 'Mr A', text: 'Hi Danh' }, function() {
//   console.log('send message success');
// });

jQuery("#message-form").on('submit', function(e) {
  e.preventDefault();
  var text = jQuery("[name=message]").val();
  if(text) {
    socket.emit('createMessage', {
      text: text
    }, function() {
      console.log('got it');
      jQuery("[name=message]").val('');
    });
  }
});
// socket.emit('createEmail', { from: 'test', body: 'Hi Danh' });
// socket.on('disconnect', function() {
//   console.log('disconnected to the server')
// });
// socket.on('newEmail', function(data) {
//   console.log('New Email', data);
// });