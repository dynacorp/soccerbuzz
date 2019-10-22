const express = require("express");
const like = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Likes = require("../models/Like");
like.use(cors());

process.env.SECRET_KEY = "ayomide's secret";

//GET ALL LIKES FOR A FEED
like.get("/get/:id", (req, res) => {
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

//LIKE / UNLIKE FEED
like.post("/:id", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      Likes.findOne({
        where: {
          user_id: decoded.id,
          feed_id: req.params.id
        }
      })
        .then(data => {
          if (data.lenght !== 0) {
            Likes.destroy({
              where: {
                user_id: decoded.id,
                feed_id: req.params.id
              }
            })
              .then(data => {
                res.send({ data: "successful" });
              })
              .catch(error => {
                res.status(400).json({ error: error });
              });
          } else {
            const body = {
              user_id: decoded.id,
              feed_id: req.params.id
            };
            Likes.create(body)
              .then(data => {
                res.send({ data: "successful" });
              })
              .catch(error => {
                res.status(400).json({ error: error });
              });
          }
        })
        .catch(error => {
          res.status(400).json({ error: error });
        });
    }
  );
});

module.exports = like;
