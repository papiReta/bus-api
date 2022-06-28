const express = require("express");
const driverController = require("./../controller/driver.controller");
const router = express.Router();

router.route("/drivers").get(driverController.getAllCompanyDrivers);

router.route("/:companyName/drivers").get(driverController.getDriversOfCompany);
router
    .route("/:companyName/drivers/:driverName")
    .get(driverController.getCompanyDriver);

router.route("/:companyId/drivers").post(driverController.createCompanyDriver);
router
    .route("/:companyName/drivers/:driverId")
    .patch(driverController.updateCompanyDriver)
    .delete(driverController.deleteCompanyDriver);

module.exports = router;
