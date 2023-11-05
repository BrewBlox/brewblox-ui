import { useHistoryStore } from '@/plugins/history/store';
import { GraphConfig, QueryTarget } from '@/plugins/history/types';
import { BlockAddress } from '@/plugins/spark/types';
import { useWidgetStore, Widget } from '@/store/widgets';
import { createDialog, createDialogPromise } from '@/utils/dialog';
import { notify } from '@/utils/notify';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniq from 'lodash/uniq';

export function mergeTargets(
  a: QueryTarget[],
  b: QueryTarget[],
): QueryTarget[] {
  return uniq([...a, ...b].map((v) => v.measurement)).map((m) => {
    const fields = [...a, ...b]
      .filter((target) => target.measurement === m)
      .flatMap((target) => target.fields);
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
  }).onOk(async (cfg: GraphConfig) => {
    const widgetStore = useWidgetStore();
    const widget: Widget<GraphConfig> | null = widgetStore.widgetById(widgetId);
    if (!widget) {
      return;
    }
    const merged = mergeWith(widget.config, cfg, (a, b) => {
      return isArray(b) && b.length && 'measurement' in b[0]
        ? mergeTargets(a, b)
        : undefined;
    });
    await widgetStore.saveWidget({ ...widget, config: merged });
    notify.done(`Added ${cfg.fields.length} fields to <b>${widget.title}</b>`);
  });
}

export async function selectSessionGraph(): Promise<GraphConfig | null> {
  const historyStore = useHistoryStore();
  const selectedId: string | null = await createDialogPromise({
    component: 'SelectDialog',
    componentProps: {
      modelValue: null,
      selectOptions: historyStore.sessions.flatMap((session) =>
        session.notes
          .filter((note) => note.type === 'Graph')
          .map((note) => ({
            value: `${session.id}:${note.id}`,
            label: `${session.title} - ${note.title}`,
            session: session.id,
            note: note.id,
          })),
      ),
      title: 'Select graph',
      message: 'Select a session graph. Its fields and names will be copied.',
    },
  });
  if (selectedId) {
    const [sessionId, noteId] = selectedId.split(':', 2);
    const note = historyStore
      .sessionById(sessionId)
      ?.notes.find((note) => note.id === noteId);
    if (note && note.type === 'Graph') {
      return cloneDeep(note.config);
    }
  }
  return null;
}
