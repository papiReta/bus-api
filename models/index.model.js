const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;

db.User = require("./user.model");
db.Company = require("./company.model");
db.Voyage = require("./voyage.model");
db.Bus = require("./bus.model");
db.Driver = require("./driver.model");
db.Role = require("./role.model");
db.ROLE = ["user", "admin", "super-admin"];

module.exports = db;

//     (module.exports = {
//         User: require("./user.model"),
//         Company: require("./company.model"),
//         Voyage: require("./voyage.model"),
//         Bus: require("./bus.model"),
//     })
// );
