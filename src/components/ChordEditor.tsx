import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Download, Eye, EyeOff } from 'lucide-react';
import { generateMidiFile, downloadMidi } from '../utils/midiExport';
import { synth } from '../utils/synth';

interface ChordEditorProps {
  numBars?: number;
  selectedBlockName?: string;
  chords?: string[] | null;
  onChordsChange?: (chords: string[]) => void;
  templateName?: string;
  isEdited?: boolean;
}

// Define the fixed set of available chords
const AVAILABLE_CHORDS = [
  // Basic triads
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII',
  'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii',
  
  // Diminished triads
  'i°', 'ii°', 'iii°', 'iv°', 'v°', 'vi°', 'vii°',
  'I°', 'II°', 'III°', 'IV°', 'V°', 'VI°', 'VII°',
  'idim', 'iidim', 'iiidim', 'ivdim', 'vdim', 'vidim', 'viidim',
  'Idim', 'IIdim', 'IIIdim', 'IVdim', 'Vdim', 'VIdim', 'VIIdim',
  
  // Augmented triads
  'I+', 'II+', 'III+', 'IV+', 'V+', 'VI+', 'VII+',
  'i+', 'ii+', 'iii+', 'iv+', 'v+', 'vi+', 'vii+',
  'Iaug', 'IIaug', 'IIIaug', 'IVaug', 'Vaug', 'VIaug', 'VIIaug',
  
  // Suspended chords
  'Isus2', 'IIsus2', 'IIIsus2', 'IVsus2', 'Vsus2', 'VIsus2', 'VIIsus2',
  'Isus4', 'IIsus4', 'IIIsus4', 'IVsus4', 'Vsus4', 'VIsus4', 'VIIsus4',
  'Isus', 'IIsus', 'IIIsus', 'IVsus', 'Vsus', 'VIsus', 'VIIsus',
  
  // Seventh chords
  'I7', 'II7', 'III7', 'IV7', 'V7', 'VI7', 'VII7',
  'i7', 'ii7', 'iii7', 'iv7', 'v7', 'vi7', 'vii7',
  'Idom7', 'IIdom7', 'IIIdom7', 'IVdom7', 'Vdom7', 'VIdom7', 'VIIdom7',
  'Idom', 'IIdom', 'IIIdom', 'IVdom', 'Vdom', 'VIdom', 'VIIdom',
  
  // Major seventh chords
  'Imaj7', 'IImaj7', 'IIImaj7', 'IVmaj7', 'Vmaj7', 'VImaj7', 'VIImaj7',
  'IM7', 'IIM7', 'IIIM7', 'IVM7', 'VM7', 'VIM7', 'VIIM7',
  'IΔ', 'IIΔ', 'IIIΔ', 'IVΔ', 'VΔ', 'VIΔ', 'VIIΔ',
  'IΔ7', 'IIΔ7', 'IIIΔ7', 'IVΔ7', 'VΔ7', 'VIΔ7', 'VIIΔ7',
  
  // Minor seventh flat five
  'im7b5', 'iim7b5', 'iiim7b5', 'ivm7b5', 'vm7b5', 'vim7b5', 'viim7b5',
  'iø', 'iiø', 'iiiø', 'ivø', 'vø', 'viø', 'viiø',
  'iø7', 'iiø7', 'iiiø7', 'ivø7', 'vø7', 'viø7', 'viiø7',
  
  // Diminished seventh chords
  'i°7', 'ii°7', 'iii°7', 'iv°7', 'v°7', 'vi°7', 'vii°7',
  'idim7', 'iidim7', 'iiidim7', 'ivdim7', 'vdim7', 'vidim7', 'viidim7',
  
  // Ninth chords
  'I9', 'II9', 'III9', 'IV9', 'V9', 'VI9', 'VII9',
  'i9', 'ii9', 'iii9', 'iv9', 'v9', 'vi9', 'vii9',
  'Imaj9', 'IImaj9', 'IIImaj9', 'IVmaj9', 'Vmaj9', 'VImaj9', 'VIImaj9',
  
  // Eleventh chords
  'I11', 'II11', 'III11', 'IV11', 'V11', 'VI11', 'VII11',
  'i11', 'ii11', 'iii11', 'iv11', 'v11', 'vi11', 'vii11',
  'Imaj11', 'IImaj11', 'IIImaj11', 'IVmaj11', 'Vmaj11', 'VImaj11', 'VIImaj11',
  
  // Thirteenth chords
  'I13', 'II13', 'III13', 'IV13', 'V13', 'VI13', 'VII13',
  'i13', 'ii13', 'iii13', 'iv13', 'v13', 'vi13', 'vii13',
  'Imaj13', 'IImaj13', 'IIImaj13', 'IVmaj13', 'Vmaj13', 'VImaj13', 'VIImaj13',
  
  // Add chords
  'Iadd9', 'IIadd9', 'IIIadd9', 'IVadd9', 'Vadd9', 'VIadd9', 'VIIadd9',
  'Iadd11', 'IIadd11', 'IIIadd11', 'IVadd11', 'Vadd11', 'VIadd11', 'VIIadd11',
  'Iadd13', 'IIadd13', 'IIIadd13', 'IVadd13', 'Vadd13', 'VIadd13', 'VIIadd13',
  
  // Sixth chords
  'I6', 'II6', 'III6', 'IV6', 'V6', 'VI6', 'VII6',
  'i6', 'ii6', 'iii6', 'iv6', 'v6', 'vi6', 'vii6',
  'I6/9', 'II6/9', 'III6/9', 'IV6/9', 'V6/9', 'VI6/9', 'VII6/9',
  'I69', 'II69', 'III69', 'IV69', 'V69', 'VI69', 'VII69',
  
  // Altered dominant chords
  'I7b5', 'II7b5', 'III7b5', 'IV7b5', 'V7b5', 'VI7b5', 'VII7b5',
  'I7#5', 'II7#5', 'III7#5', 'IV7#5', 'V7#5', 'VI7#5', 'VII7#5',
  'I7b9', 'II7b9', 'III7b9', 'IV7b9', 'V7b9', 'VI7b9', 'VII7b9',
  'I7#9', 'II7#9', 'III7#9', 'IV7#9', 'V7#9', 'VI7#9', 'VII7#9',
  'I7#11', 'II7#11', 'III7#11', 'IV7#11', 'V7#11', 'VI7#11', 'VII7#11',
  'I7b13', 'II7b13', 'III7b13', 'IV7b13', 'V7b13', 'VI7b13', 'VII7b13',
  'I7alt', 'II7alt', 'III7alt', 'IV7alt', 'V7alt', 'VI7alt', 'VII7alt'
];

// Default chord progression for new blocks
const DEFAULT_PROGRESSION = ['I', 'IV', 'V', 'I'];

// Music theory color mappings
const CHORD_COLORS: Record<string, string> = {
  // Basic triads (Major)
  'I': '#FF0000',    // Red - Tonic
  'II': '#FF7F00',   // Orange - Supertonic
  'III': '#FFFF00',  // Yellow - Mediant
  'IV': '#00FF00',   // Green - Subdominant
  'V': '#0000FF',    // Blue - Dominant
  'VI': '#4B0082',   // Indigo - Submediant
  'VII': '#8B00FF',  // Violet - Leading tone

  // Basic triads (Minor)
  'i': '#800000',    // Dark Red
  'ii': '#7F3F00',   // Dark Orange
  'iii': '#7F7F00',  // Dark Yellow
  'iv': '#008000',   // Dark Green
  'v': '#000080',    // Dark Blue
  'vi': '#2B0048',   // Dark Indigo
  'vii': '#4B0082',  // Dark Violet

  // Diminished triads
  'i°': '#4D0000',   // Very Dark Red
  'ii°': '#4D2600',  // Very Dark Orange
  'iii°': '#4D4D00', // Very Dark Yellow
  'iv°': '#004D00',  // Very Dark Green
  'v°': '#00004D',   // Very Dark Blue
  'vi°': '#1A002B',  // Very Dark Indigo
  'vii°': '#2B004D', // Very Dark Violet

  // Same colors for 'dim' notation
  'idim': '#4D0000',
  'iidim': '#4D2600',
  'iiidim': '#4D4D00',
  'ivdim': '#004D00',
  'vdim': '#00004D',
  'vidim': '#1A002B',
  'viidim': '#2B004D',

  // Augmented triads
  'I+': '#FF6666',   // Light Red
  'II+': '#FFB366',  // Light Orange
  'III+': '#FFFF66', // Light Yellow
  'IV+': '#66FF66',  // Light Green
  'V+': '#6666FF',   // Light Blue
  'VI+': '#B366FF',  // Light Indigo
  'VII+': '#FF66B3', // Light Violet

  // Same colors for 'aug' notation
  'Iaug': '#FF6666',
  'IIaug': '#FFB366',
  'IIIaug': '#FFFF66',
  'IVaug': '#66FF66',
  'Vaug': '#6666FF',
  'VIaug': '#B366FF',
  'VIIaug': '#FF66B3',

  // Suspended chords
  'Isus2': '#FFE6E6',
  'IIsus2': '#FFE6CC',
  'IIIsus2': '#FFFFE6',
  'IVsus2': '#E6FFE6',
  'Vsus2': '#E6E6FF',
  'VIsus2': '#F2E6FF',
  'VIIsus2': '#FFE6F2',

  'Isus4': '#FFD9D9',
  'IIsus4': '#FFD9BF',
  'IIIsus4': '#FFFFD9',
  'IVsus4': '#D9FFD9',
  'Vsus4': '#D9D9FF',
  'VIsus4': '#E6D9FF',
  'VIIsus4': '#FFD9E6',

  // Same colors for 'sus' notation (defaults to sus4)
  'Isus': '#FFD9D9',
  'IIsus': '#FFD9BF',
  'IIIsus': '#FFFFD9',
  'IVsus': '#D9FFD9',
  'Vsus': '#D9D9FF',
  'VIsus': '#E6D9FF',
  'VIIsus': '#FFD9E6',

  // Seventh chords
  'I7': '#FF8080',   // Bright Red
  'II7': '#FFA680',  // Bright Orange
  'III7': '#FFFF80', // Bright Yellow
  'IV7': '#80FF80',  // Bright Green
  'V7': '#8080FF',   // Bright Blue
  'VI7': '#A680FF',  // Bright Indigo
  'VII7': '#FF80A6', // Bright Violet

  // Minor seventh chords
  'i7': '#CC9999',   // Muted Red
  'ii7': '#CC9F66',  // Muted Orange
  'iii7': '#CCCC99', // Muted Yellow
  'iv7': '#99CC99',  // Muted Green
  'v7': '#9999CC',   // Muted Blue
  'vi7': '#B399CC',  // Muted Indigo
  'vii7': '#CC99B3', // Muted Violet

  // Major seventh chords
  'Imaj7': '#FF9999',
  'IImaj7': '#FFB899',
  'IIImaj7': '#FFFF99',
  'IVmaj7': '#99FF99',
  'Vmaj7': '#9999FF',
  'VImaj7': '#B899FF',
  'VIImaj7': '#FF99B8',

  // Same colors for alternative major seventh notations
  'IM7': '#FF9999',
  'IIM7': '#FFB899',
  'IIIM7': '#FFFF99',
  'IVM7': '#99FF99',
  'VM7': '#9999FF',
  'VIM7': '#B899FF',
  'VIIM7': '#FF99B8',

  'IΔ': '#FF9999',
  'IIΔ': '#FFB899',
  'IIIΔ': '#FFFF99',
  'IVΔ': '#99FF99',
  'VΔ': '#9999FF',
  'VIΔ': '#B899FF',
  'VIIΔ': '#FF99B8',

  'IΔ7': '#FF9999',
  'IIΔ7': '#FFB899',
  'IIIΔ7': '#FFFF99',
  'IVΔ7': '#99FF99',
  'VΔ7': '#9999FF',
  'VIΔ7': '#B899FF',
  'VIIΔ7': '#FF99B8',

  // Minor seventh flat five
  'im7b5': '#B37272',
  'iim7b5': '#B38872',
  'iiim7b5': '#B3B372',
  'ivm7b5': '#72B372',
  'vm7b5': '#7272B3',
  'vim7b5': '#8872B3',
  'viim7b5': '#B37288',

  // Same colors for half-diminished notation
  'iø': '#B37272',
  'iiø': '#B38872',
  'iiiø': '#B3B372',
  'ivø': '#72B372',
  'vø': '#7272B3',
  'viø': '#8872B3',
  'viiø': '#B37288',

  'iø7': '#B37272',
  'iiø7': '#B38872',
  'iiiø7': '#B3B372',
  'ivø7': '#72B372',
  'vø7': '#7272B3',
  'viø7': '#8872B3',
  'viiø7': '#B37288',

  // Diminished seventh chords
  'i°7': '#994D4D',
  'ii°7': '#996633',
  'iii°7': '#999933',
  'iv°7': '#4D994D',
  'v°7': '#4D4D99',
  'vi°7': '#664D99',
  'vii°7': '#994D66',

  // Same colors for dim7 notation
  'idim7': '#994D4D',
  'iidim7': '#996633',
  'iiidim7': '#999933',
  'ivdim7': '#4D994D',
  'vdim7': '#4D4D99',
  'vidim7': '#664D99',
  'viidim7': '#994D66',

  // Ninth chords
  'I9': '#FFB3B3',
  'II9': '#FFD9B3',
  'III9': '#FFFFB3',
  'IV9': '#B3FFB3',
  'V9': '#B3B3FF',
  'VI9': '#D9B3FF',
  'VII9': '#FFB3E6',

  // Minor ninth chords
  'i9': '#E6CCCC',
  'ii9': '#E6D5CC',
  'iii9': '#E6E6CC',
  'iv9': '#CCE6CC',
  'v9': '#CCCCE6',
  'vi9': '#D5CCE6',
  'vii9': '#E6CCE0',

  // Major ninth chords
  'Imaj9': '#FFCCCC',
  'IImaj9': '#FFE6CC',
  'IIImaj9': '#FFFFCC',
  'IVmaj9': '#CCFFCC',
  'Vmaj9': '#CCCCFF',
  'VImaj9': '#E6CCFF',
  'VIImaj9': '#FFCCE6',

  // Eleventh chords
  'I11': '#FFD9D9',
  'II11': '#FFEAD9',
  'III11': '#FFFFD9',
  'IV11': '#D9FFD9',
  'V11': '#D9D9FF',
  'VI11': '#EAD9FF',
  'VII11': '#FFD9EA',

  // Minor eleventh chords
  'i11': '#E6D9D9',
  'ii11': '#E6E0D9',
  'iii11': '#E6E6D9',
  'iv11': '#D9E6D9',
  'v11': '#D9D9E6',
  'vi11': '#E0D9E6',
  'vii11': '#E6D9E0',

  // Major eleventh chords
  'Imaj11': '#FFE6E6',
  'IImaj11': '#FFF0E6',
  'IIImaj11': '#FFFFE6',
  'IVmaj11': '#E6FFE6',
  'Vmaj11': '#E6E6FF',
  'VImaj11': '#F0E6FF',
  'VIImaj11': '#FFE6F0',

  // Thirteenth chords
  'I13': '#FFE6E6',
  'II13': '#FFF0E6',
  'III13': '#FFFFE6',
  'IV13': '#E6FFE6',
  'V13': '#E6E6FF',
  'VI13': '#F0E6FF',
  'VII13': '#FFE6F0',

  // Minor thirteenth chords
  'i13': '#F2E6E6',
  'ii13': '#F2ECE6',
  'iii13': '#F2F2E6',
  'iv13': '#E6F2E6',
  'v13': '#E6E6F2',
  'vi13': '#ECE6F2',
  'vii13': '#F2E6EC',

  // Major thirteenth chords
  'Imaj13': '#FFF2F2',
  'IImaj13': '#FFF7F2',
  'IIImaj13': '#FFFFF2',
  'IVmaj13': '#F2FFF2',
  'Vmaj13': '#F2F2FF',
  'VImaj13': '#F7F2FF',
  'VIImaj13': '#FFF2F7',

  // Add chords
  'Iadd9': '#FFE6E6',
  'IIadd9': '#FFF0E6',
  'IIIadd9': '#FFFFE6',
  'IVadd9': '#E6FFE6',
  'Vadd9': '#E6E6FF',
  'VIadd9': '#F0E6FF',
  'VIIadd9': '#FFE6F0',

  'Iadd11': '#FFE6E6',
  'IIadd11': '#FFF0E6',
  'IIIadd11': '#FFFFE6',
  'IVadd11': '#E6FFE6',
  'Vadd11': '#E6E6FF',
  'VIadd11': '#F0E6FF',
  'VIIadd11': '#FFE6F0',

  'Iadd13': '#FFE6E6',
  'IIadd13': '#FFF0E6',
  'IIIadd13': '#FFFFE6',
  'IVadd13': '#E6FFE6',
  'Vadd13': '#E6E6FF',
  'VIadd13': '#F0E6FF',
  'VIIadd13': '#FFE6F0',

  // Sixth chords
  'I6': '#FFD9D9',
  'II6': '#FFE6D9',
  'III6': '#FFFFD9',
  'IV6': '#D9FFD9',
  'V6': '#D9D9FF',
  'VI6': '#E6D9FF',
  'VII6': '#FFD9E6',

  // Minor sixth chords
  'i6': '#E6D9D9',
  'ii6': '#E6E0D9',
  'iii6': '#E6E6D9',
  'iv6': '#D9E6D9',
  'v6': '#D9D9E6',
  'vi6': '#E0D9E6',
  'vii6': '#E6D9E0',

  // 6/9 chords
  'I6/9': '#FFE6E6',
  'II6/9': '#FFF0E6',
  'III6/9': '#FFFFE6',
  'IV6/9': '#E6FFE6',
  'V6/9': '#E6E6FF',
  'VI6/9': '#F0E6FF',
  'VII6/9': '#FFE6F0',

  // Same colors for 69 notation
  'I69': '#FFE6E6',
  'II69': '#FFF0E6',
  'III69': '#FFFFE6',
  'IV69': '#E6FFE6',
  'V69': '#E6E6FF',
  'VI69': '#F0E6FF',
  'VII69': '#FFE6F0',

  // Altered dominant chords
  'I7b5': '#FF9999',
  'II7b5': '#FFB899',
  'III7b5': '#FFFF99',
  'IV7b5': '#99FF99',
  'V7b5': '#9999FF',
  'VI7b5': '#B899FF',
  'VII7b5': '#FF99B8',

  'I7#5': '#FF8080',
  'II7#5': '#FFA680',
  'III7#5': '#FFFF80',
  'IV7#5': '#80FF80',
  'V7#5': '#8080FF',
  'VI7#5': '#A680FF',
  'VII7#5': '#FF80A6',

  'I7b9': '#FFB3B3',
  'II7b9': '#FFD9B3',
  'III7b9': '#FFFFB3',
  'IV7b9': '#B3FFB3',
  'V7b9': '#B3B3FF',
  'VI7b9': '#D9B3FF',
  'VII7b9': '#FFB3E6',

  'I7#9': '#FF9999',
  'II7#9': '#FFB899',
  'III7#9': '#FFFF99',
  'IV7#9': '#99FF99',
  'V7#9': '#9999FF',
  'VI7#9': '#B899FF',
  'VII7#9': '#FF99B8',

  'I7#11': '#FFB3B3',
  'II7#11': '#FFD9B3',
  'III7#11': '#FFFFB3',
  'IV7#11': '#B3FFB3',
  'V7#11': '#B3B3FF',
  'VI7#11': '#D9B3FF',
  'VII7#11': '#FFB3E6',

  'I7b13': '#FF9999',
  'II7b13': '#FFB899',
  'III7b13': '#FFFF99',
  'IV7b13': '#99FF99',
  'V7b13': '#9999FF',
  'VI7b13': '#B899FF',
  'VII7b13': '#FF99B8',

  'I7alt': '#FF8080',
  'II7alt': '#FFA680',
  'III7alt': '#FFFF80',
  'IV7alt': '#80FF80',
  'V7alt': '#8080FF',
  'VI7alt': '#A680FF',
  'VII7alt': '#FF80A6'
};

const ChordEditor: React.FC<ChordEditorProps> = ({ 
  numBars = 0, 
  selectedBlockName, 
  chords,
  onChordsChange,
  templateName,
  isEdited
}) => {
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [localChords, setLocalChords] = useState<string[]>([]);
  const [showAllChords, setShowAllChords] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update local chords when template changes
  useEffect(() => {
    if (chords) {
      setLocalChords(chords);
    } else {
      setLocalChords(Array(numBars).fill('').map((_, i) => {
        return DEFAULT_PROGRESSION[i % DEFAULT_PROGRESSION.length];
      }));
    }
  }, [chords, numBars]);

  // Get unique chords used in the progression
  const usedChords = useMemo(() => {
    const uniqueChords = Array.from(new Set(localChords));
    // Sort chords to match the order in AVAILABLE_CHORDS
    return uniqueChords.sort((a, b) => {
      const indexA = AVAILABLE_CHORDS.indexOf(a);
      const indexB = AVAILABLE_CHORDS.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [localChords]);

  // Filter chords based on the toggle state
  const visibleChords = useMemo(() => {
    if (showAllChords) {
      // Combine AVAILABLE_CHORDS with any additional chords from the template
      const additionalChords = usedChords.filter(chord => !AVAILABLE_CHORDS.includes(chord));
      return [...AVAILABLE_CHORDS, ...additionalChords];
    }
    return usedChords;
  }, [showAllChords, usedChords]);

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
        setHasOverflow(hasHorizontalOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkOverflow);
      resizeObserver.disconnect();
    };
  }, [numBars]);

  const handleExportMidi = async () => {
    if (!localChords || localChords.length === 0) return;
    
    setIsExporting(true);
    try {
      const midiData = generateMidiFile(localChords);
      const fileName = `${selectedBlockName || 'block'}_chords.mid`;
      downloadMidi(fileName, midiData);
    } catch (error) {
      console.error('Failed to export MIDI:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePaintStart = (chord: string) => {
    setIsPainting(true);
    setActiveChord(chord);
    // Play the chord when starting to paint, respecting the playback mode
    synth.playChord(chord, 0.5);
  };

  const handlePaintMove = (chord: string) => {
    if (!isPainting || !activeChord || targetChord === activeChord) return;

    const newChords = [...localChords];
    newChords[position] = activeChord;
    setLocalChords(newChords);
    onChordsChange?.(newChords);
  };

  const handlePaintEnd = () => {
    setIsPainting(false);
    setActiveChord(null);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      handlePaintEnd();
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  if (numBars === 0) {
    return (
      <div className="w-full p-4 surface-secondary">
        <div className="text-center text-secondary py-8">
          Select a block in the arrangement to edit its bars
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 surface-secondary">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
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
          <button
            onClick={() => setShowAllChords(!showAllChords)}
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
        {localChords && localChords.length > 0 && (
          <button
            onClick={handleExportMidi}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export MIDI'}
          </button>
        )}
      </div>
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto hide-scrollbar"
      >
        <div className="grid grid-cols-[auto_1fr] gap-1">
          {/* Bar numbers */}
          <div className="h-8 w-8" /> {/* Empty corner cell */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${numBars}, minmax(40px, 1fr))` }}>
            {Array.from({ length: numBars }).map((_, index) => (
              <div 
                key={`bar-${index}`}
                className={`text-xs text-center text-secondary ${
                  Math.floor(index / 4) % 2 === 0 ? 'bg-[#2A2A2A]' : 'bg-[#2E2E2E]'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Chord grid */}
          {visibleChords.map((chord) => (
            <React.Fragment key={`chord-${chord}`}>
              <div 
                className="w-8 flex items-center justify-center"
                onMouseDown={() => {
                  handlePaintStart(chord);
                }}
              >
                <span 
                  className={`
                    font-medium text-sm select-none cursor-pointer px-2 py-1 rounded
                    ${activeChord === chord ? 'text-white' : 'text-white'}
                  `}
                  style={{ 
                    backgroundColor: CHORD_COLORS[chord] || '#808080',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {chord}
                </span>
              </div>
              <div 
                className="grid" 
                style={{ gridTemplateColumns: `repeat(${numBars}, minmax(40px, 1fr))` }}
              >
                {Array.from({ length: numBars }).map((_, index) => {
                  const currentChord = localChords[index];
                  const isThisChord = currentChord === chord;
                  const isAlternateBackground = Math.floor(index / 4) % 2 === 1;
                  return (
                    <div
                      key={`slot-${index}`}
                      onMouseEnter={() => handlePaintMove(index, currentChord)}
                      onMouseDown={() => {
                        if (currentChord !== chord) {
                          const newChords = [...localChords];
                          newChords[index] = chord;
                          setLocalChords(newChords);
                          onChordsChange?.(newChords);
                          // Always play chord-only when clicking in the grid
                          synth.playChord(chord, 0.5, true);
                        }
                      }}
                      className={`
                        h-10 border-l border-[#1F1F1F] first:border-l-0 cursor-pointer
                        ${isAlternateBackground ? 'bg-[#2E2E2E]' : 'bg-[#2A2A2A]'}
                        transition-colors duration-150
                      `}
                      style={{
                        backgroundColor: isThisChord ? CHORD_COLORS[chord] || '#808080' : undefined,
                        opacity: isThisChord ? 0.8 : undefined
                      }}
                    />
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChordEditor;