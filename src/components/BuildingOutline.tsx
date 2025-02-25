import React from 'react';

interface BuildingOutlineProps {
  startHeight: number;
  endHeight?: number;
  maxHeight: number;
}

const BuildingOutline: React.FC<BuildingOutlineProps> = ({ 
  startHeight, 
  endHeight, 
  maxHeight 
}) => {
  const startHeightPercentage = (startHeight / maxHeight) * 100;
  const endHeightPercentage = endHeight !== undefined 
    ? (endHeight / maxHeight) * 100 
    : startHeightPercentage;

  return (
    <div 
      className="absolute bottom-[28px] border-[#FFC107] border-4 z-10"
      style={{ 
        clipPath: `polygon(
          0% ${100 - startHeightPercentage - 4}%, 
          0% 100%, 
          100% 100%, 
          100% ${100 - endHeightPercentage - 4}%
        )`,
        width: 'calc(100% + 8px)',
        height: '100px',
        left: '-4px'
      }}
    />
  );
};

export default BuildingOutline;