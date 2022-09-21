import { ContextKey, InvalidateKey } from '@/symbols';
import { nanoid } from 'nanoid';
import { QDialog, QDialogOptions } from 'quasar';
import {
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  provide,
  reactive,
  Ref,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';

export interface UseDialogProps {
  title: {
    type: PropType<string>;
    default: string;
  };
  message: {
    type: PropType<string>;
    default: string;
  };
  html: {
    type: PropType<boolean>;
    default: false;
  };
}

export type UseDialogEmits = ['ok', 'hide'];

export interface UseDialogComponent {
  dialogRef: Ref<QDialog | null>;
  onDialogHide: () => void;
  onDialogOK: (payload?: any) => void;
  onDialogCancel: () => void;
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
  emits: ['ok', 'hide'],
  setup(): UseDialogComponent {
    const instance = getCurrentInstance()!;

    const hashId = `.${nanoid(6)}.`;
    const dialogRef = ref<QDialog | null>(null);
    const cancelWatcher = ref<() => void>(() => {});

    function show(): void {
      dialogRef.value?.show();
    }

    function hide(): void {
      dialogRef.value?.hide();
    }

    function onDialogHide(): void {
      instance.emit('hide');
    }

    function onDialogCancel(): void {
      hide();
    }

    function onDialogOK(payload: unknown): void {
      instance.emit('ok', payload);
      hide();
    }

    // Will be overridden if this dialog is showing a widget
    // Used for all other menus and edit dialogs
    provide(
      ContextKey,
      reactive({
        container: 'Dialog',
        size: 'Fixed',
        mode: 'Basic',
      }),
    );

    // Lets all nested elements declare that the dialog should be closed immediately
    provide(InvalidateKey, hide);

    // expose public methods required by Dialog plugin
    Object.assign(instance.proxy, { show, hide });

    // We want the dialog to be part of the navigation stack.
    // This lets mobile users close dialogs by using the back button.
    // This requires two actions:
    // - Push a new page with a unique ID in hash when dialog opens.
    // - Close dialog if the ID disappears from hash (because eg. back button was pressed).
    function setupRouteHash(): void {
      const router = useRouter();
      router
        .push({ hash: (router.currentRoute.value.hash || '#') + hashId })
        .then(() => nextTick())
        .then(() => {
          cancelWatcher.value = watch(
            () => router.currentRoute.value,
            (newRoute) => {
              if (!newRoute.hash.includes(hashId)) {
                cancelWatcher.value();
                hide();
              }
            },
          );
        })
        .catch(() => {});
    }

    // Dialogs can be closed manually, or by using the back button.
    // If closed manually, we need to clean up the current route.
    // Dialogs are not guaranteed to be closed in a LIFO order.
    function teardownRouteHash(): void {
      const router = useRouter();
      const hash = router.currentRoute.value.hash;

      if (hash.endsWith(hashId)) {
        // Dialog was last to be opened - we can go back to undo the stack push.
        cancelWatcher.value();
        router.back();
      } else if (hash.includes(hashId)) {
        // Dialog was not last to be opened.
        // We want to clear the dialog ID,
        // but can't remove a page from the middle of the navigation stack.
        // This means we'll have a bit of junk left on the stack after last dialog is closed.
        // It's not optimal, but usually won't be noticed by users.
        //
        // Ideally, we'd want to remove duplicate pages from the navigation stack.
        // For security/privacy reasons we can't inspect the stack
        // before calling `router.back()`.
        cancelWatcher.value();
        router.replace({ hash: hash.replaceAll(hashId, '') });
      }
    }

    onMounted(() => setupRouteHash());
    onBeforeUnmount(() => teardownRouteHash());

    return {
      dialogRef,
      onDialogHide,
      onDialogCancel,
      onDialogOK,
      dialogProps: {
        noRouteDismiss: true,
        noBackdropDismiss: true,
      },
    };
  },
};
