document.write('<script src="/socket.io/socket.io.js"></script>');
document.addEventListener("DOMContentLoaded", function(event) {
  var socket = io();
  socket.on('release', function(data){
    console.log('New release: ', data);
    window.chcp.fetchUpdate(data.config);
  });
});
