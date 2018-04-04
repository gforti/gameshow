const socket = io()
const form = document.querySelector('.js-join')
const joined = document.querySelector('.js-joined')
const buzzer = document.querySelector('.js-buzzer')
const joinedInfo = document.querySelector('.js-joined-info')

const answers = document.querySelector('.js-answers')
const choices = document.querySelector('.js-choices')
const lock = document.querySelector('.js-lock')

let user = {}

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.team) {
    form.querySelector('[name=team]').value = user.team
  }
}
const saveUserInfo = () => {
  localStorage.setItem('user', JSON.stringify(user))
}

lock.addEventListener('click', lockChoice)

form.addEventListener('submit', (e) => {
  e.preventDefault()
  user.team = form.querySelector('[name=team]').value
  socket.emit('join', user)
  saveUserInfo()
  joinedInfo.innerText = `Team ${user.team}`
  form.classList.add('hidden')
  joined.classList.remove('hidden')
})

buzzer.addEventListener('click', (e) => {
  socket.emit('buzz', user)
  window.navigator.vibrate(300)
})


socket.on('first', (data) => {
    console.log(data)
  if ( user.team === data.first) {
      buzzer.classList.add('first')
      displayChoices(data)
  }
})

socket.on('clear', () => {
    buzzer.classList.remove('first')
    closeChoice()
})


getUserInfo()



 function displayChoices(data) {

    choices.innerHTML = ''
    if ( data.choices && data.choices.length && user.team === data.first ) {
        lock.disabled = false
        answers.classList.remove('hidden')
        buzzer.classList.add('hidden')
        let html = '<ul class="view-answers">';

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
         html += '</ul>'
         choices.innerHTML = html
         attachChoiceEvent()
    }
}

function attachChoiceEvent(){
    let answer = document.querySelectorAll('input[name="answer"]')
    answer.forEach( (input) =>{
        input.addEventListener('click', function() {
            console.log(this.value)
            socket.emit('selection', this.value)
        })
    })

}


function lockChoice(){
    let answer = document.querySelector('input[name="answer"]:checked')

    if (answer) {
        answer = answer.value
        lock.disabled = true
        socket.emit('lock', answer)
        document.querySelectorAll('input[name="answer"]').forEach( (input) =>{
            input.disabled = true
        })

        // closeChoice()
    }

}

 function closeChoice() {
    answers.classList.add('hidden')
    buzzer.classList.remove('hidden')
    choices.innerHTML = ''
}