import { Component, OnInit } from '@angular/core';
import { Turnos } from '../../models/Interfaces';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import ListaHistorialComponent from '../emergente/lista-historial/lista-historial.component';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule,ListaHistorialComponent],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export default class PacientesComponent  implements OnInit{
  listaTurnosPorPaciente: { paciente: string, ultimosTurnos: Turnos[] }[] = [];
  turnosPacienteSeleccionado: Turnos[] | null = null;

  constructor(
    private auth: AuthService,
    private db: DataService
  ) { }

  async ngOnInit() {
    try {
      const turnos = await this.db.traerColeccion<Turnos>('turnos');

      // Filtrar y ordenar los turnos finalizados del especialista actual
      const turnosFiltrados = turnos.filter(turno =>
        turno.idEspecialista === this.auth.UsuarioEnSesion.uid &&
        turno.estadoTurno === 'Finalizado'
      ).sort((a, b) => {
        const fechaA = this.convertirStringADate(a.horarioFechaTurno.fecha);
        const fechaB = this.convertirStringADate(b.horarioFechaTurno.fecha);
        return fechaB.getTime() - fechaA.getTime();
      });

      const pacientes = {};
      turnosFiltrados.forEach(turno => {
        if (!pacientes[turno.nombrePaciente]) {
          pacientes[turno.nombrePaciente] = [];
        }
        pacientes[turno.nombrePaciente].push(turno);
      });

      this.listaTurnosPorPaciente = Object.keys(pacientes).map(paciente => ({
        paciente: paciente,
        ultimosTurnos: pacientes[paciente]
      }));

    } catch (error) {
      console.error('Error al encontrar la lista de turnos:', error);
    }
  }

  // Función para convertir fecha de string "dd/MM/yyyy" a objeto Date
  private convertirStringADate(fechaString: string): Date {
    const partes = fechaString.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const anio = parseInt(partes[2], 10);
    return new Date(anio, mes, dia);
  }

  verHistorial(turnos: Turnos[]) {
    this.turnosPacienteSeleccionado = turnos;
  }

  cerrarModal() {
    this.turnosPacienteSeleccionado = null;
  }
}
