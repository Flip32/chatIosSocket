const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    allowEIO3: true,
});

let player1 = null;
let player2 = null;

io.on('connection', (socket) => {
    console.log('Usuário conectado');

    if (!player1) {
        player1 = socket;
    } else if (!player2) {
        player2 = socket;
    }

    console.log('========================================')
    console.log(`player1`, player1?.id)
    console.log(`player2`, player2?.id)
    console.log('========================================')
    console.log(`player1 && player2`, !!(player1 && player2))
    if (player1 && player2) {
        console.log('========================================')
        console.log(`entrou no if`, )
        // Lógica para lidar com mensagens entre os dois jogadores.
        player1.on('chat message', (msg) => {
            console.log('========================================')
            console.log(`msg sendo enviada pelo jg1`, msg)
            player2.emit('chat message', { text: msg, sender: 'Player 1' });
        });

        player2.on('chat message', (msg) => {
            console.log('========================================')
            console.log(`msg sendo enviada pelo jg2`, msg)
            player1.emit('chat message', { text: msg, sender: 'Player 2' });
        });
    }

    app.get('/simulate-player2-message', (req, res) => {
        player1.emit('chat message', { text: 'Esta é uma mensagem do Player 2', sender: 'Player 2' });
        res.send('Mensagem de simulação enviada.');
    })

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
        if (socket === player1) {
            player1 = null;
        } else if (socket === player2) {
            player2 = null;
        }
    });
});

app.get('/', (req, res) => {
    console.log('========================================')
    console.log(`chegou no servidor! /`, )
    res.send('Servidor rodando!')
})

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
