/**
 * Created by Administrator on 2016/10/13.
 */

var myAjax = {};  //�ն���,���Ⱪ¶��ôһ��ȫ�ֱ���,��������������ռ�

//=======================����=======================
myAjax.get = function(){
    //��������
    var argLength = arguments.length;
    var URL,json,callback;
    if(argLength == 2 && typeof arguments[0] == "string" && typeof arguments[1] == "function"){
        //��������
        URL = arguments[0];
        callback = arguments[1];
        //�������ǵĺ��ĺ���������Ajax����
        myAjax._doAjax("get",URL,null,callback);
    }else if(argLength == 3 && typeof arguments[0] == "string" && typeof arguments[1] == "object" && typeof arguments[2] == "function"){
        //3������
        URL = arguments[0];
        json = arguments[1];
        callback = arguments[2];
        //�������ǵĺ��ĺ���������Ajax����
        myAjax._doAjax("get",URL,json,callback);
    }else{
        throw new Error("get������������");
    }
}

myAjax.post = function(){
    //��������
    var argLength = arguments.length;
    if(argLength == 3 && typeof arguments[0] == "string" && typeof arguments[1] == "object" && typeof arguments[2] == "function"){
        //3������
        var URL = arguments[0];
        var json = arguments[1];
        var callback = arguments[2];
        //�������ǵĺ��ĺ���������Ajax����
        myAjax._doAjax("post",URL,json,callback);
    }else{
        throw new Error("post������������");
    }
}

//post��ʽ�ύ���б�
myAjax.postAllForm = function(URL,formId,callback){
    var json = myAjax._formSerialize(formId);
    myAjax._doAjax("post",URL,json,callback);
}

//=======================�ڲ�����=====================
//��JSONת��ΪURL��ѯ����д��
//����{"id":12,"name":"����"}
//����id=12&name=%45%45%ED
myAjax._JSONtoURLparams = function(json){
    var arrParts = [];  //ÿ��С���ֵ�����
    for(k in json){
        arrParts.push(k + "=" + encodeURIComponent(json[k]));
    }
    return arrParts.join("&");
}

//����ĵķ���Ajax����ķ���
myAjax._doAjax = function(method,URL,json,callback){
    //Ajax�ļ�����ʽ
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
                callback("�ļ�û���ҵ�" + xhr.status,null);
            }
        }
    }

    //����Ҫ�����������ͽ����ж�
    if(method == "get"){
        //����������get
        //����û�������json,��ʱҪ����
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
    //�õ���
    var oForm = document.getElementById(formId);
    //�õ���ť
    var oBtn = document.getElementById("btn");
    //�õ����б��ؼ�
    var fields = oForm.elements;
    //���ؼ�������
    var fieldLength = fields.length;
    //���ÿ�����ֵ�����
    var json = {};
    //�������еĿؼ�
    for (var i = 0; i < fieldLength; i++) {
        //�õ��������������ؼ�
        var field = fields[i];
        var k = field.name;
        var v = "";

        //��������һ��ʲô�ؼ�������v
        switch(field.type){
            case "button":
            case "submit":
            case "reset" :
                break;
            case "select-one":
                //���������ѡ�б������option
                var options = field.options;
                //�����ѡ�б��option�ĸ���
                var optionsLength = options.length;
                //�������е�option���鿴�Ǹ�ѡ�selected��
                //��selected�˵��Ǹ�ѡ���value��������value
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

