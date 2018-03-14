<template>
  <div style="width: 50%; height: 400px">
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

      <button @click="updateData">Update data</button>
    </template>
  </div>
</template>

<script lang="ts" src="./Metrics.ts"></script>
