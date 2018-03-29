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
    </template>
  </q-page>
</template>

<script lang="ts" src="./dashboard.ts" />
