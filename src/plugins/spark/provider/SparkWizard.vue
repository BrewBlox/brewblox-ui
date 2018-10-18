<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { typeName } from '@/plugins/spark/store/getters';
import { validateService } from '@/plugins/spark/store/actions';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    onCreate: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
})
export default class SparkWizard extends Vue {
  async mounted() {
    const ok = await validateService(this.$props.serviceId);
    if (ok) {
      this.$props.onCreate({ type: typeName });
    } else {
      this.$props.onCancel(`Service "${this.$props.serviceId}" invalid or not found`);
    }
  }
}
</script>

<template>
  <div class="flex flex-center">
    <q-spinner :size="30"/>
  </div>
</template>

<style scoped>
</style>
