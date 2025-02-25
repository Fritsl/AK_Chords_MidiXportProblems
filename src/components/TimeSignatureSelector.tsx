import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimeSignatureSelectorProps {
  value?: string;
  onChange?: (timeSignature: string) => void;
}

const TIME_SIGNATURES = [
  '4/4',
  '3/4',
  '2/4',
  '6/8',
  '12/8',
  '5/4',
  '7/8',
  '9/8'
];

const TimeSignatureSelector: React.FC<TimeSignatureSelectorProps> = ({ 
  value = '4/4',
  onChange = () => {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignatureClick = (signature: string) => {
    onChange(signature);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 surface-tertiary text-[#E0E0E0] px-3 py-1.5 min-w-[80px] justify-between hover:bg-[#1F1F1F] transition-colors"
      >
        <span className="font-medium">{value}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 surface-tertiary z-50 min-w-[120px]">
            <div className="p-1">
              {TIME_SIGNATURES.map((signature) => (
                <button
                  key={signature}
                  onClick={() => handleSignatureClick(signature)}
                  className={`
                    w-full text-left px-3 py-2 text-sm transition-colors
                    ${value === signature 
                      ? 'bg-[#03A9F4] text-white' 
                      : 'text-secondary hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
                    }
                  `}
                >
                  {signature}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeSignatureSelector;