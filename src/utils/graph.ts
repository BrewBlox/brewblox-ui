export type LineTraceType = 'scattergl' | 'scatter';

let webGLAvailable: boolean | undefined;

/**
 * Plotly draws a 'scattergl' trace only with WebGL.
 * Without it, every redraw adds a notice in place of the lines.
 * Chrome is dropping the software WebGL that a --disable-gpu kiosk relies on.
 */
export function lineTraceType(): LineTraceType {
  if (webGLAvailable === undefined) {
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      // As plotly's scattergl asks of regl
      webGLAvailable =
        gl != null &&
        gl.getExtension('ANGLE_instanced_arrays') != null &&
        gl.getExtension('OES_element_index_uint') != null;
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      webGLAvailable = false;
    }
  }
  return webGLAvailable ? 'scattergl' : 'scatter';
}
