const socket = io()

const question = document.querySelector('.view-question')
const answers = document.querySelector('.view-answers')
const timer = document.querySelector('.timer')
const info = document.querySelector('.js-info')
const intro = document.querySelector('.js-intro')
const container = document.querySelector('.js-container')
const card = document.querySelector('.js-card')
const cardBack = document.querySelector('.js-back')

let correctAnswer = ''
let chosenAnswer = ''
let clockTimer = null
let timeLeft = 0
let pauseTime = false
let showBuzzTeam = false
let questionReady = false
let soundFXOn = true

let s_correct = new Audio(`fx/correct.mp3`)
let s_wrong = new Audio(`fx/wrong.wav`)
let s_select = new Audio(`fx/select.wav`)
let s_buzz = new Audio(`fx/buzz4.wav`)

socket.on('buzzes', (buzzes) => {
    if (isQuestionClosed()) return
  if (showBuzzTeam && buzzes.length) {
    showBuzzTeam = false
    info.innerHTML = `Team ${buzzes[0]}`
    info.classList.add('info-display')
    if (soundFXOn) s_buzz.play()
  }

})

socket.on('clear', () => {
    if (!chosenAnswer.length) {
        const choice = document.querySelector('li.highlight')
        info.classList.remove('info-display')
        if (choice) choice.classList.remove('highlight')
        showBuzzTeam = true
        info.innerHTML = ''
    }
})

socket.on('intro', () => {
    questionClose(false)
    intro.classList.remove('hidden')
    container.classList.add('hidden')
    
})

socket.on('question', (data) => {
    introTrack.pause()
    showBuzzTeam = true
    info.classList.remove('info-display')
    info.classList.remove('wrong')
    info.classList.remove('correct')
    cardBack.classList.add('hide')
    intro.classList.add('hidden')
    container.classList.remove('hidden')


    card.classList.remove('flipped')

    displayChoices(data)
    setTimer()
    setTimeout(startTimer, 2500)


    setTimeout(()=>{
        cardBack.classList.remove('hide')
    }, 1000)
    setTimeout(()=>{
        card.classList.add('flipped')
    }, 1500)


})

socket.on('answerSelected', (choice) => {
    if (isQuestionClosed()) return
    highlightChoice(choice)
})

function highlightChoice(choice) {
    const choices = document.querySelectorAll('li[data-choice]')
    choices.forEach( (input) => {
        input.classList.remove('highlight')
        if ( input.dataset.choice === choice) {
            input.classList.add('highlight')
        }
    })
}

socket.on('answerlock', (answerChosen) => {
    if (isQuestionClosed()) return
    highlightChoice(answerChosen)
    if (timeLeft > 0) {
        const choice = document.querySelector('li.highlight')
        choice.classList.add('locked')
        pauseTime = true
        chosenAnswer = answerChosen
        questionClose()
        if(soundFXOn) s_select.play()
     }
})

function isQuestionClosed() {
    return !!(chosenAnswer.length || timeLeft <= 0 || !questionReady)
}

socket.on('pauseQuestion', (timeState) => {
    if (timeLeft > 0 && clockTimer) {
        pauseTime = timeState
     }
})

socket.on('musicToggle', (musicStop) => {
    if (musicStop) {
        stopTrack()
    } else {
        playTrack()
    }
})

socket.on('musicVolume', (musicVol) => {    
    tracks.forEach((track) => {
        track.volume = musicVol
    })
})

socket.on('soundFXToggle', (soundFX) => {    
    soundFXOn = soundFX
})





function displayChoices(data) {

    info.innerHTML = ''
    answers.innerHTML = ''
    question.innerHTML = ''
    chosenAnswer = ''
    if ( data.choices && data.choices.length ) {
        correctAnswer = data.answer
        timeLeft = data.time
        question.innerHTML = data.question
        let html = '<ul>';
        data.choices.forEach( (answer, i) => {
            html += `<li data-choice="${answer}"><span>${answer}</span></li>`
        })
        html += '</ul>'
        answers.innerHTML = html
    }
}

function setTimer() {
    clearInterval(clockTimer)
    timer.innerHTML = timeLeft
    pauseTime = false
}

function startTimer() {
    socket.emit('questionReady')
    questionReady = true
    clockTimer = setInterval(countdown, 1000)
}

function countdown() {
    if (timeLeft <= 0) {
        questionClose()
        return
    }
    if (!pauseTime) {
        timeLeft--
        timer.innerHTML = timeLeft
    }

}

function questionClose(show = true) {
    clearInterval(clockTimer)
    questionReady = false
    socket.emit('questionClose')
    info.classList.add('info-display')
    if (show)
        setTimeout(showCorrectAnswer, 3000)
}

function showCorrectAnswer() {

    const choices = document.querySelectorAll('li[data-choice]')
    choices.forEach( (input) => {
        if ( input.dataset.choice === correctAnswer) {
            input.classList.add('correct')
        }
    })

    if ( correctAnswer.length &&  chosenAnswer.length && chosenAnswer === correctAnswer) {
        info.innerHTML = `Correct`
        info.classList.add('correct')
        if(soundFXOn) s_correct.play()
    } else {
        info.innerHTML = `Incorrect`
        info.classList.add('wrong')
        if(soundFXOn) s_wrong.play()
    }

}



let introTrack = new Audio(`tracks/intro.mp3`)
let tracks = [];
for (let i = 1; i <= 3; i++)
tracks.push(new Audio(`tracks/track${i}.mp3`))

tracks.sort(function() {return 0.5 - Math.random()})

let currentTrack = 0
let allTracks = x = tracks.length

while (x--) {
    tracks[x].addEventListener('ended',playNextTrack)
    tracks[x].volume = 0.1
}


function stopTrack() {
    tracks[currentTrack].pause()
}

function playTrack() {
    tracks[currentTrack].play()
}

function playNextTrack() {
     currentTrack = (currentTrack + 1) % allTracks
     playTrack()
}


// window.addEventListener('DOMContentLoaded', ()=>{introTrack.play()})

