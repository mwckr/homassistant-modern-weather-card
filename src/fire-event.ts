// minimal typed fireEvent so custom-card-helpers stays a type-only
// dependency and its runtime (incl. stale @formatjs code) is not bundled
export const fireEvent = <T>(node: HTMLElement, type: string, detail?: T): void => {
  node.dispatchEvent(
    new CustomEvent(type, { bubbles: true, composed: true, detail }),
  );
};
