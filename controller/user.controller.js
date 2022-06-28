const db = require("./../models/index.model");
const Role = db.Role;
const User = db.User;

exports.allAccess = (req, res) => {
    res.status(200).send("Public Access");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User Board");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Board");
};

exports.superAdmin = (req, res) => {
    res.status(200).send("SuperAdmin Board");
};

exports.getAllUser = async (req, res) => {
    try {
        await User.find({})
            .populate(
                "roles company",
                "-_id -buses -drivers -users -__v -updatedAt"
            )
            .select("username phoneNumber createdAt")
            .sort({ createdAt: -1 })
            .exec((err, users) => {
                if (err) {
                    res.status(500).json({
                        status: "fail",
                        message: err,
                    });
                    return;
                }
                if (!users) {
                    return res.status(404).json({
                        status: "fail",
                        message: "Users doesn't exist",
                    });
                }
                return res.status(200).json({
                    status: "success",
                    users,
                });
            });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err,
        });
    }
};

exports.getUser = async (req, res) => {
    const userId = req.params.id;
    await User.findOne({ _id: userId })
        .populate("roles", "-__v -_id")
        .select("username phoneNumber createdAt -_id")
        .then((err, user) => {
            if (err) {
                res.status(500).json({
                    status: "fail",
                    message: err,
                });
                return;
            }
            if (!user) {
                res.status(500).json({
                    status: "fail",
                    message: "User not found",
                });
                return;
            }
            res.status(500).json({
                status: "success",
                user,
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: "fail",
                message: err,
            });
        });
    res.status(500).json({
        status: "error",
        message: "This route is not defined yet",
    });
};

exports.updateUserRole = async (req, res) => {
    const roleQuery = req.params.role;
    await Role.findOne({ name: roleQuery }, async (err, role) => {
        if (err) {
            res.status(500).send({
                message: err,
            });
        }
        if (!role) {
            res.status(404).send({
                message: "Role Not Found",
            });
            return;
        } else {
            await User.findOne({ username: req.body.username })
                .populate("roles")
                .exec((err, user) => {
                    if (err) {
                        res.status(500).send({
                            message: err,
                        });
                        return;
                    }
                    Role.findOne({ name: roleQuery }, (err, role) => {
                        if (err) {
                            res.status(500).send({
                                message: "Null",
                            });
                            return;
                        }
                        for (let i = 0; i < user.roles.length; i++) {
                            if (user.roles[i].name === role.name) {
                                res.status(500).send({
                                    message: "Role existed",
                                });
                                return;
                            }
                        }
                        user.roles.push(role);
                        user.save((err) => {
                            if (err) {
                                res.status(500).send({
                                    message: err,
                                });
                                return;
                            }
                            res.status(201).send({
                                message: "Role Added",
                            });
                        });
                    });
                });
        }
    });
};
