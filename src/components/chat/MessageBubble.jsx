import { useMemo, useState } from 'react';
import MarkdownLite from './MarkdownLite';

const statusStyles = {
  completed: 'text-emerald-300',
  waiting: 'text-amber-300',
  failed: 'text-rose-300',
};

function MessageBubble({ message, onCopy, onSpeak, onStopSpeak, isSpeaking, speechSupported, onFeedback }) {
  const isUser = message.role === 'user';
  const [feedbackState, setFeedbackState] = useState('idle');
  const [correction, setCorrection] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const timestamp = useMemo(() => {
    if (!message.createdAt) {
      return '';
    }

    const parsedDate = new Date(message.createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleString();
  }, [message.createdAt]);

  const taskStatus = String(message.task?.status ?? '').toLowerCase();
  const statusClass = statusStyles[taskStatus] ?? 'text-zinc-100';

  const handleFeedback = (status) => {
    if (feedbackState === 'submitted') {
      return;
    }

    if (status === 'incorrect') {
      setShowCorrectionInput(true);
      setFeedbackState('incorrect');
      return;
    }

    setShowCorrectionInput(false);
    setFeedbackState('submitted');
    onFeedback?.({
      messageId: message._id,
      type: 'correct',
      correction: '',
    });
  };

  const submitCorrection = () => {
    setFeedbackState('submitted');
    setShowCorrectionInput(false);
    onFeedback?.({
      messageId: message._id,
      type: 'incorrect',
      correction: correction.trim(),
    });
  };

  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <article
        className={`relative max-w-[92%] rounded-2xl px-4 py-3 md:max-w-[85%] ${
          isUser
            ? 'border border-indigo-400/40 bg-gradient-to-br from-violet-600/90 to-indigo-600/80 text-white shadow-neon'
            : `border border-slate-600/70 bg-slate-900/70 text-zinc-100 shadow-panel ${
                isSpeaking ? 'shadow-glow' : ''
              }`
        }`}
      >
        {!isUser ? <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-accent-400/80" /> : null}
        <div className={`${isUser ? '' : 'pl-2'} space-y-3`}>
          <MarkdownLite content={message.content} />

          {message.task ? (
            <div className="rounded-xl border border-slate-600/80 bg-slate-950/60 p-3 text-xs text-zinc-300">
              <p className={`font-semibold ${statusClass}`}>
                Action: {message.task.action} ({message.task.status})
              </p>
              {Array.isArray(message.task.progress) && message.task.progress.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {message.task.progress.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              ) : null}
              {message.task.result?.message ? <p className="mt-2">{message.task.result.message}</p> : null}
              {message.task.result?.retryAfter ? (
                <p className="mt-2 text-amber-300">
                  Retry after: {new Date(message.task.result.retryAfter).toLocaleString()}
                </p>
              ) : null}
              {message.task.result?.suggestion?.action ? (
                <p className="mt-2 text-cyan-300">Suggested fallback: {message.task.result.suggestion.action}</p>
              ) : null}
            </div>
          ) : null}

          {!isUser ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                className="rounded-lg border border-slate-500/70 px-2.5 py-1 text-zinc-300 transition hover:border-cyan-300/70 hover:text-cyan-200"
                onClick={() => onCopy?.(message.content)}
              >
                Copy
              </button>
              {speechSupported ? (
                <button
                  type="button"
                  className="rounded-lg border border-slate-500/70 px-2.5 py-1 text-zinc-300 transition hover:border-cyan-300/70 hover:text-cyan-200"
                  onClick={isSpeaking ? () => onStopSpeak?.() : () => onSpeak?.(message)}
                >
                  {isSpeaking ? 'Stop Voice' : 'Read Aloud'}
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-lg border border-emerald-400/40 px-2.5 py-1 text-emerald-200 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleFeedback('correct')}
                disabled={feedbackState === 'submitted'}
              >
                Correct
              </button>
              <button
                type="button"
                className="rounded-lg border border-rose-400/40 px-2.5 py-1 text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleFeedback('incorrect')}
                disabled={feedbackState === 'submitted'}
              >
                Incorrect
              </button>
            </div>
          ) : null}

          {!isUser && showCorrectionInput ? (
            <div className="space-y-2 rounded-lg border border-rose-400/40 bg-rose-950/25 p-2.5">
              <label className="block text-xs text-rose-100">
                What should Jarvis have said?
                <textarea
                  className="mt-1 h-20 w-full resize-none rounded-md border border-rose-300/30 bg-slate-950/80 px-2 py-1.5 text-xs text-zinc-100 outline-none ring-rose-300 transition focus:ring-2"
                  value={correction}
                  onChange={(event) => setCorrection(event.target.value)}
                  autoFocus
                />
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md bg-rose-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-400"
                  onClick={submitCorrection}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-500 px-2.5 py-1 text-xs text-zinc-300 hover:bg-slate-700/50"
                  onClick={() => {
                    setCorrection('');
                    setShowCorrectionInput(false);
                    setFeedbackState('idle');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {timestamp ? (
          <time className="pointer-events-none absolute -bottom-5 left-3 text-[11px] text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {timestamp}
          </time>
        ) : null}
      </article>
    </div>
  );
}

export default MessageBubble;
