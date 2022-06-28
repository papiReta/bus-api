const db = require("./../models/index.model");
const User = require("./../models/user.model");
const Role = require("./../models/role.model");
const AppError = require("./../utils/appError");

const checkDuplicateUsernameOrPhoneNumber = async (req, res, next) => {
    const message = " has already been taken. Try another one!";
    const phoneNumber = req.body.phoneNumber;
    const userName = req.body.userName;

    // Check if username already existed
    if (phoneNumber.length === 9) {
        phoneNumber = `0${phoneNumber}`;
    }
    const user = await User.findOne({
        $or: [{ userName }, { phoneNumber }],
    });

    if (user) {
        if (user.userName && user.userName === userName) {
            return next(new AppError(`${userName}${message}`, 400));
        }

        if (user.phoneNumber && user.phoneNumber === phoneNumber) {
            return next(new AppError(`${phoneNumber}${message}`, 400));
        }
    }
    next();
};

const checkRoleExisted = async (req, res, next) => {
    if (req.body.roles) {
        const existingRoles = await Role.find({
            name: { $in: req.body.roles },
        });
        if (existingRoles.length === 0) {
            return next(
                new AppError(`Role '${req.body.roles[0]}' Not Found`, 404)
            );
        }
    } else {
        const roles = ["passenger"];
        req.body.roles = roles;
    }
    next();
};

const verifySignup = {
    checkDuplicateUsernameOrPhoneNumber,
    checkRoleExisted,
};

module.exports = verifySignup;
