import React from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';

interface ChordHeaderProps {
  selectedBlockName: string;
  templateName?: string;
  isEdited?: boolean;
  showAllChords: boolean;
  onToggleShowAllChords: () => void;
  onExportMidi: () => void;
  isExporting: boolean;
  hasChords: boolean;
}

const ChordHeader: React.FC<ChordHeaderProps> = ({
  selectedBlockName,
  templateName,
  isEdited,
  onExportMidi,
  isExporting,
  hasChords
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        {selectedBlockName && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleShowAllChords}
              className="flex items-center gap-2 text-secondary hover:text-[#E0E0E0] transition-colors"
              title={showAllChords ? 'Show only used chords' : 'Show all chords'}
            >
              {showAllChords ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
        {selectedBlockName && (
          <div className="flex items-center gap-2">
            <div className="text-lg font-medium">
              {selectedBlockName}
              {templateName && (
                <span className="text-secondary ml-2">
                  ({templateName}{isEdited && <span className="text-[#FFC107] ml-1">Edited</span>})
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasChords && (
          <button
            onClick={onExportMidi}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export MIDI'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChordHeader;