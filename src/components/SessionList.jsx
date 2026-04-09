import React, { useState } from 'react';
import { exportBulkToExcel } from '@/lib/exportUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, PlusCircle, History, Check, FileSpreadsheet, X } from "lucide-react";
import { cn } from '@/lib/utils';

export default function SessionList({ sessions, setSessions, onSelectSession, players }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleCreateSession = (e) => {
    e.preventDefault();
    
    const name = newSessionName.trim() || `Session ${new Date().toLocaleDateString()}`;
    
    const newSession = {
      id: Date.now().toString(),
      name: name,
      timestamp: Date.now(),
      participants: [] // Array of { playerId, buyIn, cashOut }
    };
    
    setSessions([newSession, ...sessions]); // Prepend new session
    setNewSessionName("");
    setIsDialogOpen(false);
    onSelectSession(newSession.id);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      setSessions(sessions.filter(s => s.id !== sessionToDelete.id));
      setSessionToDelete(null);
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
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleBulkExport = () => {
    const selectedSessions = sessions.filter(s => selectedIds.includes(s.id));
    exportBulkToExcel(selectedSessions, players);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="animate-slide-up w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight leading-none">History</h2>
          <p className="text-muted-foreground text-sm mt-2 font-medium">Your past tracking sessions</p>
        </div>
        
        <div className="flex gap-2">
          {sessions.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedIds([]);
              }}
              className={cn("font-bold border-none", isSelectionMode ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted/50")}
            >
              {isSelectionMode ? "Cancel" : "Select"}
            </Button>
          )}
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold shadow-lg shadow-primary/20">
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="pt-2">
              <DialogTitle className="text-2xl font-extrabold tracking-tight">Start Session</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Give your game a name to track the table action.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSession} className="space-y-8 pt-2 pb-2">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] uppercase font-black tracking-widest text-primary/70 ml-1">
                  Session Name
                </Label>
                <Input
                  id="name"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. Vegas Night"
                  className="h-14 text-lg font-bold bg-muted/30 border-none shadow-inner rounded-xl px-4 focus-visible:ring-primary/20"
                />
              </div>
              <DialogFooter className="sm:justify-between gap-3 pt-4 border-t border-border/50">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsDialogOpen(false)} 
                  className="font-bold text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
                >
                  Cancel
                </Button>
                <Button type="submit" className="font-bold h-12 px-10 rounded-xl shadow-lg shadow-primary/20">
                  Save & Start
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {sessions.length === 0 ? (
        <div className="bg-muted/30 text-center py-20 px-6 border-2 border-dashed border-border rounded-2xl">
          <h3 className="text-xl font-bold mb-2">No Sessions Yet</h3>
          <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">Toss some cards and start your first session above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {sessions.map((session, index) => {
            const totalBuyIn = getSessionStats(session.participants);
            
            return (
              <div 
                key={session.id} 
                className={cn(
                  "group relative glass-card cursor-pointer p-6 animate-slide-up active:scale-[0.98] transition-all duration-200",
                  selectedIds.includes(session.id) && "ring-2 ring-primary bg-primary/5"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(session.id);
                  } else {
                    onSelectSession(session.id);
                  }
                }}
              >
                {isSelectionMode && (
                  <div className={cn(
                    "absolute top-4 left-4 h-6 w-6 rounded-full border-2 border-primary/20 flex items-center justify-center z-20 transition-all",
                    selectedIds.includes(session.id) ? "bg-primary border-primary text-primary-foreground scale-110" : "bg-background"
                  )}>
                    {selectedIds.includes(session.id) && <Check className="h-4 w-4 stroke-[3]" />}
                  </div>
                )}
                <div className={cn("flex justify-between items-start relative z-10", isSelectionMode && "pl-8")}>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black truncate leading-tight tracking-tight group-hover:text-primary transition-colors">{session.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                      {new Date(session.timestamp).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric'
                      })} • {new Date(session.timestamp).toLocaleTimeString(undefined, { 
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-6 flex justify-between items-end border-t border-border/40 pt-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">Players</span>
                      <span className="text-sm font-bold flex items-center">
                        <History className="h-3 w-3 mr-1 text-primary/40" />
                        {session.participants.length}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5 block">Total Volume</span>
                    <p className="font-black text-2xl tracking-tighter text-primary">
                      {totalBuyIn < 1000 ? totalBuyIn : (totalBuyIn/1000).toFixed(1) + 'k'}
                    </p>
                  </div>
                </div>
                
                {/* Subtle gradient accent for hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />
              </div>
            );
          })}
        </div>
      )}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Nuke Session?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This will permanently delete **{sessionToDelete?.name}**. All participant buy-ins and results for this game will be wiped from history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel className="font-bold border-none hover:bg-muted rounded-xl">Hold On</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold rounded-xl px-8">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500 w-full max-w-md px-4">
          <div className="bg-primary text-primary-foreground shadow-2xl rounded-3xl p-4 flex items-center justify-between gap-4 border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3 pl-2">
              <div className="bg-white/20 h-8 w-8 rounded-full flex items-center justify-center font-black text-sm">
                {selectedIds.length}
              </div>
              <p className="font-bold text-sm tracking-tight">Sessions Selected</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-white hover:bg-white/10 rounded-xl"
                onClick={() => setSelectedIds([])}
              >
                <X className="h-5 w-5" />
              </Button>
              <Button 
                onClick={handleBulkExport}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-10 px-6 rounded-xl shadow-lg border-none"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export (.xlsx)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
