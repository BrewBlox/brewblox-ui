<script setup lang="ts">
import { useWidget } from '@/composables';

const replacements = {
  StepView: 'QuickActions',
};

const { widget, patchWidget } = useWidget.setup();

patchWidget({
  feature: replacements[widget.value.feature] ?? 'Unknown',
});
</script>
