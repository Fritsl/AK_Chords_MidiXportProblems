import React from 'react';

interface XMLDropZoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

const XMLDropZone: React.FC<XMLDropZoneProps> = ({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
  children
}) => {
  return (
    <div 
      className={`
        surface-secondary p-4 lg:p-6 ${isDragging ? 'ring-2 ring-[#03A9F4] bg-[#1F1F1F]' : ''}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
    >
      {children}
    </div>
  );
};

export default XMLDropZone;