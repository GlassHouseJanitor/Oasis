import { BedWithRoom } from "@shared/schema";

export interface RoomLayout {
  id: number;
  name: string;
  labelPosition: { x: number; y: number };
  beds: {
    id: number;
    position: { x: number; y: number };
    width: number;
    height: number;
  }[];
}

export interface HouseLayout {
  width: number;
  height: number;
  outline: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dividers: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[];
  rooms: RoomLayout[];
}

export const houseLayoutTemplate: HouseLayout = {
  width: 600,
  height: 400,
  outline: {
    x: 50,
    y: 50,
    width: 500,
    height: 300,
  },
  dividers: [
    { x1: 200, y1: 50, x2: 200, y2: 350 },
    { x1: 400, y1: 50, x2: 400, y2: 350 },
    { x1: 50, y1: 200, x2: 550, y2: 200 },
  ],
  rooms: [
    {
      id: 1,
      name: "Room 1",
      labelPosition: { x: 125, y: 95 },
      beds: [
        { id: 1, position: { x: 70, y: 80 }, width: 50, height: 80 },
        { id: 2, position: { x: 130, y: 80 }, width: 50, height: 80 },
      ],
    },
    {
      id: 2,
      name: "Room 2",
      labelPosition: { x: 300, y: 95 },
      beds: [
        { id: 3, position: { x: 220, y: 80 }, width: 50, height: 80 },
        { id: 4, position: { x: 280, y: 80 }, width: 50, height: 80 },
        { id: 5, position: { x: 340, y: 80 }, width: 50, height: 80 },
      ],
    },
    {
      id: 3,
      name: "Room 3",
      labelPosition: { x: 475, y: 95 },
      beds: [
        { id: 6, position: { x: 420, y: 80 }, width: 50, height: 80 },
        { id: 7, position: { x: 480, y: 80 }, width: 50, height: 80 },
      ],
    },
    {
      id: 4,
      name: "Room 4",
      labelPosition: { x: 125, y: 245 },
      beds: [
        { id: 8, position: { x: 70, y: 230 }, width: 50, height: 80 },
        { id: 9, position: { x: 130, y: 230 }, width: 50, height: 80 },
      ],
    },
    {
      id: 5,
      name: "Room 5",
      labelPosition: { x: 300, y: 245 },
      beds: [
        { id: 10, position: { x: 220, y: 230 }, width: 50, height: 80 },
        { id: 11, position: { x: 280, y: 230 }, width: 50, height: 80 },
        { id: 12, position: { x: 340, y: 230 }, width: 50, height: 80 },
      ],
    },
    {
      id: 6,
      name: "Room 6",
      labelPosition: { x: 475, y: 245 },
      beds: [
        { id: 13, position: { x: 420, y: 230 }, width: 50, height: 80 },
        { id: 14, position: { x: 480, y: 230 }, width: 50, height: 80 },
      ],
    },
  ],
};

// Maps real bed data to the house layout template
export function mapBedsToLayout(bedsWithRooms: BedWithRoom[]): HouseLayout {
  const layout = { ...houseLayoutTemplate };
  
  // Create a mapping of room IDs to their layout
  const roomLayoutMap = new Map(layout.rooms.map(room => [room.id, room]));
  
  // Create a mapping of bed positions within rooms
  const bedPositionMap = new Map<number, { roomIndex: number; bedIndex: number }>();
  
  layout.rooms.forEach((room, roomIndex) => {
    room.beds.forEach((bed, bedIndex) => {
      bedPositionMap.set(bed.id, { roomIndex, bedIndex });
    });
  });
  
  // Now map the actual bed data to the layout
  bedsWithRooms.forEach(bedWithRoom => {
    const roomId = bedWithRoom.room.id;
    const roomLayout = roomLayoutMap.get(roomId);
    
    if (roomLayout) {
      // Find the bed position in the layout
      // Use bed index for positioning if the exact ID isn't found
      const bedIndex = roomLayout.beds.findIndex((b, index) => index === (bedWithRoom.id - 1) % roomLayout.beds.length);
      
      if (bedIndex !== -1) {
        // Update the bed ID to match the actual data
        roomLayout.beds[bedIndex].id = bedWithRoom.id;
      }
    }
  });
  
  return layout;
}
