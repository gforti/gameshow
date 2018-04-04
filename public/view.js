const socket = io()

const question = document.querySelector('.view-question')
const answers = document.querySelector('.view-answers')
const timer = document.querySelector('.timer')
const info = document.querySelector('.js-info')
const intro = document.querySelector('.js-intro')
const container = document.querySelector('.js-container')
const card = document.querySelector('.js-card')
const cardBack = document.querySelector('.js-back')

let correctAnswer
let clockTimer = null
let timeLeft = 0
let pauseTime = false
let showBuzzTeam = false

socket.on('buzzes', (buzzes) => {

  if (showBuzzTeam && buzzes.length) {
    showBuzzTeam = false
    info.innerHTML = `Team ${buzzes[0]}`
    info.classList.add('info-display')
  }


})

socket.on('question', (data) => {
    console.log(data)
    showBuzzTeam = true

    info.classList.remove('info-display')
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
    const choices = document.querySelectorAll('li[data-choice]')
    choices.forEach( (input) => {
        input.classList.remove('highlight')
        if ( input.dataset.choice === choice) {
            input.classList.add('highlight')
        }
    })
})

socket.on('answerlock', (answerChosen) => {
    if (timeLeft > 0) {
        const choice = document.querySelector('li.highlight')
        choice.classList.add('locked')
        pauseTime = true
     }
})




function displayChoices(data) {

    answers.innerHTML = ''
    question.innerHTML = ''
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
    clockTimer = setInterval(countdown, 1000)
}

function countdown() {
    if (timeLeft <= 0) {
        clearInterval(clockTimer)
        return
    }
    if (!pauseTime) {
        timeLeft--
        timer.innerHTML = timeLeft
    }

}