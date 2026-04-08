import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, ListChecks } from "lucide-react";

export default function SummaryView({ sessions, players }) {
  const [selectedSessionIds, setSelectedSessionIds] = useState(
    sessions.map(s => s.id)
  );

  const toggleSession = (id) => {
    setSelectedSessionIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedSessionIds.length === sessions.length) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(sessions.map(s => s.id));
    }
  };

  const aggregatedStats = useMemo(() => {
    const stats = {};

    sessions.forEach(session => {
      if (!selectedSessionIds.includes(session.id)) return;

      session.participants.forEach(p => {
        if (!stats[p.playerId]) {
          stats[p.playerId] = { buyIn: 0, cashOut: 0, profit: 0, sessionsPlayed: 0 };
        }
        
        const b = Number(p.buyIn) || 0;
        const c = Number(p.cashOut) || 0;
        
        stats[p.playerId].buyIn += b;
        stats[p.playerId].cashOut += c;
        stats[p.playerId].profit += (c - b);
        stats[p.playerId].sessionsPlayed += 1;
      });
    });

    return Object.entries(stats).map(([playerId, data]) => ({
      playerId,
      name: players.find(p => p.id === playerId)?.name || 'Unknown',
      ...data
    })).sort((a, b) => b.profit - a.profit);
  }, [sessions, selectedSessionIds, players]);

  if (sessions.length === 0) {
    return (
      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm text-center py-16 px-4 rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-muted p-4 rounded-full">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight mb-2">No Session History</h3>
            <p className="text-muted-foreground font-medium italic">Complete some poker sessions to unlock advanced analytics.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-slide-up w-full space-y-6">
      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Filter Sessions
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleAll}
              className="text-xs font-bold border-none bg-background/50 hover:bg-background h-8 rounded-lg"
            >
              {selectedSessionIds.length === sessions.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] w-full pr-4">
            <div className="flex flex-col gap-1">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  className="flex items-center space-x-3 py-3 px-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer group"
                  onClick={() => toggleSession(session.id)}
                >
                  <Checkbox 
                    id={session.id} 
                    checked={selectedSessionIds.includes(session.id)}
                    onCheckedChange={() => toggleSession(session.id)}
                    className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={session.id}
                    className="text-sm font-bold leading-none cursor-pointer flex-1 group-hover:text-primary transition-colors"
                  >
                    {session.name}
                    <span className="ml-2 font-medium text-muted-foreground whitespace-nowrap">
                      • {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl font-extrabold tracking-tight">Cumulative Roster Rankings</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6"> {/* Bleed on mobile */}
          {selectedSessionIds.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-bold italic">Select at least one session to view totals.</p>
            </div>
          ) : aggregatedStats.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-bold italic">No data found in selected sessions.</p>
            </div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader className="bg-muted/30 pointer-events-none">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-4 px-4 font-black text-[10px] uppercase tracking-widest">Player</TableHead>
                    <TableHead className="py-4 px-4 text-right font-black text-[10px] uppercase tracking-widest hidden sm:table-cell">Played</TableHead>
                    <TableHead className="py-4 px-4 text-right font-black text-[10px] uppercase tracking-widest font-black">Buy In</TableHead>
                    <TableHead className="py-4 px-4 text-right font-black text-[10px] uppercase tracking-widest font-black">Cash Out</TableHead>
                    <TableHead className="py-4 px-4 text-right font-black text-[10px] uppercase tracking-widest font-black">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedStats.map((stat) => {
                    const isProfit = stat.profit >= 0;
                    return (
                      <TableRow key={stat.playerId} className="hover:bg-muted/30 border-border/50 transition-colors group">
                        <TableCell className="py-5 px-4">
                          <span className="font-extrabold text-base tracking-tight">{stat.name}</span>
                        </TableCell>
                        <TableCell className="py-5 px-4 text-right text-xs font-bold text-muted-foreground hidden sm:table-cell">
                          {stat.sessionsPlayed} games
                        </TableCell>
                        <TableCell className="py-5 px-4 text-right">
                          <span className="text-sm font-bold text-muted-foreground">${stat.buyIn.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="py-5 px-4 text-right">
                          <span className="text-sm font-bold text-muted-foreground">${stat.cashOut.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="py-5 px-4 text-right">
                          <span className={`font-black text-lg tracking-tighter ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isProfit ? '+$' : '-$'}{Math.abs(stat.profit).toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
