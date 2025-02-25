import React, { useState, useEffect, useMemo } from 'react';
import { Download } from 'lucide-react';
import { generateMidiFile, downloadMidi } from '../../utils/midiExport';
import { synth } from '../../utils/synth';
import ChordHeader from './ChordHeader';
import RhythmPatternEditor from './RhythmPatternEditor';

interface ChordEditorProps {
  selectedBlockName?: string;
  selectedKey?: string;
  selectedCategory?: string;
  selectedSubgenre?: string;
  blockType?: string;
  timeSignature?: string;
  numBars?: number;
}

const ChordEditor: React.FC<ChordEditorProps> = ({ 
  selectedBlockName, 
  selectedKey = 'C',
  selectedCategory,
  selectedSubgenre,
  blockType,
  timeSignature = '4/4',
  numBars = 0
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [pattern, setPattern] = useState<('on' | 'off')[]>([]);
  const [dividers, setDividers] = useState<boolean[]>([]);

  // Calculate total beats based on time signature and number of bars
  const totalBeats = useMemo(() => {
    const [beatsPerBar] = timeSignature.split('/').map(Number);
    return numBars * beatsPerBar;
  }, [timeSignature, numBars]);

  const handleExportMidi = async () => {
    if (!pattern || pattern.length === 0) {
      console.error('No pattern data available');
      return;
    }
    
    setIsExporting(true);
    try {
      console.log('Generating MIDI with:', {
        pattern,
        timeSignature,
        blockName: selectedBlockName,
        dividers
      });
      
      const midiData = generateMidiFile(
        pattern,
        timeSignature,
        120,
        selectedBlockName || 'Unknown',
        dividers
      );
      
      if (!midiData) {
        throw new Error('No MIDI data generated');
      }
      
      const fileName = `${selectedBlockName || 'block'}_rhythm.mid`;
      await downloadMidi(fileName, midiData);
    } catch (error) {
      console.error('Failed to export MIDI:', error);
      // You might want to show this error to the user
      alert('Failed to export MIDI file. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePatternChange = (newPattern: ('on' | 'off')[], newDividers: boolean[]) => {
    setPattern(newPattern);
    setDividers(newDividers);
  };

  if (!selectedBlockName) {
    return (
      <div className="w-full p-4 surface-secondary">
        <div className="text-center text-secondary py-8">
          Select a block in the arrangement to edit its rhythm pattern
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 surface-secondary">
      <ChordHeader
        selectedBlockName={selectedBlockName}
        templateName={`${selectedCategory} - ${selectedSubgenre}`}
        isEdited={false}
        showAllChords={false}
        onToggleShowAllChords={() => {}}
        onExportMidi={handleExportMidi}
        isExporting={isExporting}
        hasChords={pattern.some(state => state === 'on')}
      />
      
      <div className="mt-4 text-center text-secondary">
        {/* Beat calculation display */}
        <div className="mt-4 p-4 bg-[#1F1F1F] rounded">
          <p className="text-sm text-[#B0B0B0] mb-2">Total beats in selected part:</p>
          <div className="text-lg font-mono">
            {selectedBlockName}: {numBars} bars × {timeSignature.split('/')[0]} beats per bar = {totalBeats} beats
          </div>
        </div>

        {/* Rhythm Pattern Editor */}
        <RhythmPatternEditor 
          totalBeats={totalBeats} 
          timeSignature={timeSignature}
          blockName={selectedBlockName}
          onPatternChange={handlePatternChange}
        />
      </div>
    </div>
  );
};

export default ChordEditor;