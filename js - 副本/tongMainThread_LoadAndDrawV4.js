/**
 * Created by sse316 on 11/9/2016.
 */

/**
 * Created by sse316 on 7/9/2016.
 */


/**
 * Created by huyonghao on 16/6/15.
 */

$(function(){

    //默认配置
    var HIGH_LIGHT_COLOR = 0xff0000;
    var FETCH_FUNCTION = function(name){
        console.log('fetch data ' + name);
    }
    var SEND_TAGINFO = function(info){
        console.log('send data to back:');
        console.log(info)
    }



    //end



    var isShowTriggerArea = true;


    var triggerBoxs = [];
    var wallBoxs = [];
    var isJumpArea = true;

    var cameraX,cameraY,cameraZ;

    var stats = initStats();

    var workerLoadVsg=new Worker("js/loadBlockVsg.js");
    var workerDout=new Worker("js/loadMergedFile_New.js");
    var currentBlcokName = "W";
    var preBlockName = "W";


    var isFirstLoad = true;

    /***
     * 场景配置参数
     */
    var VoxelSize = 2.24103;
    var SceneBBoxMinX = -320.718;
    var SceneBBoxMinY = -202.163;
    var SceneBBoxMinZ = -21.6323;

    var renderer = new THREE.WebGLRenderer({antialias:true});
    $("#WebGL-output").append(renderer.domElement);
    //renderer.setClearColorHex(0xEEEEEE);
    renderer.setSize(window.innerWidth-200, window.innerHeight-3);

    var scene=new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, (window.innerWidth-200) / window.innerHeight, 0.1, 2000);


    camera.position.x = 34;
    camera.position.y = -1;
    camera.position.z = 67;

    workerLoadVsg.postMessage(currentBlcokName);

    var clock = new THREE.Clock();
    var camControls = new THREE.MyFPC(camera,renderer.domElement);

    camControls.lookSpeed = 0.8;
    camControls.movementSpeed = 5 * 1.5;
    camControls.noFly = true;
    camControls.lookVertical = true;
    camControls.constrainVertical = true;
    camControls.verticalMin = 1.0;
    camControls.verticalMax = 2.0;
    //camControls.lon = 220;      //经度
    //camControls.lat = -30;        //纬度

    var imagePrefix = "assets/skybox/sky_";
    var directions  = ["negX", "posX", "posY", "negY", "posZ", "negZ"];
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




    var ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);


    var directionLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionLight.position.set( 0, -1, 1 );
    scene.add( directionLight );


    var lables = new function(){
        this.CameraPosition = "0,0,0";
        this.cameraY = camera.position.y;
        this.cameraZ = camera.position.z;
        this.cameraTongX = Math.round((camera.position.x - (-322.959) )/2.31483);
        this.cameraTongZ = Math.round((camera.position.z - (-205.87 ) )/2.31483);
        this.cameraTongY = Math.round((camera.position.y - (-25.4188 ) )/2.31483);
        this.pointX = camControls.targetObject.position.x;
        this.pointY = camControls.targetObject.position.y;
        this.pointZ = currentBlcokName;
    }

    // var gui = new dat.GUI();
    // gui.domElement.id = 'gui';
    // gui.add(lables,'CameraPosition').listen();
    //gui.add(lables,'cameraY').listen();
    //gui.add(lables,'cameraZ').listen();
    //gui.add(lables,'cameraTongX').listen();
    //gui.add(lables,'cameraTongY').listen();
    //gui.add(lables,'cameraTongZ').listen();
    //gui.add(lables,'pointX').listen();
    //gui.add(lables,'pointY').listen();
    //gui.add(lables,'pointZ').listen();


    /**
     * 渲染相关的变量
     */
    var modelDataV = [];
    var modelDataT = [];
    var modelDataF = [];
    var modelDataM = [];
    var modelDataNewN = [];
    var vsgData = [],packageTag=0,datNum=0;
    var outsideSourcesFileCount = 0;
    var sendMessageGroupLength = 2000;
    var outsideIfcColumnNameArr = [];
    var outsideIfcColumnModel = [];
    var isDrawWallGroup = false;
    var isGetBigFiles = false;
    var triggerAreaMap = [];
    var fileLength = 0;
    var drawDataMap = {};
    var wallArr = [];

    /**
     * 标注相关的变量
     */
    var intersects;
    var clickedSphere;
    var clickedIndex;
    var clickedNumber;
    var mouse = { x: 0, y: 0 }, INTERSECTED, projector;
    projector = new THREE.Projector();
    var pointArr = [];
    var projector2 = new THREE.Projector();
    var projectorPre = new THREE.Projector();
    var imageSrc ="assets/textures/2.jpg";
    var newDrawed = [];
    var spherePoint = []; //存储index和sphere的map
    var spheres = []; //存储临时点
    var signals = []; //存储index和addedSignal
    var points = [];  //存储所有的sphere

    function initValue()
    {
        modelDataV = [];
        modelDataT = [];
        modelDataF = [];
        modelDataM = [];
        modelDataNewN = [];
        redrawGroup = [];
        INTERSECTED = null;
        vsgData = [];
        packageTag=0;
        datNum=0;
        outsideSourcesFileCount = 0;
        sendMessageGroupLength = 2000;
        outsideIfcColumnNameArr = [];
        outsideIfcColumnModel = [];
        isDrawWallGroup  = false;
        isGetBigFiles = false;
        fileLength = 0;
        drawDataMap = {};
    }



    var isOnload = true; //判断是否在加载，如果在加载，render停掉

    var cashVoxelSize;
    var cashSceneBBoxMinX;
    var cashSceneBBoxMinY;
    var cashSceneBBoxMinZ;
    var cashtriggerAreaMap;
    var cashWallArr;


    workerLoadVsg.onmessage=function(event) {
        isOnload = true;
        //弹出窗口
        $("#progress").css({"display":"block"});

        setTimeout(function(){
            $("#progress").addClass("in")

        },10)
        $("body,html").css({"overflow":"hidden"})

        initValue();
        fileLength = event.data.fileLength;
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
            camControls.targetObject.position.x = event.data.originPos[0];
            camControls.targetObject.position.y = event.data.originPos[1];
            camControls.targetObject.position.z = event.data.originPos[2];
            camControls.lon = event.data.originPos[3];
            camControls.lat = event.data.originPos[4];
        }

        datNum = event.data.datNum;

        if(isFirstLoad)
        {
            isFirstLoad = false;
            TranslateGroup();
        }

        document.getElementById('progressLable').innerHTML = "连接到服务器...";

        SendMessagetoWorkDforOutsideModel();
        // workerDout.postMessage(currentBlcokName+"_"+packageTag);
    }


    function SendMessagetoWorkDforOutsideModel()
    {
        var vsgArr = [];
        for(var key in vsgData)
        {
            for(var i=0;i<vsgData[key].length;i++)
            {
                if(vsgArr.indexOf(vsgData[key][i])==-1)
                {
                    vsgArr.push(vsgData[key][i]);
                }
            }
        }
        console.log("vsgArr length is:"+vsgArr.length);

        for(var counter = 0; counter<=datNum;counter++)
        {
            workerDout.postMessage(currentBlcokName+"_"+counter);
        }
    }

    workerDout.onmessage = function (event) {
        var Data=event.data;
        if(Data.data_tag!=null)
        {
            if(Data.data_tag==1) {
                //发送下一个数据下载请求，map设置对应的key-value
                drawDataMap[Data.data_type] = [];

            }else{
                //收到块加载完成的消息，开始绘制
                isOnload = false;
                //开始绘制当前数据
                DrawModel(Data.data_type);

                packageTag++;
                if(packageTag>=datNum){
                    //加载完成
                    isOnload = false;

                    $("#progress").removeClass("in")
                    setTimeout(function(){
                        $("#progress").css("display","none");

                    },20)
                    $("body,html").css({"overflow":"auto"})
                    TranslateGroup();
                }
            }
        }
        else
        {
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
            var progress = Math.floor(100*outsideSourcesFileCount/fileLength);
            document.getElementById('progressLable').innerHTML = progress + "%";
        }

    }

    var downArr = [],forArr = [];

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
            IfcMemberGeo = new THREE.Geometry();

        var tempName = drawDataMap[tag][0];
        var typeIndex = tempName.indexOf("=");
        var packageType = tempName.slice(typeIndex+1);

        for(var i=0; i<drawDataMap[tag].length; i++)
        {
            var tempFileName = drawDataMap[tag][i];

            if(tempFileName!=null)
            {
                if (modelDataNewN[tempFileName]) {

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
                                var groupV = new THREE.Vector3(-1*newN1, newN3, newN2);
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
                            //var polyhedron = createMesh(geometry,currentBlcokName,tempFileName);
                            //scene.add(polyhedron);

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
                            var groupV = new THREE.Vector3(-1*newn1, newn3, newn2);
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
                        //var polyhedron = createMesh(geometry,currentBlcokName,tempFileName);
                        //scene.add(polyhedron);
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

        switch (packageType) {
            case"IfcFooting":
                var polyhedron = createMesh(IfcFootingGeo,currentBlcokName,"IfcFooting",tag);
                scene.add(polyhedron);
                break;
            case "IfcWallStandardCase"://ok
                var polyhedron = createMesh(IfcWallStandardCaseGeo,currentBlcokName,"IfcWallStandardCase",tag);
                scene.add(polyhedron);
                forArr.push(polyhedron);
                break;
            case "IfcSlab"://ok
                var polyhedron = createMesh(IfcSlabGeo,currentBlcokName,"IfcSlab",tag);
                scene.add(polyhedron);
                downArr.push(polyhedron);
                break;
            case "IfcStair"://ok
                var polyhedron = createMesh(IfcStairGeo,currentBlcokName,"IfcStair",tag);
                scene.add(polyhedron);
                downArr.push(polyhedron);
                break;
            case "IfcStairFlight"://ok
                var polyhedron = createMesh(IfcStairFlightGeo,currentBlcokName,"IfcStairFlight",tag);
                scene.add(polyhedron);
                downArr.push(polyhedron);
                break;
            case "IfcDoor"://ok
                // console.log("Door");
                var polyhedron = createMesh(IfcDoorGeo,currentBlcokName,"IfcDoor",tag);
                scene.add(polyhedron);
                break;
            case "IfcWindow":
                var polyhedron = createMesh(IfcWindowGeo,currentBlcokName,"IfcWindow",tag);
                scene.add(polyhedron);
                break;
            case "IfcBeam"://ok
                var polyhedron = createMesh(IfcBeamGeo,currentBlcokName,"IfcBeam",tag);
                scene.add(polyhedron);
                break;
            case "IfcCovering":
                var polyhedron = createMesh(IfcCoveringGeo,currentBlcokName,"IfcCovering",tag);
                scene.add(polyhedron);
                break;
            case "IfcFlowSegment"://ok
                var polyhedron = createMesh(IfcFlowSegmentGeo,currentBlcokName,"IfcFlowSegment",tag);
                scene.add(polyhedron);
                break;
            case "IfcWall"://ok
                var polyhedron = createMesh(IfcWallGeo,currentBlcokName,"IfcWall",tag);
                scene.add(polyhedron);
                forArr.push(polyhedron);
                break;
            case "IfcRampFlight":
                var polyhedron = createMesh(IfcRampFlightGeo,currentBlcokName,"IfcRampFlight",tag);
                scene.add(polyhedron);
                break;
            case "IfcRailing"://ok
                var polyhedron = createMesh(IfcRailingGeo,currentBlcokName,"IfcRailing",tag);
                scene.add(polyhedron);
                break;
            case "IfcFlowTerminal"://ok
                var polyhedron = createMesh(IfcFlowTerminalGeo,currentBlcokName,"IfcFlowTerminal",tag);
                scene.add(polyhedron);
                break;
            case "IfcBuildingElementProxy"://ok
                var polyhedron = createMesh(IfcBuildingElementProxyGeo,currentBlcokName,"IfcBuildingElementProxy",tag);
                scene.add(polyhedron);
                break;
            case "IfcColumn"://ok
                var polyhedron = createMesh(IfcColumnGeo,currentBlcokName,"IfcColumn",tag);
                scene.add(polyhedron);
                break;
            case "IfcFlowController"://ok
                var polyhedron = createMesh(IfcFlowControllerGeo,currentBlcokName,"IfcFlowController",tag);
                scene.add(polyhedron);
                break;
            case "IfcFlowFitting"://ok
                var polyhedron = createMesh(IfcFlowFittingGeo,currentBlcokName,"IfcFlowFitting",tag);
                scene.add(polyhedron);
                break;
            case "IfcMember"://ok
                var polyhedron = createMesh(IfcMemberGeo,currentBlcokName,"IfcMember",tag);
                scene.add(polyhedron);
                break;
            default:
                break;

        }


        // var polyhedron = createMesh(IfcFootingGeo,currentBlcokName,"IfcFooting",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcWallStandardCaseGeo,currentBlcokName,"IfcWallStandardCase",tag);
        // scene.add(polyhedron);
        //
        // forArr.push(polyhedron);
        //
        // var polyhedron = createMesh(IfcSlabGeo,currentBlcokName,"IfcSlab",tag);
        // scene.add(polyhedron);
        // downArr.push(polyhedron);
        //
        // var polyhedron = createMesh(IfcStairGeo,currentBlcokName,"IfcStair",tag);
        // scene.add(polyhedron);
        // downArr.push(polyhedron);
        //
        // var polyhedron = createMesh(IfcStairFlightGeo,currentBlcokName,"IfcStairFlight",tag);
        // scene.add(polyhedron);
        // downArr.push(polyhedron);
        //
        // var polyhedron = createMesh(IfcMemberGeo,currentBlcokName,"IfcMember",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcDoorGeo,currentBlcokName,"IfcDoor",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcWindowGeo,currentBlcokName,"IfcWindow",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcBeamGeo,currentBlcokName,"IfcBeam",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcCoveringGeo,currentBlcokName,"IfcCovering",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcFlowSegmentGeo,currentBlcokName,"IfcFlowSegment",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcWallGeo,currentBlcokName,"IfcWall",tag);
        // scene.add(polyhedron);
        // forArr.push(polyhedron);
        //
        // var polyhedron = createMesh(IfcRampFlightGeo,currentBlcokName,"IfcRampFlight",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcRailingGeo,currentBlcokName,"IfcRailing",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcFlowTerminalGeo,currentBlcokName,"IfcFlowTerminal",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcBuildingElementProxyGeo,currentBlcokName,"IfcBuildingElementProxy",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcColumnGeo,currentBlcokName,"IfcColumn",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcFlowControllerGeo,currentBlcokName,"IfcFlowController",tag);
        // scene.add(polyhedron);
        //
        // var polyhedron = createMesh(IfcFlowFittingGeo,currentBlcokName,"IfcFlowFitting",tag);
        // scene.add(polyhedron);


    }

    var redrawGroup = [];
    function DrawComponentByFileName(fileName)
    {
        if(fileName!=null)
        {
            if (modelDataNewN[fileName]) {

                var newName = modelDataNewN[fileName];
                var matrix = modelDataM[fileName];
//                            处理V矩阵，变形
                if(modelDataV[newName])
                {
                    modelDataV[fileName] = [];
                    for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++)
                    {
                        var vMetrix = [];
                        var tMetrix = [];
                        //var vArrary = [];
                        for (var j = 0; j < modelDataV[newName][dataCount].length; j += 3) {
                            var newN1 = modelDataV[newName][dataCount][j] * matrix[0] + modelDataV[newName][dataCount][j + 1] * matrix[4] + modelDataV[newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
                            var newN2 = modelDataV[newName][dataCount][j] * matrix[1] + modelDataV[newName][dataCount][j + 1] * matrix[5] + modelDataV[newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
                            var newN3 = modelDataV[newName][dataCount][j] * matrix[2] + modelDataV[newName][dataCount][j + 1] * matrix[6] + modelDataV[newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
                            var groupV = new THREE.Vector3(-1*newN1, newN3, newN2);
                            vMetrix.push(groupV);
                            //vArrary.push(newN1);
                            //vArrary.push(newN2);
                            //vArrary.push(newN3);
                        }
                        //modelDataV[fileName].push(vArrary);
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
                        var pos=fileName.indexOf("=");
                        var ind=fileName.substring(pos+1);
                        var polyhedron = createMes222(geometry,currentBlcokName,ind);
                        // polyhedron.scale.set(1.001,1.001,1.001);
                        polyhedron.name = fileName;
                        scene.add(polyhedron);
                        redrawGroup.push(polyhedron);

                    }
                }
            }
            if (modelDataV[fileName] && !modelDataNewN[fileName]) {
                for(var dataCount=0;dataCount<modelDataV[fileName].length;dataCount++)
                {
                    var vMetrix = [];
                    var tMetrix = [];
                    //处理V矩阵，变形
                    for (var j = 0; j < modelDataV[fileName][dataCount].length; j += 3) {
                        var newn1 = 1.0 * modelDataV[fileName][dataCount][j];
                        var newn2 = 1.0 * modelDataV[fileName][dataCount][j + 1];
                        var newn3 = 1.0 * modelDataV[fileName][dataCount][j + 2];
                        var groupV = new THREE.Vector3(-1*newn1, newn3, newn2);
                        vMetrix.push(groupV);
                    }
                    //处理T矩阵
                    for (var m = 0; m < modelDataT[fileName][dataCount].length; m += 3) {
                        var newT1 = 1.0 * modelDataT[fileName][dataCount][m];
                        var newT2 = 1.0 * modelDataT[fileName][dataCount][m + 1];
                        var newT3 = 1.0 * modelDataT[fileName][dataCount][m + 2];
                        var newF1 = 1.0 * modelDataF[fileName][dataCount][m];
                        var newF2 = 1.0 * modelDataF[fileName][dataCount][m + 1];
                        var newF3 = 1.0 * modelDataF[fileName][dataCount][m + 2];
                        var norRow = new THREE.Vector3(newF1, newF2, newF3);
                        var groupF = new THREE.Face3(newT1, newT2, newT3);
                        groupF.normal = norRow;
                        tMetrix.push(groupF);
                    }

                    //绘制
                    var geometry = new THREE.Geometry();
                    geometry.vertices = vMetrix;
                    geometry.faces = tMetrix;
                    var pos=fileName.indexOf("=");
                    var ind=fileName.substring(pos+1);
                    var polyhedron = createMes222(geometry,currentBlcokName,ind);
                    // polyhedron.scale.set(1.001,1.001,1.001);
                    scene.add(polyhedron);
                    redrawGroup.push(polyhedron);

                }
            }
        }
    }

    function DrawComponentByFileName(fileName)
    {
        if(fileName!=null)
        {
            if (modelDataNewN[fileName]) {

                var newName = modelDataNewN[fileName];
                var matrix = modelDataM[fileName];
//                            处理V矩阵，变形
                if(modelDataV[newName])
                {
                    modelDataV[fileName] = [];
                    for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++)
                    {
                        var vMetrix = [];
                        var tMetrix = [];
                        //var vArrary = [];
                        for (var j = 0; j < modelDataV[newName][dataCount].length; j += 3) {
                            var newN1 = modelDataV[newName][dataCount][j] * matrix[0] + modelDataV[newName][dataCount][j + 1] * matrix[4] + modelDataV[newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
                            var newN2 = modelDataV[newName][dataCount][j] * matrix[1] + modelDataV[newName][dataCount][j + 1] * matrix[5] + modelDataV[newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
                            var newN3 = modelDataV[newName][dataCount][j] * matrix[2] + modelDataV[newName][dataCount][j + 1] * matrix[6] + modelDataV[newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
                            var groupV = new THREE.Vector3(-1*newN1, newN3, newN2);
                            vMetrix.push(groupV);
                            //vArrary.push(newN1);
                            //vArrary.push(newN2);
                            //vArrary.push(newN3);
                        }
                        //modelDataV[fileName].push(vArrary);
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
                        var pos=fileName.indexOf("=");
                        var ind=fileName.substring(pos+1);
                        var polyhedron = createMes222(geometry,currentBlcokName,ind);
                        // polyhedron.scale.set(1.001,1.001,1.001);
                        polyhedron.name = fileName;
                        scene.add(polyhedron);
                        redrawGroup.push(polyhedron);

                    }
                }
            }
            if (modelDataV[fileName] && !modelDataNewN[fileName]) {
                for(var dataCount=0;dataCount<modelDataV[fileName].length;dataCount++)
                {
                    var vMetrix = [];
                    var tMetrix = [];
                    //处理V矩阵，变形
                    for (var j = 0; j < modelDataV[fileName][dataCount].length; j += 3) {
                        var newn1 = 1.0 * modelDataV[fileName][dataCount][j];
                        var newn2 = 1.0 * modelDataV[fileName][dataCount][j + 1];
                        var newn3 = 1.0 * modelDataV[fileName][dataCount][j + 2];
                        var groupV = new THREE.Vector3(-1*newn1, newn3, newn2);
                        vMetrix.push(groupV);
                    }
                    //处理T矩阵
                    for (var m = 0; m < modelDataT[fileName][dataCount].length; m += 3) {
                        var newT1 = 1.0 * modelDataT[fileName][dataCount][m];
                        var newT2 = 1.0 * modelDataT[fileName][dataCount][m + 1];
                        var newT3 = 1.0 * modelDataT[fileName][dataCount][m + 2];
                        var newF1 = 1.0 * modelDataF[fileName][dataCount][m];
                        var newF2 = 1.0 * modelDataF[fileName][dataCount][m + 1];
                        var newF3 = 1.0 * modelDataF[fileName][dataCount][m + 2];
                        var norRow = new THREE.Vector3(newF1, newF2, newF3);
                        var groupF = new THREE.Face3(newT1, newT2, newT3);
                        groupF.normal = norRow;
                        tMetrix.push(groupF);
                    }

                    //绘制
                    var geometry = new THREE.Geometry();
                    geometry.vertices = vMetrix;
                    geometry.faces = tMetrix;
                    var pos=fileName.indexOf("=");
                    var ind=fileName.substring(pos+1);
                    var polyhedron = createMes222(geometry,currentBlcokName,ind);
                    // polyhedron.scale.set(1.001,1.001,1.001);
                    polyhedron.name = fileName;
                    scene.add(polyhedron);
                    redrawGroup.push(polyhedron);

                }
            }
        }
    }

    function GetCenterComponentByFileName(fileName)
    {
        var tempFileName = fileName;
        if(tempFileName!=null)
        {
            if (modelDataNewN[tempFileName]) {

                var newName = modelDataNewN[tempFileName];
                var matrix = modelDataM[tempFileName];
                if(modelDataV[newName])
                {
                    var centerPos;
                    var vMetrixArr = [];
                    var allVMetrix = [];
                    var modelGeo = new THREE.Geometry();
                    for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++) {
                        var singleMeshVMetrix = [];
                        for (var j = 0; j < modelDataV[newName][dataCount].length; j += 3) {
                            var newN1 = modelDataV[newName][dataCount][j] * matrix[0] + modelDataV[newName][dataCount][j + 1] * matrix[4] + modelDataV[newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
                            var newN2 = modelDataV[newName][dataCount][j] * matrix[1] + modelDataV[newName][dataCount][j + 1] * matrix[5] + modelDataV[newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
                            var newN3 = modelDataV[newName][dataCount][j] * matrix[2] + modelDataV[newName][dataCount][j + 1] * matrix[6] + modelDataV[newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
                            var groupV = new THREE.Vector3(-1*newN1, newN3, newN2);
                            singleMeshVMetrix.push(groupV);
                            allVMetrix.push(groupV);
                        }
                        vMetrixArr.push(singleMeshVMetrix);
                    }
                    centerPos = getCenterPositionByVertexArr(allVMetrix);
                    for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++)
                    {
                        var vMetrix = [];
                        var tMetrix = [];
                        var uvArray = [];
                        var meshName = tempFileName + "-" +dataCount;
                        var geometry = new THREE.Geometry();

                        var newDataV = getNewDataVByCnterPosAndVertexArr(centerPos  ,vMetrixArr[dataCount]);
                        for (var j = 0; j < newDataV.length; j += 3) {
                            var newn1 = 1.0 * newDataV[j];
                            var newn2 = 1.0 * newDataV[j + 1];
                            var newn3 = 1.0 * newDataV[j + 2];
                            var groupV = new THREE.Vector3(newn1, newn2, newn3);
                            vMetrix.push(groupV);
                        }
                        for (var m = 0; m < modelDataT[newName][dataCount].length; m += 3) {
                            var newT1 = 1.0 * modelDataT[newName][dataCount][m];
                            var newT2 = 1.0 * modelDataT[newName][dataCount][m + 1];
                            var newT3 = 1.0 * modelDataT[newName][dataCount][m + 2];
                            var newF1 = 1.0 * modelDataF[newName][dataCount][m];
                            var newF2 = 1.0 * modelDataF[newName][dataCount][m + 1];
                            var newF3 = 1.0 * modelDataF[newName][dataCount][m + 2];
                            var norRow = new THREE.Vector3(newF1, newF3, newF2);
                            var grouT = new THREE.Face3(newT1, newT3, newT2);
                            grouT.normal = norRow;
                            tMetrix.push(grouT);

                        }
                        geometry.vertices = vMetrix;
                        geometry.faces = tMetrix;
                        modelGeo.merge(geometry);
                    }

                    var pos=fileName.indexOf("=");
                    var ind=fileName.substring(pos+1);
                    window.isDisplayNewComponent = true;
                    window.displayComponent = createMes222(geometry,currentBlcokName,ind);
                    fixDisplayComponentSizeByAABB(window.displayComponent);
                    // polyhedron.position.set(centerPos.x,centerPos.y,centerPos.z);
                    // polyhedron.scale.set(1.001,1.001,1.001);

                }
            }
            if (modelDataV[tempFileName] && !modelDataV[newName]) {
                var centerPos;
                var vMetrixArr = [];
                var allVMetrix = [];
                var modelGeo = new THREE.Geometry();
                for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++) {
                    var singleMeshVMetrix = getVertexArrByVertexData(modelDataV[tempFileName][dataCount]);
                    for(var j=0; j<singleMeshVMetrix.length; j++)
                    {
                        allVMetrix.push(singleMeshVMetrix[j]);
                    }
                    vMetrixArr.push(singleMeshVMetrix);
                }
                centerPos = getCenterPositionByVertexArr(allVMetrix);
                for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++)
                {
                    var newDataV = getNewDataVByCnterPosAndVertexArr(centerPos,vMetrixArr[dataCount]);

                    var vMetrix = [];
                    var tMetrix = [];
                    var uvArray = [];
                    var meshName = tempFileName + "-" +dataCount;
                    var geometry = new THREE.Geometry();

                    for (var j = 0; j < newDataV.length; j += 3) {
                        var newn1 = 1.0 * newDataV[j];
                        var newn2 = 1.0 * newDataV[j + 1];
                        var newn3 = 1.0 * newDataV[j + 2];
                        var groupV = new THREE.Vector3(-1*newn1, newn2, newn3);
                        vMetrix.push(groupV);
                    }
                    for (var m = 0; m < modelDataT[tempFileName][dataCount].length; m += 3) {
                        var newT1 = 1.0 * modelDataT[tempFileName][dataCount][m];
                        var newT2 = 1.0 * modelDataT[tempFileName][dataCount][m + 1];
                        var newT3 = 1.0 * modelDataT[tempFileName][dataCount][m + 2];
                        var newF1 = 1.0 * modelDataF[tempFileName][dataCount][m];
                        var newF2 = 1.0 * modelDataF[tempFileName][dataCount][m + 1];
                        var newF3 = 1.0 * modelDataF[tempFileName][dataCount][m + 2];
                        var norRow = new THREE.Vector3(newF1, newF3, newF2);
                        var groupF = new THREE.Face3(newT1, newT3, newT2);
                        groupF.normal = norRow;
                        tMetrix.push(groupF);

                    }
                    geometry.vertices = vMetrix;
                    geometry.faces = tMetrix;
                    modelGeo.merge(geometry);
                }

                var pos=fileName.indexOf("=");
                var ind=fileName.substring(pos+1);
                window.isDisplayNewComponent = true;
                window.displayComponent = createMes222(geometry,currentBlcokName,ind);
                fixDisplayComponentSizeByAABB(window.displayComponent);
                // polyhedron.position.set(centerPos.x,centerPos.y,centerPos.z);
                // polyhedron.scale.set(1.001,1.001,1.001);

            }
            // window.displayComponent = polyhedron;
        }
    }

    function fixDisplayComponentSizeByAABB(component) {
        var maxSize = 0;
        for(var i=0; i<component.geometry.vertices.length; i++)
        {
            if(Math.abs(component.geometry.vertices[i].x)>maxSize)
            {
                maxSize = Math.abs(component.geometry.vertices[i].x);
            }
            if(Math.abs(component.geometry.vertices[i].y)>maxSize)
            {
                maxSize = Math.abs(component.geometry.vertices[i].y);
            }
            if(Math.abs(component.geometry.vertices[i].z)>maxSize)
            {
                maxSize = Math.abs(component.geometry.vertices[i].z);
            }
        }
        var sizeNum = 0.5 * 50/maxSize;
        component.scale.set(sizeNum,sizeNum,sizeNum);
    }

    function getCenterPositionByVertexArr (vertexArr){
        var centroidVer = new THREE.Vector3();
        var max_x,min_x,max_y,min_y,max_z,min_z;
        var centroidLen = vertexArr.length;
        var arrayVer= [];
        for(var i=0;i<centroidLen;i++){
            arrayVer.push(vertexArr[i])
        }
        max_x = Number(arrayVer[0].x);
        min_x = Number(arrayVer[0].x);
        max_y = Number(arrayVer[0].y);
        min_y = Number(arrayVer[0].y);
        max_z = Number(arrayVer[0].z);
        min_z = Number(arrayVer[0].z);
        for(var i=0; i<centroidLen;i++){
            if(max_x<arrayVer[i].x){
                max_x =Number(arrayVer[i].x);
            }
            if(max_y<arrayVer[i].y){
                max_y =Number(arrayVer[i].y);
            }
            if(max_z<arrayVer[i].z){
                max_z =Number(arrayVer[i].z);
            }
        }
        for(var i=0; i<centroidLen;i++){
            if(min_x>arrayVer[i].x){
                min_x =Number(arrayVer[i].x);
            }
            if(min_y>arrayVer[i].y){
                min_y =Number(arrayVer[i].y);
            }
            if(min_z>arrayVer[i].z){
                min_z =Number(arrayVer[i].z);
            }
        }
        centroidVer.set((max_x+min_x)/2,(max_y+min_y)/2,(max_z+min_z)/2);
        // console.log(centroidVer);
        return centroidVer;
    }

    function getNewDataVByCnterPosAndVertexArr(centerPos,vertexArr) {
        var newDataV = [];
        for(var i=0;i<vertexArr.length; i++)
        {
            var tempVector = new THREE.Vector3();
            tempVector.subVectors(vertexArr[i],centerPos);
            newDataV.push(tempVector.x);
            newDataV.push(tempVector.y);
            newDataV.push(tempVector.z);
        }
        return newDataV;

    }

    function getVertexArrByVertexData(vertexData) {
        var vertexArr = [];
        for(var i=0; i<vertexData.length; i+=3)
        {
            var tempVec3 = new THREE.Vector3(vertexData[i],vertexData[i+2],vertexData[i+1]);
            vertexArr.push(tempVec3);
        }
        return vertexArr;
    }


    function redrawComponentByPosition(x,y,z,name)
    {
        var indexX = Math.ceil(((-1*x) - SceneBBoxMinX )/VoxelSize);
        var indexZ = Math.ceil((z - SceneBBoxMinY )/VoxelSize);
        var indexY = Math.ceil((y - SceneBBoxMinZ )/VoxelSize);
        var index = indexX + "-" + indexZ + "-" + indexY;
        var VoxelizationFileArr;

        VoxelizationFileArr = vsgData[index];
        if(VoxelizationFileArr)
        {
            for(var i=0; i<VoxelizationFileArr.length; i++)
            {
                var pos=VoxelizationFileArr[i].indexOf("=");
                var ind=VoxelizationFileArr[i].substring(pos+1);
                if(ind==name)
                {
                    DrawComponentByFileName(VoxelizationFileArr[i]);
                    GetCenterComponentByFileName(VoxelizationFileArr[i]);
                }
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


    function TranslateGroup()
    {
        VoxelSize = cashVoxelSize;
        SceneBBoxMinX = cashSceneBBoxMinX;
        SceneBBoxMinY = cashSceneBBoxMinY;
        SceneBBoxMinZ = cashSceneBBoxMinZ;
        triggerAreaMap = cashtriggerAreaMap;
        // console.log(triggerAreaMap)
        wallArr = cashWallArr;
        if(isShowTriggerArea)
        {
            while(triggerBoxs.length){
                scene.remove(triggerBoxs.pop());
            }
            while(wallBoxs.length){
                scene.remove(wallBoxs.pop());
            }

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
                        sphereMesh.material.needsUpdate = true;
                        sphereMesh.position.x =   Number(triggerAreaMap[i][j][0]);
                        sphereMesh.position.z =  Number(triggerAreaMap[i][j][1]);
                        sphereMesh.position.y =  Number(triggerAreaMap[i][j][2]);
                        scene.add(sphereMesh);

                        triggerBoxs.push(sphereMesh);
                        wallBoxs.push(sphereMesh);

                    }

                }

            }


            for(var m=0;m<wallArr.length;m++)
            {
                var posX = Number(wallArr[m][0]);
                var posY = Number(wallArr[m][1]);
                var posZ = Number(wallArr[m][2]);
                var boxX = Number(wallArr[m][3]);
                var boxY = Number(wallArr[m][4]);
                var boxZ = Number(wallArr[m][5]);

                var sphereGeo = new THREE.CubeGeometry(2*boxX,2*boxY,2*boxZ);


                var sphereMesh = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({
                    opacity:0.0,
                    transparent:true,
                    color: 0x0099ff,
                    wireframe: false
                    //side: THREE.DoubleSide
                }));
                sphereMesh.position.x =  posX;
                sphereMesh.position.y =  posY;
                sphereMesh.position.z =  posZ;
                scene.add(sphereMesh);

                wallBoxs.push(sphereMesh);
                forArr.push(sphereMesh);
                downArr.push(sphereMesh);


            }

        }

    }


    function toDecimal2(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return false;
        }
        var f = Math.round(x*100)/100;
        var s = f.toString();
        var rs = s.indexOf('.');
        if (rs < 0) {
            rs = s.length;
            s += '.';
        }
        while (s.length <= rs + 2) {
            s += '0';
        }
        return s;
    }



    render();
    clock.start();  //启动计时器

    var isCollision = false;

    var jumpPosition = new THREE.Vector3();
    var backPosition = new THREE.Vector3();
    var triggerKey;
    function render() {

        stats.update();

        var delta = clock.getDelta();

        if(!isOnload)
        // if(true)
        {

            camControls.update(delta);
            renderer.render(scene, camera);

            lables.CameraPosition = toDecimal2(camera.position.x) + "," + toDecimal2(camera.position.y) + "," + toDecimal2(camera.position.z);

            for(var i = 0; i <spheres.length;i++){


                var r = computeRadius(spheres[i].position,camera.position);

                spheres[i].scale.set(r/10,r/10,r/10)

            }
            for(var j = 0;j <signals.length;j++){
                for(var num = 0;num < signals[j].spheres.length;num++){
                    var r = computeRadius(signals[j].spheres[num].position,camera.position);

                    signals[j].spheres[num].scale.set(r/10,r/10,r/10)
                }
            }


            isCollision = false;


            rayCollision();


            for(var key in triggerAreaMap)
            {
                for(var i=0;i<triggerAreaMap[key].length;i++)
                {
                    var triggerX1 = Number(triggerAreaMap[key][i][0]);
                    var triggerY1 = Number(triggerAreaMap[key][i][2]);
                    var triggerZ1 = Number(triggerAreaMap[key][i][1]);
                    var triggerX = Number(triggerAreaMap[key][i][3]);
                    var triggerY = triggerAreaMap[key][i][7];
                    var triggerZ = triggerAreaMap[key][i][8];
                    var tempMinX1 = triggerX1 - triggerX;
                    var tempMinY1 = triggerY1 - triggerY;
                    var tempMinZ1 = triggerZ1 - triggerZ;
                    var tempMaxX1 = triggerX1 + triggerX;
                    var tempMaxY1 = triggerY1 + triggerY;
                    var tempMaxZ1 = triggerZ1 + triggerZ;

                    var isInArea1 = camControls.targetObject.position.x>tempMinX1 &&
                        camControls.targetObject.position.x<tempMaxX1 &&
                        camControls.targetObject.position.y>tempMinY1 &&
                        camControls.targetObject.position.y<tempMaxY1 &&
                        camControls.targetObject.position.z>tempMinZ1 &&
                        camControls.targetObject.position.z<tempMaxZ1;

                    if(isInArea1)
                    {

                        //弹出窗口
                        $("#triggerUI").css({"display":"block"});
                        setTimeout(function(){
                            $("#triggerUI").addClass("in");
                            isOnload = true;
                        },10)
                        $("body,html").css({"overflow":"hidden"})
                        console.log("in trigger area");
                        isOnload = true;
                        triggerKey = key;
                        var triggerX2 = Number(triggerAreaMap[triggerKey][i][4]);
                        var triggerY2 = Number(triggerAreaMap[triggerKey][i][6]);
                        var triggerZ2 = Number(triggerAreaMap[triggerKey][i][5]);
                        var trigger1Position = new THREE.Vector3(triggerX1,triggerY1,triggerZ1);
                        var trigger2Position = new THREE.Vector3(triggerX2,triggerY2,triggerZ2);
                        var directionVector = new THREE.Vector3();
                        directionVector.subVectors(trigger2Position,trigger1Position);
                        //directionVector.normalize();
                        jumpPosition.set(triggerX2,triggerY2,triggerZ2);
                        backPosition.set(triggerX1-directionVector.x*1,triggerY1-directionVector.y*1,triggerZ1-directionVector.z*1);
                        //console.log("trigger1:"+trigger1Position.x+"_"+trigger1Position.y+"_"+trigger1Position.z);
                        //console.log("trigger2:"+trigger2Position.x+"_"+trigger2Position.y+"_"+trigger2Position.z);
                        //console.log("jumpPosition:"+jumpPosition.x+"_"+jumpPosition.y+"_"+jumpPosition.z);
                        //console.log("backPosition:"+backPosition.x+"_"+backPosition.y+"_"+backPosition.z);

                        //preBlockName = currentBlcokName;
                        //currentBlcokName = triggerKey;
                        //workerLoadVsg.postMessage(currentBlcokName);
                        //destroyGroup();
                        //camControls.targetObject.position.set(triggerX2,triggerY2,triggerZ2);

                    }
                }
            }



            //更改摄像机的位置
            //if(!isCollision)
            //{
            //    camControls.object.position.set(camControls.targetObject.position.x,camControls.targetObject.position.y,camControls.targetObject.position.z);
            //}
            //else
            //{
            //    camControls.targetObject.position.set(camControls.object.position.x,camControls.object.position.y,camControls.object.position.z);
            //}
            camControls.object.position.set(camControls.targetObject.position.x,camControls.targetObject.position.y,camControls.targetObject.position.z);

        }
        requestAnimationFrame(render);
    }

    function rayCollision()
    {


        var ray = new THREE.Raycaster( camControls.targetObject.position, new THREE.Vector3(0,-1,0),0,1.5 );
        var collisionResults = ray.intersectObjects( downArr );
        if(collisionResults.length>0 && (collisionResults[0].distance<1.2 || collisionResults[0].distance>=1.2))
        {
//                        camControls.targetObject.translateY( 5*clock.getDelta() );
            camControls.targetObject.position.set(camControls.targetObject.position.x,collisionResults[0].point.y+1.2,camControls.targetObject.position.z);
        }

        var upRay = new THREE.Raycaster( camControls.targetObject.position, new THREE.Vector3(0,1,0),0,1.5 );
        var collisionResults = upRay.intersectObjects( downArr );
        if(collisionResults.length>0 && collisionResults[0].distance<1.2)
        {
            //isCollision = true;
            //camControls.targetObject.translateZ( 1*camControls.movementSpeed*clock.getDelta() );
            var cp = new THREE.Vector3();
            cp.subVectors(camControls.targetObject.position,collisionResults[0].point);
            cp.normalize();
            camControls.targetObject.position.set(collisionResults[0].point.x+cp.x, collisionResults[0].point.y+cp.y-0.2, collisionResults[0].point.z+cp.z);
        }
        var forVec = new THREE.Vector3(0,0,-1);
        forVec = camControls.targetObject.localToWorld(forVec);
        var forRay = new THREE.Raycaster( camControls.targetObject.position, forVec,0,0.6 );
        var collisionResults = forRay.intersectObjects( forArr );
        if(collisionResults.length>0 && collisionResults[0].distance<0.45)
        {
            //isCollision = true;
            //camControls.targetObject.translateZ( 1*camControls.movementSpeed*clock.getDelta() );
            var cp = new THREE.Vector3();
            cp.subVectors(camControls.targetObject.position,collisionResults[0].point);
            cp.normalize();
            camControls.targetObject.position.set(collisionResults[0].point.x+cp.x/2, collisionResults[0].point.y+cp.y/2, collisionResults[0].point.z+cp.z/2);
        }
        var lefVec = new THREE.Vector3(-1,0,0);
        lefVec = camControls.targetObject.localToWorld(lefVec);
        var lefRay = new THREE.Raycaster( camControls.targetObject.position, lefVec,0,0.6 );
        var collisionResults = lefRay.intersectObjects( forArr );
        if(collisionResults.length>0 && collisionResults[0].distance<0.45)
        {
            //isCollision = true;
            //camControls.targetObject.translateX( 1*camControls.movementSpeed*clock.getDelta() );
            var cp = new THREE.Vector3();
            cp.subVectors(camControls.targetObject.position,collisionResults[0].point);
            cp.normalize();
            camControls.targetObject.position.set(collisionResults[0].point.x+cp.x/2, collisionResults[0].point.y+cp.y/2, collisionResults[0].point.z+cp.z/2);
        }
        var rigVec = new THREE.Vector3(1,0,0);
        rigVec = camControls.targetObject.localToWorld(rigVec);
        var rigRay = new THREE.Raycaster( camControls.targetObject.position, rigVec,0,0.6 );
        var collisionResults = rigRay.intersectObjects( forArr );
        if(collisionResults.length>0 && collisionResults[0].distance<0.45)
        {
            //isCollision = true;
            //camControls.targetObject.translateX( -1*camControls.movementSpeed*clock.getDelta() );
            var cp = new THREE.Vector3();
            cp.subVectors(camControls.targetObject.position,collisionResults[0].point);
            cp.normalize();
            camControls.targetObject.position.set(collisionResults[0].point.x+cp.x/2, collisionResults[0].point.y+cp.y/2, collisionResults[0].point.z+cp.z/2);
        }
        var bacVec = new THREE.Vector3(0,0,1);
        bacVec = camControls.targetObject.localToWorld(bacVec);
        var bacRay = new THREE.Raycaster( camControls.targetObject.position, bacVec,0,0.6 );
        var collisionResults = bacRay.intersectObjects( forArr );
        if(collisionResults.length>0 && collisionResults[0].distance<0.45)
        {
            //isCollision = true;
            //camControls.targetObject.translateZ( -1*camControls.movementSpeed*clock.getDelta() );
            var cp = new THREE.Vector3();
            cp.subVectors(camControls.targetObject.position,collisionResults[0].point);
            cp.normalize();
            camControls.targetObject.position.set(collisionResults[0].point.x+cp.x/2, collisionResults[0].point.y+cp.y/2, collisionResults[0].point.z+cp.z/2);
        }
    }


    var texture1 = THREE.ImageUtils.loadTexture( './assets/textures/texture1.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture1.anisotropy = maxAnisotropy;
    texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set( 1, 1 );
    var material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture2 = THREE.ImageUtils.loadTexture( './assets/textures/texture2.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture2.anisotropy = maxAnisotropy;
    texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set( 1, 1 );
    var material2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture2,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture3 = THREE.ImageUtils.loadTexture( './assets/textures/texture3.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture3.anisotropy = maxAnisotropy;
    texture3.wrapS = texture3.wrapT = THREE.RepeatWrapping;
    texture3.repeat.set( 0.1, 0.1 );
    var material3 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture3,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture4 = THREE.ImageUtils.loadTexture( './assets/textures/columns2.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture4.anisotropy = maxAnisotropy;
    texture4.wrapS = texture4.wrapT = THREE.RepeatWrapping;
    texture4.repeat.set( 1, 1 );
    var material4 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture4,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture5 = THREE.ImageUtils.loadTexture( './assets/textures/texture5.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture5.anisotropy = maxAnisotropy;
    texture5.wrapS = texture5.wrapT = THREE.RepeatWrapping;
    texture5.repeat.set( 1, 1 );
    var material5 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture5,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture6 = THREE.ImageUtils.loadTexture( './assets/textures/texture6.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture6.anisotropy = maxAnisotropy;
    texture6.wrapS = texture6.wrapT = THREE.RepeatWrapping;
    texture6.repeat.set( 1, 1 );
    var material6 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture6,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture7 = THREE.ImageUtils.loadTexture( './assets/textures/texture7.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture7.anisotropy = maxAnisotropy;
    texture7.wrapS = texture7.wrapT = THREE.RepeatWrapping;
    texture7.repeat.set( 1, 1 );
    var material7 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture7,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture8 = THREE.ImageUtils.loadTexture( './assets/textures/texture1.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture8.anisotropy = maxAnisotropy;
    texture8.wrapS = texture8.wrapT = THREE.RepeatWrapping;
    texture8.repeat.set( 1, 1 );
    var material8 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture8,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture9 = THREE.ImageUtils.loadTexture( './assets/textures/texture9.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture9.anisotropy = maxAnisotropy;
    texture9.wrapS = texture9.wrapT = THREE.RepeatWrapping;
    texture9.repeat.set( 1, 1 );
    var material9 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture9,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture10 = THREE.ImageUtils.loadTexture( './assets/textures/texture10.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture10.anisotropy = maxAnisotropy;
    texture10.wrapS = texture10.wrapT = THREE.RepeatWrapping;
    texture10.repeat.set( 1, 1 );
    var material10 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture10,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


    var texture11 = THREE.ImageUtils.loadTexture( './assets/textures/floors2.jpg' );
    var maxAnisotropy = renderer.getMaxAnisotropy();
    texture11.anisotropy = maxAnisotropy;
    texture11.wrapS = texture11.wrapT = THREE.RepeatWrapping;
    texture11.repeat.set( 0.5, 0.5 );
    var material11 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture11,side: THREE.DoubleSide,shininess:5000,opacity:1,transparent:true});


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
                color = new THREE.Color( 0x9caeba );
                myOpacity = 0.9;
                break;
            case "IfcStair"://ok
                color =new THREE.Color( 0x274456 );
                break;
            case "IfcDoor"://ok
                color =new THREE.Color( 0xfcaa49 );
                break;
            case "IfcWindow":
                color =new THREE.Color( 0x00ffff );
                break;
            case "IfcBeam"://ok
                color =new THREE.Color( 0x06e5e5 );
                break;
            case "IfcCovering":
                color = new THREE.Color( 0x999999 );
                break;
            case "IfcFlowSegment"://ok
                color = new THREE.Color( 0xd90c0c );
                break;
            case "IfcWall"://ok
                color = new THREE.Color( 0xaeb1b3 );
                break;
            case "IfcRamp":
                color = new THREE.Color( 0x333333 );
                break;
            case "IfcRailing"://ok
                color = new THREE.Color( 0xaeaeae );
                break;
            case "IfcFlowTerminal"://ok
                color = new THREE.Color( 0xffffff );
                break;
            case "IfcBuildingElementProxy"://ok
                color = new THREE.Color( 0x1e2e35 );
                myOpacity = 0.7;
                break;
            case "IfcColumn"://ok
                color = new THREE.Color( 0xfee972 );
                break;
            case "IfcFlowController"://ok
                color = new THREE.Color( 0x2c2d2b );
                break;
            case "IfcFlowFitting"://ok
                color = new THREE.Color( 0xffffff );
                break;
            default:
                color = new THREE.Color( 0xff0000 );
                break;

        }

        var material0 = new THREE.MeshPhongMaterial({ alphaTest: 0.5, color: color, specular: 0xffae00,side: THREE.DoubleSide});


        switch (nam) {
            //case"IfcFooting":
            //
            //    mesh = new THREE.Mesh(geom, material2);
            //    break;
            case "IfcWallStandardCase"://ok
                if(geom.faces[0]){
                    var normal = geom.faces[0].normal;
                    var directU,directV;
                    if(String(normal.x) === '1'){
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else if(String(normal.y) === '1'){
                        directU = new THREE.Vector3(1,0,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else{
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(1,0,0);
                    }

                    for(var i=0; i<geom.faces.length; ++i){
                        var uvArray = [];
                        for(var j=0; j<3; ++j) {
                            var point;
                            if(j==0)
                                point = geom.vertices[geom.faces[i].a];
                            else if(j==1)
                                point = geom.vertices[geom.faces[i].b];
                            else
                                point = geom.vertices[geom.faces[i].c];

                            var tmpVec = new THREE.Vector3();
                            tmpVec.subVectors(point, geom.vertices[0]);

                            var u = tmpVec.dot(directU);
                            var v = tmpVec.dot(directV);

                            uvArray.push(new THREE.Vector2(u, v));
                        }
                        geom.faceVertexUvs[0].push(uvArray);
                    }
                }
                mesh = new THREE.Mesh(geom, material3);
                break;
            case "IfcSlab"://ok
                if(geom.faces[0]){
                    var normal = geom.faces[0].normal;
                    var directU,directV;
                    if(String(normal.x) === '1'){
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else if(String(normal.y) === '1'){
                        directU = new THREE.Vector3(1,0,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else{
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(1,0,0);
                    }

                    for(var i=0; i<geom.faces.length; ++i){
                        var uvArray = [];
                        for(var j=0; j<3; ++j) {
                            var point;
                            if(j==0)
                                point = geom.vertices[geom.faces[i].a];
                            else if(j==1)
                                point = geom.vertices[geom.faces[i].b];
                            else
                                point = geom.vertices[geom.faces[i].c];

                            var tmpVec = new THREE.Vector3();
                            tmpVec.subVectors(point, geom.vertices[0]);

                            var u = tmpVec.dot(directU);
                            var v = tmpVec.dot(directV);

                            uvArray.push(new THREE.Vector2(u, v));
                        }
                        geom.faceVertexUvs[0].push(uvArray);
                    }
                }
                mesh = new THREE.Mesh(geom, material7);
                break;
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
            case "IfcWall"://ok
                if(geom.faces[0]){
                    var normal = geom.faces[0].normal;
                    var directU,directV;
                    if(String(normal.x) === '1'){
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else if(String(normal.y) === '1'){
                        directU = new THREE.Vector3(1,0,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else{
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(1,0,0);
                    }

                    for(var i=0; i<geom.faces.length; ++i){
                        var uvArray = [];
                        for(var j=0; j<3; ++j) {
                            var point;
                            if(j==0)
                                point = geom.vertices[geom.faces[i].a];
                            else if(j==1)
                                point = geom.vertices[geom.faces[i].b];
                            else
                                point = geom.vertices[geom.faces[i].c];

                            var tmpVec = new THREE.Vector3();
                            tmpVec.subVectors(point, geom.vertices[0]);

                            var u = tmpVec.dot(directU);
                            var v = tmpVec.dot(directV);

                            uvArray.push(new THREE.Vector2(u, v));
                        }
                        geom.faceVertexUvs[0].push(uvArray);
                    }
                }
                mesh = new THREE.Mesh(geom, material3);
                break;
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
            case "IfcColumn"://ok
                if(geom.faces[0]){
                    var normal = geom.faces[0].normal;
                    var directU,directV;
                    if(String(normal.x) === '1'){
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else if(String(normal.y) === '1'){
                        directU = new THREE.Vector3(1,0,0);
                        directV = new THREE.Vector3(0,0,1);
                    }else{
                        directU = new THREE.Vector3(0,1,0);
                        directV = new THREE.Vector3(1,0,0);
                    }

                    for(var i=0; i<geom.faces.length; ++i){
                        var uvArray = [];
                        for(var j=0; j<3; ++j) {
                            var point;
                            if(j==0)
                                point = geom.vertices[geom.faces[i].a];
                            else if(j==1)
                                point = geom.vertices[geom.faces[i].b];
                            else
                                point = geom.vertices[geom.faces[i].c];

                            var tmpVec = new THREE.Vector3();
                            tmpVec.subVectors(point, geom.vertices[0]);

                            var u = tmpVec.dot(directU);
                            var v = tmpVec.dot(directV);

                            uvArray.push(new THREE.Vector2(u, v));
                        }
                        geom.faceVertexUvs[0].push(uvArray);
                    }
                }
                mesh = new THREE.Mesh(geom, material4);
                break;
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

    function createMes222(geom,block,nam,tag) {

        var color = new THREE.Color( 0xff0000 );;
        var myOpacity = 1;

        if(nam) {
            switch (nam) {
                case"IfcFooting":
                    color =new THREE.Color( 0xFFBFFF );
                    break;
                case "IfcWallStandardCase"://ok
                    color =new THREE.Color( 0xaeb1b3 );
                    break;
                case "IfcSlab"://ok
                    color = new THREE.Color( 0x9caeba );
                    myOpacity = 0.9;
                    break;
                case "IfcStair"://ok
                    color =new THREE.Color( 0x274456 );
                    break;
                case "IfcDoor"://ok
                    color =new THREE.Color( 0xfcaa49 );
                    break;
                case "IfcWindow":
                    color =new THREE.Color( 0x00ffff );
                    break;
                case "IfcBeam"://ok
                    color =new THREE.Color( 0x06e5e5 );
                    break;
                case "IfcCovering":
                    color = new THREE.Color( 0x999999 );
                    break;
                case "IfcFlowSegment"://ok
                    color = new THREE.Color( 0xd90c0c );
                    break;
                case "IfcWall"://ok
                    color = new THREE.Color( 0xaeb1b3 );
                    break;
                case "IfcRamp":
                    color = new THREE.Color( 0x333333 );
                    break;
                case "IfcRailing"://ok
                    color = new THREE.Color( 0xaeaeae );
                    break;
                case "IfcFlowTerminal"://ok
                    color = new THREE.Color( 0xffffff );
                    break;
                case "IfcBuildingElementProxy"://ok
                    color = new THREE.Color( 0x1e2e35 );
                    myOpacity = 0.7;
                    break;
                case "IfcColumn"://ok
                    color = new THREE.Color( 0xfee972 );
                    break;
                case "IfcFlowController"://ok
                    color = new THREE.Color( 0x2c2d2b );
                    break;
                case "IfcFlowFitting"://ok
                    color = new THREE.Color( 0xffffff );
                    break;
                default:
                    color = new THREE.Color( 0x274456 );
                    break;

            }
        }

        var wireFrameMat = new THREE.MeshPhongMaterial({ alphaTest: 0.5, color: color, specular: 0xffae00,side: THREE.DoubleSide});
        //var wireFrameMat = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});

        wireFrameMat.overdraw = true;
        wireFrameMat.shading = THREE.SmoothShading;
        wireFrameMat.opacity = myOpacity;
        var mesh = new THREE.Mesh(geom, wireFrameMat);

        mesh.name = block+"_"+nam+"-"+tag;

        return mesh;

    }


    var clickedPoint = {}  //记录点击点的位置
    var clickedInfo = {
        /**
         *point:{}
         *normal:{}
         */
    } //记录点击点的信息：位置，法线

    $('#WebGL-output').dblclick(function(e){



        e.preventDefault();
        mouse.x = ( event.clientX / (window.innerWidth-200) ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        var vectorPre = new THREE.Vector3( mouse.x, mouse.y, 1 );
        projectorPre.unprojectVector( vectorPre, camera );
        var raycasterPre = new THREE.Raycaster( camera.position, vectorPre.sub( camera.position ).normalize() );

        var intersectsPre = raycasterPre.intersectObjects(redrawGroup);

        if(intersectsPre.length>0){
            if (INTERSECTED != intersectsPre[0].object) {

                console.log('情况一')
                clickedPoint = {
                    x:intersectsPre[0].point.x,
                    y:intersectsPre[0].point.y,
                    z:intersectsPre[0].point.z
                }
                clickedInfo.point = intersectsPre[0].point;
                clickedInfo.normal = intersectsPre[0].face.normal;

                if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                INTERSECTED = intersectsPre[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex(HIGH_LIGHT_COLOR);

            } else {

                console.log('情况二')
                clickedPoint = {
                    x:intersectsPre[0].point.x,
                    y:intersectsPre[0].point.y,
                    z:intersectsPre[0].point.z
                }
                clickedInfo.point = intersectsPre[0].point;
                clickedInfo.normal = intersectsPre[0].face.normal;

            }

            showMenu({x:e.clientX,y:e.clientY})

        }else {

            console.log('情况三')
            for (var groupNum = 0; groupNum < redrawGroup.length; groupNum++) {

                scene.remove(redrawGroup[groupNum]);

            }
            redrawGroup = [];

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = null;

            var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
            projector.unprojectVector(vector, camera);
            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

            intersects = raycaster.intersectObjects(scene.children);

            if (intersects.length > 0) {
                var r = 0;
                while (true) {
                    if (wallBoxs.indexOf(intersects[r].object) != -1) {
                        intersects.splice(0, 1);
                    } else {
                        r++;
                    }
                    if (r == intersects.length) {
                        break;
                    }
                }


                if (intersects.length > 0) {
                    var pos = intersects[0].object.name.indexOf("_");
                    var ind = intersects[0].object.name.substring(pos + 1);
                    var pos = ind.indexOf("-");
                    ind = ind.substr(0, pos);

                    redrawComponentByPosition(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z, ind);

                    var vector2 = new THREE.Vector3(mouse.x, mouse.y, 1);
                    projector2.unprojectVector(vector2, camera);
                    var raycaster2 = new THREE.Raycaster(camera.position, vector2.sub(camera.position).normalize());

                    var intersects2 = raycaster2.intersectObjects(redrawGroup);
                    console.log(redrawGroup)

                    if (intersects2.length > 0) {
                        INTERSECTED = intersects2[0].object;
                        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                        INTERSECTED.material.emissive.setHex(HIGH_LIGHT_COLOR);
                    }
                    clickedPoint = {
                        x:intersects[0].point.x,
                        y:intersects[0].point.y,
                        z:intersects[0].point.z
                    }
                    clickedInfo.point = intersects[0].point;
                    clickedInfo.normal = intersects[0].face.normal;

                    showMenu({x:e.clientX,y:e.clientY})

                }
            }

        }

    })


    document.onkeydown=function(event) {

        if (event.keyCode == 27) {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = null;
            hideMenu();
            hideItemDetail();
            hideSignalMenu()

        }
    }

    $('.mainMenu').click(function(e){
        console.log(e.target.innerHTML)
        switch(e.target.innerHTML){
            case '基本信息':
                showItemDetail();
                break;
            case '添加标签':
                showSignalMenu();
            default:
                break;
        }
    })

    $('.item-detail .detail-close').click(function(e){
        hideItemDetail()
    })

    $('.signals-menu .signals-menu-close').click(function(e){
        hideSignalMenu()
    })

    $('.signals-menu .signal-item img').click(function(e){
        var src = e.target.src;
        var textureLoader = new THREE.TextureLoader();
        var map = textureLoader.load( src );
        var material = new THREE.SpriteMaterial( { map: map, transparent:true,
            opacity:1} );

        var sprite = new THREE.Sprite( material );
        var pos = clickedInfo.point;
        var normal = clickedInfo.normal;
        // sprite.position.set( clickedPoint.x, clickedPoint.y, clickedPoint.z );
        sprite.position.set(pos.x + 0.3*normal.x,pos.y + 0.3*normal.y,pos.z + 0.3*normal.z)
        scene.add(sprite);

        var info = {
            modelName:INTERSECTED.name,
            position:sprite.position,
            imgURL:src
        }
        //发送标签数据
        SEND_TAGINFO(info);


        if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        INTERSECTED = null;



        hideMenu();
        hideItemDetail();
        hideSignalMenu()

    })


    function showMenu(position){

        $('.mainMenu').css({
            top:position.y + 'px',
            left:position.x + 'px',
            visibility:'visible'
        })
    }

    function hideMenu(){
        $('.mainMenu').css({
            visibility:'hidden'
        })
    }

    function showItemDetail(){

        //获取基本信息
        FETCH_FUNCTION(INTERSECTED.name);

        $('.item-detail').css({
            visibility:'visible'
        })
    }

    function hideItemDetail(){
        $('.item-detail').css({
            visibility:'hidden'
        })
    }

    function showSignalMenu(){

        $('.signals-menu').css({
            visibility:'visible'
        })
    }

    function hideSignalMenu(){
        $('.signals-menu').css({
            visibility:'hidden'
        })
    }




    function addedSignal(index){
        this.mesh  = null;
        this.spheres = [];
        this.normal = null;
        this.pointsArray = [];
        this.directionArr = [];
    }

    window.addEventListener( 'resize', onWindowResize, false );

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth-200, window.innerHeight );

    }

    function computeRadius(point,camera){
        return Math.sqrt(Math.pow(point.x-camera.x,2)+Math.pow(point.y-camera.y,2)+Math.pow(point.z-camera.z,2))
    }
    $("#close").click(function(){

        $("#mask").removeClass("in")
//                $("#mask").css("display","none");
        setTimeout(function(){
            $("#mask").css("display","none");

        },1000)
        $("body,html").css({"overflow":"auto"})

    })
    $("#esc").click(function(){

        $("#mask").removeClass("in")
//                $("#mask").css("display","none");
        setTimeout(function(){
            $("#mask").css("display","none");

        },1000)
        $("body,html").css({"overflow":"auto"})

    })

    $("#cancel").click(function(){
        $("#triggerUI").removeClass("in")
        setTimeout(function(){
            $("#triggerUI").css("display","none");
        },10)
        $("body,html").css({"overflow":"auto"})

        isOnload = false;
        camControls.targetObject.position.set(backPosition.x,backPosition.y,backPosition.z);
        camControls.object.position.set(backPosition.x,backPosition.y,backPosition.z);
    })
    $("#triggerJump").click(function(){
        $("#triggerUI").removeClass("in")
        setTimeout(function(){
            $("#triggerUI").css("display","none");
        },10)
        $("body,html").css({"overflow":"auto"})

        $('.controller').children("button").css("backgroundColor","#ffffff");
        $('.controller').children("button").css("color","#000000");

        var showText = document.getElementById(triggerKey);
        showText.style.backgroundColor = "#00baff";
        showText.style.color = "white";

        preBlockName = currentBlcokName;
        destroyGroup();
        currentBlcokName = triggerKey;
        workerLoadVsg.postMessage(currentBlcokName);
        camControls.targetObject.position.set(jumpPosition.x,jumpPosition.y,jumpPosition.z);
    })


    function initStats() {

        var stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        // $("#Stats-output").append( stats.domElement );

        return stats;
    }

    $('.controller button').on('click',function(e){

        var btnClickedId = e.target.id;
        console.log(btnClickedId);

        if(currentBlcokName!=btnClickedId)
        {
            $('.controller').children("button").css("backgroundColor","#ffffff");
            $('.controller').children("button").css("color","#000000");

            var showText = document.getElementById(btnClickedId);
            showText.style.backgroundColor = "#00baff";
            showText.style.color = "white";

            hideMenu();
            hideItemDetail();
            hideSignalMenu()


            isOnload = true;
            isJumpArea = true;
            preBlockName = currentBlcokName;
            currentBlcokName = btnClickedId;
            workerLoadVsg.postMessage(currentBlcokName);
            destroyGroup();
        }
    })


})

