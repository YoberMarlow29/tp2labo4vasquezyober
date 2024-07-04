import { Component, OnInit } from '@angular/core';
import { Especialista } from '../../../models/Especialista';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import {  Especialidad, Turnos } from '../../../models/Interfaces';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { Paciente } from '../../../models/Paciente';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export default class SolicitarTurnoComponent implements OnInit {
  especialistas: Especialista[] = [];
  pacientes: Paciente[] = [];
  especialidades: Especialidad[] = [];
  selectedEspecialista: Especialista = null;
  selectedPaciente: Paciente = null;

  selectedEspecialidad: string = null;
  diasDisponibles: string[] = [];
  fechasDisponibles: string[] = [];
  turnosDisponibles: { desde: string, hasta: string }[] = [];

  selectedDia: string = null;
  selectedFecha: string = null;
  selectedHora: { desde: string, hasta: string } = null;

  esAdministrador: boolean = false;
  mostrarSeleccionPaciente: boolean = false;

  constructor(private dataService: DataService, private auth: AuthService) {}

  async ngOnInit() {
    await this.checkUserRole();
    this.loadEspecialidades();
  }

  async checkUserRole() {
    try {
      if (this.auth.UsuarioEnSesion.rol === 'admin') {
        this.esAdministrador = true;
        this.mostrarSeleccionPaciente = true;
        await this.loadPacientes();
      } else {
        this.esAdministrador = false;
        this.mostrarSeleccionPaciente = false;
      }
    } catch (error) {
      console.error('Error al verificar el rol del usuario:', error);
    }
  }

  async loadPacientes() {
    try {
      const users = await this.dataService.traerColeccion<any>('user');
      this.pacientes = users.filter(user => user.rol === 'paciente');
    } catch (error) {
      console.log("Error loading patients:", error);
    }
  }

  async loadEspecialidades() {
    try {
      this.especialidades = await this.dataService.traerColeccion<Especialidad>('especialidades');
    } catch (error) {
      Swal.fire('Error', 'Error al obtener las especialidades. Por favor, intenta nuevamente.', 'error');
    }
  }

  seleccionarEspecialidad(especialidad: Especialidad) {
    this.selectedEspecialidad = especialidad.nombre;
    this.loadUsuarios(especialidad.nombre);
  }

  async loadUsuarios(especialidad: string) {
    try {
      const users = await this.dataService.traerColeccion<any>('user');
      this.especialistas = users.filter(user => user.rol === 'especialista' && user.especialidad.includes(especialidad));
    } catch (error) {
      console.log("Error loading specialists:", error);
    }
  }

  seleccionarEspecialista(especialista: Especialista) {
    this.selectedEspecialista = especialista;
    this.loadDiasDisponibles();
  }

  seleccionarPaciente(paciente: Paciente) {
    this.selectedPaciente = paciente;
  }

  loadDiasDisponibles() {
    if (this.selectedEspecialista) {
      const disponibilidad = this.selectedEspecialista.disponibilidad;
      this.diasDisponibles = Object.keys(disponibilidad);
    }
  }

  seleccionarDia(dia: string) {
    this.selectedDia = dia;
    this.selectedFecha = null;
    this.selectedHora = null;
    this.loadFechasDisponibles();
  }

  loadFechasDisponibles() {
    if (this.selectedEspecialista && this.selectedDia) {
      const fechaActual = new Date();
      const disponibilidadDia = this.selectedEspecialista.disponibilidad[this.selectedDia];
      this.fechasDisponibles = [];

      for (let i = 0; i < 15; i++) {
        const fecha = new Date();
        fecha.setDate(fechaActual.getDate() + i);
        const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });

        if (diaSemana.toLowerCase() === this.selectedDia.toLowerCase()) {
          this.fechasDisponibles.push(fecha.toLocaleDateString('es-AR'));
        }
      }
    }
  }

  seleccionarFecha(fecha: string) {
    this.selectedFecha = fecha;
    this.selectedHora = null;
    this.loadTurnosDisponibles();
  }

  async loadTurnosDisponibles() {
    if (this.selectedEspecialista && this.selectedFecha) {
      const dia = this.selectedDia;
      const disponibilidad = this.selectedEspecialista.disponibilidad[dia];

      if (!disponibilidad) {
        this.turnosDisponibles = [];
        return;
      }

      const fechaSeleccionada = new Date(this.selectedFecha.split('/').reverse().join('-'));
      const hoy = new Date();
      const esHoy = fechaSeleccionada.toDateString() === hoy.toDateString();

      const turnos = [];

      disponibilidad.forEach(rango => {
        const inicio = this.parseTime(rango.desde);
        const fin = this.parseTime(rango.hasta);
        let currentTime = inicio;

        while (currentTime < fin) {
          const siguiente = new Date(currentTime.getTime() + 30 * 60000); // 30 minutos

          if (!esHoy || currentTime > hoy) {
            turnos.push({ desde: this.formatTime(currentTime), hasta: this.formatTime(siguiente) });
          }

          currentTime = siguiente;
        }
      });

      this.turnosDisponibles = turnos;
    }
  }

  parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  seleccionarHora(turno: { desde: string, hasta: string }) {
    this.selectedHora = turno;
  }

  async solicitarTurno() {
    if (this.selectedEspecialista && this.selectedEspecialidad && this.selectedDia && this.selectedFecha && this.selectedHora) {
      let idUsuarioRegistro;

      if (this.esAdministrador && this.selectedPaciente) {
        idUsuarioRegistro = this.selectedPaciente.uid;
      } else {
        idUsuarioRegistro = this.auth.UsuarioEnSesion.uid;
      }

      const turno: Turnos = {
        paciente: idUsuarioRegistro,
        especialidad: this.selectedEspecialidad,
        especialista: this.selectedEspecialista.uid,
        horarioFechaTurno: {
          fecha: this.selectedFecha,
          desde: this.selectedHora.desde,
          hasta: this.selectedHora.hasta
        },
        estadoTurno: "pendiente"
      };

      try {
        const disponible = await this.dataService.verificarDisponibilidadTurno('turnos', turno.horarioFechaTurno.fecha, turno.horarioFechaTurno.desde, turno.horarioFechaTurno.hasta);
        if (!disponible) {
          Swal.fire('Error', 'El turno no está disponible.');
          return;
        }

        await this.dataService.subirDocNoUsuarios('turnos', turno);
        this.resetSelections();
        Swal.fire('Éxito', 'El turno ha sido solicitado con éxito.', 'success');
      } catch (error) {
        console.log('Error al solicitar turno:', error);
        Swal.fire('Error', 'No se pudo solicitar el turno. Por favor, intenta nuevamente.', 'error');
      }
    }
  }
  resetSelections() {
    this.selectedEspecialista = null;
    this.selectedEspecialidad = null;
    this.diasDisponibles = [];
    this.fechasDisponibles = [];
    this.turnosDisponibles = [];
    this.selectedDia = null;
    this.selectedFecha = null;
    this.selectedHora = null;
    this.selectedPaciente = null;
  }

  volverAEspecialidades() {
    this.resetSelections();
  }

  volverAEspecialistas() {
    this.selectedEspecialista = null;
    this.selectedDia = null;
    this.selectedFecha = null;
    this.selectedHora = null;
  }
}
