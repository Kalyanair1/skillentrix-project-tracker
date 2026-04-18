const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  projectId: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Task', taskSchema)
