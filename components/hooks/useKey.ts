"use client";
import { useEffect } from "react";

class KeyPressHandlerClass {
  private readonly shortcuts: (InternalShortCut & { id: string })[] = [];
  private listenerMounted = false;

  private createID() {
    let id = Math.random().toString(36).substring(7);
    while (this.shortcuts.find((s) => s.id === id)) {
      id = Math.random().toString(36).substring(7);
    }
    return id;
  }

  addShortCut = (shortcut: ShortCut): string => {
    if (!this.listenerMounted) {
      document.addEventListener("keydown", this.handleKeyPress);
      this.listenerMounted = true;
    }
    const id = this.createID();
    const shortcutKeys = Array.isArray(shortcut.shortcut)
      ? shortcut.shortcut
      : [shortcut.shortcut];
    for (const shortcutKey of shortcutKeys) {
      this.shortcuts.push({
        action: shortcut.action,
        shortcut:
          typeof shortcutKey === "string" ? { key: shortcutKey } : shortcutKey,
        name: shortcut.name,
        id,
      });
    }
    return id;
  };

  removeListener = (id: string) => {
    const index = this.shortcuts.findIndex((s) => s.id === id);
    if (index !== -1) {
      this.shortcuts.splice(index, 1);
    }
    if (this.shortcuts.length === 0) {
      document.removeEventListener("keydown", this.handleKeyPress);
      this.listenerMounted = false;
    }
  };

  private readonly handleKeyPress = (event: KeyboardEvent) => {
    const fittingShortcuts = this.shortcuts.filter((shortcut) => {
      if (shortcut.shortcut.key !== event.key) return false;
      if ((shortcut.shortcut.ctrlKey ?? false) !== event.ctrlKey) return false;
      if ((shortcut.shortcut.shiftKey ?? false) !== event.shiftKey)
        return false;
      if ((shortcut.shortcut.altKey ?? false) !== event.altKey) return false;
      return true;
    });
    for (const shortcut of fittingShortcuts) {
      try {
        shortcut.action(event);
      } catch (e) {
        console.error(
          `Error while executing shortcut ${KeyPressHandlerClass.stringifyShortcut(
            shortcut.shortcut
          )} ${shortcut.name ?? "[UNNAMED]"}`
        );
      }
    }
  };

  static readonly stringifyShortcut = (
    shortcut: ShortCut["shortcut"]
  ): string => {
    if (typeof shortcut === "string") return shortcut;
    if (Array.isArray(shortcut))
      return shortcut.map(KeyPressHandlerClass.stringifyShortcut).join(", ");
    return `${shortcut.ctrlKey ? "Ctrl+" : ""}${
      shortcut.shiftKey ? "Shift+" : ""
    }${shortcut.altKey ? "Alt+" : ""}${shortcut.key}`;
  };
}

type ShortcutKey = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
};

export interface ShortCut {
  shortcut: ShortcutKey | string | ShortcutKey[] | string[];
  action: (e: KeyboardEvent) => void;
  /**
   * currently only used for debugging
   */
  name?: string;
}
interface InternalShortCut {
  shortcut: {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
  };
  action: (e: KeyboardEvent) => void;
  /**
   * currently only used for debugging
   */
  name?: string;
}

const KeyPressHandler = new KeyPressHandlerClass();

const useKey = (
  shortcut: ShortCut["shortcut"],
  action?: ShortCut["action"],
  options?: {
    active?: boolean;
    name?: string;
  }
) => {
  useEffect(() => {
    if (!action || options?.active === false) return;
    const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
    const ids = shortcuts.map((s) =>
      KeyPressHandler.addShortCut({
        shortcut: s,
        action,
        name: options?.name,
      })
    );
    return () => {
      for (const id of ids) {
        KeyPressHandler.removeListener(id);
      }
    };
  }, [shortcut, action, options?.active, options?.name]);
};

export const useKeys = (shortcuts: (ShortCut & { active?: boolean })[]) => {
  useEffect(() => {
    const unmounters = shortcuts.map((shortcut) => {
      if (shortcut.active !== false) {
        const id = KeyPressHandler.addShortCut(shortcut);
        return () => {
          KeyPressHandler.removeListener(id);
        };
      }
    });
    return () => {
      unmounters.forEach((unmount) => {
        unmount?.();
      });
    };
  }, [shortcuts]);
};

export default useKey;
