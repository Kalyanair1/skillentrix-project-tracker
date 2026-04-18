const express = require('express')
const mongoose = require('mongoose')
const Project = require('../models/Project')
const Task = require('../models/Task')
const memoryStore = require('../store/memoryStore')

const router = express.Router()

router.get('/', async (_request, response) => {
  const projects = mongoose.connection.readyState === 1
    ? await Project.find().sort({ createdAt: -1 })
    : memoryStore.getProjects()

  response.json(projects)
})

router.post('/', async (request, response) => {
  const { name, description } = request.body

  if (!name || !description) {
    return response.status(400).json({ message: 'Project name and description are required.' })
  }

  const project = mongoose.connection.readyState === 1
    ? await Project.create({ name, description })
    : memoryStore.createProject({ name, description })

  return response.status(201).json(project)
})

router.delete('/:id', async (request, response) => {
  const { id } = request.params

  const deletedProject = mongoose.connection.readyState === 1
    ? await Project.findByIdAndDelete(id)
    : memoryStore.deleteProject(id)

  if (!deletedProject) {
    return response.status(404).json({ message: 'Project not found.' })
  }

  if (mongoose.connection.readyState === 1) {
    await Task.deleteMany({ projectId: id })
  }

  return response.json({ message: 'Project deleted successfully.' })
})

module.exports = router
