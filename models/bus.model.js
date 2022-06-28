const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
    {
        busPlateNumber: {
            type: String,
            unique: true,
            required: true,
        },
        busSideNumber: {
            type: String,
            unique: true,
            required: true,
        },
        passengerCapacity: {
            type: String,
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        driver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Driver",
        },
    },
    {
        timestamps: true,
    }
);

const Bus = mongoose.model("Bus", busSchema);

module.exports = Bus;
