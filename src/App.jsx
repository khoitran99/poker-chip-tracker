import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Navigation from './components/Navigation';
import PlayersView from './components/PlayersView';
import SessionList from './components/SessionList';
import SessionDetail from './components/SessionDetail';
import SummaryView from './components/SummaryView';

export default function App() {
  const [players, setPlayers] = useLocalStorage('poker-players', []);
  const [sessions, setSessions] = useLocalStorage('poker-sessions', []);
  
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Helper to update a specific session within the sessions array
  const updateSession = (id, updatedSessionData) => {
    setSessions(currentSessions => 
      currentSessions.map(s => s.id === id ? updatedSessionData : s)
    );
  };

  // Switch between main views
  const renderContent = () => {
    if (activeTab === 'players') {
      return <PlayersView players={players} setPlayers={setPlayers} />;
    }
    
    if (activeTab === 'summary') {
      return <SummaryView sessions={sessions} players={players} />;
    }
    
    if (activeTab === 'sessions') {
      if (selectedSessionId) {
        const session = sessions.find(s => s.id === selectedSessionId);
        return (
          <SessionDetail 
            session={session} 
            updateSession={updateSession}
            onBack={() => setSelectedSessionId(null)}
            players={players}
          />
        );
      }
      return (
        <SessionList 
          sessions={sessions} 
          setSessions={setSessions} 
          onSelectSession={setSelectedSessionId} 
        />
      );
    }
  };

  return (
    <>
      <Navigation activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        // Clear selected session when switching top-level tabs
        if (tab !== 'sessions') {
          setSelectedSessionId(null);
        }
      }} />
      <main className="container">
        {renderContent()}
      </main>
    </>
  );
}
