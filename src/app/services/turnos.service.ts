import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Turnos } from '../models/Interfaces';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private collectionName = 'turnos';

  constructor(private dataService: DataService) {}

  async crearTurno(turno: Turnos): Promise<string> {
    return this.dataService.subirDoc(this.collectionName, turno);
  }

  obtenerTurnos() {
    return this.dataService.traerColeccion<Turnos>(this.collectionName);
  }

  async actualizarTurno(id: string, data: Partial<Turnos>): Promise<void> {
    return this.dataService.actualizarDoc(this.collectionName, id, data);
  }

  async borrarTurno(id: string): Promise<void> {
    const turno = await this.dataService.traerDoc<Turnos>(this.collectionName, id);
    if (turno) {
      return this.dataService.borrarDoc(this.collectionName, id);
    }
  }
}

