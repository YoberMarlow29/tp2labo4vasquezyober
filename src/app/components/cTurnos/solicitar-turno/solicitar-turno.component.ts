import { Component, OnInit } from '@angular/core';
import { Especialista } from '../../../models/Especialista';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import {  Especialidad, Turnos } from '../../../models/Interfaces';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { Paciente } from '../../../models/Paciente';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export default class SolicitarTurnoComponent implements OnInit {
  especialistas: Especialista[] = [];
  pacientes: any[] = [];
  especialidades: Especialidad[] = [];

  selectedEspecialista: Especialista = null;
  selectedPaciente: any = null;
  selectedEspecialidad: string = null;

  esAdministrador: boolean = false;
  mostrarSeleccionPaciente: boolean = false;
  mostrarSeleccionEspecialistas: boolean = false;
  mostrarSeleccionEspecialidad: boolean = false;
  mostrarSeleccionDiaFechaHora: boolean = false;

  diasDisponibles: string[] = [];
  fechasDisponibles: string[] = [];
  turnosDisponibles: { desde: string, hasta: string }[] = [];

  selectedDia: string = null;
  selectedFecha: string = null;
  selectedHora: { desde: string, hasta: string } = null;

  constructor(private dataService: DataService,private auth: AuthService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.checkUserRole();
    this.loadEspecialistas();

  }

  async checkUserRole() {
    try {
      if (this.auth.UsuarioEnSesion.rol === 'admin') {
        this.esAdministrador = true;
        this.mostrarSeleccionPaciente = true;
        await this.loadPacientes();
      } else if(this.auth.UsuarioEnSesion.rol==='paciente') {
        this.esAdministrador = false;
        this.mostrarSeleccionEspecialistas = true;
      }
    } catch (error) {
      console.error('Error al verificar el rol del usuario:', error);
    }
  }

  async loadEspecialistas() {
    try {
      this.spinner.show();
      const users = await this.dataService.traerColeccion<Especialista>('user');
      this.especialistas = users.filter(user => user.rol === 'especialista');
    } catch (error) {
      console.error('Error al cargar los especialistas:', error);
    } finally {
      this.spinner.hide();
    }
  }

  async loadEspecialidades(especialidades: string[]) {
    try {

      this.spinner.show();
      this.especialidades = await this.dataService.traerColeccion<Especialidad>('especialidades');
      this.especialidades = this.especialidades.filter(especialidad =>
        especialidades.includes(especialidad.nombre)
      );
    } catch (error) {
      console.error('Error al cargar las especialidades:', error);
    } finally {
       this.spinner.hide();
    }
  }

  seleccionarEspecialista(especialista: Especialista) {

    this.selectedEspecialista = especialista;
    const especialidadesEspecialista = this.selectedEspecialista.especialidad;
    this.loadEspecialidades(especialidadesEspecialista);
    this.mostrarSeleccionEspecialistas=false;
    this.mostrarSeleccionEspecialidad = true;


  }

  seleccionarEspecialidad(especialidad: Especialidad) {
    this.selectedEspecialidad = especialidad.nombre;
    this.loadDiasDisponibles();
    this.mostrarSeleccionEspecialidad = false;
    this.mostrarSeleccionDiaFechaHora = true;

  }
  seleccionarPaciente(paciente: any) {
    this.selectedPaciente = paciente;
    this.mostrarSeleccionEspecialistas = true;
    this.mostrarSeleccionPaciente=false
  }


  async loadPacientes() {
    try {
      this.spinner.show();
      const users = await this.dataService.traerColeccion<any>('user');
      this.pacientes = users.filter(user => user.rol === 'paciente');
    } catch (error) {
      console.log("Error loading patients:", error);
    } finally {
      this.spinner.hide();
    }
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
      this.spinner.show();
      const dia = this.selectedDia;
      const disponibilidad = this.selectedEspecialista.disponibilidad[dia];

      if (!disponibilidad) {
        this.turnosDisponibles = [];
        this.spinner.hide();
        return;
      }

      const fechaSeleccionada = new Date(this.selectedFecha.split('/').reverse().join('-'));
      const hoy = new Date();
      const esHoy = fechaSeleccionada.toDateString() === hoy.toDateString();

      const turnos = [];

      for (const rango of disponibilidad) {
        const inicio = this.parseTime(rango.desde);
        const fin = this.parseTime(rango.hasta);
        let currentTime = inicio;

        while (currentTime < fin) {
          const siguiente = new Date(currentTime.getTime() + 30 * 60000); // 30 minutos

          const turnoDisponible = await this.dataService.verificarDisponibilidadTurno(
            'turnos',
            this.selectedFecha,
            this.formatTime(currentTime),
            this.formatTime(siguiente)
          );

          if (turnoDisponible && (!esHoy || currentTime > hoy)) {
            turnos.push({ desde: this.formatTime(currentTime), hasta: this.formatTime(siguiente) });
          }

          currentTime = siguiente;
        }
      }
      this.spinner.hide();
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
      let nombrePaciente;

      if (this.esAdministrador && this.selectedPaciente) {
        idUsuarioRegistro = this.selectedPaciente.uid;
        nombrePaciente = this.selectedPaciente.nombre;
      } else {
        idUsuarioRegistro = this.auth.UsuarioEnSesion.uid;
        nombrePaciente = this.auth.UsuarioEnSesion.nombre;
      }

      const turno: Turnos = {
        idPaciente: idUsuarioRegistro,
        nombrePaciente: nombrePaciente,
        especialidad: this.selectedEspecialidad,
        idEspecialista: this.selectedEspecialista.uid,
        nombreEspecialista: this.selectedEspecialista.nombre,
        horarioFechaTurno: {
          fecha: this.selectedFecha,
          desde: this.selectedHora.desde,
          hasta: this.selectedHora.hasta
        },
        estadoTurno: "Pendiente",
        resena: "",
        encuesta: {
          experienciaHospital: "",
          recomendarHospital: false,
          comentario: "",
          seRealizoEncuesta: false
        },
        calificacion: {
          puntuacion: 0,
          comentarioFin: "",
          seCalifico: false,
        },
        historial:{
          altura:0,
          peso:0,
          temperatura:0,
          presion:0,
          datosDinamicos:[],
          comentario:"",
          seHizoHistorial:false
        }
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
    this.mostrarSeleccionEspecialistas = true;
    this.mostrarSeleccionEspecialidad = false;
    this.mostrarSeleccionDiaFechaHora = false;
  }

  volverAEspecialistas() {
    if(this.auth.UsuarioEnSesion.rol==='admin'){
      this.resetSelections();
      this.mostrarSeleccionPaciente = true;
      this.mostrarSeleccionEspecialistas=false;
    }
    else if(this.auth.UsuarioEnSesion.rol==='paciente'){
      this.resetSelections();
      this.mostrarSeleccionEspecialistas = true;

    }
  }
  handleImageError(event: any) {
    event.target.src = "assets/imagesEspecialidades/sinfoto.png";
  }
}
