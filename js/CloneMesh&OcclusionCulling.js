/**
 * Created by sse316 on 8/25/2017.
 */

/**
 * Created by huyonghao on 2017/6/12.
 */

/**
 * Created by sse316 on 5/2/2017.
 * Buffer 渲染以及Clone的测试，其他功能都不要
 */

/**
 * Created by sse316 on 4/28/2017.
 * FOI的初始加载测试
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

var consoleLBBsNameList;
var consoleRestNameList;

$(function(){
    var scene;
    var camera,camControls;
    var lbbs;
    var clock = new THREE.Clock();
    var lables;

    var renderer;
    var stats = initStats();
    clock.start();
    var workerLoadMergedFile=new Worker("js/loadMergedFile_New.js");
    var workerLoadVsg = new Worker("js/loadBlockVsg.js");

    var windowWidth = window.innerWidth;
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
        for(var i=0;i<=19;i++)
        {
            workerLoadMergedFile.postMessage(currentBlockName+"_"+i);
        }
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

        lbbs = new LBBs(camera,scene);//进行遮挡剔除的类

        initSkyBox();



        var axes = new THREE.AxisHelper( 30 );
        // scene.add(axes);

        var ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);

        var directionalLight_1 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_1.position.set(0.3,0.4,0.5)
        scene.add(directionalLight_1);

        var directionalLight_2 = new THREE.DirectionalLight(0xffffff,0.2);

        directionalLight_2.position.set(-0.3,-0.4,0.5)
        scene.add(directionalLight_2);


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
        };
        var gui = new dat.GUI();
        gui.domElement.id = 'gui';
        gui.add(lables,'cameraX').listen();
        gui.add(lables,'cameraY').listen();
        gui.add(lables,'cameraZ').listen();

    }

    initGUI();
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
    var polyhedronGeoMap = {};//用于存放加载好的原始模型Geo的Map，重用的模型可以直接根据名字来重用
    var polyhedronMap = {};//用于存放加载好的原始模型的Map，重用的模型可以直接根据名字来重用
    var reuseModelCount = 0; //用于记录重用模型的数量
    var fileLength = 0;
    var unDisplayModelArr = []; //用于存放移动之后的模型构件名称，当进行绘制时，会根据名称进行判断，在数组中的模型不会进行下载

    $("#WebGL-output").append(renderer.domElement);


    var isOnload = false; //判断是否在加载，如果在加载，render停掉

    var cashVoxelSize;
    var cashSceneBBoxMinX;
    var cashSceneBBoxMinY;
    var cashSceneBBoxMinZ;
    var cashtriggerAreaMap;
    var cashWallArr;
    var isJumpArea = false;
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
            vsgArr.push(key+".dat");
        }
        console.log("vsgArr length is:"+vsgArr.length);
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
                if(Data.data_type!=100) //100是优先级最高的物体
                {
                    DrawModel(Data.data_type);

                    packageTag++;
                    if(packageTag>19){
                        //加载完成
                        isOnload = false;
                        console.log("reuse model number: " + reuseModelCount);
                        $("#progress").removeClass("in")
                        setTimeout(function(){
                            $("#progress").css("display","none");

                        },20)
                        $("body,html").css({"overflow":"auto"})
                        /**
                         * 2017-4-4注释，防止编译出错
                         */
                        // if(!isTranslateGroup)
                        // {
                        //     isTranslateGroup = true;
                        //     TranslateGroup();
                        //     console.log("调用 TranslateGroup() 在loadvsg中的isFirstLoad");
                        // }

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

            if(Data.type==100)
            {
                drawModelByFileName(Data.nam);
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

    function DrawModel_preVersion(tag)
    {
        var tempName = drawDataMap[tag][0];
        if(tempName)
        {
            var typeIndex = tempName.indexOf("=");
            var packageType = tempName.slice(typeIndex+1);
            console.log(packageType);
            for(var i=0; i<drawDataMap[tag].length; i++)
            {
                var tempFileName = drawDataMap[tag][i];

                if(tempFileName!=null && unDisplayModelArr.indexOf(tempFileName)==-1)
                {
                    if (modelDataNewN[tempFileName]) {
                        // if (false) {
                        reuseModelCount++;
                        var newName = modelDataNewN[tempFileName];
                        var matrix = modelDataM[tempFileName];
//                            处理V矩阵，变形
                        if(modelDataV[newName])
                        {

                            var newPolyhedron = polyhedronMap[newName].clone();
                            newPolyhedron.matrixWorldNeedsUpdate = true;
                            newPolyhedron.applyMatrix(m);
                            // newPolyhedron.scale.set(0.001,0.001,0.001);
                            scene.add(newPolyhedron);
                            lbbs.add(newPolyhedron);
                            polyhedrons.push(newPolyhedron);
                        }
                        else
                        {
                            console.log("找不到modelDataV中对应的newName: "+newName);
                        }
                    }
                    else if(modelDataV[tempFileName] && !modelDataNewN[tempFileName]){
                        for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++) {
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
                            geometry.computeBoundingSphere();
                            var polyhedron = createMesh(geometry, currentBlockName, packageType, tag);
                            // polyhedron.scale.set(0.001,0.001,0.001);
                            scene.add(polyhedron);
                            polyhedrons.push(polyhedron);
                            lbbs.add(polyhedron);
                            polyhedronMap[tempFileName] = polyhedron;
                            polyhedronGeoMap[tempFileName] = geometry;

                        }
                    }
                    else {
                        console.log(tag+"找不到模型啦！");
                    }
                }
            }

            for(var key in polyhedronGeoMap)
            {
                polyhedronGeoMap[key].dispose();
                polyhedronGeoMap[key] = null;
            }
            polyhedronGeoMap = {};

        }


    }

    function DrawModel(tag)
    {
        var tempName = drawDataMap[tag][0];
        if(tempName)
        {
            var typeIndex = tempName.indexOf("=");
            var packageType = tempName.slice(typeIndex+1);
            console.log(packageType);
            // if(packageType!="IfcPlate")
            if(true)
            {
                for(var i=0; i<drawDataMap[tag].length; i++)
                {
                    var tempFileName = drawDataMap[tag][i];

                    if(tempFileName!=null && unDisplayModelArr.indexOf(tempFileName)==-1)
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
                                modelGeo.computeBoundingSphere();
                                var typePos = tempFileName.indexOf("=");
                                var typeName = tempFileName.substring(typePos+1);
                                if(typeName=="IfcPlate") modelGeo = transaGeoToBox(modelGeo);
                                var polyhedron = createMesh(modelGeo, currentBlockName,typeName,tempFileName);
                                polyhedron.position.set(centerPos.x,centerPos.y,centerPos.z);

                                // WorldAABBIndexXYZ(polyhedron,ueseObb);
                                // AllPolyhedrons.push(polyhedron);
                                polyhedron.updateMatrixWorld();
                                lbbs.add(polyhedron);
                                scene.add(polyhedron);
                                polyhedrons.push(polyhedron);

                            }
                        }
                        else if(modelDataV[tempFileName] && !modelDataNewN[tempFileName]){

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

                            for(var dataCount=0;dataCount<modelDataV[tempFileName].length;dataCount++) {
                                var newDataV = getNewDataVByCnterPosAndVertexArr(centerPos,vMetrixArr[dataCount]);

                                var vMetrix = [];
                                var tMetrix = [];
                                //处理V矩阵，变形
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
                                    var norRow = new THREE.Vector3(newF1, newF2, newF3);
                                    var groupF = new THREE.Face3(newT1, newT2, newT3);
                                    groupF.normal = norRow;
                                    tMetrix.push(groupF);
                                }

                                //绘制
                                var geometry = new THREE.Geometry();
                                geometry.vertices = vMetrix;
                                geometry.faces = tMetrix;
                                modelGeo.merge(geometry);

                            }

                            modelGeo.computeBoundingSphere();
                            if(packageType=="IfcPlate") modelGeo = transaGeoToBox(modelGeo);
                            var polyhedron = createMesh(modelGeo, currentBlockName, packageType, tempFileName);
                            // polyhedron.scale.set(0.001,0.001,0.001);
                            polyhedron.position.set(centerPos.x,centerPos.y,centerPos.z);
                            scene.add(polyhedron);
                            polyhedrons.push(polyhedron);
                            polyhedron.updateMatrixWorld();
                            lbbs.add(polyhedron);
                            polyhedronMap[tempFileName] = polyhedron;
                            polyhedronGeoMap[tempFileName] = geometry;

                        }
                        else {
                            console.log(tag+"找不到模型啦！");
                        }
                    }
                }

                for(var key in polyhedronGeoMap)
                {
                    polyhedronGeoMap[key].dispose();
                    polyhedronGeoMap[key] = null;
                }
                polyhedronGeoMap = {};
            }
            else
            {
                var IfcPlateGeometry = new THREE.Geometry();
                //合并部分模型
                for(var i=0; i<drawDataMap[tag].length; i++)
                {
                    var tempFileName = drawDataMap[tag][i];
                    if(tempFileName!=null && unDisplayModelArr.indexOf(tempFileName)==-1) {
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
                                    geometry = transaGeoToBox(geometry);
                                    IfcPlateGeometry.merge(geometry);
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
                                geometry = transaGeoToBox(geometry);
                                IfcPlateGeometry.merge(geometry);
                            }
                        }
                        else {
                            console.log(tag+"找不到模型啦！");
                        }
                    }
                }
                var polyhedron = createMesh(IfcPlateGeometry,currentBlockName,"IfcPlate",tag);
                scene.add(polyhedron);
                // lbbs.add(polyhedron);
                polyhedrons.push(polyhedron);
            }
        }
    }

    var visibleArr = [];
    
    function consoleList () {
        for(var i = 0; i<lbbs.visible.length; i++)
        {
            console.log(lbbs.visible[i].object.name);
            visibleArr.push(lbbs.visible[i].object.name);
        }

    }
    
    function consoleRemainList() {
        for(var i = 0; i<vsgArr.length; i++)
        {
            if(visibleArr.indexOf(vsgArr[i])==-1)
            {
                console.log(vsgArr[i]);
            }
        }
    }
    
    

    consoleLBBsNameList = consoleList;
    consoleRestNameList = consoleRemainList;

    document.onkeydown = function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && e.keyCode==13)
        {
            calculateZIndex();
        }
    }

    /**
     * 模型的深度计算
     * 通过计算模型的中心点到摄像机平面的投影点的z轴的大小来得到视锥中的物体
     * 当投影点的z轴大小在[0,1]区间时，则模型在视锥中，且，越远，z越大
     * 最后把所有视锥中的点存放起来，用map存，key为模型名称，value为距离(0,1)之间
     */
    function calculateZIndex() {
        var cameraMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
        var shouldLoadModelMap = {};
        for(var objCounter=0; objCounter<polyhedrons.length; objCounter++)
        {
            var centerPoint = getCenterPositionByVertexArr(polyhedrons[objCounter].geometry.vertices);
            centerPoint.applyMatrix4(cameraMatrix);//project to viewport space
            if(centerPoint.z<1 && centerPoint.z>0)
            {
                shouldLoadModelMap[polyhedrons[objCounter].name] = centerPoint.z;
            }
            else {
                scene.remove(polyhedrons[objCounter]);
            }

        }
        console.log("Should load model arr is: " + shouldLoadModelMap);
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
        document.getElementById('waitiif').innerHTML=btnClickedId;
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
                        var newObj = drawModelByFileName(voxelizationFileArr[i]);
                        // var newObj = drawModelByFileName(voxelizationFileArr[i]);
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


    var triggerKey;


    function render() {

        stats.update();

        lbbs.update();

        var delta = clock.getDelta();


        camControls.update(delta);

        requestAnimationFrame(render);

        lables.cameraX = camera.position.x;
        lables.cameraY = camera.position.y;
        lables.cameraZ = camera.position.z;


        /**
         * 修改HTML上的文字
         */


        if(cameraType==-1 && currentControlType!=2)
        {
            rayCollision();

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
        renderer.render(scene, camera);

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
        camControls.targetObject.matrixWorldNeedsUpdate = true;
        forVec = camControls.object.localToWorld(forVec);
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

    {
        /************************************************************************
         * 贴图功能
         */
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

    function createMesh(geom,block,nam,fullname) {



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

        // mesh.name = block+"_"+nam;
        mesh.name = fullname+".dat";

        return mesh;

    }

});

