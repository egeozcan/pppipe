function isPromise(val) {
  return val && typeof val.then === "function";
}

const pipe = (val, ctx, fn, ...params) => {
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

let pppipe = function(val, ctx) {

  const res = pipe.bind(null, val, ctx);
  res.val = val;
  if (!isPromise(val)) {
    res.then = fn => Promise.resolve(fn(val));
    res.catch = fn => Promise.resolve(res);
  }
  
  const handler = {
    get: (target, name) => {
      if (val[name]) {
        return typeof val[name] === "function"
          ? val[name].bind(val)
          : val[name];
      }
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
  
  return new Proxy(res, handler);
}
pppipe._ = {};

module.exports = pppipe;