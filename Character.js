import * as THREE from 'three'

export class Character {

	// Character Constructor
	constructor(mColor) {
		// Create our cone geometry and material
		let coneGeo = new THREE.ConeGeometry(0.5, 1, 10);
		let coneMat = new THREE.MeshStandardMaterial({color: mColor});
		
		// Create the local cone mesh (of type Object3D)
		let mesh = new THREE.Mesh(coneGeo, coneMat);
		// Increment the y position so our cone is just atop the y origin
		mesh.position.y = mesh.position.y+0.5;
		// Rotate our X value of the mesh so it is facing the +z axis
		mesh.rotateX(Math.PI/2);

		// Add our mesh to a Group to serve as the game object
		this.gameObject = new THREE.Group();
		this.gameObject.add(mesh);		

		// Initialize movement variables
		this.location = new THREE.Vector3(0,0,0);
		this.velocity = new THREE.Vector3(0,0,0);
		this.acceleration = new THREE.Vector3(0, 0, 0);

		this.topSpeed = 5;
		this.mass = 1;
		this.maxForce = 5;

		// Wander angle for assignment
		this.wanderAngle = null;
		
	}

	// update character
	update(deltaTime, line) {
		// update velocity via acceleration
		this.velocity.addScaledVector(this.acceleration, deltaTime);
		if (this.velocity.length() > this.topSpeed) {
			this.velocity.setLength(this.topSpeed);
		}

		// update location via velocity
		this.location.addScaledVector(this.velocity, deltaTime);

		// rotate the character to ensure they face 
		// the direction of movement
		let angle = Math.atan2(this.velocity.x, this.velocity.z);
		this.gameObject.rotation.y = angle;

		let wanderForce = this.wander();
		this.applyForce(wanderForce);

		// check we are within the bounds of the world
		this.checkEdges();

		// set the game object position
		this.gameObject.position.set(this.location.x, 0, this.location.z);

		this.acceleration.multiplyScalar(0);
	}

	// check we are within the bounds of the world
	checkEdges() {
        if (this.location.x < -25) {
            this.location.x = 25;
        } 
        if (this.location.z < -25) {
            this.location.z = 25;
        }
        if (this.location.x > 25) {
            this.location.x = -25;
        }
        if (this.location.z > 25) {
            this.location.z = -25;
        }
    }

	// Apply force to our character
	applyForce(force) {
		// here, we are saying force = force/mass
		force.divideScalar(this.mass);
		// this is acceleration + force/mass
		this.acceleration.add(force);
	}

	// Seek steering behaviour
	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

		if (steer.length() > this.maxForce) {
			steer.setLength(this.maxForce);
		}
		return steer;
	}

  	// Wander steering behaviour
	wander() {
		let d = 10;
		let r = 10;
		let a = 0.3;
	
		let futureLocation = this.location.clone().add(this.velocity.clone().multiplyScalar(d));
	
		if (this.wanderAngle === null) {
		  this.wanderAngle = Math.random() * Math.PI * 2;
		}
	
		let targetX = futureLocation.x + r * Math.cos(this.wanderAngle);
		let targetZ = futureLocation.z + r * Math.sin(this.wanderAngle);
	
		let target = new THREE.Vector3(targetX, 0, targetZ);
	
		let change = (Math.random() - 0.5) * a;
		this.wanderAngle += change;
	
		let wanderForce = target.clone().sub(this.location);
		wanderForce.multiplyScalar(this.maxForce);

		console.log(wanderForce);

		return wanderForce;
	}
}