const { Course, Appointment, User, Abscence, Notification } = require("../models/collections")
const { CastError } = require("mongoose");
const Excel = require('exceljs');
const moment = require('moment');


const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.type,
        "project_id": process.env.project_id,
        "private_key_id": process.env.private_key_id,
        "private_key": process.env.private_key,
        "client_email": process.env.client_email,
        "client_id": process.env.client_id,
        "auth_uri": process.env.auth_uri,
        "token_uri": process.env.token_uri,
        "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
        "client_x509_cert_url": process.env.client_x509_cert_url,
        "universe_domain": process.env.universe_domain
    }),
});


const getMyCourses = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let courses;
        if (req.user.role === 'instructor') {
            courses = await Course.find({ instructorId: userId });
        } else {
            const allCourses = await Course.find({ studentIds: userId });
            
        }
        res.status(200).json(allCourses);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);

    }
}

const getCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId).populate("instructorId");
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(course);
    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}

const addCourse = async (req, res, next) => {
    try {
        const newCourse = await Course.create({
            ...req.body,
            instructorId: req.user._id
        });
        res.status(201).json({
            success: true,
            message: "Course added successfully",
            data: newCourse,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

const editCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        const newCourse = await Course.findByIdAndUpdate(courseId, {
            ...req.body,
        }, { new: true })
        res.status(201).json({
            success: true,
            message: "Course edited successfully",
            data: newCourse,
        });

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}

const deleteCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        await Appointment.find({ courseId }).deleteMany()
        await Course.findByIdAndDelete(courseId)

        res.status(200).json({
            success: true,
            message: "Course and Appointments deleted successfully",
        });

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }

}

const getCourseAppointment = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }

        let appointments = await Appointment.find({ courseId: course._id }).sort({ start: 'desc' });
        appointments = appointments.map(app => app.toObject());
        const appointmentsEdited = appointments.map((app) => {
            const now = Date.now();
            return {
                ...app,
                status: now > app.end ? false : true,
                start: moment(app.start).format('DD MMM YYYY HH:mm'),
                end: moment(app.end).format('DD MMM YYYY HH:mm'),
            };
        });
        return res.json(appointmentsEdited);

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}

const getAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json(appointment);
    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}



const addAppointment = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        let newAppointment = await Appointment.create({
            courseId: req.params.courseId,
            ...req.body,
        });

        newAppointment = newAppointment.toObject()
        newAppointment.start = moment(newAppointment.start).format('DD MMM YYYY HH:mm');
        newAppointment.end = moment(newAppointment.end).format('DD MMM YYYY HH:mm');

        res.status(201).json({
            success: true,
            message: "Appointment added successfully",
            data: newAppointment,
        });
    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Appointment not found";
        }
        next(error);
    }
}

const editAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId
        const newAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
            ...req.body,
        }, { new: true })
        return res.status(200).json({
            success: true,
            message: "Appointment updated successfully",
            data: newAppointment
        });
    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Appointment not found";
        }
        next(error);
    }
}

const deleteAppointment = async (req, res, next) => {
    try {

        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }

        await Appointment.findByIdAndDelete(appointmentId)
        return res.status(200).json({
            success: true,
            message: "Appointments deleted successfully",
        });

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Appointment not found";
        }
        next(error);
    }
}

const checkAppointmentStatus = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }

        const now = Date.now();

        let message;
        let isOpen;
        if (appointment.start > now) {
            const startAtHumanized = moment(appointment.start).fromNow();
            message = "Appointment not started yet. Starts " + startAtHumanized
            isOpen = false;
        } else if (appointment.end < now) {
            const endAtHumanized = moment(appointment.end).fromNow();
            message = "Appointment already ended. Ended " + endAtHumanized
            isOpen = false;
        } else {
            isOpen = true;
            message = "Appointment is open";
        }

        res.json({ isOpen, message });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }


}


const attendCourseAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }

        const studentsInCourse = await Course.findById(appointment.courseId);
        if (!studentsInCourse.studentsIds.includes(req.user._id)) {
            const error = new Error("Student not in course");
            error.statusCode = 404;
            throw error;
        }


        const now = Date.now();
        // const now = moment().tz('Asia/Riyadh').format();

        if (appointment.start > now) {
            const startAtHumanized = moment(appointment.start).fromNow();
            const error = new Error("Appointment not started yet. Starts " + startAtHumanized);
            error.statusCode = 404;
            throw error;
        } else if (appointment.end < now) {
            const endAtHumanized = moment(appointment.end).fromNow();
            const error = new Error("Appointment already ended. Ended " + endAtHumanized);
            error.statusCode = 404;
            throw error;
        } else {
            appointment.attendanceList.studentsIds = [];
            appointment.attendanceList.push({ studentId: req.user._id });
            await appointment.save();
        }

        res.status(201).json({
            success: true,
            message: "Attendance added successfully",
            data: appointment,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

const attendStudentById = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }

        const studentsInCourse = await Course.findById(appointment.courseId);
        if (!studentsInCourse.studentsIds.includes(req.body.studentId)) {
            const error = new Error("Student not in course");
            error.statusCode = 404;
            throw error;
        }

        const now = Date.now();

        appointment.attendanceList.studentsIds = [];
        appointment.attendanceList.push({ studentId: req.body.studentId });
        await appointment.save();

        res.status(201).json({
            success: true,
            message: "Attendance added successfully",
            data: appointment,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

const getStudents = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        const students = await Course.findById(courseId).populate("studentsIds");
        return res.json(students.studentsIds);

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }

}

const addStudentsByArray = async (req, res, next) => {
    try {
        const courseId = req.params.courseId
        const course = await Course.findById(courseId);
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        const newStudents = req.body.studentsIds
        course.studentsIds.push(...newStudents)
        await course.save();

        res.status(201).json({
            success: true,
            message: "Students added successfully",
            data: course,
        });

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}

const addStudentsByExcel = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const fileBuffer = req.file.buffer;

        // Create a workbook from the uploaded file buffer
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const worksheet = workbook.getWorksheet(1); // Assuming data is in the first sheet

        const studentIds = [];

        worksheet.eachRow((row, rowNumber) => {
            const studentId = row.getCell(1).value; // Assuming student IDs are in the first column

            // Push student ID to the array
            studentIds.push(studentId);
        });

        // Remove duplicates from studentIds array
        const uniqueStudentIds = Array.from(new Set(studentIds));

        // You can now use the extracted unique student IDs as needed
        // res.status(200).json({ studentIds: uniqueStudentIds });

        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);

        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }

        for (const id of uniqueStudentIds) {
            const user = await User.findOne({ collegeId: id });

            if (user && !course.studentsIds.includes(user._id)) {
                course.studentsIds.push(user._id);
            }
        }

        await course.save();

        res.status(201).json({
            success: true,
            message: "Students added successfully",
            data: course,
        });

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }
}


const getAttendAndAbsenceStudents = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }

        const course = await Course.findById(appointment.courseId);

        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }

        // Array to store the result
        const resultArray = [];

        // Iterate through studentsIds in the course
        for (const studentId of course.studentsIds) {
            // Check if the student is in the attendance list
            const isPresent = appointment.attendanceList.some(
                (attendance) => attendance.studentId.toString() === studentId.toString()
            );

            // Get user information using populate
            let user = await User.findById(studentId); // Assuming there's a 'User' model
            apologies = await Abscence.find({ studentId, appointmentId })
            if (apologies.length > 0) {
                apologies = true
            } else {
                apologies = false
            }
            user = { ...user.toObject(), status: isPresent, apologies }

            // Push the result to the array
            resultArray.push(user);
        }

        res.status(200).json(resultArray);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

const addAppointmentApology = async (req, res, next) => {
    try {
        const appointmentId = req.params.appointmentId;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            const error = new Error("Appointment not found");
            error.statusCode = 404;
            throw error;
        }

        const abscence = await Abscence.create({
            studentId: req.user._id,
            appointmentId,
            reason: req.body.reason,
        })

        const course = await Course.findById(appointment.courseId).populate('instructorId');

        const title = "You recived an apology"
        const description = "You recived an apology"

        const message = {
            notification: {
                title,
                body: description
            },
            tokens: [course.instructorId.fcmToken],
        };

        await admin.messaging().sendEachForMulticast(message);


        res.status(201).json({
            success: true,
            message: "Abscence added successfully",
            data: abscence,
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

const getApology = async (req, res, next) => {
    try {
        const instructorId = req.user._id;
        const courses = await Course.find({ instructorId });
        const abscencesEdit = [];

        await Promise.all(courses.map(async (course) => {
            const appointments = await Appointment.find({ courseId: course._id });
            await Promise.all(appointments.map(async (appointment) => {
                const absences = await Abscence.find({ appointmentId: appointment._id })
                    .populate({
                        path: 'appointmentId',
                        select: 'name start end courseId', // Include courseId in the selection
                    })
                    .populate({
                        path: 'studentId',
                        select: 'name collegeId',
                    });
                abscencesEdit.push(...absences);
            }));
        }));

        const abscenceEdited = await Promise.all(abscencesEdit.map(async (absence) => {
            try {
                const { appointmentId, studentId, reason } = absence;

                // Check if appointmentId is available
                if (appointmentId) {
                    const { name, courseId } = appointmentId;
                    const course = await Course.findById(courseId);

                    if (course) {
                        return {
                            _id: absence._id,
                            studentId: studentId?._id,
                            studentName: studentId?.name,
                            studentCollegeId: studentId?.collegeId,
                            reason,
                            appointmentId: appointmentId?._id,
                            appointmentName: name,
                            courseName: course.name,
                            courseId: course._id,
                        };
                    } else {
                        console.error(`Course not found for absence: ${absence._id}`);
                        return null; // Skip this absence if course is not found
                    }
                } else {
                    console.error(`Appointment details not available for absence: ${absence._id}`);
                    return null; // Skip this absence if appointment details are not available
                }
            } catch (error) {
                console.error(`Error processing absence: ${absence._id}`, error);
                return null; // Skip this absence if there's an error processing it
            }
        }));

        // Filter out null values
        const filteredAbsences = abscenceEdited.filter((absence) => absence !== null);

        res.json(filteredAbsences);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};



const sendNotificationToCourse = async (req, res, next) => {

    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId).populate({
            path: 'studentsIds',
            select: 'fcmToken',
        });
        if (!course) {
            const error = new Error("Course not found");
            error.statusCode = 404;
            throw error;
        }
        const { title, description } = req.body;

        const registrationTokens = [];
        course.studentsIds.forEach(student => {
            registrationTokens.push(student.fcmToken)
        })

        const message = {
            notification: {
                title,
                body: description
            },
            tokens: registrationTokens,
        };

        await admin.messaging().sendEachForMulticast(message);

        await Notification.create({
            title,
            description,
            courseId,
        });

        res.status(201).json({
            success: true,
            message: "Notifications sent successfully",
        });

    } catch (error) {
        if (error instanceof CastError) {
            error.statusCode = 404;
            error.message = "Course not found";
        }
        next(error);
    }

}

const getNotifications = async (req, res, next) => {
    try {

        const userId = req.user._id
        // Find courses where the user is a student
        const userCourses = await Course.find({ studentsIds: userId });

        // Extract courseIds from the user's courses
        const courseIds = userCourses.map(course => course._id);

        // Find notifications for the extracted courseIds
        const notifications = await Notification.find({ courseId: { $in: courseIds } })
            .sort({ timestamp: -1 }); // Sort by timestamp in descending order

        const notificationsWithCourseName = await Promise.all(notifications.map(async (notification) => {
            const course = await Course.findById(notification.courseId);
            notification = notification.toObject(); // Convert to object
            notification.courseName = course.name;
            return notification;
        }));



        res.json(notificationsWithCourseName);

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);

    }
}

module.exports = {
    addCourse,
    getCourse,
    deleteCourse,
    getMyCourses,
    editCourse,
    getCourseAppointment,
    getAppointment,
    addAppointment,
    editAppointment,
    deleteAppointment,
    checkAppointmentStatus,
    attendCourseAppointment,
    attendStudentById,
    getStudents,
    addStudentsByArray,
    addStudentsByExcel,
    getAttendAndAbsenceStudents,
    getApology,
    addAppointmentApology,
    sendNotificationToCourse,
    getNotifications,
}