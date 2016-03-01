/**
 * Created by john on 03/06/15.
 */
var audioPlayer = {

    playlist: {}, //保存播放列表

    playListId: 0, //播放列表标识

    songId: 0,   //歌曲标识

    navNodeId: 0, //导航节点标识

    navNodes: {}, //保存导航节点

    currentPlayList: null, //指示当前播放列表

    player: document.querySelector('.player'), //播放器

    playing: true,  //播放状态

    play_icon: document.querySelector('#navnode_5'),  //播放按钮

    prev_icon: document.querySelector('#navnode_4'),   //上一手按钮

    next_icon: document.querySelector('#navnode_6'),  //下一首按钮

    songList: [],

    currentSong: null,  //指示当前歌曲

    currentSongDuration: 0,  //当前歌曲长度

    songDuration: 0,

    currentPos: 0,

    progressBar: document.querySelector('.ui-slider-range-min'),

    indicator:  document.querySelector('.ui-slider-handle'),

    curTime: document.querySelector('.curTime'),

    totalTime: document.querySelector('.totalTime'),

    lyricHolder: document.querySelector('#lyricHolder'),

    lyricRow: document.querySelector('#lyricHolder >li'),

    lyric: [],

    UP : 38,

    LEFT: 37,

    DOWN : 40,

    RIGHT : 39,

    ENTER : 13,

    init: function audioPlayer_init(){

        document.addEventListener('build',this.showlyric.bind(this));
       // audioPlayer.prototype = new EventEmitter();
        //init the song file
        this.songInit();

        //create a favor playlist to add favor song in.
        var favorList = Object.create(PlayList);
        favorList.set('name','favorList');
        favorList.set('id',this.playListId++);
        favorList.set('selector','#navnode_2');
        favorList.set('list',[]);
        this.playlist['favor'] = favorList;
        for(var i = 0; i < this.songList.length; i++){
            var song = this.songList[i];
            if(song.favor > 0){
                favorList.addSong(song);
            }
        }

        //初始化当前播放列表为'默认'
        this.currentPlayList = this.playlist['default'];

        //display the default playlist's song to the main dom
        this.rendDom();

        //初始化左侧播放列表
        this.playListInit();

        //init the navNode
        this.navNodeInit();

        //
        this.prev_icon.addEventListener('click',function(){this.playPrev()}.bind(this));
        this.play_icon.addEventListener('click',function() {
            if (this.playing) {
                this.stop();
            } else {
                this.play(this.currentPlayList.getSong());
            }
        }.bind(this));



        /*
        * 事件注册区
        * */

        this.next_icon.addEventListener('click',function(){this.playNext()}.bind(this));
        this.player.addEventListener('ended',function(){this.playNext()}.bind(this));
        this.player.addEventListener('timeupdate',function(){this.updateProgressBar()}.bind(this));

        //操作控制事件
        document.addEventListener('keydown', this.keydownEventHandler.bind(this));

        //添加播放列表和歌曲列表事件
        for(var obj in this.navNodes){
            var item = this.navNodes[obj];
            if(item.type == 'playList'){
                item.self.addEventListener('click', this.playListClick.bind(this));
            }else if(item.type == 'middle'){
                item.self.addEventListener('click', this.middleClick.bind(this));
            }
        }


    },

    /*
     * init the Songs
     * We may init this songList  from file or sdcard in future.
     * And the metadata also can parse by read the binary header from song file.
     * */
    songInit: function songList_init() {
        //创建临时播放列表
        var tempPlayList = Object.create(PlayList);
        tempPlayList.set('name','defaultList');
        tempPlayList.set('id',this.playListId++);
        tempPlayList.set('selector','#navnode_1');
        tempPlayList.set('list',[]);
        //创建歌曲并添加到临时播放列表&排序 歌曲的来源可以通过扫描目录获得,歌曲的信息可以通过匹配歌曲文件二进制文件头获得
        var song = new Song(this.songId++,'喜欢你','邓紫棋','喜欢你','2014','3:59','lyric/喜欢你.lrc','1','music/喜欢你.mp3','1','5','img/music/喜欢你.png');
        tempPlayList.addSong(song);
        this.songList.push(song);
        song = new Song(this.songId++,'天边一朵云','声音碎片','把光芒洒向更开阔的地方','2008','5:41','lyric/天边一朵云.lrc','0','music/天边一朵云.mp3','1','5','img/music/天边一朵云.jpg');
        tempPlayList.addSong(song);
        this.songList.push(song);
        song = new Song(this.songId++,'如果没有你','莫文蔚','如果没有你','2006','4:47','lyric/如果没有你.lrc','0','music/如果没有你.mp3','1','5','img/music/如果没有你.jpg');
        tempPlayList.addSong(song);
        this.songList.push(song);
        song = new Song(this.songId++,'突然的自我','伍佰','伍佰力(2004 Live 生命热力)','2004','3:36','lyric/突然的自我.lrc','1','music/突然的自我.mp3','1','5','img/music/突然的自我.jpg');
        tempPlayList.addSong(song);
        this.songList.push(song);
        song = new Song(this.songId++,'红豆','王菲','唱游','1998','4:20','lyric/红豆.lrc','0','music/红豆.mp3','1','5','img/music/红豆.jpg');
        tempPlayList.addSong(song);
        this.songList.push(song);

        //将临时播放列表加入播放器播放列表中
        this.playlist['default'] = tempPlayList;
        //释放song
        song = null;

    },


    /*
    * 生成默认的播放列表的歌曲列
    * 取得模板后复制\定制
    * */
    rendDom: function rend_dom(playList) {

        var placeHolder = document.getElementById('songList'); //取得生成列表的位置

        if(playList == null){
            playList = this.playlist['default'];
        }


        var sonNode = document.querySelectorAll('.ui-reelList-row');
        for(var i = 0 ; i < sonNode.length; i++){
            var item = sonNode[i];
            if(!item.classList.contains('hidden')){
                placeHolder.removeChild(item);
            }
        }




        var top = 0; //每行的高度 需要自增
        for( var i = 0 ; i < playList.getLength(); i++){ //遍历播放列表
           var cloneRow = document.getElementsByClassName('ui-reelList-row hidden')[0].cloneNode(true); //克隆骨架
            cloneRow.classList.remove('hidden'); //去隐藏
            cloneRow.style.top = top +'px';  //赋高
            var song = playList.getSong(i); //取得当前歌曲对象
            if(song.favor == 1){  //是否收藏
                var obj = cloneRow.querySelector('.floatBtn-wrapper >a');
                obj.classList.remove('favor');
                obj.classList.add('red-heart');
            }
            cloneRow.classList.add('s' + song.id);  //标识歌曲
            cloneRow.querySelector('#songName_p >span').textContent = song.name ;  //赋名
            cloneRow.querySelector('#songName_p >span').id = 'song_name_' + song.id;
            cloneRow.querySelector('#songAuthor_p').textContent = song.author; //赋作者
            cloneRow.querySelector('#songAblum_p').textContent = '<' + song.ablum + '>'; ////赋专辑名

            top += 31; //下一首高度
            placeHolder.appendChild(cloneRow); //添加节点

        }
    },

    playListInit: function init_playList() {
        this.play(this.currentPlayList.getSong());
    },
    /*
    * init the NavNodes
    * */
    navNodeInit: function navNode_init() {

        //column1
        var list_temp = new NavNode(this.navNodeId++, '#navnode_1', '默认播放列表','playList');
        list_temp.self = document.querySelector(list_temp.selector);
        this.navNodes[list_temp.selector] = list_temp;
        var list_favor = new NavNode(this.navNodeId++, '#navnode_2', '收藏播放列表','playList');
        list_favor.self = document.querySelector(list_favor.selector);
        this.navNodes[list_favor.selector] = list_favor;
        var addList = new NavNode(this.navNodeId++, '#navnode_3', '添加播放列表','playList');
        addList.self = document.querySelector(addList.selector);
        this.navNodes[addList.selector] = addList;

        //footer
        var play_icon_node = new NavNode(this.navNodeId++, '#navnode_5', '播放控制', 'footer', this.play_icon);
        this.navNodes[play_icon_node.selector] = play_icon_node;
        var prev_icon_node = new NavNode(this.navNodeId++, '#navnode_4', '播放控制', 'footer', this.prev_icon);
        this.navNodes[prev_icon_node.selector] = prev_icon_node;
        var next_icon_node = new NavNode(this.navNodeId++, '#navnode_6', '播放控制', 'footer', this.next_icon);
        this.navNodes[next_icon_node.selector] = next_icon_node;

        //middel-song

        var middle_song_node = new NavNode(this.navNodeId++, '#navnode_7','歌曲列表','middle',document.querySelector('.ui-reelList-viewport'));
        var middle_footer_node = new NavNode(this.navNodeId++, '#navnode_8','歌曲选择','middle',document.querySelector('.ui-reelList-footer'));

        this.navNodes[middle_song_node.selector] = middle_song_node;
        this.navNodes[middle_footer_node.selector] = middle_footer_node;

        play_icon_node.left =  prev_icon_node;
        play_icon_node.right = next_icon_node;
        play_icon_node.up = addList;
        play_icon_node.down = list_temp;

        prev_icon_node.left = next_icon_node;
        prev_icon_node.right = play_icon_node;
        prev_icon_node.up = addList;
        prev_icon_node.down = list_temp;

        next_icon_node.left = play_icon_node;
        next_icon_node.right = prev_icon_node;
        next_icon_node.up = addList;
        next_icon_node.down = list_temp;


        list_temp.down = list_favor;
        list_temp.up = play_icon_node;
        list_temp.right = middle_song_node;
        list_temp.left = middle_song_node;

        list_favor.down = addList;
        list_favor.up = list_temp;
        list_favor.right = middle_song_node;
        list_favor.left = middle_song_node;

        addList.up = list_favor;
        addList.down = play_icon_node;
        addList.right = middle_song_node;
        addList.left = middle_song_node;

        middle_song_node.up = middle_footer_node;
        middle_song_node.down = middle_footer_node;
        middle_song_node.right = list_temp;
        middle_song_node.left = list_temp;

        middle_footer_node.up = middle_song_node;
        middle_footer_node.down = middle_song_node;
        middle_footer_node.right = list_temp;
        middle_footer_node.left = list_temp;





       /* //column2
        for(var i = 0; i < this.currentPlayList.getLength(); i++){
            var song = this.currentPlayList.getSong(i);
            var liItem = document.querySelector('.s' + song.id);
            var checkbtn = liItem.querySelector('.ui-reelList-checkbox >span');
            var checkbtn_node = new NavNode(this.navNodeId++,'.ui-reelList-checkbox >span','单选框', '歌曲列表',checkbtn);
            var songbtn = liItem.querySelector('#song_name_' + song.id);
            var songbtn_node = new NavNode(this.navNodeId++,'#song_name_' + song.id, '歌曲', '歌曲名',songbtn);
            var favorbtn = liItem.querySelector('.floatBtn-wrapper >a');
            var favorbtn_node = new NavNode(this.navNodeId++, '.floatBtn-wrapper >a', '红心','收藏',favorbtn);
        }*/

        var column2_node = new NavNode();



        //footer
        var footer_node = new NavNode();




    },

    /*
     * 播放上一首
     * */
    playPrev: function play_prev_song() {
        this.stop();
        this.play(this.currentPlayList.getPrevSong());
    },

    /*
     * 播放
     * */
    play: function play_song(song) {

        if(!!song.src){
            this.play_icon.parentNode.classList.remove("stop");
            //his.updateSongInfoToPlayer();
            document.querySelector('.album >img').src = song.photo;
            document.querySelector('.album-name >span').textContent = '<' + song.ablum + '>';
            document.querySelector('.songname').textContent = song.name + ' - ' + song.author;
            document.querySelector('.s'+ song.id + ' >#songName_p').lastChild.classList.add('listen-icon-playing');
            this.player.src = song.src;
            this.playing = true;
            this.songDuration = song.duration;

            this.totalTime.textContent = song.duration;
            this.progressBar.style.width = '0%';
            this.indicator.style.left= '0%';
            this.curTime.textContent = '00:00';
            this.rendlyric(song);
            this.currentPos = 0;
            this.player.play();

        }


    },

    /*
     * 暂停
     * */
    stop: function stop_song() {
        document.querySelector('.s'+this.currentPlayList.getCurrentSong().id+ ' >#songName_p').lastChild.classList.remove('listen-icon-playing');
        this.currentSongDuration = this.player.currentTime; //keep current time
        this.play_icon.parentNode.classList.add("stop");
        this.playing = false;
        this.player.pause();
    },

    /*
     * 播放下一首歌
     * */
    playNext: function play_next_song() {
        this.stop();
        this.play(this.currentPlayList.getNextSong());
    },

    /*
    * 更新歌曲信息
    * */

    updateSongInfoToPlayer: function update_song_info_to_player() {

    },

    /*
    * 更新进度条
    * */

     updateProgressBar: function update_progress_bar(){
        var curTime_f = this.player.currentTime;
        var curTime = parseInt(curTime_f);
         var s = (curTime %60);
         var m =  parseInt(curTime/60);
         var totalTime = parseInt(this.player.duration);
        var progressing = (curTime/ totalTime)*100 + "%";
        this.progressBar.style.width = progressing;
        this.indicator.style.left= progressing;
        this.curTime.textContent = (m > 9 ? m : '0' + m) + ':' + (s > 9 ? s:'0'+s);
        var pos = this.lyric[this.currentPos][0];
        var cursor = pos/curTime_f;
        if( cursor < 1.019){
            console.log('->' +pos/curTime_f);
            if(this.currentPos != 0 ){
                document.querySelectorAll('#lyricHolder >li')[this.currentPos-1].classList.remove('ui-lrc-current');
            }
            document.querySelectorAll('#lyricHolder >li')[this.currentPos++].classList.add('ui-lrc-current');
            if(this.currentPos > 9){
                document.querySelector('#lrcWrap').style.top = (210 - 28*(this.currentPos-9)) + 'px';
            }
        }
    },

    /*
    * get TIme format
    * */

    getTimeFormat: function get_time_format(){
        var seconds = parseInt(this.songDuration);
        var m = parseInt(seconds / 60);
        var s = seconds % 60;
        //console.log(seconds);
        //var rs = (m > 9 ? m : '0'+ m )+ ':' + (s > 9 ? s : '0'+ s);
        return m;
    },

    keydownEventHandler: function keydown_event_handler(evt){
        var object = document.querySelector('.selected');
        var navNode = this.navNodes['#'+object.id];
        switch(evt.which){
            case this.UP:
                navNode.navUp();
                break;

            case this.DOWN:
                navNode.navDown();
                break;
            case this.LEFT:
                navNode.navLeft();
                break;

            case this.RIGHT:
                navNode.navRight();
                break;

            case this.ENTER:
                navNode.responseClick();
                break;


            default:
        }
    },

    playListClick: function play_list_click(evt){
        var list_temp = document.querySelector('#navnode_1');
        var list_favor = document.querySelector('#navnode_2');
        var addList = document.querySelector('#navnode_3');
        var playingList = this.currentPlayList;

        if(!evt.target.classList.contains('playing')){
            for(var list in this.playlist){
                this.playlist[list].updatePlayStatus(false);
            }

            if(evt.target.id == list_temp.id){
                list_temp.classList.add('playing');
                this.currentPlayList = this.playlist['default'];
                this.rendDom(this.currentPlayList);
                this.playListInit();
            }else if(evt.target.id == list_favor.id){
                list_favor.classList.add('playing');
                this.currentPlayList = this.playlist['favor'];
                this.rendDom(this.currentPlayList);
                this.playListInit();
            }

        }


    },

    middleClick: function middle_click(){

    },

    rendlyric: function rend_lyric(song){
    var lyric = new Lyric(song);
    lyric.rendlyricArray();

    },

    showlyric: function show_lyric(evt){
        var lyric = evt.data;
        //console.log(lyric);
        var lines = lyric.split(/\s{5,}/);
        var temp = [];
        this.lyricHolder.innerHTML = '';
        document.querySelector('#lrcWrap').style.top = '210px';
        this.lyric = [];
        for( var i in lines){
           var line = lines[i];
           if(line != '' && line != null) {
                var pattern = new RegExp(/(\[\d{2}:\d{2}\.\d{2}\])|(\D+)/g); //[00:00.00] xxxx -> ([00:00.00]) (xxxx)
                var res = line.match(pattern);
                if(res.length > 0){
                    var str = res[0].replace(/\[|\]/g,""); //[00:00.00] -> 00:00.00
                    var str = str.split(/:|\./);
                    var time = parseInt(str[0]*60) + parseInt(str[1]) + str[2]/100;
                    if(!isNaN(time)){
                        temp.push(time);
                        if(res.length == 1){
                            temp.push('');
                        }else{
                            temp.push(res[1]);
                        }
                        var row = this.lyricRow.cloneNode(true);
                        row.innerHTML = temp[1] == '' ? '&nbsp;' : temp[1];
                        this.lyricHolder.appendChild(row);
                        this.lyric.push(temp);
                        temp = [];
                    }
                }
            }


        }
        //console.log(this.lyric);
    }


};

audioPlayer.init();