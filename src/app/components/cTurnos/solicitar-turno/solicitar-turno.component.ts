import { Component, OnInit } from '@angular/core';
import { Especialista } from '../../../models/Especialista';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { Especialidad } from '../../../models/Interfaces';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})


export default class SolicitarTurnoComponent implements OnInit {

  especialistas: Especialista[] = [];
  especialidades: Especialidad[] = [];
  selectedEspecialista: Especialista | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.loadEspecialistas();
  }

  async loadEspecialistas() {
    try {
      const users = await this.dataService.traerColeccion<Especialista>('user');
      this.especialistas = users.filter(user => user.rol === 'especialista');
    } catch (error) {
      console.error('Error fetching especialistas:', error);
    }
  }

  seleccionarEspecialista(especialista: Especialista) {
    this.selectedEspecialista = especialista;
    this.loadEspecialidades(especialista);
  }

  loadEspecialidades(especialista: Especialista) {
    this.especialidades = especialista.especialidad.map((nombre) => ({
      nombre,
      imagen: this.getImagenEspecialidad(nombre)
    }));
  }

  getImagenEspecialidad(nombre: string): string {
    return `assets/imagenes_especialidades/${nombre}.png`;
  }

  volverAEspecialistas() {
    this.selectedEspecialista = null;
    this.especialidades = [];
  }
}
