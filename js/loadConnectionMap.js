
importScripts(["../lib/three.js"]);
onmessage=function(event){

    var data = new myMap();
    readV("../ConnectionInfo/Map1.txt",data);
}

function readV(url,data){

    var xhr=new XMLHttpRequest();
    var url=url;
    xhr.open("GET",url,true);
    xhr.onreadystatechange=function(){

        if(xhr.readyState==4&&xhr.status==200){

            var arr=xhr.response.split("\r\n"); //or \n
            var sp=new StringParser();
            for(var i=0;i<arr.length;i++){
                sp.init(arr[i]);
                var command=sp.getWord();
                if(command!=null){
                    switch(command){
                        case '#' :
                            data.blockNum = Number(sp.getWord());
                            continue;
                        default :
                        {
                            //var name=command;
                            //È¥µôºó×º
                            //var pos=name.indexOf(".");
                            //var ind=name.substring(0,pos);

                            //data.connectionNameArr.push(ind);

                            if(Number(command)==1)
                            {
                                var index = new THREE.Vector2(i-1,0);
                                if(i-1>=0)
                                {
                                    data.blockConnectionArr.push(index);
                                }
                            }


                            for(var j=1; j<data.blockNum; j++ )
                            {
                                if(Number(sp.getWord())==1)
                                {
                                    var index = new THREE.Vector2(i-1,j);
                                    if(i-1>=j)
                                    {
                                        data.blockConnectionArr.push(index);
                                    }
                                }

                            }
                        }
                    }
                }
            }
            //console.log(data);
            postMessage(data);
        }

    }
    xhr.send(null);

}




function myMap(){
    this.blockNum;
    this.blockConnectionArr = [];
    //this.connectionNameArr=[];
}




var StringParser = function (str) {
    this.str;   // Store the string specified by the argument
    this.index; // Position in the string to be processed
    this.init(str);
}
// Initialize StringParser object
StringParser.prototype.init = function (str) {
    this.str = str;
    this.index = 0;
}

// Skip delimiters
StringParser.prototype.skipDelimiters = function () {
    for (var i = this.index, len = this.str.length; i < len; i++) {
        var c = this.str.charAt(i);
        // Skip TAB, Space, '(', ')
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
        break;
    }
    this.index = i;
}

// Skip to the next word
StringParser.prototype.skipToNextWord = function () {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    this.index += (n + 1);
}

// Get word
StringParser.prototype.getWord = function () {
    this.skipDelimiters();
    var n = getWordLength(this.str, this.index);
    if (n == 0) return null;
    var word = this.str.substr(this.index, n);
    this.index += (n + 1);

    return word;
}

// Get integer
StringParser.prototype.getInt = function () {
    return parseInt(this.getWord());
}

// Get floating number
StringParser.prototype.getFloat = function () {
    return parseFloat(this.getWord());
}

function getWordLength(str, start) {
    var n = 0;
    for (var i = start, len = str.length; i < len; i++) {
        var c = str.charAt(i);
        if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
            break;
    }
    return i - start;
}