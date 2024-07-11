import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { Turnos } from '../../../models/Interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../pipes/filter.pipe';
import EncuestaComponent from '../../emergente/encuesta/encuesta.component';
import CalificacionComponent from '../../emergente/calificacion/calificacion.component';
import HistorialComponent from '../../emergente/historial/historial.component';
import { EstadoColorDirective } from '../../../directives/estado-color.directive';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [FormsModule,CommonModule,FilterPipe,EncuestaComponent,CalificacionComponent,HistorialComponent,EstadoColorDirective],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export default class MisTurnosComponent implements OnInit {
  esPaciente: boolean = false;
  esEspecialista: boolean = false;
  esAdmin:boolean=false;

  listaTurnos: Turnos[] = [];
  turnoSeleccionado: Turnos = null;

  comentarioCancelacion: string = '';
  comentarioRechazo: string = '';

  mostrarModalCancelar: boolean = false;
  mostrarModalResena: boolean = false;
  mostrarModalEncuesta: boolean = false;
  mostrarModalCalificacion: boolean = false;
  mostrarModalRechazo: boolean = false;
  mostrarModalHistorial: boolean = false;

  search: string = '';

  constructor(
    private auth: AuthService,
    private db: DataService
  ) { }

  async ngOnInit() {
    await this.checkearRol();
  }

  async checkearRol() {
    try {
      const usuario = this.auth.UsuarioEnSesion;
      if (usuario.rol === 'paciente') {
        this.esPaciente = true;
        this.esEspecialista = false;
      } else if (usuario.rol === 'especialista') {
        this.esEspecialista = true;
        this.esPaciente = false;
      }else{

        this.esEspecialista = false;
        this.esPaciente = false;
        this.esAdmin=true;

      }
      await this.cargarTurnos();
    } catch (error) {
      console.error('Error al verificar el rol del usuario:', error);
    }
  }

  async cargarTurnos() {
    try {
      const turnos = await this.db.traerColeccion<Turnos>('turnos');
      const usuario = this.auth.UsuarioEnSesion;
      if (usuario.rol === 'paciente') {
        this.listaTurnos = turnos.filter(turno => turno.idPaciente === usuario.uid);
      } else if (usuario.rol === 'especialista') {
        this.listaTurnos = turnos.filter(turno => turno.idEspecialista === usuario.uid);
      }
      else{

        this.listaTurnos=turnos;
      }
    } catch (error) {
      console.error('Error al encontrar la lista de turnos:', error);
    }
  }

  async verResena(turno: Turnos) {
    try {
      const turnoDoc = await this.db.traerDoc<Turnos>('turnos', turno.id);
      if (turnoDoc) {
        this.turnoSeleccionado = turnoDoc;
        this.mostrarModalResena = true;
        this.mostrarModalCancelar = false;
      }
    } catch (error) {
      console.error('Error al obtener la reseña del turno:', error);
    }
  }

  mostrarModalDeCancelar(turno: Turnos) {
    this.turnoSeleccionado = turno;
    this.comentarioCancelacion = '';
    this.mostrarModalCancelar = true;
    this.mostrarModalResena = false;
  }

  async cancelarTurno() {
    if (this.turnoSeleccionado) {
      this.turnoSeleccionado.estadoTurno = 'Cancelado';
      this.turnoSeleccionado.resena = this.comentarioCancelacion;
      await this.db.actualizarDoc('turnos', this.turnoSeleccionado.id, this.turnoSeleccionado);
      this.turnoSeleccionado = null;
      this.mostrarModalCancelar = false;
      await this.cargarTurnos();
    }
  }

  mostrarModalDeRechazo(turno: Turnos) {
    this.turnoSeleccionado = turno;
    this.comentarioRechazo = '';
    this.mostrarModalRechazo = true;
  }

  async rechazarTurno() {
    if (this.turnoSeleccionado) {
      this.turnoSeleccionado.estadoTurno = 'Rechazado';
      this.turnoSeleccionado.resena = this.comentarioRechazo;
      await this.db.actualizarDoc('turnos', this.turnoSeleccionado.id, this.turnoSeleccionado);
      this.turnoSeleccionado = null;
      this.mostrarModalRechazo = false;
      await this.cargarTurnos();
    }
  }

  async aceptarTurno(turno: Turnos) {
    if (turno) {
      turno.estadoTurno = 'Aceptado';
      await this.db.actualizarDoc('turnos', turno.id, turno);
      this.turnoSeleccionado = null;
      await this.cargarTurnos();
    }
  }


  mostrarModalDeEncuesta(turno: Turnos) {
    this.turnoSeleccionado = turno;
    this.mostrarModalEncuesta = true;
  }

  async completarEncuesta(turnoActualizado: Turnos) {
    this.mostrarModalEncuesta = false;
    await this.db.actualizarDoc('turnos', turnoActualizado.id, turnoActualizado);
    await this.cargarTurnos();
  }

  mostrarModalDeCalificacion(turno: Turnos) {
    this.turnoSeleccionado = turno;
    this.mostrarModalCalificacion = true;
  }

  async recibirCalificacion(turnoActualizado: Turnos) {
    this.mostrarModalCalificacion = false;
    await this.db.actualizarDoc('turnos', turnoActualizado.id, turnoActualizado);
    await this.cargarTurnos();
  }

  mostrarModalDeHistorial(turno: Turnos) {
    this.turnoSeleccionado = turno;
    this.mostrarModalHistorial = true;
  }

  async recibirHistorial(turnoActualizado: Turnos) {
    this.mostrarModalHistorial = false;
    turnoActualizado.estadoTurno = 'Finalizado';
    turnoActualizado.historial.seHizoHistorial=true;
    await this.db.actualizarDoc('turnos', turnoActualizado.id, turnoActualizado);
    this.turnoSeleccionado = null;
    await this.cargarTurnos();
  }
}
