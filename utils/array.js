function ArrayCycle(array){
    this.array = array;
    this.index = 0;
    this.next = function(){
        const element = array[this.index++];

        if(this.index >= this.array.length)
            this.index = 0;

        return element;
    };
}

module.exports = {
    ArrayCycle
}