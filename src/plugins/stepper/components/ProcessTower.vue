<script lang="ts" >
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Process, ProcessStep, StepNote } from '../types';

@Component
export default class ProcessTower extends Vue {

  @Prop({ type: Object, required: true })
  public readonly process!: Process;

  @Prop({ required: true })
  public readonly selected!: string | null;

  get layout(): string {
    return this.$q.screen.lt.md
      ? 'dense'
      : 'comfortable';
  }

  private renderNote(h: CreateElement, note: StepNote): VNode {
    return h('div', [
      h('div', { class: 'text-bold' }, [note.title]),
      h('div', { class: 'ellipsis-2-lines' }, [note.message]),
    ]);
  }

  private renderStep(h: CreateElement, step: ProcessStep): VNode {
    return h('q-timeline-entry',
      {
        props: {
          subtitle: step.title,
          title: step.title,
          color: step.id === this.selected ? 'info' : 'silver',
        },
        class: 'hoverable',
        nativeOn: {
          click: () => this.$emit('update:selected', step.id),
        },
      },
      step.notes.map(note => this.renderNote(h, note)),
    );
  }

  public render(h: CreateElement): VNode {
    return h('q-timeline',
      {
        props: {
          dark: true,
          layout: this.layout,
        },
      },
      this.process.steps.map(step => this.renderStep(h, step)));
  }
}
</script>
