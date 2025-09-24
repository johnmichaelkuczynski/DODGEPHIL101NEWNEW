import { useState, useRef, useEffect } from "react";
import { X, Keyboard, Move, Minus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogicKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSymbolInsert: (symbol: string) => void;
}

// NO HARDCODED SYMBOLS - GENERATE DYNAMICALLY IF NEEDED

export default function LogicKeyboard({ isOpen, onClose, onSymbolInsert }: LogicKeyboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("basic");
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 480, height: 320 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  
  const keyboardRef = useRef<HTMLDivElement>(null);

  // NO HARDCODED SYMBOLS ALLOWED
  const basicSymbols: any[] = [];
  const advancedSymbols: any[] = [];
  const greekSymbols: any[] = [];

  const getSymbolsByCategory = () => {
    switch (selectedCategory) {
      case "basic": return basicSymbols;
      case "advanced": return advancedSymbols;
      case "greek": return greekSymbols;
      default: return basicSymbols;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto">
      {/* Backdrop to prevent interaction with elements behind */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div 
        ref={keyboardRef}
        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: isMinimized ? 40 : size.height,
          minWidth: 320,
          minHeight: isMinimized ? 40 : 240,
        }}
      >
        {/* Header with drag handle and controls */}
        <div 
          className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Logic Symbols</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Square className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={onClose}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-3 overflow-y-auto" style={{ height: size.height - 40 }}>
            {/* Category Tabs */}
            <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setSelectedCategory("basic")}
            className={`pb-2 px-4 font-medium ${
              selectedCategory === "basic"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Basic Logic
          </button>
          <button
            onClick={() => setSelectedCategory("advanced")}
            className={`pb-2 px-4 font-medium ${
              selectedCategory === "advanced"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setSelectedCategory("greek")}
            className={`pb-2 px-4 font-medium ${
              selectedCategory === "greek"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Greek Letters
          </button>
        </div>

        {/* Symbol Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {getSymbolsByCategory().map((item, index) => (
            <div key={index} className="text-center">
              <button
                onClick={() => {
                  onSymbolInsert(item.symbol);
                  onClose();
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-blue-600">
                  {item.symbol}
                </div>
                <div className="text-xs text-gray-600 group-hover:text-blue-700">
                  {item.name}
                </div>
              </button>
              <div className="text-xs text-gray-500 mt-1 px-1 truncate" title={item.description}>
                {item.description}
                {item.shortcuts.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {item.shortcuts.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Input Methods:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-2">Method 1: Click symbols above</h4>
              <ul className="space-y-1">
                <li>• Click any symbol to insert it</li>
                <li>• Organized by category</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Method 2: Type shortcuts</h4>
              <ul className="space-y-1">
                <li>• <code>{"->"}</code> becomes →</li>
                <li>• <code>{"<->"}</code> becomes ↔</li>
                <li>• <code>^</code> or <code>&amp;</code> becomes ∧</li>
                <li>• <code>v</code> or <code>|</code> becomes ∨</li>
                <li>• <code>~</code> or <code>!</code> becomes ¬</li>
                <li>• <code>forall</code> becomes ∀</li>
                <li>• <code>exists</code> becomes ∃</li>
                <li>• <code>{"!="}</code> becomes ≠</li>
              </ul>
            </div>
          </div>
            </div>
          </div>
        )}

        {/* Resize handle */}
        <div 
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-gray-400 hover:bg-gray-600"
          style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
        />
      </div>
    </div>
  );
}