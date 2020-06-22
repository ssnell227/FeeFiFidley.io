require('dotenv').config()

const express = require('express'),
    massive = require('massive'),
    session = require('express-session'),
    axios = require('axios'),
    cors = require('cors'),
    http = require('http')

const authCtrl = require('./controllers/authControl'),
    gameCtrl = require('./controllers/gameControl'),
    spotifyCtrl = require('./controllers/spotifyControl'),
    { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET} = process.env

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
require('./sockets')(io)

app.use(express.json())
app.use(cors())
app.use(session({
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    secret: SESSION_SECRET
}))

massive({
    connectionString: CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
})
    .then(db => {
        app.set('db', db)
        console.log('db connected')
    })
    .catch(err => {
        console.log('Could not connect to db:')
        console.log(err)
        process.end()
    })

server.listen(SERVER_PORT, () => console.log(`Listening on ${SERVER_PORT}`))





//auth endpoints

app.post('/api/auth/register', authCtrl.register)

app.post('/api/auth/login', authCtrl.login)

app.post('/api/auth/logout', authCtrl.logout)

//game endpoints

app.post('/api/game/newGame', gameCtrl.newGame)

app.put('/api/game/updateGame', gameCtrl.updateGame)

app.get('/api/game/getUserHighScores/:userId', gameCtrl.getUserHighScores)

app.delete('/api/game/deleteGame', gameCtrl.deleteGame)

//spotify endpoints

app.post('/api/spotify/getPlaylist', spotifyCtrl.getPlaylist)

app.post('/api/spotify/getPlaylistItems', spotifyCtrl.getPlaylistItems)

