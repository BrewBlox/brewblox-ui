import type { BuilderBlueprint, BuilderLayout } from '@/plugins/builder/types';
import { upgradeMetricsConfig } from '@/plugins/history/utils';
import { concatById, filterById, findById } from '@/utils/collections';
import { defineStore } from 'pinia';
import {
  COLOR_KEY,
  deprecatedTypes,
  DEPRECATED_IO_LIQUIDS_KEY,
  DEPRECATED_IO_PRESSURE_KEY,
  DEPRECATED_PUMP_KEY,
  DEPRECATED_SCALE_KEY,
  HEIGHT_KEY,
  IO_ENABLED_KEY,
  PUMP_KEY,
  WIDTH_KEY,
} from '../const';
import api from './api';

interface BuilderStoreState {
  blueprints: BuilderBlueprint[];
  focusWarningEnabled: boolean;
  lastLayoutId: string | null;
  layouts: BuilderLayout[];
}

export const useBuilderStore = defineStore('builderStore', {
  state: (): BuilderStoreState => ({
    blueprints: [],
    focusWarningEnabled: true,
    lastLayoutId: null,
    layouts: [],
  }),
  getters: {
    layoutIds: (state): string[] => state.layouts.map((v) => v.id),
    blueprintTypes: (state): string[] => state.blueprints.map((v) => v.type),
  },
  actions: {
    layoutById(id: Maybe<string>): BuilderLayout | null {
      return findById(this.layouts, id);
    },

    blueprintByType(type: string): BuilderBlueprint | null {
      return this.blueprints.find((v) => v.type === type) ?? null;
    },

    componentByType(type: string): string {
      const blueprint = this.blueprintByType(type);
      if (!blueprint) {
        return 'UnknownPartComponent';
      }
      return blueprint.component ?? `${blueprint.type}PartComponent`;
    },

    async createLayout(layout: BuilderLayout): Promise<void> {
      await api.create(layout); // triggers callback
    },

    async saveLayout(layout: BuilderLayout): Promise<void> {
      await api.persist(layout); // triggers callback
    },

    async removeLayout(layout: BuilderLayout): Promise<void> {
      if (this.lastLayoutId === layout.id) {
        this.lastLayoutId = null;
      }
      await api.remove(layout); // triggers callback
    },

    async start(): Promise<void> {
      this.layouts = await api.fetch();

      // check if any layouts must be upgraded
      for (const layout of [...this.layouts]) {
        let dirty = false;
        for (const part of layout.parts) {
          // Replace deprecated types
          if (part.type in deprecatedTypes) {
            dirty = true;
            part.type = deprecatedTypes[part.type];
          }

          // Part size was moved to top-level variables
          if (!part.width || !part.height) {
            dirty = true;
            const defaultSize = this.blueprintByType(part.type)
              ?.defaultSize ?? { width: 1, height: 1 };

            const settingsWidth = part.settings[WIDTH_KEY];
            const settingsHeight = part.settings[HEIGHT_KEY];
            const scale = part.settings[DEPRECATED_SCALE_KEY];

            if (settingsWidth || settingsHeight) {
              part.width = settingsWidth || defaultSize.width;
              part.height = settingsHeight || defaultSize.height;
            } else if (scale) {
              part.width = defaultSize.width * scale;
              part.height = defaultSize.height * scale;
            } else {
              part.width = defaultSize.width;
              part.height = defaultSize.height;
            }

            part.settings[WIDTH_KEY] = undefined;
            part.settings[HEIGHT_KEY] = undefined;
            part.settings[DEPRECATED_SCALE_KEY] = undefined;
          }

          // Metrics configuration may have been independently upgraded
          if (part.metrics !== undefined) {
            const upgraded = upgradeMetricsConfig(part.metrics);
            if (upgraded) {
              dirty = true;
              part.metrics = upgraded;
            }
          }

          if (part.type === 'SystemIO' || part.type === 'ShiftedSystemIO') {
            // Migrate from settings.liquids to settings.color
            // This removes an unnecessary array, and standardizes all color settings
            const liquid = part.settings[DEPRECATED_IO_LIQUIDS_KEY]?.[0];
            if (liquid !== undefined) {
              dirty = true;
              const color = part.settings[COLOR_KEY];
              part.settings[COLOR_KEY] = color ?? liquid;
              part.settings[DEPRECATED_IO_LIQUIDS_KEY] = undefined;
            }

            // IO pressure was split in "enabled" and "pressure when enabled"
            // This provides a toggle between off and custom pressure values
            const pressure = part.settings[DEPRECATED_IO_PRESSURE_KEY];
            if (pressure !== undefined) {
              dirty = true;
              const enabled = part.settings[IO_ENABLED_KEY];
              part.settings[IO_ENABLED_KEY] = Boolean(enabled ?? pressure);
              part.settings[DEPRECATED_IO_PRESSURE_KEY] = undefined;
            }
          }

          // Pumps were standardized to use either PWM or Digital Actuator blocks
          if (part.type === 'Pump') {
            const addr = part.settings[DEPRECATED_PUMP_KEY];
            if (addr !== undefined) {
              dirty = true;
              part.settings[PUMP_KEY] = addr;
              part.settings[DEPRECATED_PUMP_KEY] = undefined;
            }
          }

          if (dirty) {
            // Immediately set upgraded layout, to prevent rendering with invalid data
            concatById(this.layouts, layout);
            this.saveLayout(layout);
          }
        }
      }

      api.subscribe(
        (layout: BuilderLayout) => {
          this.layouts = concatById(this.layouts, layout);
        },
        (id: string) => {
          this.layouts = filterById(this.layouts, { id });
        },
      );
    },
  },
});
