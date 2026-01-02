import React, { createContext, useContext, useState, useEffect } from 'react';
import { SoundType } from '../services/audioService';

interface SettingsContextType {
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  isVoiceEnabled: boolean;
  toggleVoice: () => void;
  isHapticsEnabled: boolean;
  toggleHaptics: () => void;
  soundType: SoundType;
  setSoundType: (type: SoundType) => void;
  isAdaptive: boolean;
  toggleAdaptive: () => void;
  simulatedStress: number;
  setSimulatedStress: (val: number) => void;
  breathCycleDuration: number;
  setBreathCycleDuration: (val: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializa estado lendo do LocalStorage ou usa padrão
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => 
    JSON.parse(localStorage.getItem('respiro_audio') || 'false')
  );
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => 
    JSON.parse(localStorage.getItem('respiro_voice') || 'false')
  );
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(() => 
    JSON.parse(localStorage.getItem('respiro_haptics') || 'true')
  );
  const [isAdaptive, setIsAdaptive] = useState(() => 
    JSON.parse(localStorage.getItem('respiro_adaptive') || 'true')
  );
  
  const [soundType, setSoundType] = useState<SoundType>('pink');
  const [simulatedStress, setSimulatedStress] = useState(0.5);
  const [breathCycleDuration, setBreathCycleDuration] = useState(10);

  // Efeitos de persistência
  useEffect(() => localStorage.setItem('respiro_audio', JSON.stringify(isAudioEnabled)), [isAudioEnabled]);
  useEffect(() => localStorage.setItem('respiro_voice', JSON.stringify(isVoiceEnabled)), [isVoiceEnabled]);
  useEffect(() => localStorage.setItem('respiro_haptics', JSON.stringify(isHapticsEnabled)), [isHapticsEnabled]);
  useEffect(() => localStorage.setItem('respiro_adaptive', JSON.stringify(isAdaptive)), [isAdaptive]);

  const toggleAudio = () => setIsAudioEnabled(prev => !prev);
  const toggleVoice = () => setIsVoiceEnabled(prev => !prev);
  const toggleHaptics = () => setIsHapticsEnabled(prev => !prev);
  const toggleAdaptive = () => setIsAdaptive(prev => !prev);

  return (
    <SettingsContext.Provider value={{
      isAudioEnabled, toggleAudio,
      isVoiceEnabled, toggleVoice,
      isHapticsEnabled, toggleHaptics,
      soundType, setSoundType,
      isAdaptive, toggleAdaptive,
      simulatedStress, setSimulatedStress,
      breathCycleDuration, setBreathCycleDuration
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};