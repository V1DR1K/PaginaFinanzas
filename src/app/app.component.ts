import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet], // Importa RouterOutlet para manejar rutas
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // Corrige el nombre de la propiedad
})
export class AppComponent {
  title = 'Pagina Finanzas';
}
