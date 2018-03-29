<template>
  <q-page padding>
    <q-inner-loading :visible="isFetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!isFetching">
      <h2>{{ dashboard.title }}</h2>

      <grid-container>
        <div
          class="dashboard-item"
          v-for="item in items"
          :key="item.id"
          :id="item.id"
          :cols="item.cols"
          :rows="item.rows"
        >
          {{ item.id }}
        </div>
      </grid-container>
    </template>
  </q-page>
</template>

<script lang="ts" src="./dashboard.ts" />

<style lang="stylus">
@import '../../css/app.styl';

.dashboard-item {
  background: $block-background;
  display: flex;
  align-items center;
  justify-content center;
  height: 100%;
  width: 100%;
  font-size: 30pt;
}
</style>
