/*--------------------------------*/
/*PACKAGES REQUIRED*/
/*--------------------------------*/

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sha256 = require('sha256');
const path = require('path');
const app = express();
const https = require('https');
const fetch = require('node-fetch');
const { response } = require('express');

/*--------------------------------*/
/*BASIC SETUP*/
/*--------------------------------*/

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/quizDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

/*--------------------------------*/
/*GLOBAL VARIABLES*/
/*--------------------------------*/

var playerInfo = {
	name: '',
	bestScore: 0,
	topicSelected: '',
	amountVal: 0,
};

var correctAnswers = [];
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}
var set = [];
/*--------------------------------*/
/*SCHEMAS AND MODELS*/
/*--------------------------------*/

const personSchema = {
	Name: {
		type: String,
		require: [true],
	},
	Email: {
		type: String,
		require: [true],
	},
	Ph: {
		type: Number,
	},
	password: {
		type: String,
		require: [true],
	}
};

const person = mongoose.model('person', personSchema);

/*--------------------------------*/
/*REQUET RELATED TO HOMEPAGE */
/*--------------------------------*/

app.get('/', function (req, res) {
	res.render('index', { messageIn: '', messageUp: '' });
});

app.post('/', function (req, res) {
    
	if (req.body.inName) {
		person.find({ Name: req.body.inName }, function (err, foundUser) {
			if (foundUser.length) {
				if (sha256(req.body.inPassword) == foundUser[0].password) {
					res.redirect('/option');
					playerInfo.name = req.body.inName;
				} else
					res.render('index', {
						messageIn: 'Check Your Credentials',
						messageUp: '',
					});
			} else res.render('index', { messageIn: 'Check Your userName', messageUp: '' });
		});
	} else if (req.body.upName) {
		person.find({ Name: req.body.upName }, function (err, foundUser) {
			if (foundUser.length)
				res.render('index', {
					messageIn: '',
					messageUp: 'Username already exist',
				});
			else {
				if (req.body.upPassword == req.body.upCPassword) {
					const p = new person({
						Name: req.body.upName,
						Email: req.body.upEmail,
						password: sha256(req.body.upPassword),
						Ph: req.body.upContact,
						bestScore: 0,
					});
                    p.save();
                    playerInfo.name = req.body.upName;
                    playerInfo.bestScore=0;
					res.redirect('/option');
					
				} else
					res.render('index', {
						messageIn: '',
						messageUp: "Password didn't match",
					});
			}
		});
    }
    
});


/*--------------------------------*/
/*REQUEST RELATED TO OPTION PAGE*/
/*--------------------------------*/

app.get('/option', function (req, res) {
            res.render("option");    
    });    
app.post('/option', async function (req, res) {
	var categoryVal = String(req.body.category);
	var amountVal = String(req.body.amount);
	var diffVal = String(req.body.difficulty);
	playerInfo.amountVal = req.body.amount;

	await fetch(
		'https://opentdb.com/api.php?amount=' +
			amountVal +
			'&category=' +
			categoryVal +
			'&difficulty=' +
			diffVal +
			'&type=multiple'
	)
		.then((response) => response.json())
		.then((data) => {
			for (var i = 0; i < amountVal; i++) {
				var ques = data.results[i].question;
				var opt = [
					data.results[i].correct_answer,
					...data.results[i].incorrect_answers,
				];
				shuffleArray(opt);
				correctAnswers[i] = data.results[i].correct_answer;
				var x = correctAnswers[i];
				var temp = {
					question: ques,
					options: opt,
					label: `item${i}`,
				};
				set[i] = temp;
			}
			playerInfo.topicSelected = data.results[0].category;
        });
	res.redirect('/quiz');
});

/*--------------------------------*/
/*REQUEST RELATED TO QUIZ PAGE*/
/*--------------------------------*/

app.get('/quiz', function (req, res) {
	res.render('quiz', {
		question: set,
		topic: playerInfo.topicSelected,
        currentScore:0,
		Name: playerInfo.name,
	});
});

app.post('/response', function (req, res) {
	var c = 0;
	for (var i = 0; i < playerInfo.amountVal; i++)
		if (req.body[`${i}`] == correctAnswers[i]) c++;
	result = Number(((c / Number(playerInfo.amountVal)) * 100).toPrecision(3));
    res.render('quiz', {
        question: set,
        topic: playerInfo.topicSelected,
        currentScore: result,
        Name: playerInfo.name,
    });      
});


/*--------------------------------*/
/*SERVER */
/*--------------------------------*/

app.listen(3000, function () {
	console.log('Server started on port 3000');
});
