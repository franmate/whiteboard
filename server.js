const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const compression = require('compression')
const PORT = process.env.PORT || 3000
let dataArrays = [[], []]

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(compression({
    level: 6,
    threshold: 0,
}))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)

        dataArrays[0].push(socket.id)
        dataArrays[1].push(roomId)

        let nameAndRoom = socket.id + " " + roomId
        io.to(socket.id).emit('name room', nameAndRoom)
        // socket.to(roomId).emit('user-connected', userId)
     
        socket.on('drawing', function (canvasJson) {
            socket.to(roomId).emit('drawing', canvasJson)
        })
        
        socket.on('find mate', function (reuqester) {
            let requesterRoom = reuqester.substring(21, 57)
            if (dataArrays[0].length != 1) {
                let matchingIndexes = []
                dataArrays[1].forEach((currentItem, index) => {
                    currentItem === requesterRoom ? matchingIndexes.push(index) : null
                })
                if (matchingIndexes.length != 1) {
                    let mateString = matchingIndexes[0]
                    let mateID = dataArrays[0][mateString]
                    let requesterID = reuqester.substring(0, 20)
                    io.to(mateID).emit('get requester', requesterID)
                }
            }
        })

        socket.on('send canvas', (reqID, previousJson) => {
            io.to(reqID).emit('get canvas', previousJson)
        })

        socket.on('send command', function (cmd) {
            socket.to(roomId).emit('get command', cmd)
        })
  
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
            let userData = dataArrays[0].indexOf(socket.id)
            let roomData = dataArrays[1].indexOf(roomId)
            dataArrays[0].splice(userData, 1)
            dataArrays[1].splice(roomData, 1)
        })
    })
})

server.listen(PORT, () => {
    console.log('Сервер запущен на порту ' + PORT)
})

// socket.on('new user', (usr) => {
//     socket.username = usr;
//     console.log('Подключился пользователь - Имя: ' + socket.username);
// });