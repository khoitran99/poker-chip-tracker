import React, { useState, useMemo } from 'react';

export default function SummaryView({ sessions, players }) {
  // By default select all sessions
  const [selectedSessionIds, setSelectedSessionIds] = useState(
    sessions.map(s => s.id)
  );

  const toggleSession = (id) => {
    setSelectedSessionIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedSessionIds.length === sessions.length) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(sessions.map(s => s.id));
    }
  };

  // Calculate aggregations based on selected sessions
  const aggregatedStats = useMemo(() => {
    const stats = {}; // playerId -> { buyIn, cashOut, profit, sessionsPlayed }

    sessions.forEach(session => {
      if (!selectedSessionIds.includes(session.id)) return;

      session.participants.forEach(p => {
        if (!stats[p.playerId]) {
          stats[p.playerId] = { buyIn: 0, cashOut: 0, profit: 0, sessionsPlayed: 0 };
        }
        
        const b = Number(p.buyIn) || 0;
        const c = Number(p.cashOut) || 0;
        
        stats[p.playerId].buyIn += b;
        stats[p.playerId].cashOut += c;
        stats[p.playerId].profit += (c - b);
        stats[p.playerId].sessionsPlayed += 1;
      });
    });

    // Convert to array and map player names
    return Object.entries(stats).map(([playerId, data]) => ({
      playerId,
      name: players.find(p => p.id === playerId)?.name || 'Unknown',
      ...data
    })).sort((a, b) => b.profit - a.profit); // Sort by highest profit first
  }, [sessions, selectedSessionIds, players]);

  if (sessions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h3 className="neutral-text">No Data Available</h3>
        <p>Complete some sessions to see summaries.</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Sessions to Aggregate</h3>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
            onClick={toggleAll}
          >
            {selectedSessionIds.length === sessions.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
          {sessions.map(session => (
            <label key={session.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.25rem 0' }}>
              <input 
                type="checkbox" 
                checked={selectedSessionIds.includes(session.id)}
                onChange={() => toggleSession(session.id)}
                style={{ width: 'auto' }}
              />
              <span style={{ fontSize: '0.875rem' }}>{session.name} <span className="neutral-text">({new Date(session.timestamp).toLocaleDateString()})</span></span>
            </label>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Overall Results</h3>
        {selectedSessionIds.length === 0 ? (
          <p className="neutral-text" style={{ textAlign: 'center', padding: '2rem 0' }}>Select at least one session.</p>
        ) : aggregatedStats.length === 0 ? (
          <p className="neutral-text" style={{ textAlign: 'center', padding: '2rem 0' }}>No player data in selected sessions.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Player</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Played</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Buy In</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Cash Out</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Net</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedStats.map((stat) => (
                  <tr key={stat.playerId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{stat.name}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.875rem' }} className="neutral-text">{stat.sessionsPlayed}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>{stat.buyIn}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontSize: '0.875rem' }}>{stat.cashOut}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700 }} className={stat.profit >= 0 ? 'profit-text' : 'loss-text'}>
                      {stat.profit > 0 ? `+${stat.profit}` : stat.profit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
