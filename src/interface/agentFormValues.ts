export interface AgentFormValues {
    agentName: string;
    description: string;
    callType: string;
    language: string;
    voice: string;
    prompt: string;
    model: string;
    latency: number;
    speed: number;
    callScript: string;
    serviceDescription: string;
  }

export  interface UploadedFile {
    name: string;
    size: number;
    file: File;
  }

  export interface SignedUploadUrlResponse {
    key: string;
    signedUrl: string;
    expiresIn: number;
  }
  
  export interface RegisterAttachmentPayload {
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }
  
  export interface AttachmentResponse extends RegisterAttachmentPayload {
    id: string;
  }
  