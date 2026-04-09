import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, UserPlus, Users } from "lucide-react";

export default function PlayersView({ players, setPlayers }) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [playerToDelete, setPlayerToDelete] = useState(null);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    
    const exists = players.some(p => p.name.toLowerCase() === newPlayerName.trim().toLowerCase());
    if (exists) {
      toast.error("Player already exists!");
      return;
    }

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim()
    };
    
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    toast.success(`${newPlayer.name} added to roster.`);
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      setPlayers(players.filter(p => p.id !== playerToDelete.id));
      toast.info(`${playerToDelete.name} removed from roster.`);
      setPlayerToDelete(null);
    }
  };

  return (
    <div className="animate-slide-up w-full space-y-6">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Player
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPlayer} className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter player name..." 
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="h-12 bg-background/50 border-none shadow-inner"
            />
            <Button type="submit" disabled={!newPlayerName.trim()} className="h-12 px-6 font-bold shadow-lg shadow-primary/20">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3 bg-muted/5">
          <CardTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Global Roster
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground font-medium italic">No players added yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {players.map((player, index) => (
                <div 
                  key={player.id} 
                  className="group flex justify-between items-center py-5 px-3 hover:bg-muted/50 rounded-xl transition-all border-b border-border/30 last:border-0 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="font-bold text-lg tracking-tight">{player.name}</span>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    onClick={() => setPlayerToDelete(player)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Delete Player?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This will remove **{playerToDelete?.name}** from the roster. Historical data in closed sessions will remain, but they won't be available for new games.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="font-bold border-none hover:bg-muted rounded-xl">Keep Player</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold rounded-xl px-6">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
