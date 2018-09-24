import { rotatedFlows } from './calculateFlows';

describe('rotatedFlows', () => {
  it('Should return a rotated version of the flow possibilities', () => {
    const input = {
      0: [{ out: 90 }],
      90: [{ out: 0 }],
    };

    const output = {
      90: [{ out: 180 }],
      180: [{ out: 90 }],
    };

    expect(rotatedFlows(input, 90)).toEqual(output);
  });

  it('Should rotate multiple outputs', () => {
    const input = {
      0: [{ out: 90 }, { out: 180 }],
      90: [{ out: 0 }, { out: 180 }],
      180: [{ out: 0 }, { out: 90 }],
    };

    const output = {
      90: [{ out: 180 }, { out: 270 }],
      180: [{ out: 90 }, { out: 270 }],
      270: [{ out: 90 }, { out: 180 }],
    };

    expect(rotatedFlows(input, 90)).toEqual(output);
  });

  it('Should rotate in degrees of max 360', () => {
    const input = {
      0: [{ out: 90 }],
      90: [{ out: 0 }],
    };

    const output = {
      90: [{ out: 180 }],
      180: [{ out: 90 }],
    };

    expect(rotatedFlows(input, 450)).toEqual(output);
  });

  it('Should rotate backwards too', () => {
    const input = {
      90: [{ out: 180 }],
      180: [{ out: 90 }],
    };

    const output = {
      0: [{ out: 90 }],
      90: [{ out: 0 }],
    };

    expect(rotatedFlows(input, -90)).toEqual(output);
  });
});
