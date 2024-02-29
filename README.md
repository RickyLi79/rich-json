# @rickyli79/rich-json
serialize and deserialize rich javascript data types, suport reference data.

## install
```
npm install @rickyli79/rich-json
```

## usage

### supported runtime
- NodeJS
- Browser

### stringify
```typescript
import RichJson from '@rickyli79/rich-json'
// const RichJson = require('@rickyli79/rich-json');
const complexObj_origin = { key: 'any supported data types' };
const rJson:string = RichJson.stringify(complexObj_origin);
// todo: save rJson to file;
```
### parse
```typescript
import RichJson from '@rickyli79/rich-json'
const rJson:string = getRichJsonText();
const complexObj = RichJson.parse<TComplaxObj>(rJson);
```

### clone
```typescript
import RichJson from '@rickyli79/rich-json'
const complexObj_origin = { key: 'any supported data types' };
const complexObj = RichJson.clone(complexObj_origin);

assert.notStrictEqual(complexObj, complexObj_origin);
```

## supported data types
- primitive
  - null
  - undefined
  - bigint
  - number
    - normal
    - `NaN`
    - `-0`
    - `Number.EPSILON`
    - `Number.MAX_SAFE_INTEGER`
    - `Number.MIN_SAFE_INTEGER`
    - `Number.NEGATIVE_INFINITY`
    - `Number.POSITIVE_INFINITY`
- function
  - function
  - async function
  - arrow function
  - async arrow function
- object
  - `URL`
  - `Date`
  - `RegExp`
  - `Set`
  - `Map`
  - `Error` ( with `message` only, ~~without `stack`~~ )
  - Buffer like
    - `Buffer` ***in NodeJs***
    - `Int8Arrany`, `Uint16Array`, `Uint32Array` ...and more
    - ~~NOT support `Blob`~~
  - `WrapRunner` class
  - customer serializers
- reference
  - reference to same object
  - circular reference
  >including reference in `Set` and `Map`, and `WrapRunner` class or `customer serializers`

## unittest 
- Report: https://rickyli79.github.io/rich-json/
- [unittest files](https://github.com/RickyLi79/rich-json/tree/main/test)