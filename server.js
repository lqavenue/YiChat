var express = require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/express'),
/*var express=require('express');*/
    app = express(),
    server = require('http').createServer(app),
    io = require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/socket.io').listen(server),//引入socket.io模块并绑定到服务器
    users = [];
app.use('/', express.static(__dirname + '/www'));
server.listen(8081);

io.sockets.on('connection', function (socket) {
    socket.on('login', function (nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');//向所有连接到服务器的客户端发送当前登陆用户的昵称
        }

    });
    socket.on('disconnect', function () {
        //将断开了i按揭的用户从users中删除
        users.splice(users.indexOf(socket.nickname), 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');//通知除自己以外的所有人
    });
    socket.on('postMsg', function (msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    })

})