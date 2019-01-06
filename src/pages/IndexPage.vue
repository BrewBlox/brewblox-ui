<script lang="ts">
import { primaryDashboard } from '@/store/dashboards/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class IndexPage extends Vue {
  mounted() {
    const dash = primaryDashboard(this.$store);
    if (dash !== null) {
      this.$router.replace(`/dashboard/${dash}`);
    }
  }
}
</script>

<template>
  <q-page class="flex flex-center">Home</q-page>
</template>

