import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { StorageService } from '../../services/storage.service';
import { Persona } from '../../models/Persona';
import { Especialidad } from '../../models/Especialidad';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export default class RegisterComponent {
  esPaciente: boolean = false;
  esEspecialista: boolean = false;
  esAdmin: boolean = false;
  agregarEspecialidad: boolean = false;
  selectedEspecialidad: string = '';
  nuevaEspecialidad: Especialidad;
  especialidades: Especialidad[] = [];

  paciente: Persona = {};
  especialista: Persona = {};
  administrador: Persona = {};
  pacientePassword: string = '';
  especialistaPassword: string = '';
  administradorPassword: string = '';
  profileImages: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private storageService: StorageService
  ) {
    this.loadEspecialidades();
  }

  async loadEspecialidades() {
    try {
      this.especialidades = await this.dataService.traerColeccion<Especialidad>('especialidades',"nombre");
    } catch (error) {
      console.error('Error al cargar las especialidades:', error);
    }
  }

  selectPaciente() {
    this.esPaciente = true;
    this.esEspecialista = false;
    this.esAdmin = false;
  }

  selectEspecialista() {
    this.esPaciente = false;
    this.esEspecialista = true;
    this.esAdmin = false;
  }

  selectAdmin() {
    this.esPaciente = false;
    this.esEspecialista = false;
    this.esAdmin = true;
  }

  goBack() {
    this.esPaciente = false;
    this.esEspecialista = false;
    this.esAdmin = false;
  }

  onChangeEspecialidad(event: any) {
    const value = event.target.value;
    this.agregarEspecialidad = value === 'Agregar Especialidad';
  }

  async registerPaciente() {
    if (this.paciente.mail && this.pacientePassword) {
      try {
        const userCredential = await this.authService.registrarFireAuth(this.paciente.mail, this.pacientePassword);
        // this.authService.verificacionEmail(userCredential);
        this.paciente.uid = userCredential.user.uid;
        const docId = await this.dataService.subirDoc('pacientes', this.paciente);
        await this.uploadProfileImages(`pacientes/${docId}`);
        alert('Paciente registrado con éxito. Por favor, verifica tu correo electrónico.');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  async registerEspecialista() {
    if (this.especialista.mail && this.especialistaPassword) {
      if (this.agregarEspecialidad) {
        await this.addEspecialidad(this.nuevaEspecialidad);
        this.especialista.especialidad = this.nuevaEspecialidad.nombre;
      } else {
        this.especialista.especialidad = this.selectedEspecialidad;
      }
      try {
        const userCredential = await this.authService.registrarFireAuth(this.especialista.mail, this.especialistaPassword);
        this.especialista.uid = userCredential.user.uid;
        this.especialista.esAceptado = false;
        const docId = await this.dataService.subirDoc('especialistas', this.especialista);
        await this.uploadProfileImages(`especialistas/${docId}`);
        alert('Especialista registrado con éxito. Por favor, verifica tu correo electrónico.');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  async registerAdmin() {
    if (this.administrador.mail && this.administradorPassword) {
      try {
        const userCredential = await this.authService.registrarFireAuth(this.administrador.mail, this.administradorPassword);
        this.administrador.uid = userCredential.user.uid;
        this.administrador.esAdmin = true;
        const docId = await this.dataService.subirDoc('administradores', this.administrador);
        await this.uploadProfileImages(`administradores/${docId}`);
        alert('Administrador registrado con éxito. Por favor, verifica tu correo electrónico.');
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  async addEspecialidad(nuevaEspecialidad: Especialidad) {
    try {
      await this.dataService.subirDoc('especialidades', { nombre: nuevaEspecialidad }, false);
      this.especialidades.push(nuevaEspecialidad);
    } catch (error) {
      console.error('Error al agregar la nueva especialidad:', error);
    }
  }

  onFileSelected(event: any) {
    this.profileImages = Array.from(event.target.files);
    this.imagePreviews = this.profileImages.map(file => URL.createObjectURL(file));
  }

  async uploadProfileImages(path: string) {
    for (const image of this.profileImages) {
      await this.storageService.subirArchivo(image, `${path}/${image.name}`);
    }
  }
}
