const express = require("express");
const controller = require("./../controller/auth.controller");
const { verifySignup } = require("./../middleware/index");
const inputValidation = require("./../middleware/inputValidation");
const verifySignIn = require("./../middleware/verifySignIn");

const router = express.Router();

router
    .route("/signup")
    .post(
        [
            inputValidation.checkEmptyFields,
            inputValidation.nameValidation,
            inputValidation.passwordValidation,
            inputValidation.phoneNumberAndCountryCode,
            verifySignup.checkDuplicateUsernameOrPhoneNumber,
            verifySignup.checkRoleExisted,
        ],
        controller.signup
    );

router.route("/verify/:phoneNumber").post(controller.verify);

router
    .route("/signin")
    .post(
        [
            inputValidation.checkIfPhoneNumberFieldIsEmpty,
            inputValidation.phoneNumberAndCountryCode,
            verifySignIn.checkIfAccountIsVerified,
        ],
        controller.signin
    );

module.exports = router;
