<template>
  <div>
    <q-list no-border link inset-delimiter>
      <div v-for="(item, index) in items" :key="index" >
        <q-list-header v-if="item.type === 'header'">{{item.label}}</q-list-header>
        <q-side-link v-else item :to="item.link">
          <q-item-side :icon="item.icon" /> 
          <q-item-main :label="item.label" :sublabel="item.sublabel" />
        </q-side-link>
      </div>
      <div>
        <q-list-header>Admin</q-list-header>
        <q-side-link item to="admin">
          <q-item-side icon="settings" /> 
          <q-item-main label="Settings" />
        </q-side-link>
      </div>
    </q-list>
  </div>
</template>

<script>
import {
  QBtn,
  QIcon,
  QList,
  QListHeader,
  QItemSide,
  QItemMain,
  QSideLink,
} from 'quasar';

import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'MainMenu',
  components: {
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItemSide,
    QItemMain,
    QSideLink,
  },
  props: {},
  data() {
    return {};
  },
  created() {
    this.fetch();
  },
  computed: {
    ...mapGetters('menu', {
      items: 'items',
    }),
  },
  methods: {
    ...mapActions('menu', {
      fetch: 'fetch',
    }),
  },
  mounted() {
  },
  beforeDestroy() {
  },
};

</script>

<style lang="stylus">
</style>
