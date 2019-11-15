<script lang="ts" >
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Process, ProcessStep } from '../types';

@Component
export default class ProcessIndex extends Vue {

  @Prop({ type: Object, required: true })
  public readonly process!: Process;

  @Prop({ required: true })
  public readonly selected!: string | null;

  private listDesc(name: string, arr: any[]): string {
    return `${arr.length} ${name}${arr.length !== 1 ? 's' : ''}`;
  }

  private renderStep(h: CreateElement, step: ProcessStep): VNode {
    return h('q-timeline-entry',
      {
        props: {
          title: step.title,
          color: step.id === this.selected ? 'info' : 'silver',
        },
        class: { 'hoverable': true, 'bg-selected': step.id === this.selected },
        nativeOn: {
          click: () => this.$emit('update:selected', step.id),
        },
      },
      [
        h('div', [[
          this.listDesc('action', step.actions),
          this.listDesc('condition', step.conditions),
          this.listDesc('note', step.notes),
        ].join(', ')]),
      ]
    );
  }

  public render(h: CreateElement): VNode {
    return h('q-timeline',
      { props: { layout: 'dense' } },
      this.process.steps.map(step => this.renderStep(h, step)));
  }
}
</script>
