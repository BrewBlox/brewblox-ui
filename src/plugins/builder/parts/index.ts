import { globComponents } from '@/utils/component-ref';

const parts = globComponents(import.meta.glob('./*.vue', { eager: true }));

export default parts;
