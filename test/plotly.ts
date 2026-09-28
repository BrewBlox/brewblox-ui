// Helpers to drive a real Plotly graph under jsdom as a user would.
//
// Plotly keeps user edits across `Plotly.react` only when they come in
// through its GUI entry points (`_guiRelayout`, `_guiRestyle`).
// Those are registered in the Plotly registry, but not exported.

// @ts-expect-error: the Plotly sources have no type declarations
import Registry from 'plotly-dist/src/registry';
import { PlotlyHTMLElement } from 'plotly.js';

export function plotDiv(): PlotlyHTMLElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el as unknown as PlotlyHTMLElement;
}

/** A zoom, pan or axis edit made with the mouse or the modebar */
export async function guiRelayout(
  gd: HTMLElement,
  update: Record<string, unknown>,
): Promise<void> {
  await Registry.call('_guiRelayout', gd, update);
}

/** A click on a legend entry */
export async function guiRestyle(
  gd: HTMLElement,
  update: Record<string, unknown>,
  traces: number[],
): Promise<void> {
  await Registry.call('_guiRestyle', gd, update, traces);
}

/** A double click on the plot area */
export async function doubleClick(gd: HTMLElement): Promise<void> {
  const drag = gd.querySelector('.nsewdrag')!;
  const fire = (type: string): void => {
    drag.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        clientX: 50,
        clientY: 50,
        buttons: 1,
      }),
    );
  };
  fire('mousedown');
  fire('mouseup');
  fire('mousedown');
  fire('mouseup');
  await new Promise((resolve) => setTimeout(resolve, 50));
}

/** The x range Plotly shows, as it stores it */
export function shownXRange(gd: HTMLElement): unknown[] {
  return (gd as any)._fullLayout.xaxis.range;
}

/** Whether Plotly autoranges the x axis */
export function xAutorange(gd: HTMLElement): boolean {
  return (gd as any)._fullLayout.xaxis.autorange;
}

/** Legend visibility of each trace, in trace order */
export function traceVisibility(gd: HTMLElement): unknown[] {
  return (gd as any)._fullData.map((t: any) => t.visible);
}
