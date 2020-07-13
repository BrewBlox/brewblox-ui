import { createDialog } from '@/helpers/dialog';
import { isPostFixed } from '@/plugins/spark/parse-object';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockFieldAddress, BlockType } from '@/plugins/spark/types';

type ApplyFunc = (v: string | string[]) => void;

export interface JSSnippetFactory {
  desc: string;
  func(insert: ApplyFunc, append: ApplyFunc): void | Promise<void>;
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
  if (isPostFixed(value)) {
    return comment(value.constructor.name);
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

export const snippetMakers: JSSnippetFactory[] = [
  {
    desc: 'Example',
    func(_, append) {
      const serviceId = sparkStore.serviceIds[0] ?? 'spark-one';
      append([
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
    func(insert) {
      createDialog({
        component: 'BlockAddressDialog',
        title: 'Select target block',
        message: 'Pick a block. A function call to get that block will be generated.',
        anyService: true,
      })
        .onOk((addr: BlockAddress) =>
          insert(`getBlock('${addr.serviceId}', '${addr.id}')`));
    },
  },

  {
    desc: 'Get block field',
    func(insert) {
      createDialog({
        component: 'BlockFieldAddressDialog',
        title: 'Select target field',
        message: 'Pick a block and field. A function call to get that field will be generated.',
      })
        .onOk((addr: BlockFieldAddress) => {
          const call = `getBlockField('${addr.serviceId}', '${addr.id}', '${addr.field}${addr.postfix ?? ''}')`;
          insert(call + valueHint(addr));
        });
    },
  },

  {
    desc: 'Make HTTP request',
    func(_, append) {
      const serviceId = sparkStore.serviceIds[0] ?? 'spark-one';
      append([
        '// HTTP requests return a Promise. We need to wait for it using then().',
        '// You can return a value from the then() function.',
        `return axios.get('http://${serviceId}:5000/${serviceId}/_service/status').then(resp => {`,
        "  console.log('response status', resp.status);",
        "  console.log('response body', resp.data);",
        "  return resp.status === 200 && resp.data.status === 'ok';",
        '});',
      ]);
    },
  },
];
