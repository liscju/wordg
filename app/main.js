// Model

recents = {
    paths: [],
    add: function(path) {
        idx = this.paths.indexOf(path);
        if (idx != -1)
            this.paths.splice(idx, 1);

        this.paths.unshift(path);
        this.removeExpired();
    },
    remove: function(path) {
        idx = this.paths.indexOf(path);
        if (idx != -1)
            this.paths.splice(idx, 1);
    },
    load: function(pathz) {
        this.paths = pathz;
        this.removeExpired();
    },
    removeExpired: function() {
        while (this.paths.length > 4) {
            this.paths.pop();
        }
    }
}

function filename(path) {
    return path.split('\\').pop().split('/').pop();
}

function words(str) {
    const lines = str.split(/\r\n|\n|\r/);
  
    const result = [];
    const regex = /^"?(.*?)"?\s*-\s*"?(.+?)"?$/;
  
    lines.forEach(line => {
      const match = line.match(regex);
      if (match) {
        const left = match[1].trim();
        const right = match[2].trim();
        result.push([left, right]);
      }
    });
  
    return result;
}

translations = null;

function Translations(wordz) {
    const len = wordz.length;
    return {
        words: wordz,
        curr: 0,
        answered: 0,
        all: len,
        question: function() {
            return this.words[this.curr][0];
        },
        answer: function() {
            return this.words[this.curr][1];
        },
        next: function() {
            this.curr = Math.floor(Math.random() * this.words.length);
        },
        submit: function(word) {
            word = word.toLowerCase();
            expected = this.words[this.curr][1].toLowerCase();
            if (word == expected) {
                this.words.splice(this.curr, 1);
                this.answered = this.answered + 1;
                return true;
            } else
                return false;
        },
        ended: function() {
            return this.words.length == 0;
        }
    }
}

// View

const questionProgress = document.getElementById('question-progress');
const questionCheck = document.getElementById('question-check');
const questionText = document.getElementById('question-text');
const questionAnswer = document.getElementById('question-answer');
const questionClose = document.getElementById('question-close');
const result = document.getElementById('result');
const resultHeader = document.getElementById('result-header');
const resultIcon = document.getElementById('result-icon');
const resultClose = document.getElementById('result-close');
const resultQuestion = document.getElementById('result-question');
const resultAnswer = document.getElementById('result-answer');
const congrats = document.getElementById('congrats');
const congratsClose = document.getElementById('congrats-close');
const open = document.getElementById('open');
const openButton = document.getElementById('open-button');
const quizClose = document.getElementById('quiz-close');
const quizCloseNo = document.getElementById('quiz-close-no');
const quizCloseYes = document.getElementById('quiz-close-yes');

openButton.addEventListener('click', function(event) {
    wordg.openDialog();
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

openButton.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        wordg.closeApplication();
        // prevents triggering click while focusing on elements
        // in newTranslation
        event.preventDefault();
    }
});

wordg.onFileOpened((path, content) => {
    recents.add(path);
    wordg.storeSettings({
        recents: recents.paths
    });
    translations = new Translations(words(content));
    newTranslation();
});

wordg.onSettingsLoaded((settings) => {
    recents.load(settings.recents);
    showRecentFiles();
});

wordg.onFileReadError((path) => {
    recents.remove(path);
    wordg.storeSettings({
        recents: recents.paths
    });
    showRecentFiles();
});

questionCheck.addEventListener('click', function(event) {
    checkTranslation();
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

questionAnswer.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        checkTranslation();
        // prevents triggering click while focusing on elements
        // in newTranslation
        event.preventDefault();
    } else if (event.key == 'Escape') {
        showQuestionClose();
        // prevents triggering click while focusing on elements
        // in newTranslation
        event.preventDefault();
    } else {
        return
    }
});

questionClose.addEventListener('click', function(event) {
    showQuestionClose();
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

quizCloseNo.addEventListener('click', function(event) {
    hideQuestionClose();
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

quizCloseYes.addEventListener('click', function(event) {
    hideQuestionClose();
    openTranslation();
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

quizCloseYes.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        hideQuestionClose();
        openTranslation();
    } else if (event.key === 'Escape'){
        hideQuestionClose();
    }
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

resultClose.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        newTranslation();
        // prevents triggering click while focusing on elements
        // in newTranslation
        event.preventDefault();
    }
});

resultClose.addEventListener('click', function(event) {
    if (translations.ended()) {
        showCongratulations();
    } else {
        newTranslation();
    }
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

congratsClose.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        openTranslation();
    }
    // prevents triggering click while focusing on elements
    // in newTranslation
    event.preventDefault();
});

// Controller

function openTranslation() {
    wordg.loadSettings();

    congrats.style.visibility = 'hidden';

    question.style.visibility = 'hidden';
    question.style.display = 'none';
    
    open.style.visibility = 'visible';
    open.style.display = 'flex';

    openButton.focus();
}

function showRecentFiles() {
    const openRecentList = document.getElementById('open-recent-list');
    openRecentList.innerHTML = '';
    i = 0;
    recents.paths.forEach(path => {
        const li = document.createElement('li');
        li.tabIndex = i;
        i++;
        li.textContent = filename(path);
        li.addEventListener('click', () => {
            wordg.openFile(path);
        });
        li.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                wordg.openFile(path);
            }
        })
        openRecentList.appendChild(li);
    });
}

function showQuestionClose() {
    quizClose.style.visibility = 'visible';
    quizClose.style.display = 'flex';
    quizCloseYes.focus();
}

function hideQuestionClose() {
    quizClose.style.visibility = 'hidden';
    quizClose.style.display = 'none';
    questionAnswer.focus();
}

function newTranslation() {
    translations.next();

    resultQuestion.innerHTML = '';
    resultAnswer.innerHTML = '';

    questionProgress.innerHTML = translations.answered + "/" + translations.all;

    open.style.visibility = 'hidden';
    open.style.display = 'none';

    question.style.visibility = 'visible';
    question.style.display = 'block';

    questionText.innerHTML = translations.question();
    questionAnswer.value = '';
    questionAnswer.focus();

    result.style.visibility = 'hidden';
}

function checkTranslation() {
    resultQuestion.innerHTML = translations.question();
    resultAnswer.innerHTML = translations.answer();

    questionAnswer.blur();

    resultHeader.className = '';
    resultIcon.className = '';
    resultClose.className = '';
    if (translations.submit(questionAnswer.value)) {
        resultHeader.classList.add('result-header-success');
        resultIcon.classList.add('result-icon-success');
        resultClose.classList.add('result-close-success');
    } else {
        resultHeader.classList.add('result-header-error');
        resultIcon.classList.add('result-icon-error');
        resultClose.classList.add('result-close-error');
    }

    questionProgress.innerHTML = translations.answered + "/" + translations.all;
    
    result.style.visibility = 'visible';
    resultClose.focus();
}

function showCongratulations() {
    congrats.style.visibility = 'visible';
    result.style.visibility = 'hidden';
    congratsClose.focus();
}

// main

openTranslation();
