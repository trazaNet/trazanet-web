import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ListasPersonalizadasService } from './services/listas-personalizadas.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withFetch()),
    ListasPersonalizadasService
  ]
};
