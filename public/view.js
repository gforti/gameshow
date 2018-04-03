const socket = io()

const question = document.querySelector('.view-question')
const answers = document.querySelector('.view-answers')
const timer = document.querySelector('.timer')

let correctAnswer
let clockTimer = null
let timeLeft = 0
let pauseTime = false

socket.on('question', (data) => {
    console.log(data)
    displayChoices(data)
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

socket.on('answerlock', (correct) => {

})


function displayChoices(data) {

    answers.innerHTML = ''
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
        startTimer()
    }
}



function startTimer() {
    clearInterval(clockTimer)
    timer.innerHTML = timeLeft
    pauseTime = false
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