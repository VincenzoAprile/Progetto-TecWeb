import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LeaderboardService, LeaderboardRow } from '../../services/leaderboard';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss'
})
export class Leaderboard implements OnInit {
  leaderboardRows: LeaderboardRow[] = []; 
  username: string = 'Giocatore'; 
  isGuest: boolean = false;        

  constructor(
    private leaderboardService: LeaderboardService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      if (navigation.extras.state['username']) {
        this.username = navigation.extras.state['username'];
      }
      if (navigation.extras.state['isGuest'] !== undefined) {
        this.isGuest = navigation.extras.state['isGuest'];
      }
    }
  }

  ngOnInit(): void {
    this.leaderboardRows = this.leaderboardService.getCalculatedLeaderboard();
  }

  goToMenu() {
    this.router.navigate(['/main-menu'], { 
      state: { 
        isGuest: this.isGuest, 
        username: this.username 
      } 
    });
  }

  clearHistory() {
    if (confirm('Sei sicuro di voler resettare la classifica cancellando tutti i dati?')) {
      this.leaderboardService.clearLeaderboard();
      this.leaderboardRows = [];
    }
  }
}