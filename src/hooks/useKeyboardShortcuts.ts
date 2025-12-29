import { useEffect } from "react";

type EscapeContext = {
  inInput: boolean | any;
  target: HTMLElement | null;
};

type ShortcutMap = {
  Enter?: () => void;
  Escape?: (ctx: EscapeContext) => void;
  ArrowUp?: () => void;
  ArrowDown?: () => void;
};

export function useKeyboardShortcuts(
  shortcuts: ShortcutMap,
  deps: any[] = []
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;

      const inInput =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable;

      /* ========= ENTER → ALWAYS EXECUTE ========= */
      if (e.key === "Enter") {
        if (shortcuts.Enter) {
          e.preventDefault();
          e.stopPropagation();
          shortcuts.Enter();
        }
        return;
      }

      /* ========= ESCAPE → CONTEXT EXIT ========= */
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        // Let PAGE decide what to do
        shortcuts.Escape?.({
          inInput,
          target,
        });

        // Only blur, NEVER clear value here
        if (inInput && target) {
          target.blur();
        }
        return;
      }

      /* ========= ARROW KEYS (IGNORE INPUTS) ========= */
      if (inInput) return;

      if (e.key === "ArrowUp" && shortcuts.ArrowUp) {
        e.preventDefault();
        shortcuts.ArrowUp();
        return;
      }

      if (e.key === "ArrowDown" && shortcuts.ArrowDown) {
        e.preventDefault();
        shortcuts.ArrowDown();
        return;
      }
    };

    // Capture phase → Electron safe
    window.addEventListener("keydown", handler, true);
    return () =>
      window.removeEventListener("keydown", handler, true);
  }, [shortcuts, ...deps]);
}
