import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[], field: string, value: string): any[] {
    if (!items || !value) {
      return items;
    }
    return items.filter(item => item[field].toLowerCase().includes(value.toLowerCase()));
  }
}

