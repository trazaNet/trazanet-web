import { Component } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'TrazaNet';
  showSidebar = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.showSidebar = false;
  }
} 