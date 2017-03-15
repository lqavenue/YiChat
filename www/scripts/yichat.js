$(function () {
    var yichat = new YiChat();
    yichat.init();
})

//
var YiChat = function () {
    this.socket = null;
}

//
YiChat.prototype = {
    init: function () {
        var that = this;
        that.socket = io.connect();
        that.socket.on('connect', function () {
            $('#info').text('get yourself a nickname');
            $('#nickWrapper').attr('style', "display:block;");
            $('#nickname').focus();
        });
        $('#loginBtn').on('click', function () {
            var nickname = $('#nickname').val();
            if (nickname.trim().length != 0) {
                that.socket.emit('login', nickname);
            } else {
                $('#nickname').focus();
            }
        });
        //重名
        that.socket.on('nickExisted', function () {
            $('#info').text('change another please, nickname is taken');
        })
        //登录成功
        that.socket.on('loginSuccess', function () {
            $('#loginWrapper').attr('style', "display:none;");
            $('#messageInput').focus();
        })
        //用户链接离开时显示不同的状态
        that.socket.on('system', function (nickname, userCount, type) {
            var msg = nickname + (type == 'login' ? ' joined' : ' left');
            //var p = $('<p></p>').text(msg);
            //$('#historyMsg').append(p);
            //改为调用方法
            that.displayNewMsg('system', msg, 'red');
            $('#status').text(userCount + (userCount > 1 ? ' users ' : ' user ') + 'online');
        })
        $('#sendBtn').on('click', function () {
            var $msg = $('#messageInput');
            var msg = $msg.val();
            var color = $('#colorStyle').val();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                that.displayNewMsg('me', msg, color);
            }
            $msg.val('');
            $msg.focus();
        })
        that.socket.on('newMsg', function (nickname, msg, color) {
            that.displayNewMsg(nickname, msg, color);
        })

        //实现回车键进入功能,UNDO，但是回车键还是回往下换行，怎样禁止
        $('#nickname').on('keyup', function (e) {
            if (e.keyCode == 13) {
                $('#loginBtn').trigger('click');
            }
        })
        $('#messageInput').on('keyup', function (e) {
            if (e.keyCode == 13) {
                $('#sendBtn').trigger('click');
            }
        })
        that.initialEmoji();
        $('#emoji').on('click', function (e) {
            var $emojiContainer = $('#emojiWrapper');
            $emojiContainer.attr('style', "display:block;");
            //只有表情库显示时才执行这个函数，不然每次都执行，速度会很慢
            $('body').on('click', function (e) {
                var $emojiContainer = $('#emojiWrapper');
                if ($(e.target) != document.getElementById('emojiWrapper')) {
                    $emojiContainer.attr('style', "display:none;");
                }
                e.stopPropagation();
            })
            e.stopPropagation();
        })

        $('#emojiWrapper').on('click', function (e) {
            if (e.target.nodeName.toLowerCase() == 'img') {
                //UnDO 用图片展示出来
                //$('#messageInput').append(e.target);
                $msg = $('#messageInput');
                $msg.val($msg.val() + '[emoji:' + e.target.title + ']');
                $msg.focus();
            }
        })
    },
    displayNewMsg: function (user, msg, color) {
        var $container = $('#historyMsg'),
            $msg = $('<p></p>'),
            data = new Date().toLocaleTimeString().substr(0, 8);
        msg = this.showEmoji(msg);
        $msg.css('color', color);
        $msg.html(user + '<span class="timespan">(' + data + '): </span>' + msg);
        $container.append($msg);
        //每次都滚到输入框的底端
        $container.scrollTop($container[0].scrollHeight);
    },
    initialEmoji: function () {
        var emojiContainer = document.getElementById('emojiWrapper'),
       docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    showEmoji: function (msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = $('#emojiWrapper').children().length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
            }
        }
        return result;
    }

}

