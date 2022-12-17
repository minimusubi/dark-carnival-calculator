import {Component} from 'preact';
import Image from './Image.js';
import '../css/equipment-selectorv2.css';
import equipment from '../data/equipment.json';

export default class EquipmentSelectorv2 extends Component {
	constructor() {
		super();
		
		this.state = {
			shown: false,
			explanationShown: false
		};
	}
	
	toggle = () => {
		this.setState({
			shown: !this.state.shown
		});
	};
	
	toggleExplanation = (event) => {
		event.preventDefault();
		this.setState({
			explanationShown: !this.state.explanationShown
		});
	};
	
	onChange = (event) => {
		this.props.onChange({
			[event.target.name]: parseInt(event.target.value, 10)
		});
	};
	
	render() {
		const equipmentLuck = Object.values(this.props.equipment).reduce((accumulator, currentValue) => {
			return accumulator + currentValue;
		});
		
		return <div class={`equipmentv2${this.state.shown ? ' open' : ''}`}>
			<div class='container'>
				<div class='content'>
					<div>
						<a href='#' onClick={this.toggleExplanation}>Why does equipment matter?</a>
					</div>
					<div style={{display: this.state.explanationShown ? '' : 'none'}} class='information'>
						<div class='content'>
							<p>
								Calculations for <strong>true luck</strong> are based on two types of luck; your <strong>base luck</strong>, and your <strong>equipment luck</strong>.
							</p>
							<h1>Base Luck</h1>
							<p>
								All of your base luck is counted towards your true luck. This is usually 30, but may change, for example, due to the Wicked Wishing Well.
							</p>
							<h1>Equipment Luck</h1>
							<p>
								Only 70% of your equipment luck is counted towards your true luck. For the purposes of this calculation, your luck blessing is counted as <strong>equipment luck</strong>.
							</p>
						</div>
					</div>
					<div style='display: flex; flex-wrap: wrap; justify-content: center; margin: 0.5em 0;'>
						{Object.entries(equipment).filter(([type]) => {
							return type != 'lute' && type != 'pipe';
						}).map(([type, equips]) => {
							return <div key={`${type}-${equips}`} class='two-tone' style={{display: 'inline-flex', margin: '0.5em'}}>
								<label>
									<Image style={{height: '22px'}} src={`../assets/${type}.png`} />
								</label>
								<select style={{flex: 1}} title={type} name={type} value={this.props.equipment[type]} onChange={this.onChange}>
									<option value='0'>-- None --</option>
									{equips.map((equip) => {
										return <option key={equip.value} value={equip.value}>{equip.name} (+{equip.value}{equip.unit})</option>;
									})}
								</select>
							</div>;
						})}
					</div>
					<div class='content'>
						<span style={{marginRight: '1em'}}>Base luck: {this.props.options.totalLuck - equipmentLuck}</span><span>Equipment luck: {equipmentLuck}</span>
					</div>
				</div>
				<div class='toggle'>
					<button onClick={this.toggle}>
						{/* <span>Equipment</span> */}
						{/* <Image title='Toggle equipment sidebar' style={{height: '2em'}} src='../assets/armor.png' /> */}
						<span class='material-icons-round'>{this.state.shown ? 'expand_less' : 'expand_more'}</span>
						<span class='label'>Equipment</span>
						<span class='material-icons-round'>{this.state.shown ? 'expand_less' : 'expand_more'}</span>
					</button>
				</div>
			</div>
		</div>;
	}
}
