/**
 * Created by sse316 on 6/29/2017.
 */

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


/**
 * Created by sse316 on 4/1/2017.
 * 利用包围盒代替复杂的Geometry
 */

$(function(){
    var scene;
    var camera,camControls;
    var clock = new THREE.Clock();
    var lables;

    var renderer;
    var stats = initStats();
    clock.start();
    var workerLoadMergedFile=new Worker("js/loadMergedFile_New.js");
    var workerLoadVsg = new Worker("js/loadBlockVsg.js");

    var windowWidth = window.innerWidth*0.85;
    var windowHeight = window.innerHeight;
    var windowStartX = window.innerWidth*0.15;
    var windowStartY = window.innerHeight*0.0;

    var currentControlType = 1;//右侧编辑栏的编辑tag

    var polyhedrons = [];//进行交互的构件

    //存放体素化数据
    var vsgData = {},vsgArr={},packageTag=0;


    var currentBlockName = "cabrarchi";

    var preBlockName = "cabrarchi";


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


    //假的几栋楼ABCD
    var cubeAext,cubeBext,cubeCext,cubeDext;
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
        camera.focus = 70;


        camControls = new THREE.TouchFPC(camera,renderer.domElement);
        camControls.lookSpeed = 0.8;
        camControls.movementSpeed = 5 * 1.5;
        camControls.noFly = true;
        camControls.lookVertical = true;
        camControls.constrainVertical = true;
        camControls.verticalMin = 1.0;
        camControls.verticalMax = 2.0;



        initSkyBox();



        var axes = new THREE.AxisHelper( 30 );
        // scene.add(axes);

        var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);

        var directionalLight_1 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_1.position.set(0.3,0.4,0.5)
        scene.add(directionalLight_1);

        var directionalLight_2 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_2 .position.set(-0.3,-0.4,0.5)
        scene.add(directionalLight_2);

        // var cubeAextGeo = new THREE.BoxGeometry(57,63,37);
        // var loader = new THREE.CubeTextureLoader();
        // loader.setPath('assets/textures/BuildingOutLine/');
        // var textureCube = loader.load([
        //    'A_ext_front.png','A_ext_front.png',
        //     'A_ext_front.png','A_ext_front.png',
        //     'A_ext_front.png','A_ext_front.png'
        // ]);
        // var material = new THREE.MeshBasicMaterial({color: 0xffffff, envMap:textureCube});
        // var cubeAext = new THREE.Mesh(cubeAextGeo,material);


        //假建筑A
        var cubeAextGeo = new THREE.BoxGeometry(57,63,37);
        var imagePrefix = "assets/textures/BuildingOutLine/A_ext_";
        var directions  = ["left", "right", "top", "top", "front", "back"];
        var imageSuffix = ".png";
        var materialArray = [];

        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.FrontSide
            }));
        var cubeMaterial = new THREE.MeshFaceMaterial( materialArray );
        cubeAext = new THREE.Mesh(cubeAextGeo,cubeMaterial);
        cubeAext.position.set(-25,32,-123);
        // scene.add(cubeAext);


        //假建筑B
        var cubeBextGeo = new THREE.BoxGeometry(36.4,63,60);
        var imagePrefix = "assets/textures/BuildingOutLine/B_ext_";
        var directions  = ["left", "right", "top", "top", "front", "back"];
        var imageSuffix = ".png";
        var materialArray = [];

        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.FrontSide
            }));
        var cubeMaterial = new THREE.MeshFaceMaterial( materialArray );
        cubeBext = new THREE.Mesh(cubeBextGeo,cubeMaterial);
        cubeBext.position.set(-95,32,-71);
        // scene.add(cubeBext);


        //假建筑C
        var cubeCextGeo = new THREE.BoxGeometry(44,63,34);
        var imagePrefix = "assets/textures/BuildingOutLine/C_ext_";
        var directions  = ["left", "right", "top", "top", "front", "back"];
        var imageSuffix = ".png";
        var materialArray = [];

        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.FrontSide
            }));
        var cubeMaterial = new THREE.MeshFaceMaterial( materialArray );
        cubeCext = new THREE.Mesh(cubeCextGeo,cubeMaterial);
        cubeCext.position.set(-61,32,5);
        // scene.add(cubeCext);


        //假建筑D
        var cubeDextGeo = new THREE.BoxGeometry(31,46,40);
        var imagePrefix = "assets/textures/BuildingOutLine/D_ext_";
        var directions  = ["left", "right", "top", "top", "front", "back"];
        var imageSuffix = ".png";
        var materialArray = [];

        for (var i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.FrontSide
            }));
        var cubeMaterial = new THREE.MeshFaceMaterial( materialArray );
        cubeDext = new THREE.Mesh(cubeDextGeo,cubeMaterial);
        cubeDext.position.set(-4,23,1);
        // scene.add(cubeDext);

        // initGUI();


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
    function initGUI() {
        lables = new function(){
            this.cameraX = camera.position.x;
            this.cameraY = camera.position.y;
            this.cameraZ = camera.position.z;
            this.tempLabelX = 0;
            this.tempLabelY = 0;
            this.tempLabelZ = 0;
        };
        var gui = new dat.GUI();
        gui.domElement.id = 'gui';
        gui.add(lables,'cameraX').listen();
        gui.add(lables,'cameraY').listen();
        gui.add(lables,'cameraZ').listen();

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
    $("#WebGL-output").append(renderer.domElement);


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

        TranslateGroup();


        var vsgMap = {};
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


        for(var i=0;i<=22;i++)
        {
            workerLoadMergedFile.postMessage(currentBlockName+"_"+i);
        }


    }


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
                if(packageTag==23){
                    isOnload = false;
                    console.log("Finish part1! and Time is: " + clock.getElapsedTime ());
                    for(var i=23;i<=45;i++)
                    {
                        workerLoadMergedFile.postMessage(currentBlockName+"_"+i);
                    }

                }
                console.log(packageTag);
                if(packageTag>45)
                {
                    console.log("Finish all part and Time is: " + clock.getElapsedTime ());
                    //加载完成
                    isOnload = false;

                    $("#progress").removeClass("in")
                    setTimeout(function(){
                        $("#progress").css("display","none");

                    },20)
                    $("body,html").css({"overflow":"auto"})
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

                                /**
                                 * 在merge geometry之前判断一下是不是复杂的plates
                                 * @type {Number|number}
                                 */

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
                                            // IfcBuildingElementProxyGeo.merge(geometry);
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
                                            geometry = transaGeoToBox(geometry);
                                            IfcPlateGeo.merge(geometry);
                                            break;
                                        case"IfcSite":
                                            IfcSiteGeo.merge(geometry);
                                            break;
                                        case"IfcRoof":
                                            IfcRoofGeo.merge(geometry);
                                            break;
                                        case"IfcFurnishingElement":
                                            // IfcFurnishingElementGeo.merge(geometry);
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
                                        // IfcBuildingElementProxyGeo.merge(geometry);
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
                                        geometry = transaGeoToBox(geometry);
                                        IfcPlateGeo.merge(geometry);
                                        break;
                                    case"IfcSite":
                                        IfcSiteGeo.merge(geometry);
                                        break;
                                    case"IfcRoof":
                                        IfcRoofGeo.merge(geometry);
                                        break;
                                    case"IfcFurnishingElement":
                                        // IfcFurnishingElementGeo.merge(geometry);
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
            switch (packageType) {
                case"IfcFooting":
                    var polyhedron = createMesh(IfcFootingGeo,currentBlockName,"IfcFooting",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWallStandardCase"://ok
                    var polyhedron = createMesh(IfcWallStandardCaseGeo,currentBlockName,"IfcWallStandardCase",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcSlab"://ok
                    var polyhedron = createMesh(IfcSlabGeo,currentBlockName,"IfcSlab",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcStair"://ok
                    var polyhedron = createMesh(IfcStairGeo,currentBlockName,"IfcStair",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcStairFlight"://ok
                    var polyhedron = createMesh(IfcStairFlightGeo,currentBlockName,"IfcStairFlight",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    downArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcDoor"://ok
                    var polyhedron = createMesh(IfcDoorGeo,currentBlockName,"IfcDoor",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWindow":
                    var polyhedron = createMesh(IfcWindowGeo,currentBlockName,"IfcWindow",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcBeam"://ok
                    var polyhedron = createMesh(IfcBeamGeo,currentBlockName,"IfcBeam",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcCovering":
                    var polyhedron = createMesh(IfcCoveringGeo,currentBlockName,"IfcCovering",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowSegment"://ok
                    var polyhedron = createMesh(IfcFlowSegmentGeo,currentBlockName,"IfcFlowSegment",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcWall"://ok
                    var polyhedron = createMesh(IfcWallGeo,currentBlockName,"IfcWall",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRampFlight":
                    var polyhedron = createMesh(IfcRampFlightGeo,currentBlockName,"IfcRampFlight",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRailing"://ok
                    var polyhedron = createMesh(IfcRailingGeo,currentBlockName,"IfcRailing",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowTerminal"://ok
                    var polyhedron = createMesh(IfcFlowTerminalGeo,currentBlockName,"IfcFlowTerminal",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcBuildingElementProxy"://ok
                    // var polyhedron = createMesh(IfcBuildingElementProxyGeo,currentBlockName,"IfcBuildingElementProxy",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    // scene.add(polyhedron);
                    // polyhedrons.push(polyhedron);
                    break;
                case "IfcColumn"://ok
                    var polyhedron = createMesh(IfcColumnGeo,currentBlockName,"IfcColumn",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    forArr.push(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowController"://ok
                    var polyhedron = createMesh(IfcFlowControllerGeo,currentBlockName,"IfcFlowController",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFlowFitting"://ok
                    var polyhedron = createMesh(IfcFlowFittingGeo,currentBlockName,"IfcFlowFitting",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcMember"://ok
                    var polyhedron = createMesh(IfcMemberGeo,currentBlockName,"IfcMember",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcPlate"://ok
                    var polyhedron = createMesh(IfcPlateGeo,currentBlockName,"IfcPlate",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    // polyhedron.up = new THREE.Vector3(1,1,1);
                    // polyhedron.lookAt(new THREE.Vector3(0,1,0));




                    polyhedrons.push(polyhedron);
                    break;
                case "IfcSite"://ok
                    var polyhedron = createMesh(IfcSiteGeo,currentBlockName,"IfcSite",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcRoof"://ok
                    var polyhedron = createMesh(IfcRoofGeo,currentBlockName,"IfcRoof",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    forArr.push(polyhedron);
                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);
                    break;
                case "IfcFurnishingElement"://ok
                    // var polyhedron = createMesh(IfcFurnishingElementGeo,currentBlockName,"IfcFurnishingElement",tag);
                    // polyhedron.scale.set(0.001,0.001,0.001);
                    // scene.add(polyhedron);
                    // polyhedrons.push(polyhedron);
                    break;
                default:
                    break;

            }
        }
        console.log("finish part draw:" + clock.getDelta());

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


    function redrawScene() {
        downArr = [];
        forArr = [];
        var deleteNameArr = [];
        for(var i=0; i<scene.children.length;i++)
        {
            if(scene.children[i].name)
            {
                // console.log(scene.children[i].name);
                var pos = scene.children[i].name.indexOf("_");
                if(scene.children[i].name.substring(0,pos) == currentBlockName && selectedObjArr.indexOf(scene.children[i])==-1)
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

        renderer.render(scene,camera);

        polyhedrons = [];   //初始化数组

        for(var i=0;i<selectedObjArr.length;i++)
        {
            polyhedrons.push(selectedObjArr[i]);

        }


        for(var key in drawDataMap)
        {
            DrawModel(key);
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


    /**
     * 根据构件名称绘制一个新的单独的没有merge过的构件
     * @param fileName 构件名称
     * @param dataInfo
     * @returns {*}
     */
    function drawModelByFileName(fileName,dataInfo) {
        var tempFileName = fileName;
        if(tempFileName!=null)
        {
            if (modelDataNewN[tempFileName]) {

                var newName = modelDataNewN[tempFileName];
                var matrix = modelDataM[tempFileName];
//                            处理V矩阵，变形
                if(modelDataV[newName])
                {
                    var centerPos;
                    var vMetrixArr = [];
                    var allVMetrix = [];
                    var modelGeo = new THREE.Geometry();
                    for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++) {
                        var singleMeshVMetrix = [];
                        //处理V矩阵，变形
                        for (var j = 0; j < modelDataV[newName][dataCount].length; j += 3) {
                            var newN1 = modelDataV[newName][dataCount][j] * matrix[0] + modelDataV[newName][dataCount][j + 1] * matrix[4] + modelDataV[newName][dataCount][j + 2] * matrix[8] + 1.0 * matrix[12];
                            var newN2 = modelDataV[newName][dataCount][j] * matrix[1] + modelDataV[newName][dataCount][j + 1] * matrix[5] + modelDataV[newName][dataCount][j + 2] * matrix[9] + 1.0 * matrix[13];
                            var newN3 = modelDataV[newName][dataCount][j] * matrix[2] + modelDataV[newName][dataCount][j + 1] * matrix[6] + modelDataV[newName][dataCount][j + 2] * matrix[10]+ 1.0 * matrix[14];
                            var groupV = new THREE.Vector3(newN1, newN3, newN2);
                            singleMeshVMetrix.push(groupV);
                            allVMetrix.push(groupV);//存储一个dat文件中的所有顶点信息
                        }
                        vMetrixArr.push(singleMeshVMetrix);//记录变换后的矩阵，避免重复计算
                    }
                    centerPos = getCenterPositionByVertexArr(allVMetrix);//计算一个dat的中心点
                    for(var dataCount=0;dataCount<modelDataV[newName].length;dataCount++)
                    {
                        var vMetrix = [];
                        var tMetrix = [];
                        var uvArray = [];
                        // var meshName = tempFileName + "-" +dataCount;
                        var meshName = tempFileName;
                        var geometry = new THREE.Geometry();

                        var newDataV = getNewDataVByCnterPosAndVertexArr(centerPos  ,vMetrixArr[dataCount]);
                        for (var j = 0; j < newDataV.length; j += 3) {
                            var newn1 = 1.0 * newDataV[j];
                            var newn2 = 1.0 * newDataV[j + 1];
                            var newn3 = 1.0 * newDataV[j + 2];
                            var groupV = new THREE.Vector3(newn1, newn2, newn3);
                            vMetrix.push(groupV);
                        }
                        //处理T矩阵
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
                        //绘制
                        geometry.vertices = vMetrix;
                        geometry.faces = tMetrix;
                        modelGeo.merge(geometry);
                    }

                    var typePos = tempFileName.indexOf("=");
                    var typeName = tempFileName.substring(typePos+1);
                    var polyhedron = createMesh(modelGeo, currentBlockName,typeName);
                    if(dataInfo==null)
                    {
                        polyhedron.position.set(centerPos.x,centerPos.y,centerPos.z);
                    }
                    else
                    {
                        polyhedron.position.set(dataInfo[0].translate.X,dataInfo[0].translate.Y,dataInfo[0].translate.Z);
                        polyhedron.scale.set(dataInfo[0].scale.X,dataInfo[0].scale.Y,dataInfo[0].scale.Z);
                        polyhedron.rotation.set(dataInfo[0].rotate.X,dataInfo[0].rotate.Y,dataInfo[0].rotate.Z);
                    }




                    polyhedron.vertices = modelGeo.vertices;
                    // WorldAABBIndexXYZ(polyhedron,ueseObb);
                    // AllPolyhedrons.push(polyhedron);

                    switch (typeName) {
                        case"IfcFooting":
                            break;
                        case "IfcWallStandardCase"://ok
                            forArr.push(polyhedron);
                            break;
                        case "IfcSlab"://ok
                            downArr.push(polyhedron);
                            break;
                        case "IfcStair"://ok
                            downArr.push(polyhedron);
                            break;
                        case "IfcStairFlight"://ok
                            downArr.push(polyhedron);
                            break;
                        case "IfcDoor"://ok
                            break;
                        case "IfcWindow":
                            break;
                        case "IfcBeam"://ok
                            break;
                        case "IfcCovering":
                            break;
                        case "IfcFlowSegment"://ok
                            break;
                        case "IfcWall"://ok
                            forArr.push(polyhedron);
                            break;
                        case "IfcRampFlight":
                            break;
                        case "IfcRailing"://ok
                            break;
                        case "IfcFlowTerminal"://ok
                            break;
                        case "IfcBuildingElementProxy"://ok
                            break;
                        case "IfcColumn"://ok
                            forArr.push(polyhedron);
                            break;
                        case "IfcFlowController"://ok
                            break;
                        case "IfcFlowFitting"://ok
                            break;
                        case "IfcMember"://ok
                            break;
                        case "IfcPlate"://ok
                            forArr.push(polyhedron);
                            break;
                        default:
                            break;

                    }

                    scene.add(polyhedron);
                    polyhedrons.push(polyhedron);

                    unDisplayModelArr.push(tempFileName);
                    return polyhedron;
                }
                /**
                 * 2017-04-09修改，把下面那句话放到return之前，不然直观感觉没啥用
                 */
                // unDisplayModelArr.push(tempFileName);
            }
            if (modelDataV[tempFileName]) {
                var centerPos;
                var vMetrixArr = [];
                var allVMetrix = [];
                var modelGeo = new THREE.Geometry();
                for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++) {
                    var singleMeshVMetrix = getVertexArrByVertexData(modelDataV[tempFileName][dataCount]);
                    //得到V矩阵
                    for(var j=0; j<singleMeshVMetrix.length; j++)
                    {
                        allVMetrix.push(singleMeshVMetrix[j]);
                    }
                    vMetrixArr.push(singleMeshVMetrix);//记录变换后的矩阵，避免重复计算
                }
                centerPos = getCenterPositionByVertexArr(allVMetrix);//计算一个dat的中心点
                for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++)
                {
                    var newDataV = getNewDataVByCnterPosAndVertexArr(centerPos,vMetrixArr[dataCount]);

                    var vMetrix = [];
                    var tMetrix = [];
                    var uvArray = [];
                    // var meshName = tempFileName + "-" +dataCount;
                    var meshName = tempFileName;
                    var geometry = new THREE.Geometry();

                    for (var j = 0; j < newDataV.length; j += 3) {
                        var newn1 = 1.0 * newDataV[j];
                        var newn2 = 1.0 * newDataV[j + 1];
                        var newn3 = 1.0 * newDataV[j + 2];
                        var groupV = new THREE.Vector3(newn1, newn2, newn3);
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
                        var norRow = new THREE.Vector3(newF1, newF3, newF2);
                        var groupF = new THREE.Face3(newT1, newT3, newT2);
                        groupF.normal = norRow;
                        tMetrix.push(groupF);
                    }

                    //绘制
                    geometry.vertices = vMetrix;
                    geometry.faces = tMetrix;
                    modelGeo.merge(geometry);
                }

                var typePos = tempFileName.indexOf("=");
                var typeName = tempFileName.substring(typePos+1);
                var polyhedron = createMesh(modelGeo, currentBlockName,typeName);
                if(dataInfo==null)
                {
                    polyhedron.position.set(centerPos.x,centerPos.y,centerPos.z);

                }
                else
                {
                    polyhedron.position.set(dataInfo[0].translate.X,dataInfo[0].translate.Y,dataInfo[0].translate.Z);
                    polyhedron.scale.set(dataInfo[0].scale.X,dataInfo[0].scale.Y,dataInfo[0].scale.Z);
                    polyhedron.rotation.set(dataInfo[0].rotate.X,dataInfo[0].rotate.Y,dataInfo[0].rotate.Z);
                }

                polyhedron.vertices = modelGeo.vertices;
                // WorldAABBIndexXYZ(polyhedron,ueseObb);
                // AllPolyhedrons.push(polyhedron);

                switch (typeName) {
                    case"IfcFooting":
                        break;
                    case "IfcWallStandardCase"://ok
                        forArr.push(polyhedron);
                        break;
                    case "IfcSlab"://ok
                        downArr.push(polyhedron);
                        break;
                    case "IfcStair"://ok
                        downArr.push(polyhedron);
                        break;
                    case "IfcStairFlight"://ok
                        downArr.push(polyhedron);
                        break;
                    case "IfcDoor"://ok
                        break;
                    case "IfcWindow":
                        break;
                    case "IfcBeam"://ok
                        break;
                    case "IfcCovering":
                        break;
                    case "IfcFlowSegment"://ok
                        break;
                    case "IfcWall"://ok
                        forArr.push(polyhedron);
                        break;
                    case "IfcRampFlight":
                        break;
                    case "IfcRailing"://ok
                        break;
                    case "IfcFlowTerminal"://ok
                        break;
                    case "IfcBuildingElementProxy"://ok
                        break;
                    case "IfcColumn"://ok
                        forArr.push(polyhedron);
                        break;
                    case "IfcFlowController"://ok
                        break;
                    case "IfcFlowFitting"://ok
                        break;
                    case "IfcMember"://ok
                        break;
                    case "IfcPlate"://ok
                        forArr.push(polyhedron);
                        break;
                    default:
                        break;

                }

                scene.add(polyhedron);
                polyhedrons.push(polyhedron);


                unDisplayModelArr.push(tempFileName);


                return polyhedron;
            }
        }

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

    function transaGeoToBox(geometry) {
        // geometry.computeBoundingBox();
        // var geoBox = new THREE.BoxGeometry(geometry.boundingBox.max.x-geometry.boundingBox.min.x,
        //                                     geometry.boundingBox.max.y-geometry.boundingBox.min.y,
        //                                     geometry.boundingBox.max.z-geometry.boundingBox.min.z);
        // return geoBox;


        var centroidVer = new THREE.Vector3();
        var max_x,min_x,max_y,min_y,max_z,min_z;
        var centroidLen = geometry.vertices.length;
        var arrayVer= [];
        for(var i=0;i<centroidLen;i++){
            arrayVer.push(geometry.vertices[i])
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
        var geoBox = new THREE.BoxGeometry(max_x-min_x,max_y-min_y,max_z-min_z);
        for(var i=0; i< geoBox.vertices.length; i++)
        {
            geoBox.vertices[i].add(centroidVer);
        }
        return geoBox;
    }


    /**
     * 双击场景构件获取构件信息时调用
     * @param name 双击与实际构件交互时获取的merge过的构件名称
     * @param point 射线与构件相交的点
     * @returns {*}
     */
    function getComponentByNameAndPoint(name, point) {
        var pos1 = name.indexOf("_");
        var pos2 = name.lastIndexOf("-");
        var componentType = name.substring(pos1+1,pos2);

        var tempArray = [];  //用于存储比较构件
        var tempIndex = 0; //用于存放最小值索引
        var tempMinValue = 0xffffff;
        var temp;          //临时计算变量
        var tempFileNameIndexArr = [];

        var indexX = Math.ceil((point.x - SceneBBoxMinX )/VoxelSize);
        var indexZ = Math.ceil((point.z - SceneBBoxMinY )/VoxelSize);
        var indexY = Math.ceil((point.y - SceneBBoxMinZ )/VoxelSize);
        var index = indexX + "-" + indexZ + "-" + indexY;
        var voxelizationFileArr = vsgData[index];
        if(voxelizationFileArr)
        {
            for(var i=0; i<voxelizationFileArr.length; i++)
            {
                if(unDisplayModelArr.indexOf(voxelizationFileArr[i])==-1)
                {
                    var pos=voxelizationFileArr[i].indexOf("=");
                    var ind=voxelizationFileArr[i].substring(pos+1);
                    if(ind==componentType)
                    {
                        // var newObj = drawModelByFileName(voxelizationFileArr[i]);
                        var newObj = drawModelByFileName(voxelizationFileArr[i]);
                        scene.remove(newObj);
                        tempFileNameIndexArr.push(i);
                        tempArray.push(newObj);
                        //创建物体之后从场景中移除并放到数组中，后面进行距离计算
                        //newObj.scale.set(1.02,1.02,1.02);
                        //newObj.name = voxelizationFileArr[i] + "_copy"; //加个名字防止乱掉
                        //return newObj;
                    }
                }
            }

            for(i = 0; i<tempArray.length ; i++){
                temp = pointObjectClosetDistance(point,tempArray[i]);
                if(temp < tempMinValue){
                    tempMinValue = temp;
                    tempIndex = i;
                }
            }
            tempArray[tempIndex].scale.set(1.02,1.02,1.02);
            tempArray[tempIndex].name = voxelizationFileArr[tempFileNameIndexArr[tempIndex]] + "_copy";
            scene.add(tempArray[tempIndex]);
            return tempArray[tempIndex];
        }
    }


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


    var transformControls;
    function init() {
        renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
        // renderer.domElement.addEventListener("dblclick",onDocumentMouseDown,false)
        renderer.domElement.addEventListener('mousemove',onDocumentMouseMove,false);
        renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
        document.addEventListener('keypress',onKeyDown,false);

        transformControls = new THREE.TransformControls( camera, renderer.domElement);
    }
    init();



    var triggerKey;


    var isRend=1;
    function render() {

        stats.update();


        var delta = clock.getDelta();

        /**
         * 如果切换到第二模式则不让摄像机乱动
         */
        if(currentControlType!=2 ){
            camControls.update(delta);
        }



        requestAnimationFrame(render);

        // lables.cameraX = camera.position.x;
        // lables.cameraY = camera.position.y;
        // lables.cameraZ = camera.position.z;

        /**
         * 小地图相关参数修改
         */
        //if(Number(document.getElementById('isClickMap').innerHTML)==1){
        //    ismo=Number(document.getElementById('isClickMap').innerHTML);
        //
        //    mov();
        //}

        //if(ismo==1)
        //{
        //    document.getElementById('isClickMap').innerHTML = "0";
        //    //mov();
        //    //camControls.targetObject.lookAt(document.getElementById('X').innerHTML,camControls.targetObject.position.y,document.getElementById('Z').innerHTML);
        //    var targetPos = new THREE.Vector3(
        //        Number(document.getElementById('cameraPosX').innerHTML),
        //        Number(camControls.targetObject.position.y),
        //        Number(document.getElementById('cameraPosZ').innerHTML)
        //    );
        //    //var v1X = camControls.object.position.x;
        //    //var v1Z = camControls.object.position.z;
        //    //var v2X = targetPos.x;
        //    //var v2Z = targetPos.z;
        //    //var costheta = (v1X*v2X + v1Z*v2Z)/(Math.sqrt(v1X*v1X + v1Z*v1Z)+Math.sqrt(v2X*v2X + v2Z*v2Z));
        //    //
        //    //camControls.lon = Math.acos(costheta);
        //    //camControls.lat = null;
        //    ////camControls.lon = null;
        //    ////camControls.lat = null;
        //    //
        //    camControls.object.lookAt(-1*targetPos);
        //    camera.lookAt(-1*targetPos);
        //    setTimeout(function(){cameraType=-1;ismo=0},document.getElementById("Time").innerHTML);
        //    //if(cameraType==-1)
        //    //{
        //    //    camControls.targetObject.position.set(Number(document.getElementById('cameraPosX').innerHTML),Number(document.getElementById('cameraPosY').innerHTML),Number(document.getElementById('cameraPosZ').innerHTML));
        //    //}
        //}
        //if(cameraType==-1)
        //{
        //    camControls.targetObject.position.set(Number(document.getElementById('cameraPosX').innerHTML),Number(document.getElementById('cameraPosY').innerHTML),Number(document.getElementById('cameraPosZ').innerHTML));
        //}



        /**
         * 修改HTML上的文字
         */
        switch (Number(currentControlType))
        {
            case 1:
                if(editInfoSelectedObj) {
                    var tempEditInfoSelectedObjName = editInfoSelectedObj.name;
                    var pos1 = tempEditInfoSelectedObjName.indexOf("=");
                    var pos2 = tempEditInfoSelectedObjName.indexOf("_");
                    var editInfoSelectedObjName = tempEditInfoSelectedObjName.substring(0,pos2);
                    var editInfoSelectedObjType = tempEditInfoSelectedObjName.substring(pos1+1,pos2);
                    document.getElementById("objectName").value =editInfoSelectedObjName;
                    document.getElementById("objectId").value =editInfoSelectedObj.uuid;
                    document.getElementById("objectType").value =editInfoSelectedObjType;
                }
                break;
            case 2:
                if(SELECTED) {
                    document.getElementById("keyword5").value =SELECTED.position.x.toFixed(2);
                    document.getElementById("keyword6").value =SELECTED.position.y.toFixed(2);
                    document.getElementById("keyword7").value =SELECTED.position.z.toFixed(2);
                    document.getElementById("keyword8").value =SELECTED.rotation.x.toFixed(2);
                    document.getElementById("keyword9").value =SELECTED.rotation.y.toFixed(2);
                    document.getElementById("keyword10").value =SELECTED.rotation.z.toFixed(2);
                    document.getElementById("keyword11").value =SELECTED.scale.x.toFixed(2);
                    document.getElementById("keyword12").value =SELECTED.scale.y.toFixed(2);
                    document.getElementById("keyword13").value =SELECTED.scale.z.toFixed(2);
                }
                break;
            case 3:
                if(point.length == 2){
                    document.getElementById("point1_x").value =point[0].position.x.toFixed(2);
                    document.getElementById("point1_y").value =point[0].position.y.toFixed(2);
                    document.getElementById("point1_z").value =point[0].position.z.toFixed(2);
                    document.getElementById("point2_x").value =point[1].position.x.toFixed(2);
                    document.getElementById("point2_y").value =point[1].position.y.toFixed(2);
                    document.getElementById("point2_z").value =point[1].position.z.toFixed(2);
                    document.getElementById("keyword17").value =lineDistance.toFixed(3);
                    document.getElementById("keyword18").value =Math.abs(point[0].position.x-point[1].position.x).toFixed(3);
                    document.getElementById("keyword19").value =Math.abs(point[0].position.y-point[1].position.y).toFixed(3);
                    document.getElementById("keyword20").value =Math.abs(point[0].position.z-point[1].position.z).toFixed(3);
                }

                break;
            case 4:
                break;
        }


        if(cameraType==-1 && currentControlType!=2)
        {
            // rayCollision();

            if(!isOnload) {
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
                            // $("#triggerUI").css({"display":"block"});
                            // setTimeout(function(){
                            //     $("#triggerUI").addClass("in");
                            //     // isOnload = true;
                            // },10)
                            // $("body,html").css({"overflow":"hidden"})
                            // console.log("in trigger area");
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
                            //jumpPosition.set(triggerX2,triggerY2,triggerZ2);
                            jumpPosition = new THREE.Vector3(triggerX2,triggerY2,triggerZ2);
                            //backPosition.set(triggerX1-directionVector.x*1,triggerY1-directionVector.y*1,triggerZ1-directionVector.z*1);
                            backPosition = new THREE.Vector3(triggerX1-directionVector.x*1.5,triggerY1-directionVector.y*1.5,triggerZ1-directionVector.z*1.5);

                            preBlockName = currentBlockName;
                            destroyGroup();
                            currentBlockName = triggerKey;
                            startDownloadNewBlock(currentBlockName);
                            camControls.targetObject.position.set(jumpPosition.x,jumpPosition.y,jumpPosition.z);

                        }
                    }

                }
                camControls.object.position.set(camControls.targetObject.position.x,camControls.targetObject.position.y,camControls.targetObject.position.z);
            }
        }

        if(isRend==1){
            renderer.render(scene, camera);
        }

    }

    //摄像机的碰撞检测
    function rayCollision()
    {
        var ray = new THREE.Raycaster( camControls.targetObject.position, new THREE.Vector3(0,-1,0),0,1.5 );
        var collisionResults = ray.intersectObjects( downArr );
        if(collisionResults.length>0 && (collisionResults[0].distance<1.1 || collisionResults[0].distance>=1.1))
        {
//                        camControls.targetObject.translateY( 5*clock.getDelta() );
            camControls.targetObject.position.set(camControls.targetObject.position.x,collisionResults[0].point.y+1.1,camControls.targetObject.position.z);
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
            //console.log(collisionResults[0].object.name);
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


    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(),
        SELECTED;
    var oriGeo = new THREE.Geometry;
    var meshMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff});
    var selectedOriginMat;
    var selectStack = [];
    var selectChaBefor,
        selectChaAfter;
    var oldPos=new THREE.Vector3(),
        oldSca=new THREE.Vector3(),
        oldRot=new THREE.Euler();
    var isStartSelectGroup = false;


    var operationList = []; //记录操作过程的数组
    var operationIndex = 0; //当前操作对应的索引
    var isClickOnLine = false;  //判断是否点击到轴上，不然不记录
    function operationItem() {
        this.operationObject = null;
        this.itemPosition = new THREE.Vector3();
        this.itemRotation = new THREE.Vector3();
        this.itemScale = new THREE.Vector3();
    }

    var transformMode = 2;
//控制编辑模式
    function controlGui(){

        document.getElementById("setSpace").onclick= function() {
            transformControls.setSpace( transformControls.space === "local" ? "world" : "local" );
            return;
        };
        document.getElementById("translate").onclick= function() {
            transformControls.setMode( "translate" );
            transformMode = 0;
            return;
        };
        document.getElementById("rotate").onclick= function() {
            transformControls.setMode( "rotate" );
            transformMode = 1;
            return;
        };
        document.getElementById("scale").onclick= function() {
            transformControls.setMode( "scale" );//最大位伸为5倍
            transformMode = 2;
            return;
        };
        // document.getElementById("saveTranslate").onclick= function() {
        //     /**
        //      * 点击保存，需要重新绘制场景的构件，但是前提是需要把modelV这一类的数据内容进行更新
        //      */
        //     //redrawScene();
        //     //for(var i=0; i<forArr.length;i++)
        //     //{
        //     //    forArr[i].material = new THREE.MeshBasicMaterial({
        //     //        opacity:0.5,
        //     //        color: 0x000000,
        //     //        transparent:true,
        //     //        wireframe: false,
        //     //        side: THREE.DoubleSide
        //     //    });
        //     //    forArr[i].visible = true;
        //     //}
        //     return;
        // };

        /*$("transformControl-pan").append(renderer.domElement);
         //renderer.domElement.style.float = 'left';
         renderer.domElement.style.position = 'absolute';
         renderer.domElement.style.Left = '0px';
         renderer.domElement.style.Top = '50%';*/
    }
    controlGui();

    var selectedObjArr = [];//用于存放被选中的物体的数组

    //判断元素是否在数组内
    Array.prototype.contains = function (obj) {
        var i = this
            .length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };
//删除指定下标无素方法；
    Array.prototype.del = function (index) {
        if (isNaN(index) || index >= this.length) {
            return false;
        }
        for (var i = 0, n = 0; i < this.length; i++) {
            if (this[i] != this[index]) {
                this[n++] = this[i];
            }
        }
        this.length -= 1;
    };

    //鼠标按下编辑
    function onDocumentMouseDown( event ) {

        if(currentControlType == 2)
        {


            event.preventDefault();

            mouse.x = ( (event.clientX - windowStartX) / windowWidth ) * 2 - 1;
            mouse.y = - ( (event.clientY - windowStartY) / windowHeight ) * 2 + 1;

            raycaster.setFromCamera( mouse, camera );


            //组管理
            /**
             * 组管理，先关闭该功能
             */
            function newGroup() {
                //     var temp = [];
                //     for (var i = 0; i < muti_SELECTED.length; i++) {
                //         for (var j = 0; j < muti_SELECTED[i].length; j++) {
                //             temp.push(muti_SELECTED[i][j])
                //         }
                //         for (var fornumbTmp = 0; fornumbTmp <= select_Id; fornumbTmp++) {
                //             //       fornumbTmp = 0;
                //             (function (index) {
                //                 if (onButton_tag[index]) {
                //                     if (!temp.contains(SELECTED)) {
                //                         muti_SELECTED[index].push(SELECTED);
                //                     }
                //                 }
                //             })(fornumbTmp);
                //         }
                //     }
            }


            //射线与mesh相交
            var intersects = raycaster.intersectObjects( polyhedrons );
            var raycastTestArr = [];
            //旋转与平移、拉伸分开判定；
            if(transformMode ==0||transformMode ==2) {
                for (var i = 0; i < transformControls.children[transformMode].children.length; i++) {
                    for (var j = 0; j < transformControls.children[transformMode].children[i].children.length; j++) {
                        var tempObjName = transformControls.children[transformMode].children[i].children[j].name;
                        if (tempObjName != "XY" && tempObjName != "YZ" && tempObjName != "XZ" && tempObjName != "XYZE" && tempObjName != "XYZ" && tempObjName != "E") {
                            raycastTestArr.push(transformControls.children[transformMode].children[i].children[j]);
                        }
                    }
                }
                //此时，Mode = 1时会bug
                for (var j = 0; j < raycastTestArr.length; j++) {
                    var tempObjName = raycastTestArr[j].name;
                    var tempObjTyp = raycastTestArr[j].type;
                    //console.log(tempObjTyp);
                    if (tempObjTyp == "Line") {
                        if (tempObjName == "Z" || tempObjName == "X" || tempObjName == "Y") {
                            raycastTestArr.del(j);
                        }
                    }
                }
            }
            else if(transformMode==1) {
                var rotateLenght=transformControls.children[transformMode].children[1].children.length;
                for (var i = 0; i < rotateLenght; i++) {
                    raycastTestArr.push(transformControls.children[transformMode].children[1].children[i]);
                }
            }


            //射线与操纵杆相交
            var intersectsArr = raycaster.intersectObjects(raycastTestArr);


            //这里需要写个新函数，封装一下，传入参数：name,point，传出参数重绘并选中的object
            if(intersects[0] && intersectsArr.length<=0 ) {
                //当选中某个object时

                var tempComponentName = intersects[0].object.name;
                var pos=tempComponentName.lastIndexOf("_");
                var ind=tempComponentName.substring(pos+1);
                if(ind!="copy")
                {
                    unDisplayModelArr = [];
                    var targetObj = getComponentByNameAndPoint(intersects[0].object.name, intersects[0].point);
                    selectedObjArr.push(targetObj);
                }
                else
                {
                    var targetObj = intersects[0].object;
                }
                //console.log(getIndexArrByFileName(ind));
            }




            if ( targetObj && intersectsArr.length<=0) {
                if (SELECTED) {
                    SELECTED.material = selectedOriginMat;
                }
                SELECTED = targetObj;
                newGroup();
                selectedOriginMat = SELECTED.material;
                //    console.log(intersects[ 0 ].point);
                //几何中心
                getCenterPositionByVertexArr (SELECTED.geometry.vertices);

                camera.lookAt(SELECTED.position);

                transformControls.attach( SELECTED);
                scene.add( transformControls );
                transformControls.setSize(0.3);
                console.log(SELECTED);

                SELECTED.material = meshMaterial;


                if(operationIndex<operationList.length)
                {
                    //如果index小于操作栈的总长度，而且此时开始执行新的操作，那么需要把操作栈中大于index的之后的所有元素删除
                    operationList.length = operationIndex;
                }
                if((operationIndex==0 || operationList[operationIndex-1].operationObject!=SELECTED) && !isStartSelectGroup)
                {
                    //索引=0或者前一个物体和当前物体不一致时才会在按下鼠标左键时记录到数组中，否则只在释放鼠标时记录
                    var operation = new operationItem();
                    operation.operationObject = SELECTED;
                    operation.itemPosition.set(SELECTED.position.x,SELECTED.position.y,SELECTED.position.z);
                    operation.itemRotation.set(SELECTED.rotation.x,SELECTED.rotation.y,SELECTED.rotation.z);
                    operation.itemScale.set(SELECTED.scale.x,SELECTED.scale.y,SELECTED.scale.z);
                    operationList.push(operation);
                    operationIndex++;
                    console.log(operationIndex + "of" + operationList.length);
                }


            }
            else if (intersectsArr.length<=0 && intersects.length<=0){
                //什么都没选中时
                transformControls.detach( SELECTED);
                if (SELECTED) {
                    SELECTED.material = selectedOriginMat;
                }
                //此处判断逻辑有待完善(待更改的材质赋值时，groupMat为空)--TransformControls.js:1257 Uncaught TypeError: Cannot read property 'length' of undefined
                if (muti_group.length > 0) {
                    for (i = 0; i < muti_group.length; i++) {
                        for (j = 0; j < muti_group[i].children.length; j++) {
                            muti_group[i].children[j].material = groupMat[i][j];
                        }
                    }
                }
            }
            else if(intersectsArr.length>0 || intersects.length>0){
                SELECTED.material = meshMaterial;
                isClickOnLine = true;
                if(operationIndex<operationList.length)
                {
                    //如果index小于操作栈的总长度，而且此时开始执行新的操作，那么需要把操作栈中大于index的之后的所有元素删除
                    operationList.length = operationIndex;
                }
            }

        }

        if(currentControlType==3){   //这里是为了实现点的拖动
            determineTarget();
            if(spriteNumber!=null){   //这里是为了处理移动动作序列（为undo、redo做准备）
                var tempPosition=new THREE.Vector3;
                tempPosition.copy(point[spriteNumber].position);
                var temp={opCode:3,
                    opStartPosition:tempPosition
                };
                operationQueue.push(temp);
            }

        }

    }

    function onDocumentMouseMove(event) {
        if(currentControlType == 3)
        {
            getIntersectInformation(event);
            modifyPoint();
        }
    }
    function onDocumentMouseUp( event ) {
        console.log(SELECTED);

        //socketEmit();


        if(currentControlType == 2)
        {
            event.preventDefault();
            // console.log(SELECTED);

            if(isClickOnLine)
            {
                //如果没有按到轴上，则由于没有操作而不会记录
                var operation = new operationItem();
                operation.operationObject = SELECTED;
                operation.itemPosition.set(SELECTED.position.x,SELECTED.position.y,SELECTED.position.z);
                operation.itemRotation.set(SELECTED.rotation.x,SELECTED.rotation.y,SELECTED.rotation.z);
                operation.itemScale.set(SELECTED.scale.x,SELECTED.scale.y,SELECTED.scale.z);
                operationList.push(operation);
                operationIndex++;
                isClickOnLine = false;
                // console.log(operationIndex + "of" + operationList.length);

                redrawScene();
            }

        }
        if(currentControlType == 3)
        {
            endModify();
        }
    }


    function  onKeyDown(event)
    {
        if(currentControlType == 3)
        {
            if(event.keyCode == 13 )
            {
                console.log("press enter");
                computeLineDistance();
                renderer.render(scene,camera);
            }
            if(event.keyCode == 97)
            {
                console.log("delete");
                deletePoint();
                renderer.render(scene,camera);
            }

            if(event.keyCode == 99){
                console.log("cancel measuring");
                zapPoint();
                removeArrayOfObjectFromScene(closetDistanceShow);
                catchObject=false;
                measuringObject=[];
                renderer.render(scene,camera);
            }

            if(event.keyCode==100){
//                console.log("Starting capture objects");
                getObjects();

            }

            if(event.keyCode==101){
                console.log("Output result");

                showObjectObjectClosetPoints(measuringObject[measuringObject.length-1],
                    measuringObject[measuringObject.length-2]);

            }
        }
        if(currentControlType == 4)
        {
            if(event.keyCode == 27){
                if(sphere){
                    scene.remove(sphere);
                }
                if(INTERSECTED){
                    INTERSECTED.material = storeMaterial
                }
                INTERSECTED = null;
                storeMaterial = null;
                sphere = null;
            }
        }

    }


    var editInfoSelectedObj;
    var originMat;

    $('#WebGL-output').dblclick(function(event){
        if(currentControlType == 1)
        {
            event.preventDefault();
            mouse.x = ( (event.clientX-windowStartX) / windowWidth ) * 2 - 1;
            mouse.y = - ( (event.clientY-windowStartY) / windowHeight ) * 2 + 1;

            var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
            projector.unprojectVector( vector, camera );
            var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

            var intersects = raycaster.intersectObjects( polyhedrons );
            var tempNewComponent;
            unDisplayModelArr = [];//要清空这个数组，不然第二次点击就不会再显示
            if ( intersects.length > 0 ) {
                var tempComponentName = intersects[0].object.name;
                var pos=tempComponentName.lastIndexOf("_");
                var ind=tempComponentName.substring(pos+1);
                if(ind!="copy")
                {
                    tempNewComponent = getComponentByNameAndPoint(intersects[0].object.name,intersects[0].point);
                }
                else
                {
                    tempNewComponent = intersects[0].object;
                }
            }
            if(editInfoSelectedObj != tempNewComponent) {
                //选中构件存在，删除之前那个
                if(editInfoSelectedObj)
                {
                    scene.remove(editInfoSelectedObj);
                    polyhedrons.splice(polyhedrons.length-2,1);
                }
                editInfoSelectedObj = tempNewComponent;
                editInfoSelectedObj.material = new THREE.MeshPhongMaterial({
                    alphaTest: 0.5,
                    color: new THREE.Color(0xff0054),
                    specular: 0xffae00,
                    side: THREE.DoubleSide,
                    polygonOffset:true,
                    polygonOffsetFactor:-1
                });
            }
            // else {
            //     scene.remove(tempNewComponent);
            // }
        }
        if(currentControlType == 3)
        {
            pushPoint(event);
            determineTarget();
            getIntersectInformation(event);
        }
        if(currentControlType==4)
        {
            //1左键,2中建
            if(event.which == 1) {

                event.preventDefault();
                mouse.x = ( (event.clientX - windowStartX) / windowWidth ) * 2 - 1;
                mouse.y = -( (event.clientY - windowStartY) / windowHeight ) * 2 + 1;

                var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
                projector.unprojectVector(vector, camera);
                var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

                var intersects = raycaster.intersectObjects(polyhedrons);

                if (intersects.length > 0) {

                    console.log(intersects[0].object)

                    if (INTERSECTED != intersects[0].object) {
                        if (sphere) {
                            scene.remove(sphere);
                        }
                        if (INTERSECTED) {
                            INTERSECTED.material = storeMaterial
                        }

                        var sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
                        var sphereMesh = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({
                            alphaTest: 0.5,
                            ambient: 0xcccccc,
                            color: 0xffffff,
                            specular: 0x030303,
                            side: THREE.DoubleSide
                        }));
                        sphereMesh.position.x = intersects[0].point.x;
                        sphereMesh.position.y = intersects[0].point.y;
                        sphereMesh.position.z = intersects[0].point.z;
                        // console.log(sphereMesh.position);
                        scene.add(sphereMesh);
                        sphere = sphereMesh
                        currentMesh = intersects[0].object;

                        storeMaterial = currentMesh.material;
                        currentMesh.material = new THREE.MeshPhongMaterial({
                            alphaTest: 0.5,
                            color: new THREE.Color(0x9caeba),
                            specular: 0xffae00,
                            side: THREE.DoubleSide
                        });
                        currentMesh.material.emissive.setHex(0xff0000)

                        INTERSECTED = currentMesh;
                    }
                }
            }else{
                event.preventDefault();
                mouse.x = ( (event.clientX - windowStartX) / windowWidth ) * 2 - 1;
                mouse.y = -( (event.clientY - windowStartY) / windowHeight ) * 2 + 1;

                var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
                projector.unprojectVector(vector, camera);
                var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

                var intersects = raycaster.intersectObjects(polyhedrons);

                if (intersects.length > 0) {


                    if (INTERSECTED2 != intersects[0].object) {

                        INTERSECTED2 = intersects[0].object;
                    }
                }
            }
        }
    });

    $('.RedoUndoDiv button').on('click',function(e){

        var btnClickedId = e.target.id;
        if(btnClickedId == "redo") {
            //先判断index是否还有下一步
            if(operationIndex<operationList.length-1)
            {
                operationIndex++;
                var tempOperationitem = operationList[operationIndex];
                tempOperationitem.operationObject.position.set(tempOperationitem.itemPosition.x,tempOperationitem.itemPosition.y,tempOperationitem.itemPosition.z);
                tempOperationitem.operationObject.rotation.set(tempOperationitem.itemRotation.x,tempOperationitem.itemRotation.y,tempOperationitem.itemRotation.z);
                tempOperationitem.operationObject.scale.set(tempOperationitem.itemScale.x,tempOperationitem.itemScale.y,tempOperationitem.itemScale.z);
                transformControls.attach( tempOperationitem.operationObject );
            }
        } else {
            //如果index是最后一步需要先自减，因为index和length是一样的
            if(operationIndex==operationList.length)operationIndex--;
            if(operationIndex>0)
            {
                operationIndex--;
                var tempOperationitem = operationList[operationIndex];
                tempOperationitem.operationObject.position.set(tempOperationitem.itemPosition.x,tempOperationitem.itemPosition.y,tempOperationitem.itemPosition.z);
                tempOperationitem.operationObject.rotation.set(tempOperationitem.itemRotation.x,tempOperationitem.itemRotation.y,tempOperationitem.itemRotation.z);
                tempOperationitem.operationObject.scale.set(tempOperationitem.itemScale.x,tempOperationitem.itemScale.y,tempOperationitem.itemScale.z);
                transformControls.attach( tempOperationitem.operationObject );
            }

        }

    })


    /******************************************************************
     * 用于距离测量的代码
     *
     */
    var point=[];     //用以存放点击位置的sprite数组
    var pointRecycle=[];  //用以回收被删除的点击位置
    var lineGeometry=null;   //用以存放指示线几何信息
    var line=null;              //作为指示线的引用
    var closetDistanceShow=[];   //用以存放示例构件
    var maxPoints = 2;
    var spritematerial;
    var operationQueue=[];
    var operationPt=null;     //用以存放位置指针
    var verifyOperationQueueLength=null;
    var loader=new THREE.TextureLoader();
    loader.load('assets/textures/cross.bmp',function(texture){
        spritematerial=new THREE.SpriteMaterial({
            transparent:true,
            opacity:0.4,
            map:texture
        });
    });

    var nowIntersects=[];                                //用以存放目前射线击中情况
    var spriteNumber;
    function getIntersectInformation(event){
        var mouse=new THREE.Vector2();
        var rayCaster=new THREE.Raycaster();
        mouse.x = ( (event.clientX-windowStartX) / windowWidth ) * 2 - 1;
        mouse.y = - ( (event.clientY-windowStartY) / windowHeight ) * 2 + 1;
        rayCaster.setFromCamera(mouse,camera);
        var intersects=rayCaster.intersectObjects(polyhedrons);
        if(intersects.length>0){
            nowIntersects=intersects;
        }

    }

    function determineTarget(){
        if(nowIntersects.length==0) return;
        if(nowIntersects[0].object.material==spritematerial){
            spriteNumber=point.indexOf(nowIntersects[0].object);

        }
    }

    function modifyPoint(){
        if(spriteNumber==null) return;
        point[spriteNumber].position.copy(nowIntersects[0].point);
        renderer.render(scene,camera);

    }

    function endModify() {
        if(spriteNumber!=null){
            var tempPosition = new THREE.Vector3;
            tempPosition.copy(point[spriteNumber].position);
            var testPosition = operationQueue[operationQueue.length - 1].opStartPosition;
            if (!tempPosition.equals(testPosition)) {
                operationQueue[operationQueue.length - 1].opObject = point[spriteNumber];
                operationQueue[operationQueue.length - 1].opAfterPosition = tempPosition;
            } else {
                operationQueue.pop();
            }
        }
        spriteNumber=null;
        computeLineDistance();

    }





    function pushPoint(event){
        var mouse=new THREE.Vector2();
        var rayCaster=new THREE.Raycaster();
        var partical=new THREE.Sprite(spritematerial);
        mouse.x=( (event.clientX-windowStartX) / windowWidth )*2-1;
        mouse.y=-( (event.clientY-windowStartY) / windowHeight )*2+1;
        rayCaster.setFromCamera(mouse,camera);
        var intersects=rayCaster.intersectObjects(polyhedrons);
        if(intersects.length>0){
            if(catchObject==true){
                measuringObject.push(intersects[0].object);
            }

            if(intersects[0].object.material==spritematerial){
                return;
            }
            partical.position.copy(intersects[0].point);
            console.log(partical);
            if(point.length < maxPoints)
            {
                point.push(partical);
                scene.add(partical);
                //下面处理加点插入数组
                var addTemp={
                    opCode:1,
                    opObject:partical
                };
                operationQueue.push(addTemp);


            }
            if(point.length==2){
                computeLineDistance();
            }

        }
    }

    var lineDistance = 0;
    function computeLineDistance(){
        var result=0;
        var lineGeometry=new THREE.Geometry();
        scene.remove(line);
        for (var i=0;i<point.length-1;i++){
            lineGeometry.vertices.push(point[i].position);
            result+= Math.sqrt((point[i].position.x-point[i+1].position.x)*(point[i].position.x-point[i+1].position.x)+
                (point[i].position.y-point[i+1].position.y)*(point[i].position.y-point[i+1].position.y)+
                (point[i].position.z-point[i+1].position.z)*(point[i].position.z-point[i+1].position.z)
            )
        }
        lineGeometry.vertices.push(point[point.length-1].position);
        line=new THREE.Line(lineGeometry,new THREE.LineBasicMaterial({
            linewidth:10
        }));
        scene.add(line);
        lineDistance = result;

        console.log("Total measuring distance:"+result);

    }

    function deletePoint(){
        scene.remove(line);
        var temp=point.pop();
        pointRecycle.push(temp);
        if(temp!=undefined){
            var addTemp={
                opCode:2,
                opObject:temp,
                opPosition:point.indexOf(temp)
            };
            operationQueue.push(addTemp);
        }
        scene.remove(temp);
        if(point.length<1) {
            console.log("Total measuring distance:0");
            return;
        }
        computeLineDistance();

    }

    function addPoint(){
        var temp=pointRecycle.pop();
        if(typeof temp !== "object") return;
        scene.remove(line);
        scene.add(temp);
        point.push(temp);
        computeLineDistance();

    }

    function zapPoint(){
        scene.remove(line);
        while(point.length>0){
            var temp=point.pop();
            scene.remove(temp);
        }
    }

    function disposeUndo(){

        var quote; //用于辨别当前的操作是什么
        var nowLength=operationQueue.length;
        if(operationPt==null) {
            operationPt=nowLength-1;
            verifyOperationQueueLength=operationQueue.length;
        }
        if(verifyOperationQueueLength!==operationQueue.length){
            //alert("Array be changed");
            var delCount=verifyOperationQueueLength-operationPt-1;
            //if(operationPt==-1) delCount-=1;
            if(delCount>0){
                operationQueue.splice(operationPt+1,delCount);
                verifyOperationQueueLength=operationQueue.length;
                operationPt=verifyOperationQueueLength-1;
            }
        }
        if(operationPt===-1) return;
        if(operationPt>-1){
            quote=operationQueue[operationPt].opCode;
            switch (quote){
                case 1:scene.remove(operationQueue[operationPt].opObject);
                    point.splice(point.indexOf(operationQueue[operationPt].opObject),1);
                    break;
                case 2:scene.add(operationQueue[operationPt].opObject);
                    point.splice(operationQueue[operationPt].opPosition,0,operationQueue[operationPt].opObject);
                    break;
                case 3:operationQueue[operationPt].opObject.position.copy
                (operationQueue[operationPt].opStartPosition);
                    break;
            }
            operationPt--;
            computeLineDistance();
        }

    }

    function disposeRedo(){
        var quote; //用于辨别当前的操作是什么
        var nowLength=operationQueue.length;
        if(operationPt==null) {
            operationPt=nowLength-1;
            verifyOperationQueueLength=operationQueue.length;
        }
        if(verifyOperationQueueLength!==operationQueue.length){
            //alert("Array be changed");
            var delCount=verifyOperationQueueLength-operationPt-1;
            //if(operationPt==-1) delCount-=1;
            if(delCount>0){
                operationQueue.splice(operationPt+2,delCount);
                verifyOperationQueueLength=operationQueue.length;
                operationPt=verifyOperationQueueLength-1;
            }
        }
        if(operationPt===nowLength-1) return;
        if(operationPt<operationQueue.length-1){
            quote=operationQueue[operationPt+1].opCode;
            switch (quote){
                case 1:scene.add(operationQueue[operationPt+1].opObject);
                    point.splice(point.indexOf(operationQueue[operationPt+1].opObject),0,operationQueue[operationPt+1].opObject);
                    break;
                case 2:scene.remove(operationQueue[operationPt+1].opObject);
                    point.splice(operationQueue[operationPt+1].opPosition,1);
                    break;
                case 3:operationQueue[operationPt+1].opObject.position.copy
                (operationQueue[operationPt+1].opAfterPosition);
                    break;
            }
            operationPt++;
            computeLineDistance();
        }
    }



    $(".RedoUndoDiv Button").on("click",function(e){    //处理距离点的撤销与重置
        var btnClickedId= e.target.id;
        if(btnClickedId=="undod"){
            disposeUndo()
        }else if(btnClickedId=="redod"){
            disposeRedo();
        }

    });

    var measuringObject=[];   //用以存放选择的物体
    var catchObject=false;
    function getObjects(){
        console.log("Start catching object!");
        catchObject=true;

    }

    function getMeshTriangleVertices(object){
        var triangleV=[];
        object.updateMatrixWorld();
        var vert=[];

        for(var i=0;i<object.geometry.vertices.length;i++){
            var tempVer = object.geometry.vertices[i].clone();
            tempVer = object.localToWorld(tempVer);
            vert.push(tempVer);
        }


        for(i=0;i<object.geometry.faces.length;i++){
            var temp=[];
            temp.push(vert[object.geometry.faces[i].a]);
            temp.push(vert[object.geometry.faces[i].b]);
            temp.push(vert[object.geometry.faces[i].c]);
            triangleV.push(temp);
        }

        return triangleV;

    }

    function closetObjectObjectInformation(a,b){
        var temp=[],resulttemp;
        var result=[];
        var pos,posX,posY;
        for(var i=0;i< a.length;i++){
            for(var j=0;j<b.length;j++){
                var value=triangleTriangleSquaredDistance(a[i][0],a[i][1],a[i][2],
                    b[j][0],b[j][1],b[j][2]);
                //if(value<zero) return 0;
                temp.push(value);
            }
        }
        resulttemp=findArrayMinInformation(temp);
        result.push(resulttemp[0]);
        pos=resulttemp[1];
        posX=Math.ceil((pos+1)/b.length)-1;
        posY=((pos+1)%b.length)-1;
        if(posY<0) {
            posY+= b.length;
        }
        result.push(a[posX]);
        result.push(b[posY]);
//            console.log(result);
        return result;

    }

    function computeObjectObjectDistance(a,b){
        return Math.sqrt(closetObjectObjectInformation(a,b)[0]);
    }


    function showSegmentSegmentClosetPoint(p1,q1,p2,q2){
        var temp=segmentSegmentClosetPoints(p1,q1,p2,q2);
        console.log("The distance between two segments is:"+Math.sqrt(temp[0].distanceToSquared(temp[1])));
        geo=new THREE.Geometry;
        geo1=new THREE.Geometry;
        geo2=new THREE.Geometry;
        geo.vertices=temp;
        geo1.vertices=[p1,q1];
        geo2.vertices=[p2,q2];
        line1=new THREE.Line(geo1,new THREE.LineBasicMaterial({color:Math.random()*0xffffff}));
        line2=new THREE.Line(geo2,new THREE.LineBasicMaterial({color:Math.random()*0xffffff}));
        line3=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xff0000}));
        sphere1=new THREE.Mesh(new THREE.SphereGeometry(0.2),new THREE.MeshBasicMaterial({color:0xff0000}));
        sphere1.position.copy(temp[0]);
        sphere2=new THREE.Mesh(new THREE.SphereGeometry(0.2),new THREE.MeshBasicMaterial({color:0xff0000}));
        sphere2.position.copy(temp[1]);
        closetDistanceShow.push(line1);
        closetDistanceShow.push(line2);
        closetDistanceShow.push(line3);
        closetDistanceShow.push(sphere1);
        closetDistanceShow.push(sphere2);
        addArrayOfObjectToScene(closetDistanceShow);

        renderer.render(scene,camera);

    }

    function showPointTriangleClosetPoint(p,a,b,c){
//            var ptdest=new THREE.Vector3;
        var linegeo1=new THREE.Geometry;
        var linegeo2=new THREE.Geometry;
        var ptdest=closetPtPointTriangle(p,a,b,c);
        //lines
        linegeo1.vertices=[ptdest,p];
        linegeo2.vertices=[a,b,c,a];
        closetDistanceShow.push(new THREE.Line(linegeo1,new THREE.LineBasicMaterial({color:0xffffff*Math.random()})));
        closetDistanceShow.push(new THREE.Line(linegeo2,new THREE.LineBasicMaterial({color:0xffffff*Math.random()})));
        //spheres
        closetDistanceShow.push(getSampleBall(ptdest));
        closetDistanceShow.push(getSampleBall(p));
        closetDistanceShow.push(getSampleBall(a));
        closetDistanceShow.push(getSampleBall(b));
        closetDistanceShow.push(getSampleBall(c));
        addArrayOfObjectToScene(closetDistanceShow);
        console.log("The distance between the point and the triangle is:"+ p.distanceTo(ptdest));

        renderer.render(scene,camera);

    }

    function getSampleBall(pos){
        var geo=new THREE.SphereGeometry(0.2);
        var temp=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xff302c}));
        temp.position.copy(pos);
        return temp;
    }

    function addArrayOfObjectToScene(arr){
        for(var i=0;i<arr.length;i++){
            scene.add(arr[i]);
        }
    }

    function removeArrayOfObjectFromScene(arr){
        while(arr.length>0){
            var temp=arr.pop();
            scene.remove(temp);
        }
    }

    function showTriangleTriangleClosetPoint(a,b,c,d,e,f){

        var token=triangleTriangleSquaredInformation(a,b,c,d,e,f)[1];
        console.log("The distance between two object is equal to:");
        switch (token){
            case 0:showSegmentSegmentClosetPoint(a,b,d,e);
                break;
            case 1:showSegmentSegmentClosetPoint(a,b,d,f);
                break;
            case 2:showSegmentSegmentClosetPoint(a,b,e,f);
                break;
            case 3:showSegmentSegmentClosetPoint(a,c,d,e);
                break;
            case 4:showSegmentSegmentClosetPoint(a,c,d,f);
                break;
            case 5:showSegmentSegmentClosetPoint(a,c,e,f);
                break;
            case 6:showSegmentSegmentClosetPoint(b,c,d,e);
                break;
            case 7:showSegmentSegmentClosetPoint(b,c,d,f);
                break;
            case 8:showSegmentSegmentClosetPoint(b,c,e,f);
                break;
            case 9:showPointTriangleClosetPoint(a,d,e,f);
                break;
            case 10:showPointTriangleClosetPoint(b,d,e,f);
                break;
            case 11:showPointTriangleClosetPoint(c,d,e,f);
                break;
            case 12:showPointTriangleClosetPoint(d,a,b,c);
                break;
            case 13:showPointTriangleClosetPoint(e,a,b,c);
                break;
            case 14:showPointTriangleClosetPoint(f,a,b,c);
                break;
        }
        var tri1=new THREE.Geometry;
        var tri2=new THREE.Geometry;
//            var show=[];
        tri1.vertices=[a,b,c,a];
        tri2.vertices=[d,e,f,d];
        closetDistanceShow.push(new THREE.Line(tri1,new THREE.LineBasicMaterial({color:0xff1c3d})));
        closetDistanceShow.push(new THREE.Line(tri2,new THREE.LineBasicMaterial({color:0xff4c3d})));
        addArrayOfObjectToScene(closetDistanceShow);
    }

    function showObjectObjectClosetPoints(a,b){
        var e=getMeshTriangleVertices(a);
        var f=getMeshTriangleVertices(b);
        var temp=closetObjectObjectInformation(e,f);
        showTriangleTriangleClosetPoint(temp[1][0],temp[1][1],temp[1][2],temp[2][0],temp[2][1],temp[2][2]);

    }

    //输入点(THREE.Vector3)和要比较的对象(有THREE对象的Geometry属性)
    //返回距离最小值的平方
    function pointObjectClosetDistance(point, obj) {
        var triangles = getMeshTriangleVertices(obj);  //获取obj
        var tempMin = 0xffff;          //用于存放目前最短距离数值
        var temp = 0;                   //用于存放中间计算结果
        for(var i = 0 ; i<triangles.length ;i ++){
            temp= pointTriangleSquaredDistance(point,triangles[i][0],triangles[i][1],triangles[i][2]);
            if(temp<tempMin){
                tempMin = temp;
            }
        }
        return tempMin;

    }

    /************************************************************************
     * 贴图功能
     */
    {
        var textureURL = './assets/textures/envmap.png';
        var textureURL1 = './assets/textures/crate.gif';
        var textureURL2 = './assets/textures/disturb.jpg';
        var textureURL3 = './assets/textures/soil_diffuse.jpg';
        var textureURL4 = './assets/textures/water.jpg';
        var texture2URL = './assets/textures/disturb.jpg'
        var maxAnisotropy = renderer.getMaxAnisotropy();
        var diffuseColor = new THREE.Color( 0.5, 0.5, 0.5 );
        var specularColor = new THREE.Color( 1, 1, 1 );
        var shading = THREE.SmoothShading;


        var texture = THREE.ImageUtils.loadTexture( textureURL );
        texture.anisotropy = maxAnisotropy;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );
        var material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture,side: THREE.DoubleSide,shininess:5000,shading:shading,opacity:1,transparent:true,specular:specularColor});

        var texture1 = THREE.ImageUtils.loadTexture( textureURL1 );
        texture1.anisotropy = maxAnisotropy;
        texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
        texture1.repeat.set( 1, 1 );
        var material1 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture1,side: THREE.DoubleSide ,shininess:5000,shading:shading,opacity:1,transparent:true,specular:specularColor,reflectivity:1} );

        var texture2 = THREE.ImageUtils.loadTexture( textureURL2 );
        texture2.anisotropy = maxAnisotropy;
        texture2.wrapS = texture2.wrapT = THREE.RepeatWrapping;
        texture2.repeat.set( 1, 1 );
        var material2 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture2,side: THREE.DoubleSide ,shininess:5000,shading:shading,opacity:1,transparent:true,specular:specularColor} );

        var texture3 = THREE.ImageUtils.loadTexture( textureURL3 );
        texture3.anisotropy = maxAnisotropy;
        texture3.wrapS = texture3.wrapT = THREE.RepeatWrapping;
        texture3.repeat.set( 1, 1 );
        var material3 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture3,side: THREE.DoubleSide ,shininess:5000,shading:shading,opacity:1,transparent:true,specular:specularColor} );

        var texture4 = THREE.ImageUtils.loadTexture( textureURL4 );
        texture4.anisotropy = maxAnisotropy;
        texture4.wrapS = texture4.wrapT = THREE.RepeatWrapping;
        texture4.repeat.set( 1, 1 );
        var material4 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture4,side: THREE.DoubleSide ,shininess:5000,shading:shading,opacity:1,transparent:true} );

        var mouse = { x: 0, y: 0 }, INTERSECTED,INTERSECTED2, projector;
        projector = new THREE.Projector();
        var currentMesh,sphere;
        var storeMaterial;
    }
    


    $('.texture-item').on('click',function(e){
        var index = Number(e.target.title);
        var newMaterial;

        switch(index){
            case 0:
                newMaterial = material;
                break;
            case 1:
                newMaterial = material1;
                break;
            case 2:
                newMaterial = material2;
                break;
            case 3:
                newMaterial = material3;
                break;
            case 4:
                newMaterial = material4;
                break;
            default:
                break;

        }

        if(INTERSECTED){


            scene.remove(sphere);
            // INTERSECTED.geometry = newGeometry
            INTERSECTED.material = newMaterial;
            INTERSECTED = null;
            storeMaterial = null;
            sphere = null;
        }
    })

    $('.setting-button').on('click',function(e){


        if(INTERSECTED2) {

            var material = INTERSECTED2.material;
            //0,1,2,3
            switch($(this).index()){
                case 0 :
                    material.shininess += 100;
                    break;
                case 1 :
                    material.shininess -= 100;
                    break;
                case 2 :
                    material.opacity += 0.1;
                    break;
                case 3 :
                    material.opacity -= 0.1;
                    break;
            }

            console.log(material.opacity)


        }

        this.blur()

    })

    {
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


        var texture7 = THREE.ImageUtils.loadTexture( './assets/textures/ifc_slab.png' );
        var maxAnisotropy = renderer.getMaxAnisotropy();
        texture7.anisotropy = maxAnisotropy;
        texture7.wrapS = texture7.wrapT = THREE.RepeatWrapping;
        texture7.repeat.set( 0.1, 0.1 );
        var material7 = new THREE.MeshPhongMaterial( { color: 0xffffff, map: texture7,side: THREE.DoubleSide, shininess:5000,opacity:1,transparent:true});


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
    }

    
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
                myOpacity = 0.9;
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
                myOpacity = 0.7;
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
            case "IfcWallStandardCase"://ok
                if(geom.faces[0])
                {
                    for(var i=0; i<geom.faces.length; ++i)
                    {
                        var normal = geom.faces[i].normal;
                        normal.normalize();
                        var directU,directV;
                        if(String(normal.x) === '1' || String(normal.x) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(0,0,1);
                        }
                        else if(String(normal.z) === '1' || String(normal.z) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(1,0,0);
                        }
                        else
                        {
                            directU = new THREE.Vector3(1,0,0);
                            directV = new THREE.Vector3(0,0,1);
                        }

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
                if(isOutside)
                {
                    mesh = new THREE.Mesh(geom, material3_1);
                }
                else
                {
                    mesh = new THREE.Mesh(geom, material3_2);
                }
                break;
            case "IfcSlab"://ok
                if(geom.faces[0]){

                    for(var i=0; i<geom.faces.length; ++i)
                    {
                        var normal = geom.faces[i].normal;
                        normal.normalize();
                        var directU,directV;
                        if(String(normal.x) === '1' || String(normal.x) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(0,0,1);
                        }
                        else if(String(normal.z) === '1' || String(normal.z) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(1,0,0);
                        }
                        else
                        {
                            directU = new THREE.Vector3(1,0,0);
                            directV = new THREE.Vector3(0,0,1);
                        }

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
                // mesh = new THREE.Mesh(geom, material7);
                mesh = new THREE.Mesh(geom, material0);
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
                    for(var i=0; i<geom.faces.length; ++i)
                    {
                        var normal = geom.faces[i].normal;
                        normal.normalize();
                        var directU,directV;
                        if(String(normal.x) === '1' || String(normal.x) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(0,0,1);
                        }
                        else if(String(normal.z) === '1' || String(normal.z) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(1,0,0);
                        }
                        else
                        {
                            directU = new THREE.Vector3(1,0,0);
                            directV = new THREE.Vector3(0,0,1);
                        }

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
                if(isOutside)
                {
                    mesh = new THREE.Mesh(geom, material3_1);
                }
                else
                {
                    mesh = new THREE.Mesh(geom, material3_2);
                }
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


                    for(var i=0; i<geom.faces.length; ++i){
                        var normal = geom.faces[i].normal;
                        normal.normalize();
                        var directU,directV;
                        if(String(normal.x) === '1' || String(normal.x) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(0,0,1);
                        }
                        else if(String(normal.z) === '1' || String(normal.z) === '-1')
                        {
                            directU = new THREE.Vector3(0,1,0);
                            directV = new THREE.Vector3(1,0,0);
                        }
                        else
                        {
                            directU = new THREE.Vector3(1,0,0);
                            directV = new THREE.Vector3(0,0,1);
                        }

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

    //按钮的点击事件提交 摄像机位置
    $("#exitSaveCam").click(function () {
        //注册按钮的事件，用ajax提交表单
        $.post("/postCamDate", {
            "cameraX" : camera.position.x,
            "cameraY" : camera.position.y,
            "cameraZ" : camera.position.z,
            "cameraTargetX" : camControls.target.x,
            "cameraTargetY" : camControls.target.y,
            "cameraTargetZ" : camControls.target.z
        },function(err,data){
            if(data == "ok"|| "已存在"){
                console.log("恭喜，已写入数据库！");
            }else{
                console.log(data);
                console.log("错误！");
            }
        });

    });

    //按钮的点击事件读取并设置 摄像机位置
    $("#setSaveCam").click(function () {
        //注册按钮的事件，用ajax提交表单
        $.get("/doGetCamDate",function(result){
            console.log(Number(result.cameraX),(result.cameraX));
            camera.position.set(Number(result.cameraX),Number(result.cameraY),Number(result.cameraZ));
            camControls.target.set(Number(result.cameraTargetX),Number(result.cameraTargetY),Number(result.cameraTargetZ));
        });
    });

//按钮的点击事件 退出登录
    $("#logout").click(function () {
        //注册按钮的事件，用ajax提交表单
        $.get("/doLogout",function(){
            window.location = "/";}
        );
    });

    $("#save1").click(function () {
        //注册按钮的事件，用ajax提交表单
        for(var i =0; i<polyhedrons.length; i++){
            //保存构件信息
            $.post("/postComponentInf", {
                "ObjectName" : polyhedrons[i].name,

                "translateX" : polyhedrons[i].position.x,
                "translateY" : polyhedrons[i].position.y,
                "translateZ" : polyhedrons[i].position.z,

                "rotateX" : polyhedrons[i].rotation.x,
                "rotateY" : polyhedrons[i].rotation.y,
                "rotateZ" : polyhedrons[i].rotation.z,

                "scaleX" : polyhedrons[i].scale.x,
                "scaleY" : polyhedrons[i].scale.y,
                "scaleZ" : polyhedrons[i].scale.z


            },function(err,data){
                if(data == "ok"|| "已存在"){
                    //       console.log("恭喜，已写入数据库！");
                }else{
                    console.log(data);
                    console.log("错误！");
                }
            });
        }
    });

    $("#exitSaveEdit").click(function () {
        //注册按钮的事件，用ajax提交表单
        for(var i =0; i<operationList.length; i++){
            //保存构件信息
            $.post("/postUpdateComponentInf", {
                "ObjectName" : operationList[i].operationObject.name,

                "translateX" : operationList[i].itemPosition.x,
                "translateY" : operationList[i].itemPosition.y,
                "translateZ" : operationList[i].itemPosition.z,

                "rotateX" : operationList[i].itemRotation.x,
                "rotateY" : operationList[i].itemRotation.y,
                "rotateZ" : operationList[i].itemRotation.z,

                "scaleX" : operationList[i].itemScale.x,
                "scaleY" : operationList[i].itemScale.y,
                "scaleZ" : operationList[i].itemScale.z


            },function(err,data){
                if(data == "ok"|| "已存在"){
                    //       console.log("恭喜，已写入数据库！");
                }else{
                    console.log(data);
                    console.log("错误！");
                }
            });
        }
        //    console.log(vsgData)
    });
    var VsgDataKey = [];
    function VsgDataKeyArr(){

        for(var key in vsgData){
            VsgDataKey.push(key)
        }
        return VsgDataKey;
    }

    $("#save3333").click(function () {
        //提交VsgData数据
        VsgDataKeyArr();
        console.log(VsgDataKey,VsgDataKey.length);
        for(var i=5000; i<VsgDataKey.length;i++){
            //保存构件信息
            $.post("/postVSG", {
                "key" : VsgDataKey[i],
                "i" : i
            },function(err,data){
                console.log(i);
                if(data == "ok"|| "已存在"){
                    //       console.log("恭喜，已写入数据库！");
                }else{
                    console.log(data);
                    console.log("错误！");
                }
            });
        }
    });


//存vsg
    $("#save4").click(function () {
        //注册按钮的事件，用ajax提交表单
        VsgDataKeyArr();
        console.log(VsgDataKey,VsgDataKey.length);

        $.post("/postVSG", {
            "vsgInf" : vsgData,
            'vsgName' : currentBlockName+"_0"

        },function(err,data){
            console.log(vsgData);
            if(data == "ok"|| "已存在"){
                //       console.log("恭喜，已写入数据库！");
            }else{
                console.log(data);
                console.log("错误！");
            }
        });

    });

//http查询vsg信息
    $("#save3").click(function () {
        var x=1;y=7;z=8;
        $.get(
            "/getVSG",
            {"vsgInf": "vsgInf["+x+'-'+y+'-'+z+"][]"},
            function(data){
                console.log(data);
                //若有多项则返回data为数组
                //Array[2]
                //0:"2738838=IfcSite"
                //1:"2889262=IfcBuildingElementProxy"
                //length:2

                //否则返回为字符串data = "2738838=IfcSite"
            }
        );
        //  }
    });


    //切换摄像机模式的按钮功能
    $("#ChangeCamera").click(function () {
        cameraType *= -1;
        if(cameraType==1)
        {
            camControls.object = null;
            camControls = new THREE.OrbitControls(camera,renderer.domElement);
            camControls.target.set( 0, 0, 0 );

            camControls.rotateSpeed = 1.0;
            if(Number(document.getElementById('mouseNull').innerHTML)==0){
                camControls.zoomSpeed = 1.2;
                camControls.panSpeed = 0.8;
                document.getElementById('mouseNull').innerHTML = "1";
            }else if(Number(document.getElementById('mouseNull').innerHTML)==1){
                document.getElementById('mouseNull').innerHTML = "0";
                return false;
            }
            camControls.maxDistance = 300;

            camControls.keys = [ 65, 83, 68 ];
        }
        else
        {
            camControls.object = null;
            camControls.dispose();
            camControls = new THREE.MyFPC(camera,renderer.domElement);
            camControls.lookSpeed = 0.8;
            camControls.movementSpeed = 5 * 1.5;
            camControls.noFly = true;
            camControls.lookVertical = true;
            camControls.constrainVertical = true;
            camControls.verticalMin = 1.0;
            camControls.verticalMax = 2.0;
        }
    })


    $("#cancel").click(function(){
        $("#triggerUI").removeClass("in")
        setTimeout(function(){
            $("#triggerUI").css("display","none");
        },10)
        $("body,html").css({"overflow":"auto"})

        isOnload = false;
        camControls.targetObject.position.set(backPosition.x,backPosition.y,backPosition.z);
        // camControls.object.position.set(backPosition.x,backPosition.y,backPosition.z);
    })
    $("#triggerJump").click(function(){
        $("#triggerUI").removeClass("in")
        setTimeout(function(){
            $("#triggerUI").css("display","none");
        },10)
        $("body,html").css({"overflow":"auto"})

        $('.controller').children("button").css("backgroundColor","#ffffff");
        $('.controller').children("button").css("color","#000000");

        //var showText = document.getElementById(triggerKey);
        //showText.style.backgroundColor = "#00baff";
        //showText.style.color = "white";

        preBlockName = currentBlockName;
        destroyGroup();
        currentBlockName = triggerKey;
        startDownloadNewBlock(currentBlockName);
        camControls.targetObject.position.set(jumpPosition.x,jumpPosition.y,jumpPosition.z);
    })


    var f1= 0,f2= 0,f3= 0,f4=0;
    var q1= 0,q2=-Math.PI/2,q3=0,q4=0;var xx=1;
    var isCamRotate = false;
    function rotat1(){
        camControls.object.position.y=140;

        if(f1==1){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            q1=q1+Math.PI/720;
            camControls.object.position.x=-25+50*Math.sin(q1);
            camControls.object.position.z=-122+50*Math.cos(q1);
            camControls.object.lookAt(new THREE.Vector3(-25,50,-122));

        }
        else if(f1==0){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            camControls.object.position.x=-25+50*Math.sin(q1);
            camControls.object.position.z=-122+50*Math.cos(q1);

        }


        if(isCamRotate)
        {
            requestAnimationFrame(rotat1);
        }

        renderer.render(scene, camera);
    }

    function rotat2(){
        camControls.object.position.y=140;

        if(f2==1){
            //camControls.targetObject.rotation.x=q2;
            //camControls.object.rotation.x=q2;
            q2=q2-Math.PI/720;

            camControls.object.position.x=-95+60*Math.sin(q2);
            camControls.object.position.z=-74+60*Math.cos(q2);


            camControls.object.lookAt(new THREE.Vector3(-95,50,-74));

        }
        else if(f2==0){
            //camControls.object.lookAt(new THREE.Vector3(-95, 50, -74));
            camControls.object.position.x=-95+60*Math.sin(q2);
            camControls.object.position.z=-74+60*Math.cos(q2);

        }

        if(isCamRotate)
        {
            requestAnimationFrame(rotat2);
        }

        renderer.render(scene, camera);
    }

    function rotat3(){
        camControls.object.position.y=140;
        if(f3==1){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            q3=q3+Math.PI/720;
            camControls.object.position.x=-64+50*Math.sin(q3);
            camControls.object.position.z=6+50*Math.cos(q3);
            camControls.object.lookAt(new THREE.Vector3(-64,50,6));

        }
        else if(f3==0){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            camControls.object.position.x=-64+50*Math.sin(q3);
            camControls.object.position.z=6+50*Math.cos(q3);

        }

        if(isCamRotate)
        {
            requestAnimationFrame(rotat3);
        }

        renderer.render(scene, camera);
    }

    function rotat4(){
        camControls.object.position.y=140;

        if(f4==1){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            q4=q4+Math.PI/720;
            camControls.object.position.x=-1+50*Math.sin(q4);
            camControls.object.position.z=50*Math.cos(q4);
            camControls.object.lookAt(new THREE.Vector3(-1,50,0));

        }
        else if(f4==0){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            camControls.object.position.x=-1+50*Math.sin(q4);
            camControls.object.position.z=50*Math.cos(q4);

        }

        if(isCamRotate)
        {
            requestAnimationFrame(rotat4);
        }

        renderer.render(scene, camera);
    }

    var x=0;
    waimanyou();
    function waimanyou(){

        document.getElementById("play").onclick=function (){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            //document.getElementById('waitiif').innerHTML==''
            isRend=0;
            if(xx%2!=0&&(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext')){
                f1=1;f2=f3=f4=0;
                isCamRotate = true;
                rotat1();xx+=1;
            }
            if(xx%2!=0&&document.getElementById('waitiif').innerHTML=='B-ext'){
                f2=1;f1=f3=f4=0;
                isCamRotate = true;
                //camControls.object.rotation.x=Math.PI/4;
                rotat2();xx+=1;
            }
            else if(xx%2!=0&&document.getElementById('waitiif').innerHTML=='C-ext'){
                f3=1;f2=f1=f4=0;
                isCamRotate = true;
                rotat3();xx+=1;
            }
            else if(xx%2!=0&&document.getElementById('waitiif').innerHTML=='D-ext'){
                f4=1;f2=f3=f1=0;
                isCamRotate = true;
                rotat4();xx+=1;
            }
            console.log(x);
        }

        document.getElementById("stop").onclick=function (){
            //camControls.object.lookAt(new THREE.Vector3(-48, 50, -59));
            isRend=1;
            if(xx%2==0&&(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext')){
                f1=0;
                isCamRotate = false;
                rotat1();xx+=1;
            }
            else if(xx%2==0&&document.getElementById('waitiif').innerHTML=='B-ext'){
                f2=0;
                isCamRotate = false;
                rotat2();xx+=1;
            }
            else if(xx%2==0&&document.getElementById('waitiif').innerHTML=='C-ext'){
                f3=0;
                isCamRotate = false;
                rotat3();xx+=1;
            }
            else if(xx%2==0&&document.getElementById('waitiif').innerHTML=='D-ext'){
                f4=0;
                isCamRotate = false;
                rotat4();xx+=1;
            }
        }
    }

});