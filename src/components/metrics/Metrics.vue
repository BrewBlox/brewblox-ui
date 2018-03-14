<template>
  <div style="width: 600px; height: 400px">
    <q-inner-loading :visible="loading">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>


    <template v-if="!loading">
      <Plotly
        :data="plotly.data"
        :layout="plotly.layout"
        fit
      />
    </template>
  </div>
</template>

<script lang="ts" src="./Metrics.ts"></script>
