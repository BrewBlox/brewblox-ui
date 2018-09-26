<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

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
export default class HistoryWizard extends Vue {
  mounted() {
    this.$props.onCreate({
      type: 'History',
    });
  }
}
</script>

<template>
  <div />
</template>

<style scoped>
</style>
