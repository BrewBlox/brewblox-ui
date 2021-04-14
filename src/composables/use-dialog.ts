import { nanoid } from 'nanoid';
import { QDialog, QDialogOptions } from 'quasar';
import {
  getCurrentInstance,
  nextTick,
  onBeforeMount,
  onUnmounted,
  PropType,
  reactive,
  Ref,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';

import { WidgetContext } from '@/store/features';

export interface UseDialogProps {
  title: {
    type: PropType<string>,
    default: string,
  },
  message: {
    type: PropType<string>,
    default: string,
  },
  html: {
    type: PropType<boolean>,
    default: false,
  }
}

export type UseDialogEmits = [
  'ok',
  'hide'
];

export interface UseDialogComponent {
  dialogRef: Ref<QDialog | null>;
  onDialogHide: () => void;
  onDialogOK: (payload?: any) => void;
  onDialogCancel: () => void;
  context: WidgetContext;
  dialogProps: Partial<QDialogOptions>;
}

export interface UseDialogComposable {
  props: UseDialogProps;
  emits: UseDialogEmits;
  setup(): UseDialogComponent;
}

export const useDialog: UseDialogComposable = {
  props: {
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    html: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'ok',
    'hide',
  ],
  setup(): UseDialogComponent {
    const hashId = `.${nanoid(6)}.`;
    const { emit, proxy } = getCurrentInstance()!;
    const dialogRef = ref<QDialog | null>(null);
    const router = useRouter();

    function show(): void {
      dialogRef.value?.show();
    }

    function hide(): void {
      dialogRef.value?.hide();
    }

    function onDialogHide(): void {
      emit('hide');
    }

    function onDialogCancel(): void {
      hide();
    }

    function onDialogOK(payload: unknown): void {
      emit('ok', payload);
      hide();
    }

    // expose public methods required by Dialog plugin
    Object.assign(proxy, { show, hide });

    // We want the dialog to be part of the navigation stack.
    // This lets mobile users close dialogs by using the back button.
    // This requires two actions on startup:
    // - Push a new page with unique ID in hash when dialog opens.
    // - If back button is pressed, the ID disappears from hash -> close dialog.
    function setupRouteHash(): void {
      router
        .push({ hash: (router.currentRoute.value.hash || '#') + hashId })
        .then(() => nextTick())
        .then(() => watch(
          () => router.currentRoute,
          (newRoute) => {
            if (!newRoute.value.hash.includes(hashId)) {
              hide();
            }
          },
        ))
        .catch(() => { });
    }

    // Dialogs can be closed manually, or by using the back button.
    // If closed manually, we need to clean up the current route.
    // Dialogs are not guaranteed to be closed in a LIFO order.
    function teardownRouteHash(): void {
      const hash = router.currentRoute.value.hash;

      if (hash.endsWith(hashId)) {
        // Dialog was last to be opened - we can go back to undo the stack push.
        router.back();
      }
      else if (hash.includes(hashId)) {
        // Dialog was not last to be opened.
        // We want to clear the dialog ID,
        // but can't remove a page from the middle of the navigation stack.
        // This means we'll have a bit of junk left on the stack after last dialog is closed.
        // It's not optimal, but usually won't be noticed by users.
        //
        // Ideally, we'd want to remove duplicate pages from the navigation stack,
        // but for security/privacy reasons we can't inspect the stack before calling `router.back()`.
        router.replace({ hash: hash.replaceAll(hashId, '') });
      }
    }

    onBeforeMount(() => setupRouteHash());
    onUnmounted(() => teardownRouteHash());

    return {
      dialogRef,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
      dialogProps: {
        noRouteDismiss: true,
        noBackdropDismiss: true,
      },
      context: reactive({
        container: 'Dialog',
        size: 'Fixed',
        mode: 'Basic',
      }),
    };
  },
};
