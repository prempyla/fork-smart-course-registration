// Form for creating and editing sections
import React, { useState, useEffect } from 'react'
import { createSection, updateSection } from '../../api/sections'
import { getAllCourses } from '../../api/courses'
import { getAllTerms } from '../../api/terms'

const SectionForm = ({ section, onClose }) => {
  const [formData, setFormData] = useState({
    sectionCode: '',
    capacity: '',
    courseId: '',
    termId: '',
    facultyId: ''
  })
  const [courses, setCourses] = useState([])
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCourses()
    loadTerms()
    if (section) {
      setFormData({
        sectionCode: section.sectionCode || '',
        capacity: section.capacity?.toString() || '',
        courseId: section.courseId?.toString() || '',
        termId: section.termId?.toString() || '',
        facultyId: section.facultyId || ''
      })
    } else {
      setFormData({
        sectionCode: '',
        capacity: '',
        courseId: '',
        termId: '',
        facultyId: ''
      })
    }
  }, [section])

  const loadCourses = async () => {
    try {
      const data = await getAllCourses()
      setCourses(data)
    } catch (err) {
      console.error('Failed to load courses:', err)
    }
  }

  const loadTerms = async () => {
    try {
      const data = await getAllTerms()
      setTerms(data)
    } catch (err) {
      console.error('Failed to load terms:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Prepare data - only send facultyId if it's not empty
      const submitData = {
        sectionCode: formData.sectionCode,
        capacity: formData.capacity,
        courseId: formData.courseId,
        termId: formData.termId
      }
      // Only add facultyId if provided
      if (formData.facultyId && formData.facultyId.trim() !== '') {
        submitData.facultyId = formData.facultyId.trim()
      }

      if (section) {
        await updateSection(section.id, submitData)
        alert('Section updated successfully!')
      } else {
        await createSection(submitData)
        alert('Section created successfully!')
      }
      onClose()
    } catch (err) {
      setError(err.message || err.data?.error || 'Failed to save section')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {section ? 'Edit Section' : 'Create New Section'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Code *
            </label>
            <input
              type="text"
              name="sectionCode"
              value={formData.sectionCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A, B, C"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 30"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course *
            </label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term *
            </label>
            <select
              name="termId"
              value={formData.termId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a term</option>
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.year} {term.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faculty ID (Optional)
            </label>
            <input
              type="text"
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty if not assigned"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the faculty user ID if known</p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : section ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SectionForm

