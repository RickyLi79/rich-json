import { assert } from 'chai';
import { describe } from 'mocha';
import RichJson from '../src';

describe('buildin serializers', () => {
  beforeEach(() => {
    RichJson.resetCustomerSerializers();
  });
  describe('Date', () => {
    it('plain', () => {
      const expect = new Date();
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Date);
    });
    it('obj', () => {
      const expect = { a: new Date() };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Date);
    });
  });
  describe('URL', () => {
    it('plain', () => {
      const expect = new URL('http://abc.def?q=1&3#213');
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, URL);
    });
    it('obj', () => {
      const expect = { a: new Date() };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Date);
    });
  });
  describe('Error', () => {
    it('#1', () => {
      const expect = new Error('my message');
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.name, expect.name);
      assert.deepEqual(actual.message, expect.message);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Error);
    });
    it('#2', () => {
        
      let expect:Error;
      try {
        ({} as any).a.b.c = 1;
      } catch (e) {
        expect = e as Error;
      }
      const actual = RichJson.clone(expect!);
      assert.deepEqual(actual.name, expect!.name);
      assert.deepEqual(actual.message, expect!.message);
      assert.notStrictEqual(actual, expect!);
      assert.instanceOf(actual, TypeError);
    });
  });
  describe('RegExp', () => {
    it('plain without flag', () => {
      const expect = /RegExp/;
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, RegExp);
    });
    it('plain with flag', () => {
      const expect = /RegExp/ig;
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, RegExp);
    });
    it('obj', () => {
      const expect = { a: /RegExp/ };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, RegExp);
    });
  });
  describe('Set', () => {
    it('plain', () => {
      const expect = new Set([ 1, 2, 3 ]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Set);
    });
    it('obj', () => {
      const expect = { a: new Set([ 1, 2, 3 ]) };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Set);
    });
  });
  describe('Map', () => {
    it('plain', () => {
      const expect = new Map([[ 1, 2 ], [ 3, 4 ]]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Map);
    });
    it('obj', () => {
      const expect = { a: new Map([[ 1, 2 ], [ 3, 4 ]]) };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Map);
    });
  });
  describe('Function', () => {
    it('plain #1', () => {
      const expect = function() { return 1; };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Function);
    });
    it('plain #1 async', () => {
      const expect = async function() { return 1; };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Function);
    });
    it('plain #2', () => {
      const expect = () => { 0; };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Function);
    });
    it('plain #2 async', () => {
      const expect = async () => { 0; };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Function);
    });
    it('plain #3', () => {
      const expect = (a: any) => a;
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Function);
    });
    it('plain #3 async', () => {
      const expect = async (a: any) => a;
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Function);
    });
    it('obj #1', () => {
      const expect = { a() { return 1; } };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.a.toString(), expect.a.toString());
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Function);
    });
    it('obj #1 async', () => {
      const expect = { async a() { return 1; } };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.a.toString(), expect.a.toString());
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Function);
    });
    it('obj #2', () => {
      const expect = { a: () => { 0; } };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.a.toString(), expect.a.toString());
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Function);
    });
    it('obj #2 async', () => {
      const expect = { a: async () => { 0; } };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.a.toString(), expect.a.toString());
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Function);
    });
    it('obj #3', () => {
      const expect = { a: (a: any) => a };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.a.toString(), expect.a.toString());
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Function);
    });
    it('obj #3 async', () => {
      const expect = { a: async (a: any) => a };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.a.toString(), expect.a.toString());
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Function);
    });
  });
  describe('Buffer', () => {
    it('plain Buffer', () => {
      const expect = Buffer.from([ 72, 101, 108, 108, 111 ]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Buffer);
    });
    it('plain Uint8Array', () => {
      const expect = new Uint8Array([ 72, 101, 108, 108, 111 ]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Uint8Array);
    });
    it('plain Uint16Array', () => {
      const expect = new Uint16Array([ 72, 101, 108, 108, 111 ]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Uint16Array);
    });
    it('plain Uint32Array', () => {
      const expect = new Uint32Array([ 72, 101, 108, 108, 111 ]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Uint32Array);
    });
    it('plain Int32Array', () => {
      const expect = new Int32Array([ 72, 101, 108, 108, 111 ]);
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual.toString(), expect.toString());
      assert.notStrictEqual(actual, expect);
      assert.instanceOf(actual, Int32Array);
    });

    it('obj Buffer', () => {
      const expect = { a: Buffer.from([ 72, 101, 108, 108, 111 ]) };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Buffer);
    });
    it('obj Uint8Array', () => {
      const expect = { a: new Uint8Array([ 72, 101, 108, 108, 111 ]) };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Uint8Array);
    });
    it('obj Uint16Array', () => {
      const expect = { a: new Uint16Array([ 72, 101, 108, 108, 111 ]) };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Uint16Array);
    });
    it('obj Uint32Array', () => {
      const expect = { a: new Uint32Array([ 72, 101, 108, 108, 111 ]) };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual.a, expect.a);
      assert.instanceOf(actual.a, Uint32Array);
    });
  });
  describe('WrapRunner', () => {
    it('plain #1', () => {
      function add(a:number, b:number) {
        return a + b;
      }
      const expect = new RichJson.WrapRunner(add, 1, 2);
      const actual = RichJson.clone(expect);
      assert.instanceOf(actual, RichJson.WrapRunner);
      assert.deepEqual(actual.run(), 3);
    });
    it('plain #1 Promise', async () => {
      function add(a:number, b:number) {
        return Promise.resolve(a + b);
      }
      const expect = new RichJson.WrapRunner(add, 1, 2);
      const actual = RichJson.clone(expect);
      assert.instanceOf(actual, RichJson.WrapRunner);

      const called = actual.run();
      assert.instanceOf(called, Promise);
      assert.deepEqual(await called, 3);
    });
    it('plain #2 whih `this`', () => {
      function add(this:number, a:number, b:number) {
        return (this ?? 0) + a + b;
      }

      const expect = new RichJson.WrapRunner(add, 1, 2);
      const actual = RichJson.clone(expect);
      assert.instanceOf(actual, RichJson.WrapRunner);

      assert.deepEqual(actual.run(), 3);
      assert.deepEqual(actual.run(5), 8);
      assert.deepEqual(actual.run(-1), 2);
    });
  });

});
