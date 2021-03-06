<script lang="ts">
import { computed, defineComponent, provide, reactive, watch } from 'vue';

import { tiltStore } from '@/plugins/tilt/store';
import { TiltService, TiltStateValue } from '@/plugins/tilt/types';
import { WidgetContext } from '@/store/features';
import { serviceStore } from '@/store/services';
import { ContextKey } from '@/symbols';
import { makeObjectSorter } from '@/utils/functional';
import { startChangeServiceTitle } from '@/utils/services';

const context: WidgetContext = {
  mode: 'Basic',
  container: 'Dashboard',
  size: 'Content',
};

export default defineComponent({
  name: 'TiltPage',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    provide(ContextKey, reactive<WidgetContext>(context));

    const service = computed<TiltService | null>(
      () => serviceStore.serviceById(props.serviceId),
    );

    const title = computed<string>(
      () => service.value?.title ?? 'Spark service',
    );

    function editTitle(): void {
      startChangeServiceTitle(service.value);
    }

    watch(
      () => title.value,
      (title) => {
        document.title = `Brewblox | ${title}`;
      },
    );

    const values = computed<TiltStateValue[]>(
      () => tiltStore.values
        .filter(v => v.serviceId === props.serviceId)
        .sort(makeObjectSorter('color')),
    );

    return {
      service,
      title,
      editTitle,
      values,
    };
  },
});
</script>

<template>
  <q-page class="page-height">
    <TitleTeleport>
      <span class="cursor-pointer" @click="editTitle">{{ title }}</span>
    </TitleTeleport>
    <ButtonsTeleport>
      <ActionMenu
        round
        size="12px"
        class="self-center"
      >
        <q-tooltip>
          Service actions
        </q-tooltip>
        <template #menus>
          <TiltActions :service-id="serviceId" />
        </template>
      </ActionMenu>
    </ButtonsTeleport>
    <div class="q-pa-lg q-gutter-md row">
      <div
        v-for="value in values"
        :key="value.id"
        style="max-width: 500px"
      >
        <Card>
          <template #toolbar>
            <Toolbar
              :title="value.color"
              subtitle="Tilt"
            />
          </template>
          <TiltValues :state="value" class="widget-body" />
        </Card>
      </div>
    </div>
  </q-page>
</template>
