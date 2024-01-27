const express = require('express');

const { getMyCourses, getCourseAppointments } = require("../controllers/index.controllers")
const is_instructor = require("../middlewares/is_instructor");
const is_user = require("../middlewares/is_user");

const router = express.Router();

router.get("/myCourses", is_user, getMyCourses);

router.get("/getAppointment", getCourseAppointments)

module.exports = router;