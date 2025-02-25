import React, { useState, useCallback, useEffect } from 'react';
import { parseArrangementXML } from '../utils/xmlParser';
import ArrangementVisualizer from './ArrangementVisualizer';
import ChordEditor from './ChordEditor';
import { VALID_GENRES, VALID_LENGTHS, GENRE_TYPE_MAPPINGS } from '../types';
import type { User } from '@supabase/supabase-js';

interface ArrangementContainerProps {
  user: User | null;
  showAuth: () => void;
  showColors: boolean;
}

const ArrangementContainer: React.FC<ArrangementContainerProps> = ({
  user,
  showAuth,
  showColors
}) => {
  const [xmlInput, setXmlInput] = useState('');
  const [arrangement, setArrangement] = useState<ReturnType<typeof parseArrangementXML> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBlockBars, setSelectedBlockBars] = useState<number>(0);
  const [selectedBlockName, setSelectedBlockName] = useState<string>('');
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    category: string;
    subgenre: string;
  } | null>(null);
  const [blockData, setBlockData] = useState<Record<number, {
    chords: string[];
    template?: {
      category: string;
      subgenre: string;
    };
    isEdited?: boolean;
  }>>({});
  const [selectedKey, setSelectedKey] = useState<string>('C');

  const validateArrangement = (arr: ReturnType<typeof parseArrangementXML>) => {
    if (arr.Blocks.length > 32) {
      throw new Error('Instructions');
    }

    if (!VALID_GENRES.includes(arr.Genre.replace(/\./g, '/') as any)) {
      throw new Error('Instructions');
    }

    const typeNames = Object.keys(arr.Types);
    for (const type of typeNames) {
      const length = arr.Types[type].Length;
      if (!VALID_LENGTHS.includes(length as any)) {
        throw new Error('Instructions');
      }
    }
  };

  const handleXMLInput = useCallback((content: string) => {
    try {
      const parsed = parseArrangementXML(content);
      validateArrangement(parsed);
      setXmlInput(content);
      setArrangement(parsed);
      setError(null);
      setBlockData({});
      
      if (parsed.Blocks.length > 0) {
        const firstBlock = parsed.Blocks[0];
        const numBars = parsed.Types[firstBlock.Type]?.Length || 0;
        const genreMapping = GENRE_TYPE_MAPPINGS[parsed.Genre.replace(/\./g, '/')] || GENRE_TYPE_MAPPINGS['Pop/Rock/Disco'];
        const displayName = genreMapping[firstBlock.Type] || firstBlock.Type;
        
        setSelectedBlockIndex(0);
        setSelectedBlockBars(numBars);
        setSelectedBlockName(displayName);

        if (selectedTemplate) {
          handleTemplateSelect(selectedTemplate.category, selectedTemplate.subgenre, true);
        }
      }
    } catch (err) {
      setError('Instructions');
      setArrangement(null);
    }
  }, [selectedTemplate]);

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

  const handleBlockSelect = useCallback((blockIndex: number | null, numBars: number) => {
    if (!user) {
      showAuth();
      return;
    }
    
    if (blockIndex === null && arrangement && arrangement.Blocks.length > 0) {
      const firstBlock = arrangement.Blocks[0];
      const firstBlockBars = arrangement.Types[firstBlock.Type]?.Length || 0;
      const genreMapping = GENRE_TYPE_MAPPINGS[arrangement.Genre.replace(/\./g, '/')] || GENRE_TYPE_MAPPINGS['Pop/Rock/Disco'];
      const displayName = genreMapping[firstBlock.Type] || firstBlock.Type;
      
      setSelectedBlockIndex(0);
      setSelectedBlockBars(firstBlockBars);
      setSelectedBlockName(displayName);
      return;
    }
    
    setSelectedBlockBars(blockIndex === null ? 0 : numBars);
    setSelectedBlockIndex(blockIndex);
    if (blockIndex !== null && arrangement) {
      const block = arrangement.Blocks[blockIndex];
      const genreMapping = GENRE_TYPE_MAPPINGS[arrangement.Genre.replace(/\./g, '/')] || GENRE_TYPE_MAPPINGS['Pop/Rock/Disco'];
      const displayName = genreMapping[block.Type] || block.Type;
      setSelectedBlockName(displayName);
    } else {
      setSelectedBlockName('');
    }
  }, [arrangement, user, showAuth]);

  const getBlockChords = useCallback((blockIndex: number | null) => {
    if (blockIndex === null) return null;
    return blockData[blockIndex]?.chords || null;
  }, [blockData]);

  const handleChordsChange = useCallback((newChords: string[]) => {
    if (selectedBlockIndex === null) return;
    
    setBlockData(prev => ({
      ...prev,
      [selectedBlockIndex]: {
        ...prev[selectedBlockIndex],
        chords: newChords,
        isEdited: true
      }
    }));
  }, [selectedBlockIndex]);

  const handleTemplateSelect = useCallback((category: string, subgenre: string, applyToAll: boolean = false) => {
    if (!user) {
      showAuth();
      return;
    }

    setSelectedTemplate({ category, subgenre });
    
    if (arrangement) {
      if (applyToAll) {
        const newBlockData: Record<number, typeof blockData[number]> = {};
        arrangement.Blocks.forEach((block, index) => {
          const numBars = arrangement.Types[block.Type]?.Length || 0;
          const progressions = getProgressions(category, subgenre, block.Type);
          
          if (progressions.length > 0) {
            const progression = progressions[0].progression;
            if (progression.length > 0) {
              const chords = generateChords(progression, numBars, mode);
              newBlockData[index] = {
                chords,
                template: { category, subgenre },
                isEdited: false
              };
            }
          }
        });
        setBlockData(newBlockData);
      } else if (selectedBlockIndex !== null) {
        const blockType = arrangement.Blocks[selectedBlockIndex].Type;
        const progressions = getProgressions(category, subgenre, blockType);
        
        if (progressions.length > 0) {
          const progression = progressions[0].progression;
          if (progression.length > 0) {
            const chords = generateChords(progression, selectedBlockBars, mode);
            setBlockData(prev => ({
              ...prev,
              [selectedBlockIndex]: {
                chords,
                template: { category, subgenre },
                isEdited: false
              }
            }));
          }
        }
      }
    }
  }, [selectedBlockIndex, selectedBlockBars, user, arrangement, showAuth]);

  const getTemplateName = useCallback((blockIndex: number | null) => {
    if (blockIndex === null) return '';
    const blockTemplate = blockData[blockIndex]?.template;
    if (!blockTemplate) return '';
    return `${blockTemplate.category} - ${blockTemplate.subgenre}`;
  }, [blockData]);

  return (
    <div 
      className={`
        surface-secondary p-4 lg:p-6 ${isDragging ? 'ring-2 ring-[#03A9F4] bg-[#1F1F1F]' : ''}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      {!arrangement && !error && (
        <div className="absolute inset-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-secondary mb-2">Drop your XML file here or paste your XML content</p>
            <p className="text-sm text-disabled">Supports .xml files or direct XML content</p>
          </div>
        </div>
      )}

      {arrangement && (
        <div className="relative">
          <button
            onClick={() => {
              setArrangement(null);
              setXmlInput('');
              setError('Instructions');
            }}
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
            />
          </div>
          {user && (
            <ChordEditor 
              numBars={selectedBlockBars} 
              selectedBlockName={selectedBlockName}
              chords={getBlockChords(selectedBlockIndex)}
              onChordsChange={handleChordsChange}
              templateName={getTemplateName(selectedBlockIndex)}
              isEdited={selectedBlockIndex !== null ? blockData[selectedBlockIndex]?.isEdited : false}
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
          <div className="p-4 surface-tertiary text-secondary rounded">
            <ol className="list-decimal list-inside space-y-2">
              <li>Open ArrangerKing in you DAW</li>
              <li>Click the ArrangerKing Logo, Select "XML Copy"</li>
              <li>Come back to here and press Ctrl + V (Windows) or Cmd+V (OsX)</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArrangementContainer;