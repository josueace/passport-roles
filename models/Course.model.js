const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema(
  {
    title: String,
    leadTeacher: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    startDate: Date,
    endDate: Date,
    ta: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courseImg: String,
    description: String,
    status: { type: String, enum: ['ON', 'OFF'] },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    role: {
      type: String,
      enum : ['BOSS', 'DEV', 'TA','STUDENT','GUEST'],
      default : 'GUEST'
    }
  },
  {
    timestamps: true
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
