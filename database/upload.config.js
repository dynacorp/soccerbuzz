const multer = require("multer");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "resources/static/assets/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
    // cb(null, file.originalname);
  }
});
var maxSize = 2 * 1024 * 1024;

var multerupload = multer({ storage: storage }).single("uploadfile");

module.exports = multerupload;
