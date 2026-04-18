import { useState } from 'react'

const initialForm = {
  name: '',
  description: '',
}

function AddProject({ onAddProject, isSubmitting }) {
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

    if (!formValues.name.trim() || !formValues.description.trim()) {
      setStatusMessage('Project name and description are required.')
      return
    }

    const wasCreated = await onAddProject({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
    })

    if (wasCreated) {
      setFormValues(initialForm)
      setStatusMessage('Project saved successfully.')
    }
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Project Setup</p>
        <h2>Create a new project</h2>
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label className="field-group">
          <span>Project name</span>
          <input
            type="text"
            name="name"
            placeholder="Skillentrix internship portal"
            value={formValues.name}
            onChange={handleChange}
          />
        </label>

        <label className="field-group">
          <span>Description</span>
          <textarea
            name="description"
            rows="4"
            placeholder="Describe the goal, modules, or timeline"
            value={formValues.description}
            onChange={handleChange}
          />
        </label>

        <button className="primary-action" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Add Project'}
        </button>
        <p className="form-status" aria-live="polite">{statusMessage}</p>
      </form>
    </section>
  )
}

export default AddProject
