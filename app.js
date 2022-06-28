const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const voyageRouter = require("./routes/voyage.router");
const userRouter = require("./routes/user.router");
const companyRouter = require("./routes/company.route");
const busRouter = require("./routes/bus.route");
const driverRoute = require("./routes/driver.route");
const authRouter = require("./routes/auth.route");

const AppError = require("./utils/appError");
const errorController = require("./controller/error.controller");

const app = express();

// APP - MIDDLEWARE
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(cors());
app.use("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ROUTER - MIDDLEWARE
app.use("/api/auth", authRouter);
app.use("/api/v1/voyages", voyageRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/company", driverRoute);
app.use("/api/v1/company", voyageRouter);
app.use("/api/v1/buses", busRouter);
app.use("/api/v1/companies", busRouter);

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
