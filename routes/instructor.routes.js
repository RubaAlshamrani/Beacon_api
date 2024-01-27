const express = require('express');

const { addCourse, addAppointment } = require("../controllers/instructor.controllers")
const is_instructor = require("../middlewares/is_instructor");

const router = express.Router();

router.post("/addCourse", is_instructor, addCourse);

router.post("/addAppointment", is_instructor, addAppointment)



module.exports = router;