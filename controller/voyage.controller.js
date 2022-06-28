const ObjectId = require("mongoose").Types.ObjectId;
const db = require("./../models/index.model");
const Voyage = db.Voyage;
const Company = db.Company;
const validateDate = require("./../utils/validateDate");
const generateUniqueId = require("./../utils/generateUniqueId");

exports.getEveryVoyage = async (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Voyage works fine",
    });
};

exports.getAllVoyage = async (req, res) => {
    try {
        const voyages = await Voyage.find();
        res.status(200).send({
            status: "success",
            voyages,
        });
    } catch (err) {
        res.send(404).json({
            status: "fail",
            message: err,
        });
    }
};

exports.getVoyage = async (req, res) => {
    try {
        const voyage = Voyage.findOne({
            _id: req.params.id,
        });
        if (!voyage) {
            res.status(200).json({
                // status: "success",
                message: "is found",
                voyage,
            });
        } else {
            const res_val = await voyage;
            res.status(200).json({
                status: "success",
                res_val,
            });
        }
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Voyage Not Found",
        });
    }
};

// CREATE COMPANY VOYAGE
exports.createCompanyVoyage = async (req, res) => {
    const companyId = req.params.companyId;
    const origin = req.body.origin;
    const destination = req.body.destination;
    const departure = req.body.departure;
    const arrival = req.body.arrival;
    const isAvailable = req.body.isAvailable;
    const validDepartureDate = validateDate.validateDate(departure);
    const validArrivalDate = validateDate.validateDate(arrival);
    if (validDepartureDate && validArrivalDate) {
        const departureDate = new Date(departure);
        const arrivalDate = new Date(arrival);
        const randomUniqueID = generateUniqueId.generateUniqueId(
            origin,
            destination
        );
        const stillValidDate = validateDate.compareTwoDates(
            departureDate,
            arrivalDate
        );
        if (stillValidDate) {
            const newVoyage = new Voyage({
                voyageUniqueID: randomUniqueID,
                origin: origin,
                destination: destination,
                departure: departureDate,
                arrival: arrivalDate,
                isAvailable: isAvailable,
            });
            try {
                if (ObjectId.isValid(companyId)) {
                    await Company.findOne({ _id: companyId })
                        .populate("voyages")
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
                                    message: "Company Not Found",
                                });
                            }
                            const filteredVoyage = company.voyages.filter(
                                (voyageObj) => {
                                    return (
                                        voyageObj.voyageUniqueID ==
                                            newVoyage.voyageUniqueID ||
                                        (voyageObj.origin === origin &&
                                            voyageObj.destination ===
                                                destination)
                                    );
                                }
                            );
                            if (filteredVoyage.length > 0) {
                                return res.status(401).json({
                                    status: "fail",
                                    message: "Voyage Already Existed",
                                });
                            } else if (filteredVoyage.length === 0) {
                                company.voyages.push(newVoyage);
                                newVoyage.company = company;

                                newVoyage.save((err, savedVoyage) => {
                                    if (err) {
                                        return res.status(500).json({
                                            success: "fail",
                                            message: err,
                                        });
                                    }
                                    savedVoyage;
                                    res.status(201).json({
                                        success: "success",
                                        message: "Voyage Registered",
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
                                return company;
                            }
                        });
                } else {
                    res.status(401).json({
                        status: "fail",
                        message: "Invalid ID Provided",
                    });
                }
            } catch (err) {
                res.status(401).json({
                    status: "fail",
                    message: "Something Bad Happened",
                });
            }
        } else {
            return res.status(401).json({
                status: "fail",
                message: "Please Fill Correct arrival and Departure dates",
            });
        }
        // departureDate.toLocaleDateString();
    } else {
        return res.status(401).json({
            status: "fail",
            message: "Invalid Date Format",
        });
    }
};

// UPDATE COMPANY VOYAGE
exports.updateCompanyVoyage = async (req, res) => {
    const companyId = req.params.companyId;
    const voyageId = req.params.voyageId;
    if (req.body.departure || req.body.arrival) {
        const validDepartureDate = validateDate.validateDate(
            req.body.departure
        );
        const validArrivalDate = validateDate.validateDate(req.body.arrival);
        const stillValidDate = validateDate.compareTwoDates(
            req.body.departure,
            req.body.arrival
        );
        if (!validArrivalDate || !validDepartureDate) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid Date Format",
            });
        }
        if (!stillValidDate) {
            return res.status(401).json({
                status: "fail",
                message: "Please Provide Valid Departure and Arrival Date",
            });
        }
        if (ObjectId.isValid(voyageId) && ObjectId.isValid(companyId)) {
            try {
                const newVoyage = req.body;

                await Company.findOne({ _id: companyId }).exec(
                    (err, company) => {
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
                        Voyage.findOne({ _id: voyageId })
                            .populate(
                                "company",
                                "-__v -users -buses -drivers -address -createdAt -updatedAt"
                            )
                            .exec((err, voyage) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        message: err,
                                    });
                                }
                                if (!voyage) {
                                    return res.status(404).json({
                                        status: "fail",
                                        message: "Voyage Not Found",
                                    });
                                }
                                if (
                                    voyage.company.voyages.includes(voyageId) &&
                                    voyage.company._id.equals(companyId)
                                ) {
                                    voyage.updateOne(newVoyage, (err) => {
                                        if (err) {
                                            return res.status(500).json({
                                                status: "fail",
                                                message:
                                                    "Voyage Already Existed",
                                            });
                                        }
                                        res.status(201).json({
                                            status: "success",
                                            message:
                                                "Successfully Updated Voyage",
                                        });
                                    });
                                } else {
                                    return res.status(404).json({
                                        status: "fail",
                                        message: "Company Has Not Such Voyage",
                                    });
                                }
                            });
                    }
                );
            } catch (err) {
                return res.status(404).json({
                    status: "fail",
                    message: err,
                });
            }
        } else {
            return res.json({
                status: "fail",
                message: "Invalid ID Provided",
            });
        }
    }
};

// DELETE COMPANY VOYAGE
exports.deleteCompanyVoyage = async (req, res) => {
    const { companyId, voyageId } = req.params;
    if (ObjectId.isValid(companyId) && ObjectId.isValid(voyageId)) {
        try {
            await Company.findOne({ _id: companyId }).exec((err, company) => {
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
                Voyage.findOne({ _id: voyageId })
                    .populate(
                        "company",
                        "-__v -buses -address -createdAt -updatedAt -users -drivers -createdAt -updatedAt"
                    )
                    .exec((err, voyage) => {
                        if (err) {
                            return res.status(500).json({
                                status: "fail",
                                message: err,
                            });
                        }
                        if (!voyage) {
                            return res.status(404).json({
                                status: "fail",
                                message: "Voyage Not Found",
                            });
                        }
                        // console.log(voyage.company.voyages.includes(voyageId));
                        if (voyage.company.voyages.includes(voyageId)) {
                            const nVoyageIds = voyage.company.voyages.filter(
                                (voyage) => {
                                    return !voyage.equals(voyageId);
                                }
                            );
                            voyage.company.voyages = nVoyageIds;
                            company.voyages = nVoyageIds;
                            company.save((err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        message: err,
                                    });
                                }
                            });
                            voyage.remove((err) => {
                                if (err) {
                                    return res.status(500).json({
                                        status: "fail",
                                        message: err,
                                    });
                                }
                            });
                            res.status(200).json({
                                status: "success",
                                message: "Voyage Deleted Successfully",
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
    }
};

exports.createVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findOne({ name: req.body.name });
        if (voyage) {
            res.status(400).json({
                status: "success",
                message: "Voyage is already created",
            });
        }
        const newVoyage = await Voyage.create(req.body);
        res.status(201).json({
            status: "success",
            voyage: newVoyage,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Invalid data sent",
        });
    }
};

exports.updateVoyage = async (req, res) => {
    try {
        const updatedVoyage = await Voyage.findOneAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        res.status(200).json({
            status: "success",
            updatedVoyage,
        });
    } catch (err) {
        res.send(404).json({
            status: "fail",
        });
    }
};

exports.deleteVoyage = async (req, res) => {
    try {
        await Voyage.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: "success",
            data: null,
        });
    } catch (err) {
        res.send(400).json({
            status: "fail",
        });
    }
};
