import {
  ActuatorLogicBlock,
  AnalogCompareOp,
  DigitalCompareOp,
  DigitalState,
  LogicResult,
} from '@/plugins/spark/types';
import { AnalogCompare, DigitalCompare } from '@/plugins/spark/types';
import { bloxLink } from '@/utils/link';

import {
  comparisonCheck,
  sanitize,
  shiftRemainingComparisons,
  syntaxCheck,
} from '../utils';

describe('Sanitize expression strings', () => {
  it('should remove invalid characters', () => {
    expect(sanitize('123(67A|B)!z@#$%^&*-=_+?<>;\n  ')).toBe('(A|B)!z^&');
    expect(sanitize('          ')).toBe('');
  });
});

describe('Check symbol syntax', () => {
  it('should check bracket balance', () => {
    expect(syntaxCheck('(A)')).toBe(null);
    expect(syntaxCheck('(A&a)|A')).toBe(null);
    expect(syntaxCheck(')(')).toMatchObject({ index: 0 });
    expect(syntaxCheck('(A&a)|(A')).toMatchObject({ index: 7 });
    expect(syntaxCheck('(A&a))')).toMatchObject({ index: 5 });
    expect(syntaxCheck('(((a))&b)')).toBe(null);
  });

  it('should check empty brackets', () => {
    expect(syntaxCheck('()')).toMatchObject({ index: 1 });
    expect(syntaxCheck('(a)|()')).toMatchObject({ index: 5 });
  });

  it('should check nested comparisons', () => {
    expect(syntaxCheck('((a)|(A&B))')).toBe(null);
    expect(syntaxCheck('((a)|(A&B)')).toMatchObject({ index: 9 });
  });

  it('should check subsequent characters', () => {
    expect(syntaxCheck('AA')).toMatchObject({ index: 1 });
    expect(syntaxCheck('!!A')).toBe(null);
    expect(syntaxCheck('!!A!')).toMatchObject({ index: 3 });
    expect(syntaxCheck('a|!!&A')).toMatchObject({ index: 4 });
    expect(syntaxCheck('A&|A')).toMatchObject({ index: 2 });
    expect(syntaxCheck('(A&A)a')).toMatchObject({ index: 5 });
    expect(syntaxCheck('(A)!')).toMatchObject({ index: 3 });
    expect(syntaxCheck('a&')).toMatchObject({ index: 1 });
  });
});

const analog = (): AnalogCompare[] => [
  {
    op: AnalogCompareOp.OP_SETTING_GE,
    result: LogicResult.RESULT_EMPTY,
    id: bloxLink(null),
    rhs: 20,
  },
  {
    op: AnalogCompareOp.OP_SETTING_GE,
    result: LogicResult.RESULT_EMPTY,
    id: bloxLink('analog-1'),
    rhs: 20,
  },
  {
    op: AnalogCompareOp.OP_SETTING_GE,
    result: LogicResult.RESULT_EMPTY,
    id: bloxLink('analog-2'),
    rhs: 20,
  },
];
const digital = (): DigitalCompare[] => [
  {
    op: DigitalCompareOp.OP_DESIRED_IS,
    result: LogicResult.RESULT_EMPTY,
    id: bloxLink(null),
    rhs: DigitalState.STATE_ACTIVE,
  },
  {
    op: DigitalCompareOp.OP_DESIRED_IS,
    result: LogicResult.RESULT_EMPTY,
    id: bloxLink('digital-1'),
    rhs: DigitalState.STATE_ACTIVE,
  },
  {
    op: DigitalCompareOp.OP_DESIRED_IS,
    result: LogicResult.RESULT_EMPTY,
    id: bloxLink('digital-2'),
    rhs: DigitalState.STATE_ACTIVE,
  },
];

const args = (
  expression: string,
): Pick<ActuatorLogicBlock['data'], 'expression' | 'digital' | 'analog'> => ({
  expression,
  analog: analog(),
  digital: digital(),
});

describe('Check comparison references', () => {
  it('should check presence of comparison refs', () => {
    expect(comparisonCheck(args('aAbC'))).toBe(null);
    expect(comparisonCheck(args(''))).toBe(null);
    expect(comparisonCheck(args('aBf'))).toMatchObject({ index: 2 });
    expect(comparisonCheck(args('(a|b)&(C&D)&a'))).toMatchObject({ index: 9 });
  });
});

describe('Shift remaining comparison characters', () => {
  it('should adjust comparison characters', () => {
    expect(shiftRemainingComparisons('(a|b)&C&c&B', 'b')).toBe('(a|?)&C&b&B');
    expect(shiftRemainingComparisons('a&C&D', 'F')).toBe('a&C&D');
  });

  it('should deal with invalid input strings', () => {
    expect(shiftRemainingComparisons('', 'A')).toBe('');
    expect(shiftRemainingComparisons('', '')).toBe('');
    expect(shiftRemainingComparisons('a|b', '')).toBe('a|b');
    expect(shiftRemainingComparisons('a|b', '&')).toBe('a|b');
  });
});
