import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turnos } from '../../../models/Interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.css'
})
export default class EncuestaComponent {

  @Input() turno: Turnos;
  @Output() encuestaCompletada: EventEmitter<Turnos> = new EventEmitter<Turnos>();

  experienciaHospital: 'Excelente' | 'Bueno' | 'Malo' | '' = '';
  recomendarHospital: boolean = false;
  comentario: string = '';

  enviarEncuesta() {
    if (this.turno) {
      this.turno.encuesta = {
        experienciaHospital: this.experienciaHospital,
        recomendarHospital: this.recomendarHospital,
        comentario: this.comentario,
        seRealizoEncuesta: true
      };
      this.encuestaCompletada.emit(this.turno);
    }
  }
}
