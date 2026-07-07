// glyph geometry shared between the hero icons and the background scenes so
// a visual tweak lands everywhere at once

// six-spoke asterisk snowflake, centered on the local origin
export const renderSnowflakeMark = (radius: number): string => {
  const strokeWidth = Math.max(0.3, radius * 0.32).toFixed(2);
  const half = (radius * 0.5).toFixed(2);
  const tall = (radius * 0.87).toFixed(2);
  return `<g stroke="#f8fafc" stroke-width="${strokeWidth}" stroke-linecap="round">
    <line x1="${-radius}" y1="0" x2="${radius}" y2="0"/>
    <line x1="-${half}" y1="-${tall}" x2="${half}" y2="${tall}"/>
    <line x1="-${half}" y1="${tall}" x2="${half}" y2="-${tall}"/>
  </g>`;
};
