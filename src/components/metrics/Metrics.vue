<template>
  <Plotly
    :data="plotlyData.data"
    :layout="plotlyData.layout"
    :config="config"
    fit
  />
</template>

<script lang="ts" src="./Metrics.ts"></script>

<style>
.js-plotly-plot .plotly .modebar {
  background: transparent;
}

.js-plotly-plot .plotly .modebar-btn path {
  fill: rgba(255, 255, 255, 0.6);
}

.js-plotly-plot .plotly .modebar-btn.active path,
.js-plotly-plot .plotly .modebar-btn:hover path {
  fill: rgba(255, 255, 255, 1);
}
</style>
