import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Persona } from '../../models/Persona';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-admin.component.html',
  styleUrl: './lista-admin.component.css'
})
export default class ListaAdminComponent {
  especialistas: Persona[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.traerColeccion<Persona>('especialistas')
      .then(data => {
        this.especialistas = data;
      });
  }

  toggleAceptado(especialista: Persona): void {
    especialista.esAceptado = !especialista.esAceptado;
    this.dataService.actualizarDoc('especialistas', especialista.id, { esAceptado: especialista.esAceptado });
  }

}
