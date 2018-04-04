const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const open = require("open")

const app = express();
const server = http.Server(app);
const io = socketio(server);

var port = process.env.PORT || 3000
const host_ip = require('./host-ip')
var gameUrl = `http://${host_ip}:${port}`

const title = 'Game Show Trivia'

let questions = require('./round1')

let data = {
  users: new Set(),
  buzzes: new Set(),
  first: '',
  currentQuestion: 0,
  totalQuestions:0
}

data.totalQuestions = questions.length

const getData = () => Object.keys(data).reduce((d, key) => {
  d[key] = data[key] instanceof Set ? [...data[key]] : data[key]
  return d
}, {})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title, gameUrl }, getData())))
app.get('/view', (req, res) => res.render('view', {}))

io.on('connection', (socket) => {

  socket.on('join', (user) => {
    data.users.add(socket.id)
    io.emit('active', [...data.users].length)
    if(data.first){
        socket.emit('first', data.first);
    }
    console.log(`${user.team} joined!`)
  })

  socket.on('buzz', (user) => {
    if (!data.first) {
        data.first = user.team
        socket.emit('first', Object.assign({}, questions[data.currentQuestion], getData()))
    }
    data.buzzes.add(`${user.team}`)
    io.emit('buzzes', [...data.buzzes])
    console.log(`${user.team} buzzed in!`)
  })

  socket.on('clear', () => {
    data.buzzes = new Set()
    data.first = ''
    io.emit('buzzes', [...data.buzzes])
    io.emit('clear', null)
    console.log(`Clear buzzes`)
  })


  socket.on('showQuestion', () => {
    data.currentQuestion = (data.currentQuestion + 1) % data.totalQuestions
    io.sockets.emit('question', Object.assign({}, questions[data.currentQuestion], getData()))
  })

  socket.on('selection', (choice) => {
    io.sockets.emit('answerSelected', choice)
  })

  socket.on('lock', (answerChosen) => {
    io.sockets.emit('answerlock', answerChosen)
  })


  socket.on('disconnect', () => {
    data.users.delete(socket.id)
    io.emit('active', [...data.users].length)
  });


})

server.listen(port, () => {
    console.log('Listening on ', gameUrl)
    // open(`${gameUrl}/host`)
})
