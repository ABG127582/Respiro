import { useState } from 'react';
import { PatternId } from '../types';
import { BREATHING_PATTERNS } from '../constants';

export const usePatternManager = () => {
  const [currentPatternId, setCurrentPatternId] = useState<PatternId>(PatternId.COHERENT);

  const currentPattern = BREATHING_PATTERNS[currentPatternId];

  return {
    currentPatternId,
    setCurrentPatternId,
    currentPattern
  };
};