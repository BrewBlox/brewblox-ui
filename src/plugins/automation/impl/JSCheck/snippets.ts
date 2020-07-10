import { createDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockFieldAddress, BlockType } from '@/plugins/spark/types';

export interface JSSnippetFactory {
  desc: string;
  func(callback: ((v: string) => void)): void | Promise<void>;
}

export const snippetMakers: JSSnippetFactory[] = [
  {
    desc: 'Get block',
    func(callback) {
      createDialog({
        component: 'BlockAddressDialog',
        title: 'Select target block',
        message: 'Pick a block. A function call to get that block will be generated.',
        anyService: true,
      })
        .onOk((addr: BlockAddress) =>
          callback(`getBlock('${addr.serviceId}', '${addr.id}')`));
    },
  },

  {
    desc: 'Get block field',
    func(callback) {
      createDialog({
        component: 'BlockFieldAddressDialog',
        title: 'Select target field',
        message: 'Pick a block and field. A function call to get that field will be generated.',
      })
        .onOk((addr: BlockFieldAddress) => {
          const field = sparkStore.specById(addr.type as BlockType).fields.find(f => f.key === addr.field);
          const call = `getBlockField('${addr.serviceId}', '${addr.id}', '${addr.field}${addr.postfix ?? ''}')`;
          const hint = field?.valueHint ? ` /* ${field.valueHint} */` : '';
          callback(call + hint);
        });
    },
  },
];
