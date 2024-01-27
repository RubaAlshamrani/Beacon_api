const { Course, Appointment } = require('../models/collections');


const getMyCourses = async (req, res) => {
    try {
        const userId = req.user._id;
        let courses;
        if (req.user.role === 'instructor') {
            courses = await Course.find({ instructorId: userId });
        } else {
            const allCourses = await Course.find();
            courses = allCourses.filter(course => course.studentsIds.includes(userId));
        }
        res.status(200).json(courses);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);

    }
}


const getCourseAppointments = async (req, res) => {
    try {
        const appointments = Appointment.findById(req.body.courseId);
        return res.json(appointments);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);

    }
}

module.exports = { getMyCourses, getCourseAppointments };
