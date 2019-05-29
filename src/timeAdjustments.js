(function(){
  factor = 1;

  module.exports = {
    multiplicator: () => factor,
    speedUpBy: (f) => { factor = 1.0/f; }
  }
})();