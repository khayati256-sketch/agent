import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'jarvis_tts_settings';

const clampRate = (value) => Math.min(2, Math.max(0.5, Number(value) || 1));

const readStoredSettings = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useTextToSpeech = () => {
  const synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const supported = Boolean(synthesis && window.SpeechSynthesisUtterance);
  const utteranceRef = useRef(null);

  const stored = readStoredSettings();
  const [autoSpeak, setAutoSpeak] = useState(Boolean(stored?.autoSpeak));
  const [rate, setRate] = useState(clampRate(stored?.rate ?? 1));
  const [selectedVoiceURI, setSelectedVoiceURI] = useState(stored?.selectedVoiceURI ?? '');
  const [voices, setVoices] = useState([]);
  const [speakingId, setSpeakingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supported) {
      return undefined;
    }

    const populateVoices = () => {
      const availableVoices = synthesis.getVoices();
      setVoices(availableVoices);
      if (!selectedVoiceURI && availableVoices.length > 0) {
        setSelectedVoiceURI(availableVoices[0].voiceURI);
      }
    };

    populateVoices();
    synthesis.onvoiceschanged = populateVoices;

    return () => {
      synthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceURI, supported, synthesis]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload = JSON.stringify({
      autoSpeak,
      rate,
      selectedVoiceURI,
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  }, [autoSpeak, rate, selectedVoiceURI]);

  const stop = useCallback(() => {
    if (!supported) {
      return;
    }

    synthesis.cancel();
    utteranceRef.current = null;
    setSpeakingId('');
  }, [supported, synthesis]);

  const speak = useCallback(
    (text, id = '') => {
      if (!supported) {
        setError('Text-to-speech is not supported in this browser.');
        return false;
      }

      const trimmed = String(text ?? '').trim();
      if (!trimmed) {
        return false;
      }

      synthesis.cancel();
      setError('');

      const utterance = new window.SpeechSynthesisUtterance(trimmed);
      const voice = voices.find((candidate) => candidate.voiceURI === selectedVoiceURI);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = clampRate(rate);

      utterance.onstart = () => {
        setSpeakingId(String(id ?? 'speaking'));
      };

      utterance.onend = () => {
        setSpeakingId('');
      };

      utterance.onerror = (event) => {
        setError(event?.error || 'Speech synthesis failed.');
        setSpeakingId('');
      };

      utteranceRef.current = utterance;
      synthesis.speak(utterance);
      return true;
    },
    [rate, selectedVoiceURI, supported, synthesis, voices],
  );

  useEffect(() => stop, [stop]);

  const preview = useCallback(() => {
    return speak('Jarvis voice preview is active. I am ready for your next command.', 'preview');
  }, [speak]);

  return {
    supported,
    autoSpeak,
    setAutoSpeak,
    rate,
    setRate: (value) => setRate(clampRate(value)),
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speakingId,
    error,
    speak,
    stop,
    preview,
  };
};
