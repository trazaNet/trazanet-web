import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  transform(text: string | null, search: string): string {
    if (!text) return '';
    if (!search) return text;
    
    const pattern = search
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
      .split(' ')
      .filter(t => t.length > 0)
      .join('|');
    
    const regex = new RegExp(pattern, 'gi');
    
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
  }
} 