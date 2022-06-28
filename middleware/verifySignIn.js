// check if account is verified
const User = require("./../models/user.model");
const AppError = require("./../utils/appError");

const checkIfAccountIsVerified = catchAsync(async (req, res, next) => {
    const { code, phoneNumber, password } = req.body;

    const user = await User.findOne({ $and: [{ code }, { phoneNumber }] });
    if (!user.isAccountVerified) {
        return next(
            new AppError(
                `${user.firstName} ${user.lastName} your account has not been verified. Verify your account first`,
                401
            )
        );
    }
    next();
});

const verifySignIn = { checkIfAccountIsVerified };

module.exports = verifySignIn;
