import { AttachmentResponse, RegisterAttachmentPayload, SignedUploadUrlResponse } from "@/interface/agentFormValues";
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


export const requestUploadUrl = async (): Promise<SignedUploadUrlResponse> => {
  const response = await apiClient.post("/attachments/upload-url");
  return response.data;
};

export const uploadFileToSignedUrl = async (
  signedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  await axios.put(signedUrl, file, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      const progress = Math.round((event.loaded * 100) / event.total);
      onProgress(progress);
    },
  });
};

export const registerAttachment = async (
  payload: RegisterAttachmentPayload
): Promise<AttachmentResponse> => {
  const response = await apiClient.post("/attachments", payload);
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
