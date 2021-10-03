import { boot } from 'quasar/wrappers';
import { Plugin } from 'vue';

import automation from '@/plugins/automation';
import builder from '@/plugins/builder';
import history from '@/plugins/history';
import misc from '@/plugins/misc';
import quickstart from '@/plugins/quickstart';
import spark from '@/plugins/spark';
import tilt from '@/plugins/tilt';
import wizardry from '@/plugins/wizardry';
import { startup } from '@/startup';
import { useDashboardStore } from '@/store/dashboards';
import { useServiceStore } from '@/store/services';
import { useSystemStore } from '@/store/system';
import { useWidgetStore } from '@/store/widgets';

interface Startable {
  start(): Promise<void>;
}

export default boot(({ app }) => {
  const plugins: Plugin[] = [
    wizardry,
    history,
    spark,
    tilt,
    builder,
    quickstart,
    misc,
    automation,
  ];

  const started: Startable[] = [
    useSystemStore(),
    useServiceStore(),
    useDashboardStore(),
    useWidgetStore(),
  ];

  started.forEach((startable) => startup.onStart(startable.start));
  plugins.forEach((plugin) => app.use(plugin));
});
