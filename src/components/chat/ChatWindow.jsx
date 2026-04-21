import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

const LOADING_STAGES = ['Thinking...', 'Understanding intent...', 'Executing tool...', 'Preparing response...'];
const SPEECH_LANGUAGES = ['en-US', 'en-GB', 'hi-IN'];

const getMessageKey = (message) => message._id ?? `${message.role}-${message.createdAt ?? message.content}`;

function ChatWindow({ messages, onSendMessage, loading, agentMode, onToggleAgentMode, onToast }) {
  const [input, setInput] = useState('');
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const lastAutoSpokenRef = useRef('');
  const speech = useSpeechRecognition();
  const tts = useTextToSpeech();

  const { transcript, interimTranscript, clear } = speech;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!loading) {
      setLoadingStageIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setLoadingStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1200);

    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (transcript) {
      setInput((prev) => `${prev}${prev ? ' ' : ''}${transcript}`.trim());
      clear();
    }
  }, [clear, transcript]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const newestAssistantMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'assistant') {
        return messages[index];
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (!tts.autoSpeak || !newestAssistantMessage) {
      return;
    }

    const messageId = getMessageKey(newestAssistantMessage);
    if (lastAutoSpokenRef.current === messageId) {
      return;
    }

    const spoke = tts.speak(newestAssistantMessage.content, messageId);
    if (spoke) {
      lastAutoSpokenRef.current = messageId;
    }
  }, [newestAssistantMessage, tts]);

  const submitMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const value = input.trim();
    tts.stop();
    setInput('');
    await onSendMessage(value);
  };

  const handleCopy = useCallback(
    async (content) => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(content);
          onToast?.('Response copied to clipboard.', 'success');
          return;
        }
      } catch {
        // Fall through to fallback path.
      }

      onToast?.('Unable to access clipboard in this browser.', 'warning');
    },
    [onToast],
  );

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  useEffect(() => {
    const listener = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        if (speech.isListening) {
          speech.stop();
        } else {
          speech.start();
        }
      }

      if (event.key === 'Escape') {
        speech.stop();
        tts.stop();
        setSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [speech, tts]);

  const loadingMessage = agentMode
    ? `${LOADING_STAGES[loadingStageIndex]} Executing task with guardrails...`
    : LOADING_STAGES[loadingStageIndex];

  return (
    <section className="panel noise relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
      <div className="grid-overlay absolute inset-0 opacity-45" />
      <header className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
        <div>
          <h2 className="display-font text-lg font-semibold text-zinc-100">Jarvis - Always Listening</h2>
          <p className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            {isOnline ? 'Connected' : 'Offline'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-600/80 bg-slate-950/40 px-3 py-1.5 text-xs text-zinc-200">
            <span>Agent Mode</span>
            <button
              type="button"
              onClick={onToggleAgentMode}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
                agentMode ? 'bg-brand-500 shadow-neon' : 'bg-slate-700'
              }`}
              aria-label="Toggle agent mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  agentMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          <button
            type="button"
            className="rounded-full border border-slate-600/80 bg-slate-950/40 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200"
            onClick={() => setSettingsOpen((prev) => !prev)}
          >
            Voice Settings
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <section className="relative z-10 mb-3 grid gap-3 rounded-xl border border-slate-700/80 bg-slate-950/55 p-3 text-xs md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-zinc-300">Speech Input Language</span>
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-zinc-100 outline-none ring-cyan-300 transition focus:ring-2"
              value={speech.language}
              onChange={(event) => speech.setLanguage(event.target.value)}
            >
              {SPEECH_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-zinc-300">Text-to-Speech Voice</span>
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-1.5 text-zinc-100 outline-none ring-cyan-300 transition focus:ring-2"
              value={tts.selectedVoiceURI}
              onChange={(event) => tts.setSelectedVoiceURI(event.target.value)}
              disabled={!tts.supported || tts.voices.length === 0}
            >
              {tts.voices.length === 0 ? (
                <option value="">Default voice</option>
              ) : (
                tts.voices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-zinc-300">Playback Speed ({tts.rate.toFixed(1)}x)</span>
            <input
              className="w-full accent-cyan-400"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={tts.rate}
              onChange={(event) => tts.setRate(Number(event.target.value))}
              disabled={!tts.supported}
            />
          </label>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-zinc-300">
              <input
                type="checkbox"
                checked={tts.autoSpeak}
                onChange={(event) => tts.setAutoSpeak(event.target.checked)}
                disabled={!tts.supported}
              />
              Auto read assistant replies
            </label>
            <button
              type="button"
              className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-zinc-300 hover:border-cyan-300/70 hover:text-cyan-200 disabled:opacity-50"
              onClick={tts.preview}
              disabled={!tts.supported}
            >
              Preview
            </button>
          </div>
        </section>
      ) : null}

      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="animate-floaty rounded-2xl border border-dashed border-slate-600/90 bg-slate-950/45 p-6 text-sm text-zinc-300">
            Start a conversation with Jarvis. Agent Mode can execute supported local and browser tasks automatically.
          </div>
        ) : (
          messages.map((message) => {
            const messageKey = getMessageKey(message);
            return (
              <MessageBubble
                key={messageKey}
                message={message}
                onCopy={handleCopy}
                speechSupported={tts.supported}
                isSpeaking={tts.speakingId === messageKey}
                onSpeak={(selectedMessage) => tts.speak(selectedMessage.content, getMessageKey(selectedMessage))}
                onStopSpeak={tts.stop}
                onFeedback={() => onToast?.('Thank you! Feedback recorded.', 'success')}
              />
            );
          })
        )}

        {loading ? (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-slate-900/50 px-3 py-1 text-xs text-cyan-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              {loadingMessage}
            </div>
            <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 p-3">
              <div className="shimmer-line h-3 w-11/12 animate-shimmer rounded" />
              <div className="mt-2 shimmer-line h-3 w-2/3 animate-shimmer rounded" />
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <footer className="relative z-10 mt-4 space-y-2 border-t border-slate-700/70 pt-4">
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              className="min-h-24 w-full resize-none rounded-xl border border-slate-600/80 bg-slate-950/70 px-3 py-2 text-sm outline-none ring-cyan-300 transition focus:ring-2"
              placeholder="Type a message or command..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onInputKeyDown}
            />
            {speech.isListening && interimTranscript ? (
              <div className="glass-pill absolute -top-3 left-3 max-w-[85%] truncate px-3 py-1 text-[11px] text-cyan-100">
                {interimTranscript}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 md:w-40">
            <button
              type="button"
              className={`relative overflow-hidden rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                speech.isListening
                  ? 'border-cyan-300/80 bg-cyan-500/20 text-cyan-100 shadow-glow'
                  : 'border-slate-600/80 bg-slate-900/60 text-zinc-200 hover:border-cyan-300/60 hover:text-cyan-200'
              }`}
              onClick={speech.isListening ? speech.stop : speech.start}
              disabled={!speech.supported}
            >
              {speech.isListening ? (
                <>
                  <span className="absolute inset-0 animate-ripple rounded-xl border border-cyan-300/60" />
                  Listening
                </>
              ) : (
                'Voice'
              )}
            </button>
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-neon transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={submitMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <p>Shortcuts: Ctrl/Cmd+K focus input, Ctrl/Cmd+Shift+M mic toggle, Esc stop voice.</p>
          <p>{agentMode ? 'Agent mode enabled' : 'Chat mode enabled'}</p>
        </div>

        {!speech.supported ? <p className="text-xs text-zinc-500">Web Speech API is not supported in this browser.</p> : null}
        {speech.error ? <p className="text-xs text-rose-400">{speech.error}</p> : null}
        {tts.error ? <p className="text-xs text-rose-400">{tts.error}</p> : null}
      </footer>
    </section>
  );
}

export default ChatWindow;
