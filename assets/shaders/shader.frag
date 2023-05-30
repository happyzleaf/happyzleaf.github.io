#version 300 es

precision highp float;
uniform vec2 u_resolution;
uniform float u_offset_y;
uniform float u_time;
out vec4 color;

vec2 rot(vec2 uv, float r) {
  float sinX = sin(r);
  float cosX = cos(r);
  mat2 rotationMatrix = mat2(cosX, -sinX, sinX, cosX);
  return uv * rotationMatrix;
}

void main() {
  float relX = gl_FragCoord.x / u_resolution.x;
  float relY = gl_FragCoord.y / u_resolution.y;

  // Shadow
  if (relX > 0.95 || relY < 0.05) {
    if (relX > 0.05 && relY < 0.95) {
      color = vec4(0.0, 0.0, 0.0, 0.75);
    }
    return;
  }

  float x = relX;
  vec2 coords = vec2(relX, (gl_FragCoord.y - u_offset_y) / u_resolution.y);

  // Waves
  // ducklett @ Shadertoy (https://www.shadertoy.com/view/WsB3Wc)
  float s = 4.0;  // Number of stripes
  float st = 0.4; // Stripe thickness

  vec2 uv = rot(coords, -0.2 + sin(u_time) * 0.05);
  // vec2 uv = (gl_FragCoord.xy + u_offset.xy) / u_resolution.xy;
  // vec2 uv = vec2((gl_FragCoord.x + u_offset.x) / u_resolution.x,
  // (gl_FragCoord.y + u_offset.y) / u_resolution.y);

  float osc = sin(uv.x * (uv.x + 0.5) * 15.0) * 0.2;
  uv.y += osc * sin(u_time + uv.x * 2.0);
  uv.y = fract(uv.y * s);

  vec3 bg = vec3(0.996, 0.137, 0.333);
  vec3 fg = vec3(0.024, 0.0, 0.02);

  float mask = smoothstep(0.5, 0.6, uv.y);
  mask += smoothstep(0.5 + st, 0.6 + st, 1.0 - uv.y);

  color = vec4(mask * bg + (1.0 - mask) * fg, 1.0);
}
