import { Injectable } from '@angular/core';

export interface GameMatch {
  username: string;
  category: string;
  title: string;
  attempts: number;
  time: string; 
  won: boolean;
  previewText?: string;
  date?: string;
}

export interface LeaderboardRow {
  username: string;
  gamesWon: number;
  averageTime: string;
  averageSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = 'http://localhost:3000/api';

  constructor() { }

  // Scarica lo storico dei match dal database PostgreSQL
async getMatches(): Promise<GameMatch[]> {
    try {
      // AGGIORNATO: Ora punta alla raccolta globale di tutte le partite
      const response = await fetch(`${this.apiUrl}/game-collection`);
      if (!response.ok) return [];
      
      const rows = await response.json();
      
      return rows.map((r: any) => ({
        username: r.username,
        category: r.category || '',
        title: r.title || '',
        attempts: r.attempts || 0,
        time: r.time_spent || '00:00',
        won: r.won ?? false,
        previewText: r.preview_text || '',
        date: r.data_partita ? new Date(r.data_partita).toLocaleString('it-IT') : ''
      }));
    } catch (error) {
      console.error('Errore nel recupero dei match dalla raccolta globale:', error);
      return [];
    }
  }

  // Invia la struttura piatta (flat) che il server si aspetta dentro req.body.dettagli
  async saveMatch(match: GameMatch): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/game/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: match.username,
          dettagli: {
            category: match.category,
            title: match.title,
            attempts: match.attempts,
            time: match.time, // Il server estrarrà 'time' da qui e lo salverà in 'time_spent'
            won: match.won,
            previewText: match.previewText
          }
        })
      });
      console.log('Match inviato correttamente al Database storico.');
    } catch (error) {
      console.error('Errore durante il salvataggio del match nel DB:', error);
    }
  }

  // Calcola la classifica leggendo i match asincroni dal DB
  async getCalculatedLeaderboard(): Promise<LeaderboardRow[]> {
    const allMatches = await this.getMatches();
    const userStats: { [username: string]: { totalSeconds: number, wonCount: number } } = {};

    allMatches.forEach(match => {
      if (!match || !match.username) return;
      
      const userTrimmed = match.username.trim();
      const userLower = userTrimmed.toLowerCase();
      
      // Escludiamo i non autenticati o diciture generiche (case-insensitive) dal calcolo della classifica
      if (
        userLower === '' || 
        userLower === 'giocatore' || 
        userLower === 'ospite' || 
        userLower === 'anonimo'
      ) {
        return; 
      }

      // Inizializziamo l'oggetto usando il nome originale salvato (preservando le maiuscole dell'utente)
      if (!userStats[userTrimmed]) {
        userStats[userTrimmed] = { totalSeconds: 0, wonCount: 0 };
      }

      const hasWon = match.won === true || (match.won as any) === 'true';

      if (hasWon) {
        userStats[userTrimmed].wonCount++;
        userStats[userTrimmed].totalSeconds += this.timeToSeconds(match.time);
      }
    });

    const leaderboard: LeaderboardRow[] = Object.keys(userStats).map(username => {
      const stats = userStats[username];
      const avgSeconds = stats.wonCount > 0 ? Math.round(stats.totalSeconds / stats.wonCount) : 0;

      return {
        username: username,
        gamesWon: stats.wonCount,
        averageSeconds: avgSeconds,
        averageTime: this.secondsToTime(avgSeconds)
      };
    });

    // Mostra in classifica solo chi ha vinto almeno una partita
    const filteredLeaderboard = leaderboard.filter(row => row.gamesWon > 0);

    return filteredLeaderboard.sort((a, b) => {
      if (b.gamesWon !== a.gamesWon) {
        return b.gamesWon - a.gamesWon; // Più partite vinte = primo posto
      }
      return a.averageSeconds - b.averageSeconds; // A parità di vittorie, tempo minore = migliore
    });
  }

  private timeToSeconds(timeStr: string): number {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.trim().split(':');
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return (minutes * 60) + seconds;
  }

  private secondsToTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minStr}:${secStr}`;
  }
}