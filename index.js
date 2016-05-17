function isPromise(val) {
  return val && typeof val.then === "function";
}

let pppipe = function(val, ctx) {

  const pipe = (fn, ...params) => {
    if (typeof fn !== "function") {
      return val;
    }
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
  
  var handler = {
    get: (target, name) => {
      if (pipe[name]) {
        return pipe[name];
      }
      if (val[name]) {
        return val[name];
      }
      let fn;
      if (ctx) {
        fn = typeof ctx === "function" ? ctx(name) : ctx[name];
      } else {
        fn = this[name];
      }
      return pipe.bind(null, fn);
    }
  };
  pipe.val = val;
  if (isPromise(val)) {
    pipe.then = val.then.bind(val);
    pipe.catch = val.catch.bind(val);
  } else {
    pipe.then = fn => fn(val);
    pipe.catch = fn => pipe;
  }
  return new Proxy(pipe, handler);
}
pppipe._ = {};

module.exports = pppipe;