const { randomUUID } = require('crypto')

const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Completed']
const projects = []
const tasks = []

function createProject({ name, description }) {
  const project = {
    _id: randomUUID(),
    name,
    description,
    createdAt: new Date(),
  }

  projects.unshift(project)
  return project
}

function getProjects() {
  return [...projects].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

function deleteProject(projectId) {
  const projectIndex = projects.findIndex((project) => project._id === projectId)

  if (projectIndex === -1) {
    return null
  }

  const [deletedProject] = projects.splice(projectIndex, 1)

  for (let index = tasks.length - 1; index >= 0; index -= 1) {
    if (tasks[index].projectId === projectId) {
      tasks.splice(index, 1)
    }
  }

  return deletedProject
}

function createTask({ title, description, projectId }) {
  const task = {
    _id: randomUUID(),
    title,
    description,
    status: 'Pending',
    projectId,
  }

  tasks.unshift(task)
  return task
}

function getTasksByProject(projectId) {
  return tasks.filter((task) => task.projectId === projectId)
}

function updateTaskStatus(taskId, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    return null
  }

  const task = tasks.find((item) => item._id === taskId)

  if (!task) {
    return null
  }

  task.status = status
  return task
}

function deleteTask(taskId) {
  const taskIndex = tasks.findIndex((task) => task._id === taskId)

  if (taskIndex === -1) {
    return null
  }

  const [deletedTask] = tasks.splice(taskIndex, 1)
  return deletedTask
}

module.exports = {
  createProject,
  getProjects,
  deleteProject,
  createTask,
  getTasksByProject,
  updateTaskStatus,
  deleteTask,
}
