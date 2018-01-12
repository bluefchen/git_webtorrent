/**
 * Created by sse316 on 4/9/2017.
 * 精确点击功能
 */
/**
 * Created by sse316 on 4/7/2017.
 * 更新触控功能
 */
/**
 * Created by sse316 on 4/1/2017.
 * 更新摄像机的缩放功能与场景的材质贴图
 */
var parseTorrent = require('parse-torrent');
var path = require('path');
var fs = require("fs");
var torrent_current = parseTorrent(fs.readFileSync(path.join(__dirname, '../Shougang.torrent')));
console.log('torrent_current');
console.log(torrent_current);
console.log('torrent_current');
console.timeEnd("Parse Time");
console.time("add torrent");

$(function(){
    //webtorrent
    var torrentId = torrent_current;
    var client = new WebTorrent({tracker:true,dht:false });
    var blobUrl=[],webTorrentData=[];
    var webTorrentDataTemp;
    client.add(torrentId, function (torrent) {
        console.time("start connecting");
        console.time("start connecting"+ (new Date()).toLocaleTimeString());
        console.log('Client is downloading:', torrent.infoHash);
        console.timeEnd("add torrent");



        torrent.on('wire', function() {
            console.time("download complete");
            console.time("download start"+ (new Date()).toLocaleTimeString());

            console.timeEnd("start connecting");
        });
        console.time("download complete"+ (new Date()).toLocaleTimeString());
        console.timeEnd("download complete");

        torrent.files.forEach(function (file) {
            /*使用buffer.toString的方式*/
            file.getBuffer(function (err, buffer) {
                if (err) throw err;

                webTorrentDataTemp = buffer.toString();
                SendMessagetoWorkDforOutsideModel(webTorrentDataTemp);

            })

        });






    var scene;
    var camera,camControls;
    var clock = new THREE.Clock();
    var lables;

    var renderer;
    var stats = initStats();
    clock.start();
    var workerLoadMergedFile=new Worker("js/torrent/loadMergedFile_New.js");
    var workerLoadVsg = new Worker("js/loadBlockVsg.js");

    var windowWidth = window.innerWidth*0.85;
    var windowHeight = window.innerHeight;
    var windowStartX = window.innerWidth*0.15;
    var windowStartY = window.innerHeight*0.0;

    var currentControlType = 1;//右侧编辑栏的编辑tag

    var polyhedrons = [];//进行交互的构件

    //存放体素化数据
    var vsgData = {},vsgArr={},packageTag=0;


    var currentBlockName = "W";

    var preBlockName = "W";


    var cameraType = -1;

    var isTranslateGroup = true;

    var backPosition, jumpPosition;
    /***
     * 场景配置参数
     */
    var VoxelSize = 2.24103;
    var SceneBBoxMinX = -320.718;
    var SceneBBoxMinY = -202.163;
    var SceneBBoxMinZ = -21.6323;

    var isOutside; //判断是不是在外体，如果在外体，就让墙体的贴图为黄色，否则，为白色





    /**
     * 读取vsg文件同时批量下载模型dat
     * @param currentBlockName
     */
    function startDownloadNewBlock(currentBlockName) {
        isOnload = true;
        initValue();

        isOutside = false;
        workerLoadVsg.postMessage(currentBlockName);

    }

    initScene();
    $("#WebGL-output").append(renderer.domElement);

    var zoomInt = 1;
    renderer.domElement.addEventListener( 'wheel', mousewheel, false );
    function mousewheel( event ) {
        event.preventDefault();
        event.stopPropagation();

        console.log(event.wheelDelta);

        if(event.wheelDelta<0) {
            if(zoomInt<1)
            {
                zoomInt = zoomInt * 1.1;
            }
        }else {
            zoomInt = zoomInt / 1.1;
        }
        camera.setViewOffset( windowWidth, windowHeight, windowWidth*0.5-windowWidth*0.5*zoomInt, windowHeight*0.5-windowHeight*0.5*zoomInt, windowWidth * zoomInt, windowHeight * zoomInt );
    }


    function initScene() {
        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({antialias:true});
        // renderer.setClearColorHex(0xEEEEEE);
        // renderer.setPixelRatio( 1 );
        renderer.setSize(windowWidth, windowHeight);

        camera = new THREE.PerspectiveCamera(45, windowWidth / windowHeight, 0.1, 2000);
        // var intvalue = 20;
        // camera = new THREE.OrthographicCamera(windowWidth / (-1*intvalue), windowWidth / intvalue, windowHeight / intvalue, windowHeight /  (-1*intvalue), 0, 10000);
        camera.position.x = -60;
        camera.position.y = 24;
        camera.position.z = -55;
        camera.lookAt(new THREE.Vector3(-53,   0,   5));

        camControls = new THREE.TouchFPC(camera,renderer.domElement);
        camControls.lookSpeed = 0.8;
        camControls.movementSpeed = 10 * 1.5;
        camControls.noFly = true;
        camControls.lookVertical = true;
        camControls.constrainVertical = true;
        camControls.verticalMin = 1.0;
        camControls.verticalMax = 2.0;

        var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);

        var directionalLight_1 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_1.position.set(0.3,0.4,0.5)
        scene.add(directionalLight_1);

        var directionalLight_2 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_2 .position.set(-0.3,-0.4,0.5)
        scene.add(directionalLight_2);

        // initSkyBox();

        startDownloadNewBlock(currentBlockName);
    }

    function initSkyBox() {
        //skybox
        var imagePrefix = "assets/skybox/dawnmountain-";
        var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        var imageSuffix = ".png";
        var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );

        var materialArray = [];
        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add( skyBox );
    }


    render();

    var modelDataV = [];
    var modelDataT = [];
    var modelDataF = [];
    var modelDataM = [];
    var modelDataNewN = [];
    var triggerAreaMap = {};
    var outsideSourcesFileCount = 0;
    var triggerBoxs = [];
    var wallBoxs = [];
    var wallArr = [];
    var drawDataMap = {};
    var downArr = [],forArr = [];
    var fileLength = 0;
    var unDisplayModelArr = []; //用于存放移动之后的模型构件名称，当进行绘制时，会根据名称进行判断，在数组中的模型不会进行下载



    var isOnload = true; //判断是否在加载，如果在加载，render停掉

    var cashVoxelSize;
    var cashSceneBBoxMinX;
    var cashSceneBBoxMinY;
    var cashSceneBBoxMinZ;
    var cashtriggerAreaMap;
    var cashWallArr;
    var isJumpArea = true;
    var isShowTriggerArea = true;

    function initValue()
    {
        modelDataV = [];
        modelDataT = [];
        modelDataF = [];
        modelDataM = [];
        modelDataNewN = [];
        vsgData = [];
        vsgArr=[];
        outsideSourcesFileCount = 0;
        downArr = [];
        forArr = [];
        polyhedrons = [];
        drawDataMap = {};
        unDisplayModelArr = [];
        packageTag=0;
    }

    function SendMessagetoWorkDforOutsideModel(buffer)
    {
        var vsgMap = {};
        vsgArr=[];
        for(var key in vsgData)
        {
            for(var i=0;i<vsgData[key].length;i++)
            {
                if(!vsgMap[vsgData[key][i]])
                {
                    vsgMap[vsgData[key][i]] = 1;
                }
            }
        }
        for(var key in vsgMap)
        {
            vsgArr.push(key);
        }
        console.log("vsgArr length is:"+vsgArr.length);

        workerLoadMergedFile.postMessage(buffer);

    }

    workerLoadVsg.onmessage=function(event) {

        fileLength = event.data.blockFileNum;
        vsgData = event.data.vsgMap;
        cashVoxelSize = event.data.voxelSize;
        cashSceneBBoxMinX = event.data.sceneBBoxMinX;
        cashSceneBBoxMinY = event.data.sceneBBoxMinY;
        cashSceneBBoxMinZ = event.data.sceneBBoxMinZ;
        //需要获取到触发区域的值
        cashtriggerAreaMap = event.data.structureInfo;
        cashWallArr = event.data.wallInfoArr;

        if(isJumpArea)
        {
            isJumpArea = false;
            camera.position.x = event.data.originPos[0];
            camera.position.y = event.data.originPos[1];
            camera.position.z = event.data.originPos[2];
            if(cameraType==-1)
            {
                // camControls.targetObject.position.x = event.data.originPos[0];
                // camControls.targetObject.position.y = event.data.originPos[1];
                // camControls.targetObject.position.z = event.data.originPos[2];
                camControls.targetObject.position.set(event.data.originPos[0],event.data.originPos[1],event.data.originPos[2]);
                camControls.lon = event.data.originPos[3];
                camControls.lat = event.data.originPos[4];
            }

        }


        /**
         * 因为loadblockvsg和
         */
        // if(isTranslateGroup) {
        //     isTranslateGroup = false;
        // }
        // else {
        //     isTranslateGroup = true;
        //     TranslateGroup();
        //     console.log("调用 TranslateGroup() 在loadvsg中的isFirstLoad");
        // }
        //

        TranslateGroup();


        //var vsgMap = {};
        //for(var key in vsgData)
        //{
        //    for(var i=0;i<vsgData[key].length;i++)
        //    {
        //        if(!vsgMap[vsgData[key][i]])
        //        {
        //            vsgMap[vsgData[key][i]] = 1;
        //        }
        //    }
        //}
        //for(var key in vsgMap)
        //{
        //    vsgArr.push(key);
        //}
        //console.log("vsgArr length is:"+vsgArr.length);
        //
        //webtorrent时取消
        //for(var i=0;i<=45;i++)
        //{
        //    workerLoadMergedFile.postMessage(currentBlockName+"_"+i);
        //}


    };


    workerLoadMergedFile.onmessage = function (event) {
        var Data=event.data;
        if(Data.data_tag!=null)
        {
            if(Data.data_tag==1) {
                //发送下一个数据下载请求，map设置对应的key-value
                // console.log("1. Data.data_type is:" + Data.data_type);
                drawDataMap[Data.data_type] = [];

            }else{
                //收到块加载完成的消息，开始绘制
                // isOnload = false;
                //开始绘制当前数据
                DrawModel(Data.data_type);

                packageTag++;
                if(currentBlockName=="Tongyan")
                {
                    if(packageTag==23)
                    {
                        isOnload = false;
                        console.log("Finish Tongyan");
                        $.get("http://www.shxt3d.com:8082/loadover", {
                        },function(data){
                            console.log(data);
                        });
                    }
                }
                if(currentBlockName=="W")
                {
                    if(packageTag==45)
                    {
                        isOnload = false;
                        console.log("Finish Shougang");
                        $.get("http://www.shxt3d.com:8082/loadover", {
                        },function(data){
                            console.log(data);
                        });
                    }
                }
            }
        }
        else
        {
            if(!drawDataMap[Data.type]) drawDataMap[Data.type] = [];
            // console.log("2. Data.data_type is:" + Data.data_type + "Data.name is" + Data.nam);
            drawDataMap[Data.type].push(Data.nam);


            if(Data.newFileName)
            {
                var tempKeyValue = Data.nam;
                if(!modelDataNewN[tempKeyValue])
                {
                    modelDataNewN[tempKeyValue] = [];
                }
                if(!modelDataM[tempKeyValue])
                {
                    modelDataM[tempKeyValue] = [];
                }
                modelDataNewN[tempKeyValue] = Data.newFileName;
                modelDataM[tempKeyValue] = Data.m;
            }
            else{
                var tempKeyValue = Data.nam;
                if(!modelDataV[tempKeyValue])
                {
                    modelDataV[tempKeyValue] = [];
                }
                if(!modelDataT[tempKeyValue])
                {
                    modelDataT[tempKeyValue] = [];
                }
                if(!modelDataF[tempKeyValue])
                {
                    modelDataF[tempKeyValue] = [];
                }
                for(var dataCount = 0; dataCount<Data.v.length;dataCount++)
                {
                    modelDataV[tempKeyValue].push(Data.v[dataCount]);
                    modelDataT[tempKeyValue].push(Data.t[dataCount]);
                    modelDataF[tempKeyValue].push(Data.f[dataCount]);
                }
            }
            Data = null;
            outsideSourcesFileCount++;

            //修改HTML标签内容
            var progress = Math.floor(100*outsideSourcesFileCount/vsgArr.length);
            document.getElementById('progressLable').innerHTML = progress + "%";
        }
    }



    function TranslateGroup()
    {
        console.log("调用 TranslateGroup()");
        VoxelSize = cashVoxelSize;
        SceneBBoxMinX = cashSceneBBoxMinX;
        SceneBBoxMinY = cashSceneBBoxMinY;
        SceneBBoxMinZ = cashSceneBBoxMinZ;
        triggerAreaMap = cashtriggerAreaMap;
        wallArr = cashWallArr;
        // console.log(triggerAreaMap)

        if(isShowTriggerArea)
        {
            while(triggerBoxs.length){
                scene.remove(triggerBoxs.pop());
            }
            //console.log("wallBoxs length is:" + wallBoxs.length);
            while(wallBoxs.length){
                scene.remove(wallBoxs.pop());
            }
            wallBoxs = [];

            for(var i in triggerAreaMap){

                if(triggerAreaMap.hasOwnProperty(i)){

                    for(var j = 0;j < triggerAreaMap[i].length;j ++){

                        //console.log(triggerAreaMap[i])

                        var triggerX = Number(triggerAreaMap[i][j][3]);
                        var triggerY = triggerAreaMap[i][j][7];
                        var triggerZ = triggerAreaMap[i][j][8];

                        var sphereGeo = new THREE.CubeGeometry(2*triggerX,2*triggerY,2*triggerZ);


                        var sphereMesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({
                            opacity:0.5,
                            color: 0x000000,
                            transparent:true,
                            wireframe: false,
                            side: THREE.DoubleSide
                        }));
                        sphereMesh.position.x =   Number(triggerAreaMap[i][j][0]);
                        sphereMesh.position.z =  Number(triggerAreaMap[i][j][1]);
                        sphereMesh.position.y =  Number(triggerAreaMap[i][j][2]);
                        scene.add(sphereMesh);

                        triggerBoxs.push(sphereMesh);
                    }
                }
            }

            if(wallArr)
            {
                for(var m=0;m<wallArr.length;m++)
                {
                    var posX = Number(wallArr[m][0]);
                    var posY = Number(wallArr[m][1]);
                    var posZ = Number(wallArr[m][2]);
                    var boxX = Number(wallArr[m][3]);
                    var boxY = Number(wallArr[m][4]);
                    var boxZ = Number(wallArr[m][5]);

                    var sphereGeo = new THREE.CubeGeometry(2*boxX,2*boxY,2*boxZ);


                    var sphereMesh = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
                        opacity:0.5,
                        transparent:false,
                        //color: 0x0099ff,
                        color:0x000000,
                        alphaTest:1,
                        wireframe: false,
                    }));
                    sphereMesh.position.x =  posX;
                    sphereMesh.position.y =  posY;
                    sphereMesh.position.z =  posZ;
                    scene.add(sphereMesh);
                    // sphereMesh.visible = false;

                    wallBoxs.push(sphereMesh);
                    forArr.push(sphereMesh);
                    downArr.push(sphereMesh);
                }
            }

        }
    }

    function DrawModel(tag)
    {
        var IfcFootingGeo = new THREE.Geometry(),
            IfcWallStandardCaseGeo = new THREE.Geometry(),
            IfcSlabGeo = new THREE.Geometry(),
            IfcStairGeo = new THREE.Geometry(),
            IfcStairFlightGeo = new THREE.Geometry(),
            IfcDoorGeo = new THREE.Geometry(),
            IfcWindowGeo = new THREE.Geometry(),
            IfcBeamGeo = new THREE.Geometry(),
            IfcCoveringGeo = new THREE.Geometry(),
            IfcFlowSegmentGeo = new THREE.Geometry(),
            IfcWallGeo = new THREE.Geometry(),
            IfcRampFlightGeo = new THREE.Geometry(),
            IfcRailingGeo = new THREE.Geometry(),
            IfcFlowTerminalGeo = new THREE.Geometry(),
            IfcBuildingElementProxyGeo  = new THREE.Geometry(),
            IfcColumnGeo = new THREE.Geometry(),
            IfcFlowControllerGeo = new THREE.Geometry(),
            IfcFlowFittingGeo = new THREE.Geometry(),
            IfcMemberGeo = new THREE.Geometry(),
            IfcPlateGeo = new THREE.Geometry(),
            IfcFurnishingElementGeo = new THREE.Geometry(),
            IfcRoofGeo = new THREE.Geometry(),
            IfcSiteGeo = new THREE.Geometry();

        var tempName = drawDataMap[tag][0];
        if(tempName)
        {
            var typeIndex = tempName.indexOf("=");
            var packageType = tempName.slice(typeIndex+1);

            for(var i=0; i<drawDataMap[tag].length; i++)
            {
                var tempFileName = drawDataMap[tag][i];

                if(tempFileName!=null && unDisplayModelArr.indexOf(tempFileName)==-1)
                {
                    if (modelDataNewN[tempFileName]) {
                        //if (false) {

                        var newName = modelDataNewN[tempFileName];
                        var matrix = modelDataM[tempFileName];
//                            处理V矩阵，变形
                        if(modelDataV[newName])
                        {
                            modelDataV[tempFileName] = [];
                            for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++)
                            {
                                var vMetrix = [];
                                var tMetrix = [];
                                //var vArrary = [];
                                for (var j = 0; j < modelDataV[newName][dataCount].length; j += 3) {
                                    var newN1 = modelDataV[newName][dataCount][j] * matrix[0] + modelDataV[newName][dataCount][j + 1] * matrix[4] + modelDataV[newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
                                    var newN2 = modelDataV[newName][dataCount][j] * matrix[1] + modelDataV[newName][dataCount][j + 1] * matrix[5] + modelDataV[newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
                                    var newN3 = modelDataV[newName][dataCount][j] * matrix[2] + modelDataV[newName][dataCount][j + 1] * matrix[6] + modelDataV[newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
                                    //var groupV = new THREE.Vector3(-1*newN1, newN3, newN2);
                                    var groupV = new THREE.Vector3(newN1, newN3, newN2);
                                    vMetrix.push(groupV);
                                    //vArrary.push(newN1);
                                    //vArrary.push(newN2);
                                    //vArrary.push(newN3);
                                }
                                //modelDataV[tempFileName].push(vArrary);
                                //处理T矩阵
                                for (var m = 0; m < modelDataT[newName][dataCount].length; m += 3) {
                                    var newT1 = 1.0 * modelDataT[newName][dataCount][m];
                                    var newT2 = 1.0 * modelDataT[newName][dataCount][m + 1];
                                    var newT3 = 1.0 * modelDataT[newName][dataCount][m + 2];
                                    //var newF1 = 1.0 * modelDataF[newName][dataCount][m] * matrix[0] + modelDataF[newName][dataCount][m + 1] * matrix[4] + modelDataF[newName][dataCount][m + 2] * matrix[8] + 1.0 * matrix[12];
                                    //var newF2 = 1.0 * modelDataF[newName][dataCount][m] * matrix[1] + modelDataF[newName][dataCount][m + 1] * matrix[5] + modelDataF[newName][dataCount][m + 2] * matrix[9] + 1.0 * matrix[13];
                                    //var newF3 = 1.0 * modelDataF[newName][dataCount][m] * matrix[2] + modelDataF[newName][dataCount][m + 1] * matrix[6] + modelDataF[newName][dataCount][m + 2] * matrix[10]+ 1.0 * matrix[14];
                                    var newF1 = 1.0 * modelDataF[newName][dataCount][m];
                                    var newF2 = 1.0 * modelDataF[newName][dataCount][m + 1];
                                    var newF3 = 1.0 * modelDataF[newName][dataCount][m + 2];
                                    var norRow = new THREE.Vector3(newF1, newF2, newF3);
                                    var grouT = new THREE.Face3(newT1, newT2, newT3);
                                    grouT.normal = norRow;
                                    tMetrix.push(grouT);
                                }
                                //绘制
                                var geometry = new THREE.Geometry();
                                geometry.vertices = vMetrix;
                                geometry.faces = tMetrix;
                                var pos=tempFileName.indexOf("=");
                                var ind=tempFileName.substring(pos+1);
                                if(ind) {
                                    switch (ind) {
                                        case"IfcFooting":
                                            IfcFootingGeo.merge(geometry);
                                            break;
                                        case "IfcWallStandardCase"://ok
                                            IfcWallStandardCaseGeo.merge(geometry);
                                            break;
                                        case "IfcSlab"://ok
                                            IfcSlabGeo.merge(geometry);
                                            break;
                                        case "IfcStair"://ok
                                            IfcStairGeo.merge(geometry);
                                            break;
                                        case "IfcDoor"://ok
                                            IfcDoorGeo.merge(geometry);
                                            break;
                                        case "IfcWindow":
                                            IfcWindowGeo.merge(geometry);
                                            break;
                                        case "IfcBeam"://ok
                                            IfcBeamGeo.merge(geometry);
                                            break;
                                        case "IfcCovering":
                                            IfcCoveringGeo.merge(geometry);
                                            break;
                                        case "IfcFlowSegment"://ok
                                            IfcFlowSegmentGeo.merge(geometry);
                                            break;
                                        case "IfcWall"://ok
                                            IfcWallGeo.merge(geometry);
                                            break;
                                        case "IfcRampFlight":
                                            IfcRampFlightGeo.merge(geometry);
                                            break;
                                        case "IfcRailing"://ok
                                            IfcRailingGeo.merge(geometry);
                                            break;
                                        case "IfcFlowTerminal"://ok
                                            IfcFlowTerminalGeo.merge(geometry);
                                            break;
                                        case "IfcBuildingElementProxy"://ok
                                            IfcBuildingElementProxyGeo.merge(geometry);
                                            break;
                                        case "IfcColumn"://ok
                                            IfcColumnGeo.merge(geometry);
                                            break;
                                        case "IfcFlowController"://ok
                                            IfcFlowControllerGeo.merge(geometry);
                                            break;
                                        case "IfcFlowFitting"://ok
                                            IfcFlowFittingGeo.merge(geometry);
                                            break;
                                        case"IfcStairFlight":
                                            IfcStairFlightGeo.merge(geometry);
                                            break;
                                        case"IfcMember":
                                            IfcMemberGeo.merge(geometry);
                                            break;
                                        case"IfcPlate":
                                            IfcPlateGeo.merge(geometry);
                                            break;
                                        case"IfcSite":
                                            IfcSiteGeo.merge(geometry);
                                            break;
                                        case"IfcRoof":
                                            IfcRoofGeo.merge(geometry);
                                            break;
                                        case"IfcFurnishingElement":
                                            IfcFurnishingElementGeo.merge(geometry);
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                        }
                        else
                        {
                            console.log("找不到modelDataV中对应的newName: "+newName);
                        }
                    }
                    else if (modelDataV[tempFileName] && !modelDataNewN[tempFileName]) {
                        for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++)
                        {
                            var vMetrix = [];
                            var tMetrix = [];
                            //处理V矩阵，变形
                            for (var j = 0; j < modelDataV[tempFileName][dataCount].length; j += 3) {
                                var newn1 = 1.0 * modelDataV[tempFileName][dataCount][j];
                                var newn2 = 1.0 * modelDataV[tempFileName][dataCount][j + 1];
                                var newn3 = 1.0 * modelDataV[tempFileName][dataCount][j + 2];
                                var groupV = new THREE.Vector3(newn1, newn3, newn2);
                                vMetrix.push(groupV);
                            }
                            //处理T矩阵
                            for (var m = 0; m < modelDataT[tempFileName][dataCount].length; m += 3) {
                                var newT1 = 1.0 * modelDataT[tempFileName][dataCount][m];
                                var newT2 = 1.0 * modelDataT[tempFileName][dataCount][m + 1];
                                var newT3 = 1.0 * modelDataT[tempFileName][dataCount][m + 2];
                                var newF1 = 1.0 * modelDataF[tempFileName][dataCount][m];
                                var newF2 = 1.0 * modelDataF[tempFileName][dataCount][m + 1];
                                var newF3 = 1.0 * modelDataF[tempFileName][dataCount][m + 2];
                                var norRow = new THREE.Vector3(newF1, newF2, newF3);
                                var groupF = new THREE.Face3(newT1, newT2, newT3);
                                groupF.normal = norRow;
                                tMetrix.push(groupF);
                            }

                            //绘制
                            var geometry = new THREE.Geometry();
                            geometry.vertices = vMetrix;
                            geometry.faces = tMetrix;
                            var pos=tempFileName.indexOf("=");
                            var ind=tempFileName.substring(pos+1);
                            if(ind) {
                                switch (ind) {
                                    case"IfcFooting":
                                        IfcFootingGeo.merge(geometry);
                                        break;
                                    case "IfcWallStandardCase"://ok
                                        IfcWallStandardCaseGeo.merge(geometry);
                                        break;
                                    case "IfcSlab"://ok
                                        IfcSlabGeo.merge(geometry);
                                        break;
                                    case "IfcStair"://ok
                                        IfcStairGeo.merge(geometry);
                                        break;
                                    case "IfcDoor"://ok
                                        IfcDoorGeo.merge(geometry);
                                        break;
                                    case "IfcWindow":
                                        IfcWindowGeo.merge(geometry);
                                        break;
                                    case "IfcBeam"://ok
                                        IfcBeamGeo.merge(geometry);
                                        break;
                                    case "IfcCovering":
                                        IfcCoveringGeo.merge(geometry);
                                        break;
                                    case "IfcFlowSegment"://ok
                                        IfcFlowSegmentGeo.merge(geometry);
                                        break;
                                    case "IfcWall"://ok
                                        IfcWallGeo.merge(geometry);
                                        break;
                                    case "IfcRampFlight":
                                        IfcRampFlightGeo.merge(geometry);
                                        break;
                                    case "IfcRailing"://ok
                                        IfcRailingGeo.merge(geometry);
                                        break;
                                    case "IfcFlowTerminal"://ok
                                        IfcFlowTerminalGeo.merge(geometry);
                                        break;
                                    case "IfcBuildingElementProxy"://ok
                                        IfcBuildingElementProxyGeo.merge(geometry);
                                        break;
                                    case "IfcColumn"://ok
                                        IfcColumnGeo.merge(geometry);
                                        break;
                                    case "IfcFlowController"://ok
                                        IfcFlowControllerGeo.merge(geometry);
                                        break;
                                    case "IfcFlowFitting"://ok
                                        IfcFlowFittingGeo.merge(geometry);
                                        break;
                                    case"IfcStairFlight":
                                        IfcStairFlightGeo.merge(geometry);
                                        break;
                                    case"IfcMember":
                                        IfcMemberGeo.merge(geometry);
                                        break;
                                    case"IfcPlate":
                                        IfcPlateGeo.merge(geometry);
                                        break;
                                    case"IfcSite":
                                        IfcSiteGeo.merge(geometry);
                                        break;
                                    case"IfcRoof":
                                        IfcRoofGeo.merge(geometry);
                                        break;
                                    case"IfcFurnishingElement":
                                        IfcFurnishingElementGeo.merge(geometry);
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                    else {
                        console.log(tag+"找不到模型啦！");
                    }
                }
            }

            /**
             * polyhedrons 是用来进行交互的构件
             */
            var scale = 1;
            switch (packageType) {
                case"IfcFooting":
                    var polyhedron = createMesh(IfcFootingGeo,currentBlockName,"IfcFooting",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWallStandardCase"://ok
                    var polyhedron = createMesh(IfcWallStandardCaseGeo,currentBlockName,"IfcWallStandardCase",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcSlab"://ok
                    var polyhedron = createMesh(IfcSlabGeo,currentBlockName,"IfcSlab",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcStair"://ok
                    var polyhedron = createMesh(IfcStairGeo,currentBlockName,"IfcStair",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcStairFlight"://ok
                    var polyhedron = createMesh(IfcStairFlightGeo,currentBlockName,"IfcStairFlight",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcDoor"://ok
                    var polyhedron = createMesh(IfcDoorGeo,currentBlockName,"IfcDoor",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWindow":
                    var polyhedron = createMesh(IfcWindowGeo,currentBlockName,"IfcWindow",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcBeam"://ok
                    var polyhedron = createMesh(IfcBeamGeo,currentBlockName,"IfcBeam",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcCovering":
                    var polyhedron = createMesh(IfcCoveringGeo,currentBlockName,"IfcCovering",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowSegment"://ok
                    var polyhedron = createMesh(IfcFlowSegmentGeo,currentBlockName,"IfcFlowSegment",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWall"://ok
                    var polyhedron = createMesh(IfcWallGeo,currentBlockName,"IfcWall",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRampFlight":
                    var polyhedron = createMesh(IfcRampFlightGeo,currentBlockName,"IfcRampFlight",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRailing"://ok
                    var polyhedron = createMesh(IfcRailingGeo,currentBlockName,"IfcRailing",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowTerminal"://ok
                    var polyhedron = createMesh(IfcFlowTerminalGeo,currentBlockName,"IfcFlowTerminal",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcBuildingElementProxy"://ok
                    var polyhedron = createMesh(IfcBuildingElementProxyGeo,currentBlockName,"IfcBuildingElementProxy",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcColumn"://ok
                    var polyhedron = createMesh(IfcColumnGeo,currentBlockName,"IfcColumn",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowController"://ok
                    var polyhedron = createMesh(IfcFlowControllerGeo,currentBlockName,"IfcFlowController",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowFitting"://ok
                    var polyhedron = createMesh(IfcFlowFittingGeo,currentBlockName,"IfcFlowFitting",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcMember"://ok
                    var polyhedron = createMesh(IfcMemberGeo,currentBlockName,"IfcMember",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcPlate"://ok
                    var polyhedron = createMesh(IfcPlateGeo,currentBlockName,"IfcPlate",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcSite"://ok
                    var polyhedron = createMesh(IfcSiteGeo,currentBlockName,"IfcSite",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRoof"://ok
                    var polyhedron = createMesh(IfcRoofGeo,currentBlockName,"IfcRoof",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFurnishingElement"://ok
                    var polyhedron = createMesh(IfcFurnishingElementGeo,currentBlockName,"IfcFurnishingElement",tag);
                    polyhedron.scale.set(scale,scale,scale);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                default:
                    break;

            }
        }


    }

    function destroyGroup()
    {
        downArr = [];
        forArr = [];
        var deleteNameArr = [];
        for(var i=0; i<scene.children.length;i++)
        {
            if(scene.children[i].name)
            {
                // console.log(scene.children[i].name);
                var pos = scene.children[i].name.indexOf("_");
                if(scene.children[i].name.substring(0,pos) == preBlockName)
                {
                    scene.children[i].geometry.dispose();
                    scene.children[i].geometry.vertices = null;
                    scene.children[i].geometry.faces = null;
                    scene.children[i].geometry.faceVertexUvs = null;
                    scene.children[i].geometry = null;
                    scene.children[i].material.dispose();
                    scene.children[i].material = null;
                    scene.children[i].children = [];
                    deleteNameArr.push(scene.children[i].name);
                }
            }
        }
        for(var i=0; i<deleteNameArr.length;i++)
        {
            var deleteObject = scene.getObjectByName(deleteNameArr[i]);
            scene.remove(deleteObject);
            deleteObject = null;
        }
    }

    /*
     点击左边按钮的触发事件
     */
    $('.left button').on('click',function(e){
        isCamRotate = false;
        xx=1;isRend=1;
        var btnClickedId = e.target.id;
        console.log(btnClickedId);

        if(currentBlockName!=btnClickedId && !isOnload)
        {
            isOnload = true;
            isJumpArea = true;
            preBlockName = currentBlockName;
            currentBlockName = btnClickedId;
            startDownloadNewBlock(currentBlockName);
            destroyGroup();
        }
    })


    function initStats() {

        var stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append( stats.domElement );

        return stats;
    }

    window.addEventListener('resize',onWindowResize,true);

    function onWindowResize(){
        camera.aspect=window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
        //renderer.render(scene,camera);
    }




    var isRend=1;
    function render() {

        stats.update();
        var delta = clock.getDelta();
        camControls.update(delta);
        requestAnimationFrame(render);
        renderer.render(scene, camera);

    }



    var texture3_1 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_wall.png' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture3_1.anisotropy = maxAnisotropy;
    texture3_1.wrapS = texture3_1.wrapT = THREE.RepeatWrapping;
    texture3_1.repeat.set( 3, 0.75 );
    var material3_1 = new THREE.MeshPhongMaterial( { color: 0xaeb1b3, map: texture3_1,side: THREE.DoubleSide,shininess:100,opacity:1,transparent:true});

    var texture3_2 = THREE.ImageUtils.loadTexture( './assets/textures/floor2.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture3_2.anisotropy = maxAnisotropy;
    texture3_2.wrapS = texture3_2.wrapT = THREE.RepeatWrapping;
    texture3_2.repeat.set( 1, 1 );
    var material3_2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture3_2,side: THREE.DoubleSide,shininess:100,opacity:1,transparent:true});



    var texture4 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_column.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture4.anisotropy = maxAnisotropy;
    texture4.wrapS = texture4.wrapT = THREE.RepeatWrapping;
    texture4.repeat.set( 1, 1 );
    var material4 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture4,side: THREE.DoubleSide,shininess:100,opacity:1,transparent:true});




    function createMesh(geom,block,nam,tag) {

        if(!tag) tag = 0;

        //console.log(nam)
        var start = nam.indexOf('=')+1;
        var end = nam.indexOf('-');

        var trueName = nam.slice(start,end);
        //console.log(trueName)




        var mesh;
        var color = new THREE.Color( 0xff0000 );
        var myOpacity = 1;
        switch (nam) {
            case"IfcFooting":
                color =new THREE.Color( 0xFFBFFF );
                break;
            case "IfcWallStandardCase"://ok
                color =new THREE.Color( 0xaeb1b3 );
                break;
            case "IfcSlab"://ok
                color = new THREE.Color( 0x505050 );
                // myOpacity = 0.9;
                break;
            case "IfcStair"://ok
                color =new THREE.Color( 0xa4a592 );
                break;
            case "IfcDoor"://ok
                color =new THREE.Color( 0x6f6f6f );
                break;
            case "IfcWindow":
                color =new THREE.Color( 0x9ea3ef );
                break;
            case "IfcBeam"://ok
                color =new THREE.Color( 0x949584 );
                break;
            case "IfcCovering":
                color = new THREE.Color( 0x777a6f );
                break;
            case "IfcFlowSegment"://ok
                color = new THREE.Color( 0x999999 );
                break;
            case "IfcWall"://ok
                color = new THREE.Color( 0xbb9f7c );
                break;
            case "IfcRamp":
                color = new THREE.Color( 0x4d5053 );
                break;
            case "IfcRailing"://ok
                color = new THREE.Color( 0x4f4f4f );
                break;
            case "IfcFlowTerminal"://ok
                // color = new THREE.Color( 0xe9f5f8 );
                color = new THREE.Color( 0xd5d5d5 );
                break;
            case "IfcBuildingElementProxy"://ok
                color = new THREE.Color( 0x6f6f6f );
                // myOpacity = 0.7;
                break;
            case "IfcColumn"://ok
                color = new THREE.Color( 0x8a8f80 );
                break;
            case "IfcFlowController"://ok
                color = new THREE.Color( 0x2c2d2b );
                break;
            case "IfcFlowFitting"://ok
                color = new THREE.Color( 0x93a5aa );
                break;
            case "IfcPlate"://ok外体窗户
                color = new THREE.Color( 0x2a4260 );
                break;
            case "IfcMember"://ok外体窗户
                color = new THREE.Color( 0x2f2f2f );
                break;
            default:
                color = new THREE.Color( 0x194354 );
                break;

        }

        var material0 = new THREE.MeshPhongMaterial({ color: color, specular: 0xffae00,side: THREE.DoubleSide});


        geom.computeFaceNormals();  //有前面还先有个computeFaceNormal的操作，因为没有计算的话直接就使用normal的话可能得到不确定的normal


        /**
         * 根据UV坐标来贴上贴图
         */
        switch (nam) {
            //case"IfcFooting":
            //
            //    mesh = new THREE.Mesh(geom, material2);
            //    break;
            // case "IfcWallStandardCase"://ok
            //     if(geom.faces[0])
            //     {
            //         for(var i=0; i<geom.faces.length; ++i)
            //         {
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     if(isOutside)
            //     {
            //         mesh = new THREE.Mesh(geom, material3_1);
            //     }
            //     else
            //     {
            //         mesh = new THREE.Mesh(geom, material3_2);
            //     }
            //     break;
            // case "IfcSlab"://ok
            //     if(geom.faces[0]){
            //
            //         for(var i=0; i<geom.faces.length; ++i)
            //         {
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     // mesh = new THREE.Mesh(geom, material7);
            //     mesh = new THREE.Mesh(geom, material0);
            //     break;
            //case "IfcStair"://ok
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcDoor"://ok
            //
            //    mesh = new THREE.Mesh(geom, material2);
            //    break;
            // case "IfcWindow":
            //     if(geom.faces[0]){
            //         var normal = geom.faces[0].normal;
            //         var directU,directV;
            //         if(String(normal.x) === '1'){
            //             directU = new THREE.Vector3(0,1,0);
            //             directV = new THREE.Vector3(0,0,1);
            //         }else if(String(normal.y) === '1'){
            //             directU = new THREE.Vector3(1,0,0);
            //             directV = new THREE.Vector3(0,0,1);
            //         }else{
            //             directU = new THREE.Vector3(0,1,0);
            //             directV = new THREE.Vector3(1,0,0);
            //         }
            //
            //         for(var i=0; i<geom.faces.length; ++i){
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     mesh = new THREE.Mesh(geom, material11);
            //     break;
            //case "IfcBeam"://ok
            //
            //    mesh = new THREE.Mesh(geom, material9);
            //    break;
            //case "IfcCovering":
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcFlowSegment"://ok
            //
            //    mesh = new THREE.Mesh(geom, material5);
            //    break;
            // case "IfcWall"://ok
            //     if(geom.faces[0]){
            //         for(var i=0; i<geom.faces.length; ++i)
            //         {
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     if(isOutside)
            //     {
            //         mesh = new THREE.Mesh(geom, material3_1);
            //     }
            //     else
            //     {
            //         mesh = new THREE.Mesh(geom, material3_2);
            //     }
            //     break;
            //case "IfcRamp":
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcRailing"://ok
            //
            //    mesh = new THREE.Mesh(geom, material8);
            //    break;
            //case "IfcFlowTerminal"://ok
            //
            //    mesh = new THREE.Mesh(geom, material9);
            //    break;
            //case "IfcBuildingElementProxy"://ok
            //
            //    mesh = new THREE.Mesh(geom, material5);
            //    break;
            // case "IfcColumn"://ok
            //     if(geom.faces[0]){
            //
            //
            //         for(var i=0; i<geom.faces.length; ++i){
            //             var normal = geom.faces[i].normal;
            //             normal.normalize();
            //             var directU,directV;
            //             if(String(normal.x) === '1' || String(normal.x) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //             else if(String(normal.z) === '1' || String(normal.z) === '-1')
            //             {
            //                 directU = new THREE.Vector3(0,1,0);
            //                 directV = new THREE.Vector3(1,0,0);
            //             }
            //             else
            //             {
            //                 directU = new THREE.Vector3(1,0,0);
            //                 directV = new THREE.Vector3(0,0,1);
            //             }
            //
            //             var uvArray = [];
            //             for(var j=0; j<3; ++j) {
            //                 var point;
            //                 if(j==0)
            //                     point = geom.vertices[geom.faces[i].a];
            //                 else if(j==1)
            //                     point = geom.vertices[geom.faces[i].b];
            //                 else
            //                     point = geom.vertices[geom.faces[i].c];
            //
            //                 var tmpVec = new THREE.Vector3();
            //                 tmpVec.subVectors(point, geom.vertices[0]);
            //
            //                 var u = tmpVec.dot(directU);
            //                 var v = tmpVec.dot(directV);
            //
            //                 uvArray.push(new THREE.Vector2(u, v));
            //             }
            //             geom.faceVertexUvs[0].push(uvArray);
            //         }
            //     }
            //     mesh = new THREE.Mesh(geom, material4);
            //     break;
            //case "IfcFlowController"://ok
            //
            //    mesh = new THREE.Mesh(geom, material1);
            //    break;
            //case "IfcFlowFitting"://ok
            //
            //    mesh = new THREE.Mesh(geom, material8);
            //    break;
            default:
                mesh = new THREE.Mesh(geom, material0);
                break;
        }

        mesh.name = block+"_"+nam+"-"+tag;

        return mesh;

    }



    $('.property button').on('click',function(e){

        var btnClickedId = e.target.id;
        //改现操作模式currentControlType
        // console.log(btnClickedId[btnClickedId.length-1]);
        if(currentControlType==1){
            // unDisplayModelArr = [];
            if(editInfoSelectedObj)
            {
                scene.remove(editInfoSelectedObj);
                polyhedrons.splice(polyhedrons.length-2,1);
            }
            renderer.render(scene,camera);
        }
        if(currentControlType==2){
            console.log("add");
            //清除构件高亮状态以及删除坐标轴
            scene.remove(transformControls);
            if (SELECTED) {
                SELECTED.material = selectedOriginMat;
                // scene.remove(SELECTED);
                // SELECTED = null;
            }

            renderer.render(scene,camera);
            //此处判断逻辑有待完善(待更改的材质赋值时，groupMat为空)--TransformControls.js:1257 Uncaught TypeError: Cannot read property 'length' of undefined
            // if (muti_group.length > 0) {
            //     for (i = 0; i < muti_group.length; i++) {
            //         for (j = 0; j < muti_group[i].children.length; j++) {
            //             muti_group[i].children[j].material = groupMat[i][j];
            //         }
            //     }
            // }
        }
        currentControlType = btnClickedId[btnClickedId.length-1];
        console.log("currentControlType: " + currentControlType);


    });
    })
});