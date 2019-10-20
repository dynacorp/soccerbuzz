var compression = require("compression");
var express = require("express");
var cors = require("cors");
var bodyPaser = require("body-parser");
var app = express();
var port = process.env.PORT || 3000;

app.use(compression());
app.use(bodyPaser.json());
app.use(cors());
app.use(bodyPaser.urlencoded({ extended: false }));

var Users = require("./routes/Users");
var Comments = require("./routes/Comments");
var Feeds = require("./routes/Feeds");
var Likes = require("./routes/Likes");
var Followers = require("./routes/Followers");

app.use("/users", Users);
app.use("/Comments", Comments);
app.use("/Feeds", Feeds);
app.use("/Likes", Likes);
app.use("/Followers", Followers);

app.listen(port, function() {
  console.log("sever running on port " + port);
});
