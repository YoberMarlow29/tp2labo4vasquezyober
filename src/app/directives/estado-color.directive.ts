import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appEstadoColor]',
  standalone: true
})
export class EstadoColorDirective implements OnChanges {
  @Input() estado: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['estado']) {
      this.cambiarColor();
    }
  }

  private cambiarColor() {
    let color = '';
    switch (this.estado) {
      case 'Aceptado':
        color = 'green';
        break;
      case 'Cancelado':
        color = 'red';
        break;
      case 'Finalizado':
        color = 'blue';
        break;
      case 'Rechazado':
        color = 'orange';
        break;
      default:
        color = 'black';
        break;
    }
    this.renderer.setStyle(this.el.nativeElement, 'color', color);
  }
}
