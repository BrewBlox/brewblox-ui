<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class ActuatorAnalogMockForm extends BlockForm {
  defaultData() {
    return {
      setting: 0,
      minSetting: 0,
      maxSetting: 100,
      value: 0,
      minValue: 0,
      maxValue: 100,
    };
  }

  presets() {
    return [];
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>Supported setting min</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="block.data.minSetting"
              :change="callAndSaveBlock(v => block.data.minSetting = v)"
              type="number"
              label="supported setting min"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <div class="column">
              <span>Setting</span>
              <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
            </div>
          </q-item-section>
          <q-item-section>
            <InputPopupEdit
              v-if="!isDriven"
              :field="block.data.setting"
              :change="callAndSaveBlock(v => block.data.setting = v)"
              type="number"
              label="target"
            />
            <big v-else>{{ block.data.setting | unit }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Supported setting max</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="block.data.maxSetting"
              :change="callAndSaveBlock(v => block.data.maxSetting = v)"
              type="number"
              label="supported setting max"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Value min (clipping)</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="block.data.minValue"
              :change="callAndSaveBlock(v => block.data.minValue = v)"
              type="number"
              label="value min"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Value</q-item-section>
          <q-item-section>
            <big>{{ block.data.value | round }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Value max (clipping)</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="block.data.minValue"
              :change="callAndSaveBlock(v => block.data.minValue = v)"
              type="number"
              label="value min"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-less-than-or-equal" label="Constraints">
        <q-item dark>
          <q-item-section>
            <AnalogConstraints
              :service-id="block.serviceId"
              :field="block.data.constrainedBy"
              :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
