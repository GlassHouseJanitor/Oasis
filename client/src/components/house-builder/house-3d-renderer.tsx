import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { House } from './house-builder';
import { Floor, Room, Bed } from './floor-builder';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Layers, Home, Eye } from "lucide-react";

interface House3DRendererProps {
  house: House;
  height?: number;
}

export default function House3DRenderer({ house, height = 500 }: House3DRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const meshesRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const [selectedFloor, setSelectedFloor] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'interior' | 'exterior'>('exterior');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    setIsLoading(true);
    
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
      
      // Render the house
      renderHouse();
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
  
  // Render the house when component mounts or house/selectedFloor/viewMode changes
  const renderHouse = () => {
    if (!sceneRef.current || !cameraRef.current) return;
    
    setIsLoading(true);
    
    // Clear previous scene
    Object.values(meshesRef.current).forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    meshesRef.current = {};
    
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cac7c,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    sceneRef.current.add(ground);
    meshesRef.current['ground'] = ground;
    
    // Group for the entire house
    const houseGroup = new THREE.Group();
    sceneRef.current.add(houseGroup);
    meshesRef.current['house'] = houseGroup;
    
    // Add each floor
    const floors = house.floors;
    floors.forEach((floor, index) => {
      if (selectedFloor !== 'all' && floor.id !== selectedFloor) return;
      
      const floorGroup = new THREE.Group();
      floorGroup.position.y = index * 1.5; // Stack floors vertically
      houseGroup.add(floorGroup);
      meshesRef.current[`floor-${floor.id}`] = floorGroup;
      
      // Create floor base
      const floorWidth = floor.width / 100; // Scale down for 3D scene
      const floorDepth = floor.height / 100;
      
      const floorGeometry = new THREE.BoxGeometry(floorWidth, 0.2, floorDepth);
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0,
        roughness: 0.8,
        metalness: 0.2,
      });
      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.receiveShadow = true;
      floorMesh.position.y = -0.1;
      floorGroup.add(floorMesh);
      meshesRef.current[`floor-${floor.id}-base`] = floorMesh;
      
      // Add each room
      floor.rooms.forEach(room => {
        addRoom(room, floor, floorGroup);
      });
      
      // Animation for floor appearance
      gsap.from(floorGroup.position, {
        y: -5,
        duration: 1,
        delay: index * 0.2,
        ease: "elastic.out(1, 0.8)",
        onComplete: () => {
          if (index === floors.length - 1) {
            setIsLoading(false);
          }
        }
      });
    });
    
    // Position camera to show the whole house
    const totalHeight = house.floors.length * 1.5;
    const maxWidth = Math.max(...house.floors.map(f => f.width / 100));
    const maxDepth = Math.max(...house.floors.map(f => f.height / 100));
    const maxDimension = Math.max(maxWidth, maxDepth, totalHeight);
    
    if (viewMode === 'exterior') {
      cameraRef.current.position.set(maxDimension, totalHeight + 5, maxDimension);
    } else {
      // For interior view, position inside the middle of the first floor
      if (house.floors.length > 0) {
        const firstFloor = house.floors[0];
        cameraRef.current.position.set(0, 0.8, 0);
      }
    }
    
    cameraRef.current.lookAt(0, totalHeight / 2, 0);
  };
  
  // Render a room within a floor
  const addRoom = (room: Room, parentFloor: Floor, floorGroup: THREE.Group) => {
    // Convert room coordinates to be centered on the floor
    const floorWidth = parentFloor.width / 100;
    const floorDepth = parentFloor.height / 100;
    
    // Scale and position calculations
    const roomWidth = room.width / 100;
    const roomDepth = room.height / 100;
    const roomX = (room.x / 100) - (floorWidth / 2) + (roomWidth / 2);
    const roomZ = (room.y / 100) - (floorDepth / 2) + (roomDepth / 2);
    
    // Room group
    const roomGroup = new THREE.Group();
    roomGroup.position.set(roomX, 0, roomZ);
    floorGroup.add(roomGroup);
    meshesRef.current[`room-${room.id}`] = roomGroup;
    
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
    const roomFloorGeometry = new THREE.BoxGeometry(roomWidth, 0.02, roomDepth);
    const roomFloorMaterial = new THREE.MeshStandardMaterial({
      color: roomColor.clone().multiplyScalar(1.1), // Slightly lighter than walls
      roughness: 0.8,
      metalness: 0.2,
    });
    const roomFloorMesh = new THREE.Mesh(roomFloorGeometry, roomFloorMaterial);
    roomFloorMesh.receiveShadow = true;
    roomGroup.add(roomFloorMesh);
    
    // Create walls
    const walls = [
      // Back wall
      { 
        geometry: new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness),
        position: [0, wallHeight / 2, -roomDepth / 2]
      },
      // Front wall
      { 
        geometry: new THREE.BoxGeometry(roomWidth, wallHeight, wallThickness),
        position: [0, wallHeight / 2, roomDepth / 2]
      },
      // Left wall
      { 
        geometry: new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        position: [-roomWidth / 2, wallHeight / 2, 0]
      },
      // Right wall
      { 
        geometry: new THREE.BoxGeometry(wallThickness, wallHeight, roomDepth),
        position: [roomWidth / 2, wallHeight / 2, 0]
      }
    ];
    
    walls.forEach((wall, index) => {
      const wallMesh = new THREE.Mesh(wall.geometry, wallMaterial);
      wallMesh.position.set(wall.position[0], wall.position[1], wall.position[2]);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      roomGroup.add(wallMesh);
      
      // Wall construction animation
      gsap.from(wallMesh.scale, {
        y: 0,
        duration: 0.8,
        delay: 0.2 + (index * 0.1),
        ease: "power2.out"
      });
    });
    
    // Add room label
    const labelGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const labelMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.y = 1.1;
    roomGroup.add(label);
    
    // Add beds
    room.beds.forEach(bed => {
      addBed(bed, roomGroup, roomWidth, roomDepth);
    });
  };
  
  // Function to add a bed to a room
  const addBed = (bed: Bed, roomGroup: THREE.Group, roomWidth: number, roomDepth: number) => {
    // Calculate position
    const bedWidth = bed.width / 100;
    const bedDepth = bed.height / 100;
    const bedX = (bed.x / 100) - (roomWidth / 2) + (bedWidth / 2);
    const bedZ = (bed.y / 100) - (roomDepth / 2) + (bedDepth / 2);
    
    // Bed group
    const bedGroup = new THREE.Group();
    bedGroup.position.set(bedX, 0, bedZ);
    bedGroup.rotation.y = (bed.rotation * Math.PI) / 180;
    roomGroup.add(bedGroup);
    meshesRef.current[`bed-${bed.id}`] = bedGroup;
    
    // Create bed frame
    const frameGeometry = new THREE.BoxGeometry(bedWidth, 0.1, bedDepth);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.7,
      metalness: 0.2,
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.y = 0.1;
    frameMesh.castShadow = true;
    frameMesh.receiveShadow = true;
    bedGroup.add(frameMesh);
    
    // Create mattress
    const mattressGeometry = new THREE.BoxGeometry(bedWidth * 0.9, 0.1, bedDepth * 0.9);
    
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
    mattressMesh.position.y = 0.15;
    mattressMesh.castShadow = true;
    bedGroup.add(mattressMesh);
    
    // Create pillow
    const pillowGeometry = new THREE.BoxGeometry(bedWidth * 0.3, 0.05, bedDepth * 0.15);
    const pillowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
    });
    const pillowMesh = new THREE.Mesh(pillowGeometry, pillowMaterial);
    pillowMesh.position.set(0, 0.2, -bedDepth * 0.35);
    pillowMesh.castShadow = true;
    bedGroup.add(pillowMesh);
    
    // Animation for bed appearance
    gsap.from(bedGroup.position, {
      y: -0.5,
      duration: 0.6,
      delay: 1 + Math.random() * 0.5,
      ease: "back.out(1.7)"
    });
  };
  
  // Update the 3D view when selected floor changes
  useEffect(() => {
    renderHouse();
  }, [house, selectedFloor, viewMode]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <Label htmlFor="floor-selector" className="mr-2">Floor:</Label>
            <Select
              value={selectedFloor}
              onValueChange={(value) => setSelectedFloor(value as 'all' | string)}
            >
              <SelectTrigger id="floor-selector" className="w-[180px]">
                <SelectValue placeholder="Select floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {house.floors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id}>
                    {floor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="view-mode" className="mr-2">View:</Label>
            <Select
              value={viewMode}
              onValueChange={(value) => setViewMode(value as 'interior' | 'exterior')}
            >
              <SelectTrigger id="view-mode" className="w-[160px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exterior">Exterior View</SelectItem>
                <SelectItem value="interior">Interior View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => {
              if (cameraRef.current) {
                const floors = house.floors;
                const totalHeight = floors.length * 1.5;
                const maxWidth = Math.max(...floors.map(f => f.width / 100));
                const maxDepth = Math.max(...floors.map(f => f.height / 100));
                const maxDimension = Math.max(maxWidth, maxDepth, totalHeight);
                
                gsap.to(cameraRef.current.position, {
                  x: maxDimension,
                  y: totalHeight + 5,
                  z: maxDimension,
                  duration: 1,
                  ease: "power2.inOut",
                  onUpdate: () => {
                    cameraRef.current?.lookAt(0, totalHeight / 2, 0);
                  }
                });
              }
            }}
          >
            <Home className="h-4 w-4 mr-1" /> Reset View
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg overflow-hidden relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-t-[#a3b68a] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-700">Building your house...</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-500 text-center mt-2">
        <p>Click and drag to rotate. Scroll to zoom in/out.</p>
      </div>
    </div>
  );
}