const express = require("express");
const userController = require("../controller/user.controller");

const router = express.Router();

router.route("/").get(userController.getAllUser);

router.route("/:id").get(userController.getUser);
router.route("/update/:role").patch(userController.updateUserRole);

module.exports = router;
