/// <reference types="vite/client" />

// Osano Cookie Consent Manager
interface OsanoCM {
  mode: string;
  hideDialog: () => void;
  showDialog: () => void;
}

interface Osano {
  cm?: OsanoCM;
}

declare global {
  interface Window {
    Osano?: Osano;
  }
}

export {};
