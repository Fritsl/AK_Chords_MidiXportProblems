import React, { useState } from 'react';
import chordProgressions from '../data/chordprogressions.json';
import { lookupChord } from '../utils/chordParser';

function ChordPatternAnalyzer() {
  const [unrecognizedChords, setUnrecognizedChords] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const analyzeChords = () => {
    setIsAnalyzing(true);
    const unrecognized = new Set<string>();

    // Analyze all chord progressions
    Object.entries(chordProgressions).forEach(([genre, subgenres]) => {
      Object.entries(subgenres).forEach(([subgenre, blockTypes]) => {
        Object.entries(blockTypes).forEach(([blockType, progression]) => {
          if (typeof progression === 'string') {
            // Split the progression into individual chords
            const chords = progression.split('-').map(c => c.trim());
            
            // Check each chord
            chords.forEach(chord => {
              if (!lookupChord(chord)) {
                unrecognized.add(chord);
              }
            });
          }
        });
      });
    });

    setUnrecognizedChords(unrecognized);
    setIsAnalyzing(false);
    setAnalyzed(true);
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] p-4 lg:p-8">
      <div className="max-w-[2000px] mx-auto">
        <div className="surface-secondary p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Chord Pattern Analyzer</h1>
            <button
              onClick={analyzeChords}
              disabled={isAnalyzing}
              className="btn-primary"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Patterns'}
            </button>
          </div>

          {analyzed && (
            <div className="space-y-4">
              <div className="surface-tertiary p-4">
                <h2 className="text-lg font-semibold mb-2">Analysis Results</h2>
                <p className="text-secondary">
                  Found {unrecognizedChords.size} unrecognized chord pattern{unrecognizedChords.size === 1 ? '' : 's'}
                </p>
              </div>

              {unrecognizedChords.size > 0 && (
                <div className="surface-tertiary p-4">
                  <h3 className="text-lg font-semibold mb-4">Unrecognized Patterns</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {Array.from(unrecognizedChords).sort().map(chord => (
                      <div
                        key={chord}
                        className="surface-secondary p-2 text-sm font-mono"
                      >
                        {chord}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unrecognizedChords.size === 0 && (
                <div className="surface-tertiary p-4 text-center text-secondary">
                  All chord patterns are recognized by the lookup table!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChordPatternAnalyzer;