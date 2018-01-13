/**
 * Created by jialao on 2016/10/31.
 */
/*
功能：设置点选模型时高亮的颜色
使用：需要主模块中有全局变量‘HIGH_LIGHT_COLOR’,然后使用该函数进行全局配置
参数：16进制数字，如0xff0000表示红色
返回：undefined
 */
function setHighLight(num){
    HIGH_LIGHT_COLOR = num;
}

/*
功能：获取点选高亮的颜色
参数：无
返回：颜色值：number
 */
function getHighLight(){
    return HIGH_LIGHT_COLOR;
}

/*
功能：配置添加标签功能，获取服务器端的标签
使用：全局配置
参数：后台数据地址,数据类型是字符串，字符串元素是标签图片的url
返回：true/false，成功/失败
 */
function configTags(url){
    $.ajax({
        url:url,
        type:'GET',
        success:function(data,statusText){
            data.forEach(function(item,index){
                var container = $('signals-container')
                container.html(container.html + '<div class="signal-item"> <img src="'+item+'" alt=""> </div>')
            })
            return true;
        },
        error:function(){
            return false;
        }

    })
}


/*
功能：定义点击基本信息时获取数据的全局方法
使用：需要主模块中有全局变量‘FETCH_FUNCTION’,然后使用该函数进行全局配置
参数：fetchFun,该函数接收一个参数name，参数标识所选择的物体，在函数体中根据name请求后台数据，最终根据后台的数据渲染页面，示例如下：
     function fetchFun(name){
        fetch(baseURL + name)
            .then(function(data){
                reRender(data);
            })
     }
 */
function fetchDetailData(fetchFun){
    FETCH_FUNCTION = fetchFun;
}


/*
 功能：定义添加标签后将标签数据写回后端的全局方法
 使用：需要主模块中有全局变量‘SEND_TAGINFO’,然后使用该函数进行全局配置
 参数：sendFun,该函数接收一个参数info，参数代表标签的所有信息（如：位置、所属构建、标签贴图等等），在函数体中将信息发送到后台进行保存等操作，例如：
     function sendFun(info){
         $.ajax({
            url:saveURL,
            data:info,
            type:'POST',
            success:function(){
                //success
            }
         })
     }
 */
function sendTagInfoToBE(sendFun){
    SEND_TAGINFO = sendFun;
}




