import { matchesType } from '@/helpers/functional';
import { AutomationSpec, JSApplyImpl } from '@/plugins/automation/types';

import JSApply from './JSApply.vue';

const type = 'JSApply';
const spec: AutomationSpec<JSApplyImpl> = {
  type,
  title: 'Scripted action',
  component: JSApply,
  generate: () => ({
    type,
    body: "console.log('hello world!');",
  }),
  pretty: impl =>
    matchesType<JSApplyImpl>(type, impl)
      ? 'Scripted action is applied'
      : `Invalid data: type=${impl.type}`,
};

export default spec;
