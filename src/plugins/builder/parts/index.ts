import { globComponents } from '@/utils/component-ref';

const parts = globComponents(import.meta.globEager('./*.vue'));

export default parts;
