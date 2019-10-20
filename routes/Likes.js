const express = require("express");
const like = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Likes = require("../models/Like");
like.use(cors());

process.env.SECRET_KEY = "ayomide's secret";

//GET ALL LIKES FOR A FEED
like.get("/likes/:id", (req, res) => {
  Likes.findAndCountAll({
    where: {
      feed_id: req.params.id
    }
  })
    .then(likes => {
      res.json({ data: likes });
    })
    .catch(error => {
      res.status(400).json({ error: error });
    });
});

module.exports = like;
