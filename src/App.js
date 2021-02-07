import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Clarifai from 'clarifai'
import './App.css';

const app = new Clarifai.App({
	apiKey:'b75a01ec52094fec882aa5d86caaf143'
});

const particlesOpts = {
	particles:{
		number:{
			value: 100,
			density:{
				enable:true,
				value_area:800
			}
		}
	}
}

class App extends Component {

	constructor(){
		super();

		this.state = {
			input:'',
			imageUrl:'',
			box:'', // Contains the values we recieve from API
			route:'signin', // Keeps track of where we are
			isSignedIn: false
		}
	}

	calculateFaceLocation = (data) =>{
		// TODO: Work for multiple faces
		const clarifaiFaceBox = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');

		const width = Number(image.width);
		const height = Number(image.height);
		// console.log('Image Dim', width+"x"+height);

		return {
			leftCol:clarifaiFaceBox.left_col * width,
			topRow:clarifaiFaceBox.top_row * height,
			rightCol: width - (clarifaiFaceBox.right_col *width),
			bottomRow: height - (clarifaiFaceBox.bottom_row * height)
		}

	}

	displayFaceBox = (box) =>{
		// console.log(box);
		this.setState({box:box});
	}

	onInputChange = (event) =>{
		this.setState({input:event.target.value});
	}

	onButtonSubmit = () =>{
		this.setState({imageUrl:this.state.input});

		// If the model isnt working change it to that
		// .predict('c0c0ac362b03416da06ab3fa36fb58e3', this.state.input)
		app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
		.then(response => this.displayFaceBox( this.calculateFaceLocation(response) ))
		.catch(error => console.log('Something happened',error));
	}

	onRouteChange = (route) =>{
		if(route === 'signout'){
			this.setState({isSignedIn:false});
		}else if( route == 'home'){
			this.setState({isSignedIn:true});
		}
		this.setState({route: route});
	}

	render(){
		const {isSignedIn, imageUrl, route, box} = this.state;
		return (
			<div className="App">
				<Particles className='particles'
					params={particlesOpts} 
				/>
				<Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
				{ route === 'home' 
					?<div>
						<Logo/>
						<Rank/>
						<ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
						<FaceRecognition box={box} imageUrl={imageUrl}/>
					</div> 
					:(
						route === 'signin'
						? <SignIn onRouteChange={this.onRouteChange}/>
						: <Register onRouteChange={this.onRouteChange}/>
					) 
				}
			</div>
		);
	}
  
}

export default App;
