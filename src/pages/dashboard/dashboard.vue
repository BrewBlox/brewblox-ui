<template>
  <q-page padding>
    <q-inner-loading :visible="isFetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!isFetching">
      <q-toolbar>
        <q-toolbar-title>{{ dashboard.title }}</q-toolbar-title>

        <q-btn
          v-if="editable"
          color="secondary"
          label="Add block"
          @click="onOpenAddBlock"
        />
        <q-btn
          :icon="editable ? 'check' : 'mode edit'"
          :color="editable ? 'primary' : 'tertiary'"
          @click="toggleEditable"
          :label="editable ? 'Save changes' : 'Edit layout'"
        />
      </q-toolbar>

      <q-modal
        v-model="modalOpen"
      >
        <q-btn
          label="1 x 1 Block"
          @click="addBlock(1, 1)"
        />
        <q-btn
          label="2 x 2 Block"
          @click="addBlock(2, 2)"
        />
        <q-btn
          label="3 x 3 Block"
          @click="addBlock(3, 3)"
        />
        <q-btn
          label="4 x 4 Block"
          @click="addBlock(4, 4)"
        />
      </q-modal>

      <grid-container
        :editable="editable"
        :on-change-order="onChangeOrder"
        :on-change-size="onChangeSize"
      >
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

.q-toolbar {
  margin-bottom: 24px;
}

.q-toolbar button {
  margin-left: 12px;
}
</style>
