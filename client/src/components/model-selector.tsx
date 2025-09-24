import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AIModel } from "@shared/schema";

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

const modelOptions = [
  { value: "deepseek", label: "ZHI 1" },
  { value: "openai", label: "ZHI 2" },
  { value: "anthropic", label: "ZHI 3" },
] as const;

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label className="text-sm font-medium text-muted-foreground font-inter">
        AI Model:
      </Label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {modelOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
