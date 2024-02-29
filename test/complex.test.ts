import { assert } from 'chai';
import { describe } from 'mocha';
import RichJson from '../src';


describe('complex', () => {
  class MyClass {
    ref: object;
    private constructor(public data: string) { }
    public static create(data: string, ref?: object) {
      const inst = new MyClass(data);
      inst.ref = ref;
      return inst;
    }
  }
  const obj = { z: 1 };
  const obj2 = MyClass.create('my class', obj);
  const buffer = new Uint8Array([ 72, 101, 108, 108, 111 ]);
  const expect = {
    a: 1,
    b: new Date(),
    c() { return 1; },
    d: obj,
    e: new Set([ obj ]),
    f: new Map<any, any>([[ obj, 0 ], [ 1, obj ]]),
    g: obj2,
    h: buffer,
    circle: {
      root: null,
      circle: null,
    },
    i: new Set([ obj2 ]),
    $ref: {
      c: null,
      d: null,
      e: null as Set<any>,
      f: null as Map<any, any>,
      g0: null as MyClass,
      g: new Set([ obj2 ]),
      gg: new Map<any, any>([[ obj2, 0 ], [ 1, obj2 ]]),
      h: buffer,
      i: null as Set<any>,
    },
  };
  expect.circle.root = expect;
  expect.circle.circle = expect.circle;
  expect.$ref.c = expect.c;
  expect.$ref.d = expect.d;
  expect.$ref.e = expect.e;
  expect.$ref.f = expect.f;
  expect.$ref.g0 = expect.g;
  expect.$ref.h = expect.h;
  expect.$ref.i = expect.i;

  let actual: typeof expect;

  beforeEach(() => {
    RichJson.resetCustomerSerializers();
  });
  beforeEach(() => {
    actual = RichJson.clone(expect);
  });

  // #endregion
  describe('circle', () => {
    it('root', () => {
      assert.strictEqual(actual.circle.root, actual);
    });
    it('circle', () => {
      assert.strictEqual(actual.circle.circle.circle, actual.circle);
    });
  });
  describe('$ref', () => {
    it('function', () => {
      assert.strictEqual(actual.$ref.c, actual.c);
    });
    it('object', () => {
      assert.strictEqual(actual.$ref.d, actual.d);
      assert.notStrictEqual(actual.$ref.d, obj);
    });
    it('member of Set #1', () => {
      assert.strictEqual(actual.$ref.e, actual.e);
      const value = Array.from(actual.$ref.e)[0];
      assert.strictEqual(value, actual.d);
    });
    it('member of Set #2', () => {
      const value = Array.from(actual.$ref.g)[0];
      assert.strictEqual(value, actual.g);
    });
    it('member of Map #1', () => {
      assert.strictEqual(actual.$ref.f, actual.f);

      const key = Array.from(actual.$ref.f.entries())[0][0];
      assert.strictEqual(key, actual.d);

      const value = Array.from(actual.$ref.f.entries())[1][1];
      assert.strictEqual(value, actual.d);
    });
    it('member of Map #2', () => {

      const key = Array.from(actual.$ref.gg.entries())[0][0];
      assert.strictEqual(key, actual.g);

      const value = Array.from(actual.$ref.gg.entries())[1][1];
      assert.strictEqual(value, actual.g);
    });
    it('buffer', () => {
      assert.strictEqual(actual.$ref.h, actual.h);
      assert.notStrictEqual(actual.$ref.h, buffer);
    });
    it('class #1', () => {
      assert.strictEqual(actual.$ref.g0, actual.g);
      assert.notStrictEqual(actual.$ref.g0, obj2);
    });
    it('class #2', () => {
      assert.strictEqual(actual.$ref.g0.ref, actual.d);
      assert.notStrictEqual(actual.$ref.g0.ref, obj2);
    });
    it('class #3 - in Set', () => {
      assert.strictEqual(actual.$ref.i, actual.i);
      const value = Array.from(actual.$ref.i)[0] as MyClass;
      assert.strictEqual(value, actual.g);
      assert.strictEqual(value.ref, actual.d);
    });
  });
});
