import { createDialog } from '@/helpers/dialog';
import { isLink, isQuantity } from '@/plugins/spark/bloxfield';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockFieldAddress, BlockType } from '@/plugins/spark/types';

export type SnippetMode = 'append' | 'insert';
export type SnippetCallback = (mode: SnippetMode, lines: string[]) => unknown;

export interface SnippetGenerator {
  desc: string;
  run(callback: SnippetCallback): void | Promise<void>;
}

const comment = (v: any): string =>
  ` /* ${v} */`;

const valueHint = (addr: BlockFieldAddress): string => {
  const field = sparkStore
    .specById(addr.type as BlockType)
    .fields
    .find(f => f.key === addr.field)!;

  const { valueHint, generate } = field;

  // Is custom hint set?
  if (valueHint) {
    return comment(valueHint);
  }

  // Infer hint based on value
  const value = generate(addr.serviceId);

  // Check for typed fields
  if (isQuantity(value)) {
    return comment(value.unit);
  }
  if (isLink(value)) {
    return comment(value.type);
  }

  // Infer hint based on typeof value
  const valueType = typeof value;
  switch (valueType) {
    case 'boolean':
      return comment('Boolean: true / false');
    case 'object':
      return comment(JSON.stringify(value));

    default:
      return comment(valueType);
  }
};

export const generators: SnippetGenerator[] = [
  {
    desc: 'Example',
    run(callback) {
      const serviceId = sparkStore.serviceIds[0] ?? 'spark-one';
      callback('append', [
        `return getBlockField('${serviceId}', 'SystemTime', 'millisSinceBoot') > 9000;`,
        '//',
        '// //                 <- lines that start with // are comments.',
        '// return             <- End script and return the value that will be checked.',
        '// getBlockField(...) <- Built-in function that gets a field in a Spark block.',
        '//                       You can use the "Get block field" snippet to generate this.',
        '// > 9000             <- Check that the getField() value is greater than a specific value.',
        '//                       `return a > b` always returns true or false.',
      ]);
    },
  },

  {
    desc: 'Get block',
    run(callback) {
      createDialog({
        component: 'BlockAddressDialog',
        title: 'Select target block',
        message: 'Pick a block. A function call to get that block will be generated.',
        anyService: true,
      })
        .onOk((addr: BlockAddress) =>
          callback('insert', [
            `getBlock('${addr.serviceId}', '${addr.id}')`,
            '',
          ]));
    },
  },

  {
    desc: 'Get block field',
    run(callback) {
      createDialog({
        component: 'BlockFieldAddressDialog',
        title: 'Select target field',
        message: 'Pick a block and field. A function call to get that field will be generated.',
      })
        .onOk((addr: BlockFieldAddress) => {
          callback('insert', [
            `getBlockField('${addr.serviceId}', '${addr.id}', '${addr.field}')${valueHint(addr)}`,
            '',
          ]);
        });
    },
  },

  {
    desc: 'Save block field',
    run(callback) {
      createDialog({
        component: 'BlockFieldAddressDialog',
        title: 'Select target field',
        message: 'Pick a block and field. A function call will be generated.',
      })
        .onOk((addr: BlockFieldAddress) => {
          const block = sparkStore.blockByAddress(addr);
          const value = block!.data[addr.field!];
          const currentValue = isQuantity(value)
            ? `qty(${value.value}, '${value.unit}')`
            : JSON.stringify(value);

          callback('insert', [
            '',
            `const block = getBlock('${addr.serviceId}', '${addr.id}');`,
            `print('current value', block.data.${addr.field});`,
            `block.data.${addr.field} = ${currentValue};${valueHint(addr)}`,
            'await saveBlock(block);',
            '',
          ]);
        });
    },
  },

  {
    desc: 'Make HTTP request',
    run(callback) {
      const serviceId = sparkStore.serviceIds[0] ?? 'spark-one';
      callback('append', [
        '// HTTP requests are async, and must be awaited',
        `const resp = await axios.get('http://${serviceId}:5000/${serviceId}/_service/status');`,
        "print('response status', resp.status);",
        "print('response body', resp.data);",
        "return resp.status === 200 && resp.data.status === 'ok';",
      ]);
    },
  },
];
