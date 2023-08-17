const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const path = require("path");
const PORT = process.env.PORT || 3000;
const mongoString = process.env.DATABASE_URL;
const MessageModel = require("./model/message");

const socketIo = require("socket.io");
const http = require("http");

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

app.use(bodyParser.json());
app.use(cors());
app.use("/", express.static(path.join(__dirname, "angular")));

app.use("/api", routes);
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "angular", "index.html"));
});

mongoose.connect(mongoString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Join room
  socket.on("join", (room) => {
    socket.join(room);
  });

  // Handle chat messages
  socket.on("chat message", async (data) => {
    try {
      const { username, message, room } = data;
      const newMessage = new MessageModel({ username, message, room });
      await newMessage.save();

      io.to(room).emit("chat message", { username, message });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
