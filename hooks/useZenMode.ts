import { useState, useEffect, useRef, useCallback } from 'react';

export const useZenMode = (isActive: boolean, timeoutMs: number = 3000) => {
  const [isUiVisible, setIsUiVisible] = useState(true);
  const uiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserActivity = useCallback(() => {
    setIsUiVisible(true);
    
    if (uiTimeoutRef.current) {
      clearTimeout(uiTimeoutRef.current);
    }
    
    // Só ageda o desaparecimento se a sessão estiver ativa
    if (isActive) {
      uiTimeoutRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, timeoutMs);
    }
  }, [isActive, timeoutMs]);

  useEffect(() => {
    const activities = ['mousemove', 'touchstart', 'click', 'keydown'];
    
    // Adiciona listeners
    activities.forEach(type => window.addEventListener(type, handleUserActivity));
    
    // Trigger inicial
    handleUserActivity();

    return () => {
      activities.forEach(type => window.removeEventListener(type, handleUserActivity));
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [handleUserActivity]);

  return isUiVisible;
};