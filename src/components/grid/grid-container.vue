<script lang="ts" src="./grid-container.ts" />

<style scoped>
.grid-container {
  background-color: transparent;
  position: relative;
}

.grid-main-container, .grid-container-overlay {
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-auto-rows: 100px;
  justify-content: center;
}

.grid-container-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  grid-template-rows: 1fr;
}

.grid-container-overlay-grid {
  background-size: 120px 120px;
  background-image:
    linear-gradient(#121a1f 20px, transparent 0px),
    linear-gradient(90deg, #121a1f 20px, transparent 0px),
    linear-gradient(#fff, #fff);
  background-position: 0 -20px, -20px, 0 0;
  grid-column-start: 1;
  grid-column-end: -1;
  grid-row-start: 1;
  grid-row-end: -1 span;
  opacity: 0.03;
}
</style>
