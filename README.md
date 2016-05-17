## IMPORTANT

This is an experiment which uses Proxies and requires you to use eval (ugh).
Never use this in production. Being hacky behind the scenes is one thing,
encouraging the user to use eval is another. This code exists as a thought
experiment.

You can use [ppipe](https://github.com/egeozcan/ppipe) for your projects,
as a sane alternative.

# pppipe
pipes values through functions, an alternative to using the
[proposed pipe operator](https://github.com/mindeavor/es-pipeline-operator)
( |> ) for ES.

Supports functions returning promises too. In that case, the result of the
chain will also be a promise. This is similar to the proposed support for
await in the chained functions.

## Installation

`npm install pppipe`

## All features at a glance

```javascript

/* used for inserting the result to a specific location
in a multi-parameter function*/
const _ = pppipe._;
const add = (x, y) => x + y;
const double = x => 2 * x;
const square = x => Math.pow(x, 2);
const divide = (x, y) => x / y;
const delayRes = x => 
  new Promise(resolve => setTimeout(() => resolve(x), 100));
const ctx = x => eval(x);

pppipe(1, ctx).add(1).double().square().divide(_, 8); // 2
pppipe(1, ctx).add(1).double().square().delayRes().divide(_, 8)
  .then(x => console.log(x)); // Logs 2 after ~100ms
```

Look at the test/test.js for more examples.