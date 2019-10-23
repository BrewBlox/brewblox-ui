<script lang="ts" >
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Action, Condition, Process, Step } from '../types';

@Component
export default class ProcessTower extends Vue {

  @Prop({ type: Object, required: true })
  public readonly process!: Process;

  get layout(): string {
    return this.$q.screen.lt.md
      ? 'dense'
      : (this.$q.screen.lt.lg ? 'comfortable' : 'loose');
  }

  private renderAction(h: CreateElement, action: Action | Condition): VNode {
    return h('ActionItem',
      {
        props: {
          // icon: 'mdi-circle-edit-outline',
          label: action.type,
          noClose: true,
          itemProps: {
            // insetLevel: 0.2,
            // dense: true,
          },
        },
        on: {
          click: () => { console.log(action.type); },
        },
        // class: 'q-ma-none q-pa-none',
        // style: 'border-left: 2px solid red',
      });
  }

  private renderCondition(h: CreateElement, cond: Condition): VNode {
    return h('ActionItem',
      {
        props: {
          // icon: 'mdi-progress-check',
          label: cond.type,
          noClose: true,
          itemProps: {
            // insetLevel: 0.2,
            // dense: true,
          },
        },
        on: {
          click: () => { console.log(cond.type); },
        },
        // style: 'border-left: 2px solid dodgerblue',
      });
  }

  private renderStep(h: CreateElement, step: Step): VNode {
    return h('q-timeline-entry',
      {
        props: {
          subtitle: step.name,
          title: step.name,
          // icon: 'mdi-playlist-check',
        },
        scopedSlots: {
          title: () => h('div',
            { class: 'row' },
            [
              // step.name,
              h('q-btn', {
                props: {
                  label: 'start',
                  flat: true,
                  stretch: true,
                },
              }),
              h('q-space'),
              h('q-btn', {
                props: {
                  flat: true,
                  stretch: true,
                  icon: 'mdi-chevron-down',
                },
              }),
            ]
          ),
        },
      },
      [
        ...step.actions.map(action => this.renderAction(h, action)),
        ...step.conditions.map(cond => this.renderCondition(h, cond)),
      ]
    );
  }

  public render(h: CreateElement): VNode {
    return h('q-timeline',
      {
        props: {
          color: 'info',
          dark: true,
          layout: this.layout,
          // bordered: true,
        },
      },
      [
        ...this.process.steps.map(step => this.renderStep(h, step)),
        h('q-timeline-entry',
          {
            props: {
              title: 'Finished!',
              color: 'positive',
            },
          }),
      ]);
  }
}
</script>

<style>
.q-timeline__title {
  margin-bottom: 5px;
}
</style>
