/**
 * @author arodic / https://github.com/arodic
 */
( function () {

    'use strict';

    var GizmoMaterial = function ( parameters ) {

        THREE.MeshBasicMaterial.call( this );

        this.depthTest = false;
        this.depthWrite = false;
        this.side = THREE.FrontSide;
        this.transparent = true;

        this.setValues( parameters );

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function( highlighted ) {

            if ( highlighted ) {

                this.color.setRGB( 1, 1, 0 );
                this.opacity = 1;

            } else {

                this.color.copy( this.oldColor );
                this.opacity = this.oldOpacity;

            }

        };

    };

    GizmoMaterial.prototype = Object.create( THREE.MeshBasicMaterial.prototype );
    GizmoMaterial.prototype.constructor = GizmoMaterial;


    var GizmoLineMaterial = function ( parameters ) {

        THREE.LineBasicMaterial.call( this );

        this.depthTest = false;
        this.depthWrite = false;
        this.transparent = true;
        this.linewidth = 1;

        this.setValues( parameters );

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function( highlighted ) {

            if ( highlighted ) {

                this.color.setRGB( 1, 1, 0 );
                this.opacity = 1;

            } else {

                this.color.copy( this.oldColor );
                this.opacity = this.oldOpacity;

            }

        };

    };

    GizmoLineMaterial.prototype = Object.create( THREE.LineBasicMaterial.prototype );
    GizmoLineMaterial.prototype.constructor = GizmoLineMaterial;


    var pickerMaterial = new GizmoMaterial( { visible: false, transparent: false } );


    THREE.TransformGizmo = function () {

        var scope = this;

        this.init = function () {

            THREE.Object3D.call( this );

            this.handles = new THREE.Object3D();
            this.pickers = new THREE.Object3D();
            this.planes = new THREE.Object3D();
            ////////document.getElementById('ss1').innerHTML=this.pickers;

            this.add( this.handles );
            this.add( this.pickers );
            this.add( this.planes );

            //// PLANES

            var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 2, 2 );
            var planeMaterial = new THREE.MeshBasicMaterial( { visible: false, side: THREE.DoubleSide } );

            var planes = {
                "XY":   new THREE.Mesh( planeGeometry, planeMaterial ),
                "YZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
                "XZ":   new THREE.Mesh( planeGeometry, planeMaterial ),
                "XYZE": new THREE.Mesh( planeGeometry, planeMaterial )
            };

            this.activePlane = planes[ "XYZE" ];

            planes[ "YZ" ].rotation.set( 0, Math.PI / 2, 0 );
            planes[ "XZ" ].rotation.set( - Math.PI / 2, 0, 0 );

            for ( var i in planes ) {

                planes[ i ].name = i;
                this.planes.add( planes[ i ] );
                this.planes[ i ] = planes[ i ];

            }

            //// HANDLES AND PICKERS

            var setupGizmos = function( gizmoMap, parent ) {

                for ( var name in gizmoMap ) {

                    for ( i = gizmoMap[ name ].length; i --; ) {

                        var object = gizmoMap[ name ][ i ][ 0 ];
                        var position = gizmoMap[ name ][ i ][ 1 ];
                        var rotation = gizmoMap[ name ][ i ][ 2 ];

                        object.name = name;

                        if ( position ) object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
                        if ( rotation ) object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );

                        parent.add( object );

                    }

                }

            };

            setupGizmos( this.handleGizmos, this.handles );
            setupGizmos( this.pickerGizmos, this.pickers );

            // reset Transformations

            this.traverse( function ( child ) {

                if ( child instanceof THREE.Mesh ) {

                    child.updateMatrix();

                    var tempGeometry = child.geometry.clone();
                    tempGeometry.applyMatrix( child.matrix );
                    child.geometry = tempGeometry;

                    child.position.set( 0, 0, 0 );
                    child.rotation.set( 0, 0, 0 );
                    child.scale.set( 1, 1, 1 );

                }

            } );

        };



        this.highlight = function ( axis ) {

            this.traverse( function( child ) {

                if ( child.material && child.material.highlight ) {

                    if ( child.name === axis ) {

                        child.material.highlight( true );

                    } else {

                        child.material.highlight( false );

                    }

                }



            } );

        };

    };

    THREE.TransformGizmo.prototype = Object.create( THREE.Object3D.prototype );
    THREE.TransformGizmo.prototype.constructor = THREE.TransformGizmo;

    THREE.TransformGizmo.prototype.update = function ( rotation, eye ) {

        var vec1 = new THREE.Vector3( 0, 0, 0 );
        var vec2 = new THREE.Vector3( 0, 1, 0 );
        var lookAtMatrix = new THREE.Matrix4();

        this.traverse( function( child ) {

            if ( child.name.search( "E" ) !== - 1 ) {

                child.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( eye, vec1, vec2 ) );

            } else if ( child.name.search( "X" ) !== - 1 || child.name.search( "Y" ) !== - 1 || child.name.search( "Z" ) !== - 1 ) {

                child.quaternion.setFromEuler( rotation );

            }

        } );

    };

    THREE.TransformGizmoTranslate = function () {

        THREE.TransformGizmo.call( this );

        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.CylinderGeometry( 0, 0.05, 0.2, 12, 1, false ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {

            X: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [	new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.1, 0 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xffff00, opacity: 0.25 } ) ), [ 0.15, 0.15, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0x00ffff, opacity: 0.25 } ) ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.29, 0.29 ), new GizmoMaterial( { color: 0xff00ff, opacity: 0.25 } ) ), [ 0.15, 0, 0.15 ], [ - Math.PI / 2, 0, 0 ] ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronGeometry( 0.2, 0 ), pickerMaterial ) ]
            ],

            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0.2, 0 ] ]
            ],

            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
            ],

            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), pickerMaterial ), [ 0.2, 0, 0.2 ], [ - Math.PI / 2, 0, 0 ] ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {

                this.activePlane = this.planes[ "XY" ];

                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

            }

            if ( axis === "Y" ) {

                this.activePlane = this.planes[ "XY" ];

                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];

                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

            if ( axis === "XY" ) this.activePlane = this.planes[ "XY" ];

            if ( axis === "YZ" ) this.activePlane = this.planes[ "YZ" ];

            if ( axis === "XZ" ) this.activePlane = this.planes[ "XZ" ];

        };

        this.init();

    };

    THREE.TransformGizmoTranslate.prototype = Object.create( THREE.TransformGizmo.prototype );
    THREE.TransformGizmoTranslate.prototype.constructor = THREE.TransformGizmoTranslate;

    THREE.TransformGizmoRotate = function () {

        THREE.TransformGizmo.call( this );

        var CircleGeometry = function ( radius, facing, arc ) {

            var geometry = new THREE.BufferGeometry();
            var vertices = [];
            arc = arc ? arc : 1;

            for ( var i = 0; i <= 64 * arc; ++ i ) {

                if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );

            }

            geometry.addAttribute( 'position', new THREE.Float32Attribute( vertices, 3 ) );
            return geometry;

        };

        this.handleGizmos = {

            X: [
                [ new THREE.Line( new CircleGeometry( 1, 'x', 0.5 ), new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Line( new CircleGeometry( 1, 'y', 0.5 ), new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 0.5 ), new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            E: [
                [ new THREE.Line( new CircleGeometry( 1.25, 'z', 1 ), new GizmoLineMaterial( { color: 0xcccc00 } ) ) ]
            ],

            XYZE: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 1 ), new GizmoLineMaterial( { color: 0x787878 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI ), pickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            E: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1.25, 0.12, 2, 24 ), pickerMaterial ) ]
            ],

            XYZE: [
                [ new THREE.Mesh( new THREE.Geometry() ) ]// TODO
            ]

        };

        this.setActivePlane = function ( axis ) {

            if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];

            if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];

            if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];

            if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];

        };

        this.update = function ( rotation, eye2 ) {

            THREE.TransformGizmo.prototype.update.apply( this, arguments );

            var group = {

                handles: this[ "handles" ],
                pickers: this[ "pickers" ],

            };

            var tempMatrix = new THREE.Matrix4();
            var worldRotation = new THREE.Euler( 0, 0, 1 );
            var tempQuaternion = new THREE.Quaternion();
            var unitX = new THREE.Vector3( 1, 0, 0 );
            var unitY = new THREE.Vector3( 0, 1, 0 );
            var unitZ = new THREE.Vector3( 0, 0, 1 );
            var quaternionX = new THREE.Quaternion();
            var quaternionY = new THREE.Quaternion();
            var quaternionZ = new THREE.Quaternion();
            var eye = eye2.clone();

            worldRotation.copy( this.planes[ "XY" ].rotation );
            tempQuaternion.setFromEuler( worldRotation );

            tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
            eye.applyMatrix4( tempMatrix );

            this.traverse( function( child ) {

                tempQuaternion.setFromEuler( worldRotation );

                if ( child.name === "X" ) {

                    quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    child.quaternion.copy( tempQuaternion );

                }

                if ( child.name === "Y" ) {

                    quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                    child.quaternion.copy( tempQuaternion );

                }

                if ( child.name === "Z" ) {

                    quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
                    child.quaternion.copy( tempQuaternion );

                }

            } );

        };

        this.init();

    };

    THREE.TransformGizmoRotate.prototype = Object.create( THREE.TransformGizmo.prototype );
    THREE.TransformGizmoRotate.prototype.constructor = THREE.TransformGizmoRotate;

    THREE.TransformGizmoScale = function () {

        THREE.TransformGizmo.call( this );

        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {

            X: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new GizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [ new THREE.Line( lineYGeometry, new GizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new GizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new GizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.125, 0.125, 0.125 ), new GizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), pickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.4, 0.4, 0.4 ), pickerMaterial ) ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

            }

            if ( axis === "Y" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

        };

        this.init();

    };

    THREE.TransformGizmoScale.prototype = Object.create( THREE.TransformGizmo.prototype );
    THREE.TransformGizmoScale.prototype.constructor = THREE.TransformGizmoScale;

    THREE.TransformControls = function ( camera, domElement ) {

        // TODO: Make non-uniform scale and rotate play nice in hierarchies
        // TODO: ADD RXYZ contol

        THREE.Object3D.call( this );

        domElement = ( domElement !== undefined ) ? domElement : document;

        this.object = undefined;
        this.visible = false;
        this.translationSnap = null;
        this.rotationSnap = null;
        this.space = "world";
        this.size = 1;
        this.axis = null;

        var scope = this;

        var _mode = "translate";
        var _dragging = false;
        var _plane = "XY";
        var _gizmo = {

            "translate": new THREE.TransformGizmoTranslate(),
            "rotate": new THREE.TransformGizmoRotate(),
            "scale": new THREE.TransformGizmoScale()
        };

        for ( var type in _gizmo ) {

            var gizmoObj = _gizmo[ type ];

            gizmoObj.visible = ( type === _mode );
            this.add( gizmoObj );

        }

        var changeEvent = { type: "change" };
        var mouseDownEvent = { type: "mouseDown" };
        var mouseUpEvent = { type: "mouseUp", mode: _mode };
        var objectChangeEvent = { type: "objectChange" };

        var ray = new THREE.Raycaster();
        var pointerVector = new THREE.Vector2();

        var point = new THREE.Vector3();
        var offset = new THREE.Vector3();

        var rotation = new THREE.Vector3();
        var offsetRotation = new THREE.Vector3();
        var scale = 1;

        var lookAtMatrix = new THREE.Matrix4();
        var eye = new THREE.Vector3();

        var tempMatrix = new THREE.Matrix4();
        var tempVector = new THREE.Vector3();
        var tempQuaternion = new THREE.Quaternion();
        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );

        var quaternionXYZ = new THREE.Quaternion();
        var quaternionX = new THREE.Quaternion();
        var quaternionY = new THREE.Quaternion();
        var quaternionZ = new THREE.Quaternion();
        var quaternionE = new THREE.Quaternion();

        var oldPosition = new THREE.Vector3();
        var oldScale = new THREE.Vector3();
        var oldRotationMatrix = new THREE.Matrix4();

        var parentRotationMatrix  = new THREE.Matrix4();
        var parentScale = new THREE.Vector3();

        var worldPosition = new THREE.Vector3();
        var worldRotation = new THREE.Euler();
        var worldRotationMatrix  = new THREE.Matrix4();
        var camPosition = new THREE.Vector3();
        var camRotation = new THREE.Euler();

        domElement.addEventListener( "mousedown", onPointerDown, false );
        domElement.addEventListener( "touchstart", onPointerDown, false );

        domElement.addEventListener( "mousemove", onPointerHover, false );
        domElement.addEventListener( "touchmove", onPointerHover, false );

        domElement.addEventListener( "mousemove", onPointerMove, false );
        domElement.addEventListener( "touchmove", onPointerMove, false );

        domElement.addEventListener( "mouseup", onPointerUp, false );
        domElement.addEventListener( "mouseout", onPointerUp, false );
        domElement.addEventListener( "touchend", onPointerUp, false );
        domElement.addEventListener( "touchcancel", onPointerUp, false );
        domElement.addEventListener( "touchleave", onPointerUp, false );

        this.dispose = function () {

            domElement.removeEventListener( "mousedown", onPointerDown );
            domElement.removeEventListener( "touchstart", onPointerDown );

            domElement.removeEventListener( "mousemove", onPointerHover );
            domElement.removeEventListener( "touchmove", onPointerHover );

            domElement.removeEventListener( "mousemove", onPointerMove );
            domElement.removeEventListener( "touchmove", onPointerMove );

            domElement.removeEventListener( "mouseup", onPointerUp );
            domElement.removeEventListener( "mouseout", onPointerUp );
            domElement.removeEventListener( "touchend", onPointerUp );
            domElement.removeEventListener( "touchcancel", onPointerUp );
            domElement.removeEventListener( "touchleave", onPointerUp );

        };

        this.attach = function ( object ) {

            this.object = object;
            this.centerPos = object.centerPosition;
            this.visible = true;
            this.update();

        };

        this.detach = function () {

            this.object = undefined;
            this.visible = false;
            this.axis = null;

        };

        this.getMode = function () {

            return _mode;

        };

        this.setMode = function ( mode ) {

            _mode = mode ? mode : _mode;

            if ( _mode === "scale" ) scope.space = "local";

            for ( var type in _gizmo ) _gizmo[ type ].visible = ( type === _mode );

            this.update();
            scope.dispatchEvent( changeEvent );

        };

        this.setTranslationSnap = function ( translationSnap ) {

            scope.translationSnap = translationSnap;

        };

        this.setRotationSnap = function ( rotationSnap ) {

            scope.rotationSnap = rotationSnap;

        };

        this.setSize = function ( size ) {

            scope.size = size;
            this.update();
            scope.dispatchEvent( changeEvent );

        };

        this.setSpace = function ( space ) {

            scope.space = space;
            this.update();
            scope.dispatchEvent( changeEvent );

        };

        this.update = function () {

            if ( scope.object === undefined ) return;

            scope.object.updateMatrixWorld();
            worldPosition.setFromMatrixPosition( scope.object.matrixWorld );
            worldRotation.setFromRotationMatrix( tempMatrix.extractRotation( scope.object.matrixWorld ) );

            camera.updateMatrixWorld();
            camPosition.setFromMatrixPosition( camera.matrixWorld );
            camRotation.setFromRotationMatrix( tempMatrix.extractRotation( camera.matrixWorld ) );

            scale = worldPosition.distanceTo( camPosition ) / 6 * scope.size;
            this.position.copy( worldPosition );
            this.scale.set( scale, scale, scale );

            eye.copy( camPosition ).sub( worldPosition ).normalize();

            if ( scope.space === "local" ) {

                _gizmo[ _mode ].update( worldRotation, eye );

            } else if ( scope.space === "world" ) {

                _gizmo[ _mode ].update( new THREE.Euler(), eye );

            }

            _gizmo[ _mode ].highlight( scope.axis );

        };

        function onPointerHover( event ) {

            if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

            var axis = null;

            if ( intersect ) {

                axis = intersect.object.name;

                event.preventDefault();

            }

            if ( scope.axis !== axis ) {

                scope.axis = axis;
                scope.update();
                scope.dispatchEvent( changeEvent );

            }

        }

        function onPointerDown( event ) {

            if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            if ( pointer.button === 0 || pointer.button === undefined ) {

                var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );

                if ( intersect ) {

                    event.preventDefault();
                    event.stopPropagation();

                    scope.dispatchEvent( mouseDownEvent );

                    scope.axis = intersect.object.name;

                    scope.update();

                    eye.copy( camPosition ).sub( worldPosition ).normalize();

                    _gizmo[ _mode ].setActivePlane( scope.axis, eye );

                    var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

                    if ( planeIntersect ) {

                        oldPosition.copy( scope.object.position );
                        oldScale.copy( scope.object.scale );

                        oldRotationMatrix.extractRotation( scope.object.matrix );
                        worldRotationMatrix.extractRotation( scope.object.matrixWorld );

                        parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );
                        parentScale.setFromMatrixScale( tempMatrix.getInverse( scope.object.parent.matrixWorld ) );

                        offset.copy( planeIntersect.point );

                    }

                }

            }

            _dragging = true;

        }

        function changeVerticeByRotating(obj)
        {
            var xAngle = obj.newRotation.x;
            var yAngle = obj.newRotation.y;
            var zAngle = obj.newRotation.z;
            var newX,newY,newZ,oldX,oldY,oldZ;
            obj.newVertices=[];
            for(var i=0;i<obj.vertices.length;i++)//////// X
            {
                obj.newVertices[i] = {};

                oldX = obj.vertices[i].x;
                oldY = obj.vertices[i].y;
                oldZ = obj.vertices[i].z;

                newY = Math.cos(xAngle)*oldY-Math.sin(xAngle)*oldZ;
                newZ = Math.sin(xAngle)*oldY+Math.cos(xAngle)*oldZ;
                obj.newVertices[i].x = oldX;
                obj.newVertices[i].y=newY;
                obj.newVertices[i].z=newZ;
            }

            for(var i=0;i<obj.vertices.length;i++)//////// Y
            {
                oldX = obj.newVertices[i].x;
                oldY = obj.newVertices[i].y;
                oldZ = obj.newVertices[i].z;
                newX = Math.cos(yAngle)*oldX+Math.sin(yAngle)*oldZ;
                newZ = -1*Math.sin(yAngle)*oldX+Math.cos(yAngle)*oldZ;
                obj.newVertices[i].x=newX;
                obj.newVertices[i].y=oldY;
                obj.newVertices[i].z=newZ;
            }

            for(var i=0;i<obj.vertices.length;i++)//////// Z
            {
                oldX = obj.newVertices[i].x;
                oldY = obj.newVertices[i].y;
                oldZ = obj.newVertices[i].z;
                newX = Math.cos(zAngle)*oldX-Math.sin(zAngle)*oldY;
                newY = Math.sin(zAngle)*oldX+Math.cos(zAngle)*oldY;
                obj.newVertices[i].x=newX;
                obj.newVertices[i].y=newY;
                obj.newVertices[i].z=oldZ;
            }


        }

        function changeAABBVerticeByRotating(obj)
        {
            var xAngle = obj.newRotation.x;
            var yAngle = obj.newRotation.y;
            var zAngle = obj.newRotation.z;
            var newX,newY,newZ,oldX,oldY,oldZ;
            obj.newAABBVertices=[];
            for(var i=0;i<obj.AABBVertices.length;i++)//////// X
            {
                obj.newAABBVertices[i] = {};
                oldX = obj.AABBVertices[i].x;
                oldY = obj.AABBVertices[i].y;
                oldZ = obj.AABBVertices[i].z;

                newY = Math.cos(xAngle)*oldY-Math.sin(xAngle)*oldZ;
                newZ = Math.sin(xAngle)*oldY+Math.cos(xAngle)*oldZ;
                obj.newAABBVertices[i].x = oldX;
                obj.newAABBVertices[i].y=newY;
                obj.newAABBVertices[i].z=newZ;
            }

            for(var i=0;i<obj.AABBVertices.length;i++)//////// Y
            {
                oldX = obj.newAABBVertices[i].x;
                oldY = obj.newAABBVertices[i].y;
                oldZ = obj.newAABBVertices[i].z;
                newX = Math.cos(yAngle)*oldX+Math.sin(yAngle)*oldZ;
                newZ = -1*Math.sin(yAngle)*oldX+Math.cos(yAngle)*oldZ;
                obj.newAABBVertices[i].x=newX;
                obj.newAABBVertices[i].y=oldY;
                obj.newAABBVertices[i].z=newZ;
            }

            for(var i=0;i<obj.AABBVertices.length;i++)//////// Z
            {
                oldX = obj.newAABBVertices[i].x;
                oldY = obj.newAABBVertices[i].y;
                oldZ = obj.newAABBVertices[i].z;
                newX = Math.cos(zAngle)*oldX-Math.sin(zAngle)*oldY;
                newY = Math.sin(zAngle)*oldX+Math.cos(zAngle)*oldY;
                obj.newAABBVertices[i].x=newX;
                obj.newAABBVertices[i].y=newY;
                obj.newAABBVertices[i].z=oldZ;
            }
        }
        function onPointerMove( event ) {

            if ( scope.object === undefined || scope.axis === null || _dragging === false || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

            if ( planeIntersect === false ) return;

            event.preventDefault();
            event.stopPropagation();

            point.copy( planeIntersect.point );

            if ( _mode === "translate" ) {

                point.sub( offset );
                point.multiply( parentScale );

                if ( scope.space === "local" ) {

                    point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
                    if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
                    if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

                    point.applyMatrix4( oldRotationMatrix );

                    scope.object.position.copy( oldPosition );
                    scope.object.position.add( point );

                }

                if ( scope.space === "world" || scope.axis.search( "XYZ" ) !== - 1 ) {

                    if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
                    if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
                    if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;

                    point.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );

                    scope.object.position.copy( oldPosition );
                    scope.object.position.add( point );

                }

                if ( scope.translationSnap !== null ) {

                    if ( scope.space === "local" ) {

                        scope.object.position.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    }

                    if ( scope.axis.search( "X" ) !== - 1 ) scope.object.position.x = Math.round( scope.object.position.x / scope.translationSnap ) * scope.translationSnap;
                    if ( scope.axis.search( "Y" ) !== - 1 ) scope.object.position.y = Math.round( scope.object.position.y / scope.translationSnap ) * scope.translationSnap;
                    if ( scope.axis.search( "Z" ) !== - 1 ) scope.object.position.z = Math.round( scope.object.position.z / scope.translationSnap ) * scope.translationSnap;

                    if ( scope.space === "local" ) {

                        scope.object.position.applyMatrix4( worldRotationMatrix );

                    }

                }
                if(1==1){
                    if(existCollison(scope.object,false))
                        console.log("collision");
                    else console.log("no collision");
                }
                else {
                    if(existCollison(scope.object,true))
                        console.log("collision");
                    else console.log("no collision");
                }




            } else if ( _mode === "scale" ) {

                point.sub( offset );
                point.multiply( parentScale );

                if ( scope.space === "local" ) {

                    if ( scope.axis === "XYZ" ) {

                        scale = 1 + ( ( point.y ) / Math.max( oldScale.x, oldScale.y, oldScale.z ) );

                        scope.object.scale.x = oldScale.x * scale;
                        scope.object.scale.y = oldScale.y * scale;
                        scope.object.scale.z = oldScale.z * scale;

                    } else {

                        point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                        if ( scope.axis === "X" ) scope.object.scale.x = oldScale.x * ( 1 + point.x / oldScale.x );
                        if ( scope.axis === "Y" ) scope.object.scale.y = oldScale.y * ( 1 + point.y / oldScale.y );
                        if ( scope.axis === "Z" ) scope.object.scale.z = oldScale.z * ( 1 + point.z / oldScale.z );

                    }

                }

            } else if ( _mode === "rotate" ) {

                point.sub( worldPosition );
                point.multiply( parentScale );
                tempVector.copy( offset ).sub( worldPosition );
                tempVector.multiply( parentScale );
                scope.object.rotation.x = 0;
                scope.object.rotation.y = 0;
                scope.object.rotation.z = 0;
                if ( scope.axis === "E" ) {

                    point.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );
                    tempVector.applyMatrix4( tempMatrix.getInverse( lookAtMatrix ) );

                    rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                    offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

                    quaternionE.setFromAxisAngle( eye, rotation.z - offsetRotation.z );
                    quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionE );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    scope.object.quaternion.copy( tempQuaternion );

                } else if ( scope.axis === "XYZE" ) {

                    quaternionE.setFromEuler( point.clone().cross( tempVector ).normalize() ); // rotation axis

                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );
                    quaternionX.setFromAxisAngle( quaternionE, - point.clone().angleTo( tempVector ) );
                    quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    scope.object.quaternion.copy( tempQuaternion );

                } else if ( scope.space === "local" ) {

                    point.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    tempVector.applyMatrix4( tempMatrix.getInverse( worldRotationMatrix ) );

                    rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                    offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                    quaternionXYZ.setFromRotationMatrix( oldRotationMatrix );

                    if ( scope.rotationSnap !== null ) {

                        quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

                    } else {

                        quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                        quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                        quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                    }

                    if ( scope.axis === "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
                    if ( scope.axis === "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
                    if ( scope.axis === "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

                    scope.object.quaternion.copy( quaternionXYZ );

                } else if ( scope.space === "world" ) {

                    rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                    offsetRotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );

                    tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse( parentRotationMatrix ) );

                    if ( scope.rotationSnap !== null ) {

                        quaternionX.setFromAxisAngle( unitX, Math.round( ( rotation.x - offsetRotation.x ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionY.setFromAxisAngle( unitY, Math.round( ( rotation.y - offsetRotation.y ) / scope.rotationSnap ) * scope.rotationSnap );
                        quaternionZ.setFromAxisAngle( unitZ, Math.round( ( rotation.z - offsetRotation.z ) / scope.rotationSnap ) * scope.rotationSnap );

                    } else {

                        quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                        quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                        quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                        //console.log("00000  "+(rotation.x - offsetRotation.x ) +" "+ (rotation.y - offsetRotation.y) +" "+(rotation.z - offsetRotation.z)+"");

                    }

                    quaternionXYZ.setFromRotationMatrix( worldRotationMatrix );

                    if ( scope.axis === "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    if ( scope.axis === "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                    if ( scope.axis === "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );

                    scope.object.newRotation = {x:(rotation.x - offsetRotation.x ), y:(rotation.y - offsetRotation.y),z:(rotation.z - offsetRotation.z)};

                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                    scope.object.quaternion.copy( tempQuaternion );

                }
                //console.log("aaaa  "+(scope.object.rotation.x - offsetRotation.x ) +" "+(scope.object.rotation.y - offsetRotation.y )+" "+(scope.object.rotation.z - offsetRotation.z )+"");///////
                //console.log("aaaa  "+scope.object.newRotation.x +" "+scope.object.newRotation.y+" "+scope.object.newRotation.z+"");///////
                if(1==0) {
                    changeVerticeByRotating(scope.object);
                    WorldAABBIndexXYZ(scope.object,0);

                    if(existCollison(scope.object,0))
                    {
                        console.log ("collision");
                    }
                    else     console.log ("no collision");
                }
                else {
                    changeAABBVerticeByRotating(scope.object);
                    if(existCollison(scope.object,1))
                    {
                        console.log ("OBB collision");
                    }
                    else    console.log ("no OBB collision");
                }
                //console.log("bbbb  "+scope.object.newVertices[0].x +" "+scope.object.newVertices[0].y+" "+scope.object.newVertices[0].z+" ");
                //console.log("cccc  "+scope.object.vertices[0].x +" "+scope.object.vertices[0].y+" "+scope.object.vertices[0].z+" ");
                //console.log("dddd "+scope.object.position.x);
            }

            scope.update();
            scope.dispatchEvent( changeEvent );
            scope.dispatchEvent( objectChangeEvent );

        }

        function onPointerUp( event ) {

            event.preventDefault(); // Prevent MouseEvent on mobile

            if ( event.button !== undefined && event.button !== 0 ) return;

            if ( _dragging && ( scope.axis !== null ) ) {

                mouseUpEvent.mode = _mode;
                scope.dispatchEvent( mouseUpEvent );

            }

            _dragging = false;

            //AABB包围盒，先关闭功能
            // if ( scope.object != undefined )
            // {   for(var i =0;i<scope.object.newVertices.length;i++)
            //     {
            //         //console.log(scope.object.newVertices.length);
            //         scope.object.vertices[i].x = scope.object.newVertices[i].x;
            //         scope.object.vertices[i].y = scope.object.newVertices[i].y;
            //         scope.object.vertices[i].z = scope.object.newVertices[i].z;
            //     }
            //     if(scope.object.newAABBVertices != undefined )
            //     {
            //         for(var i =0;i<8;i++)
            //         {
            //             //console.log(scope.object.newVertices.length);
            //             scope.object.AABBVertices[i].x = scope.object.newAABBVertices[i].x;
            //             scope.object.AABBVertices[i].y = scope.object.newAABBVertices[i].y;
            //             scope.object.AABBVertices[i].z = scope.object.newAABBVertices[i].z;
            //         }
            //     }
            // }


            if ( event instanceof TouchEvent ) {

                // Force "rollover"

                scope.axis = null;
                scope.update();
                scope.dispatchEvent( changeEvent );

            } else {

                onPointerHover( event );

            }


        }

        function intersectObjects( pointer, objects ) {

            var rect = domElement.getBoundingClientRect();
            var x = ( pointer.clientX - rect.left ) / rect.width;
            var y = ( pointer.clientY - rect.top ) / rect.height;

            pointerVector.set( ( x * 2 ) - 1, - ( y * 2 ) + 1 );
            ray.setFromCamera( pointerVector, camera );

            var intersections = ray.intersectObjects( objects, true );
            return intersections[ 0 ] ? intersections[ 0 ] : false;

        }

    };

    THREE.TransformControls.prototype = Object.create( THREE.Object3D.prototype );
    THREE.TransformControls.prototype.constructor = THREE.TransformControls;

}() );

var AllPolyhedrons =[];

function giveNewVertices(obj)
{
    if(obj.newVertices==undefined)
    {
        obj.newVertices = [];
        for (var i = 0; i < obj.vertices.length; i++) {
            obj.newVertices[i]={};
            obj.newVertices[i].x = obj.vertices[i].x;
            obj.newVertices[i].y = obj.vertices[i].y;
            obj.newVertices[i].z = obj.vertices[i].z;
        }
    }
}

function giveNewAABBVertices(obj)
{
    if(obj.newAABBVertices==undefined)
    {
        obj.newAABBVertices = [];
        for (var i = 0; i < obj.AABBVertices.length; i++) {
            obj.newAABBVertices[i]={};
            obj.newAABBVertices[i].x = obj.AABBVertices[i].x;
            obj.newAABBVertices[i].y = obj.AABBVertices[i].y;
            obj.newAABBVertices[i].z = obj.AABBVertices[i].z;
        }
    }
}


function cmpVertice(v1,v2)
{
    if(v1.z > v2.z)return -1;
    if(v1.z < v2.z)return +1;
    else
    {
        if(v1.y > v2.y)return -1;
        if(v1.y < v2.y)return +1;
        else
        {
            if(v1.x > v2.x)return -1;
            if(v1.x < v2.x)return +1;
            return 0;
        }
    }
}
function sortObjAABBVertices(obj)
{
    obj.AABBVertices.sort(cmpVertice);
}

function WorldAABBIndexXYZ(obj,needOBB)
{
    var  minx=Number.POSITIVE_INFINITY,miny=Number.POSITIVE_INFINITY,minz=Number.POSITIVE_INFINITY;
    var maxx=Number.NEGATIVE_INFINITY,maxy=Number.NEGATIVE_INFINITY,maxz=Number.NEGATIVE_INFINITY;
    giveNewVertices(obj);
    for (var i = 0; i < obj.newVertices.length; i++) {
        if ( minx > obj.newVertices[i].x)
            minx = obj.newVertices[i].x;
        if ( miny > obj.newVertices[i].y)
            miny = obj.newVertices[i].y;
        if ( minz > obj.newVertices[i].z)
            minz = obj.newVertices[i].z;
        if ( maxx <= obj.newVertices[i].x)
            maxx = obj.newVertices[i].x;
        if ( maxy <= obj.newVertices[i].y)
            maxy = obj.newVertices[i].y;
        if ( maxz<= obj.newVertices[i].z)
            maxz = obj.newVertices[i].z;
        obj.BoudaryOfAABB={};
        obj.BoudaryOfAABB.minx = minx;
        obj.BoudaryOfAABB.miny = miny;
        obj.BoudaryOfAABB.minz = minz;
        obj.BoudaryOfAABB.maxx = maxx;
        obj.BoudaryOfAABB.maxy = maxy;
        obj.BoudaryOfAABB.maxz = maxz;
    }
    if(needOBB)
    {
        obj.AABBVertices = [];
        obj.AABBVertices[0]={x:minx,y:miny,z:minz};
        obj.AABBVertices[1]={x:minx,y:miny,z:maxz};
        obj.AABBVertices[2]={x:minx,y:maxy,z:minz};
        obj.AABBVertices[3]={x:minx,y:maxy,z:maxz};
        obj.AABBVertices[4]={x:maxx,y:miny,z:minz};
        obj.AABBVertices[5]={x:maxx,y:miny,z:maxz};
        obj.AABBVertices[6]={x:maxx,y:maxy,z:minz};
        obj.AABBVertices[7]={x:maxx,y:maxy,z:maxz};
        sortObjAABBVertices(obj);
        giveNewAABBVertices(obj);
    }
}

function checkCollisonAABB(objSource, objTarget)
{
    console.log("source:");

    console.log("maxx "+(objSource.BoudaryOfAABB.maxx+objSource.position.x)+" maxy "+(objSource.BoudaryOfAABB.maxy+objSource.position.y)+" maxz "+(objSource.BoudaryOfAABB.maxz+objSource.position.z));
    console.log("minx "+(objSource.BoudaryOfAABB.minx+objSource.position.x)+" miny "+(objSource.BoudaryOfAABB.miny+objSource.position.y)+" minz "+(objSource.BoudaryOfAABB.minz+objSource.position.z));

    console.log("target:");

    console.log("maxx "+(objTarget.BoudaryOfAABB.maxx+objTarget.position.x)+" maxy "+(objTarget.BoudaryOfAABB.maxy+objTarget.position.y)+" maxz "+(objTarget.BoudaryOfAABB.maxz+objTarget.position.z));
    console.log("minx "+(objTarget.BoudaryOfAABB.minx+objTarget.position.x)+" miny "+(objTarget.BoudaryOfAABB.miny+objTarget.position.y)+" minz "+(objTarget.BoudaryOfAABB.minz+objTarget.position.z));
    return !(
        objSource.BoudaryOfAABB.maxx+objSource.position.x<objTarget.BoudaryOfAABB.minx+objTarget.position.x
        ||   objSource.BoudaryOfAABB.minx+objSource.position.x>objTarget.BoudaryOfAABB.maxx+objTarget.position.x
        || objSource.BoudaryOfAABB.maxy+objSource.position.y<objTarget.BoudaryOfAABB.miny+objTarget.position.y
        ||   objSource.BoudaryOfAABB.miny+objSource.position.y>objTarget.BoudaryOfAABB.maxy+objTarget.position.y
        || objSource.BoudaryOfAABB.maxz+objSource.position.z<objTarget.BoudaryOfAABB.minz+objTarget.position.z
        ||   objSource.BoudaryOfAABB.minz+objSource.position.z>objTarget.BoudaryOfAABB.maxz+objTarget.position.z
    );
}

function normalizeVector(v)
{
    var ans = Math.sqrt(v.x* v.x+ v.y* v.y+ v.z* v.z);
    v.x/=ans;
    v.y/=ans;
    v.z/=ans;
    return v;
}

function getEdgeDirection(obj, index)
{
    var vertices = obj.newAABBVertices;
    var tmpLine={};
    var t;
    switch(index)
    {
        case 0:// x轴方向
            t=1;
            break;
        case 1:// y轴方向
            t=2;
            break;
        case 2:// z轴方向
            t=4;
            break;
    }
    tmpLine.x = vertices[0].x - vertices[t].x;
    tmpLine.y = vertices[0].y - vertices[t].y;
    tmpLine.z = vertices[0].z - vertices[t].z;
    tmpLine = normalizeVector(tmpLine);
    return     tmpLine ;
}

function projectPoint(axis,vertice,obj)
{
    var x = obj.position.x+vertice.x;
    var y = obj.position.y+vertice.y;
    var z = obj.position.z+vertice.z;
    var dot=  axis.x*x+axis.y*y+axis.z*z;
    var length = Math.sqrt(x*x+y*y+z*z);
    return dot*1;
}

function getInterval(obj,axis) {
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    var value;
    for(var i = 1; i < 8; i++)
    {
        value = projectPoint(axis, obj.newAABBVertices[i],obj);
        min = Math.min(min, value);
        max = Math.max(max, value);
    }
   return {min:min,max :max};
}

function cross(v1,v2)
{
    var ans = {};
    ans.x = v1.y * v2.z - v1.z * v2.y;
    ans.y = v1.z* v2.x - v1.x * v2.z;
    ans.z = v1.x * v2.y - v1.y * v2.x;
    return normalizeVector(ans);
}
function checkCollisonOBB(objSource, objTarget)
{
    //objSource.newAABBVertices.sort(cmpVertice);
    var ans1={},ans2={};
    //当前包围盒的三个面方向 相当于取包围盒的三个坐标轴为分离轴并计算投影作比较
    for (var i = 0; i < 3; i++)
    {
        var tmpLine = getEdgeDirection(objSource,i);
        console.log("vvv "+tmpLine.x+" "+tmpLine.y+" "+tmpLine.z);
        ans1 = getInterval(objSource, tmpLine);//计算当前包围盒在某轴上的最大最小投影值
        ans2 = getInterval(objTarget,tmpLine);//计算另一个包围盒在某轴上的最大最小投影值
        if (ans1.max < ans2.min || ans2.max < ans1.min)
            return false; //判断分离轴上投影是否重合
    }
    //box包围盒的三个面方向
    for (var i = 0; i < 3; i++)
    {
        ans1 = getInterval(objSource, getEdgeDirection(objTarget,i));//计算当前包围盒在某轴上的最大最小投影值
        ans2 = getInterval(objTarget, getEdgeDirection(objTarget,i));//计算另一个包围盒在某轴上的最大最小投影值
        if (ans1.max < ans2.min || ans2.max < ans1.min)
            return false; //判断分离轴上投影是否重合
    }

    for (var i = 0; i < 3; i++)
    {
        for (var j = 0; j < 3; j++)
        {
            var axis={};
            //Vec3::cross(getFaceDirection(i), box.getFaceDirection(j), &axis); //2d-x源代码
            axis = cross(getEdgeDirection(objSource,i), getEdgeDirection(objTarget,j)); //修改，这里应该边的矢量并做叉积
            ans1 = getInterval(objSource, axis);
            ans2 = getInterval(objTarget, axis);
            if (ans1.max < ans2.min || ans2.max < ans1.min)
                return false; //判断分离轴上投影是否重合
        }
    }

    return true;
}


function chechCollison(objSource, objTarget,kind)
{
     if(kind==0)
         return checkCollisonAABB(objSource, objTarget);
     else return checkCollisonOBB(objSource, objTarget);
}

function existCollison(obj,kind)
{
    return false;
    for(var i = 0;i< AllPolyhedrons.length;i++)
    {
        if(obj.uuid  != AllPolyhedrons[i].uuid )
        {
            if(chechCollison(obj, AllPolyhedrons[i],kind))
            {
                return true;
            }
        }
    }
    return false;
}
