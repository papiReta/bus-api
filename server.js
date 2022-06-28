const dotenv = require("dotenv");
const connectDB = require("./config/db.config");

dotenv.config({
    path: "./.env",
});

connectDB();

// Third party middleware
const app = require("./app");

const port = process.env.PORT || 4444;
app.listen(port, () => {
    if (process.env.NODE_ENV === "development") {
        console.log(`App is listening on port ${port}`);
    }
});
