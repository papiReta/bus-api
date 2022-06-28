const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_WORK_FACTOR = 12;

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        userName: {
            type: String,
        },
        code: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        isAccountVerified: {
            type: Boolean,
            default: false,
        },
        isUserAssignedToCompany: {
            type: Boolean,
            default: false,
        },
        roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
        // company: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    const self = this;

    if (!self.isModified("password")) return next();

    self.password = await bcrypt.hash(self.password, SALT_WORK_FACTOR);

    next();
});

userSchema.pre("save", async function (next) {
    let alteredPhone = this.phoneNumber;
    if (!this.userName) {
        const concatNames = `${this.firstName}${this.lastName}`;
        if (alteredPhone.length === 9) {
            alteredPhone = `0${alteredPhone}`;
            this.phoneNumber = alteredPhone;
        }

        const slicedPhone = alteredPhone.slice(5, 10);
        this.userName = `${concatNames}${slicedPhone}`;
    }
    next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
