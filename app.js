var express = require("express");
var path = require("path");
var app = express();

var PORT = process.env["PORT"] || 9090;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/ping", function (req, res) {
  // console.log("Ping Back");
  // res.status( !Math.floor(Math.random() * 10) ? 400 : 200 ).send("Success");
  res.status(200).send("Success");
});

app.listen(PORT);
console.log("Listening on localhost port " + PORT);
