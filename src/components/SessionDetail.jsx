import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { exportSessionToExcel } from "@/lib/exportUtils";
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
import { Users, Trash2, Plus, X, AlertCircle, CheckCircle2, Search, UserPlus, Check, ListPlus, FileSpreadsheet, Crown, Coins } from "lucide-react";

const generateUniqueName = (name, currentPlayers) => {
  let uniqueName = name.trim();
  let counter = 2;
  const existingNames = currentPlayers.map(p => p.name.toLowerCase());
  
  while (existingNames.includes(uniqueName.toLowerCase())) {
    uniqueName = `${name.trim()} #${counter}`;
    counter++;
  }
  return uniqueName;
};

export default function SessionDetail({ session, updateSession, players, setPlayers }) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);
  
  // Selection Modal state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkNames, setBulkNames] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const availablePlayers = useMemo(() => {
    if (!session) return [];
    return players.filter(
      p => !session.participants.some(part => part.playerId === p.id)
    );
  }, [players, session]);

  const filteredAvailablePlayers = useMemo(() => {
    if (!searchValue.trim()) return availablePlayers;
    const search = searchValue.toLowerCase().trim();
    return availablePlayers.filter(p => 
      p.name.toLowerCase().includes(search)
    );
  }, [availablePlayers, searchValue]);

  const hasExactRosterMatch = useMemo(() => {
    if (!searchValue.trim()) return false;
    const search = searchValue.toLowerCase().trim();
    return players.some(p => p.name.toLowerCase() === search);
  }, [players, searchValue]);

  if (!session) return null;

  const handleAddParticipant = (e) => {
    if (e) e.preventDefault();
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
    setOpen(false);
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
    if (e) e.preventDefault();
    if (!bulkNames.trim()) return;

    const names = bulkNames
      .split(/\n|,/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const newPlayersList = [...players];
    const registeredPlayers = [];

    names.forEach(name => {
      const uniqueName = generateUniqueName(name, newPlayersList);
      const newPlayer = {
        id: (Date.now() + Math.random()).toString(),
        name: uniqueName
      };
      newPlayersList.push(newPlayer);
      registeredPlayers.push(newPlayer);
    });

    setPlayers(newPlayersList);
    setSelectedPlayerIds(prev => [...prev, ...registeredPlayers.map(p => p.id)]);
    
    setBulkNames("");
    setIsBulkMode(false);
    setOpen(false);
    toast.success(`Registered ${registeredPlayers.length} players to the roster.`);
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

  const toggleDealer = (playerId) => {
    const updatedParticipants = session.participants.map(p => ({
      ...p,
      isDealer: p.playerId === playerId ? !p.isDealer : false
    }));
    updateSession(session.id, { ...session, participants: updatedParticipants });
    if (!updatedParticipants.find(p => p.playerId === playerId)?.isDealer) {
      toast.info("Dealer role removed.");
    } else {
      toast.success(`${getPlayerName(playerId)} set as Dealer.`);
    }
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
  
  const dealerFee = Number(session.dealerFee) || 0;
  const dealer = session.participants.find(p => p.isDealer);
  const numOthers = session.participants.length - (dealer ? 1 : 0);
  const totalFeesCollected = numOthers * dealerFee;

  session.participants.forEach(p => {
    totalBuyIn += Number(p.buyIn) || 0;
    totalCashOut += Number(p.cashOut) || 0;
  });
  
  const balanceDifference = totalBuyIn - totalCashOut;
  const isBalanced = balanceDifference === 0;

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
            <div className="flex gap-2">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider h-max">
                Live
              </div>
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

      <Card className="glass-card shadow-lg border-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground leading-none mb-1">Dealer Settings</p>
                <h3 className="text-lg font-black tracking-tight leading-none">Automated Dealer Fee</h3>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-2xl border border-border/10 w-full sm:w-auto">
              <div className="pl-3 pr-1 text-xs font-black uppercase tracking-widest text-muted-foreground border-r border-border/20 mr-1">
                Fee
              </div>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={session.dealerFee || ""}
                onChange={(e) => updateSession(session.id, { ...session, dealerFee: e.target.value })}
                className="h-10 w-full sm:w-28 bg-transparent border-none text-right font-black text-xl focus-visible:ring-0 shadow-none p-0 pr-2"
              />
              <div className="font-black text-muted-foreground/40 pr-3">
                $
              </div>
            </div>
          </div>
          
          {dealerFee > 0 && !dealer && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
              <AlertCircle className="h-3 w-3" />
              Select a dealer below to apply fees
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
          <div className="flex justify-between items-center mb-8">
            <div className="flex-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 ml-1">Table Roster</p>
              <h3 className="text-lg font-black">{session.participants.length} Active Players</h3>
            </div>
            
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (!val) {
                setSearchValue("");
                setIsBulkMode(false);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20 font-black tracking-tight active:scale-95 transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Players
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none glass-card shadow-2xl rounded-3xl gap-0 h-[600px] sm:h-[650px] flex flex-col">
                <DialogHeader className="p-6 pb-4 bg-muted/5 border-b border-border/10">
                  <DialogTitle className="text-2xl font-black tracking-tight uppercase">Add Players</DialogTitle>
                  <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    Select players from roster or register new ones.
                  </DialogDescription>
                </DialogHeader>

                {/* Sticky Header Section */}
                <div className="flex flex-col border-b border-border/10 bg-muted/5 pb-2">
                  {/* Mode Selector - Sticky */}
                  <div className="flex p-1 bg-muted/50 mx-6 mt-4 rounded-xl border border-border/10">
                    <Button
                      variant={!isBulkMode ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("flex-1 h-9 font-bold rounded-lg text-xs transition-all", !isBulkMode ? "bg-background shadow-sm" : "text-muted-foreground")}
                      onClick={() => setIsBulkMode(false)}
                    >
                      Browse Roster
                    </Button>
                    <Button
                      variant={isBulkMode ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("flex-1 h-9 font-bold rounded-lg text-xs transition-all", isBulkMode ? "bg-background shadow-sm" : "text-muted-foreground")}
                      onClick={() => setIsBulkMode(true)}
                    >
                      Bulk Entry
                    </Button>
                  </div>

                  {/* Selection Strip - Sticky */}
                  {!isBulkMode && selectedPlayerIds.length > 0 && (
                    <div className="px-6 py-3 border-b border-border/5 bg-primary/5 mt-2">
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {selectedPlayerIds.map(id => (
                          <Badge 
                            key={id} 
                            variant="secondary" 
                            className="rounded-lg h-7 pl-2 pr-1 flex items-center gap-1.5 bg-primary text-primary-foreground border-none shadow-md"
                          >
                            <span className="text-xs font-bold">{getPlayerName(id)}</span>
                            <X 
                              className="h-3.5 w-3.5 cursor-pointer hover:bg-white/20 rounded-full p-0.5 transition-colors" 
                              onClick={() => togglePlayerSelection(id)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Bar - Sticky (Only in list mode) */}
                  {!isBulkMode && (
                    <div className="px-6 py-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search or type new name..." 
                          className="pl-10 h-11 bg-background border-none shadow-sm rounded-xl font-bold"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                  {isBulkMode ? (
                    <div className="p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Paste Names</Label>
                        <Textarea
                          placeholder="Alice, Bob, Charlie..."
                          className="min-h-[280px] text-lg font-bold bg-muted/20 border-none shadow-inner rounded-2xl p-4 focus-visible:ring-primary/10 no-scrollbar resize-none"
                          value={bulkNames}
                          onChange={(e) => setBulkNames(e.target.value)}
                          autoFocus
                        />
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">
                          Detected {bulkNames.split(/\n|,/).map(n => n.trim()).filter(n => n.length > 0).length} players
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="p-4 space-y-1 pb-8">
                        {/* Inline Registration Logic */}
                        {searchValue.trim() && (
                          <div 
                            onClick={() => {
                              const uniqueName = generateUniqueName(searchValue.trim(), players);
                              const newPlayer = {
                                id: (Date.now() + Math.random()).toString(),
                                name: uniqueName
                              };
                              setPlayers([...players, newPlayer]);
                              setSelectedPlayerIds(prev => [...prev, newPlayer.id]);
                              setSearchValue("");
                              toast.success(`Registered ${uniqueName}`);
                            }}
                            className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer bg-primary/5 hover:bg-primary/10 transition-all border border-primary/20 group mx-2 mb-2"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                              <UserPlus className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-sm text-primary">
                                {hasExactRosterMatch ? `Add Another "${searchValue}"` : `Register "${searchValue}"`}
                              </p>
                              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">
                                {hasExactRosterMatch ? "Already exists" : "New Player"}
                              </p>
                            </div>
                          </div>
                        )}

                        {filteredAvailablePlayers.map((player) => (
                          <div
                            key={player.id}
                            onClick={() => togglePlayerSelection(player.id)}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-muted/50 mx-2",
                              selectedPlayerIds.includes(player.id) && "bg-primary/5 border-primary/10"
                            )}
                          >
                            <div className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-lg border-2 border-primary/20 transition-all",
                              selectedPlayerIds.includes(player.id) && "bg-primary border-primary text-primary-foreground"
                            )}>
                              {selectedPlayerIds.includes(player.id) && <Check className="h-4 w-4 stroke-[3]" />}
                            </div>
                            <span className="font-bold text-base tracking-tight">{player.name}</span>
                          </div>
                        ))}

                        {filteredAvailablePlayers.length === 0 && !searchValue && (
                          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-3">
                            <Users className="h-12 w-12 text-muted-foreground/20" />
                            <p className="text-sm font-bold text-muted-foreground leading-tight">
                              No players available.<br /><span className="text-xs font-medium uppercase tracking-tighter opacity-50">All joined or roster is empty</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="p-6 pt-2 border-t border-border/10 bg-muted/5">
                  <div className="flex w-full gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1 h-12 rounded-xl font-bold"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    {isBulkMode ? (
                      <Button
                        disabled={!bulkNames.trim()}
                        onClick={handleBulkQuickCreate}
                        className="flex-[2] h-12 rounded-xl shadow-lg shadow-primary/20 font-black tracking-tight"
                      >
                        Register & Select
                        <Plus className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        disabled={selectedPlayerIds.length === 0}
                        onClick={handleAddParticipant}
                        className="flex-[2] h-12 rounded-xl shadow-lg shadow-primary/20 font-black tracking-tight"
                      >
                       {selectedPlayerIds.length > 0 ? `Join ${selectedPlayerIds.length} Players` : "Join Session"}
                        <Plus className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-6">
            {session.participants.map((p, index) => {
              const buyIn = Number(p.buyIn) || 0;
              const cashOut = Number(p.cashOut) || 0;
              
              // Calculate adjusted profit based on dealer fee
              let profit = cashOut - buyIn;
              if (dealerFee > 0 && dealer) {
                if (p.isDealer) {
                  profit += totalFeesCollected;
                } else {
                  profit -= dealerFee;
                }
              }
              
              const isProfit = profit >= 0;

              return (
                <div 
                  key={p.playerId} 
                  className={cn(
                    "group relative bg-background/40 p-5 rounded-2xl border border-border/30 hover:border-primary/20 hover:bg-background/60 transition-all animate-slide-up",
                    p.isDealer && "ring-2 ring-amber-500/50 bg-amber-500/5"
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-extrabold text-xl tracking-tight truncate">{getPlayerName(p.playerId)}</span>
                      {p.isDealer && (
                        <Badge className="bg-amber-500 text-white border-none text-[10px] font-black tracking-widest px-2 h-5">
                          DEALER
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleDealer(p.playerId)}
                        className={cn(
                          "h-10 w-10 transition-all rounded-xl",
                          p.isDealer 
                            ? "bg-amber-500 text-white hover:bg-amber-600 border-none shadow-lg shadow-amber-500/20" 
                            : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Crown className={cn("h-5 w-5", p.isDealer && "stroke-[3]")} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl group-hover:opacity-100 opacity-0 transition-opacity"
                        onClick={() => setParticipantToRemove(p.playerId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                          className="h-11 bg-background border-none shadow-sm rounded-xl font-bold text-lg focus-visible:ring-primary/20"
                          onFocus={(e) => {
                            const target = e.target;
                            setTimeout(() => {
                              try { target.select(); } catch (e) {}
                            }, 50);
                          }}
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
                          className="h-11 bg-background border-none shadow-sm rounded-xl font-bold text-lg focus-visible:ring-primary/20"
                          onFocus={(e) => {
                            const target = e.target;
                            setTimeout(() => {
                              try { target.select(); } catch (e) {}
                            }, 50);
                          }}
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

      <div className="flex justify-center pt-8 pb-12">
        <Button
          onClick={() => exportSessionToExcel(session, players)}
          className="h-14 px-10 rounded-2xl shadow-2xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg tracking-tight transition-all active:scale-95"
        >
          <FileSpreadsheet className="h-6 w-6 mr-3" />
          Export Session Data (.xlsx)
        </Button>
      </div>
    </div>
  );
}
