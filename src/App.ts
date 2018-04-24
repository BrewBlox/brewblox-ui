import Vue from 'vue';
import Component from 'vue-class-component';

import { fetchBlocks } from '@/store/blocks/actions';
import { fetchDashboards } from '@/store/dashboards/actions';
import { fetchSettings } from '@/store/settings/actions';

@Component
class App extends Vue {
  created() {
    // fetch all block and dashboard on init
    Promise.all([
      fetchBlocks(this.$store),
      fetchDashboards(this.$store),
      fetchSettings(this.$store),
    ]).catch((e) => { throw new Error(e); });
  }
}

export default App;
