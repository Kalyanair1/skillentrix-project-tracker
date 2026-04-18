const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed']

function TaskList({
  tasks,
  totalTasks,
  isLoading,
  hasProjectSelected,
  statusFilter,
  onStatusFilterChange,
  onDeleteTask,
  onUpdateTaskStatus,
}) {
  if (!hasProjectSelected) {
    return <div className="empty-state">Select a project to view and manage tasks.</div>
  }

  if (isLoading) {
    return <div className="empty-state">Loading tasks...</div>
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Execution Board</p>
        <h2>Tasks for the selected project</h2>
      </div>

      <div className="task-toolbar">
        <label className="status-select">
          <span>Filter tasks</span>
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <p className="task-summary">
          Showing {tasks.length} of {totalTasks} tasks
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">No tasks match this view yet. Add one or change the filter.</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <article key={task._id} className="task-card">
              <div className="task-card__header">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
                <span
                  className={`status-pill status-pill--${task.status.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {task.status}
                </span>
              </div>

              <div className="task-card__footer">
                <label className="status-select">
                  <span>Status</span>
                  <select
                    value={task.status}
                    onChange={(event) => onUpdateTaskStatus(task._id, event.target.value)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="ghost-action"
                  type="button"
                  onClick={() => onDeleteTask(task._id)}
                >
                  Delete Task
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default TaskList
