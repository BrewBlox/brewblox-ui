import { partSettings } from './calculateFlows';
import { PersistentPart } from './state';

describe('calculate Flows', () => {
  const createInput = (): PersistentPart => ({
    x: 1,
    y: 2,
    rotate: 0,
    type: 'InputTube',
  });

  it('Should return part settings', () => {
    expect(partSettings(createInput()).isSource).toBeTruthy();
  });
});
