import {apiClient} from './client'

export const getAllPrograms=async()=>{
  const response =await apiClient.get('/api/program', {auth:true })
  return Array.isArray(response)? response:[]
}

export const getProgramById=async(id)=>{
  const response =await apiClient.get(`/api/program/${id}`,{auth:true})
  return response
}

export const createProgram=async(programData)=>{
  const response =await apiClient.post('/api/program/create', programData, {auth:true})
  return response
}

