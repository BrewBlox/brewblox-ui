<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { addListener, removeListener } from './actions';
import { tryListenerById } from '@/store/history/getters';
import { MetricsResult, MetricsConfig } from './state';
import { QueryTarget, Listener, DisplayNames, QueryParams } from '@/store/history/state';
import { Watch } from 'vue-property-decorator';

interface CurrentValue extends MetricsResult {
  stale: boolean;
}

@Component
export default class MetricsWidget extends WidgetBase {
  modalOpen: boolean = false;

  get widgetCfg(): MetricsConfig {
    return {
      targets: [],
      renames: {},
      params: {},
      ...this.$props.config,
    };
  }

  get targets(): QueryTarget[] {
    return this.widgetCfg.targets;
  }

  get renames(): DisplayNames {
    return this.widgetCfg.renames;
  }

  get params(): QueryParams {
    return this.widgetCfg.params;
  }

  get listeners(): Listener[] {
    return this.targets
      .map(target => tryListenerById(this.$store, this.listenerId(target)))
      .filter(listener => listener !== null && !!listener.values) as Listener[];
  }

  get values(): CurrentValue[] {
    const now = new Date().getTime();
    return this.listeners
      .reduce((acc: MetricsResult[], listener: Listener) => [...acc, ...listener.values], [])
      .map(result => ({
        ...result,
        stale: !!result.time && (now - result.time as number > 100),
      }));
  }

  listenerId(target: QueryTarget): string {
    return `${this.widgetId}/${target.measurement}`;
  }

  addListeners() {
    this.targets
      .forEach(target =>
        addListener(
          this.$store,
          this.listenerId(target),
          this.params,
          this.renames,
          target,
        ));
  }

  removeListeners() {
    this.listeners
      .forEach(listener =>
        removeListener(this.$store, listener));
  }

  resetListeners() {
    this.removeListeners();
    this.addListeners();
  }

  @Watch('widgetCfg', { deep: true })
  regraph() {
    this.$nextTick(() => this.resetListeners());
  }

  mounted() {
    this.addListeners();
  }

  destroyed() {
    this.removeListeners();
  }
}
</script>

<template>
  <q-card dark class="text-white column">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <MetricsForm
        v-if="modalOpen"
        v-bind="$props"
        :field="widgetCfg"
        :on-change-field="saveConfig"
      />
    </q-dialog>

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="modalOpen = true">
          <q-list dark bordered>
            <ActionItem icon="refresh" label="Refresh" @click="resetListeners"/>
            <ActionItem
              v-if="$props.onCopy"
              icon="file_copy"
              label="Copy widget"
              @click="$props.onCopy(widgetId)"
            />
            <ActionItem
              v-if="$props.onMove"
              icon="exit_to_app"
              label="Move widget"
              @click="$props.onMove(widgetId)"
            />
            <ActionItem
              v-if="$props.onDelete"
              icon="delete"
              label="Delete widget"
              @click="$props.onDelete(widgetId)"
            />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-list dark>
        <q-item v-for="val in values" :key="val.field" dark>
          <q-item-section v-if="val.stale" side>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>{{ val.field }}</q-item-label>
            <big>{{ val.value | round }}</big>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
