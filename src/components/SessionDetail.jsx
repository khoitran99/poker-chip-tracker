import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Info, CheckCircle2, AlertCircle, Check, ChevronsUpDown, X } from "lucide-react";

export default function SessionDetail({ session, updateSession, players }) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [incrementStep, setIncrementStep] = useState(1000);
  const [participantToRemove, setParticipantToRemove] = useState(null);

  if (!session) return null;

  const handleAddParticipant = (e) => {
    e.preventDefault();
    if (selectedPlayerIds.length === 0) return;

    const newParticipants = selectedPlayerIds.map(id => ({
      playerId: id,
      buyIn: 0,
      cashOut: 0
    }));

    updateSession(session.id, {
      ...session,
      participants: [...session.participants, ...newParticipants]
    });
    
    const count = selectedPlayerIds.length;
    setSelectedPlayerIds([]);
    toast.success(`${count} player${count > 1 ? 's' : ''} added to the session.`);
  };

  const togglePlayerSelection = (playerId) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

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

  const confirmRemove = () => {
    if (participantToRemove) {
      const playerName = getPlayerName(participantToRemove);
      updateSession(session.id, {
        ...session,
        participants: session.participants.filter(p => p.playerId !== participantToRemove)
      });
      toast.info(`${playerName} left the table.`);
      setParticipantToRemove(null);
    }
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
    <div className="animate-slide-up w-full space-y-6">
      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm mt-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-black">{session.name}</CardTitle>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                {new Date(session.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Live
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 py-4 mb-4 border-y border-border/50">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Buy In</p>
              <p className="font-extrabold text-2xl tracking-tighter">{totalBuyIn.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Cash Out</p>
              <p className="font-extrabold text-2xl tracking-tighter">{totalCashOut.toLocaleString()}</p>
            </div>
          </div>

          {totalBuyIn > 0 && !isBalanced && (
            <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold m-0">
                Session missing {Math.abs(balanceDifference).toLocaleString()} in cash out.
              </p>
            </div>
          )}
          {totalBuyIn > 0 && isBalanced && (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-bold m-0">Accounting balances perfectly.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-extrabold tracking-tight">Participants</CardTitle>
            <div className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded-lg">
              <Info className="h-3 w-3 text-muted-foreground" />
              <Label htmlFor="step" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Step:</Label>
              <Input 
                id="step"
                type="number" 
                value={incrementStep} 
                onChange={(e) => setIncrementStep(Number(e.target.value) || 1)}
                className="w-20 h-7 text-xs bg-transparent border-none shadow-none font-bold"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/50">
              <p className="text-muted-foreground font-bold italic">Create players in the Players tab first.</p>
            </div>
          ) : (
            <form onSubmit={handleAddParticipant} className="flex gap-2 mb-8">
              <div className="flex-1 min-w-0">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full h-12 bg-background/50 border-none shadow-inner rounded-xl justify-between px-4 hover:bg-background/60",
                        selectedPlayerIds.length === 0 && "text-muted-foreground"
                      )}
                    >
                      <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                        {selectedPlayerIds.length > 0 ? (
                          selectedPlayerIds.map(id => (
                            <Badge 
                              key={id} 
                              variant="secondary" 
                              className="rounded-lg h-6 px-1 flex items-center gap-1 group bg-primary/10 text-primary border-none whitespace-nowrap"
                            >
                              {getPlayerName(id)}
                              <X 
                                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePlayerSelection(id);
                                }}
                              />
                            </Badge>
                          ))
                        ) : (
                          "Select players..."
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-2xl border-none" align="start">
                    <Command className="rounded-2xl">
                      <CommandInput placeholder="Search players..." className="h-12" />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty className="py-12 flex flex-col items-center gap-3 font-medium">
                          {availablePlayers.length === 0 ? (
                            <>
                              <CheckCircle2 className="h-10 w-10 text-primary/20" />
                              <p className="text-sm text-muted-foreground font-medium max-w-[150px] mx-auto leading-relaxed text-center">
                                Everyone's already at the table.
                              </p>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                              <p className="text-muted-foreground">No players found.</p>
                            </>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {availablePlayers.map((player) => (
                            <CommandItem
                              key={player.id}
                              onSelect={() => togglePlayerSelection(player.id)}
                              className="h-12 px-4 cursor-pointer"
                            >
                                <div className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selectedPlayerIds.includes(player.id)
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50"
                                )}>
                                  {selectedPlayerIds.includes(player.id) && (
                                    <Check className="h-4 w-4" />
                                  )}
                                </div>
                                <span className="font-bold">{player.name}</span>
                              </CommandItem>
                            ))
                          }
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                type="submit" 
                disabled={selectedPlayerIds.length === 0} 
                className="h-12 px-6 rounded-xl shadow-lg shadow-primary/20 font-bold transition-all disabled:opacity-50"
              >
                {selectedPlayerIds.length > 1 ? `Add ${selectedPlayerIds.length}` : <Plus className="h-5 w-5" />}
              </Button>
            </form>
          )}

          <div className="space-y-6">
            {session.participants.map(p => {
              const buyIn = Number(p.buyIn) || 0;
              const cashOut = Number(p.cashOut) || 0;
              const profit = cashOut - buyIn;
              const isProfit = profit >= 0;

              return (
                <div key={p.playerId} className="group relative bg-background/40 p-4 rounded-2xl border border-border/30 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-extrabold text-xl tracking-tight">{getPlayerName(p.playerId)}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg group-hover:opacity-100 opacity-0 transition-opacity"
                      onClick={() => setParticipantToRemove(p.playerId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Buy In</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          min="0"
                          step={incrementStep}
                          value={p.buyIn} 
                          onChange={(e) => handleUpdateParticipant(p.playerId, 'buyIn', e.target.value)}
                          className="h-11 bg-background border-none shadow-sm rounded-xl font-bold text-lg"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Cash Out</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          min="0"
                          step={incrementStep}
                          value={p.cashOut} 
                          onChange={(e) => handleUpdateParticipant(p.playerId, 'cashOut', e.target.value)}
                          className="h-11 bg-background border-none shadow-sm rounded-xl font-bold text-lg"
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Profit/Loss</span>
                    <span className={`font-black text-xl tracking-tighter ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isProfit ? '+$' : '-$'}{Math.abs(profit).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {session.participants.length === 0 && (
              <p className="text-muted-foreground text-center py-8 font-medium italic">No participants yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!participantToRemove} onOpenChange={(open) => !open && setParticipantToRemove(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">Remove Participant?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This will remove **{getPlayerName(participantToRemove)}** from the current session. Their buy-in and cash-out data for this session will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel className="font-bold border-none hover:bg-muted rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold rounded-xl px-8">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
