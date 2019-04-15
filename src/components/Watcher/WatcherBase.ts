import Component from 'vue-class-component';
import Vue from 'vue';
import { serviceById } from '@/store/services/getters';
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
    return serviceById(this.$store, this.$props.serviceId);
  }
}
