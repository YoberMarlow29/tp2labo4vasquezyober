import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appToolTip]',
  standalone: true
})
export class ToolTipDirective {

  @Input('appToolTip') ToolTip!: string;
  tooltip: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (this.ToolTip) {
      this.showTooltip();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) {
      this.hideTooltip();
    }
  }

  @HostListener('click') onClick() {
    if (this.tooltip) {
      this.hideTooltip();
    }
  }

  private showTooltip() {
    this.tooltip = this.renderer.createElement('span');
    this.tooltip.innerText = this.ToolTip;
    this.renderer.appendChild(document.body, this.tooltip);
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'backgroundColor', 'black');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '5px');
    this.renderer.setStyle(this.tooltip, 'borderRadius', '5px');
    this.setPosition();
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }

  private setPosition() {
    if (this.tooltip) {
      const hostPos = this.el.nativeElement.getBoundingClientRect();
      const tooltipPos = this.tooltip.getBoundingClientRect();

      const top = hostPos.top - tooltipPos.height - 10;
      const left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

      this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
    }
  }

}
