import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Settings as SettingsIcon, ChevronUp, ChevronDown, RotateCw, Play, Pause } from 'lucide-react';
import GenreMatrix from './GenreMatrix';
import Settings from './Settings';
import { getGenreCategories } from '../data/genres';
import { metronome } from '../utils/metronomeService';

interface FooterProps {
  showColors: boolean;
  onShowColorsChange: (show: boolean) => void;
  onTemplateSelect: (category: string, subgenre: string, applyToAll?: boolean) => void;
  mode: 'repeat' | 'stretch';
  onModeChange: (mode: 'repeat' | 'stretch') => void;
  bpm?: number;
  timeSignature?: string;
  sixteenthNotes?: number;
}

const Footer: React.FC<FooterProps> = ({ 
  showColors, 
  onShowColorsChange, 
  onTemplateSelect,
  mode,
  onModeChange,
  bpm = 120,
  timeSignature = '4/4',
  sixteenthNotes = 0
}) => {
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedSubgenre, setSelectedSubgenre] = useState<string>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const templates = useMemo(() => {
    const categories = getGenreCategories();
    const allTemplates = [];
    
    Object.entries(categories).forEach(([category, subgenres]) => {
      subgenres.forEach(subgenre => {
        allTemplates.push({
          category,
          subgenre,
          display: `${category} - ${subgenre}`
        });
      });
    });
    
    return allTemplates;
  }, []);

  // Load first template on mount
  useEffect(() => {
    if (!isInitialized && templates.length > 0) {
      const firstTemplate = templates[0];
      setSelectedTemplate(firstTemplate.display);
      setSelectedCategory(firstTemplate.category);
      setSelectedSubgenre(firstTemplate.subgenre);
      onTemplateSelect(firstTemplate.category, firstTemplate.subgenre, true);
      setIsInitialized(true);
    }
  }, [templates, isInitialized, onTemplateSelect]);

  const currentTemplateIndex = useMemo(() => {
    if (!selectedTemplate) return -1;
    return templates.findIndex(t => t.display === selectedTemplate);
  }, [selectedTemplate, templates]);

  const cycleTemplate = useCallback((direction: 'up' | 'down') => {
    if (currentTemplateIndex === -1) return;

    let newIndex: number;
    if (direction === 'up') {
      newIndex = currentTemplateIndex === 0 ? templates.length - 1 : currentTemplateIndex - 1;
    } else {
      newIndex = currentTemplateIndex === templates.length - 1 ? 0 : currentTemplateIndex + 1;
    }

    const newTemplate = templates[newIndex];
    setSelectedTemplate(newTemplate.display);
    setSelectedCategory(newTemplate.category);
    setSelectedSubgenre(newTemplate.subgenre);
    onTemplateSelect(newTemplate.category, newTemplate.subgenre, true);
  }, [currentTemplateIndex, templates, onTemplateSelect]);

  const handleTemplateSelect = (template: string, category: string, subgenre: string) => {
    setSelectedTemplate(template);
    setSelectedCategory(category);
    setSelectedSubgenre(subgenre);
    setIsMatrixOpen(false);
    onTemplateSelect(category, subgenre, true);
  };

  const handleModeChange = () => {
    const newMode = mode === 'repeat' ? 'stretch' : 'repeat';
    onModeChange(newMode);
    
    if (selectedCategory && selectedSubgenre) {
      setTimeout(() => {
        onTemplateSelect(selectedCategory, selectedSubgenre, true);
      }, 0);
    }
  };

  const handleRefresh = () => {
    if (selectedCategory && selectedSubgenre) {
      onTemplateSelect(selectedCategory, selectedSubgenre, true);
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      metronome.stop();
      setIsPlaying(false);
    } else {
      metronome.start(bpm, timeSignature, sixteenthNotes);
      setIsPlaying(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm">
        <div className="p-8 flex justify-center">
          <div className="flex items-center gap-4">
            <button
              className="p-2 text-secondary hover:text-[#E0E0E0] transition-colors"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayToggle}
              className={`h-[42px] px-4 flex items-center gap-2 transition-colors ${
                isPlaying 
                  ? 'bg-[#4CAF50] text-white hover:bg-[#66BB6A]' 
                  : 'bg-[#2A2A2A] text-secondary hover:bg-[#1F1F1F] hover:text-[#E0E0E0]'
              }`}
              title={isPlaying ? 'Stop' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex h-[42px]">
              <button
                className="btn-primary font-medium px-3 border-r border-[#1F1F1F]"
                onClick={handleRefresh}
                title="Refresh template"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button 
                className="btn-primary font-medium w-[160px] truncate text-center"
                onClick={() => setIsMatrixOpen(true)}
              >
                {selectedSubgenre || 'Template'}
              </button>
              <div className="flex flex-col ml-px">
                <button 
                  className="h-[21px] px-2 bg-[#2A2A2A] hover:bg-[#1F1F1F] transition-colors border-b border-[#1F1F1F] flex items-center justify-center"
                  onClick={() => cycleTemplate('up')}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                  className="h-[21px] px-2 bg-[#2A2A2A] hover:bg-[#1F1F1F] transition-colors flex items-center justify-center"
                  onClick={() => cycleTemplate('down')}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleModeChange}
              className="h-[42px] px-4 bg-[#2A2A2A] text-secondary hover:bg-[#1F1F1F] hover:text-[#E0E0E0] transition-colors"
            >
              {mode === 'repeat' ? 'Stretch' : 'Repeat'}
            </button>
          </div>
        </div>
      </div>
      <GenreMatrix 
        isOpen={isMatrixOpen} 
        onClose={() => setIsMatrixOpen(false)}
        onSelect={handleTemplateSelect}
        selectedCategory={selectedCategory}
        selectedSubgenre={selectedSubgenre}
      />
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showColors={showColors}
        onShowColorsChange={onShowColorsChange}
      />
    </>
  );
};

export default Footer;