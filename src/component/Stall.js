import {Component} from 'preact';
import '../css/stall.css';

const Probability = {
	// https://discord.com/channels/283779835883683841/805198723234660362/826529925807865866
	ENCOURAGE: 0.2,
	// https://discord.com/channels/283779835883683841/805198723234660362/807484940701663273
	SCARE: 0.5,
	// https://discord.com/channels/283779835883683841/805198723234660362/830909853685383231
	DROLL_DISTRACT: 0.25,
	// https://discord.com/channels/283779835883683841/805198723234660362/829851738051575828
	STORM: 0.2,
	// https://discord.com/channels/283779835883683841/805198723234660362/830909853685383231
	DISTRACT: 0.15
};

export default class Stall extends Component {
	// constructor() {
	// 	super();
	// }
	
	round(number) {
		return number > 0 ? Math.round(number) : -Math.round(-number);
	}
	
	fix(number, places) {
		number = (this.round(number * 10 ** places) / 10 ** places).toString();
		
		if (places > 0) {
			let decimalIndex = number.indexOf('.');
			
			if (places > 0 && decimalIndex == -1) {
				number = `${number}.`;
				decimalIndex = number.length - 1;
			}
			
			return number + '0'.repeat(places - (number.length - decimalIndex - 1));
		}
		
		return number;
	}

	factorial(number) {
		let result = 1;
		
		for (let i = 2; i <= number; i++) {
			result = result * i;
		}
		
		return result;
	}
	
	// From n choose k (nCk)
	choose(n, k) {
		return this.factorial(n) / (this.factorial(k) * this.factorial(n - k));
	}
	
	binomialDistribution(n, k, probability) {
		return this.choose(n, k) * Math.pow(probability, k) * Math.pow(1 - probability, n - k);
	}
	
	and(probability1, probability2) {
		return probability1 * probability2;
	}
	
	or(probability1, probability2) {
		return probability1 + probability2 - this.and(probability1, probability2);
	}
	
	getProbability(rolls, successCount, successChance) {
		// return this.choose(rolls, successCount) * Math.pow(successChance, successCount) * Math.pow(1 - successChance, rolls - successCount);
		return this.binomialDistribution(rolls, successCount, successChance);
	}
	
	createOutcome(labelElement, probability, outcome) {
		return <div class='outcome'>
			<div class='label hexagon'>
				{labelElement}
			</div>
			
			<div style={{display: 'flex', fontStyle: 'italic'}}>
				<span style={{display: 'inline-block', margin: 'auto 8px auto 0', fontSize: '16px'}}>({this.fix(probability * 100, 2)}%)</span>
				<span style={{margin: 'auto'}}>{outcome}</span>
			</div>
		</div>;
	}
	
	render() {
		const outcomes = [];
		const averages = new Map();
		// let unaffectedLuck = Math.min(30, this.props.trueLuck);
		// let diminishedLuck = Math.ceil(Math.max(0, this.props.trueLuck - 30) * 0.7);
		// let computedLuck = this.round(Math.min(100, Math.max(1, unaffectedLuck + diminishedLuck + this.props.data.base)));
		
		// Should stall be shown, given the user's total luck?
		if (this.props.totalLuck < (this.props.data.required ?? -Infinity)) {
			return null;
		}
		
		// Round luck to the nearest whole
		let trueLuck = this.round(Math.min(100, Math.max(1, this.props.trueLuck + this.props.data.base)));
		if (this.props.data.type === 'fixed') {
			trueLuck = this.props.data.base;
		}
		let eligibleSlots = this.props.data.outcomes.length - 1;
		
		if (this.props.options.shocked) {
			eligibleSlots -= 1;
		}
		
		// Scare
		if (this.props.options.scared) {
			outcomes.push(this.createOutcome(<img src='../assets/scare.png' />, Probability.SCARE, 'Get scared and flee'));
		}
		
		// Storm
		if (this.props.options.storming) {
			trueLuck = Math.min(100, Math.max(1, trueLuck + 10));
		}
		
		for (let i = this.props.data.outcomes.length - 1; i >= 0; i--) {
			// console.log(this.props.data.name, i);
			let probability = this.getProbability(eligibleSlots, i, trueLuck / 100);
			
			/*
			 * For each outcome (when encourage is on), calculate
			 * 1) The normal probability of that outcome (for example, rolling 3/4)
			 * 2) The probability of rolling one less than that outcome (in this case, 2/4)
			 * 3) The probability of rolling at least one encourage within 3 rolls
			 * 
			 * And then basically the probability overall of that outcome is 1 OR (2 AND 3).
			 * In order to come out with 3/4, you either a) naturally roll a 3/4, or b) roll a 2/4 and get saved by an encourage
			*/
			if (this.props.options.encouraged) {
				/* let encourageProbability = 0;
				for (let j = 0; j < i; j++) {
					console.log('prob of exactly', j, 'encourage rolls out of', i, this.getProbability(i, j, ENCOURAGE_PROBABILITY));
					encourageProbability += this.getProbability(i, j, ENCOURAGE_PROBABILITY);
				}
				let lowerOutcomeProbability = this.getProbability(eligibleSlots, i - 1, trueLuck / 100);
				
				probability = this.or(probability, this.and(encourageProbability, lowerOutcomeProbability));
				
				// Encourage
				// probability = this.or(probability, this.and(this.getProbability(slots, i - 1, trueLuck / 100), this.getProbability(1, 1, .20))); */
				
				// Binomial + probability of the row below getting moved up - the probability of the current row moving up
				probability = probability
					+ (i == 0 ? 0 : this.getProbability(eligibleSlots - (i - 1), 1, Probability.ENCOURAGE) * this.getProbability(eligibleSlots, i - 1, trueLuck / 100))
					- (i == eligibleSlots ? 0 : this.getProbability(eligibleSlots - i, 1, Probability.ENCOURAGE) * probability);
				// console.log(`prob + BD(1, ${eligibleSlots - (i - 1)}, 0.2) * PROB(${i - 1}) - BD(1, ${eligibleSlots - i}, 0.2) * PROB(${i})`);
			}
			
			// Droll Distraction
			if (this.props.options.drollDistracted) {
				// Binomial + the probability of the row above moving down - probability of the current row getting moved down
				probability = probability
					+ (i == eligibleSlots ? 0 : this.getProbability(i + 1, 1, Probability.DROLL_DISTRACT) * this.getProbability(eligibleSlots, i + 1, trueLuck / 100))
					- (i == 0 ? 0 : this.getProbability(i, 1, Probability.DROLL_DISTRACT) * probability);
			}
			
			// Storm
			if (this.props.options.storming) {
				// Binomial + the probability of the row above moving down - probability of the current row getting moved down
				probability = probability
					+ (i == eligibleSlots ? 0 : this.getProbability(i + 1, 1, Probability.STORM) * this.getProbability(eligibleSlots, i + 1, trueLuck / 100))
					- (i == 0 ? 0 : this.getProbability(i, 1, Probability.STORM) * probability);
			}
			
			// Zero probability when slot is higher than possible rolls
			if (i > eligibleSlots) {
				probability = 0;
			}
			
			// Scare, which has a 50% chance of avoiding the outcome
			// https://discord.com/channels/283779835883683841/805198723234660362/807484940701663273
			if (this.props.options.scared) {
				probability *= Probability.SCARE;
			}
			
			let outcome = this.props.data.outcomes[i];
			if (typeof outcome != 'string') {
				let value = outcome.value;
				
				if (!averages.has(outcome.type)) {
					averages.set(outcome.type, {values: [], statLabel: outcome.statLabel});
				}
				
				if (outcome.type == 'Gold') {
					// Apply the gold multiplier only to positive gold outcomes
					value = outcome.value + this.round((outcome.value > 0 ? this.props.options.goldMultiplier : 0) / 100 * outcome.value);
				}
				
				averages.get(outcome.type).values.push(value * probability);
				outcome = `${value < 0 ? '' : '+'}${value} ${outcome.type}`;
			}
			
			outcomes.push(this.createOutcome(<span>{i}</span>, probability, outcome));
		}
		
		// console.log(`[SUM] ${this.props.data.name} ${sum}`);
		
		return <div class='stall' style={this.props.data.background ? {'--stall-background': this.props.data.background} : undefined}>
			<div class='container'>
				<div class='title'>
					<div>{this.props.data.name}</div>
				</div>
				<div style={{margin: '14px'}}>
					{outcomes}
				</div>
				<div style={{flex: 1}} />
				{Array.from(averages).filter(([, {values}]) => {
					return values.length > 0;
				}).map(([type, {values, statLabel}]) => {
					let average = values.reduce((accumulator, currentValue) => {
						return accumulator + currentValue;
					});
					
					if (average === 0) {
						return;
					} else if (average < 1) {
						// Calculate average tickets per one item
						return <div key={type} style={{marginBottom: '8px', fontSize: '16px', textAlign: 'center'}}>
							Average tickets per {(statLabel ?? type).toLowerCase()} is {this.round(1 / average * 100) / 100}
						</div>;
					}
					
					// Calculate average items per one ticket
					return <div key={type} style={{marginBottom: '8px', fontSize: '16px', textAlign: 'center'}}>
						Average {(statLabel ?? type).toLowerCase()} per ticket is {this.round(average * 100) / 100}
					</div>;
				})}
				<div style={{fontSize: '12px', fontWeight: 400, textAlign: 'center', color: '#939286'}}>
					{this.props.data.type == 'fixed' ?
						`(This game has a fixed chance of ${trueLuck}% per slot)` :
						`(The true chance of this game is ${trueLuck}% per slot)`}
				</div>
			</div>
		</div>;
	}
}
