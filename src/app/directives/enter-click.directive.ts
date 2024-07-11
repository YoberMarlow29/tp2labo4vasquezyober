import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appEnterClick]',
  standalone: true
})
export class EnterClickDirective {

  constructor(private el: ElementRef) {}

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      const button = this.el.nativeElement.querySelector('button[type="submit"]');
      if (button && !button.disabled) {
        button.click();
      }
    }
  }

}
