import { calculateNormalizedFlows } from './calculateFlows';

const ctx: Worker = self as any;

ctx.onmessage = (evt: MessageEvent) => {
  const parts = calculateNormalizedFlows(evt.data);
  ctx.postMessage(parts);
};
