
import sparkStore from '@/plugins/spark/store';

import { ConstraintsObj } from './components/Constraints/ConstraintsBase';


export const blockIdRules = (serviceId: string) => [
  v => !!v || 'Name must not be empty',
  v => !sparkStore.blockIds(serviceId).includes(v) || 'Name must be unique',
  v => v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
  v => v.match(/^[a-zA-Z0-9 \(\)_\-\|]*$/) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  v => v.length < 200 || 'Name must be less than 200 characters',
];

export const constraintLabels = new Map([
  // Digital
  ['minOff', 'Minimum OFF time'],
  ['minOn', 'Minimum ON time'],
  ['mutex', 'Mutually exclusive'],
  // Analog
  ['min', 'Minimum'],
  ['max', 'Maximum'],
  ['balanced', 'Balanced'],
]);

export const limitingConstraints = (obj: ConstraintsObj): string[] => {
  return [...obj.constraints]
    .filter(c => c.limiting)
    .map(c => Object.keys(c).find(key => key !== 'limiting') || '??')
    .map(k => constraintLabels.get(k) as string);
};
