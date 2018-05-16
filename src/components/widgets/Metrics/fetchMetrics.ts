function toMicroSeconds(nanoseconds: number): number {
  return Math.floor(nanoseconds / 1000000);
}

export function getMetric(
  serviceId: string,
  field: string,
  options: any = {},
): Promise<PlotlyData> {
  const payload = {
    measurement: serviceId,
    keys: [field],
    ...options,
  };

  return window.fetch('http://192.168.0.5/history/query/values', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  })
    .then(response => response.json())
    .then(response => ({
      type: 'scatter',
      x: response.values.map(([time]: number[]) => toMicroSeconds(time)),
      y: response.values.map(([time, value]: number[]) => value),
    }));
}
