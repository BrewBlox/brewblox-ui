<template>
  <div class="fit column">
    <div class="col-auto">
      <slot name="warnings" />
    </div>
    <div class="col full-width">
      <slot name="graph" />
    </div>
  </div>
</template>
