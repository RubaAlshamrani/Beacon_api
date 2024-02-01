const express = require("express");
const mongoose = require("mongoose"); // ORM
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ibeacon-api";

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(morgan("dev"));


const authRouter = require("./routes/auth.routes");
const courseRouter = require("./routes/course.routes")

app.use(courseRouter)
app.use(authRouter);


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
