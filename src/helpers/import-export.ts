import FileSaver from 'file-saver';

import { serialize } from './units/parseObject';


export function saveJsonFile(exported: any, title: string, raw: boolean = false) {
  const vals = raw ? exported : JSON.stringify(serialize(exported));
  const blob = new Blob([vals], { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(blob, title);
}
