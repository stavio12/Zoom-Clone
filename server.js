const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

dotenv.config(__dirname, "config.env");

app.use(express.static(__dirname));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.render("room");
});

app.post("/", (req, res) => {
  res.redirect(`/${uuidv4()}/${req.body.room}`);
});

app.get("/:roomid/:room/", (req, res) => {
  res.render("home", { room: req.params.room, roomID: req.params.roomid });
});

io.on("connection", (socket) => {
  let connectedUsers = 0;
  //count counted user after every 1min
  setInterval(function () {
    connectedUsers = socket.conn.server.clientsCount;
  }, 10000);

  socket.on("join-room", (roomID, userId) => {
    socket.join(roomID);
    socket.to(roomID).broadcast.emit("user-joined", userId);

    socket.on("user", (username) => {
      socket.on("message", (message) => {
        io.to(roomID).emit("createMessage", message, username, connectedUsers);
      });
    });
  });
});

server.listen(process.env.PORT || 4000);
