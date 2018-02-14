<template>
  <q-field>
    <q-field class = 'title'>name</q-field>
    <q-field class = 'blok-top'>   &nbsp </q-field>
    <q-field class = 'blok-mid'>14444444</q-field>
    <q-field class = 'blok-bot'>  &nbsp  </q-field>
  </q-field>
</template>

<script>
import {
  QField,
} from 'quasar';

export default {
  name: 'SField',
  components: {
    QField,
  },
};
</script>

<style lang="stylus">
.title{
  width : 75%
  margin-bottom : 0px
  align-items: center;
}
.blok-top{
  border-top: 2px solid blue;
  border-right: 2px solid blue;
  border-left: 2px solid blue;
  width : 75%
  margin-top: 0px;
  margin-bottom: 0px;
  align-items: center;
}
.blok-mid{
  border-right: 2px solid blue;
  border-left: 2px solid blue;
  width : 75%
  margin-top: 0px;
  margin-bottom: 0px;
  align-items: center;
}
.blok-bot{
  border-bottom: 2px solid blue;
  border-right: 2px solid blue;
  border-left: 2px solid blue;
  width : 75%
  margin-top: 0px;
  margin-bottom: 0px;
  align-content: center;
}
</style>
