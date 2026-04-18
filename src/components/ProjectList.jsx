function ProjectList({
  projects,
  selectedProjectId,
  isLoading,
  onSelectProject,
  onDeleteProject,
}) {
  if (isLoading) {
    return <div className="empty-state">Loading projects...</div>
  }

  if (projects.length === 0) {
    return (
      <div className="empty-state">
        No projects yet. Create one from the form above to start tracking tasks.
      </div>
    )
  }

  return (
    <div className="project-list">
      {projects.map((project) => {
        const isSelected = project._id === selectedProjectId

        return (
          <article
            key={project._id}
            className={isSelected ? 'project-card project-card--selected' : 'project-card'}
          >
            <button
              className="project-card__body"
              type="button"
              onClick={() => onSelectProject(project._id)}
            >
              <strong>{project.name}</strong>
              <span>{project.description}</span>
            </button>
            <button
              className="ghost-action"
              type="button"
              onClick={() => onDeleteProject(project._id)}
              aria-label={`Delete ${project.name}`}
            >
              Delete
            </button>
          </article>
        )
      })}
    </div>
  )
}

export default ProjectList
