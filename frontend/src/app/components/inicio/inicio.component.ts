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
        <button class="start-button" (click)="navigate('mis-animales')">
          <span>Comenzar</span>
          <span>→</span>
        </button>
      </header>

      <div class="features-grid">
        <div class="feature-card" (click)="navigate('mis-animales')">
          <div class="icon-container">
            <span>🐄</span>
          </div>
          <h3>Gestión de Datos</h3>
          <p>Visualiza y gestiona la información de tus animales de manera eficiente</p>
        </div>

        <div class="feature-card" (click)="navigate('mis-animales')">
          <div class="icon-container">
            <span>👥</span>
          </div>
          <h3>Gestión de Propietarios</h3>
          <p>Administra la información de propietarios y sus animales asociados</p>
        </div>

        <div class="feature-card" (click)="navigate('mis-animales')">
          <div class="icon-container">
            <span>📋</span>
          </div>
          <h3>Listas Personalizadas</h3>
          <p>Crea y gestiona listas personalizadas de propietarios y animales</p>
        </div>

        <div class="feature-card" (click)="navigate('mis-animales')">
          <div class="icon-container">
            <span>📄</span>
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
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
      color: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      color: #2ecc71;
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
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .start-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      background: #f0f9f4;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      padding: 1rem;
      margin-top: 2rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-color: #2ecc71;
    }

    .icon-container {
      background: #f8f9fa;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      transition: all 0.3s ease;
      font-size: 2rem;
    }

    .feature-card:hover .icon-container {
      background: #f0f9f4;
      transform: scale(1.1);
    }

    .feature-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.3rem;
      transition: color 0.3s ease;
    }

    .feature-card:hover h3 {
      color: #2ecc71;
    }

    .feature-card p {
      color: #7f8c8d;
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