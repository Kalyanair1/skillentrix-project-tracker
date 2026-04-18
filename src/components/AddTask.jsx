import { useState } from 'react'

const initialForm = {
  title: '',
  description: '',
}

function AddTask({ projectId, onAddTask, isSubmitting }) {
  const [formValues, setFormValues] = useState(initialForm)
  const [statusMessage, setStatusMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!projectId) {
      setStatusMessage('Select a project before adding a task.')
      return
    }

    if (!formValues.title.trim() || !formValues.description.trim()) {
      setStatusMessage('Task title and description are required.')
      return
    }

    const wasCreated = await onAddTask({
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      projectId,
    })

    if (wasCreated) {
      setFormValues(initialForm)
      setStatusMessage('Task added successfully.')
    }
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Task Planning</p>
        <h2>Add a task to the selected project</h2>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Task title</span>
          <input
            type="text"
            name="title"
            placeholder="Design dashboard layout"
            value={formValues.title}
            onChange={handleChange}
            disabled={!projectId}
          />
        </label>

        <label className="field-group">
          <span>Description</span>
          <textarea
            name="description"
            rows="4"
            placeholder="Explain what needs to be completed"
            value={formValues.description}
            onChange={handleChange}
            disabled={!projectId}
          />
        </label>

        <button className="primary-action" type="submit" disabled={!projectId || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Add Task'}
        </button>
        <p className="form-status" aria-live="polite">{statusMessage}</p>
      </form>
    </section>
  )
}

export default AddTask
