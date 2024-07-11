import { Pipe, PipeTransform } from '@angular/core';
import { Turnos } from '../models/Interfaces';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(turnos: Turnos[], search: string, rol: string): Turnos[] {
    if (!search) {
      return turnos;
    }

    search = search.toLowerCase();

    if (rol === 'paciente'||rol === 'especialista') {
      return turnos.filter(turno =>
        turno.especialidad?.toLowerCase().includes(search) ||
        turno.nombreEspecialista?.toLowerCase().includes(search)||
        turno.nombrePaciente?.toLowerCase().includes(search)||
        turno.horarioFechaTurno.fecha?.toLowerCase().includes(search) ||
        turno.horarioFechaTurno.desde?.toLowerCase().includes(search) ||
        turno.estadoTurno?.toLowerCase().includes(search)||
        (turno.historial?.datosDinamicos?.some(data =>
          data.clave.toLowerCase().includes(search) ||
          data.valor.toString().toLowerCase().includes(search)
       ))
      );
    }
    else if(rol === 'admin'){
        return turnos.filter(turno =>
        turno.especialidad?.toLowerCase().includes(search) ||
        turno.nombreEspecialista?.toLowerCase().includes(search)
      );
    }

    return turnos;
  }
}
