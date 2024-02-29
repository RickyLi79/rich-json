# @rickyli79/rich-json
Serialize and Deserialize javascript objects

## usage
```js
const RichJson = require('@rickyli79/rich-json');
const complexObj = {};
const rJson = RichJson.stringify(complexObj);
const complexObj2 = RichJson.parse(rJson);
const complexObj3 = RichJson.clone(rJson);
```
## support data types
- primitive
  - null
  - undefined
  - bigint
  - number
    - normal
    - `NaN`
    - -0
    - `Number.EPSILON`
    - `Number.MAX_SAFE_INTEGER`
    - `Number.MIN_SAFE_INTEGER`
    - `Number.NEGATIVE_INFINITY`
    - `Number.POSITIVE_INFINITY`
- Function
  - Function
  - async Function
  - arrow function
  - async arrow function
- object
  - `URL`
  - `Date`
  - `RegExp`
  - `Set`
  - `Map`
  - instanceof `Error` ( with `message` only, without `stack` )
  - Buffer like
    - `Buffer` ***NodeJs***
    - `Int8Arrany`, `Uint16Array`, `Uint32Array` ...and more
    - ~~NOT support `Blob`~~
  - `WrapCaller` class
  - customer serializers
- special
  - circular reference



## unittest 
- Report: https://rickyli79.github.io/rich-json/
- [unittest files](https://github.com/RickyLi79/rich-json/tree/main/test)