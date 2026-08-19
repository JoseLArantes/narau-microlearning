import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (!("PointerEvent" in window)) {
  Object.defineProperty(globalThis, "PointerEvent", { value: MouseEvent });
}

if (!("ResizeObserver" in window)) {
  Object.defineProperty(globalThis, "ResizeObserver", {
    value: class ResizeObserver {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  });
}

Object.defineProperties(HTMLElement.prototype, {
  hasPointerCapture: { value: () => false },
  setPointerCapture: { value: () => undefined },
  releasePointerCapture: { value: () => undefined },
  scrollIntoView: { value: () => undefined },
});

afterEach(() => {
  cleanup();
});
