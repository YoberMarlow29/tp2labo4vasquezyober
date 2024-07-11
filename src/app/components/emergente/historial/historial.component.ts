import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Turnos } from '../../../models/Interfaces';
import { FormatearDatosDinamicosPipe } from "../../../pipes/formatear-datos-dinamicos.pipe";

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormatearDatosDinamicosPipe],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export default class HistorialComponent implements OnInit {
  @Input() turno: Turnos;
  @Output() historialCompletado: EventEmitter<Turnos> = new EventEmitter<Turnos>();

  historialForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.historialForm = this.fb.group({
      altura: ['', [Validators.required, Validators.min(40), Validators.max(220)]],
      peso: ['', [Validators.required, Validators.min(2), Validators.max(300)]],
      temperatura: ['', [Validators.required, Validators.min(35), Validators.max(45)]],
      presion: ['', [Validators.required, Validators.min(40), Validators.max(200)]],
      comentario: [''],
      datosDinamicos: this.fb.array([])
    });
  }

  get datosDinamicos() {
    return this.historialForm.get('datosDinamicos') as FormArray;
  }

  agregarDatosDinamico() {
    if (this.datosDinamicos.length < 3) {
      this.datosDinamicos.push(this.fb.group({
        clave: [''],
        valor: ['']
      }));
    }
  }

  eliminarDatosDinamico(index: number) {
    this.datosDinamicos.removeAt(index);
  }

  enviarEncuesta() {
    if (this.historialForm.valid && this.turno) {
      this.turno.historial = {
        ...this.historialForm.value
      };
      this.historialCompletado.emit(this.turno);
    }
  }
}
