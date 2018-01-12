/**
 * Created by sse316 on 7/9/2016.
 */


    var myAjax = {};  //空对象,向外暴露这么一个全局变量,这个函数的命名空间

    //=======================方法=======================
    myAjax.get = function(){
        //参数个数
        var argLength = arguments.length;
        var URL,json,callback;
        if(argLength == 2 && typeof arguments[0] == "string" && typeof arguments[1] == "function"){
            //两个参数
            URL = arguments[0];
            callback = arguments[1];
            //传给我们的核心函数来发出Ajax请求
            myAjax._doAjax("get",URL,null,callback);
        }else if(argLength == 3 && typeof arguments[0] == "string" && typeof arguments[1] == "object" && typeof arguments[2] == "function"){
            //3个参数
            URL = arguments[0];
            json = arguments[1];
            callback = arguments[2];
            //传给我们的核心函数来发出Ajax请求
            myAjax._doAjax("get",URL,json,callback);
        }else{
            throw new Error("get方法参数错误！");
        }
    }

    myAjax.post = function(){
        //参数个数
        var argLength = arguments.length;
        if(argLength == 3 && typeof arguments[0] == "string" && typeof arguments[1] == "object" && typeof arguments[2] == "function"){
            //3个参数
            var URL = arguments[0];
            var json = arguments[1];
            var callback = arguments[2];
            //传给我们的核心函数来发出Ajax请求
            myAjax._doAjax("post",URL,json,callback);
        }else{
            throw new Error("post方法参数错误！");
        }
    }

    //post方式提交所有表单
    myAjax.postAllForm = function(URL,formId,callback){
        var json = myAjax._formSerialize(formId);
        myAjax._doAjax("post",URL,json,callback);
    }

    //=======================内部方法=====================
    //将JSON转换为URL查询参数写法
    //传入{"id":12,"name":"考拉"}
    //返回id=12&name=%45%45%ED
    myAjax._JSONtoURLparams = function(json){
        var arrParts = [];  //每个小部分的数组
        for(k in json){
            arrParts.push(k + "=" + encodeURIComponent(json[k]));
        }
        return arrParts.join("&");
    }

    //最核心的发出Ajax请求的方法
    myAjax._doAjax = function(method,URL,json,callback){
        //Ajax的几个公式
        if(XMLHttpRequest){
            var xhr = new XMLHttpRequest();
        }else{
            var xhr = ActiveXObject("Microsoft.XMLHTTP");
        }

        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4){
                if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    callback(null,xhr.responseText);
                }else{
                    callback("文件没有找到" + xhr.status,null);
                }
            }
        }

        //现在要根据请求类型进行判断
        if(method == "get"){
            //请求类型是get
            //如果用户传输了json,此时要连字
            if(json) {
                var combineChar = URL.indexOf("?") == -1 ? "?" : "&";
                URL += combineChar + myAjax._JSONtoURLparams(json);
            }
            xhr.open("get",URL,true);
            xhr.send(null);
        }else if(method == "post"){
            xhr.open("post",URL,true);
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            xhr.send(myAjax._JSONtoURLparams(json));
        }
    }

    myAjax._formSerialize = function(formId){
        //得到表单
        var oForm = document.getElementById(formId);
        //得到按钮
        var oBtn = document.getElementById("btn");
        //得到所有表单控件
        var fields = oForm.elements;
        //表单控件的数量
        var fieldLength = fields.length;
        //存放每个部分的数组
        var json = {};
        //遍历所有的控件
        for (var i = 0; i < fieldLength; i++) {
            //得到你遍历到的这个控件
            var field = fields[i];
            var k = field.name;
            var v = "";

            //根据这是一个什么控件来决定v
            switch(field.type){
                case "button":
                case "submit":
                case "reset" :
                    break;
                case "select-one":
                    //遍历这个单选列表的所有option
                    var options = field.options;
                    //这个单选列表的option的个数
                    var optionsLength = options.length;
                    //遍历所有的option，查看那个选项被selected了
                    //被selected了的那个选项的value，就是总value
                    for(var j = 0 ; j < optionsLength ; j++){
                        if(options[j].selected){
                            v = options[j].value;
                            json[k] = v;
                        }
                    }
                    break;
                case "radio" :
                case "checkbox" :
                    if(!field.checked){
                        break;
                    }
                case "text" :
                default:
                    v = field.value;
                    json[k] = v;
                    break;
            }
        }
        return json;
    }


/**
 * Created by huyonghao on 16/4/2.
 */

var jud;
importScripts(["../lib/three.min.js"]);

//------------------------我加入-----

//------------------------我加入-----

onmessage=function(event){

    
    var url=event.data+".dat";

//写入路径到数据库
//    myAjax._doAjax("post",
//        "../postUrl",
//        {"filePath": "../MergedFiles/"+url, "fileName":event.data},function(err,data){
//            if(data == "ok"|| "已存在"){
//                console.log("恭喜，已写入数据库！");
//            }else{
//                console.log(data);
//                console.log("错误！");
//            }
//        }
//    );

//后台返回的为含有filePath 的JSON文件
//    myAjax._doAjax(
//        "get",
//        "../showUrl",
//        {"fileName":event.data},
//        function(err,data){
//            if(err){
//                throw new err;
//            }
//            else{
//                readData(data);
//            }}
//    );


            //如果服务器不能连接，就readD
          readD("../MergedFiles/"+url);

    //readD("../R0-2/"+url,data);


};

function readData(fileStr){
    var arr=fileStr.split("\r\n");
    var sp=new StringParser();
    // console.log(arr);
    for(var i=0;i<arr.length;i++){
        sp.init(arr[i]);
        var command=sp.getWord();
        if(command!=null){
            switch(command){
                case'COMPONENT':
                    index=-1;
                    data=new map();
                    data.nam=sp.getWord();
                    // console.log(data.nam);
                    continue;
                case'COMPONENTFINISH':
                    // console.log("post");
                    postMessage(data);
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
                    switch(jud){
                        case 'v':
                            var n1=1.0*command;
                            var n2=1.0*sp.getWord();
                            var n3=1.0*sp.getWord();
                            data.v[index].push(n1);
                            data.v[index].push(n2);
                            data.v[index].push(n3);

                            continue;
                        case 't':

                            rowNum++;
                            var faceI=new faceIndex();
                            faceI.num=rowNum;
                            //console.log("2");
                            var star=1.0*command;
                            while(star!=null){
                                var grouT= new THREE.Face3(star, 1.0*sp.getWord(), 1.0*sp.getWord());

                                faceI.arr.push(grouT);

                                star=sp.getWord();
                            }
                            faceArray.push(faceI);
                            continue;
                        case 'n':
                            var nor1=1.0*command;
                            var norRow=new THREE.Vector3(nor1,1.0*sp.getWord(),1.0*sp.getWord());
                            rowNormal++;
                            var indexFace=faceArray[rowNormal];
                            for(var y=0;y<indexFace.arr.length;y++){
                                var groupT=indexFace.arr[y];
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
                            data.m.push(1.0*command);
                            for(var metrixCount=0; metrixCount<15; metrixCount++)
                            {
                                var tempValue = 1.0*sp.getWord();
                                data.m.push(tempValue);
                            }
                            break;
                    }
            }
        }
    }
    // console.log("finish");
    arr = null;
}

function readD(url){

    var xhr=new XMLHttpRequest();
    var url=url;
    xhr.open("GET",url,true);
    xhr.addEventListener("load",function(event)
    {
        var index = -1;
        var data=new map();
        var arr=event.target.response.split("\r\n");
        var sp=new StringParser();
        // console.log(arr);
        for(var i=0;i<arr.length;i++){
            sp.init(arr[i]);
            var command=sp.getWord();
            if(command!=null){
                switch(command){
                    case'COMPONENT':
                        index=-1;
                        data=new map();
                        data.nam=sp.getWord();
                        // console.log(data.nam);
                        continue;
                    case'COMPONENTFINISH':
                        // console.log("post");
                        postMessage(data);
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
                        switch(jud){
                            case 'v':
                                var n1=1.0*command;
                                var n2=1.0*sp.getWord();
                                var n3=1.0*sp.getWord();
                                data.v[index].push(n1);
                                data.v[index].push(n2);
                                data.v[index].push(n3);

                                continue;
                            case 't':

                                rowNum++;
                                var faceI=new faceIndex();
                                faceI.num=rowNum;
                                //console.log("2");
                                var star=1.0*command;
                                while(star!=null){
                                    var grouT= new THREE.Face3(star, 1.0*sp.getWord(), 1.0*sp.getWord());

                                    faceI.arr.push(grouT);

                                    star=sp.getWord();
                                }
                                faceArray.push(faceI);
                                continue;
                            case 'n':
                                var nor1=1.0*command;
                                var norRow=new THREE.Vector3(nor1,1.0*sp.getWord(),1.0*sp.getWord());
                                rowNormal++;
                                var indexFace=faceArray[rowNormal];
                                for(var y=0;y<indexFace.arr.length;y++){
                                    var groupT=indexFace.arr[y];
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
                                data.m.push(1.0*command);
                                for(var metrixCount=0; metrixCount<15; metrixCount++)
                                {
                                    var tempValue = 1.0*sp.getWord();
                                    data.m.push(tempValue);
                                }
                                break;
                        }
                }
            }
        }
        // console.log("finish");
        arr = null;
    });
    xhr.send(null);

}



function map(){
    this.v=[];
    this.t=[];
    this.n=[];
    this.m=[];
    this.f=[];
    this.nam=null;
    this.newFileName = null;
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