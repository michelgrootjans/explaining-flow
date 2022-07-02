// from https://www.color-hex.com/color-palette/29241
// and http://writersbrick.org/css/post-it-note-colors.html
const cardColors = [
  '#FF7EB9',
  '#F59DB9',
  '#FF65A3',
  '#EE5E9F',
  '#7AFCFF',
  '#7AFCFF',
  '#7AFCFF',
  '#7AFCFF',
  '#FEFF9C',
  '#FEFF9C',
  '#FFF740',
  '#FFF740',
  '#FCF0AD',
  '#E9E74A',
  '#FFDD2A',
  '#F9A55B',
]

function any(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function anyCardColor() {
  return any(cardColors);
}

module.exports = {anyCardColor};