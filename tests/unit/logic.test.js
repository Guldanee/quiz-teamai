import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pointsFor } from '../../site/js/logic.js';

test('Socle · pointsFor : 150 au maximum, 100 au minimum, 0 si faux', () => {
  assert.equal(pointsFor(true, 20000), 150);
  assert.equal(pointsFor(true, 13400), 134); // exemple de la spec : 100 + arrondi(33,5)
  assert.equal(pointsFor(true, 0), 100);
  assert.equal(pointsFor(true, -50), 100);
  assert.equal(pointsFor(true, 25000), 150);
  assert.equal(pointsFor(false, 15000), 0);
});
