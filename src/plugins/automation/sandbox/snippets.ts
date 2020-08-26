import { bloxQty, isLink, isQuantity } from '@/helpers/bloxfield';
import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockField, BlockFieldAddress, BlockType } from '@/plugins/spark/types';

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
    desc: 'Comparison example',
    run(callback) {
      const serviceId = sparkStore.serviceIds[0] ?? 'spark-one';
      callback('insert', [
        '// return             <- End script and set "result" value (only checked in conditions).',
        '// getBlockField(...) <- Helper function that finds a field in a Spark block.',
        '//                       You can use the "Get block field" snippet to generate this.',
        '// > 9000             <- Check that the getBlockField() value is greater than a specific value.',
        '//                       `return a > b` always returns true or false.',
        '//                       If the field has a unit, you need to use the qty() helper function.',
        '//',
        `return getBlockField('${serviceId}', 'SystemTime', 'millisSinceBoot') > 9000;`,
        '',
      ]);
    },
  },

  {
    desc: 'Quantity example',
    run(callback) {
      const unit = sparkStore.modules[0]?.units.Temp ?? 'degC';
      const value = bloxQty(20, 'degC').to(unit).round().value;
      const other = unit === 'degC' ? 'degF' : 'degC';
      callback('insert', [
        '/* Quantity example */',
        `const temp = qty(${value}, '${unit}');`,
        "const duration = qty('5h 2m 38s');",
        `const convertedTemp = temp.to('${other}');`,
        `const tempIsMoreThanValue = temp.gt(${value}, '${other}');`,
        `const tempIsLessThanValue = temp.lt(${value}, '${other}');`,
        "const durationIsEqualToValue = duration.eq(200, 'min');",
        '',
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
          const value = sparkStore.fieldByAddress(addr);
          const baseCall = `getBlockField('${addr.serviceId}', '${addr.id}', '${addr.field}')`;
          const call = isQuantity(value)
            ? `qty(${baseCall})`
            : baseCall;
          callback('insert', [
            `${call}${valueHint(addr)}`,
            '',
          ]);
        });
    },
  },

  {
    desc: 'Modify block field',
    run(callback) {
      createDialog({
        component: 'BlockFieldAddressDialog',
        title: 'Select target field',
        message: 'Pick a block and field. A function call will be generated.',
        fieldFilter: (field: BlockField) => !field.readonly,
      })
        .onOk((addr: BlockFieldAddress) => {
          const value = sparkStore.fieldByAddress(addr);
          const currentValue = isQuantity(value)
            ? `qty(${value.value}, '${value.unit}')`
            : JSON.stringify(value);

          callback('insert', [
            '/* Modify block field */',
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
    desc: 'Send HTTP request',
    run(callback) {
      const serviceId = sparkStore.serviceIds[0] ?? 'spark-one';
      callback('insert', [
        '/* Send HTTP request */',
        `const resp = await axios.get('http://${serviceId}:5000/${serviceId}/_service/status');`,
        "print('response status', resp.status);",
        "print('response body', resp.data);",
        "return resp.status === 200 && resp.data.status === 'ok';",
        '',
      ]);
    },
  },

  {
    desc: 'Send Slack notification',
    run(callback) {
      const rules = [
        (v: string) => v?.startsWith('https://hooks.slack.com/services/')
          || 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      ];
      createDialog({
        component: 'InputDialog',
        title: 'Webhook URL',
        message: `
        To send a Slack notification, a webhook URL is required. <br>
        For more information, see
        <a
          href="https://api.slack.com/messaging/webhooks"
          target="_blank"
          style="color: white"
        >the Slack documentation page.</a>
        `,
        html: true,
        rules,
        fontSize: '100%',
      })
        .onOk((url: string) => {
          callback('insert', [
            '/* Send Slack notification */',
            `await axios.post('${url}', {`,
            "  text: 'Hello world!',",
            '});',
            '',
          ]);
        });
    },
  },

  {
    desc: 'Publish history data (MQTT)',
    run(callback) {
      createDialog({
        component: 'InputDialog',
        title: 'Key',
        message: 'Data will be published under this name. For most services, the key is the service name',
        rules: [
          (v: string) => !!v || 'Key can not be empty',
          (v: string) => /^\w+$/.test(v ?? '') || 'Key can only include letters, numbers, and _- characters',
        ],
      })
        .onOk((key: string) => {
          callback('insert', [
            '/* Publish history data (MQTT) */',
            `await publishEvent('brewcast/history/${key}', {`,
            `  key: '${key}',`,
            '  data: { ',
            "    'value[degC]': 12.6,",
            '  },',
            '});',
            '',
          ]);
        });
    },
  },
];
