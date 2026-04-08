import React from 'react';

export default function SessionList({ sessions, setSessions, onSelectSession }) {
  const handleCreateSession = () => {
    const name = prompt("Enter a name for this session (leave blank for default):");
    if (name === null) return; // User cancelled
    
    const newSession = {
      id: Date.now().toString(),
      name: name.trim() || `Session ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      participants: [] // Array of { playerId, buyIn, cashOut }
    };
    
    setSessions([newSession, ...sessions]); // Prepend new session
    onSelectSession(newSession.id);
  };

  const handleDeleteSession = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  // Helper to calculate total volume for a session
  const getSessionStats = (participants) => {
    let totalBuyIn = 0;
    participants.forEach(p => {
      totalBuyIn += Number(p.buyIn) || 0;
    });
    return totalBuyIn;
  };

  return (
    <div className="animate-slide-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Past Sessions</h2>
        <button className="btn-primary" onClick={handleCreateSession}>+ New Session</button>
      </div>

      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3 className="neutral-text">No Sessions Yet</h3>
          <p>Start a new poker session to begin tracking.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map(session => {
            const totalBuyIn = getSessionStats(session.participants);
            
            return (
              <div 
                key={session.id} 
                className="card glass" 
                style={{ cursor: 'pointer', padding: '1.25rem' }}
                onClick={() => onSelectSession(session.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{session.name}</h3>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {new Date(session.timestamp).toLocaleString(undefined, { 
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button 
                    className="btn-danger" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    onClick={(e) => handleDeleteSession(e, session.id)}
                  >
                    Delete
                  </button>
                </div>
                
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{session.participants.length} Players</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem' }} className="neutral-text">Total Buy In</p>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{totalBuyIn}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
