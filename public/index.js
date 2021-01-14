const socket = io("/");
const myVideo = document.createElement("video"),
  videoGrid = document.getElementById("video-grid"),
  Messageinput = document.getElementById("chat_message"),
  MessageList = document.querySelector(".messages"),
  chatWindow = document.querySelector(".main__chat_window"),
  chatUserWindow = document.querySelector(".main__user_name"),
  chatUser = document.querySelector("#chat_user"),
  chatContainer = document.querySelector(".main__chat_container");

//Getting user name from input
Messageinput.disabled = true;

let userName;

chatUser.addEventListener("keyup", (event, e) => {
  if (event.key == "Enter") {
    if (chatUser.value.length !== 0) {
      userName = chatUser.value;
      socket.emit("user", userName);

      Messageinput.disabled = false;
      chatUserWindow.style.display = "none";

      chatUser.value = "";
    }
  }
});

//Getting user input messages
Messageinput.addEventListener("keyup", (event, e) => {
  if (event.key == "Enter") {
    if (Messageinput.value.length !== 0) {
      socket.emit("message", Messageinput.value);
      Messageinput.value = "";
    }
  }
});

// Getting user messages from socket IO
socket.on("createMessage", (message, username, connectedUsers) => {
  //count counted user after every 1min
  document.querySelector(".badge").innerHTML = connectedUsers;

  var node = document.createElement("li");

  node.innerHTML = `<b>${username}</b><br/>${message}`;
  MessageList.appendChild(node);
});

// mute video so it doesnt play back to login user
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let videoStream;

// allowing access to users media
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    videoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    }),
      (err) => {
        console.log(err);
      };

    socket.on("user-joined", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

//Emitting the socket io
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  //call user and send them ur stream
  const call = peer.call(userId, stream);

  //call their video stream
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

// opening access to streaming of video
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  // putting the video into html
  videoGrid.append(video);
};

// Automatically scroll to the top
const scrollToBottom = () => {
  chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
};

//Muting and unmuting audio

const muteUnmute = () => {
  const enabled = videoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    videoStream.getAudioTracks()[0].enabled = false;
    setUnmutedButton();
  } else {
    setMutedButton();
    videoStream.getAudioTracks()[0].enabled = true;
  }
};

//Muting and unmuting audio
const setUnmutedButton = () => {
  const html = `
  <i class=" fas fa-microphone"></i>
  <span>Mute</span>`;

  document.querySelector("#main__mute_button").innerHTML = html;
};

const setMutedButton = () => {
  const html = `
<i class="unmute fas fa-microphone-slash"></i>
<span>Unmute</span>`;

  document.querySelector("#main__mute_button").innerHTML = html;
};

//Playing and Stoping video

const playStop = () => {
  const enabled = videoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    videoStream.getVideoTracks()[0].enabled = false;
    setStopButton();
  } else {
    setPlayButton();
    videoStream.getVideoTracks()[0].enabled = true;
  }
};

//Muting and unmuting //Playing and Stoping video
const setPlayButton = () => {
  const html = `
  <i class=" fas fa-video"></i>
  <span>Stop Video</span>`;

  document.querySelector("#main__video_button").innerHTML = html;
};

const setStopButton = () => {
  const html = `
<i class="unmute fas fa-video-slash"></i>
<span>Play Video</span>`;

  document.querySelector("#main__video_button").innerHTML = html;
};
