const slugify = require("slugify");
const validator = require("validator");
const checkEmptyFields = require("./../utils/checkEmptyFields");
const AppError = require("../utils/appError");

exports.checkEmptyValidation = (req, res, next) => {
    const userInputs = req.body;
    const outPutValidationObject = {
        name: "Company Name",
        phoneNumber: "Phone Number",
        email: "Email",
        description: "Description",
        domain: "Web Domain",
        foundedYear: "Founded Year",
        location: "Location",
        country: "Country",
        city: "City",
    };
    const message = checkEmptyFields(userInputs, outPutValidationObject);
    if (message) {
        return next(new AppError(message, 400));
    }
    next();
};

exports.addSlugToReqBody = (req, res, next) => {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, trim: true });
    req.body.slug = slug;
    next();
};

exports.isValidEmail = (req, res, next) => {
    const { email } = req.body;
    const isValidEmail = validator.isEmail(email);
    if (!isValidEmail) {
        return next(new AppError(`${email} is invalid`, 400));
    }
    next();
};

exports.isValidPhoneNumber = (req, res, next) => {
    const { phoneNumber } = req.body;
    const checkPhoneNumber = /^\d+$/.test(phoneNumber);

    // check the length here
    if (!checkPhoneNumber) {
        return next(new AppError(`${phoneNumber} is invalid`, 400));
    }
    next();
};

exports.isValidDomainName = (req, res, next) => {
    const { domain } = req.body;
    const isValidDomain = validator.isURL(domain, {
        protocols: ["http", "https"],
    });
    if (!isValidDomain) {
        return next(new AppError(`${domain} is invalid format`, 400));
    }
    next();
};

exports.isValidDate = (req, res, next) => {
    const { foundedYear } = req.body;
    const isValidDate = validator.isDate(foundedYear, { format: "DD/MM/YYYY" });
    if (!isValidDate) {
        return next(new AppError(`Enter valid web domain`, 400));
    }
    next();
};
