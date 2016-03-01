/**
 * Created by john on 05/06/15.
 */
function NavNode(id, selector, name, type,  self, up, left, down, right){
    this.id = id;
    this.selector = selector;
    this.name = name;
    this.type = type;
    this.self = self;
    this.up = up;
    this.left = left;
    this.down = down;
    this.right = right;
}

NavNode.prototype = {

    navLeft: function nav_left(){
        this.self.classList.remove('selected');
        this.left.self.classList.add('selected');
    },

    navRight: function nav_right(){
        this.self.classList.remove('selected');
        this.right.self.classList.add('selected');
    },

    navUp: function nav_up(){
        this.self.classList.remove('selected');
        this.up.self.classList.add('selected');
    },

    navDown: function nav_down(){
        this.self.classList.remove('selected');
        this.down.self.classList.add('selected');
    },

    responseClick: function nav_response_click(){
        this.self.focus();
        var e = document.createEvent("MouseEvents");
        e.initEvent('click',false, false);
        this.self.dispatchEvent(e);
    }



}