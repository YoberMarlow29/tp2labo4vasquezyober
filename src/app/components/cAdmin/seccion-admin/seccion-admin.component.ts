import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Especialista } from '../../../models/Especialista';
import { Admin } from '../../../models/Administrador';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-seccion-admin',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './seccion-admin.component.html',
  styleUrl: './seccion-admin.component.css'
})
export default class SeccionAdminComponent implements OnInit {
  especialistas: Especialista[] = [];
  esAdmin: boolean = false;
  esLista: boolean = false;

  administradorForm: FormGroup;
  administradorPassword: string = '';

  profileImages: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private authService: AuthService,
    private storageService: StorageService
  ) {
    this.administradorForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]]
    });
  }

  ngOnInit(): void {
    this.dataService.traerColeccion<Especialista>('user')
      .then(data => {
        if (data) {
          this.especialistas = data.filter(user => user.rol === 'especialista');
        }
      });
  }

  selectAdmin() {
    this.esLista = false;
    this.esAdmin = true;
  }

  selectLista() {
    this.esLista = true;
    this.esAdmin = false;
  }

  goBack() {
    this.esLista = false;
    this.esAdmin = false;
  }

  toggleAceptado(especialista: Especialista): void {
    especialista.esAceptado = !especialista.esAceptado;
    this.dataService.actualizarDoc('user', especialista.uid, { esAceptado: especialista.esAceptado });
  }

  async registerAdmin() {

    const formData = this.administradorForm.value;
    const administrador= new Admin(

      '',
      formData.nombre,
      formData.apellido,
      parseInt(formData.edad, 10),
      formData.dni.replace(/-/g, ''),
      [],
      formData.email,
      formData.password,

    )


    // Sube las imágenes de perfil para el nuevo administrador y obtiene las URLs
    const imageUrls = await this.uploadProfileImages(`administradores/${formData.email}`);
    administrador.pathFoto = imageUrls;

    // Registra al nuevo administrador
    await this.authService.registrarFireAuth("user", administrador, formData.password);
    this.borrarInfo();
  }

  onFileSelected(event: any) {
    this.profileImages = Array.from(event.target.files);
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

  private borrarInfo() {
    this.administradorForm.reset();
    this.administradorPassword = '';
    this.profileImages = [];
    this.imagePreviews = [];
  }
}
