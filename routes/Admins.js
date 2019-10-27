const express = require("express");
const admins = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");

const Admin = require("../models/Admin");

admins.use(cors());
process.env.SECRET_KEY = "ayomide's secret";

// REGISTER
admins.post("/register", (req, res) => {
  const today = new Date();
  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    username: req.body.username,
    created_at: today,
    image: req.body.image
  };

  Admin.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        const hash = bcrypt.hashSync(userData.password, 10);
        userData.password = hash;
        Admin.create(userData)
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

// ADMIN LOGIN
admins.post("/login", (req, res) => {
  Admin.findOne({
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

// ALL ADMINS
admins.get("/get", (req, res) => {
  Admin.findAndCountAll({
    attributes: {
      exclude: ["password"]
    }
  })
    .then(admins => {
      res.json({ data: admins });
    })
    .catch(err => {
      res.json({ error: err });
    });
});

// PROFILE
admins.get("/profile", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      Admin.findOne({
        where: {
          id: decoded.id
        },
        attributes: {
          exclude: ["password"]
        }
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

// UPDATE PROFILE
admins.put("/update/profile", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      Admin.update(req.body, {
        where: {
          id: decoded.id
        }
      })
        .then(user => {
          res.json({ successful: "update successful ", data: req.body });
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

// UPDATE PROFILE PASSWORD
admins.put("/update/profile/password", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY,
    function(error, decoded) {
      if (error) {
        return res
          .status(401)
          .json({ error: true, message: "Unauthorized access." });
      }
      Admin.findOne({
        where: {
          id: decoded.id
        }
      }).then(user => {
        if (bcrypt.compareSync(req.body.currentPassword, user.password)) {
          const userData = {
            password: req.body.newpassword
          };
          const hash = bcrypt.hashSync(userData.password, 10);
          userData.password = hash;
          Admin.update(userData, {
            where: {
              id: decoded.id
            }
          })
            .then(user => {
              res.json({ result: "update successful " });
            })
            .catch(err => {
              res.status(403).json({
                error: true,
                message: err
              });
            });
        } else {
          res.status(400).json({
            error: true,
            message: "oops! seems like you sent the wrong stuff"
          });
        }
      });
    }
  );
});

module.exports = admins;
