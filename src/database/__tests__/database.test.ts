import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { database } from '@/database';
import { http } from '@/utils/http';
import { notify } from '@/utils/notify';

describe('datastore errors', () => {
  const error = new AxiosError('Network Error');

  beforeEach(() => {
    vi.spyOn(notify, 'error').mockImplementation(() => {});
    vi.spyOn(http, 'post').mockRejectedValue(error);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const shown = (): unknown[] =>
    vi.mocked(notify.error).mock.calls.map(([, opts]) => opts?.shown);

  it('shows a failed write: its change is lost', async () => {
    const obj = { id: 'w', namespace: 'ns' };
    await expect(database.persist('ns', obj)).rejects.toBe(error);
    await expect(database.persistMult('ns', [obj])).rejects.toBe(error);
    await expect(database.remove('ns', obj)).rejects.toBe(error);
    expect(shown()).toEqual([true, true, true]);
  });

  it('only logs a failed read', async () => {
    await expect(database.fetchAll('ns')).rejects.toBe(error);
    await expect(database.fetchById('ns', 'w')).rejects.toBe(error);
    expect(shown()).toEqual([false, false]);
  });
});
