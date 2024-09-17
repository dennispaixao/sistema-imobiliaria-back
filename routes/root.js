const express = require("express");
const router = express.Router();
const path = require("path");
const bcrypt = require("bcrypt");
router.get("^/$|/index(.html)?", async (req, res) => {
  const hash = await bcrypt.hash("123", 10);
  console.log(hash);
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
