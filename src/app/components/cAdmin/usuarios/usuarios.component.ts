import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { Usuario } from '../../../models/Usuario';
import { Turnos } from '../../../models/Interfaces';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export default class UsuariosComponent implements OnInit {


  listaUsuarios: Usuario[] = [];
  listaTurnos: Turnos[] = [];
  listaUsuariosCards: Usuario[] = [];

  constructor(private db: DataService, private auth: AuthService) {}

  async ngOnInit() {
    this.listaUsuarios = await this.db.traerColeccion<Usuario>('user');
    this.listaUsuariosCards = this.listaUsuarios.filter(user => user.rol === 'paciente');
    this.listaTurnos = await this.db.traerColeccion<Turnos>('turnos');
  }

  descargarExcelTurnos(usuario: Usuario) {
    const turnosUsuario = this.listaTurnos.filter(turno => turno.idPaciente === usuario.uid);
    if (turnosUsuario.length === 0) {
      Swal.fire('Sin turnos', 'El usuario no tiene turnos.', 'info');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Turnos');

    worksheet.columns = [
      { header: 'ID Turno', key: 'id', width: 20 },
      { header: 'Nombre Paciente', key: 'nombrePaciente', width: 30 },
      { header: 'Nombre Especialista', key: 'nombreEspecialista', width: 30 },
      { header: 'Especialidad', key: 'especialidad', width: 20 },
      { header: 'Fecha Turno', key: 'fechaTurno', width: 20 },
      { header: 'Desde', key: 'desde', width: 20 },
      { header: 'Hasta', key: 'hasta', width: 20 },
      { header: 'Estado', key: 'estadoTurno', width: 20 },
    ];

    turnosUsuario.forEach(turno => {
      worksheet.addRow({
        id: turno.id,
        nombrePaciente: turno.nombrePaciente,
        nombreEspecialista: turno.nombreEspecialista,
        especialidad: turno.especialidad,
        fechaTurno: turno.horarioFechaTurno.fecha,
        desde: turno.horarioFechaTurno.desde,
        hasta: turno.horarioFechaTurno.hasta,
        estadoTurno: turno.estadoTurno
      });
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, `Turnos_${usuario.nombre}_${usuario.apellido}.xlsx`);
    });
  }

  descargarExcelTodosLosUsuarios() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    worksheet.columns = [
      { header: 'UID', key: 'uid', width: 30 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Apellido', key: 'apellido', width: 30 },
      { header: 'Edad', key: 'edad', width: 10 },
      { header: 'DNI', key: 'dni', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Rol', key: 'rol', width: 20 }
    ];

    this.listaUsuarios.forEach(usuario => {
      worksheet.addRow({
        uid: usuario.uid,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        edad: usuario.edad,
        dni: usuario.dni,
        email: usuario.email,
        rol: usuario.rol
      });
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, 'Usuarios.xlsx');
    });
  }
}
