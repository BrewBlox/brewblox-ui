<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { tiltStore } from '@/plugins/tilt/store';
import { TiltService, TiltStateValue } from '@/plugins/tilt/types';
import { WidgetContext } from '@/store/features';
import { serviceStore } from '@/store/services';

@Component
export default class TiltPage extends Vue {

  context: WidgetContext = {
    mode: 'Basic',
    container: 'Dashboard',
    size: 'Content',
  };

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Watch('service.title', { immediate: true })
  watchTitle(newV: string): void {
    document.title = `Brewblox | ${newV ?? 'Tilt service'}`;
  }

  get service(): TiltService {
    return serviceStore.serviceById(this.serviceId)!;
  }

  get values(): TiltStateValue[] {
    return tiltStore.values
      .filter(v => v.serviceId === this.serviceId)
      .sort(objectStringSorter('color'));
  }

}
</script>

<template>
  <q-page class="page-height">
    <portal to="toolbar-title">
      {{ service.title }}
    </portal>
    <portal to="toolbar-buttons">
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
    </portal>

    <div class="q-pa-lg q-gutter-md row">
      <div
        v-for="value in values"
        :key="value.id"
        style="max-width: 500px"
      >
        <CardWrapper v-bind="{context}">
          <template #toolbar>
            <Toolbar
              :title="value.color"
              subtitle="Tilt"
            />
          </template>
          <TiltValues :value="value" class="widget-body" />
        </CardWrapper>
      </div>
    </div>
  </q-page>
</template>
