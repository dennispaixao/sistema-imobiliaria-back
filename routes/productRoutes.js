const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const verifyJWT = require("../middleware/verifyJWT");
const ROLES_LIST = require("../config/roles_list");
const verifyRoles = require("../middleware/verifyRoles");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(verifyJWT, productsController.createNewProduct)
  .patch(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    productsController.updateProduct
  )
  .delete(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin),
    productsController.deleteProduct
  );

module.exports = router;
