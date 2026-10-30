import type { KeyboardEvent } from "react";

export function trapDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
    'button, a[href], input, select, textarea, [tabindex]'
  )).filter(element => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0);
  if (!controls.length) { event.preventDefault(); return; }
  const first = controls[0], last = controls[controls.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !event.currentTarget.contains(active))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (active === last || !event.currentTarget.contains(active))) {
    event.preventDefault(); first.focus();
  }
}