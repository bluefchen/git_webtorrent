/**
 * Created by jialao on 2015/10/11.
 */

var jud;
importScripts(["../lib/three.min.js"]);

onmessage=function(event){

    var data=new index();
    data.nam=event.data;
    var url=event.data+".dat";

    readD("../ShouGang-Rep/"+url,data);
}

function readD(url,data){

    var xhr=new XMLHttpRequest();
    var url=url;
    xhr.open("GET",url,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4&&xhr.status==200){
            var index=-1;
            var arr=xhr.response.split("\r\n");
            //console.log(arr);
            var sp=new StringParser();
            for(var i=0;i<arr.length;i++){
                sp.init(arr[i]);
                var command=sp.getWord();
                if(command!=null){
                    switch(command){
                        case'#':
                            var u=sp.getWord();
                            if(u=="Vertex"){
                                index++;
                                var faceArray=[];
                                var rowNum=-1;
                                data.v[index]=[];
                                data.t[index]=[];
                                data.f[index]=[];
                                jud="v";
                            }else if(u=="Triangle"){
                                jud="t";
                            }else if(u=="Normal"){
                                var rowNormal=-1;
                                jud="n";
                            }else if(u=="TMesh"){
                                var string1 = sp.getWord();
                                jud="f";
                            }
                            continue;
                        default:
                            //console.log(jud);
                            switch(jud){
                                case 'v':
                                    var n1=command;
                                    var n2=sp.getWord();
                                    var n3=sp.getWord();
                                    data.v[index].push(n1);
                                    data.v[index].push(n2);
                                    data.v[index].push(n3);

                                    continue;
                                case 't':

                                    rowNum++;
                                    var faceI=new faceIndex();
                                    faceI.num=rowNum;
                                    var star=command;
                                    while(star!=null){
                                        var grouT= new THREE.Face3(star, sp.getWord(), sp.getWord());
                                        faceI.arr.push(grouT);
                                        star=sp.getWord();
                                    }
                                    faceArray.push(faceI);
                                    continue;
                                case 'n':
                                    var nor1=command;
                                    var norRow=new THREE.Vector3(nor1,sp.getWord(),sp.getWord());
                                    rowNormal++;
                                    var indexFace=faceArray[rowNormal];
                                    for(var y=0;y<indexFace.arr.length;y++){
                                        var groupT=indexFace.arr[y];
                                        //groupT.normal=norRow;
                                        data.t[index].push(groupT.a);
                                        data.t[index].push(groupT.b);
                                        data.t[index].push(groupT.c);
                                        data.f[index].push(norRow.x);
                                        data.f[index].push(norRow.y);
                                        data.f[index].push(norRow.z);
                                    }
                                    continue;
                                case 'f':
                                    data.newFileName = string1;
                                    data.m.push(command);
                                    for(var i=0; i<15; i++)
                                    {
                                        var tempValue = sp.getWord();
                                        data.m.push(tempValue);
                                    }
                                    break;
                            }
                    }
                }
            }
            data.dataUrl = url;
            postMessage(data);
        }
        else{
            // console.log("NO MESSAGE!");
        }
    }

    xhr.send(null);

}


function index(){
    this.v=[];
    this.t=[];
    this.n=[];
    this.m=[];
    this.f=[];
    this.nam=null;
    this.newFileName = null;
    this.dataUrl = null;
}

function faceIndex(){
    this.arr=[];
    this.num=0;

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