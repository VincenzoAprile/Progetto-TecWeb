import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor() {}
  
  async registerUser(credentials: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Impossibile connettersi al server.' };
    }
  }

  // AGGIORNATO: Ora restituisce anche il token JWT se il login ha successo
  async loginUser(credentials: any): Promise<{ success: boolean; username?: string; token?: string; error?: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error };
      
      // Ritorniamo anche data.token ricevuto dal server Node.js
      return { 
        success: true, 
        username: data.username, 
        token: data.token 
      };
    } catch (error) {
      return { success: false, error: 'Impossibile connettersi al server.' };
    }
  }
}
