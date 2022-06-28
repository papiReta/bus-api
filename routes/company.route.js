const express = require("express");
const companyController = require("./../controller/company.controller");
const { authJwt } = require("./../middleware/index");
const companyInputValidation = require("./../middleware/companyInputValidation");

const router = express.Router();

router
    .route("/")
    .get(
        // [authJwt.verifyToken, authJwt.isPlatformAdmin],
        companyController.getCompanies
    )
    .post(
        [
            companyInputValidation.checkEmptyValidation,
            companyInputValidation.addSlugToReqBody,
            companyInputValidation.isValidPhoneNumber,
            companyInputValidation.isValidEmail,
            companyInputValidation.isValidDate,
            companyInputValidation.isValidDomainName,
        ],
        // [authJwt.verifyToken, authJwt.isPlatformAdmin],

        companyController.createCompany
    );
// global route
router.route("/:slug").get(companyController.getCompany);

router
    .route("/:id")
    .patch(
        // [authJwt.verifyToken, authJwt.isPlatformAdmin],
        companyController.updateCompany
    )
    .delete(
        [authJwt.verifyToken, authJwt.isPlatformAdmin],
        companyController.deleteCompany
    );

router.route("/:slug/users").delete(
    // [authJwt.verifyToken, authJwt.isUserOfCompany, authJwt.isCompany],
    companyController.removeUserFromCompany
);

router.route("/:slug/users/").patch(
    // [authJwt.verifyToken, authJwt.isPlatformAdmin],
    companyController.assignUserToCompany
);

module.exports = router;
