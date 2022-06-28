const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;

const jwt = require("jsonwebtoken");
const User = require("./../models/user.model");
const Role = require("./../models/role.model");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const client = require("twilio")(accountSid, authToken);

exports.signup = catchAsync(async (req, res, next) => {
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const code = req.body.code;
    let phoneNumber = req.body.phoneNumber.trim();
    const password = req.body.password;
    const userName = req.body.userName;

    if (phoneNumber.length === 9) {
        phoneNumber = `0${phoneNumber}`;
    }
    const newUser = new User({
        firstName,
        lastName,
        code,
        phoneNumber,
        password,
        userName,
    });

    const user = await User.findOne({
        $and: [{ code }, { phoneNumber }, { isAccountVerified: true }],
    });

    if (user) {
        return next(new AppError("User has already existed", 400));
    }
    const roles = await Role.find({ name: { $in: req.body.roles } });
    newUser.roles = roles.map((role) => role._id);

    await newUser.save((err, user) => {
        if (err) {
            return res.status(500).json({
                message: err,
            });
        }

        const slicedPhoneNumber = user.phoneNumber.slice(1);
        const newPhoneNumber = `${code}${slicedPhoneNumber}`;

        client.verify
            .services(serviceId)
            .verifications.create({ to: newPhoneNumber, channel: "sms" })
            .then((verifications) => {
                res.status(200).json({
                    status: "success",
                    message: `When have sent 6-digit verfication number to ${verifications.to}. Status is ${verifications.status}. If it's you, verify. Else just ignore it`,
                });
            });
    });
});

exports.verify = async (req, res, next) => {
    const { verificationCode } = req.body;
    let { phoneNumber } = req.params;

    const splitedCountryCode = phoneNumber.slice(0, 4);
    const splitedPhoneNumber = `${0}` + phoneNumber.slice(4, 13);

    const user = await User.findOne({
        $and: [
            { phoneNumber: splitedPhoneNumber },
            { code: splitedCountryCode },
        ],
    });
    if (!user) {
        return next(new AppError("User Not Found", 404));
    }
    if (user.isAccountVerified) {
        // return next(
        //     new AppError("You have already verified your phone number", 400)
        // );
        return res.status(200).json({
            status: "success",
            message: "You have already verified your phone number",
        });
    }
    client.verify
        .services(serviceId)
        .verificationChecks.create({
            to: phoneNumber,
            code: verificationCode,
        })
        .then(async (verification_checks) => {
            await User.updateOne({ isAccountVerified: true });
            res.status(200).json({
                status: "success",
                message: `You have successfully verified you phone number`,
            });
        });
};

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_EXPIRES_IN}`,
    });
};

exports.signin = catchAsync(async (req, res, next) => {
    const { code, phoneNumber, password } = req.body;

    const user = await User.findOne({
        $and: [{ phoneNumber }, { code }],
    }).select("+password");

    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError("Incorrect phone number or password", 404));
    }

    if (!user.isAccountVerified) {
        return next(
            new AppError(
                "You have registerd but your account has not been verified yet.",
                403
            )
        );
    }
    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        message: "You have succesfully logged in",
        token,
    });
});
