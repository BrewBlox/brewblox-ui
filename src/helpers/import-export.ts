import FileSaver from 'file-saver';

import { serialize } from './units/parseObject';

export function saveFile(exported: any, title: string, raw = false): void {
  const vals = raw ? exported : JSON.stringify(serialize(exported));
  const blob = new Blob([vals], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, title);
}
