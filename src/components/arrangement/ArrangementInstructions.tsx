import React from 'react';

const ArrangementInstructions: React.FC = () => {
  return (
    <div className="p-4 surface-tertiary text-secondary rounded">
      <ol className="list-decimal list-inside space-y-2">
        <li>Open ArrangerKing in you DAW</li>
        <li>Click the ArrangerKing Logo, Select "XML Copy"</li>
        <li>Come back to here and press Ctrl + V (Windows) or Cmd+V (OsX)</li>
      </ol>
    </div>
  );
};

export default ArrangementInstructions;