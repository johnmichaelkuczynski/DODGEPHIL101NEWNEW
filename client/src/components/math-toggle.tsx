import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface MathToggleProps {
  mathMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function MathToggle({ mathMode, onToggle }: MathToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-card/50 border border-border rounded-lg px-3 py-2">
      <Calculator className="w-4 h-4 text-muted-foreground" />
      <Label htmlFor="math-mode" className="text-sm font-medium cursor-pointer">
        Math Perfection Mode
      </Label>
      <Switch
        id="math-mode"
        checked={mathMode}
        onCheckedChange={onToggle}
        className="ml-2"
      />
    </div>
  );
}