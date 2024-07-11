import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatearDatosDinamicos',
  standalone: true
})
export class FormatearDatosDinamicosPipe implements PipeTransform {
  transform(datos: Array<{ clave: string, valor: any }>): string {
    return datos.map(dato => `${dato.clave} = ${dato.valor}`).join(' - ');
  }
}
