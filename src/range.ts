function makeRange(from: number, to: number): number[] {
  let length = to - from + 1;
  return Array.from(Array(length).keys()).map(value => value + from);
}

export default makeRange;
