/*
*Song Object
* */

//construction
function Song(id,name, author, ablum, year, duration, lyric, favor,src,status,rate,photo){
    //歌曲ID
    this.id = id;
    //歌曲名
    this.name = name;
    //演唱歌手
    this.author = author;
    //歌曲专辑
    this.ablum = ablum;
    //创作时间
    this.year = year;
    //歌曲的时长
    this.duration = duration;
    //歌词
    this.lyric = lyric;
    //是否喜爱
    this.favor = favor;
    //歌曲的源地址
    this.src = src;
    //歌曲的状态
    this.status = status;
    //歌曲的评分
    this.rate = rate;
    //专辑图片
    this.photo = photo;


    //歌曲所在的播放列表名

}


Song.prototype = {



};