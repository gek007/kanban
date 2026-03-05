import { useState } from "react";

/**
 * Keyboard shortcut item for display
 */
interface Shortcut {
  key: string;
  description: string;
  context: string;
}

const shortcuts: Shortcut[] = [
  { key: "Enter", description: "Submit form or save changes", context: "Forms" },
  { key: "Escape", description: "Cancel operation or close dialog", context: "Forms & Dialogs" },
  { key: "Tab", description: "Move focus between elements", context: "Navigation" },
  { key: "Shift + Tab", description: "Move focus backwards", context: "Navigation" },
  { key: "Space", description: "Drag card when focused", context: "Cards" },
  { key: "Arrow Keys", description: "Navigate between cards when dragging", context: "Drag & Drop" },
];

/**
 * KeyboardShortcutsHelp component that displays available keyboard shortcuts.
 * Shows as a button that opens a modal with all shortcuts listed.
 */
export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="keyboard-help-button"
        onClick={() => setIsOpen(true)}
        aria-label="View keyboard shortcuts"
        data-testid="keyboard-shortcuts-button"
      >
        <span aria-hidden="true">⌨️</span>
        <span className="keyboard-help-text">Shortcuts</span>
      </button>

      {isOpen && (
        <div
          className="keyboard-help-overlay"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          role="presentation"
          data-testid="keyboard-shortcuts-overlay"
        >
          <div
            className="keyboard-help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="keyboard-help-content">
              <h2 id="keyboard-help-title" className="keyboard-help-title">
                Keyboard Shortcuts
              </h2>

              <div className="keyboard-help-list">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="keyboard-help-item">
                    <div className="keyboard-shortcut-key">
                      <kbd>{shortcut.key}</kbd>
                    </div>
                    <div className="keyboard-shortcut-info">
                      <div className="keyboard-shortcut-desc">{shortcut.description}</div>
                      <div className="keyboard-shortcut-context">{shortcut.context}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="keyboard-help-actions">
                <button
                  type="button"
                  className="keyboard-help-close"
                  onClick={() => setIsOpen(false)}
                  autoFocus
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
