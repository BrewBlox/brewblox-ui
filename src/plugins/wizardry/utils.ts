import { Block } from 'brewblox-proto/ts';
import { useSparkStore } from '@/plugins/spark/store';
import { useFeatureStore } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { sleep } from '@/utils/misc';
import { notify } from '@/utils/notify';

export async function tryCreateWidget<T>(
  widget: Widget<T>,
): Promise<Widget<T> | null> {
  try {
    const widgetStore = useWidgetStore();
    const featureStore = useFeatureStore();
    await widgetStore.appendWidget(widget);
    const featureTitle = featureStore.widgetTitle(widget.feature);
    notify.done(`Created ${featureTitle} widget <b>${widget.title}</b>`);
    await sleep(1000); // TODO(Bob) Improve tracking of when widget is actually added
    return widgetStore.widgetById(widget.id);
  } catch (e: any) {
    notify.error(`Failed to create widget: ${e.toString()}`);
    return null;
  }
}

export async function tryCreateBlock(block: Block): Promise<Block | null> {
  try {
    const sparkStore = useSparkStore();
    const featureStore = useFeatureStore();
    await sparkStore.createBlock(block);
    await sleep(1000); // TODO(Bob) Improve tracking of when block is actually added
    const featureTitle = featureStore.widgetTitle(block.type);
    notify.done(`Created ${featureTitle} block <i>${block.id}</i>`);
    return sparkStore.blockByAddress(block);
  } catch (e: any) {
    notify.error(`Failed to create block: ${e.toString()}`);
    return null;
  }
}
