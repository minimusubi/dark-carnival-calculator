import { Component } from 'preact';
import Image from './Image.jsx';
import calculateOutcomeProbabilities from '../utils/calculateOutcomeProbabilities.js';
import '../css/stall.css';
import { clamp, fix, round } from '../utils/number.js';

// https://discord.com/channels/283779835883683841/805198723234660362/807484940701663273
const PROBABILITY_SCARE = 0.5;
const MAX_STALL_LUCK = 95;

export default class Stall extends Component {
	createOutcome(labelElement, probability, outcome) {
		return (
			<div class='outcome'>
				<div class='label hexagon'>{labelElement}</div>

				<div style={{ display: 'flex', fontStyle: 'italic' }}>
					<span
						style={{
							display: 'inline-block',
							margin: 'auto 8px auto 0',
							fontSize: '16px',
						}}
					>
						({fix(probability * 100, 2)}%)
					</span>
					<span style={{ margin: 'auto' }}>{outcome}</span>
				</div>
			</div>
		);
	}

	render() {
		const outcomes = [];
		const averages = new Map();
		// let unaffectedLuck = Math.min(30, this.props.trueLuck);
		// let diminishedLuck = Math.ceil(Math.max(0, this.props.trueLuck - 30) * 0.7);
		// let computedLuck = round(Math.min(100, Math.max(1, unaffectedLuck + diminishedLuck + this.props.data.base)));

		// Should stall be shown, given the user's total luck?
		if (this.props.totalLuck < (this.props.data.required ?? -Infinity)) {
			return null;
		}

		// Round luck to the nearest whole
		let trueLuck = clamp(
			round(this.props.trueLuck + this.props.data.base),
			1,
			MAX_STALL_LUCK,
		);
		if (this.props.data.type === 'fixed') {
			trueLuck = this.props.data.base;
		}
		const slotCount = this.props.data.outcomes.length - 1;

		// Scare
		if (this.props.stats.scared) {
			outcomes.push(
				this.createOutcome(
					<img src='../assets/scare.png' />,
					PROBABILITY_SCARE,
					'Get scared and flee',
				),
			);
		}

		// Cap true luck at the stall maximum
		if (this.props.data.max !== undefined) {
			trueLuck = Math.min(trueLuck, this.props.data.max);
		}

		// Storm adds 10 luck
		// This can exceed the stall max luck, but not MAX_STALL_LUCK
		// https://discord.com/channels/283779835883683841/805198723234660362/1562825538832171029
		// https://discord.com/channels/283779835883683841/805198723234660362/1562826423419273258
		if (
			this.props.stats.storming
			&& !this.props.options.noEffect?.includes('storming')
		) {
			trueLuck = clamp(trueLuck + 10, 1, MAX_STALL_LUCK);
		}

		const outcomeProbabilities = calculateOutcomeProbabilities(
			slotCount,
			trueLuck / 100,
			{
				shocked: this.props.stats.shocked,
				storming:
					this.props.stats.storming
					&& !this.props.options.noEffect?.includes('storming'),
				drollDistracted: this.props.stats.drollDistracted,
				distracted: this.props.stats.distracted,
				encouraged:
					this.props.stats.encouraged
					&& !this.props.options.noEffect?.includes('encourage'),
			},
		);

		for (let i = slotCount; i >= 0; i--) {
			let probability = outcomeProbabilities[i];

			// Scare, which has a 50% chance of avoiding the outcome
			// https://discord.com/channels/283779835883683841/805198723234660362/807484940701663273
			if (this.props.stats.scared) {
				probability *= PROBABILITY_SCARE;
			}

			let outcome = this.props.data.outcomes[i];
			if (typeof outcome != 'string') {
				let value = outcome.value;

				if (!averages.has(outcome.type)) {
					averages.set(outcome.type, {
						values: [],
						statLabel: outcome.statLabel,
					});
				}

				if (outcome.type == 'Gold') {
					// Apply the gold multiplier only to positive gold outcomes
					value =
						outcome.value
						+ round(
							((outcome.value > 0 ?
								this.props.stats.goldMultiplier
							:	0)
								/ 100)
								* outcome.value,
						);
				}

				averages.get(outcome.type).values.push(value * probability);
				outcome =
					outcome.counter === false ?
						outcome.type
					:	`${value < 0 ? '' : '+'}${value} ${outcome.type}`;
			}

			outcomes.push(
				this.createOutcome(<span>{i}</span>, probability, outcome),
			);
		}

		// console.log(`[SUM] ${this.props.data.name} ${sum}`);

		let cost =
			this.props.data.cost !== undefined ?
				this.props.data.cost
			:	{ value: 1, type: 'Ticket' };
		if (cost === null) {
			cost = { value: 'FREE', type: null };
		}
		let costImage =
			cost.type ?
				<Image
					src={`../assets/${cost.type.toLowerCase().replace(/\s+/g, '-')}.png`}
				/>
			:	null;

		return (
			<div
				class='stall'
				style={
					this.props.options.background ?
						{ '--stall-background': this.props.options.background }
					:	undefined
				}
			>
				<div class='container'>
					<div class='title'>
						<div>{this.props.data.name}</div>
					</div>
					<div class='cost'>
						<span>{cost.value}</span>
						{costImage}
					</div>
					<div
						class='background'
						style={{
							'--stall-image': `url(/assets/stall/${(
								this.props.data.image ?? this.props.data.name
							)
								.toLowerCase()
								.replaceAll(/[^a-z0-9 -]+/g, '')
								.replaceAll(/ +/g, '-')}.png)`,
							flex: 1,
						}}
					>
						{outcomes}
					</div>
					{/* <div style={{flex: 1}} /> */}
					<div class='divider' />
					{Array.from(averages)
						.filter(([, { values }]) => {
							return values.length > 0;
						})
						.map(([type, { values, statLabel }]) => {
							let average = values.reduce(
								(accumulator, currentValue) => {
									return accumulator + currentValue;
								},
							);

							if (average === 0) {
								return (
									<div
										key={type}
										style={{
											marginBottom: '8px',
											fontSize: '16px',
											textAlign: 'center',
										}}
									>
										No {(statLabel ?? type).toLowerCase()}{' '}
										change on average
									</div>
								);
							} else if (average < 1) {
								const playsPerItem =
									round((1 / average) * 100) / 100;

								if (playsPerItem >= 1) {
									// Calculate average tickets per one item
									return (
										<div
											key={type}
											style={{
												marginBottom: '8px',
												fontSize: '16px',
												textAlign: 'center',
											}}
										>
											{playsPerItem} plays per{' '}
											{(statLabel ?? type).toLowerCase()}{' '}
											on average
										</div>
									);
								}
							}

							// Calculate average items per one ticket
							return (
								<div
									key={type}
									style={{
										marginBottom: '8px',
										fontSize: '16px',
										textAlign: 'center',
									}}
								>
									{round(average * 100) / 100}{' '}
									{(statLabel ?? type).toLowerCase()} per play
									on average
								</div>
							);
						})}
					<div
						style={{
							fontSize: '12px',
							fontWeight: 400,
							textAlign: 'center',
							color: '#939286',
						}}
					>
						{this.props.data.type == 'fixed' ?
							`(This game has a fixed chance of ${trueLuck}% per slot)`
						:	`(The true chance of this game is ${trueLuck}% per slot)`
						}
					</div>
				</div>
			</div>
		);
	}
}
