const Company = require("./../models/company.model");
const Bus = require("./../models/bus.model");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.getAllBuses = catchAsync(async (req, res, next) => {
    const count = await Bus.countDocuments();
    const buses = await Bus.find({});

    res.status(200).json({
        status: "success",
        count,
        buses,
    });
});

exports.getSingleBus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const bus = await Bus.findOne({ _id: id });
    if (!bus) {
        return next(new AppError("Bus Not Found", 404));
    }
    res.status(200).json({
        bus,
    });
});

exports.getCompanyBuses = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const company = await Company.findOne({ slug });
    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }

    const buses = await Bus.find({ _id: { $in: company.buses } });
    if (!buses.length) {
        res.status(200).json({
            status: "success",
            message: "No Bus Found",
        });
    }

    res.status(200).json({
        status: "success",
        buses,
    });
});

exports.getCompanyBus = catchAsync(async (req, res, next) => {
    const { slug, id } = req.params;

    const company = await Company.findOne({ slug });
    const bus = await Bus.findOne({ _id: id });

    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }
    if (!bus) {
        return next(new AppError(`Bus with id: ${id} Not Found`, 404));
    }

    if (!company.buses.includes(bus._id)) {
        return next(
            new AppError(
                `Company has no bus with id: ${bus._id} for company ${company._id}`,
                404
            )
        );
    }
    res.status(200).json({
        status: "success",
        bus,
    });
});

exports.createCompanyBus = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    // passengerCapacity, busSideNumber, passengerCapacity need some validation
    const { busPlateNumber, busSideNumber, passengerCapacity } = req.body;

    let newBus = new Bus({
        busPlateNumber,
        busSideNumber,
        passengerCapacity,
    });

    const company = await Company.findOne({ slug });

    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }
    const bus = await Bus.findOne({ _id: { $in: company.buses } });
    if (bus) {
        return next(
            new AppError(`${bus.busPlateNumber} already added to company`, 403)
        );
    }

    newBus.company = company._id;

    await newBus.save();

    await Company.updateOne(
        { _id: company._id },
        { $push: { buses: newBus._id } }
    );

    res.status(201).json({
        status: "success",
        message: `Bus added to company ${company.name}`,
    });
});

exports.updateCompanyBus = catchAsync(async (req, res, next) => {
    const { slug, id } = req.params;
    const updateBus = { ...req.body };

    const company = await Company.findOne({ slug });
    const bus = await Bus.findOne({ _id: id });

    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }
    if (!bus) {
        return next(new AppError(`Bus with id: ${id} Not Found`, 404));
    }

    if (updateBus.busPlateNumber || updateBus.busSideNumber) {
        const existingBus = await Bus.findOne({
            $or: [
                { busPlateNumber: updateBus.busPlateNumber },
                { busSideNumber: updateBus.busSideNumber },
            ],
        });
        if (existingBus) {
            if (existingBus.busPlateNumber === updateBus.busPlateNumber) {
                return next(
                    new AppError(
                        `Bus with plate number ${updateBus.busPlateNumber} already registered. Use another plate number`,
                        400
                    )
                );
            } else if (existingBus.busSideNumber === updateBus.busSideNumber) {
                return next(
                    new AppError(
                        `Bus with side number ${updateBus.busSideNumber} already registered. Use another side number`,
                        400
                    )
                );
            }
        }
    }

    if (!company.buses.includes(bus._id)) {
        return next(
            new AppError(
                `Bus with plate number ${bus.busPlateNumber} not found for ${company.name}`
            )
        );
    }
    await Bus.updateOne({ _id: bus._id }, updateBus);

    res.status(200).json({
        status: "success",
        message: `Bus with plate number ${bus.busPlateNumber} updated successfully`,
    });
});

exports.deleteCompanyBus = async (req, res, next) => {
    const { slug, id } = req.params;

    const company = await Company.findOne({ slug });
    const bus = await Bus.findOne({ _id: id });

    if (!company) {
        return next(new AppError("Company Not Found", 404));
    }
    if (!bus) {
        return next(new AppError(`Bus with id ${id} Not Found`, 404));
    }

    if (!company.buses.includes(bus._id)) {
        return next(
            new AppError(
                `Bus with id  ${bus._id} not found for ${company.name}`
            )
        );
    }

    await Company.updateOne(
        { _id: company._id },
        { $pull: { buses: bus._id } }
    );

    await Bus.deleteOne({ _id: bus._id });

    res.status(200).json({
        status: "success",
        message: `Bus with id ${bus._id} deleted successfully for company ${company.name}`,
    });
};

exports.deleteBus = async (req, res) => {
    const bus_id = req.params.id;
    await Bus.deleteOne({ _id: bus_id });
    res.json({
        message: "Bus deleted",
    });
};
