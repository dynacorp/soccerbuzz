const express = require("express");
const comment = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");

const Users = require("../models/User");
const Comments = require("../models/Comment");
comment.use(cors());

process.env.SECRET_KEY = "ayomide's secret";

//GET ALL COMMENTS FOR A FEED
comment.get("/:id", (req, res) => {
  Comments.findAll({
    where: {
      feed_id: req.params.id
    }
  })
    .then(comments => {
      res.json({ data: comments });
    })
    .catch(error => {
      res.status(400).json({ error: error });
    });
});

//ADD COMMENT
comment.post("/add/:id", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      Users.find({
        where: {
          id: decoded.id
        }
      })
        .then(result => {
          const data = {
            user_id: decoded.id,
            feed_id: req.params.id,
            ...req.body
          };
          Comments.create(data)
            .then(data => {
              res.json({ data: data });
            })
            .catch(error => {
              res.status(400).send({
                error: true,
                message: error
              });
            });
        })
        .catch(error => {
          res.status(401).send({
            error: true,
            message: error
          });
        });
    }
  );
});

module.exports = comment;
