const mongoose = require("mongoose");

const voyageSchema = new mongoose.Schema(
    {
        voyageUniqueID: {
            type: String,
            unique: true,
        },
        origin: {
            type: String,
            require: true,
        },
        destination: {
            type: String,
            require: true,
        },
        departure: {
            type: Date,
            default: Date.now(),
        },
        arrival: {
            type: Date,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    },
    { timestamps: true }
);

const Voyage = mongoose.model("Voyage", voyageSchema);

module.exports = Voyage;

// - id
// - name
// - departure
// - arrival
// - origin
// - destination
// - prices_birr
// - price_currency
// - is_available
