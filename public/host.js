const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const clear = document.querySelector('.js-clear')
const question = document.querySelector('.js-question')
const pause = document.querySelector('.pause')
const logo = document.querySelector('.js-logo')
const music = document.querySelector('.js-music')
const selection = document.querySelector('.js-selection')
const soundFX = document.querySelector('.js-fx')
const currentQuestionNumber = document.querySelector('.js-total-questions span')

const answers = document.querySelector('.js-answers')
const choices = document.querySelector('.js-choices')
const lock = document.querySelector('.js-lock')
const viewquestion = document.querySelector('.view-question')
const musicVol = document.querySelector('input[name="musicVol"]')


lock.addEventListener('click', lockChoice)
musicVol.addEventListener('change', updateMusicVol)

let pauseTime = false
let pauseMusic = true
let pauseSoundFX = true
let allowSelection = false


socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} joined`
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(team => `<li>Team ${team}</li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
})

logo.addEventListener('click', () => {
  socket.emit('logo')
})


pause.addEventListener('click', pauseTimer)
music.addEventListener('click', toogleMusic)
soundFX.addEventListener('click', toogleSoundFX)
selection.addEventListener('click', toogleSelection)
question.addEventListener('click', showQuestion)


function resetPause() {
    pauseTime = false
    pause.classList.remove('is-paused')
}

function pauseTimer() {
    pauseTime = !pauseTime
    socket.emit('pauseTime', pauseTime)
    if (pauseTime) {
        pause.classList.add('is-paused')
    } else {
        pause.classList.remove('is-paused')
    }
}

function toogleMusic() {
    pauseMusic = !pauseMusic
    socket.emit('pauseMusic', pauseMusic)
    if (pauseMusic) {
        music.classList.add('is-paused')
    } else {
        music.classList.remove('is-paused')
    }
}

function toogleSoundFX() {
    pauseSoundFX = !pauseSoundFX
    socket.emit('pauseSoundFX', pauseSoundFX)
    if (pauseSoundFX) {
        soundFX.classList.remove('is-paused')
    } else {
        soundFX.classList.add('is-paused')
    }
}

function updateMusicVol() {
   
    socket.emit('volMusic', musicVol.value*0.01)
    
}

function toogleSelection() {
    allowSelection = !allowSelection
    socket.emit('allowSelection', allowSelection)
    if (allowSelection) {
        selection.classList.remove('is-paused')
    } else {
        selection.classList.add('is-paused')
    }
}

function showQuestion() {
    logo.disabled = true
    question.disabled = true
    resetPause()
    socket.emit('showQuestion')
    socket.emit('questionClose')
}


socket.on('enableBuzzer', () => {
   enableChoice()
})

socket.on('disableBuzzer', () => {
   disableChoice()
})



socket.on('question', (data) => {
    displayChoices(data)
})


 function displayChoices(data) {

    choices.innerHTML = ''
    viewquestion.innerHTML = ''
    if ( data.choices && data.choices.length ) {
        lock.disabled = false
        viewquestion.innerHTML = data.question
        let html = '<ul class="view-answers host">';
        currentQuestionNumber.innerHTML = ~~data.currentQuestion+1
        data.choices.forEach( (answer, i) => {
            html += `<li>
                    <input  type="radio"
                            name="answer"
                            value="${answer}"
                            id="${answer}"
                    > <label for="${answer}" class="label">
                    ${answer}
                </label></li>`
         })
         html += `</ul> <p> <big>Answer: ${data.answer}</big></p>`
         choices.innerHTML = html

    }
}

function lockChoice(){
    let answer = document.querySelector('input[name="answer"]:checked')

    if (answer) {
        answer = answer.value
        disableChoice()
        socket.emit('lock', answer)
    }

}

function disableChoice() {
    lock.disabled = true    
    document.querySelectorAll('input[name="answer"]').forEach( (input) =>{
        input.disabled = true
    })
}

function enableChoice() {
    lock.disabled = false
    logo.disabled = false
    question.disabled = false
    document.querySelectorAll('input[name="answer"]').forEach( (input) =>{
        input.disabled = false
    })
}