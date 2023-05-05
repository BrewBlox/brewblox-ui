<script setup lang="ts">
import { useDialog, useGlobals, useRouteId } from '@/composables';

const props = defineProps({
  ...useDialog.props,
});

defineEmits({ ...useDialog.emitsObject });

const { dialogRef, dialogProps, onDialogHide, onDialogOK } = useDialog.setup();
const { dense } = useGlobals.setup();
const { activeDashboardId } = useRouteId.setup();
</script>
