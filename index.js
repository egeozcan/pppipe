function isPromise(val) {
  return val && typeof val.then === "function";
}

function pipe(val, ctx, fn) {
  if (typeof fn !== "function") {
    return val;
  }
  let params = Array.from(arguments);
  params.splice(0, 3);
  let idx = params.indexOf(pppipe._);
  let deleteCount = idx >= 0 ? 1 : 0;
  if (isPromise(val)) {
    return pppipe(val.then(function(res) {
      params.splice(Math.max(idx, 0), deleteCount, res);
      return fn.apply(null, params);
    }), ctx);
  } else {
    params.splice(Math.max(idx, 0), deleteCount, val);
    return pppipe(fn.apply(null, params), ctx);
  }
}

let pppipe = function(val, ctx) {
  let res = pipe.bind(null, val, ctx);
  var handler = {
    get: (target, name) => {
      if (res[name]) {
        return res[name];
      }
      let fn;
      if (ctx) {
        fn = typeof ctx === "function" ? ctx(name) : ctx[name];
      } else {
        fn = this[name];
      }
      return res.bind(null, fn);
    }
  };
  if (isPromise(val)) {
    res.then = val.then.bind(val);
    res.catch = val.catch.bind(val);
  } else {
    res.then = fn => fn(val);
  }
  return new Proxy(this, handler);
}
pppipe._ = {};

module.exports = pppipe;