const SLOT_EFFECTS = [
	// https://discord.com/channels/283779835883683841/805198723234660362/829851738051575828
	{ name: 'storming', chance: 0.2, succeeds: false },
	// https://discord.com/channels/283779835883683841/805198723234660362/830909853685383231
	{ name: 'drollDistracted', chance: 0.25, succeeds: false },
	// https://discord.com/channels/283779835883683841/805198723234660362/830909853685383231
	{ name: 'distracted', chance: 0.15, succeeds: false },
	// https://discord.com/channels/283779835883683841/805198723234660362/826529925807865866
	{ name: 'encouraged', chance: 0.2, succeeds: true },
];

/*
 * For each slot, check the active effects in the bot's order. A triggered effect
 * replaces the ordinary luck roll and cannot trigger again on a later slot.
 * If no effect triggers, use the normal success chance for that slot.
 * Add the probability of every path that ends with the same number of successes.
 */
export default function calculateOutcomeProbabilities(
	slotCount,
	successChance,
	activeEffects,
) {
	const probabilities = Array(slotCount + 1).fill(0);

	function rollNextSlot(
		slotIndex,
		successCount,
		triggeredEffects,
		probability,
	) {
		if (slotIndex === slotCount) {
			probabilities[successCount] += probability;
			return;
		}

		if (slotIndex === 0 && activeEffects.shocked) {
			// Shock forces the first slot to fail before any other effect is checked
			rollNextSlot(
				slotIndex + 1,
				successCount,
				triggeredEffects,
				probability,
			);
			return;
		}

		// Each effect that doesn't trigger passes its remaining probability to the next one
		let probabilityWithoutEffect = probability;
		for (const effect of SLOT_EFFECTS) {
			if (
				!activeEffects[effect.name]
				|| triggeredEffects.has(effect.name)
			) {
				continue;
			}

			const effectProbability = probabilityWithoutEffect * effect.chance;
			rollNextSlot(
				slotIndex + 1,
				successCount + Number(effect.succeeds),
				new Set([...triggeredEffects, effect.name]),
				effectProbability,
			);
			probabilityWithoutEffect *= 1 - effect.chance;
		}

		rollNextSlot(
			slotIndex + 1,
			successCount + 1,
			triggeredEffects,
			probabilityWithoutEffect * successChance,
		);
		rollNextSlot(
			slotIndex + 1,
			successCount,
			triggeredEffects,
			probabilityWithoutEffect * (1 - successChance),
		);
	}

	rollNextSlot(0, 0, new Set(), 1);
	return probabilities;
}
