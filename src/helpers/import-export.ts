import FileSaver from 'file-saver';
import html2canvas from 'html2canvas';

import { serialize } from './units/parseObject';


export function saveFile(exported: any, title: string, raw = false): void {
  const vals = raw ? exported : JSON.stringify(serialize(exported));
  const blob = new Blob([vals], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, title);
}

export function screenshot(el: HTMLElement, filename: string): void {
  html2canvas(el).then(canvas => {
    const link = document.createElement('a');
    link.download = filename;
    canvas.toBlob(blob => {
      link.href = URL.createObjectURL(blob);
      link.click();
    });
  });
}
