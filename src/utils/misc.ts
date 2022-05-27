import { colors } from 'quasar';

/**
 * Determines the font color with the most contrast
 * when placed on a background with color `background`.
 *
 * @param background Hex-formatted color code (eg. `#0000FF`)
 * @returns Most appropriate font color
 */
export function contrastColor(background: string): 'black' | 'white' {
  // Algorithm copied from StackOverflow at 2019/06/27
  // https://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
  const rgb = colors.hexToRgb(background);
  const luma = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luma > 0.8 ? 'black' : 'white';
}

/**
 * Generates a regular expression that matches the MQTT topic filter.
 * MQTT wildcards + and # are converted to RegEx syntax.
 *
 * @param topicFilter A MQTT topic path that may include wildcards.
 * @returns A regular expression that will test true for topics matching `topicFilter`.
 */
export function mqttTopicExp(topicFilter: string): RegExp {
  return new RegExp(
    topicFilter
      .split('/')
      .map((s) =>
        s
          .replace('+', '[a-zA-Z0-9 _.-]*')
          .replace('#', '?($|[a-zA-Z0-9 /_.-]*)'),
      )
      .join('\\/') + '$',
  );
}
