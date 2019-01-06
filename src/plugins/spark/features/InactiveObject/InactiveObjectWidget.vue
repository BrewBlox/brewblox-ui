<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';

@Component
export default class InactiveObjectWidget extends BlockWidget {
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <InactiveObjectForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
        :change-id="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert type="info">This block is not in any active profile</q-alert>
    <q-card-main class="column col">
      <q-field class="col" label="Profiles">
        <ProfilesPopupEdit
          :field="block.profiles"
          :service-id="serviceId"
          :change="callAndSaveBlock(v => block.profiles = v)"
        />
      </q-field>
    </q-card-main>
  </q-card>
</template>

