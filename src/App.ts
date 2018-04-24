import Vue from 'vue';
import Component from 'vue-class-component';

import { fetchBlocks } from '@/store/blocks/actions';
import { fetchDashboards } from '@/store/dashboards/actions';

@Component
class App extends Vue {
  async created() {
    // fetch all block and dashboard on init
    await Promise.all([
      fetchBlocks(this.$store),
      fetchDashboards(this.$store),
    ]);
  }
}

export default App;
