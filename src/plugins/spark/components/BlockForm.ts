import { Component, Emit, Prop } from 'vue-property-decorator';

import FormBase from '@/components/Form/FormBase';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

@Component
export default class BlockForm extends FormBase {

  @Prop({ type: Object, required: true })
  public readonly block!: Block;

  @Emit('update:block')
  public saveBlock(block: Block = this.block): Block {
    return block;
  }

  public get blockData(): any {
    const actualBlock: Block = { ...this.block, data: this.block.data || this.defaultData() };
    if (!this.block.data && actualBlock.data) {
      this.saveBlock(actualBlock);
    }
    return actualBlock.data;
  }

  public get serviceId(): string {
    return this.block.serviceId;
  }

  protected get isDriven(): boolean {
    return sparkStore.drivenChains(this.serviceId)
      .some((chain: string[]) => chain[0] === this.block.id);
  }

  public presets(): { label: string; value: Record<string, any> }[] {
    return [];
  }

  public defaultData(): Record<string, any> | null {
    return null;
  }

  public callAndSaveBlock(func: (v: any) => void): (v: any) => void {
    return (v: any) => { func(v); this.saveBlock(); };
  }
}
