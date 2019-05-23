import Vue from 'vue';
import Component from 'vue-class-component';
import serviceStore from '@/store/services';
import { Service } from '@/store/services';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class WatcherBase extends Vue {
  protected get service(): Service {
    return serviceStore.serviceById(this.$props.serviceId);
  }
}
