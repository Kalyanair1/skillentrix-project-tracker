import { useEffect, useMemo, useState } from 'react'
import AddProject from './components/AddProject.jsx'
import AddTask from './components/AddTask.jsx'
import ProjectList from './components/ProjectList.jsx'
import TaskList from './components/TaskList.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? '/api'
    : 'https://skillentrix-project-tracker.onrender.com/api')
const STATUS_FILTERS = ['All', 'Pending', 'In Progress', 'Completed']

async function readResponse(response) {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.message || 'Something went wrong while talking to the server.')
  }

  return payload
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  return readResponse(response)
}

function App() {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [tasks, setTasks] = useState([])
  const [projectSearch, setProjectSearch] = useState('')
  const [taskStatusFilter, setTaskStatusFilter] = useState('All')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [submittingProject, setSubmittingProject] = useState(false)
  const [submittingTask, setSubmittingTask] = useState(false)
  const [pageMessage, setPageMessage] = useState('Checking your backend connection and preparing the dashboard.')
  const [errorMessage, setErrorMessage] = useState('')
  const [backendStatus, setBackendStatus] = useState({
    state: 'checking',
    mode: 'unknown',
    message: 'Checking backend health...',
  })

  useEffect(() => {
    checkBackendHealth()
    fetchProjects()
  }, [])

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([])
      setTaskStatusFilter('All')
      return
    }

    fetchTasks(selectedProjectId)
  }, [selectedProjectId])

  const selectedProject = useMemo(() => {
    return projects.find((project) => project._id === selectedProjectId) || null
  }, [projects, selectedProjectId])

  const filteredProjects = useMemo(() => {
    const normalizedSearch = projectSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return projects
    }

    return projects.filter((project) => {
      return [project.name, project.description].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      )
    })
  }, [projectSearch, projects])

  const visibleTasks = useMemo(() => {
    if (taskStatusFilter === 'All') {
      return tasks
    }

    return tasks.filter((task) => task.status === taskStatusFilter)
  }, [taskStatusFilter, tasks])

  const taskStats = useMemo(() => {
    return tasks.reduce(
      (summary, task) => {
        summary.total += 1
        summary[task.status] += 1
        return summary
      },
      {
        total: 0,
        Pending: 0,
        'In Progress': 0,
        Completed: 0,
      },
    )
  }, [tasks])

  const completionRate = taskStats.total
    ? Math.round((taskStats.Completed / taskStats.total) * 100)
    : 0
  const projectIntensity = projects.length
    ? Math.min(100, Math.round((tasks.length / Math.max(projects.length, 1)) * 28))
    : 0

  async function checkBackendHealth() {
    try {
      const data = await apiRequest('/health')
      setBackendStatus({
        state: 'online',
        mode: data.dataMode || 'unknown',
        message: data.message || 'Backend is responding normally.',
      })
    } catch (error) {
      setBackendStatus({
        state: 'offline',
        mode: 'unavailable',
        message: error.message,
      })
    }
  }

  async function fetchProjects() {
    setLoadingProjects(true)
    setErrorMessage('')

    try {
      const data = await apiRequest('/projects')
      setProjects(data)

      if (data.length === 0) {
        setSelectedProjectId('')
        setPageMessage('Create your first project to start planning work.')
      } else {
        setSelectedProjectId((currentId) =>
          data.some((project) => project._id === currentId) ? currentId : data[0]._id,
        )
        setPageMessage('Projects loaded successfully from the backend.')
      }
    } catch (error) {
      setProjects([])
      setSelectedProjectId('')
      setTasks([])
      setErrorMessage(error.message)
      setPageMessage('The dashboard could not load data from the backend.')
    } finally {
      setLoadingProjects(false)
    }
  }

  async function fetchTasks(projectId) {
    setLoadingTasks(true)
    setErrorMessage('')

    try {
      const data = await apiRequest(`/tasks/${projectId}`)
      setTasks(data)
      setPageMessage('Task board synced successfully.')
    } catch (error) {
      setTasks([])
      setErrorMessage(error.message)
      setPageMessage('Task data could not be loaded for this project.')
    } finally {
      setLoadingTasks(false)
    }
  }

  async function handleAddProject(projectDetails) {
    setSubmittingProject(true)
    setErrorMessage('')

    try {
      const createdProject = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectDetails),
      })

      setProjects((currentProjects) => [createdProject, ...currentProjects])
      setSelectedProjectId(createdProject._id)
      setPageMessage('Project created successfully.')
      return true
    } catch (error) {
      setErrorMessage(error.message)
      return false
    } finally {
      setSubmittingProject(false)
    }
  }

  async function handleDeleteProject(projectId) {
    setErrorMessage('')

    try {
      await apiRequest(`/projects/${projectId}`, {
        method: 'DELETE',
      })

      setProjects((currentProjects) => {
        const nextProjects = currentProjects.filter((project) => project._id !== projectId)

        if (projectId === selectedProjectId) {
          setSelectedProjectId(nextProjects[0]?._id || '')
        }

        return nextProjects
      })

      if (projectId === selectedProjectId) {
        setTasks([])
      }

      setPageMessage('Project deleted successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleAddTask(taskDetails) {
    setSubmittingTask(true)
    setErrorMessage('')

    try {
      const createdTask = await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskDetails),
      })

      setTasks((currentTasks) => [createdTask, ...currentTasks])
      setPageMessage('Task added successfully.')
      return true
    } catch (error) {
      setErrorMessage(error.message)
      return false
    } finally {
      setSubmittingTask(false)
    }
  }

  async function handleUpdateTaskStatus(taskId, status) {
    setErrorMessage('')

    try {
      const updatedTask = await apiRequest(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task._id === taskId ? updatedTask : task)),
      )
      setPageMessage(`Task moved to ${status}.`)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  async function handleDeleteTask(taskId) {
    setErrorMessage('')

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      })

      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId))
      setPageMessage('Task deleted successfully.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <div className="app-shell">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Skillentrix Internship Project</p>
          <h1>Project & Task Tracking System</h1>
          <p className="hero__text">
            A refined full-stack dashboard for planning projects, assigning work, and
            monitoring progress through a connected React and Express workflow.
          </p>
          <div className="hero__chips">
            <span>Projects CRUD</span>
            <span>Tasks CRUD</span>
            <span>Live status updates</span>
            <span>MongoDB connected</span>
          </div>

          <div className="hero__mini-grid">
            <article className="hero-mini-card">
              <span>Execution tempo</span>
              <strong>{projectIntensity}%</strong>
              <p>Measures how active the current workspace feels based on tasks per project.</p>
            </article>
            <article className="hero-mini-card hero-mini-card--accent">
              <span>Active delivery</span>
              <strong>{taskStats['In Progress']}</strong>
              <p>Tasks currently moving across the board right now.</p>
            </article>
          </div>
        </div>

        <aside className="hero__panel">
          <p className="eyebrow">System Status</p>
          <div className="hero__stats" aria-label="Project statistics">
            <article>
              <strong>{projects.length}</strong>
              <span>Projects</span>
            </article>
            <article>
              <strong>{tasks.length}</strong>
              <span>Tasks</span>
            </article>
            <article>
              <strong>{completionRate}%</strong>
              <span>Complete</span>
            </article>
          </div>

          <div className="backend-status">
            <span className={`status-dot status-dot--${backendStatus.state}`} aria-hidden="true" />
            <div>
              <strong>
                Backend {backendStatus.state === 'online' ? 'online' : backendStatus.state}
              </strong>
              <p>
                {backendStatus.message}
                {backendStatus.state === 'online' ? ` (${backendStatus.mode} mode)` : ''}
              </p>
            </div>
          </div>

          <p className="panel-note">{pageMessage}</p>
          {errorMessage ? <p className="panel-error">{errorMessage}</p> : null}
        </aside>
      </section>

      <section className="overview-grid" aria-label="Solution overview">
        <article className="overview-card">
          <p className="eyebrow">Backend</p>
          <h2>Express API with project and task routes</h2>
          <p>
            The backend supports project and task CRUD, task status updates, and a
            health endpoint to verify the server is available.
          </p>
        </article>
        <article className="overview-card">
          <p className="eyebrow">Frontend</p>
          <h2>Responsive dashboard with connected state</h2>
          <p>
            The UI loads real backend data, keeps the selected project in focus, and
            lets you manage tasks without reloading the page.
          </p>
        </article>
        <article className="overview-card">
          <p className="eyebrow">Submission</p>
          <h2>Cleaner presentation for GitHub and demo</h2>
          <p>
            The project now reads more clearly as a complete internship submission with
            better copy, better status visibility, and a more polished layout.
          </p>
        </article>
      </section>

      <section className="metrics-grid" aria-label="Task metrics">
        <article className="metric-card">
          <span>Pending</span>
          <strong>{taskStats.Pending}</strong>
        </article>
        <article className="metric-card">
          <span>In Progress</span>
          <strong>{taskStats['In Progress']}</strong>
        </article>
        <article className="metric-card">
          <span>Completed</span>
          <strong>{taskStats.Completed}</strong>
        </article>
        <article className="metric-card">
          <span>Active Filter</span>
          <strong>{taskStatusFilter}</strong>
        </article>
      </section>

      <section className="spotlight-grid" aria-label="Project spotlight">
        <article className="spotlight-card spotlight-card--primary">
          <div className="spotlight-card__header">
            <div>
              <p className="eyebrow">Project Spotlight</p>
              <h2>{selectedProject?.name || 'No project selected yet'}</h2>
            </div>
            <span className="spotlight-badge">
              {selectedProject ? `${completionRate}% shipped` : 'Waiting'}
            </span>
          </div>

          <p className="spotlight-copy">
            {selectedProject?.description ||
              'Pick a project from the left column to turn this dashboard into a focused delivery cockpit.'}
          </p>

          <div className="progress-track" aria-label="Completion progress">
            <span style={{ width: `${completionRate}%` }} />
          </div>

          <div className="spotlight-metrics">
            <article>
              <span>Total tasks</span>
              <strong>{taskStats.total}</strong>
            </article>
            <article>
              <span>Pending</span>
              <strong>{taskStats.Pending}</strong>
            </article>
            <article>
              <span>Done</span>
              <strong>{taskStats.Completed}</strong>
            </article>
          </div>
        </article>

        <article className="spotlight-card spotlight-card--secondary">
          <p className="eyebrow">Flow Balance</p>
          <div className="flow-stack">
            <div className="flow-row">
              <span>Pending</span>
              <strong>{taskStats.Pending}</strong>
            </div>
            <div className="flow-bar">
              <span style={{ width: `${taskStats.total ? (taskStats.Pending / taskStats.total) * 100 : 0}%` }} />
            </div>
            <div className="flow-row">
              <span>In Progress</span>
              <strong>{taskStats['In Progress']}</strong>
            </div>
            <div className="flow-bar flow-bar--progress">
              <span style={{ width: `${taskStats.total ? (taskStats['In Progress'] / taskStats.total) * 100 : 0}%` }} />
            </div>
            <div className="flow-row">
              <span>Completed</span>
              <strong>{taskStats.Completed}</strong>
            </div>
            <div className="flow-bar flow-bar--complete">
              <span style={{ width: `${taskStats.total ? (taskStats.Completed / taskStats.total) * 100 : 0}%` }} />
            </div>
          </div>
        </article>
      </section>

      <main className="workspace">
        <section className="workspace__sidebar">
          <AddProject onAddProject={handleAddProject} isSubmitting={submittingProject} />

          <section className="panel">
            <div className="section-heading">
              <p className="eyebrow">Projects</p>
              <h2>Choose a project</h2>
            </div>

            <label className="search-field">
              <span>Search projects</span>
              <input
                type="search"
                placeholder="Search by name or description"
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
              />
            </label>

            <ProjectList
              projects={filteredProjects}
              selectedProjectId={selectedProjectId}
              isLoading={loadingProjects}
              onSelectProject={setSelectedProjectId}
              onDeleteProject={handleDeleteProject}
            />
          </section>
        </section>

        <section className="workspace__content">
          <section className="panel panel--feature">
            <div className="section-heading">
              <p className="eyebrow">Current Project</p>
              <h2>{selectedProject?.name || 'Select a project to begin'}</h2>
            </div>

            <p className="selected-project__description">
              {selectedProject?.description ||
                'Choose a project to add tasks, update their progress, and manage daily work clearly.'}
            </p>

            <div className="selected-project__meta">
              <span>{selectedProject ? 'Connected to backend data' : 'Waiting for project selection'}</span>
              <span>{selectedProject ? `${tasks.length} tasks loaded` : 'No tasks in view'}</span>
              <span>{selectedProject ? `${completionRate}% completed` : 'Progress summary appears here'}</span>
            </div>
          </section>

          <AddTask
            key={selectedProjectId || 'no-project'}
            projectId={selectedProjectId}
            onAddTask={handleAddTask}
            isSubmitting={submittingTask}
          />

          <TaskList
            tasks={visibleTasks}
            totalTasks={tasks.length}
            isLoading={loadingTasks}
            hasProjectSelected={Boolean(selectedProjectId)}
            statusFilter={taskStatusFilter}
            onStatusFilterChange={setTaskStatusFilter}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </section>
      </main>
    </div>
  )
}

export default App
