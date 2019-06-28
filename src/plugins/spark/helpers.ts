
import sparkStore from '@/plugins/spark/store';

export const blockIdRules = (serviceId: string) => [
  v => !!v || 'Name must not be empty',
  v => !sparkStore.blockIds(serviceId).includes(v) || 'Name must be unique',
  v => v.match(/^[a-zA-Z]/) || 'Name must start with a letter',
  v => v.match(/^[a-zA-Z0-9 \(\)_\-\|]*$/) || 'Name may only contain letters, numbers, spaces, and ()-_|',
  v => v.length < 200 || 'Name must be less than 200 characters',
];
