import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api",
});


export const getLanguages = async () => {
  const response = await apiClient.get("/languages");
  return response.data;
};

// Get all voices
export const getVoices = async () => {
  const response = await apiClient.get("/voices");
  return response.data;
};

// Get all prompts
export const getPrompts = async () => {
  const response = await apiClient.get("/prompts");
  return response.data;
};

// Get all models
export const getModels = async () => {
  const response = await apiClient.get("/models");
  return response.data;
};

// Save a new agent
export const saveAgent = async (data: unknown) => {
  const response = await apiClient.post("/models", data);
  return response.data;
};

// Start a test call for an agent
export const startCall = async (id: string) => {
  const response = await apiClient.post(`/agents/${id}/test-call`);
  return response.data;
};
