import {Component} from 'preact';
import Image from './Image.js';
import Stall from './Stall.js';
import Dialog from './Dialog.js';
import StatusOptions from './StatusOptions.js';
import EquipmentSelector from './EquipmentSelectorv2.js';
import LZString from 'lz-string';

import '../css/style';
import '../css/font';
import equipment from '../equipment.json';
import stalls from '../stalls.json';

const EQUIPMENT_REVISION = 1;
const INTRO_DIALOG_VERSION = '7';

export default class App extends Component {
	constructor() {
		super();
		
		this.state = {
			computedLuck: 30,
			options: {
				totalLuck: 30,
				goldMultiplier: 0,
				encouraged: false,
				shocked: false,
				scared: false,
				drollDistracted: false,
				storming: false,
				distracted: false
			},
			equipment: {},
			isIntroOpen: false,
			validateTimeout: null
		};
		
		// Set default options
		for (let [type] of Object.entries(equipment)) {
			this.state.equipment[type] = 0;
		}
	}
	
	componentDidMount() {
		if (window.localStorage.getItem('intro') !== INTRO_DIALOG_VERSION) {
			setTimeout(() => {
				this.setState({isIntroOpen: !this.state.isIntroOpen});
			}, 50);
		}
		
		const options = {};
		const equips = {};
		
		// Load saved options
		try {
			const savedOptions = JSON.parse(window.localStorage.getItem('options'));
			if (savedOptions) {
				Object.entries(savedOptions).forEach(([property, value]) => {
					options[property] = value;
				});
			}
		} catch (error) {}
		
		// Load saved equipment
		try {
			const savedEquipment = JSON.parse(window.localStorage.getItem('equipment'));
			if (savedEquipment) {
				Object.entries(savedEquipment).forEach(([equip, value]) => {
					equips[equip] = value;
				});
			}
		} catch (error) {}
		
		const newState = {
			options: {...this.state.options, ...options},
			equipment: {...this.state.equipment, ...equips}
		};
		
		// Prevent multiple conflicting options from being enabled
		let singleOptions = 0;
		if (newState.options.encouraged) {
			singleOptions++;
		}
		if (newState.options.drollDistracted) {
			singleOptions++;
		}
		if (newState.options.storming) {
			singleOptions++;
		}
		if (singleOptions > 1) {
			newState.options.encouraged = false;
			newState.options.drollDistracted = false;
			newState.options.storming = false;
		}
		
		// Migrate old equipment
		let equipmentRevision = window.localStorage.getItem('equipmentRevision') ?? 0;
		let adjustedLuck = 0;
		while (equipmentRevision < EQUIPMENT_REVISION) {
			switch (equipmentRevision) {
				case 0:
					if (newState.equipment.amulet == 3) {
						newState.equipment.amulet = 4;
						adjustedLuck++;
					}
					if (newState.equipment.amulet == 4) {
						newState.equipment.amulet = 5;
						adjustedLuck++;
					}
					if (newState.equipment.amulet == 5) {
						newState.equipment.amulet = 7;
						adjustedLuck += 2;
					}
					if (newState.equipment.amulet == 8) {
						newState.equipment.amulet = 9;
						adjustedLuck++;
					}
					if (newState.equipment.amulet == 10) {
						newState.equipment.amulet = 12;
						adjustedLuck += 2;
					}
					
					if (newState.equipment.trinket == 5) {
						newState.equipment.trinket = 4;
						adjustedLuck--;
					}
					if (newState.equipment.trinket == 7) {
						newState.equipment.trinket = 6;
						adjustedLuck--;
					}
					if (newState.equipment.trinket == 9) {
						newState.equipment.trinket = 8;
						adjustedLuck--;
					}
					if (newState.equipment.trinket == 12) {
						newState.equipment.trinket = 10;
						adjustedLuck -= 2;
					}
					if (newState.equipment.trinket == 15) {
						newState.equipment.trinket = 13;
						adjustedLuck -= 2;
					}
					break;
			}
			
			equipmentRevision++;
		}
		
		if (adjustedLuck !== 0) {
			// Adjust total luck
			newState.options.totalLuck += adjustedLuck;
		}
		
		// Store equipment revision
		window.localStorage.setItem('equipmentRevision', EQUIPMENT_REVISION);
		
		// Calculate luck
		newState.computedLuck = this.getComputedLuck(newState.options, newState.equipment);
		
		// Re-render (causes initial double-render)
		this.setState(newState);
	}
	
	onDismissIntro = () => {
		this.setState({isIntroOpen: false});
	};
	
	onIgnoreIntro = (event) => {
		event.preventDefault();
		this.onDismissIntro();
		window.localStorage.setItem('intro', INTRO_DIALOG_VERSION);
	};
	
	onEquipmentChange = (equip, callback) => {
		const newValue = {...this.state.equipment, ...equip};
		
		this.setState({
			computedLuck: this.getComputedLuck(this.state.options, newValue),
			equipment: newValue
		}, () => {
			if (callback) {
				callback();
			}
			
			// Validate equipment
			if (this.state.validateTimeout) {
				clearTimeout(this.state.validateTimeout);
			}
			this.setState({validateTimeout: setTimeout(this.validate, 10000)});
			
			// Save only those state properties which are a part of equipment.json
			window.localStorage.setItem('equipment', JSON.stringify(this.state.equipment, (key, value) => {
				// The initial object is referred to as ''
				if (key === '' || key in equipment) {
					return value;
				}
				
				return undefined;
			}));
		});
	};
	
	onOptionChange = (options, callback) => {
		const newOptions = {...this.state.options, ...options};
		
		this.setState({
			computedLuck: this.getComputedLuck(newOptions, this.state.equipment),
			options: newOptions
		}, () => {
			if (callback) {
				callback();
			}
			
			// Validate equipment
			if ((options.totalLuck ?? options.goldMultiplier) !== undefined) {
				if (this.state.validateTimeout) {
					clearTimeout(this.state.validateTimeout);
				}
				this.setState({validateTimeout: setTimeout(this.validate, 10000)});
			}
			
			// Save options
			window.localStorage.setItem('options', JSON.stringify(this.state.options));
		});
	};
	
	onPaste = (event) => {
		console.log(event);
		const data = event.clipboardData.getData('text/plain');
		// const matches = data.match(/:stat_luck:\s*(?<totalLuck>\d+)\s+:sanctum_wealth:\s*(?<goldMultiplier>-?\d+)%[\s\S]+?Equipment\s*:[\s\S]+?:equip_helmet_heavy:\s*[\w ']*(?:\(\+?(?<helmet>-?\d+)\))?\s+:equip_armor_plate:\s*[\w ']*(?:\(\+?(?<armor>-?\d+)\))?\s+:equip_boots:\s*[\w ']*(?:\(\+?(?<boots>-?\d+)\))?\s+:equip_necklace:\s*[\w ']*(?:\(\+?(?<amulet>-?\d+)\))?\s+:equip_ring:\s*[\w ']*(?:\(\+?(?<trinket>-?\d+)\))?(?:[\s\S]+?:misc_luck_card:\s*\+?(?<blessing>-?\d+) Luck Blessing)?/);
		const matches = data.match(/(?:(?<u>.*)\r?\n─{24}[\s\S]+?)?:stat_[^:]*luck[^:]*?:\s*(?<totalLuck>\d+)\s+:sanctum_wealth(?:~\d+)?:\s*(?<goldMultiplier>-?\d+)%[\s\S]+?Equipment\s*:[\s\S]+?:equip_helmet_heavy(?:~\d+)?:\s*[\w ']*(?:\(\+?(?<helmet>-?\d+)\))?\s+:equip_armor_plate(?:~\d+)?:\s*[\w ']*(?:\(\+?(?<armor>-?\d+)\))?\s+:equip_boots(?:~\d+)?:\s*[\w ']*(?:\(\+?(?<boots>-?\d+)\))?\s+:equip_necklace(?:~\d+)?:\s*[\w ']*(?:\(\+?(?<amulet>-?\d+)\))?\s+:equip_ring(?:~\d+)?:\s*[\w ']*(?:\(\+?(?<trinket>-?\d+)\))?(?:[\s\S]+?:misc_luck_card(?:~\d+)?:\s*\+?(?<blessing>-?\d+) Luck Blessing)?(?:[\s\S]+?\r?\n\r?\n(?<d>\d+))?/);
		
		if (matches) {
			event.preventDefault();
			
			const newState = {
				options: {
					...this.state.options,
					totalLuck: parseInt(matches.groups.totalLuck, 10),
					goldMultiplier: parseInt(matches.groups.goldMultiplier, 10)
				},
				equipment: {
					helmet: parseInt(matches.groups.helmet, 10) || 0,
					armor: parseInt(matches.groups.armor, 10) || 0,
					boots: parseInt(matches.groups.boots, 10) || 0,
					amulet: parseInt(matches.groups.amulet, 10) || 0,
					trinket: parseInt(matches.groups.trinket, 10) || 0,
					blessing: parseInt(matches.groups.blessing, 10) || 0,
				},
			};
			
			// Validate equipment
			if ((newState.options.totalLuck ?? newState.options.goldMultiplier) !== undefined) {
				if (this.state.validateTimeout) {
					clearTimeout(this.state.validateTimeout);
				}
				this.setState({validateTimeout: setTimeout(() => {
					this.validate(matches.groups.u, matches.groups.d);
				}, 10000)});
			}
			
			// Calculate luck
			newState.computedLuck = this.getComputedLuck(newState.options, newState.equipment);
			
			// Set state
			this.setState(newState, () => {
				// Save only those state properties which are a part of equipment.json
				window.localStorage.setItem('equipment', JSON.stringify(this.state.equipment, (key, value) => {
					// The initial object is referred to as ''
					if (key === '' || key in equipment) {
						return value;
					}
					
					return undefined;
				}));
				// Save options
				window.localStorage.setItem('options', JSON.stringify(this.state.options));
			});
		}
	};
	
	validate = (u, d) => {
		clearTimeout(this.state.validateTimeout);
		this.setState({validateTimeout: null});
		
		fetch('/validate', {
			method: 'POST',
			cache: 'no-cache',
			headers: {
				// 'Content-Type': 'application/json'
				'Content-Type': 'text/plain; charset=utf-8'
			},
			body: LZString.compressToUTF16(JSON.stringify({
				u,
				d,
				stats: {
					totalLuck: this.state.options.totalLuck,
					goldMultiplier: this.state.options.goldMultiplier,
					...this.state.equipment
				}
			}))
		}).then((response) => {
			// Validate response
			response.json();
		});
	};
	
	getComputedLuck(options, equips) {
		// Total the luck from equipment
		let equipmentLuck = Object.entries(equips).reduce((accumulator, [, luck]) => {
			return accumulator + luck;
		}, 0);
		
		// Only apply 70% of equipment luck
		// Clamp luck to [1, 95]
		return Math.max(1, Math.min(95, options.totalLuck - Math.floor(equipmentLuck * 0.3)));
	}
	
	render() {
		return (
			<div onpaste={this.onPaste}>
				<Dialog style={{maxWidth: '53em'}} title='Calculator Usage' open={this.state.isIntroOpen === true} onDismiss={this.onDismissIntro} leftActions={<a href='#' onClick={this.onIgnoreIntro}>Don't show again</a>}>
					<p>
						To start, simply enter your stats, including your <Image class='inline' src='../assets/luck.png' /> luck and <Image class='inline' src='../assets/gold-multiplier.png' /> gold multiplier. Enter these just as they appear in your <code>$profile</code>. Finally, use the equipment menu to select the items that you currently have equipped.
					</p>
					<h1 style={{textAlign: 'left', fontSize: '1.75rem', fontWeight: 'normal'}}>Import via Paste!</h1>
					<p>
						You can now import your stats by copy/pasting your profile from Discord! Click the image to open it full-size.
						<div><a href='../assets/copy-paste.mp4' target='_blank'><Image style={{width: '50%'}} src='../assets/copy-paste.gif' /></a></div>
					</p>
					<h1 style={{textAlign: 'left', fontSize: '1.75rem', fontWeight: 'normal'}}>Thanks</h1>
					<p>
						<ul>
							<li><span class='mention'>@goose</span> for the inspiration</li>
							<li><span class='mention'>@alifee</span> for calculation and simulation assistance</li>
							<li><span class='mention'>@peace</span> for providing encourage calculations</li>
							<li><span class='mention'>@Robby</span> for helping to correct and verify calculations</li>
							<li>Everyone else who has made suggestions or reports</li>
						</ul>
					</p>
					<p>
						Special thanks to <span class='mention'>@Senerio</span> for his untold hours planning, creating, and improving the Dark Carnival!
					</p>
				</Dialog>
				<div class='sticky'>
					<StatusOptions options={this.state.options} onChange={this.onOptionChange} />
					<EquipmentSelector options={this.state.options} equipment={this.state.equipment} onChange={this.onEquipmentChange} />
				</div>
				<main>
					{stalls.map((category) => {
						const categoryStalls = category.stalls.map((stall) => {
							// Should stall be shown, given the user's total luck?
							if (this.state.options.totalLuck < category.required ?? stall.required ?? -Infinity) {
								return null;
							}
							
							const stallOptions = {...category.options, ...stall.options};
							
							return <Stall key={stall.name} trueLuck={this.state.computedLuck} totalLuck={this.state.options.totalLuck} stats={this.state.options} data={stall} options={stallOptions} />;
						}).filter((stall) => {
							return stall !== null;
						});
						
						if (categoryStalls.length === 0) {
							return null;
						}
						
						return <div key={category.category} class='category'>
							<h1>{category.category}</h1>
							<div class='stalls'>
								{categoryStalls}
							</div>
						</div>;
					})}
				</main>
				{/* <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center'}}>
					{stalls.map((stall) => {
						return <Stall trueLuck={this.state.computedLuck} totalLuck={this.state.options.totalLuck} options={this.state.options} data={stall} />;
					})}
				</div> */}
				<footer>
					<div>Built with <a href='https://preactjs.com/'>Preact</a> by <span class='mention'>@summer musubi</span>.</div>
					<div>For use with <span class='mention'>@Droll</span>, the Dark Carnival bot built by <span class='mention'>@Senerio</span> in the <a href='https://discord.com/invite/fortheking'>For the King Discord server</a>.</div>
				</footer>
			</div>
		);
	}
}
