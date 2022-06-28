const slugify = require("slugify");
const Bus = require("./../models/bus.model");
const User = require("./../models/user.model");
const Company = require("./../models/company.model");
const Driver = require("./../models/driver.model");
const Voyage = require("./../models/voyage.model");
const Role = require("./../models/role.model");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// done
exports.getCompanies = catchAsync(async (req, res, next) => {
    const count = await Company.countDocuments();
    const companies = await Company.find({});

    res.status(201).json({
        status: "success",
        companyCount: count,
        companies,
    });
});

// done
exports.getCompany = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const company = await Company.findOne({ slug });
    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }
    res.status(200).json({
        status: "success",
        company,
    });
});

// done
exports.createCompany = catchAsync(async (req, res, next) => {
    const userInput = { ...req.body };
    const { name, slug, email } = userInput;

    const company = await Company.findOne({ $or: [{ slug }, { email }] });
    if (company) {
        if (company.email === email) {
            return next(new AppError(`Email already taken`, 403));
        }
        return next(
            new AppError(`Company name ${company.name} already taken`, 403)
        );
    }
    const newCompany = new Company(userInput);
    await newCompany.save();

    res.status(201).json({
        status: "success",
        message: `Company ${name} successfully registered`,
    });
});

// done
exports.updateCompany = catchAsync(async (req, res, next) => {
    let updateInputs = { ...req.body };
    const { id } = req.params;
    const company = await Company.findOne({ _id: id });
    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }
    if (updateInputs.name) {
        const checkIfCompanyExists = await Company.findOne({
            name: updateInputs.name,
        });
        if (checkIfCompanyExists) {
            return next(
                new AppError(
                    `Name ${updateInputs.name} is taken. Try another one`,
                    403
                )
            );
        } else {
            const slug = slugify(updateInputs.name, {
                lower: true,
                trim: true,
            });
            updateInputs.slug = slug;
        }
    }

    await Company.updateOne({ _id: id }, updateInputs);

    res.status(200).json({
        status: "success",
        message: "Company updated successfully",
    });
});

// maintainance remains
exports.deleteCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        console.log(companyId);
        if (ObjectId.isValid(companyId)) {
            await Company.findOne({ _id: companyId }).exec(
                async (err, company) => {
                    if (err) {
                        return res.status(500).json({
                            status: "fail",
                            error: err,
                        });
                    }
                    if (!company) {
                        return res.status(404).json({
                            status: "fail",
                            message: "Company Not Found",
                        });
                    }
                    console.log(company._id);

                    company.remove((err) => {
                        if (err) {
                            return res.json({
                                err: err,
                            });
                        }

                        // DELETES BUS RELATED WITH COMPANY
                        Bus.deleteMany(
                            { _id: { $in: company.buses } },
                            (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        error: err,
                                    });
                                }
                            }
                        );

                        // DELETES VOYAGES RELATED WITH COMPANY
                        Voyage.deleteMany(
                            { _id: { $in: company.voyages } },
                            (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        error: err,
                                    });
                                }
                            }
                        );

                        // DELETES DRIVERS RELATED WITH COMPANY
                        Driver.deleteMany(
                            { _id: { $in: company.drivers } },
                            (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        error: err,
                                    });
                                }
                            }
                        );
                        return res.status(201).json({
                            status: "success",
                            message: "Company Deleted Successfully",
                        });
                    });
                }
            );
        } else {
            return res.json({
                success: "fail",
                message: "Invalid ID Provided",
            });
        }
    } catch (err) {
        res.status(404).json({
            message: err,
        });
    }
};

// Company User GETTERS AND SETTERS
exports.assignUserToCompany = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const { userName } = req.body;
    const user = await User.findOne({ userName });
    const company = await Company.findOne({ slug });
    const role = await Role.findOne({ name: "company" });

    if (!user) {
        return next(new AppError(`${userName} Not Found`, 404));
    }

    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }

    if (!role) {
        return next(new AppError("Role Not Found", 404));
    }

    if (!company.users.includes(user._id) && !user.isUserAssignedToCompany) {
        await Company.updateOne(
            { _id: company._id },
            { $push: { users: user._id } }
        );
        await User.updateOne(
            { _id: user._id },
            { isUserAssignedToCompany: true, $push: { roles: role._id } }
        );
        res.status(200).json({
            status: "success",
            message: `${user.userName} successfully assigned to ${company.name}`,
        });
    } else {
        return next(new AppError(`${user.userName} already assigned`, 403));
    }
});

exports.removeUserFromCompany = async (req, res, next) => {
    const { slug } = req.params;
    const { userName } = req.body;
    if (!userName) {
        return next(new AppError("Please provide user name", 400));
    }
    const company = await Company.findOne({ slug });
    const user = await User.findOne({ userName });
    const role = await Role.findOne({ name: "company" });

    if (!user) {
        return next(new AppError("User Not Found", 404));
    }

    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }

    if (!role) {
        return next(new AppError("Role Not Found", 404));
    }

    if (company.users.includes(user._id) && user.isUserAssignedToCompany) {
        console.log(user._id, user.isUserAssignedToCompany);
        await Company.updateOne(
            { _id: company._id },
            { $pull: { users: user._id } }
        );
        await User.updateOne(
            { _id: user._id },
            { $pull: { roles: role._id }, isUserAssignedToCompany: false },
            { multi: true }
        );
        res.status(200).json({
            status: "success",
            message: `${user.userName} successfully removed from ${company.name}`,
        });
    } else {
        return next(new AppError("User not assigned to company yet", 400));
    }
};
