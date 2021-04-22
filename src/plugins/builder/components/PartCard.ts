
import { computed, defineComponent } from 'vue';

import { FlowPart } from '@/plugins/builder/types';

@Component
export default class PartCard extends Vue {

  @Prop({ type: Object, required: true })
  public readonly part!: FlowPart;

  public savePart(part: FlowPart = this.part): void {
    this.$emit('update:part', part);
  }

  public removePart(): void {
    this.$emit('remove:part', this.part);
  }

  public savePartSettings(settings: any = this.part.settings): void {
    this.savePart({ ...this.part, settings });
  }
}
