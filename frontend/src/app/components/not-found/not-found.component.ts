import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Página No Encontrada</h2>
        <p>Lo sentimos, la página que buscas no existe.</p>
        <a routerLink="/dashboard" class="btn btn-primary">Volver al Dashboard</a>
      </div>
    </div>
  `,
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {}