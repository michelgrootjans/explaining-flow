(function(){
  let factor = 1;

  module.exports = {
    multiplicator: () => factor,
    speedUpBy: (f: number) => { factor = 1.0/f; }
  }
})();

export {};
