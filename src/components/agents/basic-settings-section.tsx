import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { languages } from "@/interface/languages";
import type { voices } from "@/interface/voices";
import type { prompts } from "@/interface/prompts";
import type { models } from "@/interface/models";

interface BasicSettingsSectionProps {
  agentName: string;
  description: string;
  callType: string;
  language: string;
  voice: string;
  prompt: string;
  model: string;
  latency: number[];
  speed: number[];
  onAgentNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCallTypeChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onVoiceChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onLatencyChange: (value: number[]) => void;
  onSpeedChange: (value: number[]) => void;
  languagesList: languages[] | null;
  languagesLoading: boolean;
  languagesError: Error | null;
  voicesList: voices[] | null;
  voicesLoading: boolean;
  voicesError: Error | null;
  promptsList: prompts[] | null;
  promptsLoading: boolean;
  promptsError: Error | null;
  modelsList: models[] | null;
  modelsLoading: boolean;
  modelsError: Error | null;
}

export function BasicSettingsSection({
  agentName,
  description,
  callType,
  language,
  voice,
  prompt,
  model,
  latency,
  speed,
  onAgentNameChange,
  onDescriptionChange,
  onCallTypeChange,
  onLanguageChange,
  onVoiceChange,
  onPromptChange,
  onModelChange,
  onLatencyChange,
  onSpeedChange,
  languagesList,
  languagesLoading,
  languagesError,
  voicesList,
  voicesLoading,
  voicesError,
  promptsList,
  promptsLoading,
  promptsError,
  modelsList,
  modelsLoading,
  modelsError,
}: BasicSettingsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="agent-name">
          Agent Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="agent-name"
          placeholder="e.g. Sales Assistant"
          value={agentName}
          onChange={(e) => onAgentNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Describe what this agent does..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>
          Call Type <span className="text-destructive">*</span>
        </Label>
        <Select value={callType} onValueChange={onCallTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select call type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbound">Inbound (Receive Calls)</SelectItem>
            <SelectItem value="outbound">Outbound (Make Calls)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          Language <span className="text-destructive">*</span>
        </Label>
        {languagesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : languagesError ? (
          <p className="text-xs text-destructive">
            Failed to load languages. something went wrong.
          </p>
        ) : (
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languagesList &&
                languagesList.map((lang) => (
                  <SelectItem key={lang.id} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Voice <span className="text-destructive">*</span>
        </Label>
        {voicesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : voicesError ? (
          <p className="text-xs text-destructive">
            Failed to load voices. something went wrong.
          </p>
        ) : (
          <Select value={voice} onValueChange={onVoiceChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              {voicesList &&
                voicesList.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="flex items-center justify-between gap-2">
                      <span>{v.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {v.tag}
                      </Badge>
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Prompt <span className="text-destructive">*</span>
        </Label>
        {promptsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : promptsError ? (
          <p className="text-xs text-destructive">
            Failed to load prompts. something went wrong.
          </p>
        ) : (
          <Select value={prompt} onValueChange={onPromptChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select prompt" />
            </SelectTrigger>
            <SelectContent>
              {promptsList &&
                promptsList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex flex-col">
                      <span>{p.name}</span>
                      {p.description && (
                        <span className="text-xs text-muted-foreground">
                          {p.description}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>
          Model <span className="text-destructive">*</span>
        </Label>
        {modelsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ) : modelsError ? (
          <p className="text-xs text-destructive">
            Failed to load models. something went wrong.
          </p>
        ) : (
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {modelsList &&
                modelsList.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    <span className="flex flex-col">
                      <span>{m.name}</span>
                      {m.description && (
                        <span className="text-xs text-muted-foreground">
                          {m.description}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Latency ({latency[0].toFixed(1)}s)</Label>
          <Slider
            value={latency}
            onValueChange={onLatencyChange}
            min={0.3}
            max={1}
            step={0.1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.3s</span>
            <span>1.0s</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Speed ({speed[0]}%)</Label>
          <Slider
            value={speed}
            onValueChange={onSpeedChange}
            min={90}
            max={130}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>90%</span>
            <span>130%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

