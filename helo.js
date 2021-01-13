const express = require("express");
const app = express();

const path = require("path");
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  res.render("room");
});

app.post("/", (req, res) => {
  res.redirect(`/${req.body.room}/${req.body.user}/${uuidv4()}`);
});

app.get("/:roomName/:user/:roomid", (req, res) => {
  res.render("home", { roomName: req.params.roomName, user: req.params.user, roomID: req.params.roomid });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomID, userId) => {
    socket.join(roomID);
    socket.to(roomID).broadcast.emit("user-joined", userId);
    socket.on("message", (message) => {
      io.to(roomID).emit("createMessage", message);
    });

    console.log("Welcome to the room!", userId);
  });
});

app.listen("4000", () => {
  console.log("server runnining on Port 4000");
});
