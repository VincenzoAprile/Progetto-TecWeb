import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/game';

  constructor() {}

  async saveCurrentGameState(state: any): Promise<void> {
    try {
      console.log('Tentativo di salvataggio stato sul server per:', state.username);
      const response = await fetch(`${this.apiUrl}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state)
      });
      const data = await response.json();
      console.log('Risposta server salvataggio:', data);
    } catch (error) {
      console.error('Errore nel salvataggio della partita su server:', error);
    }
  }

  async getSavedGameState(username: string): Promise<any> {
    try {
      console.log('Richiesta caricamento partita dal server per:', username);
      const response = await fetch(`${this.apiUrl}/load/${username}`);
      
      if (!response.ok) return null;
      
      const data = await response.json();
      console.log('Dati partita caricati dal server:', data);
      return data;
    } catch (error) {
      console.error('Errore nel caricamento della partita da server:', error);
      return null;
    }
  }

  async clearActiveGame(username: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/clear/${username}`, {
        method: 'DELETE'
      });
      console.log('Partita attiva cancellata dal server per:', username);
    } catch (error) {
      console.error('Errore nella cancellazione della partita su server:', error);
    }
  }
}