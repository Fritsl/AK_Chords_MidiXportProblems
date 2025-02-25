import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { metronome } from '../utils/metronomeService';

interface BPMInputProps {
  value: number;
  onChange: (bpm: number) => void;
}

const BPMInput: React.FC<BPMInputProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value.toFixed(2));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value.toFixed(2));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed) && parsed >= 20 && parsed <= 300) {
      onChange(parseFloat(parsed.toFixed(2)));
      metronome.updateBPM(parsed);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartValue(value);
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = dragStartY - e.clientY;
      const newValue = dragStartValue + (deltaY * 0.1);
      const clampedValue = Math.min(300, Math.max(20, newValue));
      const finalValue = parseFloat(clampedValue.toFixed(2));
      onChange(finalValue);
      metronome.updateBPM(finalValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, dragStartValue, onChange]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newValue = value + delta;
    const clampedValue = Math.min(300, Math.max(20, newValue));
    const finalValue = parseFloat(clampedValue.toFixed(2));
    onChange(finalValue);
    metronome.updateBPM(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = value + 0.1;
      const clampedValue = Math.min(300, newValue);
      const finalValue = parseFloat(clampedValue.toFixed(2));
      onChange(finalValue);
      metronome.updateBPM(finalValue);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = value - 0.1;
      const clampedValue = Math.max(20, newValue);
      const finalValue = parseFloat(clampedValue.toFixed(2));
      onChange(finalValue);
      metronome.updateBPM(finalValue);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(localValue);
    if (isNaN(parsed) || parsed < 20 || parsed > 300) {
      setLocalValue(value.toFixed(2));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-[80px] px-3 py-1.5 surface-tertiary text-[#E0E0E0] font-medium text-right hover:bg-[#1F1F1F] transition-colors focus:outline-none focus:bg-[#1F1F1F]"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#808080] text-sm">
          BPM
        </div>
      </div>
      <div className="flex flex-col">
        <button 
          className="h-[11px] px-1 surface-tertiary hover:bg-[#1F1F1F] transition-colors border-b border-[#1F1F1F] flex items-center justify-center"
          onClick={() => {
            const newValue = parseFloat((value + 0.1).toFixed(2));
            onChange(newValue);
            metronome.updateBPM(newValue);
          }}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button 
          className="h-[11px] px-1 surface-tertiary hover:bg-[#1F1F1F] transition-colors flex items-center justify-center"
          onClick={() => {
            const newValue = parseFloat((value - 0.1).toFixed(2));
            onChange(newValue);
            metronome.updateBPM(newValue);
          }}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default BPMInput;