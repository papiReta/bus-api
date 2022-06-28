const checkEmptyFields = require("./../utils/checkEmptyFields");
const AppError = require("./../utils/appError");

exports.checkEmptyValidation = (req, res, next) => {
    const userInputs = { ...req.body };
    const outPutValidationObject = {
        busPlateNumber: "Plate Number",
        busSideNumber: "Side Number",
        passengerCapacity: "Passenger Capacity",
    };

    const message = checkEmptyFields(userInputs, outPutValidationObject);
    if (message) {
        return next(new AppError(message, 400));
    }
    next();
};
