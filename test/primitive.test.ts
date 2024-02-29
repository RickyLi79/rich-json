import { assert } from 'chai';
import { describe } from 'mocha';
import RichJson from '../src';


describe('primitive', () => {

  beforeEach(() => {
    RichJson.resetCustomerSerializers();
  });
  describe('null', () => {
    it('plain', () => {
      const expect = null;
      const actual = RichJson.clone(expect);
      assert.equal(actual, expect);
    });
    it('obj', () => {
      const expect = { a: null };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notStrictEqual(actual, expect);
    });
  });
  describe('undefined', () => {
    it('plain', () => {
      const expect = undefined;
      const actual = RichJson.clone(expect);
      assert.equal(actual, expect);
    });
    it('obj', () => {
      const expect = { a: undefined } as any;
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, {});
      assert.notStrictEqual(actual, expect);
    });
  });
  describe('bigint', () => {
    it('plain', () => {
      const expect = 1n;
      const actual = RichJson.clone(expect);
      assert.equal(actual, expect);
    });
    it('obj', () => {
      const expect = { a: 1n };
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
    });
  });
  describe('number', () => {
    it('normal', () => {
      const expect = 1;
      const actual = RichJson.clone(expect);
      assert.equal(actual, expect);
    });
    it('NaN', () => {
      const expect = Number.NaN;
      const actual = RichJson.clone(expect);
      assert.isNaN(actual);
    });
    it('-0', () => {
      const expect = -0;
      const actual = RichJson.clone(expect);
      assert.deepEqual(actual, expect);
      assert.notDeepEqual(actual, 0);
    });
    const numberStaticsKeys = [ 'EPSILON', 'MAX_SAFE_INTEGER', 'MAX_VALUE', 'MIN_SAFE_INTEGER', 'MIN_VALUE', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY' ]; 
    for (const i of numberStaticsKeys) {
      if (typeof Number[i] !== 'number') continue;
      if (i === 'NaN') continue;
      it(i, () => {
        const expect = Number[i];
        const actual = RichJson.clone(expect);
        assert.equal(actual, expect);
      });
    }
  });
});
