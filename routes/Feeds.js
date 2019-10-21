const express = require("express");
const feed = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

const Users = require("../models/User");
const Feeds = require("../models/Feed");
const Likes = require("../models/Like");
const Comments = require("../models/Comment");
feed.use(cors());

process.env.SECRET_KEY = "ayomide's secret";

//GET ALL FEEDS
feed.get("/get", (req, res) => {
  Feeds.hasMany(Likes, { foreignKey: "feed_id" });
  Feeds.hasMany(Comments, { foreignKey: "feed_id" });
  Likes.belongsTo(Feeds, { foreignKey: "id" });
  Comments.belongsTo(Feeds, { foreignKey: "id" });
  Feeds.findAll({
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("comment")), "commentCount"],
        [Sequelize.fn("COUNT", Sequelize.col("likes.id")), "likeCount"]
      ]
    },
    include: [
      {
        model: Likes,
        attributes: []
      },
      {
        model: Comments,
        attributes: []
      }
    ],
    distinct: true
  })
    .then(feeds => {
      res.json({ data: feeds });
    })
    .catch(error => {
      res.status(400).json({ error: error });
    });
});

//GET FEEDS BY ID
feed.get("/get/:id", (req, res) => {
  Feeds.hasMany(Likes, { foreignKey: "feed_id" });
  Feeds.hasMany(Comments, { foreignKey: "feed_id" });
  Likes.belongsTo(Feeds, { foreignKey: "id" });
  Comments.belongsTo(Feeds, { foreignKey: "id" });
  Feeds.findOne({
    where: {
      id: req.params.id
    },
    attributes: {
      include: [
        [Sequelize.fn("COUNT", Sequelize.col("comment")), "commentCount"],
        [Sequelize.fn("COUNT", Sequelize.col("likes.id")), "likeCount"]
      ]
    },
    include: [
      {
        model: Likes,
        attributes: []
      },
      {
        model: Comments,
        attributes: []
      }
    ],
    distinct: true
  })
    .then(feeds => {
      res.json({ data: feeds });
    })
    .catch(error => {
      res.status(400).json({ error: error });
    });
});

//POST FEED
feed.post("/add", (req, res) => {
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
            ...req.body
          };
          Feeds.create(data)
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

module.exports = feed;
