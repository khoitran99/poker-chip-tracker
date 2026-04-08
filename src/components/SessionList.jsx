import React, { useState } from 'react';
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
import { Trash2, PlusCircle, History } from "lucide-react";

export default function SessionList({ sessions, setSessions, onSelectSession }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);

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

  return (
    <div className="animate-slide-up w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight leading-none">History</h2>
          <p className="text-muted-foreground text-sm mt-2 font-medium">Your past tracking sessions</p>
        </div>
        
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

      {sessions.length === 0 ? (
        <div className="bg-muted/30 text-center py-20 px-6 border-2 border-dashed border-border rounded-2xl">
          <h3 className="text-xl font-bold mb-2">No Sessions Yet</h3>
          <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">Toss some cards and start your first session above.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map(session => {
            const totalBuyIn = getSessionStats(session.participants);
            
            return (
              <div 
                key={session.id} 
                className="group relative bg-card text-card-foreground border border-border cursor-pointer p-6 transition-all duration-300 hover:ring-2 hover:ring-primary/20 hover:border-primary/30 rounded-2xl shadow-sm overflow-hidden" 
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex justify-between items-start relative z-10">
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
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-6 flex justify-between items-end border-t border-border pt-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">Players</span>
                      <span className="text-sm font-bold">{session.participants.length}</span>
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
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
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
    </div>
  );
}
