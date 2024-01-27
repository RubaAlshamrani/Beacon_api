const { Course, Appointment } = require("../models/collections")
const { CastError } = require("mongoose");

const addCourse = async (req, res, next) => {
    try {
        const newCourse = await Course.create({
            ...req.body,
            instructorId: req.user._id
        });
        res.status(201).json({
            success: true,
            message: "Course added successfully"
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

const addAppointment = async (req, res, next) => {
    try {
        const course = await Course.findById(req.body.courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        const newAppointment = await Appointment.create({
            courseId: req.body.courseId,
            start: req.body.start,
            end: req.body.end,
        });
        res.status(201).json({
            success: true,
            message: "Appointment added successfully"
        });
    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}

module.exports = { addCourse, addAppointment }