const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['student', 'instructor'],
        required: false
    },
    collegeId: {
        type: Number,
        required: false,
    },
    uniqueId: String,
    fcmToken: String,
    universityName: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'activated'],
        default: 'pending'
    }
});


// Course Schema
const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    studentsIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    }],
    room: String,
    hoursOfDeprivation: Number,
    section: String,
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    attendanceList: {
        type: [{
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        unique: true,
    },
    status: {
        type: String,
    }
});

const abscenceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: String,
    reason: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },
});

const NotificationSchema = new mongoose.Schema({
    title: String,
    description: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    }
});

const activationKeySchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'used'],
        default: 'pending'
    }
});


const User = mongoose.model('User', userSchema);
const Course = mongoose.model('Course', courseSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Abscence = mongoose.model('Abscence', abscenceSchema);
const Notification = mongoose.model('Notification', NotificationSchema)
const ActivationKey = mongoose.model('ActivationKey', activationKeySchema)

module.exports = {
    User,
    Course,
    Appointment,
    Abscence,
    Notification,
    ActivationKey
};
