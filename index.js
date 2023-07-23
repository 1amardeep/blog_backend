const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const routes = require("./routes/routes");
const bodyParser = require("body-parser");
const path = require("path");
const PORT = process.env.PORT || 3000;
console.log(process.env.DATABASE_URL);
const mongoString = process.env.DATABASE_URL;

const app = express();
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

app.listen(PORT, () => {
  console.log(`Server Started at ${PORT}`);
});
