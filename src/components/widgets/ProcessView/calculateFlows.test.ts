import { rotatedFlows } from './calculateFlows';

describe('rotatedFlows', () => {
  it('Should return a rotated version of the flow possibilities', () => {
    const input = {
      0: [90],
      90: [0],
    };

    const output = {
      90: [180],
      180: [90],
    };

    expect(rotatedFlows(input, 90)).toEqual(output);
  });

  it('Should rotate multiple outputs', () => {
    const input = {
      0: [90, 180],
      90: [0, 180],
      180: [0, 90],
    };

    const output = {
      90: [180, 270],
      180: [90, 270],
      270: [90, 180],
    };

    expect(rotatedFlows(input, 90)).toEqual(output);
  });

  it('Should rotate in degrees of max 360', () => {
    const input = {
      0: [90],
      90: [0],
    };

    const output = {
      90: [180],
      180: [90],
    };

    expect(rotatedFlows(input, 450)).toEqual(output);
  });

  it('Should rotate backwards too', () => {
    const input = {
      90: [180],
      180: [90],
    };

    const output = {
      0: [90],
      90: [0],
    };

    expect(rotatedFlows(input, -90)).toEqual(output);
  });
});
