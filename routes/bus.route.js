const express = require("express");
const { authJwt } = require("./../middleware/index");
const busController = require("./../controller/bus.controller");
const busInputValidation = require("./../middleware/busInputValidation");

const router = express.Router();

router.route("/").get(busController.getAllBuses);
router.route("/:id").get(busController.getSingleBus);

router
    .route("/:slug/buses")
    .get(
        // [authJwt.verifyToken, authJwt.isUserOfCompany, authJwt.isCompany],
        busController.getCompanyBuses
    )
    .post(
        [busInputValidation.checkEmptyValidation],
        // [authJwt.verifyToken, authJwt.isUserOfCompany, authJwt.isCompany],
        busController.createCompanyBus
    );
router
    .route("/:slug/buses/:id")
    .get(
        // [authJwt.verifyToken, authJwt.isUserOfCompany, authJwt.isCompany],
        busController.getCompanyBus
    )
    .delete(
        // [authJwt.verifyToken, authJwt.isUserOfCompany, authJwt.isCompany],
        busController.deleteCompanyBus
    )
    .patch(
        // [authJwt.verifyToken, authJwt.isUserOfCompany, authJwt.isCompany],
        busController.updateCompanyBus
    );

module.exports = router;
