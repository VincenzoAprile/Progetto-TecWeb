import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardService, GameMatch } from '../../services/leaderboard';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-history',
  imports: [CommonModule],
  templateUrl: './game-history.html',
  styleUrl: './game-history.scss',
})
export class GameHistory implements OnInit {
  
  historyMatches: GameMatch[] = [];
  isGuest: boolean = false; 
  username: string = 'Giocatore'; 

  constructor(
    private leaderboardService: LeaderboardService,
    private router: Router
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation && currentNavigation.extras.state) {
      if (currentNavigation.extras.state['isGuest'] !== undefined) {
        this.isGuest = currentNavigation.extras.state['isGuest'];
      }
      if (currentNavigation.extras.state['username']) {
        this.username = currentNavigation.extras.state['username'];
      }
    }
  }

  ngOnInit(): void {
    this.historyMatches = this.leaderboardService.getMatches();
  }

  goBack() {
    console.log(`Ritorno al menu principale, ripasso l'utente: ${this.username}`);
    this.router.navigate(['/main-menu'], { 
      state: { 
        isGuest: this.isGuest, 
        username: this.username 
      } 
    });
  }
}