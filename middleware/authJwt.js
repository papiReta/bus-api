const jwt = require("jsonwebtoken");
const User = require("./../models/user.model");
const Role = require("./../models/role.model");
const Company = require("./../models/company.model");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const verifyToken = catchAsync(async (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return next(new AppError("No Token Provided", 400));
    }
    await jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return next(new AppError("Unauthorized", 401));
        }
        const user = await User.findOne({ _id: decoded.id });
        if (!user) {
            return next(new AppError("User Not Found", 404));
        }

        req.userId = decoded.id;
        next();
    });
});

const isCompany = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.userId });
    if (!user.roles || typeof user.roles === undefined || user.roles === null) {
        return next(new AppError("Role Not Found", 404));
    }

    await Role.find(
        {
            _id: { $in: user.roles },
        },
        (err, roles) => {
            if (err) {
                res.status(500).send({
                    message: err,
                });
                return;
            }

            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "company") {
                    next();
                    return;
                }
            }
            return next(new AppError("Unauthorized", 401));
        }
    );
});

const isPlatformAdmin = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ _id: req.userId });

    await Role.find(
        {
            _id: { $in: user.roles },
        },
        (err, roles) => {
            if (err) {
                res.status(500).send({
                    message: err,
                });
                return;
            }

            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "super-admin") {
                    next();
                    return;
                }
            }
            return next(new AppError("Unauthorized", 401));
        }
    );
});

const isUserOfCompany = catchAsync(async (req, res, next) => {
    const cId = req.params.name;
    const token = req.headers["x-access-token"];
    if (!token) {
        return next(new AppError("No Token Provided", 400));
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decode.id;
    const company = await Company.findOne({ _id: cId });
    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }

    if (!company) {
        res.status(500).send({
            message: "Company Not Found",
        });
        return;
    }
    const users = await User.find({
        _id: { $in: company.users },
    });

    if (!users.length) {
        return next(new AppError("User Not Found For Company", 404));
    }
    for (let i = 0; i < users.length; i++) {
        if (users[i].equals(userId)) {
            next();
            return;
        }
    }
    return next(new AppError("Unauthorized", 401));
});

const authJwt = {
    verifyToken,
    isCompany,
    isPlatformAdmin,
    isUserOfCompany,
};

module.exports = authJwt;
