const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        phoneNumber: {
            type: [String],
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        domain: {
            type: String,
            unique: true,
        },
        street: {
            type: String,
        },
        workingDays: {
            type: String,
        },
        foundedYear: {
            type: Date,
            required: true,
        },

        // location of the head-quarter
        location: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            default: "Ethiopia",
        },
        city: {
            type: String,
            required: true,
        },
        path: {
            type: String,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },

        drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }],
        buses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bus" }],
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        voyages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Voyage" }],
    },
    {
        timestamps: true,
    }
);

const Company = mongoose.model("Company", companySchema);

module.exports = Company;
