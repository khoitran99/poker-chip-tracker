import React, { useState } from 'react';

export default function SessionDetail({ session, updateSession, onBack, players }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  if (!session) return null;

  // Add a participant to the current session
  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (!selectedPlayerId) return;

    // Check if player is already in this session
    if (session.participants.some(p => p.playerId === selectedPlayerId)) {
      alert("Player is already in this session.");
      return;
    }

    const newParticipant = {
      playerId: selectedPlayerId,
      buyIn: 0,
      cashOut: 0
    };

    updateSession(session.id, {
      ...session,
      participants: [...session.participants, newParticipant]
    });
    setSelectedPlayerId('');
  };

  // Update a participant's buy in or cash out
  const handleUpdateParticipant = (playerId, field, value) => {
    const numericValue = value === '' ? '' : Number(value);
    const updatedParticipants = session.participants.map(p => {
      if (p.playerId === playerId) {
        return { ...p, [field]: numericValue };
      }
      return p;
    });

    updateSession(session.id, {
      ...session,
      participants: updatedParticipants
    });
  };

  // Remove participant from this session
  const handleRemoveParticipant = (playerId) => {
    updateSession(session.id, {
      ...session,
      participants: session.participants.filter(p => p.playerId !== playerId)
    });
  };

  // Analytics helper
  const getPlayerName = (id) => players.find(p => p.id === id)?.name || "Unknown Player";
  
  let totalBuyIn = 0;
  let totalCashOut = 0;
  session.participants.forEach(p => {
    totalBuyIn += Number(p.buyIn) || 0;
    totalCashOut += Number(p.cashOut) || 0;
  });
  
  const balanceDifference = totalBuyIn - totalCashOut;
  const isBalanced = balanceDifference === 0;

  // Players available to add (not already in session)
  const availablePlayers = players.filter(
    p => !session.participants.some(part => part.playerId === p.id)
  );

  return (
    <div className="animate-slide-up">
      <button className="btn-secondary" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={onBack}>
        ← Back to Sessions
      </button>

      <div className="card glass" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>{session.name}</h2>
        <p className="neutral-text" style={{ fontSize: '0.875rem' }}>
          {new Date(session.timestamp).toLocaleString()}
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-dark)' }}>
          <div style={{ flex: 1 }}>
            <p className="neutral-text" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Buy In</p>
            <p style={{ fontWeight: 700, fontSize: '1.25rem' }}>{totalBuyIn}</p>
          </div>
          <div style={{ flex: 1 }}>
            <p className="neutral-text" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Cash Out</p>
            <p style={{ fontWeight: 700, fontSize: '1.25rem' }}>{totalCashOut}</p>
          </div>
        </div>

        {totalBuyIn > 0 && !isBalanced && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="loss-text" style={{ fontSize: '0.875rem', margin: 0 }}>
              ⚠️ Session missing {balanceDifference > 0 ? balanceDifference : -balanceDifference} in cash out matching.
            </p>
          </div>
        )}
        {totalBuyIn > 0 && isBalanced && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p className="profit-text" style={{ fontSize: '0.875rem', margin: 0 }}>
              ✅ Accounting balances perfectly.
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Participants</h3>
        
        {/* Add Participant Form */}
        {players.length === 0 ? (
          <p className="neutral-text" style={{ fontSize: '0.875rem' }}>Please create players in the Players tab first.</p>
        ) : (
          <form onSubmit={handleAddParticipant} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <select 
              value={selectedPlayerId} 
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Select a player...</option>
              {availablePlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary" disabled={!selectedPlayerId}>Add</button>
          </form>
        )}

        {/* List of Participants */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {session.participants.map(p => {
            const buyIn = Number(p.buyIn) || 0;
            const cashOut = Number(p.cashOut) || 0;
            const profit = cashOut - buyIn;
            const isProfit = profit >= 0;

            return (
              <div key={p.playerId} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getPlayerName(p.playerId)}</span>
                  <button 
                    className="btn-danger" 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => handleRemoveParticipant(p.playerId)}
                  >
                    Remove
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem' }} className="neutral-text">Buy In</label>
                    <input 
                      type="number" 
                      min="0"
                      value={p.buyIn} 
                      onChange={(e) => handleUpdateParticipant(p.playerId, 'buyIn', e.target.value)}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem' }} className="neutral-text">Cash Out</label>
                    <input 
                      type="number" 
                      min="0"
                      value={p.cashOut} 
                      onChange={(e) => handleUpdateParticipant(p.playerId, 'cashOut', e.target.value)}
                      placeholder="0"
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div style={{ width: '80px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '1.25rem' }}>
                    <span className="neutral-text" style={{ fontSize: '0.75rem' }}>Net</span>
                    <span className={isProfit ? 'profit-text' : 'loss-text'} style={{ fontSize: '1.1rem' }}>
                      {profit > 0 ? `+${profit}` : profit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {session.participants.length === 0 && (
            <p className="neutral-text" style={{ textAlign: 'center', padding: '1rem 0' }}>No participants yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
