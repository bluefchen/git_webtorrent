/**
 * Created by huyonghao on 16/2/1.
 */


importScripts(["../lib/three.js"]);

onmessage=function(event){
    var x=event.data[0];
    var y=event.data[1];
    var z=event.data[2];
    var tag=event.data[3];
    countIndex(x,y,z,tag);
}

function countIndex(tongX,tongY,tongZ) {
    var drawSize = 20;
    var yMin = tongY - 2;
    var yMax = tongY + 2;
    var xMin = tongX - drawSize;
    var xMax = tongX + drawSize;
    var zMin = tongZ - drawSize;
    var zMax = tongZ + drawSize;




    for (var x = xMin; x < xMax; x++) {
        for (var z = zMin; z < zMax; z++) {
            for (var y = yMin; y < yMax; y++) {
                var tempIndex = x + "-" + z + "-" + y;
                postMessage(tempIndex);
                //switch (tag)
                //{
                //    case 0:
                //        var tempIndex = x + "-" + z + "-" + y;
                //        postMessage(tempIndex);
                //        break;
                //    case 1:
                //        if(x>0 && z>0){}
                //        else{
                //            var tempIndex = x + "-" + z + "-" + y;
                //            postMessage(tempIndex);
                //        }
                //        break;
                //    case 2:
                //        if(x>0 && z<0){}
                //        else{
                //            var tempIndex = x + "-" + z + "-" + y;
                //            postMessage(tempIndex);
                //        }
                //        break;
                //    case 3:
                //        if(x<0 && z>0){}
                //        else{
                //            var tempIndex = x + "-" + z + "-" + y;
                //            postMessage(tempIndex);
                //        }
                //        break;
                //    case 4:
                //        if(x<0 && z<0){}
                //        else{
                //            var tempIndex = x + "-" + z + "-" + y;
                //            postMessage(tempIndex);
                //        }
                //        break;
                //}
            }
        }
    }
    postMessage(-1);
}
