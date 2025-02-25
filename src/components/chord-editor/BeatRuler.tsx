import React from 'react';

interface BeatRulerProps {
  timeSignature: '4/4' | '3/4';
  totalBeats: number;
}

const BeatRuler: React.FC<BeatRulerProps> = ({ timeSignature, totalBeats }) => {
  const beatsPerBar = timeSignature === '4/4' ? 4 : 3;
  const numBars = Math.ceil(totalBeats / beatsPerBar);
  
  return (
    <div className="flex h-6 border-b border-[#1F1F1F]">
      {Array.from({ length: numBars }).map((_, barIndex) => (
        <div 
          key={`bar-${barIndex}`}
          className="flex"
          style={{ width: `${(beatsPerBar / totalBeats) * 100}%` }}
        >
          {Array.from({ length: beatsPerBar }).map((_, beatIndex) => (
            <div
              key={`beat-${barIndex}-${beatIndex}`}
              className={`
                flex-1 border-l border-[#1F1F1F] first:border-l-0
                ${beatIndex === 0 ? 'border-l-2' : ''}
              `}
            >
              <div className="text-[10px] text-secondary pl-1">
                {beatIndex + 1}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BeatRuler;