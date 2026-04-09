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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import { Users, Trash2, Plus, X, ChevronsUpDown, AlertCircle, CheckCircle2, Search, UserPlus, Check, ListPlus } from "lucide-react";

export default function SessionDetail({ session, updateSession, players, setPlayers }) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);
  
  // Quick player creation state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkNames, setBulkNames] = useState("");
  const [searchValue, setSearchValue] = useState("");

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

  const handleBulkQuickCreate = (e) => {
    e.preventDefault();
    if (!bulkNames.trim()) return;

    const names = bulkNames
      .split(/\n|,/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const uniqueInputNames = [...new Set(names)];
    const existingNames = new Set(players.map(p => p.name.toLowerCase()));
    const newNames = uniqueInputNames.filter(n => !existingNames.has(n.toLowerCase()));

    if (newNames.length === 0) {
      toast.info("No new players found.");
      return;
    }

    const newPlayers = newNames.map(name => ({
      id: (Date.now() + Math.random()).toString(),
      name: name
    }));

    setPlayers([...players, ...newPlayers]);
    
    // Automatically select all NEW players
    setSelectedPlayerIds(prev => [...prev, ...newPlayers.map(p => p.id)]);
    
    setBulkNames("");
    setIsBulkMode(false);
    toast.success(`Registered ${newPlayers.length} players to the roster.`);
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
      <Card className="glass-card mt-4">
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
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Total Buy In</p>
              <p className="font-extrabold text-2xl tracking-tighter leading-none">{totalBuyIn.toLocaleString()}</p>
            </div>
            <div className="space-y-1 border-l border-border/50 pl-4">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Total Cash Out</p>
              <p className="font-extrabold text-2xl tracking-tighter leading-none">{totalCashOut.toLocaleString()}</p>
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

      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-4 bg-muted/5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-extrabold tracking-tight">Participants</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddParticipant} className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 min-w-0">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full h-12 bg-background/50 border-border/40 shadow-inner rounded-xl justify-between px-4 hover:bg-background/80 hover:border-primary/20 transition-all",
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
                  <PopoverContent className="p-0 w-[400px] rounded-2xl glass-card border-none overflow-hidden shadow-2xl" align="start">
                    {isBulkMode ? (
                      <div className="flex flex-col p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center bg-primary/5 -mx-5 -mt-5 p-4 mb-2 border-b border-border/20">
                          <span className="font-black tracking-tight text-primary uppercase text-xs">Bulk Mode</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsBulkMode(false)}
                            className="h-8 rounded-lg font-bold hover:bg-muted"
                          >
                            Back to List
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Paste names separated by commas or line breaks..."
                            className="min-h-[180px] text-lg font-bold bg-muted/20 border-none shadow-inner rounded-2xl p-4 focus-visible:ring-primary/10 no-scrollbar"
                            value={bulkNames}
                            onChange={(e) => setBulkNames(e.target.value)}
                            autoFocus
                          />
                          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">
                            Found {bulkNames.split(/\n|,/).map(n => n.trim()).filter(n => n.length > 0).length} potential names
                          </p>
                        </div>

                        <Button 
                          onClick={handleBulkQuickCreate}
                          disabled={!bulkNames.trim()}
                          className="h-12 rounded-xl shadow-lg shadow-primary/20 font-black tracking-tight active:scale-95 transition-all text-base"
                        >
                          Register & Select All
                          <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Command className="bg-transparent" shouldFilter={true}>
                        <div className="flex items-center border-b border-border/20 px-3 h-14">
                          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                          <CommandInput 
                            placeholder="Find or register players..." 
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus:ring-0 font-bold"
                            value={searchValue}
                            onValueChange={setSearchValue}
                          />
                        </div>
                        <CommandList className="max-h-[350px] overflow-y-auto no-scrollbar pb-12 relative">
                          <CommandEmpty>
                            <div className="flex flex-col items-center justify-center py-10 px-4 space-y-4">
                              {searchValue ? (
                                <>
                                  <div className="p-4 bg-primary/5 rounded-full">
                                    <UserPlus className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="text-center space-y-1">
                                    <p className="font-black text-lg">"{searchValue}"</p>
                                    <p className="text-xs text-muted-foreground font-medium">New player found!</p>
                                  </div>
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      const newPlayer = {
                                        id: (Date.now() + Math.random()).toString(),
                                        name: searchValue
                                      };
                                      setPlayers([...players, newPlayer]);
                                      setSelectedPlayerIds(prev => [...prev, newPlayer.id]);
                                      setSearchValue("");
                                      toast.success(`Registered ${newPlayer.name}`);
                                    }}
                                    className="rounded-xl font-bold h-10 px-6 shadow-md shadow-primary/10"
                                  >
                                    Register & Select
                                  </Button>
                                </>
                              ) : availablePlayers.length === 0 ? (
                                <>
                                  <CheckCircle2 className="h-10 w-10 text-primary/20" />
                                  <p className="text-sm text-muted-foreground font-medium max-w-[150px] mx-auto leading-relaxed text-center">
                                    Everyone's already at the table.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
                                  <p className="text-muted-foreground">No players match search.</p>
                                </>
                              )}
                            </div>
                          </CommandEmpty>
                          
                          <CommandGroup>
                            {/* Fast Add Option when searching */}
                            {searchValue && !availablePlayers.some(p => p.name.toLowerCase() === searchValue.toLowerCase()) && (
                              <CommandItem
                                onSelect={() => {
                                    const newPlayer = {
                                      id: (Date.now() + Math.random()).toString(),
                                      name: searchValue
                                    };
                                    setPlayers([...players, newPlayer]);
                                    setSelectedPlayerIds(prev => [...prev, newPlayer.id]);
                                    setSearchValue("");
                                    toast.success(`Registered ${newPlayer.name}`);
                                }}
                                className="h-14 px-4 cursor-pointer text-primary border-b border-border/10 bg-primary/5 hover:bg-primary/10 transition-colors"
                              >
                                <Plus className="mr-3 h-4 w-4 opacity-50" />
                                <div className="flex flex-col">
                                  <span className="font-black text-sm">Register "{searchValue}"</span>
                                  <span className="text-[10px] opacity-60 uppercase font-black tracking-widest">New Roster Entry</span>
                                </div>
                              </CommandItem>
                            )}

                            {availablePlayers.map((player) => (
                              <CommandItem
                                key={player.id}
                                value={player.name}
                                onSelect={() => togglePlayerSelection(player.id)}
                                className="h-14 px-4 cursor-pointer data-[selected=true]:bg-primary/5 transition-colors border-b border-border/5 group"
                              >
                                <div className={cn(
                                  "mr-3 flex h-5 w-5 items-center justify-center rounded-md border-2 border-primary/20 transition-all scale-100",
                                  selectedPlayerIds.includes(player.id)
                                    ? "bg-primary border-primary text-primary-foreground scale-105"
                                    : "opacity-40 group-hover:opacity-100"
                                )}>
                                  {selectedPlayerIds.includes(player.id) && (
                                    <Check className="h-3.5 w-3.5 stroke-[4]" />
                                  )}
                                </div>
                                <span className="font-bold text-sm tracking-tight">{player.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background to-transparent pt-6 pointer-events-none"></div>
                          
                          <div className="absolute bottom-1 left-1 right-1 pointer-events-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setIsBulkMode(true)}
                              className="w-full h-10 rounded-xl bg-muted/30 border-none hover:bg-primary/5 hover:text-primary font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                              <ListPlus className="mr-2 h-3.5 w-3.5" />
                              Bulk Roster Entry
                            </Button>
                          </div>
                        </CommandList>
                      </Command>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                type="submit" 
                disabled={selectedPlayerIds.length === 0} 
                className="h-12 px-8 rounded-xl shadow-lg shadow-primary/20 font-black tracking-tight transition-all active:scale-95 disabled:opacity-30 flex-shrink-0"
              >
                {selectedPlayerIds.length > 1 ? `Join ${selectedPlayerIds.length} Players` : "Join Table"}
                {selectedPlayerIds.length === 0 && <Plus className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          
          <div className="space-y-6">
            {session.participants.map((p, index) => {
              const buyIn = Number(p.buyIn) || 0;
              const cashOut = Number(p.cashOut) || 0;
              const profit = cashOut - buyIn;
              const isProfit = profit >= 0;

              return (
                <div 
                  key={p.playerId} 
                  className="group relative bg-background/40 p-5 rounded-2xl border border-border/30 hover:border-primary/20 hover:bg-background/60 transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
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
