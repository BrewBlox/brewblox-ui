import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniq from 'lodash/uniq';

import { GraphConfig, QueryTarget } from '@/plugins/history/types';
import { BlockAddress } from '@/plugins/spark/types';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { notify } from '@/utils/notify';

export function mergeTargets(a: QueryTarget[], b: QueryTarget[]): QueryTarget[] {
  return uniq([...a, ...b].map(v => v.measurement))
    .map(m => {
      const fields = [...a, ...b]
        .filter(target => target.measurement === m)
        .flatMap(target => target.fields);
      return {
        measurement: m,
        fields: uniq(fields),
      };
    });
}

export function addBlockGraph(
  widgetId: string,
  blockAddress: BlockAddress | null,
): void {
  createDialog({
    component: 'SelectBlockGraphDialog',
    componentProps: {
      address: blockAddress,
    },
  })
    .onOk(async (cfg: GraphConfig) => {
      const widget: Widget<GraphConfig> | null = widgetStore.widgetById(widgetId);
      if (!widget) {
        return;
      }
      const merged = mergeWith(widget.config, cfg, (a, b) => {
        return (isArray(b) && b.length && 'measurement' in b[0])
          ? mergeTargets(a, b)
          : undefined;
      });
      await widgetStore.saveWidget({ ...widget, config: merged });
      const numFields = cfg.targets.reduce((acc, v) => acc + v.fields.length, 0);
      notify.done(`Added ${numFields} fields to <b>${widget.title}</b>`);
    });
}
