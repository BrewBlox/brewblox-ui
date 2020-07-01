import { matchesType } from '@/helpers/functional';
import { AutomationSpec, ComparisonImpl } from '@/plugins/automation/types';

import Comparison from './Comparison.vue';

const type = 'Comparison';
const spec: AutomationSpec<ComparisonImpl> = {
  type,
  title: 'Value comparison',
  component: Comparison,
  generate: () => ({
    type,
    lhs: null,
    rhs: null,
    operator: null,
  }),
  pretty: impl =>
    matchesType<ComparisonImpl>(type, impl)
      ? `${impl.lhs} ${impl.operator} ${impl.rhs}`
      : `Invalid data: type=${impl.type}`,
  hidden: true,
};

export default spec;
