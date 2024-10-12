const express = require("express");
const router = express.Router();
const {
  upload,
  uploadImages,
  deleteImages,
} = require("../controllers/imagesController");

router
  .route("/")
  .post(upload.array("images", 10), uploadImages)
  .delete(deleteImages);
module.exports = router;
