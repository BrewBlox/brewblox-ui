<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { typeName } from '@/services/Spark/store/getters';

@Component({
  props: {
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
  mounted() {
    this.$props.onCreate({
      type: typeName,
    });
  }
}
</script>

<template>
  <div />
</template>

<style scoped>
</style>
