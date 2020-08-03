import { BlockValueImpl } from '@/plugins/automation/types';

export type CompareOperator = BlockValueImpl['operator'];

export interface OperatorOption extends SelectOption<CompareOperator> {
  desc: string;
}

export const operatorSymbols: OperatorOption[] = [
  { label: '==', value: 'eq', desc: 'Equal to' },
  { label: '!=', value: 'ne', desc: 'Not equal to' },
  { label: '<', value: 'lt', desc: 'Less than' },
  { label: '=<', value: 'le', desc: 'Less than or equal to' },
  { label: '>=', value: 'ge', desc: 'More than or equal to' },
  { label: '>', value: 'gt', desc: 'More than' },
];
