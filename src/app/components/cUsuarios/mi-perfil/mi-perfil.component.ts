import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule,FormsModule],
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


  constructor(
    private auth: AuthService,
    private data: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.usuarioEnSesionObs.subscribe(async user => {
      if (user) {
        const userDoc = await this.data.traerDoc<any>('user', user.uid);
        this.usuario = userDoc;
        if(this.usuario.rol==="especialista"&& this.usuario.disponibilidad){

          this.horarios = this.usuario.disponibilidad;

        }
      }
    });
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
      text: "¡No podrás revertir esto!",
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
      this.data.subirDoc('user', this.usuario, this.usuario.uid)
        .then(() => {
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

  async logout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login');
    console.log('Salió con éxito');
  }

}
