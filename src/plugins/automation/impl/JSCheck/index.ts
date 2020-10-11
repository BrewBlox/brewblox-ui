import { matchesType } from '@/helpers/functional';
import { AutomationSpec, JSCheckImpl } from '@/plugins/automation/types';

import JSCheck from './JSCheck.vue';

const type = 'JSCheck';
const spec: AutomationSpec<JSCheckImpl> = {
  type,
  title: 'Scripted condition',
  component: JSCheck,
  generate: () => ({
    type,
    body: 'return true;',
  }),
  pretty: impl =>
    matchesType<JSCheckImpl>(type, impl)
      ? 'Scripted condition is checked'
      : `Invalid data: type=${impl.type}`,
};

export default spec;
