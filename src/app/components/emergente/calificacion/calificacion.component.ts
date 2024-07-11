import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Turnos } from '../../../models/Interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calificacion',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './calificacion.component.html',
  styleUrl: './calificacion.component.css'
})
export default class CalificacionComponent {

  @Input() turno: Turnos;
  @Output() calificacionCompletada: EventEmitter<Turnos> = new EventEmitter<Turnos>();

  comentarioFin:string="";
  puntuacion:number=0;

  enviarCalificacion(){

    if(this.turno){


      this.turno.calificacion={

        comentarioFin:this.comentarioFin,
        puntuacion:this.puntuacion,
        seCalifico:true,
      };
      this.calificacionCompletada.emit(this.turno);
    }
  }
}
