/**
 * Created by zhengweixin on 16/7/24.
 */

$(function() {
    var mapScene;
    var mapRenderer;
    var mapCamera;
    var JiantouX,pointstartX;
    var JiantouZ,pointstartZ;
    var jiantou;var jiantous;
    var Jiantou;
    var width;
    var Jx;
    var Jz;
    var posZ,posX;
    var circle,yuan;
    var smallMap;
    var JW,JE,JS,JN;
    var A1,A2,A3,A4,A5,A6,A7,A8,B1,B2,B3,B4,B5,B6,B7,C1,C2,C3,C4,C5,C6,C7,D1,D2,D3,D4,L1,L2,L3,W;
    var  mapwidth=512,mapwidths=512,mapheight=512,mapheights=512;
    var a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,b7=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0,c7=0,d1=0,d2=0,d3= 0,d4=0,l1=0,l2=0,l3= 0,w=0;

    var SZ;

    var cp1,cp2;

    var fangkuaiA1Arr,fangkuaiA2Arr,fangkuaiA3Arr,fangkuaiA4Arr,fangkuaiA5Arr,fangkuaiA6Arr,fangkuaiA7Arr,fangkuaiA8Arr;
    var fangkuaiB1Arr,fangkuaiB2Arr,fangkuaiB3Arr,fangkuaiB4Arr,fangkuaiB5Arr,fangkuaiB6Arr,fangkuaiB7Arr;
    var fangkuaiC1Arr,fangkuaiC2Arr,fangkuaiC3Arr,fangkuaiC4Arr,fangkuaiC5Arr,fangkuaiC6Arr,fangkuaiC7Arr;
    var fangkuaiD1Arr,fangkuaiD2Arr,fangkuaiD3Arr,fangkuaiD4Arr;
    var fangkuaiL1Arr,fangkuaiL2Arr,fangkuaiL3Arr;
    var fangkuaiArr,list=[];
    var startposX,startposZ;
    var startJ,startI,endJ,endI;
    var isMove=false;
    if(window.innerWidth*0.2<=window.innerHeight*0.3){
        width=window.innerWidth*0.2;

        Jx = Number(document.getElementById('targetPosX').innerHTML) ;
        Jz = Number(document.getElementById('targetPosZ').innerHTML);
    }else if(window.innerWidth*0.2>window.innerHeight*0.3){
        width=window.innerHeight*0.3;

        Jx = Number(document.getElementById('targetPosX').innerHTML) ;
        Jz = Number(document.getElementById('targetPosZ').innerHTML) ;
    }

    function initScene(){
        mapScene = new THREE.Scene();

        mapRenderer = new THREE.WebGLRenderer({antialias: true});
        mapRenderer.setClearColor(0xFFFFFF);
        mapRenderer.setSize(width,width);

        mapCamera = new THREE.OrthographicCamera(-width/2, width/2, width/2, -width/2, 0.01, 2000);
        mapCamera.position.set(-86/133.5*512,100,165/164*512);
        mapCamera.lookAt(new THREE.Vector3(mapCamera.position.x, 10, mapCamera.position.z));
        mapCamera.rotation.set(mapCamera.rotation.x, mapCamera.rotation.y, mapCamera.rotation.z - Math.PI / 2);

        var ambientLight = new THREE.AmbientLight(0xFFFFFF);
        mapScene.add(ambientLight);
        var axes = new THREE.AxisHelper( 30 );
        mapScene.add(axes);

        //jiantous = new THREE.Shape();
        //jiantous.moveTo(-1, 0);
        //jiantous.lineTo(1, 0);
        //jiantous.lineTo(1, 1);
        //jiantous.lineTo(1.5,1);
        //jiantous.lineTo(0,2);
        //jiantous.lineTo(-1.5,1);
        //jiantous.lineTo(-1, 1);
        //jiantous.lineTo(-1,0);
        //var geo = new THREE.ShapeGeometry(jiantous);
        //JW = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x00ff00,transparent:true,opacity:0.5}));
        //JW.material.side = THREE.DoubleSide;
        //JW.rotation.x=-Math.PI/2;JW.scale.set(5,10,10);
        //
        //JE = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x00ff00,transparent:true,opacity:0.5}));
        //JE.material.side = THREE.DoubleSide;
        //JE.rotation.x=Math.PI/2;JE.scale.set(5,10,10);
        //
        //JN = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x00ff00,transparent:true,opacity:0.5}));
        //JN.material.side = THREE.DoubleSide;
        //JN.rotation.x=-Math.PI/2;JN.rotation.z=-Math.PI/2;JN.scale.set(5,10,10);
        //
        //JS = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x00ff00,transparent:true,opacity:0.5}));
        //JS.material.side = THREE.DoubleSide;
        //JS.rotation.x=Math.PI/2;JS.rotation.z=Math.PI/2;JS.scale.set(5,10,10);
        //
        //JW.position.set(20, 80, 20);
        //JS.position.set(JiantouX, 80, JiantouZ);
        //JE.position.set(JiantouX, 80, JiantouZ);
        //JN.position.set(JiantouX, 80, JiantouZ);
        //mapScene.add(JS);mapScene.add(JW);mapScene.add(JN);mapScene.add(JE);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/SZ.jpg');
        SZ = new THREE.Mesh(new THREE.PlaneGeometry(50,50), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        SZ.position.y = -10;
        SZ.position.x = 0;
        SZ.position.z = 0;
        SZ.rotation.set(-Math.PI / 2, 0,-Math.PI / 2);mapScene.add(SZ);

        circle=new THREE.Mesh(new THREE.CircleGeometry(width/2,50,Math.PI/3*4,Math.PI/3),new THREE.MeshBasicMaterial({color:0x00ff00,transparent:true,opacity:0.5}));
        circle.rotation.set(-Math.PI/2,0,0);
        circle.position.set(-86/133.5*512,80,165/164*512);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/qiu.png');
        yuan = new THREE.Mesh(new THREE.CircleGeometry(13,20,0,Math.PI*2), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //yuan=new THREE.Mesh(new THREE.CircleGeometry(5,20,0,Math.PI*2),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.5}));
        yuan.rotation.set(-Math.PI/2,0,0);
        yuan.position.set(-86/133.5*512,80,165/164*512);

        //�����ͼ
        var texture = new THREE.ImageUtils.loadTexture('assets/textures/planets/EarthNormal.png');
        smallMap = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        smallMap.position.y = -10;
        smallMap.position.x = 0;
        smallMap.position.z = 0;
        smallMap.rotation.set(-Math.PI / 2, 0,0);
        console.log(smallMap.material.type);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/waitis.png');
        W = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        W.rotation.set(-Math.PI / 2, 0, 0);


        var texture = new THREE.ImageUtils.loadTexture('assets/map/A1.png');
        A1 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A1.position.y = -10;
        //A1.position.x = -25.3/56.6*512;
        //A1.position.z = -122.6/37.4*512;
        A1.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A2.png');
        A2 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A2.position.y = -10;
        //A2.position.x = -25.3/56.6*512;
        //A2.position.z = -122.6/37.4*512;
        A2.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A3.png');
        A3 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A3.position.y = -10;
        //A3.position.x = -25.3/56.6*512;
        //A3.position.z = -122.6/37.4*512;
        A3.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A4.png');
        A4 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A4.position.y = -10;
        //A4.position.x = -25.3/56.6*512;
        //A4.position.z = -122.6/37.4*512;
        A4.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A5.png');
        A5 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A5.position.y = -10;
        //A5.position.x = -25.3/56.6*512;
        //A5.position.z = -122.6/37.4*512;
        A5.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A6.png');
        A6 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A6.position.y = -10;
        //A6.position.x = -25.3/56.6*512;
        //A6.position.z = -122.6/37.4*512;
        A6.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A7.png');
        A7 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A7.position.y = -10;
        //A7.position.x = -25.3/56.6*512;
        //A7.position.z = -122.6/37.4*512;
        A7.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/A8.png');
        A8 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //A8.position.y = -10;
        //A8.position.x = -25.3/56.6*512;
        //A8.position.z = -122.6/37.4*512;
        A8.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B1.png');
        B1 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B1.position.y = -10;
        //B1.position.x = -83.75/59.7*512;
        //B1.position.z = -82/73.5*512;
        B1.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B2.png');
        B2 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B2.position.y = -10;
        //B2.position.x = -83.75/59.7*512;
        //B2.position.z = -82/73.5*512;
        B2.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B3.png');
        B3 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B3.position.y = -10;
        //B3.position.x = -94.9/37.4*512;
        //B3.position.z = -74.8/59.4*512;
        B3.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B4.png');
        B4 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B4.position.y = -10;
        //B4.position.x = -94.9/37.4*512;
        //B4.position.z = -73.6/57*512;
        B4.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B5.png');
        B5 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B5.position.y = -10;
        //B5.position.x = -94.9/37.4*512;
        //B5.position.z = -73.6/57*512;
        B5.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B6.png');
        B6 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B6.position.y = -10;
        //B6.position.x = -94.9/37.4*512;
        //B6.position.z = -73.6/57*512;
        B6.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/B7.png');
        B7 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //B7.position.y = -10;
        //B7.position.x = -94.9/37.4*512;
        //B7.position.z = -73.6/57*512;
        B7.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C1.png');
        C1 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C1.position.y = -10;
        //C1.position.x = -72.25/64.8*512;
        //C1.position.z = 5.75/34.1*512;
        C1.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C2.png');
        C2 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C2.position.y = -10;
        //C2.position.x = -72.35/64.7*512;
        //C2.position.z = 5.13/34.6*512;
        C2.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C3.png');
        C3 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C3.position.y = -10;
        //C3.position.x = -72.35/64.7*512;
        //C3.position.z = 5.13/34.6*512;
        C3.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C4.png');
        C4 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C4.position.y = -10;
        //C4.position.x = -64.2/48.4*512;
        //C4.position.z = 5.13/34.6*512;
        C4.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C5.png');
        C5 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C5.position.y = -10;
        //C5.position.x = -64.2/48.4*512;
        //C5.position.z = 5.13/34.6*512;
        C5.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C6.png');
        C6 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C6.position.y = -10;
        //C6.position.x = -64.2/48.4*512;
        //C6.position.z = 5.13/34.6*512;
        C6.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C7.png');
        C7 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //C7.position.y = -10;
        //C7.position.x = -64.2/48.4*512;
        //C7.position.z = 5.13/34.6*512;
        C7.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/C7.png');
        cp1 = new THREE.Mesh(new THREE.CircleGeometry(7,50,0,Math.PI*2),new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.5}));
        cp1.rotation.set(-Math.PI/2,0,0);

        cp2 = new THREE.Mesh(new THREE.CircleGeometry(7,50,0,Math.PI*2),new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.5}));
        cp2.rotation.set(-Math.PI/2,0,0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/D1.png');
        D1 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //D1.position.y = -10;
        //D1.position.x = -4.2/31.8*512;
        //D1.position.z = 0;
        D1.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/D2.png');
        D2 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //D2.position.y = -10;
        //D2.position.x = -4.2/31.8*512;
        //D2.position.z = 0;
        D2.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/D3.png');
        D3 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //D3.position.y = -10;
        //D3.position.x = -4.2/31.8*512;
        //D3.position.z = 0;
        D3.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/D4.png');
        D4 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //D4.position.y = -10;
        //D4.position.x = -4.2/31.8*512;
        //D4.position.z = 0;
        D4.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/11.png');
        L1 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //L1.position.y = -10;
        //L1.position.x = -47.55/131.3*512;
        //L1.position.z = -58.85/163.7*512;
        L1.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/2.png');
        L2 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //L2.position.y = -10;
        //L2.position.x = -47.55/131.3*512;
        //L2.position.z = -58.85/163.7*512;
        L2.rotation.set(-Math.PI / 2, 0, 0);

        var texture = new THREE.ImageUtils.loadTexture('assets/map/3.png');
        L3 = new THREE.Mesh(new THREE.PlaneGeometry(512,512), new THREE.MeshLambertMaterial({
            side: THREE.doubleSided,
            map: texture
        }));
        //L3.position.y = -10;
        //L3.position.x = -47.55/131.3*512;
        //L3.position.z = -58.85/163.7*512;
        L3.rotation.set(-Math.PI / 2, 0, 0);

        //��ͷ
        jiantou = new THREE.Shape();
        jiantou.moveTo(-1, 0);
        jiantou.lineTo(1, 0);
        jiantou.lineTo(1, width/2-8);
        jiantou.lineTo(5,width/2-8);
        jiantou.lineTo(0,width/2);
        jiantou.lineTo(-5,width/2-8);
        jiantou.lineTo(-1, width/2-8);
        jiantou.lineTo(-1,0);
        var geo = new THREE.ShapeGeometry(jiantou);
        Jiantou = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0xff0000,transparent:true,opacity:0.5}));
        Jiantou.material.side = THREE.DoubleSide;
        Jiantou.rotation.x=-Math.PI/2;

        posX= Number(document.getElementById('cameraPosX').innerHTML) /131.3*512;
        JiantouX=posX;
        posZ= Number(document.getElementById('cameraPosZ').innerHTML) /163.7*512;
        JiantouZ=posZ;
        Jx = Number(document.getElementById('targetPosX').innerHTML);
        Jz = Number(document.getElementById('targetPosZ').innerHTML);
        Jiantou.position.set(JiantouX,80,JiantouZ);

        //var geo0=new THREE.MeshBasicMaterial({color:0x0000ff,transparent:true,opacity:0.5});
        //var geo1=new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,opacity:0.5});
        //var geo2=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.5});
        //for(var i=0;i<=15;i++){
        //    for(var j=0;j<=127;j++){
        //        if(j%3==0){
        //            var fangkuai=new THREE.Mesh(new THREE.CubeGeometry(4,0,4),geo0);
        //        }else if(j%3==1){
        //            var fangkuai=new THREE.Mesh(new THREE.CubeGeometry(4,0,4),geo1);
        //        }else if(j%3==2){
        //            var fangkuai=new THREE.Mesh(new THREE.CubeGeometry(4,0,4),geo2);
        //        }
        //        var fangkuai=new THREE.Mesh(new THREE.CubeGeometry(4,0,4),geo2);
        //        fangkuai.position.set(-47.55/131.3*512-254+j*4,0,-58.85/163.7*512-254+i*4);
        //        //fangkuai.name='i'+'j';
        //        mapScene.add(fangkuai);
        //    }
        //}
        mapScene.add(yuan);
        mapScene.add(Jiantou);
        mapScene.add(circle);

    }

    function mapRender() {
        if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext'){
            mapScene.remove(A1);
            mapScene.remove(A2);
            mapScene.remove(A3);
            mapScene.remove(A4);
            mapScene.remove(A5);
            mapScene.remove(A6);
            mapScene.remove(A7);
            mapScene.remove(A8);
            mapScene.remove(B1);
            mapScene.remove(B2);
            mapScene.remove(B3);
            mapScene.remove(B4);
            mapScene.remove(B5);
            mapScene.remove(B6);
            mapScene.remove(B7);
            mapScene.remove(C1);
            mapScene.remove(C2);
            mapScene.remove(C3);
            mapScene.remove(C4);
            mapScene.remove(C5);
            mapScene.remove(C6);
            mapScene.remove(C7);
            mapScene.remove(D1);
            mapScene.remove(D2);
            mapScene.remove(D3);
            mapScene.remove(D4);
            mapScene.remove(L1);
            mapScene.remove(L2);
            mapScene.remove(L3);
            W.position.y = -10;
            W.position.x = -47.54 / 132.15 * 512 * (1 + 0.2 * w);
            W.position.z = -59.17 / 164.2 * 512 * (1 + 0.2 * w);
            startposX = -47.54 / 132.15 * 512 * (1 + 0.2 * w);
            startposZ = -59.17 / 164.2 * 512 * (1 + 0.2 * w);
            mapScene.add(W);
            if (w == 4 || w == -4) {
                JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 132.15 * 512;
                JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 164.2 * 512;
                Jx = Number(document.getElementById('targetPosX').innerHTML) / 132.15 * 512;
                Jz = Number(document.getElementById('targetPosZ').innerHTML) / 164.2 * 512;
            } else {
                JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 132.15 * 512 * (1 + 0.2 * w);
                Jx = Number(document.getElementById('targetPosX').innerHTML) / 132.15 * 512 * (1 + 0.2 * w);
                JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 164.2 * 512 * (1 + 0.2 * w);
                Jz = Number(document.getElementById('targetPosZ').innerHTML) / 164.2 * 512 * (1 + 0.2 * w);
            }

        }
        else {

            if (Number(document.getElementById('cameraPosY').innerHTML) > 0 && Number(document.getElementById('cameraPosY').innerHTML) <= 66) {

                if (Number(document.getElementById('cameraPosZ').innerHTML) < -40 && Number(document.getElementById('cameraPosX').innerHTML) > -54) {
                    if (Number(document.getElementById('cameraPosY').innerHTML) > 0 && Number(document.getElementById('cameraPosY').innerHTML) < 5.5) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A1.position.y = -100;
                        A1.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a1);
                        A1.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a1);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a1);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a1);
                        fangkuaiArr = fangkuaiA1Arr;
                        mapScene.add(A1);
                        if (a1 == 4 || a1 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;

                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a1);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a1);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a1);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a1);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 5.5 && Number(document.getElementById('cameraPosY').innerHTML) < 9.9) {
                        mapScene.remove(W);
                        mapScene.remove(A1);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A2.position.y = -100;
                        A2.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a2);
                        A2.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a2);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a2);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a2);
                        fangkuaiArr = fangkuaiA2Arr;
                        mapScene.add(A2);
                        if (a2 == 4 || a2 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;

                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a2);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a2);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a2);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a2);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 9.9 && Number(document.getElementById('cameraPosY').innerHTML) < 14.3) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A1);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A3.position.y = -100;
                        A3.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a3);
                        A3.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a3);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a3);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a3);
                        fangkuaiArr = fangkuaiA3Arr;
                        mapScene.add(A3);
                        if (a3 == 4 || a3 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a3);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a3);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a3);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a3);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 14.3 && Number(document.getElementById('cameraPosY').innerHTML) < 45) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A1);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A4.position.y = -100;
                        A4.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a4);
                        A4.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a4);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a4);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a4);
                        fangkuaiArr = fangkuaiA4Arr;
                        mapScene.add(A4);
                        if (a4 == 4 || a4 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a4);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a4);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a4);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a4);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 45 && Number(document.getElementById('cameraPosY').innerHTML) < 49.5) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A1);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A5.position.y = -100;
                        A5.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a5);
                        A5.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a5);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a5);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a5);
                        fangkuaiArr = fangkuaiA5Arr;
                        mapScene.add(A5);
                        if (a5 == 4 || a5 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a5);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a5);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a5);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a5);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 49.5 && Number(document.getElementById('cameraPosY').innerHTML) < 53.9) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A1);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A6.position.y = -100;
                        A6.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a6);
                        A6.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a6);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a6);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a6);
                        fangkuaiArr = fangkuaiA6Arr;
                        mapScene.add(A6);
                        if (a6 == 4 || a6 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a6);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a6);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a6);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a6);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 53.9 && Number(document.getElementById('cameraPosY').innerHTML) < 58.3) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A1);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A7.position.y = -100;
                        A7.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a7);
                        A7.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a7);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a7);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a7);
                        fangkuaiArr = fangkuaiA7Arr;
                        mapScene.add(A7);
                        if (a7 == 4 || a7 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a7);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a7);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a7);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a7);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 58.3 && Number(document.getElementById('cameraPosY').innerHTML) <= 65) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A1);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        A8.position.y = -100;
                        A8.position.x = -25.3 / 56.6 * 512 * (1 + 0.2 * a8);
                        A8.position.z = -122.6 / 37.4 * 512 * (1 + 0.2 * a8);
                        startposX = -25.3 / 56.6 * 512 * (1 + 0.2 * a8);
                        startposZ = -122.6 / 37.4 * 512 * (1 + 0.2 * a8);
                        fangkuaiArr = fangkuaiA8Arr;
                        mapScene.add(A8);
                        if (a8 == 4 || a8 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a8);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 56.6 * 512 * (1 + 0.2 * a8);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a8);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 37.4 * 512 * (1 + 0.2 * a8);
                        }
                    }

                }


                else if (Number(document.getElementById('cameraPosZ').innerHTML) < -40 && Number(document.getElementById('cameraPosX').innerHTML) <= -54) {
                    if (Number(document.getElementById('cameraPosY').innerHTML) >= -0.1 && Number(document.getElementById('cameraPosY').innerHTML) < 5.5) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(A1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B1.position.y = -100;
                        B1.position.x = -83.75 / 59.7 * 512 * (1 + 0.2 * b1);
                        B1.position.z = -82 / 73.5 * 512 * (1 + 0.2 * b1);
                        startposX = -83.75 / 59.7 * 512 * (1 + 0.2 * b1);
                        startposZ = -82 / 73.5 * 512 * (1 + 0.2 * b1);
                        fangkuaiArr = fangkuaiB1Arr;
                        mapScene.add(B1);
                        if (b1 == 4 || b1 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 59.7 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 73.5 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 59.7 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 73.5 * 512;

                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 59.7 * 512 * (1 + 0.2 * b1);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 59.7 * 512 * (1 + 0.2 * b1);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 73.5 * 512 * (1 + 0.2 * b1);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 73.5 * 512 * (1 + 0.2 * b1);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 5.5 && Number(document.getElementById('cameraPosY').innerHTML) < 9.9) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(A1);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B2.position.y = -100;
                        B2.position.x = -83.75 / 59.7 * 512 * (1 + 0.2 * b2);
                        B2.position.z = -82 / 73.5 * 512 * (1 + 0.2 * b2);
                        startposX = -83.75 / 59.7 * 512 * (1 + 0.2 * b2);
                        startposZ = -82 / 73.5 * 512 * (1 + 0.2 * b2);
                        fangkuaiArr = fangkuaiB2Arr;
                        mapScene.add(B2);
                        if (b2 == 4 || b2 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 59.7 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 73.5 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 59.7 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 73.5 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 59.7 * 512 * (1 + 0.2 * b2);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 59.7 * 512 * (1 + 0.2 * b2);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 73.5 * 512 * (1 + 0.2 * b2);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 73.5 * 512 * (1 + 0.2 * b2);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 9.9 && Number(document.getElementById('cameraPosY').innerHTML) < 14.3) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(A1);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B3.position.y = -100;
                        B3.position.x = -94.9 / 37.4 * 512 * (1 + 0.2 * b3);
                        B3.position.z = -74.8 / 59.4 * 512 * (1 + 0.2 * b3);
                        startposX = -94.9 / 37.4 * 512 * (1 + 0.2 * b3);
                        startposZ = -74.8 / 59.4 * 512 * (1 + 0.2 * b3);
                        fangkuaiArr = fangkuaiB3Arr;
                        mapScene.add(B3);
                        if (b3 == 4 || b3 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 59.4 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 59.4 * 512;

                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b3);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b3);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 59.4 * 512 * (1 + 0.2 * b3);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 59.4 * 512 * (1 + 0.2 * b3);
                        }

                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 14.3 && Number(document.getElementById('cameraPosY').innerHTML) < 45) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(A1);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B4.position.y = -100;
                        B4.position.x = -94.9 / 37.4 * 512 * (1 + 0.2 * b4);
                        B4.position.z = -73.6 / 57 * 512 * (1 + 0.2 * b4);
                        startposX = -94.9 / 37.4 * 512 * (1 + 0.2 * b4);
                        startposZ = -73.6 / 57 * 512 * (1 + 0.2 * b4);
                        fangkuaiArr = fangkuaiB4Arr;
                        mapScene.add(B4);
                        if (b4 == 4 || b4 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b4);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b4);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b4);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b4);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 45 && Number(document.getElementById('cameraPosY').innerHTML) < 49.5) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(A1);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B5.position.y = -100;
                        B5.position.x = -94.9 / 37.4 * 512 * (1 + 0.2 * b5);
                        B5.position.z = -73.6 / 57 * 512 * (1 + 0.2 * b5);
                        startposX = -94.9 / 37.4 * 512 * (1 + 0.2 * b5);
                        startposZ = -73.6 / 57 * 512 * (1 + 0.2 * b5);
                        fangkuaiArr = fangkuaiB5Arr;
                        mapScene.add(B5);
                        if (b5 == 4 || b5 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b5);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b5);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b5);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b5);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 49.5 && Number(document.getElementById('cameraPosY').innerHTML) < 58.3) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(A1);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B6.position.y = -100;
                        B6.position.x = -94.9 / 37.4 * 512 * (1 + 0.2 * b6);
                        B6.position.z = -73.6 / 57 * 512 * (1 + 0.2 * b6);
                        startposX = -94.9 / 37.4 * 512 * (1 + 0.2 * b6);
                        startposZ = -73.6 / 57 * 512 * (1 + 0.2 * b6);
                        fangkuaiArr = fangkuaiB6Arr;
                        mapScene.add(B6);
                        if (b6 == 4 || b6 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b6);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b6);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b6);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b6);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 58.3 && Number(document.getElementById('cameraPosY').innerHTML) <= 65) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(A1);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        B7.position.y = -100;
                        B7.position.x = -94.9 / 37.4 * 512 * (1 + 0.2 * b7);
                        B7.position.z = -73.6 / 57 * 512 * (1 + 0.2 * b7);
                        startposX = -94.9 / 37.4 * 512 * (1 + 0.2 * b7);
                        startposZ = -73.6 / 57 * 512 * (1 + 0.2 * b7);
                        fangkuaiArr = fangkuaiB7Arr;
                        mapScene.add(B7);
                        if (b7 == 4 || b7 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b7);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 37.4 * 512 * (1 + 0.2 * b7);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b7);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 57 * 512 * (1 + 0.2 * b7);
                        }
                    }
                }


                else if (Number(document.getElementById('cameraPosZ').innerHTML) >= -40 && Number(document.getElementById('cameraPosX').innerHTML) <= -30) {
                    if (Number(document.getElementById('cameraPosY').innerHTML) >= 0.4 && Number(document.getElementById('cameraPosY').innerHTML) < 6) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(A1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C1.position.y = -100;
                        C1.position.x = -72.25 / 64.8 * 512 * (1 + 0.2 * c1);
                        C1.position.z = 5.75 / 34.1 * 512 * (1 + 0.2 * c1);
                        startposX = -72.25 / 64.8 * 512 * (1 + 0.2 * c1);
                        startposZ = 5.75 / 34.1 * 512 * (1 + 0.2 * c1);
                        fangkuaiArr = fangkuaiC1Arr;
                        mapScene.add(C1);
                        if (c1 == 4 || c1 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 64.8 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.1 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 64.8 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.1 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 64.8 * 512 * (1 + 0.2 * c1);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 64.8 * 512 * (1 + 0.2 * c1);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.1 * 512 * (1 + 0.2 * c1);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.1 * 512 * (1 + 0.2 * c1);
                        }

                        if(Math.abs(Number(document.getElementById('cameraPosX').innerHTML))<=111* 64.8 / 512 / (1 + 0.2 * c1)&&Math.abs(Number(document.getElementById('cameraPosX').innerHTML))<=41.5* 34.1 / 512 / (1 + 0.2 * c1)){
                            cp1.position.set(-71*  512 * (1 + 0.2 * c1)/64.8,2,1.5*512 * (1 + 0.2 * c1) /34.1);
                            mapScene.add(cp1);
                            //setTimeout(function(){mapScene.remove(cp1);},100);
                        }

                        if(Math.abs(Number(document.getElementById('cameraPosX').innerHTML))<=107* 64.8 / 512 / (1 + 0.2 * c1)&&Math.abs(Number(document.getElementById('cameraPosX').innerHTML))<=50* 34.1 / 512 / (1 + 0.2 * c1)){
                            cp2.position.set(-67/ 64.8 * 512 * (1 + 0.2 * c1),2,10/ 34.1 * 512 * (1 + 0.2 * c1));
                            mapScene.add(cp2);
                            //setTimeout(function(){mapScene.remove(cp2);},100);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 6 && Number(document.getElementById('cameraPosY').innerHTML) < 10.4) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(A1);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C2.position.y = -100;
                        C2.position.x = -72.35 / 64.7 * 512 * (1 + 0.2 * c2);
                        C2.position.z = 5.13 / 34.6 * 512 * (1 + 0.2 * c2);
                        startposX = -72.35 / 64.7 * 512 * (1 + 0.2 * c2);
                        startposZ = 5.13 / 34.6 * 512 * (1 + 0.2 * c2);
                        fangkuaiArr = fangkuaiC2Arr;
                        mapScene.add(C2);
                        if (c2 == 4 || c2 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 64.7 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 64.7 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 64.7 * 512 * (1 + 0.2 * c2);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 64.7 * 512 * (1 + 0.2 * c2);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c2);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c2);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 10.4 && Number(document.getElementById('cameraPosY').innerHTML) < 14.8) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(A1);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C3.position.y = -100;
                        C3.position.x = -72.35 / 64.7 * 512 * (1 + 0.2 * c3);
                        C3.position.z = 5.13 / 34.6 * 512 * (1 + 0.2 * c3);
                        startposX = -72.35 / 64.7 * 512 * (1 + 0.2 * c3);
                        startposZ = 5.13 / 34.6 * 512 * (1 + 0.2 * c3);
                        fangkuaiArr = fangkuaiC3Arr;
                        mapScene.add(C3);
                        if (c3 == 4 || c3 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 64.7 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 64.7 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 64.7 * 512 * (1 + 0.2 * c3);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 64.7 * 512 * (1 + 0.2 * c3);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c3);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c3);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 14.8 && Number(document.getElementById('cameraPosY').innerHTML) < 45.6) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(A1);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C4.position.y = -100;
                        C4.position.x = -64.2 / 48.4 * 512 * (1 + 0.2 * c4);
                        C4.position.z = 5.13 / 34.6 * 512 * (1 + 0.2 * c4);
                        startposX = -64.2 / 48.4 * 512 * (1 + 0.2 * c4);
                        startposZ = 5.13 / 34.6 * 512 * (1 + 0.2 * c4);
                        fangkuaiArr = fangkuaiC4Arr;
                        mapScene.add(C4);
                        if (c4 == 4 || c4 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c4);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c4);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c4);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c4);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 45.6 && Number(document.getElementById('cameraPosY').innerHTML) < 50) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(A1);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C5.position.y = -100;
                        C5.position.x = -64.2 / 48.4 * 512 * (1 + 0.2 * c5);
                        C5.position.z = 5.13 / 34.6 * 512 * (1 + 0.2 * c5);
                        startposX = -64.2 / 48.4 * 512 * (1 + 0.2 * c5);
                        startposZ = 5.13 / 34.6 * 512 * (1 + 0.2 * c5);
                        fangkuaiArr = fangkuaiC5Arr;
                        mapScene.add(C5);
                        if (c5 == 4 || c5 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c5);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c5);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c5);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c5);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 50 && Number(document.getElementById('cameraPosY').innerHTML) < 58.8) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(A1);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C6.position.y = -100;
                        C6.position.x = -64.2 / 48.4 * 512 * (1 + 0.2 * c6);
                        C6.position.z = 5.13 / 34.6 * 512 * (1 + 0.2 * c6);
                        startposX = -64.2 / 48.4 * 512 * (1 + 0.2 * c6);
                        startposZ = 5.13 / 34.6 * 512 * (1 + 0.2 * c6);
                        fangkuaiArr = fangkuaiC6Arr;
                        mapScene.add(C6);
                        if (c6 == 4 || c6 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512;

                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c6);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c6);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c6);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c6);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 58.8 && Number(document.getElementById('cameraPosY').innerHTML) <= 65) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        C7.position.y = -100;
                        C7.position.x = -64.2 / 48.4 * 512 * (1 + 0.2 * c7);
                        C7.position.z = 5.13 / 34.6 * 512 * (1 + 0.2 * c7);
                        startposX = -64.2 / 48.4 * 512 * (1 + 0.2 * c7);
                        startposZ = 5.13 / 34.6 * 512 * (1 + 0.2 * c7);
                        fangkuaiArr = fangkuaiC7Arr;
                        mapScene.add(C7);
                        if (c7 == 4 || c7 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c7);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 48.4 * 512 * (1 + 0.2 * c7);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c7);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 34.6 * 512 * (1 + 0.2 * c7);
                        }
                    }

                }


                else if (Number(document.getElementById('cameraPosZ').innerHTML) >= -40 && Number(document.getElementById('cameraPosX').innerHTML) > -30) {
                    if (Number(document.getElementById('cameraPosY').innerHTML) >= 0.4 && Number(document.getElementById('cameraPosY').innerHTML) < 6) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(A1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(D4);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        D1.position.y = -100;
                        D1.position.x = -4.2 / 31.8 * 512 * (1 + 0.2 * d1);
                        D1.position.z = 0;
                        startposX = -4.2 / 31.8 * 512 * (1 + 0.2 * d1);
                        startposZ = 0;
                        fangkuaiArr = fangkuaiD1Arr;
                        mapScene.add(D1);
                        if (d1 == 4 || d1 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512;

                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d1);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d1);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d1);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d1);
                        }
                    }
                    else if ((Number(document.getElementById('cameraPosY').innerHTML) >= 6 && Number(document.getElementById('cameraPosY').innerHTML) < 10.4) || (Number(document.getElementById('cameraPosY').innerHTML) >= 14.8 && Number(document.getElementById('cameraPosY').innerHTML) < 19.2) || (Number(document.getElementById('cameraPosY').innerHTML) >= 23.6 && Number(document.getElementById('cameraPosY').innerHTML) < 28) || (Number(document.getElementById('cameraPosY').innerHTML) >= 32.4 && Number(document.getElementById('cameraPosY').innerHTML) < 36.8)) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D4);
                        mapScene.remove(D3);
                        mapScene.remove(A1);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        D2.position.y = -100;
                        D2.position.x = -4.2 / 31.8 * 512 * (1 + 0.2 * d2);
                        D2.position.z = 0;
                        startposX = -4.2 / 31.8 * 512 * (1 + 0.2 * d2);
                        startposZ = 0;
                        fangkuaiArr = fangkuaiD2Arr;
                        mapScene.add(D2);
                        if (d2 == 4 || d2 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d2);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d2);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d2);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d2);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 10.4 && Number(document.getElementById('cameraPosY').innerHTML) < 14.8 || (Number(document.getElementById('cameraPosY').innerHTML) >= 19.2 && Number(document.getElementById('cameraPosY').innerHTML) < 23.6) || (Number(document.getElementById('cameraPosY').innerHTML) >= 28 && Number(document.getElementById('cameraPosY').innerHTML) < 32.4) || (Number(document.getElementById('cameraPosY').innerHTML) >= 36.8 && Number(document.getElementById('cameraPosY').innerHTML) < 41.3)) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D4);
                        mapScene.remove(A1);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        D3.position.y = -100;
                        D3.position.x = -4.2 / 31.8 * 512 * (1 + 0.2 * d3);
                        D3.position.z = 0;
                        startposX = -4.2 / 31.8 * 512 * (1 + 0.2 * d3);
                        startposZ = 0;
                        fangkuaiArr = fangkuaiD3Arr;
                        mapScene.add(D3);
                        if (d3 == 4 || d3 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d3);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d3);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d3);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d3);
                        }
                    }
                    else if (Number(document.getElementById('cameraPosY').innerHTML) >= 41.3 && Number(document.getElementById('cameraPosY').innerHTML) <= 46) {
                        mapScene.remove(W);
                        mapScene.remove(A2);
                        mapScene.remove(A3);
                        mapScene.remove(A4);
                        mapScene.remove(A5);
                        mapScene.remove(A6);
                        mapScene.remove(A7);
                        mapScene.remove(A8);
                        mapScene.remove(B1);
                        mapScene.remove(B2);
                        mapScene.remove(B3);
                        mapScene.remove(B4);
                        mapScene.remove(B5);
                        mapScene.remove(B6);
                        mapScene.remove(B7);
                        mapScene.remove(C1);
                        mapScene.remove(C2);
                        mapScene.remove(C3);
                        mapScene.remove(C4);
                        mapScene.remove(C5);
                        mapScene.remove(C6);
                        mapScene.remove(C7);
                        mapScene.remove(D1);
                        mapScene.remove(D2);
                        mapScene.remove(D3);
                        mapScene.remove(A1);
                        mapScene.remove(L1);
                        mapScene.remove(L2);
                        mapScene.remove(L3);
                        D4.position.y = -100;
                        D4.position.x = -4.2 / 31.8 * 512 * (1 + 0.2 * d4);
                        D4.position.z = 0;
                        startposX = -4.2 / 31.8 * 512 * (1 + 0.2 * d4);
                        startposZ = 0;
                        fangkuaiArr = fangkuaiD4Arr;
                        mapScene.add(D4);
                        if (d4 == 4 || d4 == -4) {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512;
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512;
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512;
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512;
                        } else {
                            JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d4);
                            Jx = Number(document.getElementById('targetPosX').innerHTML) / 31.8 * 512 * (1 + 0.2 * d4);
                            JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d4);
                            Jz = Number(document.getElementById('targetPosZ').innerHTML) / 40.2 * 512 * (1 + 0.2 * d4);
                        }
                    }

                }

            }

            else if (Number(document.getElementById('cameraPosY').innerHTML) >= -6.3 && Number(document.getElementById('cameraPosY').innerHTML) <= 0) {
                mapScene.remove(W);
                mapScene.remove(A2);
                mapScene.remove(A3);
                mapScene.remove(A4);
                mapScene.remove(A5);
                mapScene.remove(A6);
                mapScene.remove(A7);
                mapScene.remove(A8);
                mapScene.remove(B1);
                mapScene.remove(B2);
                mapScene.remove(B3);
                mapScene.remove(B4);
                mapScene.remove(B5);
                mapScene.remove(B6);
                mapScene.remove(B7);
                mapScene.remove(C1);
                mapScene.remove(C2);
                mapScene.remove(C3);
                mapScene.remove(C4);
                mapScene.remove(C5);
                mapScene.remove(C6);
                mapScene.remove(C7);
                mapScene.remove(D1);
                mapScene.remove(D4);
                mapScene.remove(D3);
                mapScene.remove(A1);
                mapScene.remove(D2);
                mapScene.remove(L2);
                mapScene.remove(L3);
                L1.position.y = -10;
                L1.position.x = -46.14 / 129.35 * 512 * (1 + 0.2 * l1);
                L1.position.z = -57.77 / 161.4 * 512 * (1 + 0.2 * l1);
                startposX = -46.14 / 129.35 * 512 * (1 + 0.2 * l1);
                startposZ = -57.77 / 161.4 * 512 * (1 + 0.2 * l1);
                fangkuaiArr = fangkuaiL1Arr;
                mapScene.add(L1);
                if (l1 == 4 || l1 == -4) {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 129.35 * 512;
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 161.4 * 512;
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 129.35 * 512;
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 161.4 * 512;

                } else {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 129.35 * 512 * (1 + 0.2 * l1);
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 129.35 * 512 * (1 + 0.2 * l1);
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 161.4 * 512 * (1 + 0.2 * l1);
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 161.4 * 512 * (1 + 0.2 * l1);
                }
            }

            else if (Number(document.getElementById('cameraPosY').innerHTML) >= -10.2 && Number(document.getElementById('cameraPosY').innerHTML) <= -6.4) {
                mapScene.remove(W);
                mapScene.remove(A2);
                mapScene.remove(A3);
                mapScene.remove(A4);
                mapScene.remove(A5);
                mapScene.remove(A6);
                mapScene.remove(A7);
                mapScene.remove(A8);
                mapScene.remove(B1);
                mapScene.remove(B2);
                mapScene.remove(B3);
                mapScene.remove(B4);
                mapScene.remove(B5);
                mapScene.remove(B6);
                mapScene.remove(B7);
                mapScene.remove(C1);
                mapScene.remove(C2);
                mapScene.remove(C3);
                mapScene.remove(C4);
                mapScene.remove(C5);
                mapScene.remove(C6);
                mapScene.remove(C7);
                mapScene.remove(D1);
                mapScene.remove(D4);
                mapScene.remove(D3);
                mapScene.remove(A1);
                mapScene.remove(L1);
                mapScene.remove(D2);
                mapScene.remove(L3);
                L2.position.y = -10;
                L2.position.x = -46.14 / 129.35 * 512 * (1 + 0.2 * l2);
                L2.position.z = -58.49 / 159.95 * 512 * (1 + 0.2 * l2);
                startposX = -46.14 / 129.35 * 512 * (1 + 0.2 * l2);
                startposZ = -58.49 / 159.95 * 512 * (1 + 0.2 * l2);
                fangkuaiArr = fangkuaiL2Arr;
                mapScene.add(L2);
                if (l2 == 4 || l2 == -4) {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 129.35 * 512;
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 159.95 * 512;
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 129.35 * 512;
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 159.95 * 512;
                } else {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 129.35 * 512 * (1 + 0.2 * l2);
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 129.35 * 512 * (1 + 0.2 * l2);
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 159.95 * 512 * (1 + 0.2 * l2);
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 159.95 * 512 * (1 + 0.2 * l2);
                }
            }

            else if (Number(document.getElementById('cameraPosY').innerHTML) >= -15 && Number(document.getElementById('cameraPosY').innerHTML) <= -10.3) {
                mapScene.remove(W);
                mapScene.remove(A2);
                mapScene.remove(A3);
                mapScene.remove(A4);
                mapScene.remove(A5);
                mapScene.remove(A6);
                mapScene.remove(A7);
                mapScene.remove(A8);
                mapScene.remove(B1);
                mapScene.remove(B2);
                mapScene.remove(B3);
                mapScene.remove(B4);
                mapScene.remove(B5);
                mapScene.remove(B6);
                mapScene.remove(B7);
                mapScene.remove(C1);
                mapScene.remove(C2);
                mapScene.remove(C3);
                mapScene.remove(C4);
                mapScene.remove(C5);
                mapScene.remove(C6);
                mapScene.remove(C7);
                mapScene.remove(D1);
                mapScene.remove(D4);
                mapScene.remove(D3);
                mapScene.remove(A1);
                mapScene.remove(L1);
                mapScene.remove(L2);
                mapScene.remove(D2);
                L3.position.y = -10;
                L3.position.x = -47.55 / 131.3 * 512 * (1 + 0.2 * l3);
                L3.position.z = -58.85 / 163.7 * 512 * (1 + 0.2 * l3);
                startposX = -47.55 / 131.3 * 512 * (1 + 0.2 * l3);
                startposZ = -58.85 / 163.7 * 512 * (1 + 0.2 * l3);
                fangkuaiArr = fangkuaiL3Arr;
                mapScene.add(L3);
                if (l3 == 4 || l3 == -4) {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 129.35 * 512;
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 159.95 * 512;
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 129.35 * 512;
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 159.95 * 512;
                } else {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 129.35 * 512 * (1 + 0.2 * l3);
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 129.35 * 512 * (1 + 0.2 * l3);
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 159.95 * 512 * (1 + 0.2 * l3);
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 159.95 * 512 * (1 + 0.2 * l3);
                }
            }

            else if (Number(document.getElementById('cameraPosY').innerHTML) < -15 || Number(document.getElementById('cameraPosY').innerHTML) > 66) {
                mapScene.remove(A1);
                mapScene.remove(A2);
                mapScene.remove(A3);
                mapScene.remove(A4);
                mapScene.remove(A5);
                mapScene.remove(A6);
                mapScene.remove(A7);
                mapScene.remove(A8);
                mapScene.remove(B1);
                mapScene.remove(B2);
                mapScene.remove(B3);
                mapScene.remove(B4);
                mapScene.remove(B5);
                mapScene.remove(B6);
                mapScene.remove(B7);
                mapScene.remove(C1);
                mapScene.remove(C2);
                mapScene.remove(C3);
                mapScene.remove(C4);
                mapScene.remove(C5);
                mapScene.remove(C6);
                mapScene.remove(C7);
                mapScene.remove(D1);
                mapScene.remove(D2);
                mapScene.remove(D3);
                mapScene.remove(D4);
                mapScene.remove(L1);
                mapScene.remove(L2);
                mapScene.remove(L3);
                mapScene.add(W);
                if (w == 4 || w == -4) {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 132.15 * 512;
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 164.2 * 512;
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 132.15 * 512;
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 164.2 * 512;
                } else {
                    JiantouX = Number(document.getElementById('cameraPosX').innerHTML) / 132.15 * 512 * (1 + 0.2 * w);
                    Jx = Number(document.getElementById('targetPosX').innerHTML) / 132.15 * 512 * (1 + 0.2 * w);
                    JiantouZ = Number(document.getElementById('cameraPosZ').innerHTML) / 164.2 * 512 * (1 + 0.2 * w);
                    Jz = Number(document.getElementById('targetPosZ').innerHTML) / 164.2 * 512 * (1 + 0.2 * w);
                }
            }
        }
        //getnowkuai();

        SZ.position.set(JiantouX+120, 50, JiantouZ-120);
        //JS.position.set(JiantouX-120, 90, JiantouZ);
        //JE.position.set(JiantouX, 90, JiantouZ+120);
        //JN.position.set(JiantouX+120, 90, JiantouZ);
        if(t==1){
            TWEEN.update();
            if(isMove==true){
                Jiantou.lookAt(new THREE.Vector3(X, -50000, Z));
                circle.lookAt(new THREE.Vector3(X, 10000, Z));
                yuan.lookAt(new THREE.Vector3(Jx, 10000, Jz));
            }else{
                Jiantou.lookAt(new THREE.Vector3(Jx,-50000,Jz));
                circle.lookAt(new THREE.Vector3(Jx,10000, Jz));
                yuan.lookAt(new THREE.Vector3(Jx, 10000, Jz));
            }
            yuan.position.set(JiantouX, 80, JiantouZ);
            Jiantou.position.set(JiantouX, 80, JiantouZ);
            circle.position.set(JiantouX, 80, JiantouZ);
            mapCamera.position.set(JiantouX, 100, JiantouZ);

        }else if(t>=2){
            TWEEN.add(Jiantoumove);
            TWEEN.add(Cameramove);
            TWEEN.add(Circlemove);
            TWEEN.update();
            if(isMove==true){
                Jiantou.lookAt(new THREE.Vector3(X, -50000, Z));
                circle.lookAt(new THREE.Vector3(X, 10000, Z));
                yuan.lookAt(new THREE.Vector3(Jx, 10000, Jz));
            }else{
                Jiantou.lookAt(new THREE.Vector3(Jx,-50000,Jz));
                circle.lookAt(new THREE.Vector3(Jx,10000, Jz));
                yuan.lookAt(new THREE.Vector3(Jx, 10000, Jz));
            }
            yuan.position.set(JiantouX, 80, JiantouZ);
            Jiantou.position.set(JiantouX, 80, JiantouZ);
            circle.position.set(JiantouX, 80, JiantouZ);
            mapCamera.position.set(JiantouX, 100, JiantouZ);

        }else if(t==0||t==-1){
            Jiantou.lookAt(new THREE.Vector3(Jx, -50000, Jz));
            circle.lookAt(new THREE.Vector3(Jx, 10000, Jz));
            yuan.lookAt(new THREE.Vector3(Jx, 10000, Jz));
            yuan.position.set(JiantouX, 80, JiantouZ);
            Jiantou.position.set(JiantouX, 80, JiantouZ);
            circle.position.set(JiantouX, 80, JiantouZ);
            mapCamera.position.set(JiantouX, 100, JiantouZ);
        }

        requestAnimationFrame(mapRender);
        mapRenderer.render(mapScene, mapCamera);

    }

    initMapScene();
    function initMapScene() {
        initScene();
        mapRender();
    }

    //缩放比例
    function scaleMap() {
        if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
            W.scale.set((1+0.2*w)*smallMap.scale.x,(1+0.2*w)*smallMap.scale.y,(1+0.2*w)*smallMap.scale.z);
        }
        else{
            if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                        A1.scale.set((1+0.2*a1)*smallMap.scale.x,(1+0.2*a1)*smallMap.scale.y,(1+0.2*a1)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        A2.scale.set((1+0.2*a2)*smallMap.scale.x,(1+0.2*a2)*smallMap.scale.y,(1+0.2*a2)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        A3.scale.set((1+0.2*a3)*smallMap.scale.x,(1+0.2*a3)*smallMap.scale.y,(1+0.2*a3)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                        A4.scale.set((1 + 0.2 * a4) * smallMap.scale.x, (1 + 0.2 * a4) * smallMap.scale.y,(1+0.2*a4)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                        A5.scale.set((1 + 0.2 * a5) * smallMap.scale.x, (1 + 0.2 * a5) * smallMap.scale.y,(1+0.2*a5)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                        A6.scale.set((1 + 0.2 * a6) * smallMap.scale.x, (1 + 0.2 * a6) * smallMap.scale.y,(1+0.2*a6)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                        A7.scale.set((1 + 0.2 * a7) * smallMap.scale.x, (1 + 0.2 * a7) * smallMap.scale.y,(1+0.2*a7)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        A8.scale.set((1 + 0.2 * a8) * smallMap.scale.x, (1 + 0.2 * a8) * smallMap.scale.y,(1+0.2*a8)*smallMap.scale.z);
                    }

                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                        B1.scale.set((1 + 0.2 * b1) * smallMap.scale.x, (1 + 0.2 * b1) * smallMap.scale.y,(1+0.2*b1)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        B2.scale.set((1 + 0.2 * b2) * smallMap.scale.x, (1 + 0.2 * b2) * smallMap.scale.y,(1+0.2*b2)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        B3.scale.set((1 + 0.2 * b3) * smallMap.scale.x, (1 + 0.2 * b3) * smallMap.scale.y,(1+0.2*b3)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                        B4.scale.set((1 + 0.2 * b4) * smallMap.scale.x, (1 + 0.2 * b4) * smallMap.scale.y,(1+0.2*b4)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                        B5.scale.set((1 + 0.2 * b5) * smallMap.scale.x, (1 + 0.2 * b5) * smallMap.scale.y,(1+0.2*b5)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                        B6.scale.set((1 + 0.2 * b6) * smallMap.scale.x, (1 + 0.2 * b6) * smallMap.scale.y,(1+0.2*b6)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        B7.scale.set((1 + 0.2 * b7) * smallMap.scale.x, (1 + 0.2 * b7) * smallMap.scale.y,(1+0.2*b7)*smallMap.scale.z);
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                        C1.scale.set((1 + 0.2 * c1) * smallMap.scale.x, (1 + 0.2 * c1) * smallMap.scale.y,(1+0.2*c1)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                        C2.scale.set((1 + 0.2 * c2) * smallMap.scale.x, (1 + 0.2 * c2) * smallMap.scale.y,(1+0.2*c2)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                        C3.scale.set((1 + 0.2 * c3) * smallMap.scale.x, (1 + 0.2 * c3) * smallMap.scale.y,(1+0.2*c3)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                        C4.scale.set((1 + 0.2 * c4) * smallMap.scale.x, (1 + 0.2 * c4) * smallMap.scale.y,(1+0.2*c4)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                        C5.scale.set((1 + 0.2 * c5) * smallMap.scale.x, (1 + 0.2 * c5) * smallMap.scale.y,(1+0.2*c5)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                        C6.scale.set((1 + 0.2 * c6) * smallMap.scale.x, (1 + 0.2 * c6) * smallMap.scale.y,(1+0.2*c6)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                        C7.scale.set((1 + 0.2 * c7) * smallMap.scale.x, (1 + 0.2 * c7) * smallMap.scale.y,(1+0.2*c7)*smallMap.scale.z);
                    }

                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                        D1.scale.set((1 + 0.2 * d1) * smallMap.scale.x, (1 + 0.2 * d1) * smallMap.scale.y,(1+0.2*d1)*smallMap.scale.z);
                    }
                    else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                        D2.scale.set((1 + 0.2 * d2) * smallMap.scale.x, (1 + 0.2 * d2) * smallMap.scale.y,(1+0.2*d2)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                        D3.scale.set((1 + 0.2 * d3) * smallMap.scale.x, (1 + 0.2 * d3) * smallMap.scale.y,(1+0.2*d3)*smallMap.scale.z);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                        D4.scale.set((1 + 0.2 * d4) * smallMap.scale.x, (1 + 0.2 * d4) * smallMap.scale.y,(1+0.2*d4)*smallMap.scale.z);
                    }

                }

            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                L1.scale.set((1+0.2*l1)*smallMap.scale.x,(1+0.2*l1)*smallMap.scale.y,(1+0.2*l1)*smallMap.scale.z);
            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                L2.scale.set((1 + 0.2 * l2) * smallMap.scale.x, (1 + 0.2 * l2) * smallMap.scale.y,(1+0.2*l2)*smallMap.scale.z);
            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                L3.scale.set((1 + 0.2 * l3) * smallMap.scale.x, (1 + 0.2 * l3) * smallMap.scale.y,(1+0.2*l3)*smallMap.scale.z);
            }
        }


        mapRenderer.render(mapScene, mapCamera);
    }

    suofang();
    function  suofang(){
        document.getElementById("small").onclick=function (){
            if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
                w=w-1;
                if(w==4||w==-4){
                    W.scale.set(1,1);
                    w=0;
                }else{
                    scaleMap();
                }
            }
            else{
                if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                    if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            a1=a1-1;
                            if(a1==4||a1==-4){
                                A1.scale.set(1,1);
                                a1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            a2=a2-1;
                            if(a2==4||a2==-4){
                                A2.scale.set(1,1);
                                a2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            a3=a3-1;
                            if(a3==4||a3==-4){
                                A3.scale.set(1,1);
                                a3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            a4=a4-1;
                            if(a4==4||a4==-4){
                                A4.scale.set(1,1);
                                a4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            a5=a5-1;
                            if(a5==4||a5==-4){
                                A5.scale.set(1,1);
                                a5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                            a6=a6-1;
                            if(a6==4||a6==-4){
                                A6.scale.set(1,1);
                                a6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            a7=a7-1;
                            if(a7==4||a7==-4){
                                A7.scale.set(1,1);
                                a7=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            a8=a8-1;
                            if(a8==4||a8==-4){
                                A8.scale.set(1,1);
                                a8=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            b1=b1-1;
                            if(b1==4||b1==-4){
                                B1.scale.set(1,1);
                                b1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            b2=b2-1;
                            if(b2==4||b2==-4){
                                B2.scale.set(1,1);
                                b2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            b3=b3-1;
                            if(b3==4||b3==-4){
                                B3.scale.set(1,1);
                                b3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            b4=b4-1;
                            if(b4==4||b4==-4){
                                B4.scale.set(1,1);
                                b4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            b5=b5-1;
                            if(b5==4||b5==-4){
                                B5.scale.set(1,1);
                                b5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            b6=b6-1;
                            if(b6==4||b6==-4){
                                B6.scale.set(1,1);
                                b6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            b7=b7-1;
                            if(b7==4||b7==-4){
                                B7.scale.set(1,1);
                                b7=0;
                            }else{
                                scaleMap();
                            }
                        }
                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                            c1=c1-1;
                            if(c1==4||c1==-4){
                                C1.scale.set(1,1);
                                c1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                            c2=c2-1;
                            if(c2==4||c2==-4){
                                C2.scale.set(1,1);
                                c2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                            c3=c3-1;
                            if(c3==4||c3==-4){
                                C3.scale.set(1,1);
                                c3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                            c4=c4-1;
                            if(c4==4||c4==-4){
                                C4.scale.set(1,1);
                                c4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                            c5=c5-1;
                            if(c5==4||c5==-4){
                                C5.scale.set(1,1);
                                c5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                            c6=c6-1;
                            if(c6==4||c6==-4){
                                C6.scale.set(1,1);
                                c6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                            c7=c7-1;
                            if(c7==4||c7==-4){
                                C7.scale.set(1,1);
                                c7=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                            d1=d1-1;
                            if(d1==4||d1==-4){
                                D1.scale.set(1,1);
                                d1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                            d2=d2-1;
                            if(d2==4||d2==-4){
                                D2.scale.set(1,1);
                                d2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                            d3=d3-1;
                            if(d3==4||d3==-4){
                                D3.scale.set(1,1);
                                d3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                            d4=d4-1;
                            if(d4==4||d4==-4){
                                D4.scale.set(1,1);
                                d4=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }

                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                    l1=l1-1;
                    if(l1==4||l1==-4){
                        L1.scale.set(1,1,1);
                        l1=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                    l2=l2-1;
                    if(l2==4||l2==-4){
                        L2.scale.set(1,1);
                        l2=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                    l3=l3-1;
                    if(l3==4||l3==-4){
                        L3.scale.set(1,1);
                        l3=0;
                    }else{
                        scaleMap();
                    }
                }
            }


            mapRenderer.render(mapScene, mapCamera);
        };

        document.getElementById("big").onclick=function (){
            if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
                w=w+1;
                if(w==4||w==-4){
                    W.scale.set(1,1);
                    w=0;
                }else{
                    scaleMap();
                }
            }
            else {
                if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                    if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            a1=a1+1;
                            if(a1==4||a1==-4){
                                A1.scale.set(1,1);
                                a1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            a2=a2+1;
                            if(a2==4||a2==-4){
                                A2.scale.set(1,1);
                                a2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            a3=a3+1;
                            if(a3==4||a3==-4){
                                A3.scale.set(1,1);
                                a3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            a4=a4+1;
                            if(a4==4||a4==-4){
                                A4.scale.set(1,1);
                                a4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            a5=a5+1;
                            if(a5==4||a5==-4){
                                A5.scale.set(1,1);
                                a5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                            a6=a6+1;
                            if(a6==4||a6==-4){
                                A6.scale.set(1,1);
                                a6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            a7=a7+1;
                            if(a7==4||a7==-4){
                                A7.scale.set(1,1);
                                a7=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            a8=a8+1;
                            if(a8==4||a8==-4){
                                A8.scale.set(1,1);
                                a8=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            b1=b1+1;
                            if(b1==4||b1==-4){
                                B1.scale.set(1,1);
                                b1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            b2=b2+1;
                            if(b2==4||b2==-4){
                                B2.scale.set(1,1);
                                b2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            b3=b3+1;
                            if(b3==4||b3==-4){
                                B3.scale.set(1,1);
                                b3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            b4=b4+1;
                            if(b4==4||b4==-4){
                                B4.scale.set(1,1);
                                b4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            b5=b5+1;
                            if(b5==4||b5==-4){
                                B5.scale.set(1,1);
                                b5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            b6=b6+1;
                            if(b6==4||b6==-4){
                                B6.scale.set(1,1);
                                b6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            b7=b7+1;
                            if(b7==4||b7==-4){
                                B7.scale.set(1,1);
                                b7=0;
                            }else{
                                scaleMap();
                            }
                        }
                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                            c1=c1+1;
                            if(c1==4||c1==-4){
                                C1.scale.set(1,1);
                                c1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                            c2=c2+1;
                            if(c2==4||c2==-4){
                                C2.scale.set(1,1);
                                c2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                            c3=c3+1;
                            if(c3==4||c3==-4){
                                C3.scale.set(1,1);
                                c3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                            c4=c4+1;
                            if(c4==4||c4==-4){
                                C4.scale.set(1,1);
                                c4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                            c5=c5+1;
                            if(c5==4||c5==-4){
                                C5.scale.set(1,1);
                                c5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                            c6=c6+1;
                            if(c6==4||c6==-4){
                                C6.scale.set(1,1);
                                c6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                            c7=c7+1;
                            if(c7==4||c7==-4){
                                C7.scale.set(1,1);
                                c7=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                            d1=d1+1;
                            if(d1==4||d1==-4){
                                D1.scale.set(1,1);
                                d1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                            d2=d2+1;
                            if(d2==4||d2==-4){
                                D2.scale.set(1,1);
                                d2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                            d3=d3+1;
                            if(d3==4||d3==-4){
                                D3.scale.set(1,1);
                                d3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                            d4=d4+1;
                            if(d4==4||d4==-4){
                                D4.scale.set(1,1);
                                d4=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }

                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                    l1=l1+1;
                    if(l1==4||l1==-4){
                        L1.scale.set(1,1,1);
                        l1=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                    l2=l2+1;
                    if(l2==4||l2==-4){
                        L2.scale.set(1,1);
                        l2=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                    l3=l3+1;
                    if(l3==4||l3==-4){
                        L3.scale.set(1,1);
                        l3=0;
                    }else{
                        scaleMap();
                    }
                }
            }


            mapRenderer.render(mapScene, mapCamera);
        };

        if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
            if(w==1||w==-3){
                document.getElementById("small").className="glyphicon glyphicon-repeat";
            }else if(w==-1||w==3){
                document.getElementById("big").className="glyphicon glyphicon-repeat";
            }else if(w==0||w==2||w==-2){
                document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                document.getElementById("big").className="glyphicon glyphicon-zoom-in";
            }
        }
        else{
            if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                        if(a1==1||a1==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a1==-1||a1==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a1==0||a1==2||a1==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        if(a2==1||a2==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a2==-1||a2==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a2==0||a2==2||a2==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        if(a3==1||a3==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a3==-1||a3==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a3==0||a3==2||a3==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                        if(a4==1||a4==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a4==-1||a4==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a4==0||a4==2||a4==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                        if(a5==1||a5==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a5==-1||a5==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a5==0||a5==2||a5==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                        if(a6==1||a6==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a6==-1||a6==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a6==0||a6==2||a6==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                        if(a7==1||a7==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a7==-1||a7==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a7==0||a7==2||a7==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        if(a8==1||a8==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(a8==-1||a8==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(a8==0||a8==2||a8==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }

                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                        if(b1==1||b1==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b1==-1||b1==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b1==0||b1==2||b1==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        if(b2==1||b2==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b2==-1||b2==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b2==0||b2==2||b2==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        if(b3==1||b3==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b3==-1||b2==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b3==0||b3==2||b3==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                        if(b4==1||b4==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b4==-1||b4==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b4==0||b4==2||b4==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                        if(b5==1||b5==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b5==-1||b5==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b5==0||b5==2||b5==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                        if(b6==1||b6==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b6==-1||b6==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b6==0||b6==2||b6==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        if(b7==1||b7==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(b7==-1||b7==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(b7==0||b7==2||b7==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                        if(c1==1||c1==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c1==-1||c1==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c1==0||c1==2||c1==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                        if(c2==1||c2==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c2==-1||c2==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c2==0||c2==2||c2==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                        if(c3==1||c3==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c3==-1||c3==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c3==0||c3==2||c3==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                        if(c4==1||c4==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c4==-1||c4==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c4==0||c4==2||c4==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                        if(c5==1||c5==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c5==-1||c5==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c5==0||c5==2||c5==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                        if(c6==1||c6==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c6==-1||c6==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c6==0||c6==2||c6==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                        if(c7==1||c7==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(c7==-1||c7==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(c7==0||c7==2||c7==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }

                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                        if(d1==1||d1==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(d1==-1||d1==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(d1==0||d1==2||d1==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                        if(d2==1||d2==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(d2==-1||d2==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(d2==0||d2==2||d2==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                        if(d3==1||d3==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(d3==-1||d3==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(d3==0||d3==2||d3==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                        if(d4==1||d4==-3){
                            document.getElementById("small").className="glyphicon glyphicon-repeat";
                        }else if(d4==-1||d4==3){
                            document.getElementById("big").className="glyphicon glyphicon-repeat";
                        }else if(d4==0||d4==2||d4==-2){
                            document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                            document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                        }
                    }

                }

            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                if(l1==1||l1==-3){
                    document.getElementById("small").className="glyphicon glyphicon-repeat";
                }else if(l1==-1||l1==3){
                    document.getElementById("big").className="glyphicon glyphicon-repeat";
                }else if(l1==0||l1==2||l1==-2){
                    document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                    document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                }
            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                if(l2==1||l2==-3){
                    document.getElementById("small").className="glyphicon glyphicon-repeat";
                }else if(l2==-1||l2==3){
                    document.getElementById("big").className="glyphicon glyphicon-repeat";
                }else if(l2==0||l2==2||l2==-2){
                    document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                    document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                }
            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                if(l3==1||l3==-3){
                    document.getElementById("small").className="glyphicon glyphicon-repeat";
                }else if(l3==-1||l3==3){
                    document.getElementById("big").className="glyphicon glyphicon-repeat";
                }else if(l3==0||l3==2||l3==-2){
                    document.getElementById("small").className="glyphicon glyphicon-zoom-out";
                    document.getElementById("big").className="glyphicon glyphicon-zoom-in";
                }
            }
        }


        requestAnimationFrame(suofang);
        mapRenderer.render(mapScene, mapCamera);
    }

    //mousesuofang
    function handle(delta){
        if (delta <= 0){

            if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
                w=w-1;
                if(w==4||w==-4){
                    W.scale.set(1,1);
                    w=0;
                }else{
                    scaleMap();
                }
            }
            else {
                if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                    if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            a1=a1-1;
                            if(a1==4||a1==-4){
                                A1.scale.set(1,1);
                                a1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            a2=a2-1;
                            if(a2==4||a2==-4){
                                A2.scale.set(1,1);
                                a2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            a3=a3-1;
                            if(a3==4||a3==-4){
                                A3.scale.set(1,1);
                                a3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            a4=a4-1;
                            if(a4==4||a4==-4){
                                A4.scale.set(1,1);
                                a4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            a5=a5-1;
                            if(a5==4||a5==-4){
                                A5.scale.set(1,1);
                                a5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                            a6=a6-1;
                            if(a6==4||a6==-4){
                                A6.scale.set(1,1);
                                a6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            a7=a7-1;
                            if(a7==4||a7==-4){
                                A7.scale.set(1,1);
                                a7=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            a8=a8-1;
                            if(a8==4||a8==-4){
                                A8.scale.set(1,1);
                                a8=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            b1=b1-1;
                            if(b1==4||b1==-4){
                                B1.scale.set(1,1);
                                b1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            b2=b2-1;
                            if(b2==4||b2==-4){
                                B2.scale.set(1,1);
                                b2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            b3=b3-1;
                            if(b3==4||b3==-4){
                                B3.scale.set(1,1);
                                b3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            b4=b4-1;
                            if(b4==4||b4==-4){
                                B4.scale.set(1,1);
                                b4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            b5=b5-1;
                            if(b5==4||b5==-4){
                                B5.scale.set(1,1);
                                b5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            b6=b6-1;
                            if(b6==4||b6==-4){
                                B1.scale.set(1,1);
                                b6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            b7=b7-1;
                            if(b7==4||b7==-4){
                                B7.scale.set(1,1);
                                b7=0;
                            }else{
                                scaleMap();
                            }
                        }
                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                            c1=c1-1;
                            if(c1==4||c1==-4){
                                C1.scale.set(1,1);
                                c1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                            c2=c2-1;
                            if(c2==4||c2==-4){
                                C2.scale.set(1,1);
                                c2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                            c3=c3-1;
                            if(c3==4||c3==-4){
                                C3.scale.set(1,1);
                                c3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                            c4=c4-1;
                            if(c4==4||c4==-4){
                                C4.scale.set(1,1);
                                c4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                            c5=c5-1;
                            if(c5==4||c5==-4){
                                C5.scale.set(1,1);
                                c5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                            c6=c6-1;
                            if(c6==4||c6==-4){
                                C6.scale.set(1,1);
                                c6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                            c7=c7-1;
                            if(c7==4||c7==-4){
                                C7.scale.set(1,1);
                                c7=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                            d1=d1-1;
                            if(d1==4||d1==-4){
                                D1.scale.set(1,1);
                                d1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                            d2=d2-1;
                            if(d2==4||d2==-4){
                                D2.scale.set(1,1);
                                d2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                            d3=d3-1;
                            if(d3==4||d3==-4){
                                D3.scale.set(1,1);
                                d3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                            d4=d4-1;
                            if(d4==4||d4==-4){
                                D4.scale.set(1,1);
                                d4=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }

                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                    l1=l1-1;
                    if(l1==4||l1==-4){
                        L1.scale.set(1,1);
                        l1=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                    l2=l2-1;
                    if(l2==4||l2==-4){
                        L2.scale.set(1,1);
                        l2=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                    l3=l3-1;
                    if(l3==4||l3==-4){
                        L3.scale.set(1,1);
                        l3=0;
                    }else{
                        scaleMap();
                    }
                }
            }


            mapRenderer.render(mapScene, mapCamera);
        }
        else{
            if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
                w=w+1;
                if(w==4||w==-4){
                    W.scale.set(1,1);
                    w=0;
                }else{
                    scaleMap();
                }
            }
            else{
                if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                    if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            a1=a1+1;
                            if(a1==4||a1==-4){
                                A1.scale.set(1,1);
                                a1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            a2=a2+1;
                            if(a2==4||a2==-4){
                                A2.scale.set(1,1);
                                a2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            a3=a3+1;
                            if(a3==4||a3==-4){
                                A3.scale.set(1,1);
                                a3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            a4=a4+1;
                            if(a4==4||a4==-4){
                                A4.scale.set(1,1);
                                a4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            a5=a5+1;
                            if(a5==4||a5==-4){
                                A5.scale.set(1,1);
                                a5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                            a6=a6+1;
                            if(a6==4||a6==-4){
                                A6.scale.set(1,1);
                                a6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            a7=a7+1;
                            if(a7==4||a7==-4){
                                A7.scale.set(1,1);
                                a7=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            a8=a8+1;
                            if(a8==4||a8==-4){
                                A8.scale.set(1,1);
                                a8=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                            b1=b1+1;
                            if(b1==4||b1==-4){
                                B1.scale.set(1,1);
                                b1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                            b2=b2+1;
                            if(b2==4||b2==-4){
                                B2.scale.set(1,1);
                                b2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                            b3=b3+1;
                            if(b3==4||b3==-4){
                                B3.scale.set(1,1);
                                b3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                            b4=b4+1;
                            if(b4==4||b4==-4){
                                B4.scale.set(1,1);
                                b4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                            b5=b5+1;
                            if(b5==4||b5==-4){
                                B5.scale.set(1,1);
                                b5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                            b6=b6+1;
                            if(b6==4||b6==-4){
                                B6.scale.set(1,1);
                                b6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                            b7=b7+1;
                            if(b7==4||b7==-4){
                                B7.scale.set(1,1);
                                b7=0;
                            }else{
                                scaleMap();
                            }
                        }
                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                            c1=c1+1;
                            if(c1==4||c1==-4){
                                C1.scale.set(1,1);
                                c1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                            c2=c2+1;
                            if(c2==4||c2==-4){
                                C2.scale.set(1,1);
                                c2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                            c3=c3+1;
                            if(c3==4||c3==-4){
                                C3.scale.set(1,1);
                                c3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                            c4=c4+1;
                            if(c4==4||c4==-4){
                                C4.scale.set(1,1);
                                c4=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                            c5=c5+1;
                            if(c5==4||c5==-4){
                                C5.scale.set(1,1);
                                c5=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                            c6=c6+1;
                            if(c6==4||c6==-4){
                                C6.scale.set(1,1);
                                c6=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                            c7=c7+1;
                            if(c7==4||c7==-4){
                                C7.scale.set(1,1);
                                c7=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }


                    else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                        if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                            d1=d1+1;
                            if(d1==4||d1==-4){
                                D1.scale.set(1,1);
                                d1=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                            d2=d2+1;
                            if(d2==4||d2==-4){
                                D2.scale.set(1,1);
                                d2=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                            d3=d3+1;
                            if(d3==4||d3==-4){
                                D3.scale.set(1,1);
                                d3=0;
                            }else{
                                scaleMap();
                            }
                        }
                        else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                            d4=d4+1;
                            if(d4==4||d4==-4){
                                D4.scale.set(1,1);
                                d4=0;
                            }else{
                                scaleMap();
                            }
                        }

                    }

                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                    l1=l1+1;
                    if(l1==4||l1==-4){
                        L1.scale.set(1,1);
                        l1=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                    l2=l2+1;
                    if(l2==4||l2==-4){
                        L2.scale.set(1,1);
                        l2=0;
                    }else{
                        scaleMap();
                    }
                }

                else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                    l3=l3+1;
                    if(l3==4||l3==-4){
                        L3.scale.set(1,1);
                        l3=0;
                    }else{
                        scaleMap();
                    }
                }
            }

            mapRenderer.render(mapScene, mapCamera);
        }

    }

    function wheel(event){
        if(Number(document.getElementById('mouseNull').innerHTML)==1){
            var delta = 0;
            if (!event) /* For IE. */
                event = window.event;
            if (event.wheelDelta) { /* IE或者Opera. */
                delta = event.wheelDelta / 120;
                /** 在Opera9中，事件处理不同于IE
                 */
                if (window.opera)
                    delta = -delta;
            } else if (event._zzjsnet) { /** 兼容Mozilla. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event._zzjsnet / 3;
            }
            /** 如果 增量不等于0则触发
             * 主要功能为测试滚轮向上滚或者是向下
             */
            if (delta){
                handle(delta);
            }
            document.getElementById('mouseNull').innerHTML = "0";
        }else if(Number(document.getElementById('mouseNull').innerHTML)==0){
            document.getElementById('mouseNull').innerHTML = "1";
            return false;
        }
    }
    /** 初始化 */
    if (window.addEventListener)
    //Mozilla
    //     window.addEventListener("DOMMouseScroll", wheel, false);
    //IE/Opera
    // window.onmousewheel = document.onmousewheel = wheel;


    //var mapScenes;
    //var mapRenderers;
    //var mapCameras;
    //var connectionWorker = new Worker("js/loadConnectionMap.js");
    //var connectionName=new Worker("js/loadConnectMapName.js");

    //initConnectMap();
    //function initConnectMap() {
    //    mapScenes = new THREE.Scene();
    //
    //    mapRenderers = new THREE.WebGLRenderer({antialias: true});
    //    mapRenderers.setClearColor(0xFFFFFF);
    //    mapRenderers.setSize(width, width);
    //
    //    mapCameras = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 1000);
    //    mapCameras.position.set(0, 100, 0);
    //    mapCameras.lookAt(new THREE.Vector3(mapCameras.position.x, 10, mapCameras.position.z));
    //    mapCameras.rotation.set(mapCameras.rotation.x, mapCameras.rotation.y, mapCameras.rotation.z - Math.PI / 2);
    //
    //    var axe = new THREE.AxisHelper(20);
    //    mapScenes.add(axe);
    //
    //    //连通数据传输
    //    function change(){
    //        connectionName.postMessage(1);
    //            if(Number(document.getElementById('cameraPosY').innerHTML)<=2){
    //                connectionName.onmessage = function (event) {
    //                    var Data = event.data;
    //                    document.getElementById('datUrl').innerHTML = event.data.dataUrl;
    //                    var nameNumber = event.data.blockNum;
    //                    var nameArr = event.data.connectMapNameArr;
    //                    connectionWorker.postMessage(nameArr[0]);
    //                    map();
    //                  }
    //            }else if(Number(document.getElementById('cameraPosY').innerHTML)>2&&Number(document.getElementById('cameraPosY').innerHTML)<=5){
    //                connectionName.onmessage = function (event) {
    //                    var Data = event.data;
    //                    document.getElementById('datUrl').innerHTML = event.data.dataUrl;
    //                    var nameNumber = event.data.blockNum;
    //                    var nameArr = event.data.connectMapNameArr;
    //                    connectionWorker.postMessage(nameArr[1]);
    //                    map();
    //                    }
    //            }
    //            else if(Number(document.getElementById('cameraPosY').innerHTML)>5&&Number(document.getElementById('cameraPosY').innerHTML)<=8){
    //                connectionName.onmessage = function (event) {
    //                    var Data = event.data;
    //                    document.getElementById('datUrl').innerHTML = event.data.dataUrl;
    //                    var nameNumber = event.data.blockNum;
    //                    var nameArr = event.data.connectMapNameArr;
    //                    connectionWorker.postMessage(nameArr[2]);
    //                    map();
    //                    }
    //            }
    //            else if(Number(document.getElementById('cameraPosY').innerHTML)>8&&Number(document.getElementById('cameraPosY').innerHTML)<19){
    //                connectionName.onmessage = function (event) {
    //                    var Data = event.data;
    //                    document.getElementById('datUrl').innerHTML = event.data.dataUrl;
    //                    var nameNumber = event.data.blockNum;
    //                    var nameArr = event.data.connectMapNameArr;
    //                    connectionWorker.postMessage(nameArr[3]);
    //                    map();
    //                    }
    //            }
    //            else if(Number(document.getElementById('cameraPosY').innerHTML)>=17){
    //                connectionName.onmessage = function (event) {
    //                    var Data = event.data;
    //                    document.getElementById('datUrl').innerHTML = event.data.dataUrl;
    //                    var nameNumber = event.data.blockNum;
    //                    var nameArr = event.data.connectMapNameArr;
    //                    connectionWorker.postMessage(nameArr[4]);
    //                    map();
    //                }
    //            }
    //            requestAnimationFrame(change);
    //    }change();
    //    mapRenderers.render(mapScenes, mapCameras);
    //    $("#Connect-output").append(mapRenderers.domElement);
    //}

    // function map(){
    //     var connectionNumber;
    //     var connectionArr;
    //     var circle;
    //     var line;
    //     var p1;
    //     var p2;
    //     var circleMaterial;
    //     var n;
    //     var circleGeometry = new THREE.CircleGeometry(5, 15, 0, Math.PI * 2);
    //     var dianduiName = [];
    //     var dianduiPosX = [];
    //     var dianduiPosZ = [];
    //
    //     connectionWorker.onmessage = function (event) {
    //
    //         var Data = event.data;
    //         document.getElementById('datUrl').innerHTML = event.data.dataUrl;
    //         connectionNumber = event.data.blockNum;
    //         connectionArr = event.data.blockConnectionArr;
    //
    //         for (n = 0; n < connectionNumber; n++) {
    //     circleMaterial = new THREE.MeshBasicMaterial({color:0x00FF00});
    //     circle = new THREE.Mesh(circleGeometry, circleMaterial);
    //     circle.material.side = THREE.DoubleSide;
    //     circle.rotation.set(Math.PI / 2, 0, 0);
    //
    //     if (0 <= n * 45 && n * 45 < 90) {
    //         circle.position.set(width / 4 * Math.cos(n * 45 * Math.PI / 180), -10, -width / 4 * Math.sin(n * 45 * Math.PI / 180));
    //     } else if (90 <= n * 45 && n * 45 < 180) {
    //         circle.position.set(-width / 4 * Math.sin((n * 45 - 90) * Math.PI / 180), -10, -width / 4 * Math.cos((n * 45 - 90) * Math.PI / 180));
    //     } else if (180 <= n * 45 && n * 45 < 270) {
    //         circle.position.set(-width / 4 * Math.cos((n * 45 - 180) * Math.PI / 180), -10, width / 4 * Math.sin((n * 45 - 180) * Math.PI / 180));
    //     } else if (270 <= n * 45 && n * 45 <= 360) {
    //         circle.position.set(width / 4 * Math.sin((n * 45 - 270) * Math.PI / 180), -10, width / 4 * Math.cos((n * 45 - 270) * Math.PI / 180));
    //     }
    //     circle.name=n;
    //     dianduiName.push(circle.name);
    //     dianduiPosX.push(circle.position.x);
    //     dianduiPosZ.push(circle.position.z);
    //     mapScenes.add(circle);
    //     mapRenderers.render(mapScenes, mapCameras);
    // }
    //
    //         for (var i = 0; i < connectionArr.length; i++) {
    //
    //                 var geometry = new THREE.Geometry();
    //                 var material = new THREE.LineBasicMaterial({vertexColors: true});
    //                 var color = new THREE.Color(0x000000);
    //
    //                 //get point
    //                 for (var k = 0; k < connectionNumber; k++) {
    //                     if (dianduiName[k] == connectionArr[i].x) {
    //                         p1 = new THREE.Vector3(dianduiPosX[k], 0, dianduiPosZ[k]);
    //                         geometry.vertices.push(p1);
    //                     } else if (dianduiName[k] == connectionArr[i].y) {
    //                         p2 = new THREE.Vector3(dianduiPosX[k], 0, dianduiPosZ[k]);
    //                         geometry.vertices.push(p2);
    //                     }
    //
    //                     geometry.colors.push(color, color);
    //                     line = new THREE.Line(geometry, material, THREE.LinePieces);
    //                     mapScenes.add(line);
    //                 }
    //             }
    //         mapRenderers.render(mapScenes, mapCameras);
    //     }
    //     highLight();
    //     function highLight() {
    //         var point = new THREE.Mesh(new THREE.CircleGeometry(10, 15, 0, Math.PI * 2), new THREE.MeshBasicMaterial({color: 0xFF0000}));
    //         point.material.side = THREE.DoubleSide;
    //         point.rotation.set(Math.PI / 2, 0, 0);
    //         if (8 < document.getElementById('cameraPosY').innerHTML && document.getElementById('cameraPosY').innerHTML <= 17) {
    //             var point0 = point.clone();
    //             var point1 = point.clone();
    //             var point2 = point.clone();
    //             var point3 = point.clone();
    //             var point4 = point.clone();
    //             var point5 = point.clone();
    //             point0.position.set(dianduiPosX[0], 0, dianduiPosZ[0]);
    //             point1.position.set(dianduiPosX[1], 0, dianduiPosZ[1]);
    //             point2.position.set(dianduiPosX[2], 0, dianduiPosZ[2]);
    //             point3.position.set(dianduiPosX[3], 0, dianduiPosZ[3]);
    //             point4.position.set(dianduiPosX[4], 0, dianduiPosZ[4]);
    //             point5.position.set(dianduiPosX[5], 0, dianduiPosZ[5]);
    //             if (0 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 28 && -87 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -44) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //                 mapScenes.remove(point5);
    //                 mapScenes.add(point0);
    //             } else if (24 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 44 && -40 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -6) {
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //                 mapScenes.remove(point5);
    //                 mapScenes.add(point1);
    //             } else if (0 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 25 && -44 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= 0) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //                 mapScenes.remove(point5);
    //                 mapScenes.add(point2);
    //             } else if (52 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 83 && -75 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -27) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point4);
    //                 mapScenes.remove(point5);
    //                 mapScenes.add(point3);
    //             } else if (84 < document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 103 && -72 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -37) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point5);
    //                 mapScenes.add(point4);
    //             } else if (111 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 134 && -72 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -37) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //                 mapScenes.remove(point0);
    //                 mapScenes.add(point5);
    //             }
    //         }
    //         else{
    //             mapScenes.remove(point1);
    //             mapScenes.remove(point2);
    //             mapScenes.remove(point3);
    //             mapScenes.remove(point4);
    //             mapScenes.remove(point5);
    //             mapScenes.remove(point0);
    //         }
    //         if (5 < document.getElementById('cameraPosY').innerHTML && document.getElementById('cameraPosY').innerHTML <= 8) {
    //             var point0 = point.clone();
    //             var point1 = point.clone();
    //             var point2 = point.clone();
    //             var point3 = point.clone();
    //             var point4 = point.clone();
    //             point0.position.set(dianduiPosX[0], 0, dianduiPosZ[0]);
    //             point1.position.set(dianduiPosX[1], 0, dianduiPosZ[1]);
    //             point2.position.set(dianduiPosX[2], 0, dianduiPosZ[2]);
    //             point3.position.set(dianduiPosX[3], 0, dianduiPosZ[3]);
    //             point4.position.set(dianduiPosX[4], 0, dianduiPosZ[4]);
    //             if (-4.3 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 32 && -79 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -30) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //                 mapScenes.add(point0);
    //             } else if (32 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 86 && -76 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -27) {
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point1);
    //             } else if (86 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 139 && -74 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -23) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point2);
    //             } else if (23 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 60 && -40 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= 0) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point3);
    //             } else if (0 < document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 23 && -24 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= 0) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point0);
    //
    //                 mapScenes.add(point4);
    //             }
    //         }
    //         else{
    //             mapScenes.remove(point1);
    //             mapScenes.remove(point2);
    //             mapScenes.remove(point3);
    //             mapScenes.remove(point4);
    //
    //             mapScenes.remove(point0);
    //         }
    //         if (2 < document.getElementById('cameraPosY').innerHTML && document.getElementById('cameraPosY').innerHTML <= 5) {
    //             var point0 = point.clone();
    //             var point1 = point.clone();
    //             var point2 = point.clone();
    //             var point3 = point.clone();
    //             var point4 = point.clone();
    //             point0.position.set(dianduiPosX[0], 0, dianduiPosZ[0]);
    //             point1.position.set(dianduiPosX[1], 0, dianduiPosZ[1]);
    //             point2.position.set(dianduiPosX[2], 0, dianduiPosZ[2]);
    //             point3.position.set(dianduiPosX[3], 0, dianduiPosZ[3]);
    //             point4.position.set(dianduiPosX[4], 0, dianduiPosZ[4]);
    //             if (-7.5 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 75 && -87 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -31) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point0);
    //             } else if (75 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 105 && -79 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -23) {
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point1);
    //             } else if (107 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 139.5 && -74 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -31) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point2);
    //             } else if (-0.3 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 29.5 && -31 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= 0) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point4);
    //
    //                 mapScenes.add(point3);
    //             } else if (29.5 < document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 61.15 && -31.5 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= 0.2) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.remove(point0);
    //
    //                 mapScenes.add(point4);
    //             }
    //         }
    //         else{
    //             mapScenes.remove(point1);
    //             mapScenes.remove(point2);
    //             mapScenes.remove(point3);
    //             mapScenes.remove(point4);
    //
    //             mapScenes.remove(point0);
    //         }
    //         if (document.getElementById('cameraPosY').innerHTML <= 2) {
    //             var point0 = point.clone();
    //             var point1 = point.clone();
    //             var point2 = point.clone();
    //             var point3 = point.clone();
    //             point0.position.set(dianduiPosX[0], 0, dianduiPosZ[0]);
    //             point1.position.set(dianduiPosX[1], 0, dianduiPosZ[1]);
    //             point2.position.set(dianduiPosX[2], 0, dianduiPosZ[2]);
    //             point3.position.set(dianduiPosX[3], 0, dianduiPosZ[3]);
    //             if (7.7 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 31.7 && -79 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -47) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.add(point0);
    //             } else if (31.7 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 52.9 && -79 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -55) {
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point3);
    //                 mapScenes.add(point1);
    //             } else if (52.8 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 103 && -72 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -15) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point3);
    //                 mapScenes.add(point2);
    //             } else if (110 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 131 && -79 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -48) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //                 mapScenes.remove(point0);
    //                 mapScenes.add(point3);
    //             }
    //         }
    //         else{
    //             mapScenes.remove(point1);
    //             mapScenes.remove(point2);
    //             mapScenes.remove(point3);
    //             mapScenes.remove(point0);
    //         }
    //         if (17 < document.getElementById('cameraPosY').innerHTML) {
    //             var point0 = point.clone();
    //             var point1 = point.clone();
    //             var point2 = point.clone();
    //             point0.position.set(dianduiPosX[0], 0, dianduiPosZ[0]);
    //             point1.position.set(dianduiPosX[1], 0, dianduiPosZ[1]);
    //             point2.position.set(dianduiPosX[2], 0, dianduiPosZ[2]);
    //             if (-0.3 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 5.7 && -72 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -47) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point2);
    //
    //                 mapScenes.add(point0);
    //             } else if (7.69 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 24.3 && -72 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -47) {
    //                 mapScenes.remove(point0);
    //                 mapScenes.remove(point2);
    //
    //                 mapScenes.add(point1);
    //             } else if (52.7 <= document.getElementById('cameraPosX').innerHTML && document.getElementById('cameraPosX').innerHTML <= 78.9 && -64.3 <= document.getElementById('cameraPosZ').innerHTML && document.getElementById('cameraPosZ').innerHTML <= -31.7) {
    //                 mapScenes.remove(point1);
    //                 mapScenes.remove(point0);
    //
    //                 mapScenes.add(point2);
    //             }
    //         }
    //         else{
    //             mapScenes.remove(point1);
    //             mapScenes.remove(point2);
    //             mapScenes.remove(point0);
    //         }
    //         requestAnimationFrame(highLight);
    //         mapRenderers.render(mapScenes, mapCameras);
    //     }
    // }

    function resize(){
        if(window.innerWidth*0.2<=window.innerHeight*0.3){
            width=window.innerWidth*0.2;
            mapCamera.aspect=1;
            mapCamera.updateProjectionMatrix();
            mapRenderer.setSize(width,width);
        }else if(window.innerWidth*0.2>window.innerHeight*0.3){
            width=window.innerHeight*0.3;
            mapCamera.aspect=1;
            mapCamera.updateProjectionMatrix();
            mapRenderer.setSize(width,width);
        }
    }
    window.addEventListener('resize',resize,false);


    //动画效果
    var x, y, X,Z;
    function bili(){
        if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
            mapwidth=mapwidths*(1+0.2*w);
            mapheight=mapheights*(1+0.2*w);
        }
        else{
            if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >0 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                        mapwidth=mapwidths*(1+0.2*a1);
                        mapheight=mapheights*(1+0.2*a1);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        mapwidth=mapwidths*(1+0.2*a2);
                        mapheight=mapheights*(1+0.2*a2);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9 && Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        mapwidth=mapwidths*(1+0.2*a3);
                        mapheight=mapheights*(1+0.2*a3);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                        mapwidth=mapwidths*(1+0.2*a4);
                        mapheight=mapheights*(1+0.2*a4);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                        mapwidth=mapwidths*(1+0.2*a5);
                        mapheight=mapheights*(1+0.2*a5);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <53.9){
                        mapwidth=mapwidths*(1+0.2*a6);
                        mapheight=mapheights*(1+0.2*a6);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=53.9 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                        mapwidth=mapwidths*(1+0.2*a7);
                        mapheight=mapheights*(1+0.2*a7);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        mapwidth=mapwidths*(1+0.2*a8);
                        mapheight=mapheights*(1+0.2*a8);
                    }

                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <5.5){
                        mapwidth=mapwidths*(1+0.2*b1);
                        mapheight=mapheights*(1+0.2*b1);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=5.5 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        mapwidth=mapwidths*(1+0.2*b2);
                        mapheight=mapheights*(1+0.2*b2);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        mapwidth=mapwidths*(1+0.2*b3);
                        mapheight=mapheights*(1+0.2*b3);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <45){
                        mapwidth=mapwidths*(1+0.2*b4);
                        mapheight=mapheights*(1+0.2*b4);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45 && Number(document.getElementById('cameraPosY').innerHTML) <49.5){
                        mapwidth=mapwidths*(1+0.2*b5);
                        mapheight=mapheights*(1+0.2*b5);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=49.5 && Number(document.getElementById('cameraPosY').innerHTML) <58.3){
                        mapwidth=mapwidths*(1+0.2*b6);
                        mapheight=mapheights*(1+0.2*b6);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        mapwidth=mapwidths*(1+0.2*b7);
                        mapheight=mapheights*(1+0.2*b7);
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                        mapwidth=mapwidths*(1+0.2*c1);
                        mapheight=mapheights*(1+0.2*c1);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<10.4){
                        mapwidth=mapwidths*(1+0.2*c2);
                        mapheight=mapheights*(1+0.2*c2);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                        mapwidth=mapwidths*(1+0.2*c3);
                        mapheight=mapheights*(1+0.2*c3);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<45.6){
                        mapwidth=mapwidths*(1+0.2*c4);
                        mapheight=mapheights*(1+0.2*c4);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=45.6 &&Number(document.getElementById('cameraPosY').innerHTML)<50){
                        mapwidth=mapwidths*(1+0.2*c5);
                        mapheight=mapheights*(1+0.2*c5);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=50 &&Number(document.getElementById('cameraPosY').innerHTML)<58.8){
                        mapwidth=mapwidths*(1+0.2*c6);
                        mapheight=mapheights*(1+0.2*c6);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=58.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                        mapwidth=mapwidths*(1+0.2*c7);
                        mapheight=mapheights*(1+0.2*c7);
                    }

                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 && Number(document.getElementById('cameraPosY').innerHTML) <6){
                        mapwidth=mapwidths*(1+0.2*d1);
                        mapheight=mapheights*(1+0.2*d1);
                    }
                    else if((Number(document.getElementById('cameraPosY').innerHTML) >=6 && Number(document.getElementById('cameraPosY').innerHTML) <10.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 && Number(document.getElementById('cameraPosY').innerHTML) <19.2)||(Number(document.getElementById('cameraPosY').innerHTML) >=23.6 && Number(document.getElementById('cameraPosY').innerHTML) <28)||(Number(document.getElementById('cameraPosY').innerHTML) >=32.4 && Number(document.getElementById('cameraPosY').innerHTML) <36.8)){
                        mapwidth=mapwidths*(1+0.2*d2);
                        mapheight=mapheights*(1+0.2*d2);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=10.4 && Number(document.getElementById('cameraPosY').innerHTML) <14.8||(Number(document.getElementById('cameraPosY').innerHTML) >=19.2 && Number(document.getElementById('cameraPosY').innerHTML) <23.6)||(Number(document.getElementById('cameraPosY').innerHTML) >=28 && Number(document.getElementById('cameraPosY').innerHTML) <32.4)||(Number(document.getElementById('cameraPosY').innerHTML) >=36.8 && Number(document.getElementById('cameraPosY').innerHTML) <41.3)){
                        mapwidth=mapwidths*(1+0.2*d3);
                        mapheight=mapheights*(1+0.2*d3);
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=41.3 && Number(document.getElementById('cameraPosY').innerHTML) <=46){
                        mapwidth=mapwidths*(1+0.2*d4);
                        mapheight=mapheights*(1+0.2*d4);
                    }

                }

            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                mapwidth=mapwidths*(1+0.2*l1);
                mapheight=mapheights*(1+0.2*l1);
            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-10.2&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                mapwidth=mapwidths*(1+0.2*l2);
                mapheight=mapheights*(1+0.2*l2);
            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-10.3){
                mapwidth=mapwidths*(1+0.2*l3);
                mapheight=mapheights*(1+0.2*l3);
            }
        }


    }

    function pos(){
        if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
            X=Number(document.getElementById('cameraPosX').innerHTML)/132.15*mapwidth+x*width/2;
            Z=Number(document.getElementById('cameraPosZ').innerHTML)/164.2*mapheight+y*width/2;
            pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/132.15*mapwidth;
            pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/164.2*mapheight;
            document.getElementById('cameraPosX').innerHTML=X/mapwidth*132.15;
            document.getElementById('cameraPosZ').innerHTML=Z/mapheight*164.2;
        }
        else{
            if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                    X=Number(document.getElementById('cameraPosX').innerHTML)/56.6*mapwidth+x*width/2;
                    Z=Number(document.getElementById('cameraPosZ').innerHTML)/37.4*mapheight+y*width/2;
                    pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/56.6*mapwidth;
                    pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/37.4*mapheight;
                    document.getElementById('cameraPosX').innerHTML=X/mapwidth*56.6;
                    document.getElementById('cameraPosZ').innerHTML=Z/mapheight*37.4;
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        X=Number(document.getElementById('cameraPosX').innerHTML)/59.7*mapwidth+x*width/2;
                        Z=Number(document.getElementById('cameraPosZ').innerHTML)/73.5*mapheight+y*width/2;
                        pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/59.7*mapwidth;
                        pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/73.5*mapheight;
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*59.7;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*73.5;
                    }

                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        X=Number(document.getElementById('cameraPosX').innerHTML)/37.4*mapwidth+x*width/2;
                        Z=Number(document.getElementById('cameraPosZ').innerHTML)/59.4*mapheight+y*width/2;
                        pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/37.4*mapwidth;
                        pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/59.4*mapheight;
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*37.4;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*59.4;
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        X=Number(document.getElementById('cameraPosX').innerHTML)/37.4*mapwidth+x*width/2;
                        Z=Number(document.getElementById('cameraPosZ').innerHTML)/57*mapheight+y*width/2;
                        pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/37.4*mapwidth;
                        pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/57*mapheight;
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*37.4;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*57;
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                        X=Number(document.getElementById('cameraPosX').innerHTML)/64.8*mapwidth+x*width/2;
                        Z=Number(document.getElementById('cameraPosZ').innerHTML)/34.1*mapheight+y*width/2;
                        pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/64.8*mapwidth;
                        pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/34.1*mapheight;
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*64.8;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*34.1;
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                        X=Number(document.getElementById('cameraPosX').innerHTML)/64.7*mapwidth+x*width/2;
                        Z=Number(document.getElementById('cameraPosZ').innerHTML)/34.6*mapheight+y*width/2;
                        pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/64.7*mapwidth;
                        pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/34.6*mapheight;
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*64.7;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*34.6;
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                        X=Number(document.getElementById('cameraPosX').innerHTML)/48.4*mapwidth+x*width/2;
                        Z=Number(document.getElementById('cameraPosZ').innerHTML)/34.6*mapheight+y*width/2;
                        pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/48.4*mapwidth;
                        pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/34.6*mapheight;
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*48.4;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*34.6;
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                    X=Number(document.getElementById('cameraPosX').innerHTML)/31.8*mapwidth+x*width/2;
                    Z=Number(document.getElementById('cameraPosZ').innerHTML)/40.2*mapheight+y*width/2;
                    pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/31.8*mapwidth;
                    pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/40.2*mapheight;
                    document.getElementById('cameraPosX').innerHTML=X/mapwidth*31.8;
                    document.getElementById('cameraPosZ').innerHTML=Z/mapheight*40.2;
                }

            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-6.3&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                X=Number(document.getElementById('cameraPosX').innerHTML)/129.35*mapwidth+x*width/2;
                Z=Number(document.getElementById('cameraPosZ').innerHTML)/161.4*mapheight+y*width/2;
                pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/129.35*mapwidth;
                pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/161.4*mapheight;
                document.getElementById('cameraPosX').innerHTML=X/mapwidth*129.35;
                document.getElementById('cameraPosZ').innerHTML=Z/mapheight*161.4;
            }
            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=-6.4){
                X=Number(document.getElementById('cameraPosX').innerHTML)/129.35*mapwidth+x*width/2;
                Z=Number(document.getElementById('cameraPosZ').innerHTML)/159.95*mapheight+y*width/2;
                pointstartX=Number(document.getElementById('cameraPosX').innerHTML)/129.35*mapwidth;
                pointstartZ=Number(document.getElementById('cameraPosZ').innerHTML)/159.95*mapheight;
                document.getElementById('cameraPosX').innerHTML=X/mapwidth*129.35;
                document.getElementById('cameraPosZ').innerHTML=Z/mapheight*159.95;
            }
        }

        document.getElementById('X').innerHTML=X;document.getElementById('Z').innerHTML=Z;
        pointXArr.push(pointstartX);
        pointZArr.push(pointstartZ);
        time=Math.ceil(Math.sqrt(Math.pow(Math.abs(pointstartX-X),2)+Math.pow(Math.abs(pointstartZ-Z),2))*100);

        timeArr.push(time);
        console.log(timeArr,pointXArr,pointZArr);
    }

    function poss(){
        if(document.getElementById('waitiif').innerHTML==''||document.getElementById('waitiif').innerHTML=='A-ext'||document.getElementById('waitiif').innerHTML=='B-ext'||document.getElementById('waitiif').innerHTML=='C-ext'||document.getElementById('waitiif').innerHTML=='D-ext') {
            document.getElementById('cameraPosX').innerHTML=X/mapwidth*131.3;
            document.getElementById('cameraPosZ').innerHTML=Z/mapheight*163.7;
        }
        else{
            if(Number(document.getElementById('cameraPosY').innerHTML)>0&&Number(document.getElementById('cameraPosY').innerHTML)<=66){

                if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)>-54){
                    document.getElementById('cameraPosX').innerHTML=X/mapwidth*56.6;
                    document.getElementById('cameraPosZ').innerHTML=Z/mapheight*37.4;
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)<-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-54){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=-0.1 && Number(document.getElementById('cameraPosY').innerHTML) <9.9){
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*59.7;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*73.5;
                    }

                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=9.9&& Number(document.getElementById('cameraPosY').innerHTML) <14.3){
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*37.4;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*59.4;
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.3 && Number(document.getElementById('cameraPosY').innerHTML) <=65){
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*37.4;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*57;
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)<=-30){
                    if(Number(document.getElementById('cameraPosY').innerHTML) >=0.4 &&Number(document.getElementById('cameraPosY').innerHTML)<6){
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*64.8;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*34.1;
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=6 &&Number(document.getElementById('cameraPosY').innerHTML)<14.8){
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*64.7;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*34.6;
                    }
                    else if(Number(document.getElementById('cameraPosY').innerHTML) >=14.8 &&Number(document.getElementById('cameraPosY').innerHTML)<=65){
                        document.getElementById('cameraPosX').innerHTML=X/mapwidth*48.4;
                        document.getElementById('cameraPosZ').innerHTML=Z/mapheight*34.6;
                    }
                }


                else if(Number(document.getElementById('cameraPosZ').innerHTML)>=-40&&Number(document.getElementById('cameraPosX').innerHTML)>-30){
                    document.getElementById('cameraPosX').innerHTML=X/mapwidth*31.8;
                    document.getElementById('cameraPosZ').innerHTML=Z/mapheight*40.2;
                }

            }

            else if(Number(document.getElementById('cameraPosY').innerHTML) >=-15&&Number(document.getElementById('cameraPosY').innerHTML) <=0){
                document.getElementById('cameraPosX').innerHTML=X/mapwidth*131.3;
                document.getElementById('cameraPosZ').innerHTML=Z/mapheight*163.7;
            }
        }

        requestAnimationFrame(poss);
    }
    //动画效果
    var line,p1,p2,time;
    var lineArr=[],timeArr=[],pointXArr=[],pointZArr=[];
    var Jiantoumove,Circlemove,Cameramove;
    var t=0;
    var rl;
    var point1=new THREE.Mesh(new THREE.CircleGeometry(5, 15, 0, Math.PI * 2),new THREE.MeshBasicMaterial({color:0x00FF00}));
    var point2=new THREE.Mesh(new THREE.CircleGeometry(5, 15, 0, Math.PI * 2),new THREE.MeshBasicMaterial({color:0xFF0000}));
    point1.material.side = THREE.DoubleSide;
    point1.rotation.set(Math.PI / 2, 0, 0);
    point2.material.side = THREE.DoubleSide;
    point2.rotation.set(Math.PI / 2, 0, 0);

    function  move(){

        if(t>=2){
            TWEEN.removeAll();
        }
        document.getElementById("Time").innerHTML=timeArr[timeArr.length-1];

        Jiantoumove=new TWEEN.Tween(Jiantou.position).to({x:X,z:Z},timeArr[timeArr.length-1]).start();
        Circlemove=new TWEEN.Tween(circle.position).to({x:X,z:Z},timeArr[timeArr.length-1]).start();
        Cameramove=new TWEEN.Tween(mapCamera.position).to({x:X,z:Z},timeArr[timeArr.length-1]).start();
    }

    //获取当前位置以及终点位置所属的块
    function getnowkuai(){
        var startminj=(-startposX-2+254+Number(document.getElementById('cameraPosX').innerHTML) /131.3*512)/4;
        var startmaxj=(-startposX+2+254+Number(document.getElementById('cameraPosX').innerHTML) /131.3*512)/4;
        var startmini=(-startposZ-2+254+Number(document.getElementById('cameraPosZ').innerHTML) /163.7*512)/4;
        var startmaxi=(-startposZ+2+254+Number(document.getElementById('cameraPosZ').innerHTML) /163.7*512)/4;

        var endminj=(-startposX-2+254+X)/4;
        var endmaxj=(-startposX+2+254+X)/4;
        var endmini=(-startposZ-2+254+Z)/4;
        var endmaxi=(-startposZ+2+254+Z)/4;
        if(startmaxj-startminj>=0.5){
            startJ=parseInt(startmaxj);
        }else{
            startJ=parseInt(startminj);
        }
        if(startmaxi-startmini>=0.5){
            startI=parseInt(startmaxi);
        }else{
            startI=parseInt(startmini);
        }

        if(endmaxj-endminj>=0.5){
            endJ=parseInt(endmaxj);
        }else{
            endJ=parseInt(endminj);
        }
        if(endmaxi-endmini>=0.5){
            endI=parseInt(endmaxi);
        }else{
            endI=parseInt(endmini);
        }

        console.log(startI,startJ);
    }
    //获取四周块
    var posArr=[];
    function getpos(){
        var up=null;
        var down=null;
        var right=null;
        var left=null;

        if(startI<0||startI>127||startJ<0||startJ>127||endI<0||endI>127||endI<0||endI>127){
            return false;//请在指定位置寻路并检查起点终点是否存在
        }else {
            if(startI-1>=0){
                up=fangkuaiL1Arr[startJ][startI-1];
                posArr.push(up);
            }
            if(startJ-1>=0){
                left=fangkuaiL1Arr[startJ-1][startI];
                posArr.push(left);
            }
            if(startI+1<=127){
                down=fangkuaiL1Arr[startJ][startI+1];
                posArr.push(down);
            }
            if(startJ+1<=127){
                right=fangkuaiL1Arr[startJ+1][startI];
                posArr.push(right);
            }
        }

        return posArr;
    }
    //检测是否在列表中
    function iflist(){
        for(var i=0;i<list.length;i++){
            if(startJ == list[i].row && startI == list[i].col){
                return true;
            }
        }
        return false;
    }

    function way(start,end){
        var opens=[];
        var close=[];
        var cur=null;

        var ifFind=true;
        start.F=0;
        start.G=0;
        start.H=0;

        //将起点放入close数组，指针cur指向起点
        close.push(start);
        cur=start;

        //如果起始点紧邻结束点则不计算路径，直接将起点和尾点放入close数组
        if(Math.abs(start.row - end.row) + Math.abs(start.col - end.col) == 1){
            end.P = start;
            closes.push(end);
            ifFind = false;
        }
        //计算路径
        while(cur&&ifFind){
            //如果当前元素不在close中，则将其加入close
            if(!iflist(close,cur))
                close.push(cur);
            //获取四周点
            getpos();
            //若周围点不在open中且可移动，设置FGH和父集P，并加入open中
            for(var i=0;i<posArr.length;i++){
                if(posArr[i].val==1){

                }
            }
        }
    }
    //路径
    function makeline(){
        isMove=true;
        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial({vertexColors: true});
        var color = new THREE.Color(0x000000);
        p1 = new THREE.Vector3(pointstartX, 20, pointstartZ);
        p2 = new THREE.Vector3(X, 20, Z);
        geometry.vertices.push(p2);
        geometry.vertices.push(p1);
        geometry.colors.push(color, color);
        line = new THREE.Line(geometry, material, THREE.LinePieces);
        line.name=t;

        point1.position.set(pointstartX, 20, pointstartZ);
        point2.position.set(X, 20, Z);

        lineArr.push(line);
        mapScene.add(line);
        mapScene.add(point1);
        mapScene.add(point2);
    }

    function removeline(){

        if(lineArr.length==1){

            rl=setTimeout(function(){mapScene.remove(lineArr[0]);mapScene.remove(point1);mapScene.remove(point2);lineArr.splice(0,1);isMove=false;},timeArr[timeArr.length-1]);
            setTimeout(function(){console.log(lineArr)},timeArr[timeArr.length-1]);
        }

        if(lineArr.length>=2){

            clearTimeout(rl);
            mapScene.remove(lineArr[0]);lineArr.splice(0,1);
            rl=setTimeout(function(){mapScene.remove(lineArr[0]);mapScene.remove(point1);mapScene.remove(point2);lineArr.splice(0,1);isMove=false;},timeArr[timeArr.length-1]);

        }

    }


    //$('#Map-output').click(function (e) {
    //    t=t+1;
    //    e = event || window.event;
    //    document.getElementById('Map-output').addEventListener('click', false);
    //    var rect = e.target.getBoundingClientRect();
    //
    //    var x1 = e.clientX;
    //    var y1 = e.clientY;
    //    y = (x1 - rect.left + width / 2) / width * 2-2;
    //    x = -(-width / 2 + y1 - rect.top) / width * 2;
    //
    //    bili();
    //    pos();
    //    //poss();
    //    makeline();
    //    move();
    //    removeline();
    //
    //    document.getElementById('isClickMap').innerHTML = "1";
    //});

    $("#Map-output").append(mapRenderer.domElement);
})