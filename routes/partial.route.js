const express = require("express");
const { authJwt } = require("./../middleware/index");
const controller = require("./../controller/user.controller");

const app = express();

app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
    next();
});

app.get("/works", controller.allAccess);
app.get("/all", controller.allAccess);
app.get("/user", [authJwt.verifyToken], controller.userBoard);
app.get(
    "/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
);
app.get(
    "/superadmin",
    [authJwt.verifyToken, authJwt.isSuperAdmin],
    controller.superAdmin
);
// app.get("/users", controller.getUsers);
// app.get("/users/:id", controller.getSingleUser);

// app.patch("/api/update/:role", controller.updateUserRole);

module.exports = app;
