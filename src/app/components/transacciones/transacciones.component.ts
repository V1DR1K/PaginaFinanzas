import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransaccionesService } from '../../services/transacciones.service';

@Component({
  selector: 'app-transacciones',
  imports: [CommonModule],
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss'],
})
export class TransaccionesComponent implements OnInit {
  transacciones: { descripcion: string; monto: number; tipo: string }[] = [];

  constructor(private transaccionesService: TransaccionesService) {}

  ngOnInit(): void {
    // Consultar transacciones desde el backend
    this.transaccionesService.getTransacciones().subscribe((data) => {
      this.transacciones = data;
    });
  }
}
