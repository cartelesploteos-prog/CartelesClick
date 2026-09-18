import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export interface UseVoiceRecognitionOptions {
  lang?: string;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

// Global window type extension helper
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function useVoiceRecognition({
  lang = "es-AR",
  onResult,
  onError,
}: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const SpeechRecognitionAPI = getSpeechRecognitionConstructor();
  const isSupported = Boolean(SpeechRecognitionAPI);

  // Keep callback refs fresh
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    setError(null);

    if (!SpeechRecognitionAPI) {
      const errMsg = "Tu navegador no soporta reconocimiento de voz nativo.";
      setError(errMsg);
      onErrorRef.current?.(errMsg);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex]?.[0]?.transcript?.trim();
        if (transcript) {
          onResultRef.current?.(transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errMsg = "Error al capturar voz.";
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          errMsg = "Permiso de micrófono denegado. Permite el acceso para dictar.";
        } else if (event.error === "no-speech") {
          errMsg = "No se detectó voz. Intenta nuevamente.";
        }
        setError(errMsg);
        setIsListening(false);
        onErrorRef.current?.(errMsg);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      const errMsg = "No se pudo iniciar el micrófono en este entorno.";
      setError(errMsg);
      setIsListening(false);
      onErrorRef.current?.(errMsg);
    }
  }, [SpeechRecognitionAPI, lang]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error,
  };
}

export default useVoiceRecognition;
