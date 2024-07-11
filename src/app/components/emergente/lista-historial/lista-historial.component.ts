import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turnos } from '../../../models/Interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-historial.component.html',
  styleUrl: './lista-historial.component.css'
})
export default class ListaHistorialComponent {

  @Input() turnos: Turnos[];
  @Output() cerrar = new EventEmitter<void>();

  cerrarModal() {
    this.cerrar.emit();
  }
}
