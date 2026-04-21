import { useEffect, useMemo, useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

const STATUS_FILTERS = ['all', 'completed', 'waiting', 'failed'];

const getStatusClasses = (status) => {
  if (status === 'completed') {
    return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200';
  }

  if (status === 'waiting') {
    return 'border-amber-400/40 bg-amber-500/10 text-amber-200';
  }

  if (status === 'failed') {
    return 'border-rose-400/40 bg-rose-500/10 text-rose-200';
  }

  return 'border-slate-500/40 bg-slate-500/10 text-zinc-200';
};

function TaskPanel({ tasks, onRunCommand, running, onToast }) {
  const [command, setCommand] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState('');
  const speech = useSpeechRecognition();
  const { transcript, clear } = speech;

  useEffect(() => {
    if (transcript) {
      setCommand((prev) => `${prev}${prev ? ' ' : ''}${transcript}`.trim());
      clear();
    }
  }, [clear, transcript]);

  const handleRun = async () => {
    if (!command.trim() || running) {
      return;
    }

    const value = command.trim();
    setCommand('');
    await onRunCommand(value);
    onToast?.('Task submitted to Jarvis.', 'success');
  };

  const filteredTasks = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesKeyword =
        !keyword ||
        task.command?.toLowerCase().includes(keyword) ||
        task.action?.toLowerCase().includes(keyword) ||
        task.result?.message?.toLowerCase().includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }, [searchTerm, statusFilter, tasks]);

  return (
    <aside className="panel noise relative flex min-h-0 w-full flex-col p-4 md:w-[23rem]">
      <h2 className="display-font text-base font-semibold text-zinc-100">Command History</h2>
      <p className="mt-1 text-xs text-zinc-400">
        Execute commands directly and inspect the task trail. Use filters to find previous outcomes quickly.
      </p>

      <div className="mt-4 space-y-2">
        <textarea
          className="h-24 w-full resize-none rounded-lg border border-slate-600/80 bg-slate-950/75 px-3 py-2 text-sm outline-none ring-cyan-300 transition focus:ring-2"
          placeholder="Enter command to execute..."
          value={command}
          onChange={(event) => setCommand(event.target.value)}
        />

        {speech.isListening && speech.interimTranscript ? (
          <p className="rounded-md border border-cyan-300/40 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-100">
            Listening: {speech.interimTranscript}
          </p>
        ) : null}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={running || !command.trim()}
            className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-neon transition hover:brightness-110 disabled:opacity-60"
          >
            {running ? 'Running...' : 'Run Command'}
          </button>
          <button
            type="button"
            onClick={speech.isListening ? speech.stop : speech.start}
            disabled={!speech.supported}
            className={`rounded-lg border px-3 py-2 text-sm ${
              speech.isListening
                ? 'border-cyan-300/80 bg-cyan-500/20 text-cyan-100'
                : 'border-slate-600/80 bg-slate-900/60 text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200'
            }`}
          >
            {speech.isListening ? 'Stop' : 'Voice'}
          </button>
        </div>
        {speech.error ? <p className="text-xs text-rose-400">{speech.error}</p> : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <input
          type="search"
          className="rounded-lg border border-slate-600/80 bg-slate-900/60 px-2.5 py-1.5 text-xs text-zinc-100 outline-none ring-cyan-300 transition focus:ring-2"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          className="rounded-lg border border-slate-600/80 bg-slate-900/60 px-2.5 py-1.5 text-xs text-zinc-100 outline-none ring-cyan-300 transition focus:ring-2"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All statuses' : status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 text-[11px] text-zinc-500">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-600/80 bg-slate-950/40 p-3 text-xs text-zinc-500">
              No matching tasks found.
            </p>
          ) : (
            filteredTasks.map((task) => {
              const isExpanded = expandedTaskId === task.id;
              return (
                <article
                  key={task.id}
                  className="rounded-xl border border-slate-700/80 bg-slate-950/45 p-3 text-xs shadow-panel"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-zinc-100">{task.command}</p>
                    <span className={`rounded-full border px-2 py-0.5 uppercase ${getStatusClasses(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  <p className="mt-1 text-zinc-400">
                    {task.action}
                    {task.createdAt ? ` • ${new Date(task.createdAt).toLocaleString()}` : ''}
                  </p>

                  {task.result?.message ? <p className="mt-2 text-zinc-300">{task.result.message}</p> : null}

                  <button
                    type="button"
                    className="mt-2 rounded-md border border-slate-600/70 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200"
                    onClick={() => setExpandedTaskId(isExpanded ? '' : task.id)}
                  >
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                  </button>

                  {isExpanded ? (
                    <div className="mt-2 space-y-2 rounded-lg border border-slate-700/80 bg-slate-950/55 p-2.5 text-[11px]">
                      {Array.isArray(task.progress) && task.progress.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-4 text-zinc-400">
                          {task.progress.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-zinc-500">No step-by-step progress available.</p>
                      )}

                      {task.result?.retryAfter ? (
                        <p className="text-amber-300">
                          Retry after: {new Date(task.result.retryAfter).toLocaleString()}
                        </p>
                      ) : null}

                      {task.result?.suggestion?.action ? (
                        <p className="text-cyan-300">Suggested fallback: {task.result.suggestion.action}</p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}

export default TaskPanel;
