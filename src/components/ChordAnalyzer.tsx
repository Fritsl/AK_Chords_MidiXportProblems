import React, { useState, useEffect } from 'react';
import { romanToChord, getChordNotes } from '../utils/chordParser';
import { getGenreCategories } from '../data/genres';
import chordProgressions from '../data/chordprogressions.json';

interface ChordIssue {
  genre: string;
  subgenre: string;
  blockType: string;
  chord: string;
  error: string;
  details?: {
    romanChord?: string;
    notes?: string[];
  };
}

const ChordAnalyzer: React.FC = () => {
  const [issues, setIssues] = useState<ChordIssue[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const analyzeChord = (chord: string, key: string = 'C'): { valid: boolean; error?: string; details?: any } => {
    try {
      // Try to convert Roman numeral to actual chord
      const romanChord = romanToChord(chord, key);
      if (romanChord === 'C' && !chord.includes('I')) {
        return { 
          valid: false, 
          error: 'Failed to parse Roman numeral',
          details: { romanChord }
        };
      }

      // Try to get notes from the chord
      const notes = getChordNotes(chord, key);
      if (notes.length === 0) {
        return { 
          valid: false, 
          error: 'No notes generated',
          details: { romanChord, notes }
        };
      }

      // Check if we got the default chord when we shouldn't have
      const isDefaultChord = JSON.stringify(notes) === JSON.stringify(['C4', 'E4', 'G4']);
      if (isDefaultChord && !chord.match(/^I$/)) {
        return { 
          valid: false, 
          error: 'Defaulted to C major triad',
          details: { romanChord, notes }
        };
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: { error }
      };
    }
  };

  const analyzeProgressions = async () => {
    setAnalyzing(true);
    setIssues([]);
    const newIssues: ChordIssue[] = [];

    // Count total progressions
    let total = 0;
    Object.entries(chordProgressions).forEach(([genre, subgenres]) => {
      Object.entries(subgenres).forEach(([subgenre, blockTypes]) => {
        Object.keys(blockTypes).forEach(() => {
          total++;
        });
      });
    });

    setProgress({ current: 0, total });
    let current = 0;

    // Analyze each progression
    for (const [genre, subgenres] of Object.entries(chordProgressions)) {
      for (const [subgenre, blockTypes] of Object.entries(subgenres)) {
        for (const [blockType, progression] of Object.entries(blockTypes)) {
          current++;
          setProgress({ current, total });

          // Skip if progression is empty or not a string
          if (!progression || typeof progression !== 'string') continue;

          // Analyze each chord in the progression
          const chords = progression.split('-').map(c => c.trim());
          for (const chord of chords) {
            const result = analyzeChord(chord);
            if (!result.valid) {
              newIssues.push({
                genre,
                subgenre,
                blockType,
                chord,
                error: result.error || 'Unknown error',
                details: result.details
              });
            }
          }

          // Allow UI to update
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    setIssues(newIssues);
    setAnalyzing(false);
  };

  return (
    <div className="p-4 max-w-[2000px] mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Chord Progression Analyzer</h2>
        <button
          onClick={analyzeProgressions}
          disabled={analyzing}
          className="btn-primary"
        >
          {analyzing ? 'Analyzing...' : 'Analyze Progressions'}
        </button>
      </div>

      {analyzing && (
        <div className="mb-4">
          <div className="h-2 bg-[#2A2A2A] rounded overflow-hidden">
            <div 
              className="h-full bg-[#03A9F4] transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-secondary mt-2">
            Analyzing progression {progress.current} of {progress.total}
          </p>
        </div>
      )}

      {issues.length > 0 && (
        <div className="space-y-4">
          <div className="surface-secondary p-4">
            <p className="text-lg font-medium mb-2">Analysis Results</p>
            <p className="text-secondary">
              Found {issues.length} issue{issues.length === 1 ? '' : 's'} in chord progressions
            </p>
          </div>

          <div className="space-y-2">
            {issues.map((issue, index) => (
              <div key={index} className="surface-secondary p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {issue.genre} / {issue.subgenre} / {issue.blockType}
                    </p>
                    <p className="text-[#FF5252] mt-1">
                      Chord "{issue.chord}": {issue.error}
                    </p>
                  </div>
                  {issue.details && (
                    <div className="text-sm text-secondary">
                      {issue.details.romanChord && (
                        <p>Parsed as: {issue.details.romanChord}</p>
                      )}
                      {issue.details.notes && (
                        <p>Notes: {issue.details.notes.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!analyzing && issues.length === 0 && (
        <div className="surface-secondary p-4 text-center text-secondary">
          No issues found in chord progressions
        </div>
      )}
    </div>
  );
};

export default ChordAnalyzer;