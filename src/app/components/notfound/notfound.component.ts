import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [],
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css'] // Asegúrate de que 'styleUrls' está bien escrito

})
export default class NotfoundComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/404') {
          document.body.classList.add('page-404');
        } else {
          document.body.classList.remove('page-404');
        }
      }
    });
  }
}
