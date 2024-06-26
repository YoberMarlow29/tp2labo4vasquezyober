import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { Usuario } from '../../../models/Usuario';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export default class MiPerfilComponent implements OnInit {
  usuario: Usuario | null = null;

  constructor(
    private auth: AuthService,
    private data: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.usuarioEnSesionObs.subscribe(async user => {
      if (user) {
        const userDoc = await this.data.traerDoc<Usuario>('user', user.uid);
        this.usuario = userDoc;
      }
    });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login')
    console.log("Salió con éxito");

  }


}
