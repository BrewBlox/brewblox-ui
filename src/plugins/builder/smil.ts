import type { Directive } from 'vue';

const pending = new Set<SVGSVGElement>();

function seekToOwnTime(): void {
  const svgs = [...pending];
  pending.clear();
  svgs.forEach((svg) => {
    try {
      svg.setCurrentTime(svg.getCurrentTime());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to seek a builder part to its own SMIL time', e);
    }
  });
}

// An animation inserted into an <svg> that held none replays every repeat
// since the <svg> last held one, before Chrome 159 (crbug.com/580778538):
// work and memory that grow with the time it held none.
// A seek to the current time skips repeats. It must run in the task that inserted
// the animation, before the timer in which Chrome would replay.
export const vSkipSmilReplay: Directive<SVGElement> = {
  mounted(el) {
    const svg = el.ownerSVGElement;
    if (typeof svg?.setCurrentTime !== 'function') {
      return;
    }
    if (pending.size === 0) {
      queueMicrotask(seekToOwnTime);
    }
    pending.add(svg);
  },
};
