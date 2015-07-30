document.write('<script src="/socket.io/socket.io.js"></script>');
document.addEventListener("DOMContentLoaded", function(event) {
  var socket = io();
  socket.on('release', function(data){
    console.log('New release: ', data);
    window.chcp.fetchUpdate(data.config, function(err, resp) {
      if(err) {
        return console.error('An error occured with chcp.fetchUpdate: ', err);
      }
      console.log('fetchUpdate successful: ', resp);
      window.chcp.installUpdate(function(err){
        if(err) {
          return console.error('An error occured with chcp.installUpdate: ', err);
        }
      });
    });
  });
});
