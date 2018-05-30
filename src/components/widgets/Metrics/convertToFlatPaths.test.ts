import convertToFlatPaths from './convertToFlatPaths';

describe('convertMeasurementTree', () => {
  it('Should convert received measurement data to logic tree structure', () => {
    const input = {
      pressure: [
        'lower_sensor/updated_1s/compensated',
        'lower_sensor/updated_1s/height',
        'lower_sensor/updated_30s/compensated',
        'lower_sensor/updated_30s/height',
        'upper_sensor/updated_1s/compensated',
        'upper_sensor/updated_30s/compensated',
      ],
      test: [
        'something',
      ],
    };

    const output: string[] = [
      'pressure/lower_sensor/updated_1s/compensated',
      'pressure/lower_sensor/updated_1s/height',
      'pressure/lower_sensor/updated_30s/compensated',
      'pressure/lower_sensor/updated_30s/height',
      'pressure/upper_sensor/updated_1s/compensated',
      'pressure/upper_sensor/updated_30s/compensated',
      'test/something',
    ];

    expect(convertToFlatPaths(input)).toEqual(output);
  });
});
