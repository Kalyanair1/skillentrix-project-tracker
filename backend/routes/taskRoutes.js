const express = require('express')
const mongoose = require('mongoose')
const Task = require('../models/Task')
const memoryStore = require('../store/memoryStore')

const router = express.Router()
const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Completed']

router.get('/:projectId', async (request, response) => {
  const tasks = mongoose.connection.readyState === 1
    ? await Task.find({ projectId: request.params.projectId }).sort({ _id: -1 })
    : memoryStore.getTasksByProject(request.params.projectId)

  response.json(tasks)
})

router.post('/', async (request, response) => {
  const { title, description, projectId } = request.body

  if (!title || !description || !projectId) {
    return response.status(400).json({ message: 'Title, description, and projectId are required.' })
  }

  const task = mongoose.connection.readyState === 1
    ? await Task.create({ title, description, projectId })
    : memoryStore.createTask({ title, description, projectId })

  return response.status(201).json(task)
})

router.put('/:id', async (request, response) => {
  const { status } = request.body

  if (!ALLOWED_STATUSES.includes(status)) {
    return response.status(400).json({ message: 'Invalid task status supplied.' })
  }

  const updatedTask = mongoose.connection.readyState === 1
    ? await Task.findByIdAndUpdate(
      request.params.id,
      { status },
      { new: true, runValidators: true },
    )
    : memoryStore.updateTaskStatus(request.params.id, status)

  if (!updatedTask) {
    return response.status(404).json({ message: 'Task not found.' })
  }

  return response.json(updatedTask)
})

router.delete('/:id', async (request, response) => {
  const deletedTask = mongoose.connection.readyState === 1
    ? await Task.findByIdAndDelete(request.params.id)
    : memoryStore.deleteTask(request.params.id)

  if (!deletedTask) {
    return response.status(404).json({ message: 'Task not found.' })
  }

  return response.json({ message: 'Task deleted successfully.' })
})

module.exports = router
