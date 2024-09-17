const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../config/roles_list");
const verifyJWT = require("../middleware/verifyJWT");
router.use(verifyJWT);
router
  .route("/")
  .get(verifyRoles(ROLES_LIST.Admin), usersController.getAllUsers)
  .post(verifyRoles(ROLES_LIST.Admin), usersController.createNewUser)
  .patch(verifyRoles(ROLES_LIST.Admin), usersController.updateUser)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);

module.exports = router;
