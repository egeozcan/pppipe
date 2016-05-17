let assert = require('chai').assert;
let pppipe = require('../index.js');

function doubleSay(str) {
  return str + ", " + str;
}
function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1);
}
function delay(fn) {
  return function () {
    let args = arguments;
    return new Promise(resolve => setTimeout(() => resolve(fn.apply(null, args)), 10))
  };
}
function exclaim(str) {
  return str + '!';
}
function join() {
  let arr = Array.from(arguments);
  return arr.join(", "); 
}
function quote(str) {
  return '"' + str + '"';
}

let _ = pppipe._;

describe('pppipe', () => {
  const message = "hello";
  const dQuote = delay(quote);
  const dJoin = delay(join);
  const dExclaim = delay(exclaim);
  const dCapitalize = delay(capitalize);
  const toPromise = Promise.resolve.bind(Promise);
  const extract = (x, y) => x[y];
  const add = (x, y) => x + y;
  const double = x => 2 * x;
  const square = x => Math.pow(x, 2);
  const divide = (x, y) => x / y;
  const delayRes = x => new Promise(res => setTimeout(() => res(x), 10));
  const ctx = name => eval(name);
    
  it('should correctly pass the params to the first fn', () => {
    assert.equal(
      pppipe(message, ctx).doubleSay(),
      doubleSay(message)
    );
  });
  
  it('should correctly pass the params to the second fn', () => {
    assert.equal(
      pppipe(message, ctx).doubleSay().exclaim(),
      exclaim(doubleSay(message))
    );
  }); 
  
  it('should correctly insert parameters', () => {
    assert.equal(
      pppipe(message, ctx).doubleSay().join(_, "I said").exclaim(),
      exclaim(join(doubleSay(message), "I said"))
    );
    
    assert.equal(
      pppipe(1, ctx).add(1).double().square().divide(_, 8),
      2
    )
    
    return pppipe(1, ctx)
      .add(1)
      .double()
      .square()
      .delayRes()
      .divide(_, 8)
      .then(x => assert.equal(x, 2));
  }); 
  
  it('should be able to work with objects', () => {
    assert.equal(pppipe({ foo: "bar" }, ctx).extract(_, "foo"), "bar");
    assert.equal(pppipe(1, ctx)(x => ({foo: "bar"})).foo, "bar");
  }); 
  
  it('should be able to work with functions', () => {
    assert.equal(pppipe(1, ctx).extract(_, "toExponential")(x => y => x.call(1)).val(), "1e+0");
  }); 
  
  it('should correctly insert parameters on multiple functions', () => {
    assert.equal(
      pppipe(message, ctx).doubleSay().join(_, "I said").exclaim().join("and suddenly", _, "without thinking"),
      join("and suddenly", exclaim(join(doubleSay(message), "I said")), "without thinking")
    );
  });
  
  it('should correctly insert parameters on multiple functions, given a ctx', () => {
    assert.equal(
      pppipe(message, ctx)
        .doubleSay()
        .join(_, "I said")
        .exclaim()
        .join("and suddenly", _, "without thinking"),
      join("and suddenly", exclaim(join(doubleSay(message), "I said")), "without thinking")
    );
  }); 
  
  let result = 'Hello!';
  
  it('should wrap promise factories in the middle of the chain', () => {
    return pppipe(message, ctx).toPromise().dCapitalize().exclaim().then(res => {
      return assert.equal(result, res);
    });
  });
  
  it('should wrap promise factories at the end of the chain', () => {
    return pppipe(message, ctx).capitalize().dExclaim().then(res => {
      return assert.equal(result, res);
    });
  });
  
  it('should wrap promises in the beginning of the chain', () => {
    return pppipe(Promise.resolve(message), ctx).capitalize().exclaim().then(res => {
      return assert.equal(result, res);
    });
  });
  
  it('should wrap multiple promise factories and promises in chain', () => {
    return pppipe(Promise.resolve(message), ctx).dCapitalize().dExclaim().then(res => {
      return assert.equal(result, res);
    });
  });
  
  it('should be able to insert promise values as parameters', () => {
    return pppipe(message, ctx)
      .doubleSay()
      .dQuote()
      .dJoin(_, "I said")
      .join("and suddenly", _, "without thinking")
      .dExclaim()
      .exclaim()
      .then(res => 
        assert.equal('and suddenly, "hello, hello", I said, without thinking!!', res)
      )
  });
  
  it('should be able to insert promise values as parameters, given a ctx', () => {
    return pppipe(message, ctx)
      .doubleSay()
      .dQuote()
      .dJoin(_, "I said")
      .join("and suddenly", _, "without thinking")
      .dExclaim()
      .exclaim()
      .then(res => 
        assert.equal('and suddenly, "hello, hello", I said, without thinking!!', res)
      )
  });
});