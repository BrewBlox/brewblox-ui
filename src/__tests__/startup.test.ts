import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrewbloxStartup } from '@/startup';
import { startupDone } from '@/user-settings';
import { notify } from '@/utils/notify';

describe('BrewbloxStartup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    startupDone.value = false;
    vi.spyOn(notify, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('tries a failed start again, and starts the others whatever happens', async () => {
    const networkError = new AxiosError('Network Error');
    const flaky = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue(undefined);
    const broken = vi.fn().mockRejectedValue(networkError);
    const fine = vi.fn().mockResolvedValue(undefined);
    const startup = new BrewbloxStartup();
    [flaky, broken, fine].forEach((start) => startup.add({ start }));

    const done = startup.start();
    await vi.runAllTimersAsync();
    await done;

    expect(flaky).toHaveBeenCalledTimes(2);
    expect(broken).toHaveBeenCalledTimes(3);
    expect(fine).toHaveBeenCalledTimes(1);
    expect(startupDone.value).toBe(true);
    expect(notify.error).toHaveBeenCalledTimes(1);
    expect(vi.mocked(notify.error).mock.calls[0][0]).toContain('Network Error');
  });
});
