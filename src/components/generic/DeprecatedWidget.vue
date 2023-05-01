<script lang="ts">
import { useWidget } from '@/composables';
import { defineComponent } from 'vue';

const replacements = {
  StepView: 'QuickActions',
};

export default defineComponent({
  name: 'DeprecatedWidget',
  setup() {
    const { widget, patchWidget } = useWidget.setup();

    patchWidget({
      feature: replacements[widget.value.feature] ?? 'Unknown',
    });

    return {};
  },
  render() {
    return null;
  },
});
</script>
