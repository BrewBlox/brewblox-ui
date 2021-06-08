import { mqttTopicExp } from '@/utils/formatting';


describe('MQTT helpers', () => {
  it('mqttTopicExp()', () => {
    let exp = mqttTopicExp('base/test');
    expect(exp.test('base/test')).toBe(true);
    expect(exp.test('base/test/other')).toBe(false);

    exp = mqttTopicExp('base/test/+');
    expect(exp.test('base/test')).toBe(false);
    expect(exp.test('base/test/other')).toBe(true);
    expect(exp.test('base/test/something/else')).toBe(false);

    exp = mqttTopicExp('base/test/#');
    expect(exp.test('base/test')).toBe(true);
    expect(exp.test('base/test/other')).toBe(true);
    expect(exp.test('base/test/something/else')).toBe(true);

    exp = mqttTopicExp('base/test/#/end');
    expect(exp.test('base/test')).toBe(false);
    expect(exp.test('base/test/other')).toBe(false);
    expect(exp.test('base/test/something/else/end')).toBe(true);
    expect(exp.test('base/test/end')).toBe(true);

    exp = mqttTopicExp('base/+/middle/+/end');
    expect(exp.test('base/dash-dash/middle/second/end')).toBe(true);
  });
});
