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
        :changeId="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        class="ellipsis"
        :field="widgetId"
        label="Widget ID"
        display="span"
        :change="v => widgetId = v"
      />
      <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
      <q-btn flat round dense slot="right" @click="openModal" icon="settings"/>
      <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert type="info">This block is not in any active profile</q-alert>
    <q-card-main class="column col">
      <q-field class="col" label="Profiles">
        <ProfilesPopupEdit
          :field="block.profiles"
          :serviceId="serviceId"
          :change="callAndSaveBlock(v => block.profiles = v)"
        />
      </q-field>
    </q-card-main>
  </q-card>
</template>

<style scoped>
</style>
