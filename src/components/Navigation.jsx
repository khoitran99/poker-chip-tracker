import React from 'react';
import { ModeToggle } from './mode-toggle';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation({ activeTab, setActiveTab, activeSession, onBackToSessions }) {
  const tabs = [
    { id: 'sessions', label: 'Sessions' },
    { id: 'players', label: 'Players' },
    { id: 'summary', label: 'Summary' }
  ];

  return (
    <nav className="header bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 px-4 py-2 flex items-center w-full shadow-sm min-h-[64px]">
      
      {activeSession ? (
        // Session View Header (Super Lean)
        <div className="flex items-center w-full max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackToSessions}
            className="mr-3 hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] text-primary uppercase font-bold tracking-widest leading-none mb-1">Session</span>
            <h1 className="text-base font-bold truncate leading-none">{activeSession.name}</h1>
          </div>
          <ModeToggle />
        </div>
      ) : (
        // Main Header (Lean & Modern)
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full max-w-2xl mx-auto gap-3 sm:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-base sm:text-lg font-black m-0 flex items-center gap-1.5 overflow-hidden truncate mr-2">
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded italic shrink-0">P</span>
              <span className="tracking-tighter truncate">Poker Tracker by Khoi Tran</span>
            </h1>
            <div className="sm:hidden shrink-0">
              <ModeToggle />
            </div>
          </div>

          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg self-center sm:self-auto w-full sm:w-auto justify-center">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-4 text-xs font-bold transition-all duration-200",
                  activeTab === tab.id 
                    ? "bg-background shadow-sm hover:bg-background" 
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
