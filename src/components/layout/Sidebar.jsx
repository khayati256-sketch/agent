function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  user,
  onLogout,
  activeView,
  onChangeView,
  mobileOpen,
  onCloseMobile,
}) {
  const navItems = [
    { id: 'chat', label: 'Chat' },
    { id: 'history', label: 'History' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside
      className={`panel fixed inset-y-3 left-3 z-40 flex w-[18rem] flex-col p-4 transition-transform duration-300 md:static md:h-auto md:w-72 md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-[120%]'
      }`}
    >
      <div className="mb-4 border-b border-slate-700/80 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="display-font text-lg font-semibold text-zinc-100">Jarvis Console</h1>
            <p className="mt-1 text-xs text-zinc-400">{user?.email}</p>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-600 px-2 py-1 text-xs text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200 md:hidden"
            onClick={onCloseMobile}
          >
            Close
          </button>
        </div>
      </div>

      <nav className="mb-3 grid grid-cols-3 gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`rounded-lg border px-2 py-1.5 text-xs transition ${
              activeView === item.id
                ? 'border-cyan-300/70 bg-cyan-500/15 text-cyan-100'
                : 'border-slate-600/80 bg-slate-950/50 text-zinc-300 hover:border-cyan-300/50 hover:text-cyan-200'
            }`}
            onClick={() => onChangeView(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={onCreateSession}
        className="mb-3 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-neon transition hover:brightness-110"
      >
        + New Chat
      </button>

      <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Sessions</div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {sessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-600/80 p-3 text-xs text-zinc-500">
            No conversation yet.
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`group rounded-lg border p-2 text-sm transition ${
                activeSessionId === session.id
                  ? 'border-cyan-300/70 bg-cyan-500/10'
                  : 'border-slate-700/80 bg-slate-950/45 hover:border-slate-500/90'
              }`}
            >
              <button
                type="button"
                className="w-full truncate text-left text-zinc-200"
                onClick={() => onSelectSession(session.id)}
                title={session.title}
              >
                {session.title}
              </button>
              <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{new Date(session.updatedAt).toLocaleString()}</span>
                <button
                  type="button"
                  className="opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                  onClick={() => onDeleteSession(session.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={onCreateSession}
        className="mb-3 mt-4 rounded-lg border border-slate-600/80 px-3 py-2 text-sm text-zinc-300 hover:border-cyan-300/60 hover:text-cyan-200"
      >
        Quick New Chat
      </button>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-lg border border-slate-600/80 px-3 py-2 text-sm text-zinc-300 hover:border-rose-400/60 hover:text-rose-200"
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
