var express = require("express");
var path = require("path");
var app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/ping", function (req, res) {
  // console.log("Ping Back");
  // res.status( !Math.floor(Math.random() * 10) ? 400 : 200 ).send("Success");
  res.status(200).send("Success");
});

app.listen(process.env["PORT"] || 9090);
console.log("Listening");
