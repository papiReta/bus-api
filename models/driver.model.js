const mongoose = require("mongoose");

const driver = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    licenseId: {
        type: String,
        required: true,
    },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

const Driver = mongoose.model("Driver", driver);
module.exports = Driver;
