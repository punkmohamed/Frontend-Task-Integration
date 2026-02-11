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