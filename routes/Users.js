const express = require("express");
const users = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");

const User = require("../models/User");
const Feeds = require("../models/Feed");
const Comments = require("../models/Comment");
const Followers = require("../models/Follower");
const MulterUpload = require("../database/upload.config");

users.use(cors());
process.env.SECRET_KEY = "ayomide's secret";

// REGISTER
users.post("/register", (req, res) => {
  const today = new Date();
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    username: req.body.username,
    created_at: today,
    image: req.body.image,
    league: req.body.league,
    club: req.body.club
  };

  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        const hash = bcrypt.hashSync(userData.password, 10);
        userData.password = hash;
        User.create(userData)
          .then(user => {
            let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
              expiresIn: 1440
            });
            res.json({ token: token });
          })
          .catch(err => {
            res.json({ error: "error: " + err });
          });
      } else {
        res.status(400).json({ error: "user already exists" });
      }
    })
    .catch(err => {
      res.json({ error: "error: " + err });
    });
});

// LOGIN
users.post("/login", (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        res.status(400).json({ error: "user does not exist" });
      } else {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
            expiresIn: 1440
          });
          res.json({ token: token });
        } else {
          res.status(400).json({ error: "Invalid credentials" });
        }
      }
    })
    .catch(err => {
      res.json({ error: "error: " + err });
    });
});

// PROFILE
users.get("/profile", (req, res) => {
  User.hasMany(Feeds, { foreignKey: "user_id" });
  User.hasMany(Comments, { foreignKey: "feed_id" });
  User.hasMany(Followers, { foreignKey: "user_id" });
  Feeds.belongsTo(User, { foreignKey: "id" });
  Comments.belongsTo(User, { foreignKey: "id" });
  Followers.belongsTo(User, { foreignKey: "id" });
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      User.findOne({
        where: {
          id: decoded.id
        },

        attributes: {
          include: [
            [Sequelize.fn("COUNT", Sequelize.col("feeds.id")), "feedCount"],
            [Sequelize.fn("COUNT", Sequelize.col("comment")), "commentCount"],
            [
              Sequelize.fn("COUNT", Sequelize.col("followers.followed_id")),
              "followerCount"
            ],
            [
              Sequelize.fn("COUNT", Sequelize.col("followers.user_id")),
              "followingCount"
            ]
          ],
          exclude: ["password"]
        },

        include: [
          {
            model: Feeds,
            attributes: []
          },
          {
            model: Comments,
            attributes: []
          },
          {
            model: Followers,
            attributes: [],
            where: {
              followed_id: decoded.id
            }
          }
        ],
        distinct: true
      })
        .then(user => {
          if (user) {
            res.json(user);
          } else {
            res.status(400).json({ error: "user does not exist" });
          }
        })
        .catch(err => {
          //   res.json({ error: "error: " + err });
          res.status(403).send({
            error: true,
            message: err
          });
        });
    }
  );
});

// ALL USERS
users.get("/allusers", (req, res) => {
  User.hasMany(Feeds, { foreignKey: "user_id" });
  User.hasMany(Comments, { foreignKey: "feed_id" });
  User.hasMany(Followers, { foreignKey: "user_id" });
  Feeds.belongsTo(User, { foreignKey: "id" });
  Comments.belongsTo(User, { foreignKey: "id" });
  Followers.belongsTo(User, { foreignKey: "id" });
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      User.findAll({
        attributes: {
          include: [
            [
              Sequelize.fn(
                "COUNT",
                Sequelize.fn("DISTINCT", Sequelize.col("comment"))
              ),
              "commentCount"
            ],
            [
              Sequelize.fn(
                "COUNT",
                Sequelize.fn("DISTINCT", Sequelize.col("feeds.id"))
              ),
              "feedCount"
            ],
            [
              Sequelize.fn(
                "COUNT",
                Sequelize.fn("DISTINCT", Sequelize.col("followed_id"))
              ),
              "followerCount"
            ]
          ],
          exclude: ["password"]
        },
        include: [
          {
            model: Feeds,
            attributes: [],
            required: false
          },
          {
            model: Comments,
            attributes: [],
            required: false
          },
          {
            model: Followers,
            attributes: [],
            required: false
          }
        ],
        group: ["id"]
      })
        .then(users => {
          res.json({ data: users });
        })
        .catch(error => {
          res.status(400).json({ error: error });
        });
    }
  );
});

module.exports = users;
