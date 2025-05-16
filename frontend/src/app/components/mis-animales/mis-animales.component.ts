import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnimalesService } from '../../services/animales.service';
import { AuthService } from '../../services/auth.service';
import { Animal } from '../../interfaces/animal.interface';

@Component({
  selector: 'app-mis-animales',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-animales.component.html',
  styleUrls: ['./mis-animales.component.css']
})
export class MisAnimalesComponent implements OnInit {
  animales: Animal[] = [];
  loading: boolean = true;
  error: string | null = null;
  selectedAnimal: Animal | null = null;
  showDetails: boolean = false;

  constructor(
    private animalesService: AnimalesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnimales();
  }

  loadAnimales(): void {
    this.loading = true;
    this.error = null;
    
    this.animalesService.getMisAnimales().subscribe({
      next: (data) => {
        this.animales = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los animales. Por favor, intente nuevamente.';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  openDetails(animal: Animal): void {
    this.selectedAnimal = animal;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedAnimal = null;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
} 