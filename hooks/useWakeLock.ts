import { useEffect, useRef } from 'react';

export const useWakeLock = (shouldLock: boolean) => {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && shouldLock) {
        try {
          // @ts-ignore
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err: any) {
          // Erros de Wake Lock são comuns (bateria fraca, config do SO) e não devem quebrar o app
          if (err.name !== 'NotAllowedError') console.debug('Wake Lock request failed:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {}
      }
    };

    if (shouldLock) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Limpeza ao desmontar ou quando shouldLock mudar
    return () => {
      releaseWakeLock();
    };
  }, [shouldLock]);
};