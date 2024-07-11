import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {  NgxSpinnerService } from 'ngx-spinner';
import { Turnos } from '../../../models/Interfaces';
import { FilterPipe } from '../../../pipes/filter.pipe';
import jsPDF from 'jspdf';
import { FilterByPipe } from '../../../pipes/filter-by.pipe';
import autoTable from 'jspdf-autotable';
import { ToolTipDirective } from '../../../directives/tool-tip.directive';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule,FormsModule,FilterPipe,FilterByPipe,ToolTipDirective],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export default class MiPerfilComponent implements OnInit {
  usuario: any = null;
  horarios: { [dia: string]: { desde: string, hasta: string }[] } = {};
  horas: { [dia: string]: string[] } = {
    'Lunes': this.generarHoras('Lunes'),
    'Martes': this.generarHoras('Martes'),
    'Miércoles': this.generarHoras('Miércoles'),
    'Jueves': this.generarHoras('Jueves'),
    'Viernes': this.generarHoras('Viernes'),
    'Sábado': this.generarHoras('Sábado')
  };
  listaTurnos: Turnos[] = [];
  turnosConHistorial: Turnos[] = [];

  seEntroAlHistorial: boolean = false;
  seEntroAlHorario: boolean = false;
  esPaciente: boolean = false;
  esEspecialista: boolean = false;

  search: string = '';

  especialidadElegida: string = ''; // Puedes inicializarlo como más te convenga


  constructor(
    private auth: AuthService,
    private db: DataService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.auth.usuarioEnSesionObs.subscribe(async user => {
      if (user) {
        try {
          const userDoc = await this.db.traerDoc<any>('user', user.uid);
          this.usuario = userDoc;
          if (this.usuario.rol === 'especialista' && this.usuario.disponibilidad) {
            this.horarios = this.usuario.disponibilidad;
            this.esEspecialista = true;

          }
          if (this.usuario.rol === 'paciente') {
            this.esPaciente = true;

            this.cargarTurnos();
          }
        } catch (error) {
          console.error('Error al cargar el usuario:', error);
        } finally {
          this.spinner.hide();
        }
      } else {
        this.spinner.hide();
      }
    });
  }
  irASeccion() {
    if (this.esPaciente) {
      this.seEntroAlHistorial = true;
      this.seEntroAlHorario = false;
    } else if (this.esEspecialista) {
      this.seEntroAlHistorial = false;
      this.seEntroAlHorario = true;
    }
  }

  volverAtras() {
    this.seEntroAlHistorial = false;
    this.seEntroAlHorario = false;
  }

  obtenerEspecialidadesUnicas(): string[] {
    const especialidadesSet = new Set<string>();
    this.turnosConHistorial.forEach(turno => {
      especialidadesSet.add(turno.especialidad);
    });
    return Array.from(especialidadesSet);
  }

  async cargarTurnos() {
    try {
      const turnos = await this.db.traerColeccion<Turnos>('turnos');
      const usuario = this.auth.UsuarioEnSesion;
      if (usuario.rol === 'paciente') {
        this.listaTurnos = turnos.filter(turno => turno.idPaciente === usuario.uid);
        this.turnosConHistorial = this.listaTurnos.filter(turno => turno.historial?.seHizoHistorial);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    }
  }

  generarHoras(dia: string): string[] {
    const horas: string[] = [];
    let inicio = (dia === 'Sábado') ? 8 : 8;
    let fin = (dia === 'Sábado') ? 14 : 19;
    for (let i = inicio; i <= fin; i++) {
      horas.push(i.toString().padStart(2, '0') + ':00');
      horas.push(i.toString().padStart(2, '0') + ':30');
    }
    return horas;
  }

  agregarHorario(dia: string) {
    if (!this.horarios[dia]) {
      this.horarios[dia] = [];
    }
    if (this.horarios[dia].length === 0) { // Validación para agregar solo una vez por día
      this.horarios[dia].push({ desde: '', hasta: '' });
    }
  }

  eliminarHorario(dia: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        delete this.horarios[dia];
        Swal.fire(
          'Eliminado!',
          'El horario ha sido eliminado.',
          'success'
        )
      }
    });
  }

  guardarDisponibilidad() {
    if (this.usuario) {
      this.usuario.disponibilidad = this.horarios;

      this.db.actualizarDoc('user',this.usuario.uid,this.usuario).then(() => {
          Swal.fire(
            'Guardado!',
            'Tu disponibilidad ha sido guardada.',
            'success'
          );
        })
        .catch(error => console.error('Error al guardar disponibilidad:', error));
    }
  }

  getHorasInicioDisponibles(dia: string, index: number): string[] {
    const horariosDia = this.horarios[dia];
    return this.horas[dia].filter(hora => {
      const horarioActual = horariosDia[index];
      return !horarioActual.hasta || hora < horarioActual.hasta;
    });
  }

  getHorasFinDisponibles(dia: string, index: number): string[] {
    const horariosDia = this.horarios[dia];
    return this.horas[dia].filter(hora => {
      const horarioActual = horariosDia[index];
      return !horarioActual.desde || hora > horarioActual.desde;
    });
  }

  descargarPDF(especialidad: string) {
    const doc = new jsPDF();

    // Encabezado del documento
    doc.text('Informe de Historial Clínico', 10, 10);
    doc.text(`Especialidad: ${especialidad || 'Todas las especialidades'}`, 10, 20);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.addImage('assets/logo.png', 'PNG', 150, 10, 50, 15);

    // Filtrar turnos por especialidad
    const turnosFiltrados = this.turnosConHistorial.filter(turno => turno.especialidad === especialidad || !especialidad);

    if (turnosFiltrados.length === 0) {
      Swal.fire('No se encontraron turnos para la especialidad seleccionada', '', 'info');
      return;
    }

    // Datos de la tabla
    const tableColumn = ['Especialidad', 'Especialista', 'Fecha', 'Hora', 'Altura (cm)', 'Peso (kg)', 'Temperatura (°C)', 'Presión', 'Comentario', 'Datos adicionales'];
    const tableRows = [];

    turnosFiltrados.forEach(turno => {
      const datosAdicionales = turno.historial?.datosDinamicos.map(dato => `${dato.clave}: ${dato.valor}`).join('\n') || '';
      const turnoData = [
        turno.especialidad,
        turno.nombreEspecialista,
        turno.horarioFechaTurno.fecha,
        `${turno.horarioFechaTurno.desde} - ${turno.horarioFechaTurno.hasta}`,
        turno.historial?.altura || '',
        turno.historial?.peso || '',
        turno.historial?.temperatura || '',
        turno.historial?.presion || '',
        turno.historial?.comentario || '',
        datosAdicionales
      ];
      tableRows.push(turnoData);
    });

    // Crear la tabla
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    // Guardar el PDF
    doc.save(`Historial_Clinico_${especialidad || 'Todas'}.pdf`);
  }


  async logout() {
    this.spinner.show();
    await this.auth.logout();
    this.spinner.hide();
    this.router.navigateByUrl('/login');
  }
}
