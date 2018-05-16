<template>
  <Plotly
    :data="$props.data.data"
    :layout="$props.data.layout"
    fit
  />
</template>

<script lang="ts" src="./Metrics.ts"></script>
