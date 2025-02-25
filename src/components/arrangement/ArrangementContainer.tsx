import React, { useState, useCallback } from 'react';
import { GENRE_TYPE_MAPPINGS } from '../../types';
import { useXMLParser } from '../../hooks/useXMLParser';
import ArrangementVisualizer from '../ArrangementVisualizer';
import ChordEditor from '../chord-editor/ChordEditor';
import XMLDropZone from './XMLDropZone';
import ArrangementInstructions from './ArrangementInstructions';
import type { User } from '@supabase/supabase-js';

interface ArrangementContainerProps {
  user: User | null;
  showAuth: () => void;
  showColors: boolean;
  mode: 'repeat' | 'stretch';
  selectedTemplate: {
    category: string;
    subgenre: string;
  } | null;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  timeSignature: string;
  onTimeSignatureChange: (timeSignature: string) => void;
}

const DEFAULT_ARRANGEMENT = `<?xml version="1.0" encoding="UTF-8"?>
<Arrangement Version="125" Genre="Pop/Rock/Disco" Name="Default" UserName=""
             BPM="120">
  <Blocks>
    <Block Type="I" Name="Intro" HeightL="2" HeightR="3"/>
    <Block Type="A" Name="Verse 1" HeightL="3" HeightR="3"/>
    <Block Type="A" Name="Verse 2" HeightL="3" HeightR="3"/>
    <Block Type="R" Name="Bridge" HeightL="4" HeightR="4"/>
    <Block Type="P" Name="Pre-Chorus 1" HeightL="6" HeightR="7"/>
    <Block Type="B" Name="Chorus 1" HeightL="7" HeightR="7"/>
    <Block Type="A" Name="Verse 3" HeightL="3" HeightR="3"/>
    <Block Type="P" Name="Pre-Chorus 2" HeightL="6" HeightR="7"/>
    <Block Type="B" Name="Chorus 2" HeightL="7" HeightR="7"/>
    <Block Type="C" Name="Solo-Break" HeightL="5" HeightR="5"/>
    <Block Type="S" Name="Air" HeightL="2" HeightR="2"/>
    <Block Type="B" Name="Chorus 3" HeightL="7" HeightR="7"/>
    <Block Type="B" Name="Chorus 4" HeightL="7" HeightR="7"/>
    <Block Type="O" Name="Outro/Fade Out" HeightL="3" HeightR="2"/>
  </Blocks>
  <Types>
    <A Length="8"/>
    <B Length="8"/>
    <C Length="16"/>
    <R Length="8"/>
    <P Length="4"/>
    <I Length="8"/>
    <O Length="8"/>
    <S Length="4"/>
  </Types>
</Arrangement>`;

const ArrangementContainer: React.FC<ArrangementContainerProps> = ({
  user,
  showAuth,
  showColors,
  mode,
  selectedTemplate,
  bpm,
  onBpmChange,
  timeSignature,
  onTimeSignatureChange
}) => {
  const {
    arrangement,
    error,
    handleXMLInput,
    resetXML
  } = useXMLParser(onBpmChange);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedBlockName, setSelectedBlockName] = useState<string>('');
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string>('C');

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleXMLInput(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  }, [handleXMLInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const content = e.clipboardData.getData('text');
    if (content) {
      handleXMLInput(content);
    }
  }, [handleXMLInput]);

  const handleBlockSelect = useCallback((blockIndex: number | null) => {
    if (!user) {
      showAuth();
      return;
    }
    
    if (blockIndex === null && arrangement && arrangement.Blocks.length > 0) {
      const firstBlock = arrangement.Blocks[0];
      const genreMapping = GENRE_TYPE_MAPPINGS[arrangement.Genre.replace(/\./g, '/')] || GENRE_TYPE_MAPPINGS['Pop/Rock/Disco'];
      const displayName = genreMapping[firstBlock.Type] || firstBlock.Type;
      
      setSelectedBlockIndex(0);
      setSelectedBlockName(displayName);
      setSelectedBlockType(firstBlock.Type);
      return;
    }
    
    setSelectedBlockIndex(blockIndex);
    if (blockIndex !== null && arrangement) {
      const block = arrangement.Blocks[blockIndex];
      const genreMapping = GENRE_TYPE_MAPPINGS[arrangement.Genre.replace(/\./g, '/')] || GENRE_TYPE_MAPPINGS['Pop/Rock/Disco'];
      const displayName = genreMapping[block.Type] || block.Type;
      setSelectedBlockName(displayName);
      setSelectedBlockType(block.Type);
    } else {
      setSelectedBlockName('');
      setSelectedBlockType('');
    }
  }, [arrangement, user, showAuth]);

  const selectedBlockBars = selectedBlockIndex !== null && arrangement
    ? arrangement.Types[arrangement.Blocks[selectedBlockIndex].Type]?.Length || 0
    : 0;

  return (
    <XMLDropZone
      isDragging={isDragging}
      onDragOver={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      {!arrangement && !error && (
        <div className="absolute inset-6 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <p className="text-secondary mb-2">Drop your XML file here or paste your XML content</p>
            <p className="text-sm text-disabled">Supports .xml files or direct XML content</p>
          </div>
          <button
            onClick={() => handleXMLInput(DEFAULT_ARRANGEMENT)}
            className="btn-secondary"
          >
            Load Default Template
          </button>
        </div>
      )}

      {arrangement && (
        <div className="relative">
          <button
            onClick={resetXML}
            className="absolute -top-3 -right-3 surface-tertiary hover:bg-[#1F1F1F] rounded p-1.5 text-secondary transition-colors"
            title="How to use"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="surface-secondary p-4 lg:p-6 mb-4">
            <ArrangementVisualizer 
              arrangement={arrangement} 
              showColors={showColors} 
              onBlockSelect={handleBlockSelect}
              selectedKey={selectedKey}
              onKeyChange={setSelectedKey}
              selectedBlockIndex={selectedBlockIndex}
              timeSignature={timeSignature}
              onTimeSignatureChange={onTimeSignatureChange}
              bpm={bpm}
              onBPMChange={onBpmChange}
            />
          </div>
          {user && (
            <ChordEditor 
              selectedBlockName={selectedBlockName}
              selectedKey={selectedKey}
              selectedCategory={selectedTemplate?.category}
              selectedSubgenre={selectedTemplate?.subgenre}
              blockType={selectedBlockType}
              timeSignature={timeSignature}
              numBars={selectedBlockBars}
            />
          )}
          {!user && arrangement && (
            <div className="p-4 surface-tertiary text-center">
              <p className="text-secondary mb-2">Sign in to edit chord progressions and export MIDI</p>
              <button
                onClick={showAuth}
                className="btn-primary"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center surface-secondary">
          <ArrangementInstructions />
        </div>
      )}
    </XMLDropZone>
  );
};

export default ArrangementContainer;