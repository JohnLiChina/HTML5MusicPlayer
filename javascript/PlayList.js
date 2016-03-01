/**
 * Created by john on 05/06/15.
 */

var PlayList = {

    id: null,

    name: 'nameDefault',

    curSong: 0,

    selector: null,

    list: [],

    getTotalSongs: function total_songs(){
        return this.list;
    },

    addSong: function add_song_to_list(song){
        this.list.push(song);
       // console.log('' + this.name + ', song=' + song.name);
        if(this.list.length > 1) {
            this.list = this.list.sort(function compareFunction(a, b) {
                return (a.name).localeCompare(b.name);
            });
        }

    },

    updatePlayStatus: function update_play_satus(flag){
        if(flag){
            document.querySelector(this.selector).classList.add('playing');
        }else{
            document.querySelector(this.selector).classList.remove('playing');
        }
    },

    removeSong: function remove_song_to_list(song){
       for(var i=0; i < this.list.length; i++){
           var item = this.list[i];
           if(item.id = song.id){
               this.list.slice(i,i+1);
           }
       }
    },

    getSong: function get_song(index){
        if(!isNaN(index) && index <= this.list.length){
            this.curSong = index;
        }else{
            this.curSong = 0;
        }
        return this.list[this.curSong];
    },

    getNextSong: function get_next_song(){
        if(!isNaN(this.curSong) && this.curSong < this.list.length-1){
            this.curSong++;
            return this.list[this.curSong];
        }else{
            this.curSong = 0;
            return this.list[this.curSong];
        }

    },

    getCurrentSong: function get_current_song(){

        return this.list[this.curSong];
    },

    getPrevSong: function get_prev_song(){
        if(!isNaN(this.curSong) && this.curSong >0){
            this.curSong--;
            return this.list[this.curSong];
        }else{
            this.curSong = this.list.length-1;
            return this.list[this.curSong];
        }
    },

    getLength: function get_length(){
        return this.list.length;
    },

    get: function (attr){

        return this[attr];

    },

    set: function(attr, value){

        this[attr] = value;

    }


}