import Component from 'vue-class-component';
import Vue from 'vue';
import serviceStore from '@/store/services';
import { Service } from '@/store/services/state';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class WatcherBase extends Vue {
  protected $q: any;

  protected get service(): Service {
    return serviceStore.serviceById(this.$props.serviceId);
  }
}
