const ObjectId = require("mongoose").Types.ObjectId;
const db = require("./../models/index.model");
Bus = db.Bus;
Driver = db.Driver;
Company = db.Company;

exports.getAllCompanyDrivers = async (req, res) => {
    try {
        await Driver.find({})
            .populate(
                "company",
                "-__v -address -_id -updatedAt -drivers -users -buses -voyages"
            )
            .select("firstName lastName phoneNumber age licenseId -_id")
            .exec((err, drivers) => {
                if (err) {
                    return res.status(500).json({
                        status: "fail",
                        message: err,
                    });
                }
                res.status(200).json({
                    status: "success",
                    drivers: drivers,
                });
            });
    } catch (err) {
        return res.json({
            status: "fail",
            message: err,
        });
    }
};

exports.getDriversOfCompany = async (req, res) => {
    try {
        const companyName = req.params.companyName;
        await Company.findOne({ name: companyName })
            .populate("drivers", "-__v")
            .exec((err, company) => {
                if (err) {
                    return res.status(500).json({
                        status: "fail",
                        message: err,
                    });
                }
                if (!company) {
                    return res.status(404).json({
                        status: "fail",
                        message: `Company ${companyName} Not Found`,
                    });
                }
                const numberOfDrivers = company.drivers.length;
                if (numberOfDrivers === 0) {
                    return res.status(404).json({
                        status: "fail",
                        totalNumberOfDrivers: numberOfDrivers,
                        message: "No Bus Yet Registered",
                    });
                }
                res.status(200).json({
                    status: "success",
                    totalNumberOfDrivers: numberOfDrivers,
                    drivers: company.drivers,
                });
            });
    } catch (err) {
        return res.json({
            status: "fail",
            message: "Something Bad Happened",
        });
    }
};

exports.getCompanyDriver = async (req, res) => {
    const { companyName, driverName } = req.params;
    const nDriver = driverName.split(" ");
    const firstName = nDriver[0];
    const lastName = nDriver[1];
    try {
        await Driver.findOne({
            $and: [{ firstName: firstName }, { lastName: lastName }],
        }).exec((err, driver) => {
            if (err) {
                return res.status(500).json({
                    status: "fail",
                    message: err,
                });
            }
            if (!driver) {
                return res.status(404).json({
                    status: "fail",
                    message: `Driver ${firstName} ${lastName} is not found`,
                });
            }
            Company.findOne({ name: companyName })
                .populate("drivers", "-__v")
                .exec((err, company) => {
                    if (err) {
                        return res.status(500).json({
                            status: "fail",
                            message: err,
                        });
                    }
                    if (!company) {
                        return res.status(404).json({
                            status: "fail",
                            message: `Company ${companyName} Not Found`,
                        });
                    }
                    const fDriver = company.drivers.filter((driver) => {
                        const lDriver = `${driver.firstName} ${driver.lastName}`;
                        return lDriver === driverName;
                    });
                    if (fDriver.length > 0) {
                        return res.status(200).json({
                            status: "success",
                            message: fDriver[0],
                        });
                    } else if (fDriver.length === 0) {
                        return res.status(404).json({
                            status: "fail",
                            message: `Driver ${driverName} Not Found For Company`,
                        });
                    }
                });
        });
    } catch (err) {
        return res.json({
            status: "fail",
            message: "Something Bad Happened",
        });
    }
};

exports.createCompanyDriver = async (req, res) => {
    const companyId = req.params.companyId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const age = req.body.age;
    const phoneNumber = req.body.phoneNumber;
    const licenseId = req.body.licenseId;
    const newDriver = new Driver({
        firstName: firstName,
        lastName: lastName,
        age: age,
        phoneNumber: phoneNumber,
        licenseId: licenseId,
    });
    try {
        if (ObjectId.isValid(companyId)) {
            await Company.findOne({ _id: companyId }).exec((err, company) => {
                if (err) {
                    res.status(500).json({
                        status: "fail",
                        message: err,
                    });
                    return;
                }
                if (!company) {
                    return res.status(404).json({
                        status: "fail",
                        message: "Company Doesn't exist",
                    });
                }
                Driver.findOne({
                    $or: [
                        { phoneNumber: phoneNumber },
                        { licenseId: licenseId },
                    ],
                }).exec((err, driver) => {
                    if (err) {
                        return res.status(500).json({
                            status: "fail",
                            message: err,
                        });
                    }
                    if (driver) {
                        return res.json({
                            status: "fail",
                            message: "Oops! Driver is already existed",
                        });
                    } else {
                        company.drivers.push(newDriver);
                        newDriver.company = company;
                        newDriver.save((err, savedDriver) => {
                            if (err) {
                                return res.status(500).json({
                                    success: "fail",
                                    message: err,
                                });
                            }
                            savedDriver;
                            res.status(201).json({
                                success: "success",
                                message: "Driver Registered",
                            });
                        });
                        company.save((err, savedCompany) => {
                            if (err) {
                                return res.status(500).json({
                                    success: "fail",
                                    message: err,
                                });
                            }
                            savedCompany;
                        });
                    }
                    return company;
                });
            });
        } else {
            return res.status(500).json({
                status: "fail",
                message: "Please Provide Valid Company ID",
            });
        }
    } catch (err) {
        res.status(200).json({
            status: "success",
            message: "Everything is fine",
        });
    }
};

exports.updateCompanyDriver = async (req, res) => {
    try {
        const { companyName, driverId } = req.params;
        const updatedDriver = req.body;
        await Company.findOne({ name: companyName }).exec((err, company) => {
            if (err) {
                return status(500).json({
                    status: "fail",
                    message: err,
                });
            }
            if (!company) {
                return res.status(404).json({
                    status: "fail",
                    message: `Company ${companyName} Not Found`,
                });
            }
            if (ObjectId.isValid(driverId)) {
                Driver.findOne({ _id: driverId })
                    .populate("company")
                    .exec((err, driver) => {
                        if (err) {
                            return res.status(500).json({
                                status: "fail",
                                message: err,
                            });
                        }
                        if (!driver) {
                            return res.status(404).json({
                                status: "fail",
                                message: "Bus Not Found",
                            });
                        }
                        if (
                            driver.company.drivers.includes(driverId) &&
                            driver.company.name === companyName
                        ) {
                            driver.updateOne(updatedDriver, (err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        message: "Driver Already Existed",
                                    });
                                }
                                res.status(201).json({
                                    status: "success",
                                    message: "Successfully Updated Driver",
                                });
                            });
                        } else {
                            return res.status(404).json({
                                status: "fail",
                                message: "Company Has No Such Driver",
                            });
                        }
                    });
            } else {
                return res.status(401).json({
                    status: "fail",
                    message: "Invalid ID Provided",
                });
            }
        });
    } catch (err) {
        return res.json({
            status: "fail",
            message: "Something Bad Happened",
        });
    }
};

exports.deleteCompanyDriver = async (req, res) => {
    try {
        const { companyName, driverId } = req.params;
        if (ObjectId.isValid(companyName) && ObjectId.isValid(driverId)) {
            await Company.findOne({ _id: companyName }).exec((err, company) => {
                if (err) {
                    return res.status(500).json({
                        status: "fail",
                        message: err,
                    });
                }
                if (!company) {
                    return res.status(404).json({
                        status: "fail",
                        message: "Company Not Found",
                    });
                }
                Driver.findOne({ _id: driverId })
                    .populate(
                        "company",
                        "-__v -users -voyages -buses -address -createdAt -updatedAt"
                    )
                    .exec((err, driver) => {
                        if (err) {
                            return res.status(500).json({
                                status: "fail",
                                message: err,
                            });
                        }
                        if (!driver) {
                            return res.status(404).json({
                                status: "fail",
                                message: "Driver Not Found",
                            });
                        }
                        if (driver.company.drivers.includes(driverId)) {
                            const nDriverIds = driver.company.drivers.filter(
                                (driver) => {
                                    return !driver.equals(driverId);
                                }
                            );
                            driver.company.drivers = nDriverIds;
                            company.drivers = nDriverIds;
                            company.save((err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        message: err,
                                    });
                                }
                            });
                            driver.remove((err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        message: err,
                                    });
                                }
                                return res.status(200).json({
                                    status: "fail",
                                    message: "Driver Deleted Successfully",
                                });
                            });
                        }
                    });
            });
        } else {
            return res.status(401).json({
                status: "fail",
                message: "Invalid ID Provided",
            });
        }
    } catch (err) {
        return res.json({
            status: "fail",
            message: "Something Bad Happened",
        });
    }
};
