<template>
  <q-page padding>
    <q-inner-loading :visible="isFetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!isFetching">
      <portal to="toolbar-title">
        {{ dashboard.title }}
      </portal>

      <portal to="toolbar-buttons">
        <q-btn
          v-if="editable"
          color="primary"
          label="Add widget"
          @click="onOpenAddWidget"
        />
        <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'positive' : 'primary'"
          @click="toggleEditable"
          :label="editable ? 'Save changes' : 'Edit layout'"
        />
      </portal>

      <q-modal v-model="modalOpen">
        Placeholder add widget modal
      </q-modal>

      <grid-container
        :editable="editable"
        :on-change-order="onChangeOrder"
        :on-change-size="onChangeSize"
      >
        <component
          class="dashboard-item"
          v-for="item in items"
          :is="item.component"
          :key="item.id"
          :id="item.id"
          :cols="item.cols"
          :rows="item.rows"
        />
      </grid-container>
    </template>
  </q-page>
</template>

<script lang="ts" src="./dashboard.ts" />

<style lang="stylus" scoped>
@import '../../css/app.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
