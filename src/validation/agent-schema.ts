import { z } from "zod";

export const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  description: z.string().optional(),
  callType: z.string().min(1, "Call type is required"),
  language: z.string().min(1, "Language is required"),
  voice: z.string().min(1, "Voice is required"),
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  latency: z.number().min(0.3).max(1),
  speed: z.number().min(90).max(130),
  callScript: z.string().optional(),
  serviceDescription: z.string().optional(),
  attachments: z.array(z.string()),
  tools: z.object({
    allowHangUp: z.boolean(),
    allowCallback: z.boolean(),
    liveTransfer: z.boolean(),
  }),
});

export type AgentSchema = z.infer<typeof agentSchema>;

