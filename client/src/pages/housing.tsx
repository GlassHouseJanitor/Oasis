import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { BedWithRoom, ResidentWithBed } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 3D visualization component for house models
const HouseModel3D = ({ onBedSelect, modelTemplate }) => {
  const [scene, setScene] = useState(null);
  const [beds, setBeds] = useState([]);

  useEffect(() => {
    // Create a Three.js scene
    const newScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    renderer.setClearColor(0xf0f0f0);

    // Add the renderer to the DOM
    const container = document.getElementById('house-model-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    }

    // Camera position
    camera.position.z = 5;
    camera.position.y = 3;

    // Add orbit controls for easy navigation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    newScene.add(directionalLight);

    // Load house model based on template
    loadHouseTemplate(modelTemplate, newScene);

    // Animation loop
    const animate = function() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(newScene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / 2 / (window.innerHeight / 2);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    };

    window.addEventListener('resize', handleResize);

    setScene(newScene);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelTemplate]);

  // Function to load house template
  const loadHouseTemplate = (templateName, scene) => {
    // Clear existing bed objects
    const existingBeds = [];

    // Create basic house shape based on template
    let houseGeometry, houseMaterial, houseMesh;

    switch(templateName) {
      case 'small-apartment':
        // Create a simple apartment layout
        createApartmentLayout(scene, 2, 1, existingBeds);
        break;

      case 'large-house':
        // Create a larger house with multiple rooms
        createApartmentLayout(scene, 4, 2, existingBeds);
        break;

      case 'dormitory':
        // Create a dormitory style layout
        createDormitoryLayout(scene, 6, 2, existingBeds);
        break;

      default:
        // Default simple house
        createApartmentLayout(scene, 3, 1, existingBeds);
    }

    setBeds(existingBeds);
  };

  // Function to create a simple apartment layout
  const createApartmentLayout = (scene, roomCount, floors, existingBeds) => {
    // Floor
    const floorGeometry = new THREE.BoxGeometry(10, 0.2, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.1;
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });

    // Back wall
    const backWallGeometry = new THREE.BoxGeometry(10, 2.5, 0.1);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 1.25, -4);
    scene.add(backWall);

    // Front wall with cutout for entrance
    const frontWallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 0.1),
      wallMaterial
    );
    frontWallLeft.position.set(-3, 1.25, 4);
    scene.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 0.1),
      wallMaterial
    );
    frontWallRight.position.set(3, 1.25, 4);
    scene.add(frontWallRight);

    // Side walls
    const leftWallGeometry = new THREE.BoxGeometry(0.1, 2.5, 8);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-5, 1.25, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(5, 1.25, 0);
    scene.add(rightWall);

    // Add room dividers based on room count
    const roomWidth = 10 / roomCount;

    for (let i = 1; i < roomCount; i++) {
      const dividerGeometry = new THREE.BoxGeometry(0.1, 2.5, 8);
      const divider = new THREE.Mesh(dividerGeometry, wallMaterial);
      divider.position.set(-5 + (i * roomWidth), 1.25, 0);
      scene.add(divider);
    }

    // Add beds to each room
    for (let i = 0; i < roomCount; i++) {
      const roomCenterX = -5 + (i * roomWidth) + (roomWidth / 2);

      // Add 2 beds per room
      for (let j = 0; j < 2; j++) {
        const bedGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
        const bedMaterial = new THREE.MeshStandardMaterial({ color: 0xa3b68a });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);

        // Position beds on opposing walls
        const posZ = j === 0 ? -3 : 3;
        bed.position.set(roomCenterX, 0.25, posZ - 0.5);
        scene.add(bed);

        // Add bed to clickable objects
        const bedId = `bed-${i}-${j}`;
        const roomName = `Room ${i + 1}`;
        const bedName = `Bed ${j + 1}`;

        existingBeds.push({
          id: bedId,
          object3D: bed,
          roomName: roomName,
          bedName: bedName,
          data: {
            id: bedId,
            name: bedName,
            room: {
              id: `room-${i}`,
              name: roomName
            }
          }
        });
      }
    }
  };

  // Function to create a dormitory style layout
  const createDormitoryLayout = (scene, bedsPerRow, rows, existingBeds) => {
    // Floor
    const floorGeometry = new THREE.BoxGeometry(12, 0.2, 8);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.1;
    scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });

    // Outer walls
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(12, 2.5, 0.1),
      wallMaterial
    );
    backWall.position.set(0, 1.25, -4);
    scene.add(backWall);

    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(12, 2.5, 0.1),
      wallMaterial
    );
    frontWall.position.set(0, 1.25, 4);
    scene.add(frontWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.5, 8),
      wallMaterial
    );
    leftWall.position.set(-6, 1.25, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.5, 8),
      wallMaterial
    );
    rightWall.position.set(6, 1.25, 0);
    scene.add(rightWall);

    // Add beds in a grid pattern
    const bedSpacingX = 10 / bedsPerRow;
    const bedSpacingZ = 6 / rows;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < bedsPerRow; col++) {
        const bedGeometry = new THREE.BoxGeometry(1, 0.5, 2);
        const bedMaterial = new THREE.MeshStandardMaterial({ color: 0xa3b68a });
        const bed = new THREE.Mesh(bedGeometry, bedMaterial);

        // Position beds in a grid
        const posX = -5 + (col * bedSpacingX) + (bedSpacingX / 2);
        const posZ = -3 + (row * bedSpacingZ) + (bedSpacingZ / 2);

        bed.position.set(posX, 0.25, posZ);
        scene.add(bed);

        // Add bed to clickable objects
        const bedId = `bed-${row}-${col}`;
        const roomName = `Dormitory`;
        const bedName = `Bed ${row * bedsPerRow + col + 1}`;

        existingBeds.push({
          id: bedId,
          object3D: bed,
          roomName: roomName,
          bedName: bedName,
          data: {
            id: bedId,
            name: bedName,
            room: {
              id: `room-dormitory`,
              name: roomName
            }
          }
        });
      }
    }
  };

  return (
    <div>
      <div id="house-model-container" className="h-96 w-full rounded-lg border border-gray-200 overflow-hidden"></div>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-2">
        {beds.map((bed) => (
          <button
            key={bed.id}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 text-sm"
            onClick={() => onBedSelect(bed.data)}
          >
            {bed.roomName} / {bed.bedName}
          </button>
        ))}
      </div>
    </div>
  );
};

// Resident card component for drag and drop
const ResidentCard = ({ resident, onDragStart }) => {
  return (
    <div 
      className="p-3 border border-gray-200 rounded-lg mb-2 bg-white shadow-sm cursor-move hover:shadow"
      draggable
      onDragStart={(e) => onDragStart(e, resident)}
    >
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-[#a3b68a]/10 flex items-center justify-center text-[#a3b68a]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="font-medium">{resident.firstName} {resident.lastName}</p>
          <p className="text-xs text-gray-500">
            {resident.bed 
              ? `${resident.bed.room.name} / ${resident.bed.name}` 
              : "Unassigned"
            }
          </p>
        </div>
      </div>
      <div className="mt-1 flex justify-between text-xs">
        <span className={`px-2 py-0.5 rounded-full ${getPaymentStatusColor(resident.paymentStatus)}`}>
          {resident.paymentStatus.charAt(0).toUpperCase() + resident.paymentStatus.slice(1)}
        </span>
        {resident.moveInDate && <span className="text-gray-500">
          Since {new Date(resident.moveInDate).toLocaleDateString()}
        </span>}
      </div>
    </div>
  );
};

// Helper function for payment status colors
const getPaymentStatusColor = (status) => {
  switch(status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'partial': return 'bg-yellow-100 text-yellow-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    case 'unpaid': 
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Bed Drop Zone component
const BedDropZone = ({ bed, onDrop }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const residentData = JSON.parse(e.dataTransfer.getData('resident'));
    onDrop(residentData, bed);
  };

  return (
    <div 
      className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 h-24 flex items-center justify-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <p className="font-medium">{bed.room.name} / {bed.name}</p>
        <p className="text-sm text-gray-500">Drop resident here</p>
      </div>
    </div>
  );
};

// Main component
export default function Housing() {
  const [selectedBed, setSelectedBed] = useState(null);
  const [viewResident, setViewResident] = useState(null);
  const [houseTemplate, setHouseTemplate] = useState('small-apartment');
  const [residents, setResidents] = useState([
    // Sample data - would be fetched from API in real implementation
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
      emergencyContact: "555-987-6543",
      paymentStatus: "paid",
      moveInDate: "2023-05-15",
      expectedDuration: "6 months",
      notes: "Prefers quiet environments",
      bed: null
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "555-234-5678",
      emergencyContact: "555-876-5432",
      paymentStatus: "partial",
      moveInDate: "2023-06-01",
      expectedDuration: "1 year",
      notes: "",
      bed: null
    },
    {
      id: 3,
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.j@example.com",
      phone: "555-345-6789",
      emergencyContact: "555-765-4321",
      paymentStatus: "overdue",
      moveInDate: "2023-04-10",
      expectedDuration: "3 months",
      notes: "Has a service animal",
      bed: null
    }
  ]);

  const { toast } = useToast();

  const handleBedSelect = (bed) => {
    setSelectedBed(bed);
  };

  const handleViewResident = (resident) => {
    setViewResident(resident);
  };

  const handleResidentDragStart = (e, resident) => {
    e.dataTransfer.setData('resident', JSON.stringify(resident));
  };

  const handleBedDrop = (resident, bed) => {
    // Update resident with new bed assignment
    const updatedResidents = residents.map(r => {
      if (r.id === resident.id) {
        // If resident was already assigned to a bed, make that bed available
        if (r.bed) {
          toast({
            title: "Bed Reassignment",
            description: `${r.firstName} ${r.lastName} moved from ${r.bed.room.name}/${r.bed.name} to ${bed.room.name}/${bed.name}`
          });
        } else {
          toast({
            title: "Bed Assignment",
            description: `${r.firstName} ${r.lastName} assigned to ${bed.room.name}/${bed.name}`
          });
        }
        return {...r, bed: bed};
      }
      // If another resident was in this bed, make them unassigned
      if (r.bed && r.bed.id === bed.id) {
        toast({
          title: "Resident Unassigned",
          description: `${r.firstName} ${r.lastName} was removed from ${bed.room.name}/${bed.name}`
        });
        return {...r, bed: null};
      }
      return r;
    });

    setResidents(updatedResidents);
  };

  const handleTemplateChange = (value) => {
    setHouseTemplate(value);
    toast({
      title: "Template Changed",
      description: `Switched to ${value.replace('-', ' ')} template`
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-montserrat text-[#264653]">Housing Management</h1>

      <Tabs defaultValue="beds" className="w-full">
        <TabsList>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
        </TabsList>

        <TabsContent value="beds" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">3D House Model</h2>
            <div className="flex space-x-3">
              <Select value={houseTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small-apartment">Small Apartment</SelectItem>
                  <SelectItem value="large-house">Large House</SelectItem>
                  <SelectItem value="dormitory">Dormitory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Resident Sidebar for Drag & Drop */}
                <div className="lg:col-span-1 border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-y-auto max-h-[500px]">
                  <h3 className="font-semibold mb-3">Residents</h3>
                  <p className="text-sm text-gray-500 mb-3">Drag and drop residents to assign beds</p>

                  {residents.map(resident => (
                    <ResidentCard 
                      key={resident.id} 
                      resident={resident} 
                      onDragStart={handleResidentDragStart}
                    />
                  ))}
                </div>

                {/* 3D House Visualization */}
                <div className="lg:col-span-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <HouseModel3D 
                    onBedSelect={handleBedSelect} 
                    modelTemplate={houseTemplate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {residents.map(resident => (
              <Card key={resident.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-[#a3b68a]/10 flex items-center justify-center text-[#a3b68a]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">{resident.firstName} {resident.lastName}</h3>
                      <p className="text-sm text-gray-500">
                        {resident.bed 
                          ? `${resident.bed.room.name} / ${resident.bed.name}` 
                          : "Unassigned"
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded-full ${getPaymentStatusColor(resident.paymentStatus)}`}>
                        {resident.paymentStatus.charAt(0).toUpperCase() + resident.paymentStatus.slice(1)}
                      </span>
                      {resident.moveInDate && <span className="text-gray-500">
                        Since {new Date(resident.moveInDate).toLocaleDateString()}
                      </span>}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewResident(resident)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Resident View Dialog */}
      <Dialog open={!!viewResident} onOpenChange={() => setViewResident(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
          </DialogHeader>

          {viewResident && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-[#a3b68a]/10 flex items-center justify-center text-[#a3b68a]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-montserrat">{viewResident.firstName} {viewResident.lastName}</h3>
                  <p className="text-gray-500">ID: R-{viewResident.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{viewResident.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{viewResident.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                  <p>{viewResident.emergencyContact || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className={`
                    ${viewResident.paymentStatus === 'paid' ? 'text-green-600' : ''}
                    ${viewResident.paymentStatus === 'partial' ? 'text-yellow-600' : ''}
                    ${viewResident.paymentStatus === 'overdue' ? 'text-red-600' : ''}
                    ${viewResident.paymentStatus === 'unpaid' ? 'text-gray-600' : ''}
                  `}>
                    {viewResident.paymentStatus.charAt(0).toUpperCase() + viewResident.paymentStatus.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Move-In Date</p>
                  <p>{viewResident.moveInDate ? new Date(viewResident.moveInDate).toLocaleDateString() : "Not moved in"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expected Duration</p>
                  <p>{viewResident.expectedDuration || "Not specified"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Housing Assignment</p>
                  <p>
                    {viewResident.bed 
                      ? `${viewResident.bed.room.name} / ${viewResident.bed.name}` 
                      : "Not currently assigned"
                    }
                  </p>
                </div>
                {viewResident.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap">{viewResident.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}