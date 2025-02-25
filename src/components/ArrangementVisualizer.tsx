import React from 'react';
import { Arrangement, Block, GENRE_TYPE_MAPPINGS, BLOCK_TYPE_MAPPINGS } from '../types';
import KeySelector from './KeySelector';
import TimeSignatureSelector from './TimeSignatureSelector';
import BPMInput from './BPMInput';
import BuildingOutline from './BuildingOutline';

interface Props {
  arrangement: Arrangement;
  showColors: boolean;
  onBlockSelect?: (blockIndex: number | null) => void;
  selectedKey?: string;
  onKeyChange?: (key: string) => void;
  selectedBlockIndex?: number | null;
  timeSignature: string;
  onTimeSignatureChange: (timeSignature: string) => void;
  bpm: number;
  onBPMChange: (bpm: number) => void;
}

const BUILDING_COLORS: Record<string, string> = {
  'A': 'bg-[#b8d94f]',
  'B': 'bg-[#6de454]',
  'C': 'bg-[#4fe4aa]',
  'R': 'bg-[#4fb8e4]',
  'P': 'bg-[#7154e4]',
  'I': 'bg-[#d454e4]',
  'O': 'bg-[#e4548c]',
  'S': 'bg-[#e49b54]'
};

const ArrangementVisualizer: React.FC<Props> = ({ 
  arrangement, 
  showColors, 
  onBlockSelect,
  selectedKey = 'C',
  onKeyChange = () => {},
  selectedBlockIndex = null,
  timeSignature,
  onTimeSignatureChange,
  bpm,
  onBPMChange
}) => {
  const maxHeight = 8;
  const gapSize = 2;
  
  const getDisplayName = (type: string) => {
    const genreMapping = GENRE_TYPE_MAPPINGS[arrangement.Genre.replace(/\./g, '/')] || GENRE_TYPE_MAPPINGS['Pop/Rock/Disco'];
    return genreMapping[type] || BLOCK_TYPE_MAPPINGS[type] || type;
  };
  
  // Calculate total bars for width calculation only
  const totalBars = arrangement.Blocks.reduce((acc, block) => {
    return acc + (arrangement.Types[block.Type]?.Length || 0);
  }, 0);

  // Calculate building positions for display
  const buildingData = arrangement.Blocks.reduce((acc, block, index) => {
    const previousPosition = index === 0 ? 0 : acc[index - 1].endPosition;
    const width = arrangement.Types[block.Type]?.Length || 0;
    const widthPrecise = parseFloat((width / totalBars * 100).toFixed(6));
    const startPosition = previousPosition;
    const endPosition = parseFloat((startPosition + widthPrecise).toFixed(6));
    
    acc[index] = {
      width: widthPrecise,
      startPosition,
      endPosition
    };
    
    return acc;
  }, [] as Array<{
    width: number;
    startPosition: number;
    endPosition: number;
  }>);

  const handleBlockClick = (index: number) => {
    onBlockSelect?.(index);
  };
  
  return (
    <div 
      className="w-full p-4"
      style={{
        background: 'linear-gradient(180deg, rgb(14, 42, 71) 0%, rgb(41, 128, 185) 55%, rgb(223, 237, 245) 100%)'
      }}
    >
      <div className="mb-2 flex justify-between items-center text-white">
        <div>
          <h2 className="text-lg font-bold text-shadow">{arrangement.Name || 'Untitled Arrangement'}</h2>
          <p className="text-xs opacity-75 text-shadow">
            Genre: {arrangement.Genre.replace(/\./g, '/')}
          </p>
        </div>
        <div className="relative z-50 flex items-center gap-2">
          <TimeSignatureSelector 
            value={timeSignature} 
            onChange={onTimeSignatureChange}
          />
          <BPMInput 
            value={bpm} 
            onChange={onBPMChange}
          />
          <KeySelector 
            value={selectedKey} 
            onChange={onKeyChange} 
          />
        </div>
      </div>
      
      <div className="relative h-[130px] w-full mx-auto">
        <div className="flex absolute bottom-0 left-0 right-0">
          {arrangement.Blocks.map((building, index) => {
            const colorClass = showColors 
              ? BUILDING_COLORS[building.Type as keyof typeof BUILDING_COLORS]
              : 'bg-white';
            const buildingInfo = buildingData[index];
            const displayName = building.Name || getDisplayName(building.Type);
            const isSelected = selectedBlockIndex === index;
            const barCount = arrangement.Types[building.Type]?.Length || 0;
            
            return (
              <div
                key={index}
                className="relative group cursor-pointer"
                style={{ 
                  width: `calc(${buildingInfo.width}% - ${gapSize}px)`,
                  marginRight: `${gapSize}px`
                }}
                onClick={() => handleBlockClick(index)}
              >
                {isSelected && (
                  <BuildingOutline 
                    startHeight={building.HeightL}
                    endHeight={building.HeightR}
                    maxHeight={maxHeight}
                  />
                )}
                <div 
                  className={`absolute bottom-[28px] ${colorClass} transition-all duration-150`}
                  style={{ 
                    clipPath: `polygon(
                      0% ${100 - (building.HeightL / maxHeight) * 100}%, 
                      0% 100%, 
                      100% 100%, 
                      100% ${100 - (building.HeightR / maxHeight) * 100}%
                    )`,
                    width: '100%',
                    height: '100px'
                  }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-white text-[10px] sm:text-xs whitespace-nowrap text-shadow">
                    {barCount}
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-7 bg-[#e67e22] bg-opacity-90 text-white text-[10px] sm:text-xs px-0.5 transition-colors
                  ${isSelected ? 'bg-[#FFC107]' : 'group-hover:bg-[#03A9F4]'}`}>
                  <div className="font-medium leading-tight truncate" title={displayName}>
                    {displayName}
                  </div>
                  <div className="text-[8px] sm:text-[10px] leading-tight truncate text-center">
                    {barCount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArrangementVisualizer;