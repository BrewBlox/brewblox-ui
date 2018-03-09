<template>
  <div>
    <q-inner-loading :visible="loading">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!loading">
      {{ metrics[0].series[0].columns }}
    </template>
  </div>
</template>

<script lang="ts" src="./Metrics.ts"></script>
