'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

require('babel-register');

var _mergeStores = require('../mergeStores');

var _mergeStores2 = _interopRequireDefault(_mergeStores);

var _dataPaginationFront = require('./data-pagination-front');

var _dataPaginationBack = require('./data-pagination-back');

var _dataPagination = require('./data-pagination');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)('merge docs 1-3 with doc 4 that has EOF == true', function (t) {
  var firstDocs = _dataPaginationFront.front3Store;
  var lastDoc = (0, _dataPaginationFront.front2After3StoreFn)();
  var actual = (0, _mergeStores2.default)(firstDocs, lastDoc);
  var expected = _dataPagination.fullPostStore;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge docs 1-3 with doc 4', function (t) {
  var firstDocs = _dataPaginationFront.front3Store;
  var lastDoc = _dataPaginationFront.front1After3Store;
  var actual = (0, _mergeStores2.default)(firstDocs, lastDoc);
  var expected = _dataPagination.front4PostStore;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge docs 1-4 with an empty doc 5 request (front)', function (t) {
  var firstDocs = _dataPagination.front4PostStore;
  var lastDoc = (0, _dataPaginationFront.front1After4StoreFn)();
  var actual = (0, _mergeStores2.default)(firstDocs, lastDoc);
  var expected = _dataPagination.fullPostStore;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge docs 1-4 with an empty doc 5 request (back)', function (t) {
  var firstDocs = _dataPagination.back4PostStore;
  var lastDoc = (0, _dataPaginationBack.back1After4StoreFn)();
  var actual = (0, _mergeStores2.default)(firstDocs, lastDoc);
  var expected = _dataPagination.fullPostStore;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge docs 1-3 with back 1', function (t) {
  var firstDocs = _dataPaginationFront.front3Store;
  var lastDoc = _dataPagination.back1Store;
  var actual = (0, _mergeStores2.default)(firstDocs, lastDoc);
  var expected = _dataPagination.front3Back1Store;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge docs 1-3 with back 1-3', function (t) {
  var firstDocs = _dataPaginationFront.front3Store;
  var lastDoc = _dataPaginationBack.back3Store;
  var actual = (0, _mergeStores2.default)(firstDocs, lastDoc);
  var expected = _dataPagination.fullPostStore;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: back, src: back', function (t) {
  var state = { back: [3, 4, 5] };
  var src = { back: [0, 1, 2] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { back: [0, 1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: back, src: front, EOF: false', function (t) {
  var state = { back: [3, 4, 5] };
  var src = { front: [0, 1, 2] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [0, 1, 2], back: [3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: back, src: front, EOF: true', function (t) {
  var state = { back: [3, 4, 5] };
  var src = { front: [1, 2, 3] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: back, src: full', function (t) {
  var state = { back: [3, 4, 5] };
  var src = { full: [0, 1, 2] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [0, 1, 2] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: back, src: front, back, EOF: false', function (t) {
  var state = { back: [3, 4, 5] };
  var src = { front: [0, 1], back: [2, 3] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [0, 1], back: [2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: back, src: front, back, EOF: true', function (t) {
  var state = { back: [3, 4, 5] };
  var src = { front: [0, 1], back: [1, 2, 3] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [0, 1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, src: back, EOF: false', function (t) {
  var state = { front: [0, 1, 2] };
  var src = { back: [3, 4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [0, 1, 2], back: [3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, src: back, EOF: true', function (t) {
  var state = { front: [0, 1, 2] };
  var src = { back: [2, 3, 4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [0, 1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, src: front', function (t) {
  var state = { front: [1, 2, 3] };
  var src = { front: [3, 4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, src: full', function (t) {
  var state = { front: [1, 2, 3] };
  var src = { full: [3, 4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, src: front, back, EOF: false', function (t) {
  var state = { front: [1, 2, 3] };
  var src = { front: [3, 4], back: [5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [1, 2, 3, 4], back: [5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, src: front, back, EOF: true', function (t) {
  var state = { front: [1, 2, 3] };
  var src = { front: [3, 4], back: [4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: back, EOF: false', function (t) {
  var state = { front: [1, 2, 3], back: [5] };
  var src = { back: [4] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [1, 2, 3], back: [4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: back, EOF: true', function (t) {
  var state = { front: [1, 2, 3], back: [5] };
  var src = { back: [3, 4] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: front, EOF: false', function (t) {
  var state = { front: [1, 2, 3], back: [5] };
  var src = { front: [4] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [1, 2, 3, 4], back: [5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: front, EOF: true', function (t) {
  var state = { front: [1, 2, 3], back: [5] };
  var src = { front: [4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: full', function (t) {
  var state = { front: [1, 2, 3], back: [5] };
  var src = { full: [1, 2, 3, 4] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: front, back, EOF: false', function (t) {
  var state = { front: [1, 2], back: [5] };
  var src = { front: [3], back: [4] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { front: [1, 2, 3], back: [4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: front, back, src: front, back, EOF: true', function (t) {
  var state = { front: [1, 2], back: [5] };
  var src = { front: [3, 4], back: [4] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: full, src: back', function (t) {
  var state = { full: [1, 2, 3] };
  var src = { back: [4, 5] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 4, 5] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: full, src: front', function (t) {
  var state = { full: [1, 2, 3] };
  var src = { front: [0, 3] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [0, 1, 2, 3] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('merge permutation: target: full, src: full', function (t) {
  var state = { full: [1, 2, 3] };
  var src = { full: [0, 3, 4, 5, 2] };
  var actual = (0, _mergeStores2.default)(state, src);
  var expected = { full: [1, 2, 3, 0, 4, 5] };
  t.deepEqual(actual, expected);
});

//   test('array mutation: delete a doc', t => {
//     const state = {full: [1, 2, 3]};
//     const src = {full: [1, 2]};
//     const actual = mergeStores(state, src, true);
//     const expected = {full: [1, 2]};
//     t.deepEqual(actual, expected);
//   });
//
// test('array mutation: move a doc', t => {
//   const state = {full: [1, 2, 3]};
//   const src = {full: [1, 3, 2]};
//   const actual = mergeStores(state, src, true);
//   const expected = {full: [1, 3, 2]};
//   t.deepEqual(actual, expected);
// });
//
// test('array mutation: replace a doc', t => {
//   const state = {full: [1, 2, 3]};
//   const src = {full: [1, 4, 3]};
//   const actual = mergeStores(state, src, true);
//   const expected = {full: [1, 4, 3]};
//   t.deepEqual(actual, expected);
// });
//
// test('array mutation: replace 2 docs with 3 new docs', t => {
//   const state = {full: [1, 2, 3]};
//   const src = {full: [9, 2, 8, 6]};
//   const actual = mergeStores(state, src, true);
//   const expected = {full: [9, 2, 8, 6]};
//   t.deepEqual(actual, expected);
// });