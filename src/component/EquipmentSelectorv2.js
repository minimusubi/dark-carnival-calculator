import {Component} from 'preact';
import Image from './Image.js';
import '../css/equipment-selectorv2.css';
import equipment from '../equipment.json';

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
		return <div class={`equipmentv2${this.state.shown ? ' open' : ''}`}>
			<div class='container'>
				<div class='content'>
					<a style={{display: 'block', textAlign: 'center'}} href='#' onClick={this.toggleExplanation}>Why does my equipment matter?</a>
					<div style={{display: this.state.explanationShown ? '' : 'none'}} class='information'>
						<div class='content'>
							<p>
								Calculations for "true luck" are based on two types of luck; your "base luck", and your "equipment luck".
							</p>
							<h1>Base Luck</h1>
							<p>
								All of your base luck is counted towards your true luck. This is usually 30, but may change, for example, due to the Wicked Wishing Well.
							</p>
							<h1>Equipment Luck</h1>
							<p>
								Only 70% of your equipment luck is counted towards your true luck. For the purposes of this calculation, "equipment" includes your luck blessing.
							</p>
						</div>
					</div>
					<div style='display: flex; flex-wrap: wrap; justify-content: center;'>
						{Object.entries(equipment).filter(([type]) => {
							return type != 'lute' && type != 'pipe';
						}).map(([type, equips]) => {
							return <div key={`${type}-${equips}`} class='two-tone' style={{display: 'inline-flex', margin: '1em'}}>
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
