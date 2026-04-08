import React from 'react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'sessions', label: 'Sessions' },
    { id: 'players', label: 'Players' },
    { id: 'summary', label: 'Summary' }
  ];

  return (
    <nav className="header">
      <h1 style={{ fontSize: '1.25rem', marginBottom: 0, fontWeight: 800 }}>
        Poker<span style={{ color: 'var(--accent-primary)' }}>Tracker</span>
      </h1>
      <div className="nav-tabs" style={{ marginTop: 0, paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
