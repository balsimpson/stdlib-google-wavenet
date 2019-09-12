const fs = require('fs');
const util = require('util');

const GOOGLE_WAVENET_KEY = process.env.GOOGLE_WAVENET_KEY;

let voice_options = {
  janjaap: {
    language: 'nl-Nl',
    gender: 'male',
    wav: 'nl-Nl-Wavenet-B'
  },
  kees: {
    language: 'nl-Nl',
    gender: 'male',
    wav: 'nl-Nl-Wavenet-C'
  },
  sjaan: {
    language: 'nl-Nl',
    gender: 'female',
    wav: 'nl-Nl-Wavenet-D'
  },
  bep: {
    language: 'nl-Nl',
    gender: 'Female',
    wav: 'nl-Nl-Wavenet-E'
  },
  miep: {
    language: 'nl-Nl',
    gender: 'female',
    wav: 'nl-Nl-Wavenet-A'
  },
	russel: {
		language: 'en-AU',
		gender: 'male',
		wav: 'en-AU-Wavenet-B'
	},
	thomas: {
		language: 'en-AU',
		gender: 'male',
		wav: 'en-AU-Wavenet-D'
	},
	nicole: {
		language: 'en-AU',
		gender: 'female',
		wav: 'en-AU-Wavenet-A'
	},
	mary: {
		language: 'en-AU',
		gender: 'female',
		wav: 'en-AU-Wavenet-C'
	},
	brian: {
		language: 'en-GB',
		gender: 'male',
		wav: 'en-GB-Wavenet-B'
	},
	paul: {
		language: 'en-GB',
		gender: 'male',
		wav: 'en-GB-Wavenet-D'
	},
	emma: {
		language: 'en-GB',
		gender: 'female',
		wav: 'en-GB-Wavenet-A'
	},
	amy: {
		language: 'en-GB',
		gender: 'female',
		wav: 'en-GB-Wavenet-C'
	},
	mathew: {
		language: 'en-US',
		gender: 'male',
		wav: 'en-US-Wavenet-B'
	},
	justin: {
		language: 'en-US',
		gender: 'male',
		wav: 'en-US-Wavenet-D'
	},
	joanna: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-A'
	},
	Ivy: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-C'
	},
	kimberly: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-E'
	},
	salli: {
		language: 'en-US',
		gender: 'female',
		wav: 'en-US-Wavenet-F'
	}
}

let voice_names = [
	"russel",
	"thomas",
	"nicole",
	"mary",
	"brian",
	"paul",
	"emma",
	"amy",
	"mathew",
	"justin",
	"joanna",
	"Ivy",
	"kimberly",
	"salli"
]

const makeHttpCall = async (options) => {
	try {
		return new Promise((resolve) => {
			var req = https.request(options, res => {
				res.setEncoding('utf8');
				var returnData = "";
				res.on('data', chunk => {
					returnData = returnData + chunk;
				});
				res.on('end', () => {
					let results = JSON.parse(returnData);
					resolve(results);
				});
			});
			if (options.method == 'POST' || options.method == 'PATCH') {
				req.write(JSON.stringify(options.body));
			}
			req.end();
		})
	} catch (error) {
		return `error: ` + error;
	}
}

// Get a random item
const randomItem = (arrayOfItems) => {
	let i = 0;
	i = Math.floor(Math.random() * arrayOfItems.length);
	return (arrayOfItems[i]);
};

const getVoice = (voice) => {
	voice = (voice == 'random') ? randomItem(voice_names) : voice;
	let chosen = voice_options[voice];
	let data = {
		languageCode: chosen.language,
		gender: chosen.gender,
		voice: chosen.wav
	}
	return data;
}

const getAudioFile = async (txt, data) => {
	
	let options = {
		host: 'texttospeech.googleapis.com',
		port: 443,
		path: '/v1/text:synthesize',
		headers: {
			'Content-Type': 'application/json',
			"charset": 'utf-8',
			"X-Goog-Api-Key": GOOGLE_WAVENET_KEY
		},
		body: {
			'input': {
				'ssml': `<speak>${txt}</speak>`
			},
			'voice': {
				'languageCode': data.languageCode,
				'name': data.voice,
				'ssmlGender': data.gender
			},
			'audioConfig': {
				// "sampleRateHertz": 48000,
				"speakingRate": "0.90",
				'audioEncoding': 'MP3'
			}
		},
		method: 'POST'
	};

	let resp = await makeHttpCall(options);
	// console.log(`resp: ${JSON.stringify(resp, null, 2)}`);
	if (resp.error) {
		return { error: resp.error.message };
	} else {
		return resp.audioContent;
	}
}

const outputFile = '/tmp/audiofile.mp3';
/**
* Serve MP3
* @param {string} text Text to covert
* @param {string} voice Voice to use
* @returns {object.http}
*/
module.exports = async (text = 'It is a great day today!', voice = 'emma') => {
  let data = getVoice(voice);
  let result = await getAudioFile(text, data);
  const audioFile = Buffer.from(result, 'base64');
  
  return {
        headers: {'content-type': 'audio/mp3'},
        body: audioFile
      };
};