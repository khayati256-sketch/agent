import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import TaskPanel from '../components/tasks/TaskPanel';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../lib/api';

const APP_VIEWS = {
  CHAT: 'chat',
  HISTORY: 'history',
  SETTINGS: 'settings',
};

const TOAST_STYLES = {
  success: 'border-emerald-400/50 bg-emerald-950/80 text-emerald-100',
  warning: 'border-amber-400/50 bg-amber-950/80 text-amber-100',
  error: 'border-rose-400/50 bg-rose-950/80 text-rose-100',
  info: 'border-cyan-400/50 bg-cyan-950/80 text-cyan-100',
};

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState(APP_VIEWS.CHAT);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [agentMode, setAgentMode] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [taskRunning, setTaskRunning] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const refreshSessions = useCallback(async () => {
    const response = await endpoints.listSessions();
    setSessions(response.sessions);
    return response.sessions;
  }, []);

  const loadSession = useCallback(
    async (sessionId) => {
      if (!sessionId) {
        setMessages([]);
        setActiveSessionId('');
        return;
      }

      const response = await endpoints.getSession(sessionId);
      setMessages(response.session.messages);
      setActiveSessionId(sessionId);
      setAgentMode(Boolean(response.session.lastAgentMode));
      setActiveView(APP_VIEWS.CHAT);
    },
    [],
  );

  const showToast = useCallback((message, type = 'info') => {
    if (!message) {
      return;
    }

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        setInitializing(true);
        setError('');

        const [sessionList, taskHistory] = await Promise.all([
          refreshSessions(),
          endpoints.taskHistory(),
        ]);

        if (!mounted) {
          return;
        }

        setTasks(taskHistory.tasks);

        if (sessionList.length > 0) {
          await loadSession(sessionList[0].id);
        } else {
          setActiveSessionId('');
          setMessages([]);
          setAgentMode(false);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message);
          showToast(requestError.message, 'error');
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [refreshSessions, loadSession, showToast]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleCreateSession = async () => {
    try {
      setError('');
      const response = await endpoints.createSession();
      const newSession = response.session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setMobileSidebarOpen(false);
      setActiveView(APP_VIEWS.CHAT);
      showToast('New session created.', 'success');
    } catch (requestError) {
      setError(requestError.message);
      showToast(requestError.message, 'error');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      setError('');
      await endpoints.deleteSession(sessionId);
      const updated = sessions.filter((session) => session.id !== sessionId);
      setSessions(updated);

      if (sessionId === activeSessionId) {
        if (updated.length > 0) {
          await loadSession(updated[0].id);
        } else {
          setActiveSessionId('');
          setMessages([]);
          setActiveView(APP_VIEWS.CHAT);
        }
      }
      showToast('Session deleted.', 'info');
    } catch (requestError) {
      setError(requestError.message);
      showToast(requestError.message, 'error');
    }
  };

  const handleSendMessage = async (message) => {
    const optimistic = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev, optimistic]);
    setChatLoading(true);

    try {
      setError('');
      const response = await endpoints.sendMessage({
        sessionId: activeSessionId || undefined,
        message,
        agentMode,
      });

      setMessages(response.messages);
      const updatedSessions = await refreshSessions();
      setSessions(updatedSessions);
      if (!activeSessionId && response.sessionId) {
        setActiveSessionId(response.sessionId);
      }
      setMobileSidebarOpen(false);

      if (response.task) {
        setTasks((prev) => [
          {
            id: `chat-task-${Date.now()}`,
            command: message,
            action: response.task.action,
            status: response.task.status,
            progress: response.task.progress,
            result: response.task.result,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

    } catch (requestError) {
      setError(requestError.message);
      setMessages((prev) => prev.filter((item) => item._id !== optimistic._id));
      showToast(requestError.message, 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleRunTask = async (command) => {
    setTaskRunning(true);
    try {
      setError('');
      const response = await endpoints.runTask({ command });
      setTasks((prev) => [response.task, ...prev]);
      setActiveView(APP_VIEWS.HISTORY);
    } catch (requestError) {
      setError(requestError.message);
      showToast(requestError.message, 'error');
    } finally {
      setTaskRunning(false);
    }
  };

  const stats = {
    sessions: sessions.length,
    messages: messages.length,
    tasks: tasks.length,
  };

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-zinc-300">
        <div className="rounded-xl border border-cyan-300/30 bg-slate-900/70 px-5 py-4 text-sm text-cyan-100 shadow-glow">
          Initializing Jarvis workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col gap-3 p-3 md:flex-row">
      {mobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/70 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={loadSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        user={user}
        onLogout={handleLogout}
        activeView={activeView}
        onChangeView={(view) => {
          setActiveView(view);
          setMobileSidebarOpen(false);
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="panel relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-600 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-cyan-300/60 hover:text-cyan-200 md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              Menu
            </button>
            <div>
              <h2 className="display-font text-sm font-semibold text-zinc-100">Jarvis Workspace</h2>
              <p className="text-xs text-zinc-400">
                Sessions: {stats.sessions} | Messages: {stats.messages} | Tasks: {stats.tasks}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-600/80 bg-slate-950/45 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200"
              onClick={() => setActiveView(APP_VIEWS.CHAT)}
            >
              Focus Chat
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-600/80 bg-slate-950/45 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200"
              onClick={() => setError('')}
            >
              Clear Alerts
            </button>
          </div>
        </header>

        {activeView === APP_VIEWS.SETTINGS ? (
          <section className="panel flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
            <h3 className="display-font text-lg font-semibold text-zinc-100">Settings</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-slate-700/80 bg-slate-950/45 p-4">
                <h4 className="text-sm font-semibold text-zinc-100">Appearance</h4>
                <p className="mt-1 text-xs text-zinc-400">Dark cyber-futuristic theme is optimized for this release.</p>
              </article>

              <article className="rounded-xl border border-slate-700/80 bg-slate-950/45 p-4">
                <h4 className="text-sm font-semibold text-zinc-100">Keyboard Shortcuts</h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-300">
                  <li>Ctrl/Cmd + K to focus chat input</li>
                  <li>Ctrl/Cmd + Shift + M to toggle microphone</li>
                  <li>Esc to stop speaking and close floating settings</li>
                </ul>
              </article>
            </div>

            <article className="rounded-xl border border-slate-700/80 bg-slate-950/45 p-4 text-sm text-zinc-300">
              Jarvis saves chat sessions and task history automatically for this account. Voice and TTS preferences are
              stored locally in your browser for faster startup.
            </article>
          </section>
        ) : null}

        {activeView === APP_VIEWS.HISTORY ? (
          <TaskPanel tasks={tasks} onRunCommand={handleRunTask} running={taskRunning} onToast={showToast} />
        ) : null}

        {activeView === APP_VIEWS.CHAT ? (
          <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={chatLoading}
              agentMode={agentMode}
              onToggleAgentMode={() => setAgentMode((prev) => !prev)}
              onToast={showToast}
            />
            <TaskPanel tasks={tasks} onRunCommand={handleRunTask} running={taskRunning} onToast={showToast} />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-950/65 px-4 py-2 text-sm text-rose-200">{error}</div>
        ) : null}
      </div>

      {toast ? (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm shadow-panel transition ${
            TOAST_STYLES[toast.type] || TOAST_STYLES.info
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}

export default DashboardPage;
