let highScore = 0;
let currentScore = 0;
let usedSnippets = new Set();

const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const memeScreen = document.getElementById('meme-screen');
const scoreDiv = document.getElementById('score');
const finalScoreDiv = document.getElementById('final-score');
const codeBlock = document.getElementById('code');
const optionsDiv = document.getElementById('options');
const resultDiv = document.getElementById('result');
const memeImage = document.getElementById('meme-image');

const languages = [
    "Python", "JavaScript", "Ruby", "Java", "C++", "Go", "PHP", "TypeScript",
    "Swift", "Kotlin", "R", "Perl", "Scala", "Objective-C", "Rust", "Haskell"
];

function showScreen(screen) {
    homeScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    memeScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

function startGame() {
    currentScore = 0;
    scoreDiv.innerText = `Score: ${currentScore}`;
    usedSnippets.clear(); // Reset used snippets
    showScreen(gameScreen);
    loadNewSnippet();
}

async function loadNewSnippet() {
    resultDiv.innerText = '';
    optionsDiv.innerHTML = '<p>Loading...</p>';
    codeBlock.innerText = 'Fetching code...';

    try {
        const { language, code } = await fetchRandomCode();
        if (language && code) {
            codeBlock.innerText = code;
            generateOptions(language);
        } else {
            throw new Error('Invalid snippet');
        }
    } catch (error) {
        console.error('Error fetching code snippet:', error);
        resultDiv.innerText = 'Failed to load code snippet. Generating a new one...';
        loadNewSnippet(); // Retry on failure
    }
}

async function fetchRandomCode() {
    let data, fileDict, file, language, code;
    let tries = 0;

    while (tries < 10) { // Limit the number of attempts to avoid infinite loops
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests

        const response = await fetch("https://api.github.com/gists");
        data = await response.json();
        fileDict = data[Math.floor(Math.random() * data.length)];
        file = fileDict.files[Object.keys(fileDict.files)[0]];
        language = file.language;
        code = await fetch(file.raw_url).then(res => res.text());

        if (language && code.trim().length > 0 && !["Text", "Markdown"].includes(language) && !usedSnippets.has(fileDict.id)) {
            usedSnippets.add(fileDict.id); // Mark snippet as used
            return { language, code };
        }
        tries++;
    }

    // Fallback in case of repeated attempts
    return { language: "Unknown", code: null };
}

function generateOptions(correctLanguage) {
    const correctIndex = Math.floor(Math.random() * 4);
    const options = new Set();
    options.add(correctLanguage); // Add the correct language first

    while (options.size < 4) {
        let randomLang = languages[Math.floor(Math.random() * languages.length)];
        if (!options.has(randomLang)) {
            options.add(randomLang);
        }
    }

    const optionsArray = Array.from(options);

    // Shuffle the options so the correct one isn't always in the same spot
    for (let i = optionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    optionsDiv.innerHTML = '';
    optionsArray.forEach(option => {
        const btn = document.createElement('button');
        btn.innerText = option;
        btn.classList = "px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600";
        btn.onclick = () => checkAnswer(option, correctLanguage);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        currentScore++;
        scoreDiv.innerText = `Score: ${currentScore}`;
        resultDiv.innerText = 'Correct!';
        resultDiv.classList = 'text-green-500';
        loadNewSnippet();
    } else {
        endGame();
    }
}

function endGame() {
    if (currentScore > highScore) {
        highScore = currentScore;
        highScoreDiv.innerText = `Highest Score: ${highScore}`;
    }
    finalScoreDiv.innerText = `Final Score: ${currentScore}`;
    showScreen(gameOverScreen);
}

function showMeme() {
    showScreen(memeScreen);
    memeImage.src = 'loading.gif';

    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function() {
        if (this.readyState === this.DONE) {
            try {
                const memes = JSON.parse(this.responseText);
                if (memes && memes.length > 0) {
                    const meme = memes[Math.floor(Math.random() * memes.length)];
                    memeImage.src = meme.image;
                } else {
                    throw new Error('No memes available');
                }
            } catch (error) {
                console.error('Error fetching memes:', error);
                memeImage.alt = 'Failed to load meme';
                memeImage.src = '';
            }
        }
    });

    xhr.open('GET', 'https://programming-memes-images.p.rapidapi.com/v1/memes');
    xhr.setRequestHeader('x-rapidapi-key', '1981fbdefbmsh5dfb78e053c850fp130ebajsn7cd83550e22c');
    xhr.setRequestHeader('x-rapidapi-host', 'programming-memes-images.p.rapidapi.com');

    xhr.send(data);
}

function backToMenu() {
    showScreen(homeScreen);
}

// Initialize game with the home screen
showScreen(homeScreen);
