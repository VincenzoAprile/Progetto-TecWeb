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

  constructor() { }

  getMatches(): GameMatch[] {
    const matches = localStorage.getItem('wiki_matches');
    return matches ? JSON.parse(matches) : [];
  }

  saveMatch(match: GameMatch): void {
    const matches = this.getMatches();
    match.date = new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    matches.unshift(match); 
    localStorage.setItem('wiki_matches', JSON.stringify(matches));
  }

  clearLeaderboard(): void {
    localStorage.removeItem('wiki_matches');
  }

  getCalculatedLeaderboard(): LeaderboardRow[] {
    const allMatches = this.getMatches();
    const userStats: { [username: string]: { totalSeconds: number, wonCount: number } } = {};

 
    allMatches.forEach(match => {
      const userLower = match.username.trim();
      
      if (!userLower || userLower === 'Giocatore' || userLower === 'Ospite' || userLower === 'Anonimo') {
        return; 
      }

      if (!userStats[match.username]) {
        userStats[match.username] = { totalSeconds: 0, wonCount: 0 };
      }

      if (match.won) {
        userStats[match.username].wonCount++;
        userStats[match.username].totalSeconds += this.timeToSeconds(match.time);
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

    return leaderboard.sort((a, b) => {
      if (b.gamesWon !== a.gamesWon) {
        return b.gamesWon - a.gamesWon;
      }
      return a.averageSeconds - b.averageSeconds;
    });
  }

  private timeToSeconds(timeStr: string): number {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':');
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