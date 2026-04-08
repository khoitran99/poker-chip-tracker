import React, { useState } from 'react';

export default function PlayersView({ players, setPlayers }) {
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    // Check if player name already exists (case-insensitive)
    const exists = players.some(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase());
    if (exists) {
      alert("Player already exists!");
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim()
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const handleDeletePlayer = (id) => {
    if (window.confirm("Are you sure you want to delete this player? They might still be linked to past sessions.")) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="card glass">
        <h2>Add Player</h2>
        <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Enter player name..." 
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={!newPlayerName.trim()}>
            Add
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Global Player List</h3>
        {players.length === 0 ? (
          <p>No players added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {players.map(player => (
              <div key={player.id} className="participant-row" style={{ padding: '0.75rem 0' }}>
                <span style={{ fontWeight: 600 }}>{player.name}</span>
                <button 
                  className="btn-danger" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                  onClick={() => handleDeletePlayer(player.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
