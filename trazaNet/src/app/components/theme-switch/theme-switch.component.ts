import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-switch" (click)="toggleTheme()" [class.dark]="isDark$ | async">
      <div class="switch-track">
        <div class="switch-icons">
          <svg class="light-icon" viewBox="0 0 24 24" width="14" height="14">
            <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="12" y1="4" x2="12" y2="2" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="22" x2="12" y2="20" stroke="currentColor" stroke-width="2"/>
            <line x1="4" y1="12" x2="2" y2="12" stroke="currentColor" stroke-width="2"/>
            <line x1="22" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg class="dark-icon" viewBox="0 0 24 24" width="14" height="14">
            <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2V22C6.47715 22 2 17.5228 2 12Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="switch-thumb"></div>
      </div>
    </button>
  `,
  styles: [`
    .theme-switch {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      z-index: 1000;
      padding: 0;
    }

    .switch-track {
      width: 56px;
      height: 28px;
      padding: 2px;
      background-color: var(--background-grey);
      border-radius: 14px;
      position: relative;
      transition: all 0.3s ease;
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
    }

    .switch-icons {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 6px;
      position: relative;
      z-index: 1;
    }

    .light-icon,
    .dark-icon {
      color: #888888;
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }

    .theme-switch:not(.dark) .light-icon,
    .theme-switch.dark .dark-icon {
      opacity: 1;
    }

    .switch-thumb {
      width: 24px;
      height: 24px;
      background-color: white;
      border-radius: 50%;
      position: absolute;
      left: 2px;
      transition: transform 0.3s ease;
      box-shadow: var(--shadow-sm);
    }

    .theme-switch.dark .switch-thumb {
      transform: translateX(28px);
    }

    .theme-switch:hover .switch-track {
      border-color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .theme-switch {
        top: 0.5rem;
        right: 0.5rem;
      }
    }
  `]
})
export class ThemeSwitchComponent {
  private themeService: ThemeService;
  isDark$: any;

  constructor(themeService: ThemeService) {
    this.themeService = themeService;
    this.isDark$ = this.themeService.isDarkTheme$;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
} 