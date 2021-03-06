import {
  getKey,
  setKey,
  removeKey
} from '../../src/ast-utils/object-expression';
import { parse, print } from '../../src/ast-utils/common';

const objAst = `({
  firstKey: true,
  nestedKey: {
    child: {
      child: []
    }
  },
  emptyNode: {},
  nodeWithComments: {
    // comment
  },
  middleNode: true,
  lastKey(arg) { return arg; },
  'literal-key': true
})`;

it('should get key', () => {
  let ast = parse(objAst);
  let expectGet = (key, expected) =>
    expect(print(getKey(ast, key))).toEqual(expected);

  expectGet('firstKey', 'true');
  expectGet('nestedKey.child', '{\n  child: []\n}');
  expectGet('nestedKey.child.child', '[]');
  expectGet('emptyNode', '{}');
  expectGet('emptyNode.unexistedKey', '');
  expectGet('emptyNode.nested.nested', '');
  expectGet('nodeWithComments', '{}');
  expectGet('middleNode', 'true');
  expectGet('lastKey', 'function(arg) { return arg; }');
  expectGet('literal-key', 'true');
});

it('should set key', () => {
  let ast = parse(objAst).program.body[0].expression;
  let expectSet = (key, val, expected) =>
    expect(setKey(ast, key, val)).toEqual(expected);
  let expectIncludes = (str, expected) =>
    expect(print(ast).includes(str)).toEqual(expected);

  expectSet('firstKey', 'false', true);
  expectIncludes('firstKey: false', true);

  expectSet('newKey', '{}', true);
  expectIncludes('newKey: {}', true);

  expectSet('newKey.newChild', '[]', true);
  expectIncludes('newChild: []', true);

  expectSet('middleNode.key', 'true', false);

  expectSet('middleNode', 'function(arg) { return arg; }', true);
  expectIncludes('middleNode: function(arg) { return arg; }', true);

  expectSet('literal-key', 'test', true);
  expectIncludes('literal-key', true);

  expectSet('new-literal-key', 'true', true);
  expectIncludes('new-literal-key', true);
});

it('should remove key', () => {
  let ast = parse(objAst);
  let expectRemove = (key, expected) =>
    expect(removeKey(ast, key)).toEqual(expected);
  let expectIncludes = (str, expected) =>
    expect(print(ast).includes(str)).toEqual(expected);

  expectRemove('firstKey', true);
  expectIncludes('firstKey: true', false);

  expectRemove('noneKey', false);
  expectIncludes('noneKey', false);

  expectRemove('nestedKey.child.child', true);
  expectIncludes('child: {}', true);

  expectRemove('nestedKey.child', true);
  expectIncludes('nestedKey: {}', true);

  expectRemove('middleNode', true);
  expectIncludes('middleNode: true', false);

  expectRemove('lastKey', true);
  expectIncludes('lastKey', false);

  expectRemove('literal-key', true);
  expectIncludes('literal-key', false);
});
