<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import get from 'lodash/get';
import parseDuration from 'parse-duration';
import { durationString } from '@/helpers/functional';
import { tryListenerById } from '@/store/history/getters';
import { QueryTarget, Listener, DisplayNames, QueryParams } from '@/store/history/state';
import { MetricsResult, MetricsConfig } from './state';
import { DEFAULT_FRESH_DURATION } from './getters';
import { addListener, removeListener } from './actions';

interface CurrentValue extends MetricsResult {
  name: string;
  stale: boolean;
}

@Component
export default class MetricsWidget extends WidgetBase {
  parseDuration = parseDuration;
  durationString = durationString;
  DEFAULT_FRESH_DURATION = DEFAULT_FRESH_DURATION;

  modalOpen: boolean = false;

  get widgetCfg(): MetricsConfig {
    return {
      targets: [],
      renames: {},
      params: {},
      freshDuration: {},
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

  fieldFreshDuration(field: string) {
    return get(this.widgetCfg.freshDuration, field, DEFAULT_FRESH_DURATION);
  }

  get values(): CurrentValue[] {
    const now = new Date().getTime();
    return this.listeners
      .reduce((acc: MetricsResult[], listener: Listener) => [...acc, ...listener.values], [])
      .map(result => ({
        ...result,
        name: this.renames[result.field] || result.field,
        stale: !!result.time && (now - result.time as number > this.fieldFreshDuration(result.field)),
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
        <q-item v-if="values.length === 0" dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>No metrics selected.</q-item-section>
          <q-item-section side>
            <q-btn flat text-color="white" label="Add metrics" @click="modalOpen = true"/>
          </q-item-section>
        </q-item>
        <q-item v-for="val in values" :key="val.field" dark>
          <q-item-section>
            <q-item-label caption>{{ val.name }}</q-item-label>
            <div class="row items-center">
              <big :class="{darkened: val.stale}">{{ val.value | round }}</big>
              <q-icon v-if="val.stale" name="warning" right size="24px"/>
            </div>
            <q-tooltip v-if="val.stale">
              {{ val.name }} was updated more than {{ durationString(fieldFreshDuration(val.field)) }} ago.
              <br>
              Last update: {{ new Date(val.time).toLocaleString() }}.
            </q-tooltip>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>
