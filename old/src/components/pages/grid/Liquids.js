const fills = {
  water: '#1A8AAB',
  hotwater: '#DB0023',
  beer: '#E1AC00',
  wort: '#c78a49',
  runoff: '#d69d5f',
  cleaner: '#89448a',
  background: '#24333D',
  conflict: 'black',
};
function color(liquid) {
  const isHexColor = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(liquid);
  if (isHexColor) {
    return liquid;
  }
  return liquid ? fills[liquid] : fills.background;
}

function fillStyle(liquid) {
  return (
    {
      fill: color(liquid),
    }
  );
}

function strokeStyle(liquid) {
  return (
    {
      stroke: color(liquid),
    }
  );
}

export default {
  color,
  fillStyle,
  strokeStyle,
};
