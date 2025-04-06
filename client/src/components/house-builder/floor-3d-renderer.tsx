import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Floor, Room, Bed } from './floor-builder';

interface Floor3DRendererProps {
  floor: Floor;
  height?: number;
}

export default function Floor3DRenderer({ floor, height = 500 }: Floor3DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const meshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);
    
    // Add hemisphere light for natural environment lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    scene.add(hemisphereLight);
    
    // Import OrbitControls dynamically to avoid SSR issues
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.maxPolarAngle = Math.PI / 2;
      controlsRef.current = controls;
    });
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      
      meshesRef.current = {};
    };
  }, []);
  
  // Update the 3D representation when floor data changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Clear previous floor elements
    Object.values(meshesRef.current).forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    meshesRef.current = {};
    
    // Create floor base
    const floorScale = 20; // Scale factor to make the floor fit nicely in the scene
    const floorWidth = floor.width / 100; // Scale down for 3D scene
    const floorHeight = floor.height / 100;
    
    const floorGeometry = new THREE.BoxGeometry(floorWidth, 0.2, floorHeight);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe0e0e0,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.receiveShadow = true;
    floorMesh.position.y = -0.1;
    
    // Center the floor
    floorMesh.position.x = 0;
    floorMesh.position.z = 0;
    
    sceneRef.current.add(floorMesh);
    meshesRef.current['floor'] = floorMesh;
    
    // Add rooms
    floor.rooms.forEach(room => {
      addRoom(room, floor);
    });
    
    // Adjust camera to show the whole floor
    if (cameraRef.current) {
      const maxDimension = Math.max(floorWidth, floorHeight);
      cameraRef.current.position.set(0, maxDimension * 0.8, maxDimension * 0.8);
      cameraRef.current.lookAt(0, 0, 0);
    }
    
  }, [floor]);
  
  // Function to add a room to the 3D scene
  const addRoom = (room: Room, parentFloor: Floor) => {
    if (!sceneRef.current) return;
    
    // Convert room coordinates to be centered on the floor
    const floorWidth = parentFloor.width / 100;
    const floorHeight = parentFloor.height / 100;
    
    // Scale and position calculations
    const roomWidth = room.width / 100;
    const roomHeight = room.height / 100;
    const roomX = (room.x / 100) - (floorWidth / 2) + (roomWidth / 2);
    const roomZ = (room.y / 100) - (floorHeight / 2) + (roomHeight / 2);
    
    // Create walls
    const wallHeight = 1.0;
    const wallThickness = 0.05;
    
    // Convert room color to THREE.js color
    const roomColor = new THREE.Color(room.color);
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: roomColor,
      roughness: 0.9,
      metalness: 0.1,
    });
    
    // Create room floor
    const roomFloorGeometry = new THREE.BoxGeometry(roomWidth, 0.02, roomHeight);
    const roomFloorMaterial = new THREE.MeshStandardMaterial({
      color: roomColor.clone().multiplyScalar(1.1), // Slightly lighter than walls
      roughness: 0.8,
      metalness: 0.2,
    });
    const roomFloorMesh = new THREE.Mesh(roomFloorGeometry, roomFloorMaterial);
    roomFloorMesh.position.set(roomX, 0, roomZ);
    roomFloorMesh.receiveShadow = true;
    sceneRef.current.add(roomFloorMesh);
    meshesRef.current[`room-${room.id}-floor`] = roomFloorMesh;
    
    // Room construction animation
    gsap.from(roomFloorMesh.position, {
      y: -1,
      duration: 1,
      ease: "elastic.out(1, 0.5)"
    });
    
    // Create walls
    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness);
    const backWallMesh = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWallMesh.position.set(roomX, wallHeight / 2, roomZ - roomHeight / 2);
    backWallMesh.castShadow = true;
    backWallMesh.receiveShadow = true;
    sceneRef.current.add(backWallMesh);
    meshesRef.current[`room-${room.id}-wall-back`] = backWallMesh;
    
    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness);
    const frontWallMesh = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWallMesh.position.set(roomX, wallHeight / 2, roomZ + roomHeight / 2);
    frontWallMesh.castShadow = true;
    frontWallMesh.receiveShadow = true;
    sceneRef.current.add(frontWallMesh);
    meshesRef.current[`room-${room.id}-wall-front`] = frontWallMesh;
    
    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, roomHeight);
    const leftWallMesh = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWallMesh.position.set(roomX - roomWidth / 2, wallHeight / 2, roomZ);
    leftWallMesh.castShadow = true;
    leftWallMesh.receiveShadow = true;
    sceneRef.current.add(leftWallMesh);
    meshesRef.current[`room-${room.id}-wall-left`] = leftWallMesh;
    
    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, roomHeight);
    const rightWallMesh = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWallMesh.position.set(roomX + roomWidth / 2, wallHeight / 2, roomZ);
    rightWallMesh.castShadow = true;
    rightWallMesh.receiveShadow = true;
    sceneRef.current.add(rightWallMesh);
    meshesRef.current[`room-${room.id}-wall-right`] = rightWallMesh;
    
    // Wall construction animation
    const walls = [backWallMesh, frontWallMesh, leftWallMesh, rightWallMesh];
    walls.forEach((wall, index) => {
      gsap.from(wall.scale, {
        y: 0,
        duration: 0.8,
        delay: 0.2 + (index * 0.1),
        ease: "power2.out"
      });
    });
    
    // Add text label for the room
    createTextLabel(room.name, roomX, 1.2, roomZ);
    
    // Add beds
    room.beds.forEach(bed => {
      addBed(bed, room, roomX, roomZ, roomWidth, roomHeight);
    });
  };
  
  // Function to add a bed to the 3D scene
  const addBed = (bed: Bed, parentRoom: Room, roomX: number, roomZ: number, roomWidth: number, roomHeight: number) => {
    if (!sceneRef.current) return;
    
    // Calculate position
    const bedWidth = bed.width / 100;
    const bedHeight = bed.height / 100;
    const bedX = roomX - (roomWidth / 2) + (bed.x / 100) + (bedWidth / 2);
    const bedZ = roomZ - (roomHeight / 2) + (bed.y / 100) + (bedHeight / 2);
    
    // Create bed frame
    const frameGeometry = new THREE.BoxGeometry(bedWidth, 0.1, bedHeight);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.7,
      metalness: 0.2,
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.set(bedX, 0.1, bedZ);
    frameMesh.castShadow = true;
    frameMesh.receiveShadow = true;
    frameMesh.rotation.y = (bed.rotation * Math.PI) / 180;
    sceneRef.current.add(frameMesh);
    meshesRef.current[`bed-${bed.id}-frame`] = frameMesh;
    
    // Create mattress
    const mattressGeometry = new THREE.BoxGeometry(bedWidth * 0.9, 0.1, bedHeight * 0.9);
    
    // Determine mattress color based on bed status
    let mattressColor;
    switch(bed.status) {
      case 'available':
        mattressColor = new THREE.Color(0xa3b68a);
        break;
      case 'occupied':
        mattressColor = new THREE.Color(0xF4A261);
        break;
      case 'maintenance':
        mattressColor = new THREE.Color(0xE9C46A);
        break;
      default:
        mattressColor = new THREE.Color(0xa3b68a);
    }
    
    const mattressMaterial = new THREE.MeshStandardMaterial({
      color: mattressColor,
      roughness: 0.9,
      metalness: 0.1,
    });
    const mattressMesh = new THREE.Mesh(mattressGeometry, mattressMaterial);
    mattressMesh.position.set(bedX, 0.2, bedZ);
    mattressMesh.castShadow = true;
    mattressMesh.rotation.y = (bed.rotation * Math.PI) / 180;
    sceneRef.current.add(mattressMesh);
    meshesRef.current[`bed-${bed.id}-mattress`] = mattressMesh;
    
    // Create pillow
    const pillowGeometry = new THREE.BoxGeometry(bedWidth * 0.3, 0.05, bedHeight * 0.15);
    const pillowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
    });
    const pillowMesh = new THREE.Mesh(pillowGeometry, pillowMaterial);
    
    // Position the pillow at the "head" of the bed based on rotation
    let pillowX = bedX;
    let pillowZ = bedZ;
    
    if (bed.rotation === 0) {
      pillowZ -= bedHeight * 0.35;
    } else if (bed.rotation === 90) {
      pillowX -= bedWidth * 0.35;
    } else if (bed.rotation === 180) {
      pillowZ += bedHeight * 0.35;
    } else if (bed.rotation === 270) {
      pillowX += bedWidth * 0.35;
    }
    
    pillowMesh.position.set(pillowX, 0.25, pillowZ);
    pillowMesh.castShadow = true;
    pillowMesh.rotation.y = (bed.rotation * Math.PI) / 180;
    sceneRef.current.add(pillowMesh);
    meshesRef.current[`bed-${bed.id}-pillow`] = pillowMesh;
    
    // Animation for bed appearance
    const bedParts = [frameMesh, mattressMesh, pillowMesh];
    bedParts.forEach((part, index) => {
      gsap.from(part.position, {
        y: -1,
        duration: 0.6,
        delay: 1 + (index * 0.1),
        ease: "back.out(1.7)"
      });
    });
  };
  
  // Function to create text labels in 3D space
  const createTextLabel = (text: string, x: number, y: number, z: number) => {
    // This is a placeholder as Three.js text requires more setup
    // In a complete implementation, you would use TextGeometry or HTML/CSS-based labels
    // For now, we'll just create a simple indicator
    
    if (!sceneRef.current) return;
    
    const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x333232 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);
    sceneRef.current.add(sphere);
    
    // In a full implementation, you would create TextGeometry here
    // and add it to the scene with proper positioning
  };
  
  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: `${height}px` }}
      className="rounded-lg overflow-hidden"
    ></div>
  );
}