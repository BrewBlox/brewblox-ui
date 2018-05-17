<template>
  <Plotly
    :data="plotlyData.data"
    :layout="plotlyData.layout"
    fit
  />
</template>

<script lang="ts" src="./Metrics.ts"></script>
