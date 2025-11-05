// form component for creating and editing terms
import React, {useState,useEffect } from 'react'
import {createTerm,updateTerm } from '../../api/terms'

const TermForm = ({term,onClose }) => {
  const [formData, setFormData] = useState({
    year: '',
    semester: ''
  })
  const [loading, setLoading] =useState(false)
  const [error, setError] =useState('')

  useEffect(()=>{
    if (term){
      setFormData({
        year:term.year.toString(), 
        semester:term.semester
      })
    } else{
      setFormData({
        year:'',
        semester: ''
      })
    }
  }, [term])

  const handleChange =(e)=>{
    const {name,value } = e.target
    setFormData({
      ...formData, 
      [name]: value 
    })
  }

  const handleSubmit = async(e)=>{
    e.preventDefault() 
    setError('')
    setLoading(true)

    try{
      if (term){
        await updateTerm(term.id, formData)
        alert('Term updated successfully!')
      } else{
        await createTerm(formData)
        alert('Term created successfully!')
      }
      onClose()
    } catch (err) {
      setError(err.message ||err.data?.error ||'Failed to save term')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {term ? 'Edit Term' : 'Create New Term'}
        </h2>

        {/* Show error message if any */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Year input field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max="3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2024"
            />
          </div>

          {/* Semester input field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <input
              type="text"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Fall, Spring, Summer"
            />
          </div>

          {/* Buttons */}
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
              {loading ? 'Saving...' : term ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TermForm

