const express = require("express");
const follower = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Followers = require("../models/Follower");
follower.use(cors());

process.env.SECRET_KEY = "ayomide's secret";

//GET ALL FOLLOWERS
follower.get("/get/:id", (req, res) => {
  Followers.findAndCountAll({
    where: {
      followed_id: req.params.id
    }
  })
    .then(follower => {
      res.json({ data: follower });
    })
    .catch(error => {
      res.status(400).json({ error: error });
    });
});

//FOLLOW
follower.post("/:id", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      Followers.findOne({
        where: {
          user_id: decoded.id,
          follower_id: req.params.id
        }
      })
        .then(data => {
          if (data.lenght !== 0) {
            Followers.destroy({
              where: {
                user_id: decoded.id,
                follower_id: req.params.id
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
              follower_id: req.params.id
            };
            Followers.create(body)
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

module.exports = follower;
