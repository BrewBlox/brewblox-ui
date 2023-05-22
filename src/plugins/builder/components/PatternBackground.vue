<template>
  <svg>
    <pattern
      id="diagonalHatch"
      width="10"
      height="10"
      patternTransform="rotate(45 0 0)"
      patternUnits="userSpaceOnUse"
    >
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="10"
        style="stroke: grey; stroke-width: 1"
      />
    </pattern>
    <rect
      v-bind="$attrs"
      fill="url(#diagonalHatch)"
    />
  </svg>
</template>
