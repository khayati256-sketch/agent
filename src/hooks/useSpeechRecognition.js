import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'jarvis_speech_settings';

const readStoredLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en-US';
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.language || 'en-US';
  } catch {
    return 'en-US';
  }
};

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguage] = useState(readStoredLanguage);
  const recognitionRef = useRef(null);
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const supported = Boolean(SpeechRecognitionAPI);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ language }));
  }, [language]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!supported || isListening) {
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError('');
      setTranscript('');
      setInterimTranscript('');
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      setError(event.error ?? 'Speech recognition error');
      setInterimTranscript('');
      setIsListening(false);
    };

    recognition.onend = () => {
      setInterimTranscript('');
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index]?.[0]?.transcript ?? '';
        if (event.results[index].isFinal) {
          finalText += `${text} `;
        } else {
          interimText += `${text} `;
        }
      }

      const nextFinal = finalText.trim();
      const nextInterim = interimText.trim();
      setInterimTranscript(nextInterim);
      if (nextFinal) {
        setTranscript(nextFinal);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognitionAPI, isListening, language, supported]);

  const clear = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError('');
  }, []);

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({
      supported,
      transcript,
      interimTranscript,
      isListening,
      error,
      language,
      setLanguage,
      start,
      stop,
      clear,
    }),
    [clear, error, interimTranscript, isListening, language, start, stop, supported, transcript],
  );
};
