import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.render('home'));
app.get('/*', (req, res) => res.redirect('/'));

const handleListen = () => console.log('Listening on http://localhost:3001');

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on('connection', (socket) => {
    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit('welcome');
    });
    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => socket.to(room).emit('bye'));
    });
    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', msg);
        done();
    });
});

httpServer.listen(3001, handleListen);
