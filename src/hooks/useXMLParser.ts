import { useState, useCallback } from 'react';
import { VALID_GENRES, VALID_LENGTHS } from '../types';
import type { Arrangement } from '../types';
import { parseArrangementXML } from '../utils/xmlParser';

export function useXMLParser(onBpmChange?: (bpm: number) => void) {
  const [xmlInput, setXmlInput] = useState('');
  const [arrangement, setArrangement] = useState<Arrangement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateArrangement = (arr: Arrangement) => {
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
      
      // Update BPM if provided in XML
      if (parsed.BPM && onBpmChange) {
        const parsedBpm = parseFloat(parsed.BPM);
        if (!isNaN(parsedBpm) && parsedBpm >= 20 && parsedBpm <= 300) {
          onBpmChange(parsedBpm);
        }
      }

      setXmlInput(content);
      setArrangement(parsed);
      setError(null);
    } catch (err) {
      setError('Instructions');
      setArrangement(null);
    }
  }, [onBpmChange]);

  const resetXML = useCallback(() => {
    setArrangement(null);
    setXmlInput('');
    setError('Instructions');
  }, []);

  return {
    xmlInput,
    arrangement,
    error,
    handleXMLInput,
    resetXML
  };
}