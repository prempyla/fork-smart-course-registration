import {apiClient} from './client'

export const getAllDepartments =async()=>{
  const response =await apiClient.get('/api/department',{ auth: true })
  return Array.isArray(response) ? response : []
}

export const getDepartmentById =async(id)=> {
  const response =await apiClient.get(`/api/department/${id}`,{auth:true })
  return response
}

export const createDepartment =async(departmentData)=>{
  const response =await apiClient.post('/api/department/create', departmentData, {auth:true })
  return response
}

