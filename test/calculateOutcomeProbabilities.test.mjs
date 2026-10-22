import assert from 'node:assert/strict';
import test from 'node:test';
import {calculateOutcomeProbabilities} from '../src/calculateOutcomeProbabilities.mjs';

function assertProbabilitiesClose(actual, expected) {
	assert.equal(actual.length, expected.length);
	actual.forEach((probability, successCount) => {
		assert.ok(Math.abs(probability - expected[successCount]) < 1e-12, `Unexpected probability for ${successCount} successes`);
	});
}

test('ordinary slots follow the binomial distribution', () => {
	assertProbabilitiesClose(calculateOutcomeProbabilities(4, 0.5, {}), [1, 4, 6, 4, 1].map((count) => count / 16));
});

test('encourage can replace one ordinary slot with a success', () => {
	const chanceToTrigger = 1 - 0.8 ** 4;
	const chanceToNeverTrigger = 0.8 ** 4;
	const perfectOutcomeChance = chanceToTrigger * 0.5 ** 3 + chanceToNeverTrigger * 0.5 ** 4;
	const probabilities = calculateOutcomeProbabilities(4, 0.5, {encouraged: true});

	assert.ok(Math.abs(probabilities[4] - perfectOutcomeChance) < 1e-12);
	assert.ok(Math.abs(probabilities.reduce((sum, probability) => sum + probability, 0) - 1) < 1e-12);
});

test('effect priority prevents two effects from changing the same slot', () => {
	const probabilities = calculateOutcomeProbabilities(1, 0.5, {
		storming: true,
		drollDistracted: true,
		encouraged: true
	});

	// Storm and Droll force failure first. Encourage gets its chance only if both fail.
	const chanceToSucceed = 0.8 * 0.75 * (0.2 + 0.8 * 0.5);
	assertProbabilitiesClose(probabilities, [1 - chanceToSucceed, chanceToSucceed]);
});

test('shock forces the first slot to fail while other effects remain available', () => {
	const probabilities = calculateOutcomeProbabilities(2, 0.5, {shocked: true, encouraged: true});
	assertProbabilitiesClose(probabilities, [0.4, 0.6, 0]);
});

test('all effects together produce a full probability distribution', () => {
	for (const slotCount of [1, 2, 3, 4]) {
		const probabilities = calculateOutcomeProbabilities(slotCount, 0.65, {
			shocked: true,
			storming: true,
			drollDistracted: true,
			distracted: true,
			encouraged: true
		});
		assert.ok(probabilities.every((probability) => probability >= 0 && probability <= 1));
		assert.ok(Math.abs(probabilities.reduce((sum, probability) => sum + probability, 0) - 1) < 1e-12);
	}
});
