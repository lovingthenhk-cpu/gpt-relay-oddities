'use strict';
const assert = require('node:assert/strict');
const { normalizeTopic, hashTopic, reviewTopic } = require('../peer-review.js');
assert.equal(normalizeTopic('  ｶﾀｶﾅ   の\n研究  '), 'カタカナ の 研究');
assert.equal(normalizeTopic(' '.repeat(5)), '');
assert.equal(reviewTopic('    '), null);
assert.equal(normalizeTopic('x'.repeat(200)).length, 80);
assert.equal(Array.from(normalizeTopic('🚀'.repeat(100))).length, 80);
assert.equal(hashTopic('a'), hashTopic('a'));
assert.notEqual(hashTopic('a'), hashTopic('b'));
const a = reviewTopic('机の上で目玉焼きを焼く');
const b = reviewTopic(' 机の上で目玉焼きを焼く ');
assert.deepEqual(a, b, 'whitespace-normalized topics should have identical fictional review');
assert.notDeepEqual(a, reviewTopic('靴下の片方が逃げる理由'));
for (const field of ['novelty', 'reproducibility', 'utility']) {
  assert.ok(Number.isInteger(a[field]) && a[field] >= 0 && a[field] <= 100);
}
assert.ok(['掲載（架空）', '修正後に再審査', '今回は見送り'].includes(a.verdict));
assert.equal(reviewTopic('<img src=x onerror=alert(1)>').topic, '<img src=x onerror=alert(1)>');
console.log('Peer review assertions passed; content rendering uses textContent, no HTML parsing.');
