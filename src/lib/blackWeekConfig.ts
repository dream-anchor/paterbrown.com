// Development mode detection
const isDev = import.meta.env.MODE === 'development';
const envFlag = import.meta.env.VITE_BLACK_WEEK_ENABLED;
const enabledFromEnv = envFlag?.toLowerCase() === 'true';

// Optional: Debug logging
console.log('[BlackWeek Config]', { 
  mode: import.meta.env.MODE, 
  envFlag, 
  enabledFromEnv, 
  isDev,
  activeInDev: isDev 
});

export const BLACK_WEEK_CONFIG = {
  // Feature Flag für manuelle Steuerung
  // Im Dev-Mode immer aktiv, in Produktion über Env-Variable gesteuert
  enabled: isDev ? true : enabledFromEnv,
  
  // Zeitraum (MEZ/Berlin Timezone)
  startDate: new Date('2025-11-24T12:00:00+01:00'),
  endDate: new Date('2025-12-01T23:59:59+01:00'),
  
  // Rabatt
  discount: 30,
  
  // Texte
  texts: {
    badge: 'BLACK WEEK',
    discount: '30% Rabatt',
    cta: 'JETZT 30% RABATT SICHERN!',
    banner: 'BLACK WEEK – 30% RABATT AUF ALLE TICKETS',
    countdown: 'Noch {time}'
  }
};

// Prüft, ob Black Week aktiv ist (Feature Flag ODER Zeitraum)
export const isBlackWeekActive = (): boolean => {
  if (BLACK_WEEK_CONFIG.enabled) return true;
  
  const now = new Date();
  return now >= BLACK_WEEK_CONFIG.startDate && now <= BLACK_WEEK_CONFIG.endDate;
};

// Berechnet verbleibende Zeit - Deutsche Ausgabe
export const getTimeRemaining = () => {
  const now = new Date();
  const end = BLACK_WEEK_CONFIG.endDate;
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Deutsche, ausgeschriebene Zeitangaben
  if (days > 1) return `${days} Tage und ${hours} Stunden`;
  if (days === 1) return `1 Tag und ${hours} Stunden`;
  if (hours > 1) return `${hours} Stunden`;
  if (hours === 1) return `1 Stunde`;
  if (minutes > 1) return `${minutes} Minuten`;
  return `1 Minute`;
};
