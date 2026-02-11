"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { ChevronDown, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  getLanguages,
  getVoices,
  getPrompts,
  getModels,
  requestUploadUrl,
  uploadFileToSignedUrl,
  registerAttachment,
  createAgent,
  updateAgent,
  startCall,
} from "@/lib/api";
import { useFetch } from "@/hooks/use-fetch";
import { agentSchema } from "@/validation/agent-schema";
import { testCallSchema } from "@/validation/test-call-schema";
import { BasicSettingsSection } from "@/components/agents/basic-settings-section";
import { TestCallCard } from "@/components/agents/test-call-card";
import type { languages } from "@/interface/languages";
import type { voices } from "@/interface/voices";
import type { prompts } from "@/interface/prompts";
import type { models } from "@/interface/models";

type UploadStatus = "uploading" | "success" | "error";

interface UploadedFile {
  name: string;
  size: number;
  file: File;
  status: UploadStatus;
  progress: number;
  attachmentId?: string;
  errorMessage?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">
                    {badge} required
                  </Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export interface AgentFormInitialData {
  id?: string;
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
  attachments?: string[];
  tools?: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}

export function AgentForm({ mode, initialData }: AgentFormProps) {
  // Form state — initialized from initialData when provided
  const [agentId, setAgentId] = useState<string | undefined>(initialData?.id);
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);
  const [description, setDescription] = useState(initialData?.description ?? "");

  // Call Script
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState(initialData?.serviceDescription ?? "");
  const {
    data: languagesList,
    loading: languagesLoading,
    error: languagesError,
  } = useFetch<languages[]>(getLanguages, []);
  const {
    data: voicesList,
    loading: voicesLoading,
    error: voicesError,
  } = useFetch<voices[]>(getVoices, []);
  const {
    data: promptsList,
    loading: promptsLoading,
    error: promptsError,
  } = useFetch<prompts[]>(getPrompts, []);
  const {
    data: modelsList,
    loading: modelsLoading,
    error: modelsError,
  } = useFetch<models[]>(getModels, []);

  // Reference Data
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Call
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");

  const [allowHangUp, setAllowHangUp] = useState(initialData?.tools?.allowHangUp ?? false);
  const [allowCallback, setAllowCallback] = useState(initialData?.tools?.allowCallback ?? false);
  const [liveTransfer, setLiveTransfer] = useState(initialData?.tools?.liveTransfer ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  // Badge counts for required fields
  const basicSettingsMissing = [agentName, callType, language, voice, prompt, model].filter(
    (v) => !v
  ).length;

  // File upload handlers
  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const acceptedFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (ACCEPTED_TYPES.includes(ext)) {
          acceptedFiles.push(file);
        }
      }

      if (acceptedFiles.length === 0) return;

      setUploadedFiles((prev) => [
        ...prev,
        ...acceptedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          file,
          status: "uploading" as UploadStatus,
          progress: 0,
        })),
      ]);

      for (const file of acceptedFiles) {
        try {
          const { key, signedUrl } = await requestUploadUrl();

          await uploadFileToSignedUrl(signedUrl, file, (progress) => {
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.file === file
                  ? {
                      ...f,
                      status: "uploading",
                      progress,
                    }
                  : f
              )
            );
          });

          const attachment = await registerAttachment({
            key,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || "application/octet-stream",
          });

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: "success",
                    progress: 100,
                    attachmentId: attachment.id,
                  }
                : f
            )
          );
        } catch (error) {
          console.error("File upload failed", error);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: "error",
                    errorMessage: "Upload failed",
                  }
                : f
            )
          );
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleSave = useCallback(async () => {
    try {
      const attachments = uploadedFiles
        .filter((f) => f.status === "success" && f.attachmentId !== undefined)
        .map((f) => String(f.attachmentId));

      const payload = {
        name: agentName,
        description: description ?? "",
        callType,
        language,
        voice,
        prompt,
        model,
        latency: latency[0],
        speed: speed[0],
        callScript: callScript ?? "",
        serviceDescription: serviceDescription ?? "",
        attachments,
        tools: {
          allowHangUp,
          allowCallback,
          liveTransfer,
        },
      };

      const validation = agentSchema.safeParse(payload);
      if (!validation.success) {
        console.log(validation.error.issues);
        const firstIssue = validation.error.issues[0];
        toast.error(firstIssue?.message ?? "Please fix the highlighted errors.");
        return;
      }

      setIsSaving(true);

      let response;
      if (agentId) {
        response = await updateAgent(agentId, payload);
      } else {
        response = await createAgent(payload);
        if (response?.id) {
          setAgentId(response.id);
        }
      }

      toast.success("Agent saved successfully");

      if (mode === "create") {
        setAgentId(undefined);
        setAgentName("");
        setDescription("");
        setCallType("");
        setLanguage("");
        setVoice("");
        setPrompt("");
        setModel("");
        setLatency([0.5]);
        setSpeed([110]);
        setCallScript("");
        setServiceDescription("");
        setUploadedFiles([]);
        setAllowHangUp(false);
        setAllowCallback(false);
        setLiveTransfer(false);
        setTestFirstName("");
        setTestLastName("");
        setTestGender("");
        setTestPhone("");
        setCallStatus(null);
      }

      return response;
    } catch (error) {
      console.error("Failed to save agent", error);
      toast.error("Failed to save agent");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [
    mode,
    agentId,
    agentName,
    callType,
    language,
    voice,
    prompt,
    model,
    latency,
    speed,
    callScript,
    serviceDescription,
    description,
    uploadedFiles,
    allowHangUp,
    allowCallback,
    liveTransfer,
  ]);

  const handleTestCall = useCallback(async () => {
    try {
      const validation = testCallSchema.safeParse({
        firstName: testFirstName.trim(),
        lastName: testLastName.trim(),
        gender: testGender || undefined,
        phoneNumber: testPhone.trim(),
      });

      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        toast.error(firstIssue?.message ?? "Please fix the test call details.");
        return;
      }

      setIsCalling(true);
      setCallStatus(null);

      const savedAgent = await handleSave();
      const idToUse = savedAgent?.id ?? agentId;

      if (!idToUse) {
        toast.error("Unable to start test call: agent ID is missing.");
        return;
      }

      const response = await startCall(idToUse, {
        firstName: testFirstName,
        lastName: testLastName,
        gender: testGender,
        phoneNumber: testPhone,
      });

      const status =
        (response && (response.status || response.callStatus)) ?? "initiated";
      setCallStatus(status);
      toast.success("Test call started");
    } catch (error) {
      console.error("Failed to start test call", error);

      toast.error("Failed to start test call");
    } finally {
      setIsCalling(false);
    }
  }, [agentId, handleSave, testFirstName, testLastName, testGender, testPhone]);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : saveLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Collapsible Sections */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Settings */}
          <CollapsibleSection
            title="Basic Settings"
            description="Add some information about your agent to get started."
            badge={basicSettingsMissing}
            defaultOpen
          >
            <BasicSettingsSection
              agentName={agentName}
              description={description}
              callType={callType}
              language={language}
              voice={voice}
              prompt={prompt}
              model={model}
              latency={latency}
              speed={speed}
              onAgentNameChange={setAgentName}
              onDescriptionChange={setDescription}
              onCallTypeChange={setCallType}
              onLanguageChange={setLanguage}
              onVoiceChange={setVoice}
              onPromptChange={setPrompt}
              onModelChange={setModel}
              onLatencyChange={setLatency}
              onSpeedChange={setSpeed}
              languagesList={languagesList}
              languagesLoading={languagesLoading}
              languagesError={languagesError}
              voicesList={voicesList}
              voicesLoading={voicesLoading}
              voicesError={voicesError}
              promptsList={promptsList}
              promptsLoading={promptsLoading}
              promptsError={promptsError}
              modelsList={modelsList}
              modelsLoading={modelsLoading}
              modelsError={modelsError}
            />
          </CollapsibleSection>

          {/* Section 2: Call Script */}
          <CollapsibleSection
            title="Call Script"
            description="What would you like the AI agent to say during the call?"
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Write your call script here..."
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {callScript.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 4: Service/Product Description */}
          <CollapsibleSection
            title="Service/Product Description"
            description="Add a knowledge base about your service or product."
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your service or product..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {serviceDescription.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 5: Reference Data */}
          <CollapsibleSection
            title="Reference Data"
            description="Enhance your agent's knowledge base with uploaded files."
          >
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
                </p>
              </div>

              {/* File list */}
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(f.size)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {f.status === "uploading" && (
                          <span className="text-xs text-muted-foreground">
                            Uploading{f.progress ? ` ${f.progress}%` : "..."}
                          </span>
                        )}
                        {f.status === "success" && (
                          <Badge variant="outline" className="text-xs">
                            Uploaded
                          </Badge>
                        )}
                        {f.status === "error" && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFile(i)}
                      >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">No Files Available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 6: Tools */}
          <CollapsibleSection
            title="Tools"
            description="Tools that allow the AI agent to perform call-handling actions and manage session control."
          >
            <FieldGroup className="w-full">
              <FieldLabel htmlFor="switch-hangup">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow hang up</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to hang up the call
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-hangup"
                    checked={allowHangUp}
                    onCheckedChange={setAllowHangUp}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-callback">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow callback</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to make callbacks
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-callback"
                    checked={allowCallback}
                    onCheckedChange={setAllowCallback}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-transfer">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Live transfer</FieldTitle>
                    <FieldDescription>
                      Select if you want to transfer the call to a human agent
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-transfer"
                    checked={liveTransfer}
                    onCheckedChange={setLiveTransfer}
                  />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </CollapsibleSection>

        </div>

        {/* Right Column — Sticky Test Call Card */}
        <TestCallCard
          testFirstName={testFirstName}
          testLastName={testLastName}
          testGender={testGender}
          testPhone={testPhone}
          onFirstNameChange={setTestFirstName}
          onLastNameChange={setTestLastName}
          onGenderChange={setTestGender}
          onPhoneChange={setTestPhone}
          onStartTestCall={handleTestCall}
          isCalling={isCalling}
          isSaving={isSaving}
          callStatus={callStatus}
        />
      </div>

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
