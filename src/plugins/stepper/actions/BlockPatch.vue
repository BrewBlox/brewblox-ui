<script lang="ts">
import { debounce } from 'quasar';
import Vue, { CreateElement, VNode } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, ChangeField } from '@/plugins/spark/types';

import { featureStore } from '../../../store/features';
import { StepAction } from '../types';

interface BlockPatchOpts {
  block: string;
  service: string;
  type: string;
  data: Mapped<any>;
}

interface BlockPatchAction extends StepAction {
  opts: BlockPatchOpts;
}

@Component
export default class BlockPatch extends Vue {
  @Prop({ type: Object, required: true })
  public readonly action!: BlockPatchAction;

  saveAction(action: BlockPatchAction = this.action): void {
    this.$emit('update:action', action);
  }

  get opts(): BlockPatchOpts {
    return this.action.opts;
  }

  get spec(): BlockSpec {
    return sparkStore.specs[this.opts.type];
  }

  get link(): Link {
    return new Link(this.opts.block, this.opts.type);
  }

  get displayName(): string {
    return featureStore.displayName(this.opts.type);
  }

  renderChange(h: CreateElement, change: ChangeField): VNode {
    return h('q-item',
      { props: { dark: true } },
      [
        h('q-item-section', [change.title]),
        h('q-item-section', [
          this.opts.data[change.key] !== undefined
          && h(change.component, {
            props: {
              ...change.componentProps,
              blockId: this.opts.block,
              serviceId: this.opts.service,
              value: this.opts.data[change.key],
              editable: true,
            },
            on: {
              input: debounce((v: any) => {
                this.$set(this.opts.data, change.key, v);
                this.saveAction();
              }, 500, false),
            },
          }),
        ]),
        h('q-item-section',
          { class: 'col-auto' },
          [
            this.opts.data[change.key] !== undefined
              ? h('q-btn',
                {
                  props: {
                    flat: true,
                    round: true,
                    icon: 'delete',
                  },
                  on: {
                    click: () => {
                      this.$delete(this.opts.data, change.key);
                      this.saveAction();
                    },
                  },
                },
                [h('q-tooltip', ['Remove field from action'])])
              : h('q-btn',
                {
                  props: {
                    flat: true,
                    round: true,
                    icon: 'add',
                  },
                  on: {
                    click: () => {
                      this.$set(this.opts.data, change.key, change.generate());
                      this.saveAction();
                    },
                  },
                },
                [h('q-tooltip', ['Add field change to action'])]),
          ]),
      ]);
  }

  render(h: CreateElement): VNode {
    return h('q-list',
      { props: { dark: true, dense: true } },
      [
        h('q-item',
          { props: { dark: true } },
          [
            // h('q-item-section', ['Block']),
            h('q-item-section',
              { class: 'col-auto' },
              [
                h('LinkField', {
                  props: {
                    value: this.link,
                    serviceId: this.opts.service,
                    tag: 'big',
                  },
                  on: {
                    input: v => {
                      this.opts.block = v.id;
                      this.saveAction();
                    },
                  },
                  // class: 'q-ml-md',
                }),
              ]),
            h('q-space'),
            h('q-item-section',
              { props: { side: true }, class: 'text-h6 text-italic' },
              [this.displayName]),
          ]),
        ...this.spec.changes.map(change => this.renderChange(h, change)),
        h('q-separator', { props: { dark: true, inset: true } }),
      ]
    );
  }
}
</script>
