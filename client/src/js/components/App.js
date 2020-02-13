import React, { Component } from 'react'
import { observable, computed, autorun} from 'mobx'
import { observer } from 'mobx-react'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'



// Top level view for the application, contains tab controls as well as ProgramManagers
@observer
class DiaryView extends React.Component {

	@observable active_program = (new ProgramStore("Default"))
	@observable program_active = false
	constructor(props) {
		super(props)
		this.state = {apiResponse: ""}
	}

	callAPI(){
		fetch('http://localhost:3000/API')
			.then(res=>res.text())
			.then(res => this.setState({apiResponse: res}))
	}

	componentWillMount() {
		this.callAPI()
	}

	render () {
		this.date = this.props.date
		this.programs = []

		return (
				<Tabs defaultActiveKey="manage" id="tabs-bar">
					<Tab eventKey="home"  title="Home">
						<h2>Program for {this.date}:</h2>
						<p>{this.state.apiResponse}</p>
						{(this.program_active) && <ProgramView diary_mode={true} program={this.active_program}/>}
					</Tab>
					
					<Tab eventKey="manage" title="Manage">
					<ProgramManagerView diary={this} programs={this.programs}/>
					</Tab>

				</Tabs>
			)
	}
}

// A view for all the existing programs, contains programs, contained in a Diary
@observer
class ProgramManagerView extends React.Component {
	@observable programs = []
	@observable newProgramName = "Unnamed Program"
	@observable loadedProgramName = "No Load"
	@observable loadedProgram = {}

	constructor (props) {
		super(props)
	}

	render () {
		return (
			<div>
			<div>
				<Form>
					<Form.Row>
						<Form.Group as={Col} controlId="formGroupLabel" >
							<Form.Control placeholder="Enter Program Name" onChange={this.handleChange} type="text"/>
						</Form.Group>
						<Form.Group as={Col} controlId="formGroupCreate">
							<Button onClick={this.handleAdd}>Create Program</Button>
							<Button onClick={this.handleLoad}>Load Program</Button>
						</Form.Group>
					</Form.Row>
				</Form>
			</div>
			<ListGroup>
				{this.programs.map(((x)=><ListGroup.Item key={x.label}>{<ProgramView diary={this.props.diary} removeProgram={this.removeProgram} program={x}/>}</ListGroup.Item>))}
			</ListGroup>
			</div>
			)		
	}

	handleChange = (e) => {
		this.newProgramName = e.currentTarget.value
	}

	handleSubmit = (e) => {
		const form = event.currentTarget
		const value = form.value
		this.programs.push(new ProgramStore(this.newProgramName))
		//this.programs.forEach((prog, idx => {prog.resetLabels()}))
	}

	handleAdd = (e) => {
		this.programs.push(new ProgramStore(this.newProgramName))
	}

	handleLoad = (e) => {
		let program = this.newProgramName
		fetch(`http://localhost:3000/API/load/${program}`, {
			headers: {
				'Accept':'application/json',
				'Content-Type':'application/json'
			}
		})
			.then((res)=>{
				if(!res.ok) {
					throw new Error('Network response was not ok')
				}
				return res.json()
			})
			.then((_json) => {
				this.loadedProgramName = program
				this.loadedProgram = _json.load
				let newProgram = new ProgramStore(this.loadedProgramName)
				let days = this.loadedProgram.days
				
				days.forEach((day, index)=> {
					let tempDay = new DayStore()
					tempDay.label = day.label
					day.xrcs.forEach((xrc, index) => {
						tempDay.xrcs.push(new ExerciseStore(xrc.name, xrc.sets, xrc.reps))
					})

					newProgram.days.push(tempDay)					
				})
				newProgram.resetLabels()
				this.programs.push(newProgram)
			})
			.catch( (e) => {
				console.error(`A load fetch failed with error: ${e}`)
			} )
	}


	removeProgram = (prog) => {
		let idx = this.programs.indexOf(prog)
		this.programs.splice(idx, 1)
	}
}

class ProgramStore {
	@observable days = []
	@observable label = "Unnamed Program"

	constructor(label) {
		this.label = label
	}

	addDay = () => {
		this.days.push(new DayStore('A'))
		this.resetLabels()
	}

	resetLabels = () =>{
		let charCode = 65
		this.days.forEach((day, index)=> {
			day.label=String.fromCharCode(charCode)
			charCode++
		})
	}

}

// A view for a single program, holds days, is contained in a ProgramManager
@observer
class ProgramView extends React.Component {
	
	@observable saveDialog = "Save"

	constructor(props) {
		super(props)
	}

	handleSave= (e) => {
		let load = this.props.program
		fetch('http://localhost:3000/API/save', 
			{
				method: 'POST',
					headers: {
						'Accept':'application/json',
						'Content-Type': 'application/json'
					},
				body: JSON.stringify(load) 
			})
			.then(res=>{
				if (!res.ok) {
					throw new Error('Network response was not OK')
					this.saveDialog = "Save Failed"
				}
				return res.text()
			})
			.then(res => {
				this.setState({apiResponse: res})
				this.saveDialog = "Saved"
			})
			.catch( (e) => {
				console.error(`A save POST failed with error: ${e}`)
		})
	}

	makeActive = (e)=> {
		this.props.diary.active_program = this.props.program
    	this.props.diary.program_active = true
	}

	handleRemove = () => {
		this.props.removeProgram(this)
	}

	removeDivision = (division) => {
		this.props.program.days.splice(this.props.program.days.indexOf(division), 1)
	}

	render () {
		const program = this.props.program
		return (
			<div>
				<h2>{program.label}</h2>
				{!this.props.diary_mode && <Button onClick={program.addDay}>Add division</Button>}
				<ListGroup>
				{program.days.map(((x)=><ListGroup.Item key={x.label}><DayView removeDivision={this.removeDivision} diary_mode={this.props.diary_mode} day={x}/></ListGroup.Item>))}
				</ListGroup>
				{!this.props.diary_mode && <Button onClick={this.makeActive}>Make Active</Button>}
				{!this.props.diary_mode && <Button onClick={this.handleSave}>{this.saveDialog}</Button>}
				{!this.props.diary_mode && <Button onClick={this.handleRemove}>Remove</Button>}
			</div>
		)

	}

}

class DayStore {
	@observable label="A"
	@observable xrcs = []
	@observable candidateName = "undefined_name"
	@observable candidateSets = -1
	@observable candidateReps = -1

	constructor(label='Day Label') {
		this.label = label
	}

	handleNameChange = (e) => {
		const form = e.currentTarget
		const value = form.value
		this.candidateName = value
	}

	handleSetChange = (e) => {
		const form = e.currentTarget
		const value = form.value
		this.candidateSets = value
	}

	handleRepChange = (e)=> {
		const form = e.currentTarget
		const value = form.value
		this.candidateReps = value	
	}

	addExercise = (e) => {
		this.xrcs.push(new ExerciseStore(this.candidateName, this.candidateSets, this.candidateReps))
	}


}

// A view for a 'day' or 'division' is contained in a program, contains exercises
@observer
class DayView extends React.Component {
	constructor(props) {
		super(props)
	}

	removeDivision = () => {
		this.props.removeDivision(this)
	}

	removeExercise = (xrc) => {
		this.props.day.xrcs.splice(this.props.day.xrcs.indexOf(xrc), 1)
	}
	render () {
		return (
			<div id="day-view"> 
				<h3>{this.props.day.label}</h3>
						<Form>
				{!this.props.diary_mode && <Form.Row>
						<Form.Group as={Col} controlId="formExerciseName" >
							<Form.Control placeholder="Enter Exercise Name" onChange={this.props.day.handleNameChange} type="text"/>
						</Form.Group>
						<Form.Group as={Col} controlId="formSets">
							<Form.Control placeholder="Enter Number Of Sets" onChange={this.props.day.handleSetChange} type="number"/>
						</Form.Group>
						<Form.Group as={Col} controlId="formReps">
							<Form.Control placeholder="Enter Number Of Repetitions" onChange={this.props.day.handleRepChange} type="number"/>
						</Form.Group>
						<Form.Group as={Col} controlId="formAddExercise">
							<Button onClick={this.props.day.addExercise}>Add Exercise</Button>
							<Button onClick={this.removeDivision}>Remove Division</Button>
						</Form.Group>
					</Form.Row>}
				</Form>
				<ListGroup>
					{this.props.day.xrcs.map(((x)=><ListGroup.Item key={x.name}><ExerciseView removeExercise={this.removeExercise} xrc={x}/></ListGroup.Item>))}
				</ListGroup>
			</div>
		)
	}
}

class ExerciseStore {
	@observable name = "Default Exercise Name"
	@observable sets = 0
	@observable reps = 0

	constructor(name, sets, reps){
		this.name = name
		this.sets = sets
		this.reps = reps
	}
}

// a view for a single exercise
@observer
class ExerciseView extends React.Component {
	constructor(props) {
		super(props)
	}

	removeExercise = () => {
		this.props.removeExercise(this)
	}

	render () {
		const xrc = this.props.xrc
		return (
			<InputGroup className="mb-1">
				<InputGroup.Text>{xrc.name} {xrc.sets}x{xrc.reps}</InputGroup.Text>
				<InputGroup.Append>
					<Button onClick={this.removeExercise}>Remove Exercise</Button>
				</InputGroup.Append>
			</InputGroup>
		)	
	}
}

const App = () => {
		return(
     <div>
		<DiaryView date={(new Date()).toLocaleDateString('fi-FI')}/>
     </div>
   )
}
export default App
