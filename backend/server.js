const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const projectRoutes = require('./routes/projectRoutes')
const taskRoutes = require('./routes/taskRoutes')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
let dataMode = 'memory'

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({
    message: 'Task tracking backend is running.',
    dataMode,
  })
})

app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({
    message: error.message || 'Unexpected server error.',
  })
})

connectDB()
  .then(() => {
    dataMode = 'mongodb'
  })
  .catch((error) => {
    console.warn(`MongoDB unavailable, starting in memory mode: ${error.message}`)
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port} (${dataMode} mode)`)
    })
  })
