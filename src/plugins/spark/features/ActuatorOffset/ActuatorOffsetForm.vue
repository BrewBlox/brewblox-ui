<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class ActuatorOffsetForm extends BlockForm {

}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field
          class="col"
          label="Target"
        >
          <LinkPopupEdit
            label="Target"
            :field="block.data.targetId"
            :serviceId="block.serviceId"
            :change="callAndSaveBlock(v => block.data.targetId = v)"
          />
        </q-field>
        <q-field
          class="col"
          label="Reference"
        >
          <LinkPopupEdit
            label="Reference"
            :field="block.data.referenceId"
            :serviceId="block.serviceId"
            :change="callAndSaveBlock(v => block.data.referenceId = v)"
          />
        </q-field>
        <q-field
          class="col"
          label="Setting"
        >
          <big>{{ block.data.setting | round }}</big>
        </q-field>
        <q-field
          class="col"
          label="Value"
        >
          <big>{{ block.data.value | round }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <ReadonlyConstraints
          :serviceId="block.serviceId"
          :value="block.data.constrainedBy"
        />
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

