// API - https://sv443.net/jokeapi/v2/

// VARIABLES
let tellJokeBtn = document.getElementById('tell-joke'),
	audio = document.getElementById('audio'),
	inputs = Array.from(document.getElementsByTagName('input'));

let jokeParams = {
	categories: [ 'programming' ], //default params
	blacklistFlags: [],
	jokeType: [ 'single' ]
};

// FUNCTIONS
function handleInputChange(e) {
	let key = this.parentElement.parentElement.previousElementSibling.getAttribute('data-type');

	if (this.checked && !jokeParams[key].includes(this.value)) jokeParams[key].push(this.value);
	else jokeParams[key] = jokeParams[key].filter((param) => param != this.value);

	//jokeType must have some value, so init to default
	if (key == 'jokeType' && jokeParams[key].length == 0) jokeParams[key].push('single');
}

function buildUrl(jokeParams) {
	let baseUrl = 'https://v2.jokeapi.dev/joke/';

	//categories
	if (jokeParams['categories'].length == 0) baseUrl += 'programming,dark,spooky,miscellaneous?';
	else if (jokeParams['categories'].length == 1) baseUrl += `${jokeParams['categories'][0]}?`;
	else {
		jokeParams['categories'].forEach((category) => (baseUrl += `${category},`));
		baseUrl = baseUrl.substring(0, baseUrl.length - 1);
		baseUrl += '?';
	}

	//flags
	if (jokeParams['blacklistFlags'].length == 1) baseUrl += `${jokeParams['blacklistFlags'][0]}&`;
	else if (jokeParams['blacklistFlags'].length > 1) {
		jokeParams['blacklistFlags'].forEach((flag) => (baseUrl += `${flag},`));
		baseUrl = baseUrl.substring(0, baseUrl.length - 1);
		baseUrl += '&';
	}

	//joke-type
	if (jokeParams['jokeType'].length == 1) baseUrl += `type=${jokeParams['jokeType'][0]}`;
	else baseUrl = baseUrl.substring(0, baseUrl.length - 1);

	return baseUrl;
}

async function getJoke(url) {
	try {
		let response = await fetch(url);
		return await response.json();
	} catch (err) {
		console.error(err);
	}
}

function sayJoke() {
	getJoke(buildUrl(jokeParams))
		.then((joke) => {
			if (joke.error) throw joke;
			else {
				//WEB SPEECH API
				let input = new SpeechSynthesisUtterance();
				if (joke.type == 'single') {
					console.log(`Joke: ${joke.joke}`);
					input.text = joke.joke;
					window.speechSynthesis.speak(input);
				} else {
					console.log(`Joke: ${joke.setup} \n ${joke.delivery}`);
					input.text = joke.setup;
					window.speechSynthesis.speak(input);
					input.text = joke.delivery;
					window.speechSynthesis.speak(input);
				}
			}
		})
		.catch((err) => console.error(err));
}

// EVENTS
window.onload = () => {
	buildUrl(jokeParams);
};

inputs.forEach((input) => {
	input.addEventListener('change', handleInputChange);
});

tellJokeBtn.addEventListener('click', sayJoke);
