import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inicio-container">
      <header class="inicio-header">
        <h1>Bienvenido a TrazaNet</h1>
        <p class="subtitle">Sistema de Gestión de Trazabilidad Animal</p>
        <button class="start-button" (click)="navigate('datos')">
          <span>Comenzar</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </header>

      <div class="features-grid">
        <div class="feature-card" (click)="navigate('datos')">
          <div class="icon-container">
            <i class="fas fa-table"></i>
          </div>
          <h3>Gestión de Datos</h3>
          <p>Visualiza y gestiona la información de tus animales de manera eficiente</p>
        </div>

        <div class="feature-card" (click)="navigate('datos')">
          <div class="icon-container">
            <i class="fas fa-users"></i>
          </div>
          <h3>Gestión de Propietarios</h3>
          <p>Administra la información de propietarios y sus animales asociados</p>
        </div>

        <div class="feature-card" (click)="navigate('datos')">
          <div class="icon-container">
            <i class="fas fa-list"></i>
          </div>
          <h3>Listas Personalizadas</h3>
          <p>Crea y gestiona listas personalizadas de propietarios y animales</p>
        </div>

        <div class="feature-card" (click)="navigate('datos')">
          <div class="icon-container">
            <i class="fas fa-file-alt"></i>
          </div>
          <h3>Registro de Guías</h3>
          <p>Gestiona el registro y seguimiento de guías de manera eficiente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inicio-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .inicio-header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 3rem;
      background: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 100%);
      color: white;
      border-radius: 16px;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .inicio-header h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: white;
    }

    .subtitle {
      font-size: 1.4rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .start-button {
      background: white;
      color: var(--primary-green);
      border: none;
      padding: 1rem 2rem;
      border-radius: 50px;
      font-size: 1.2rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-md);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        background: var(--light-green);
      }

      i {
        transition: transform 0.3s ease;
      }

      &:hover i {
        transform: translateX(5px);
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      padding: 1rem;
      margin-top: 2rem;
    }

    .feature-card {
      background: var(--background-light);
      padding: 2rem;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
        border-color: var(--light-green);

        .icon-container {
          background: var(--light-green);
          transform: scale(1.1);
        }

        h3 {
          color: var(--primary-green);
        }
      }
    }

    .icon-container {
      background: var(--background-grey);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      transition: all 0.3s ease;
    }

    .icon-container i {
      font-size: 2rem;
      color: var(--primary-green);
    }

    .feature-card h3 {
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-size: 1.3rem;
      transition: color 0.3s ease;
    }

    .feature-card p {
      color: var(--text-secondary);
      line-height: 1.6;
      font-size: 1rem;
    }
  `]
})
export class InicioComponent {
  constructor(private router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
  }
} 