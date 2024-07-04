import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { StorageService } from '../../../services/storage.service';
import { Especialidad } from '../../../models/Interfaces';
import { Paciente } from '../../../models/Paciente';
import { Especialista } from '../../../models/Especialista';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export default class RegisterComponent {
  esPaciente: boolean = false;
  esEspecialista: boolean = false;

  agregarEspecialidad: boolean = false;
  nuevaEspecialidad: Especialidad = { nombre: '' };
  especialidades: Especialidad[] = [];

  pacienteForm: FormGroup;
  especialistaForm: FormGroup;

  profileImages: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dataService: DataService,
    private storageService: StorageService
  ) {
    this.loadEspecialidades();
    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      dni: ['', [Validators.required, Validators.pattern("^[0-9]{8}$")]],
      obraSocial: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      profileImages: ['']
    });
    this.especialistaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
      dni: ['', [Validators.required, Validators.pattern("^[0-9]{8}$")]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      especialidad: [[], Validators.required],
      nuevaEspecialidad: [''],
      profileImages: ['']
    });
  }

  async loadEspecialidades() {
    try {
      this.especialidades = await this.dataService.traerColeccion<Especialidad>('especialidades', "nombre");
    } catch (error) {
      console.log("error", error);
    }
  }

  selectPaciente() {
    this.esPaciente = true;
    this.esEspecialista = false;
  }

  selectEspecialista() {
    this.esPaciente = false;
    this.esEspecialista = true;
  }

  selectAdmin() {
    this.esPaciente = false;
    this.esEspecialista = false;
  }

  goBack() {
    this.esPaciente = false;
    this.esEspecialista = false;
  }

  onChangeEspecialidad(event: any) {
    const value = event.target.value;
    if (value === 'Agregar Especialidad') {
      this.agregarEspecialidad = true;
    } else {
      this.agregarEspecialidad = false;
      const especialidades = this.especialistaForm.get('especialidad')?.value || [];
      if (!especialidades.includes(value)) {
        especialidades.push(value);
        this.especialistaForm.patchValue({ especialidad: especialidades });
      }
    }
  }

  eliminarEspecialidad(especialidad: string) {
    const especialidades = this.especialistaForm.get('especialidad')?.value || [];
    this.especialistaForm.patchValue({
      especialidad: especialidades.filter((e: string) => e !== especialidad)
    });
  }

  async registerPaciente() {
    if (this.pacienteForm.invalid) return;

    const formData = this.pacienteForm.value;
    const paciente = new Paciente(
      '',
      formData.nombre,
      formData.apellido,
      parseInt(formData.edad, 10),
      formData.dni.replace(/-/g, ''),
      [],
      formData.email,
      formData.password,
      formData.obraSocial
    );

    const imageUrls = await this.uploadProfileImages(`pacientes/${formData.email}`);
    paciente.pathFoto = imageUrls;

    const userCredential = await this.authService.registrarFireAuth("user", paciente, formData.password);
    paciente.uid = userCredential.user.uid;
    this.authService.logout();
    this.borrarDatos();
  }

  async registerEspecialista() {
    if (this.especialistaForm.invalid) return;

    const formData = this.especialistaForm.value;

    if (this.agregarEspecialidad) {
      await this.addEspecialidad({ nombre: formData.nuevaEspecialidad });
      formData.especialidad.push(formData.nuevaEspecialidad);
    }

    const especialista = new Especialista(
      '',
      formData.nombre,
      formData.apellido,
      parseInt(formData.edad, 10),
      formData.dni.replace(/-/g, ''),
      [],
      formData.email,
      formData.password,
      formData.especialidad,
      false
    );

    const imageUrls = await this.uploadProfileImages(`especialistas/${formData.email}`);
    especialista.pathFoto = imageUrls;

    const userCredential = await this.authService.registrarFireAuth("user", especialista, formData.password);
    especialista.uid = userCredential.user.uid;
    this.authService.logout();

    this.borrarDatos();
  }

  async addEspecialidad(nuevaEspecialidad: Especialidad) {
    try {
      await this.dataService.subirDocNoUsuarios('especialidades', nuevaEspecialidad);
      this.especialidades.push(nuevaEspecialidad);
    } catch (error) {
      console.log("error", error);
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (this.esPaciente) {
      this.profileImages = Array.from(files).slice(0, 2);
    } else if (this.esEspecialista) {
      this.profileImages = Array.from(files).slice(0, 1);
    }
    this.imagePreviews = this.profileImages.map(file => URL.createObjectURL(file));
  }

  async uploadProfileImages(path: string): Promise<string[]> {
    const uploadedImageUrls: string[] = [];

    for (const image of this.profileImages) {
      const imageUrl = await this.storageService.subirArchivo(image, `${path}/${image.name}`);
      uploadedImageUrls.push(imageUrl);
    }

    return uploadedImageUrls;
  }

  borrarDatos() {
    this.pacienteForm.reset();
    this.especialistaForm.reset();
    this.profileImages = [];
    this.imagePreviews = [];
    this.nuevaEspecialidad = { nombre: '' };
    this.agregarEspecialidad = false;
  }
}
