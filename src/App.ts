import Vue from 'vue';
import Component from 'vue-class-component';

import { fetchServices } from '@/store/services/actions';
import { fetchBlocks } from '@/store/blocks/actions';
import { fetchDashboards } from '@/store/dashboards/actions';
import { fetchSettings } from '@/store/settings/actions';

@Component
class App extends Vue {
  created() {
    // fetch all block and dashboard on init
    Promise
      .all([
        fetchServices(this.$store),
        fetchDashboards(this.$store),
        fetchSettings(this.$store),
      ])
      .then(() => fetchBlocks(this.$store))
      .catch((e) => { throw new Error(e); });
  }
}

export default App;
