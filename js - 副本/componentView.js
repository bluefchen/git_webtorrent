/**
 * Created by sse316 on 10/22/2016.
 */

$(function() {

    var renderer = new THREE.WebGLRenderer({alpha: true});
    $("#Component-output").append(renderer.domElement);
    renderer.setSize(250,250);
    renderer.setClearColor( 0x000000,0.1 );

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45,1,0.1,100);
    camera.position.set(0,0,50);
    
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);

    // var boxGeo = new THREE.BoxGeometry(10,10,10);
    // var boxMesh = new THREE.Mesh(boxGeo,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
    window.displayComponent = new THREE.Mesh();
    scene.add(window.displayComponent);

    var isLeft = false,
        isRight = false;
    
    render();
    function render()
    {
        if(window.isDisplayNewComponent)
        {
            window.isDisplayNewComponent = false;
            scene.remove(scene.children[1]);
            scene.add(window.displayComponent);
        }
        renderer.render(scene,camera);
        if(isLeft) {
            window.displayComponent.rotation.set(window.displayComponent.rotation.x,window.displayComponent.rotation.y+0.05,window.displayComponent.rotation.z);
        }
        if(isRight){
            window.displayComponent.rotation.set(window.displayComponent.rotation.x,window.displayComponent.rotation.y-0.05,window.displayComponent.rotation.z);
        }
        requestAnimationFrame(render);
    }


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

    document.getElementById('left_rotate').addEventListener('mousedown',function () {
        isLeft = true;
    })
    document.getElementById('left_rotate').addEventListener('mouseup',function () {
        isLeft = false;
    })
    document.getElementById('right_rotate').addEventListener('mousedown',function () {
        isRight = true;
    })
    document.getElementById('right_rotate').addEventListener('mouseup',function () {
        isRight = false ;
    })
    document.getElementById('reset_rotate').addEventListener('click',function () {
        window.displayComponent.rotation.set(0,0,0);
        window.displayComponent.scale.set(1,1,1);
    })
    document.getElementById('zoom_in').addEventListener('click',function () {
        window.displayComponent.scale.set(window.displayComponent.scale.x*1.1,window.displayComponent.scale.y*1.1,window.displayComponent.scale.z*1.1);
    })
    document.getElementById('zoom_out').addEventListener('click',function () {
        window.displayComponent.scale.set(window.displayComponent.scale.x*0.9,window.displayComponent.scale.y*0.9,window.displayComponent.scale.z*0.9);
    })
})