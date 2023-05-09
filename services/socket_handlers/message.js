module.exports = {
  eventName: "message",
  handler: (socket) => {
    //console.log(socket);
    console.log(`Nova mensagem de ${socket.from}: ${socket.content}`);
  },
};
