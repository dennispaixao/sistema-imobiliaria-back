const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router
  .route("/")
  .get(categoriesController.getAllCategories)
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    categoriesController.createNewCategorie
  )
  .patch(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    categoriesController.updateCategorie
  )
  .delete(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    categoriesController.deleteCategorie
  );

module.exports = router;
