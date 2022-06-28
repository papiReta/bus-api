const mongoose = require("mongoose");
const dbs = require("./../models/index.model");
const dotenv = require("dotenv");
const Role = dbs.Role;

dotenv.config({
    path: "./.env",
});

// const db = process.env.DATABASE_LOCAL;
const db_remote = process.env.DATABASE_NAME.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
);

const connetDB = async () => {
    try {
        const connectionString = await mongoose.connect(db_remote, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        initial();
        if (process.env.NODE_ENV === "development") {
            console.log(
                `MongoDB connected: ${connectionString.connection.host}`
            );
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            // every user is 'passenger'
            new Role({
                name: "passenger",
            }).save((err) => {
                if (err) {
                    console.log("Error while saving Role");
                }
                console.log("Role 'passenger' is added");
            });

            // user with the role 'driver'
            new Role({
                name: "driver",
            }).save((err) => {
                if (err) {
                    console.log("Error while saving Role");
                }
                console.log("Role 'driver' is added");
            });

            // user with the role 'company'
            new Role({
                name: "company",
            }).save((err) => {
                if (err) {
                    console.log("Error while saving Role");
                }
                console.log("Role 'company' is added");
            });

            // user with the whole platform admin = "platform-admin"
            new Role({
                name: "platform-admin",
            }).save((err) => {
                if (err) {
                    console.log("Error while saving Role");
                }
                console.log("Role 'platform-admin' is added");
            });
        }
    });
}

module.exports = connetDB;
