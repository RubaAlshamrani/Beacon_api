const express = require("express");
const multer = require('multer');

const upload = multer();

const {
    addCourse,
    getCourse,
    deleteCourse,
    getMyCourses,
    getCourseAppointment,
    addAppointment,
    editCourse,
    editAppointment,
    deleteAppointment,
    getAppointment,
    attendCourseAppointment,
    getStudents,
    addStudentsByArray,
    addStudentsByExcel,
    attendStudentById,
    checkAppointmentStatus,
    getAttendAndAbsenceStudents,
    getApology,
    addAppointmentApology,
    sendNotificationToCourse,
    getNotifications,
} = require("../controllers/course.controllers")
const is_instructor = require("../middlewares/is_instructor");
const is_user = require("../middlewares/is_user");
const is_student = require("../middlewares/is_student");

const router = express.Router();

// Courses
router.get('/course', is_user, getMyCourses)

router.get('/course/:courseId', is_user, getCourse)

router.post('/course', is_instructor, addCourse)

router.put("/course/:courseId", is_instructor, editCourse)

router.delete("/course/:courseId", is_instructor, deleteCourse)

router.post("/course/:courseId/sendNotification", is_instructor, sendNotificationToCourse)


// todo DELETE COURSE

// Appointments
router.get("/course/:courseId/appointment", getCourseAppointment)

router.get("/course/:courseId/appointment/:appointmentId", getAppointment)

router.post("/course/:courseId/appointment", is_instructor, addAppointment)

router.put("/course/:courseId/appointment/:appointmentId", is_instructor, editAppointment)

router.delete("/course/:courseId/appointment/:appointmentId", is_instructor, deleteAppointment)

// todo DELETE Appointment


// Attend Appointment

router.get("/appointment/:appointmentId/isOpen", is_student, checkAppointmentStatus)

router.post("/appointment/:appointmentId/attend", is_student, attendCourseAppointment)

router.post("/appointment/:appointmentId/attendStudentById", is_instructor, attendStudentById)


// Add Students To Course
// 1- uploading an excel file
// 2- adding students manually
// هي بتجيب طلاب كورس معين
router.get("/course/:courseId/students", is_instructor, getStudents)

router.post("/course/:courseId/addStudentsByArray", is_instructor, addStudentsByArray)

router.post("/course/:courseId/addStudentsByExcel", is_instructor, upload.single('excel'), addStudentsByExcel)


// Get attendace and abscence of a course
// هي بتجيب الحضور والغياب تبع هاد الكورس
router.get("/appointment/:appointmentId/students", is_instructor, getAttendAndAbsenceStudents)


// apology for appointment

router.get("/apology", is_instructor, getApology)

router.post("/appointment/:appointmentId/apology", is_student, addAppointmentApology)


router.get("/notification", is_student, getNotifications)

module.exports = router
