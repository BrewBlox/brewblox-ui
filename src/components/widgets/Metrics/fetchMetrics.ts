function toMicroSeconds(nanoseconds: number): number {
  return Math.floor(nanoseconds / 1000000);
}

export function getMetric(
  serviceId: string,
  keys: string[],
  options: any = {},
): Promise<PlotlyData[]> {
  const payload = {
    keys: ['time', ...keys],
    measurement: serviceId,
    ...options,
  };

  return window.fetch('http://192.168.0.106/history/query/values', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  })
    .then(response => response.json())
    .then((response) => {
      if (!response.values) {
        throw new Error('No results found');
      }

      const x = response.values.map(([time]: number[]) => toMicroSeconds(time));

      return keys.map((key, index) => ({
        x,
        type: 'scatter',
        y: response.values.map((item: number[]) => item[index + 1]),
        name: key,
      }));
    });
}
