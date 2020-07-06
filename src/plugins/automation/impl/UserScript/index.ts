import { matchesType } from '@/helpers/functional';
import { AutomationSpec, UserScriptImpl } from '@/plugins/automation/types';

import UserScript from './UserScript.vue';

const type = 'UserScript';
const spec: AutomationSpec<UserScriptImpl> = {
  type,
  title: 'Custom condition',
  component: UserScript,
  generate: () => ({
    type,
    body: 'return true;',
  }),
  pretty: impl =>
    matchesType<UserScriptImpl>(type, impl)
      ? 'Custom condition is checked'
      : `Invalid data: type=${impl.type}`,
};

export default spec;
