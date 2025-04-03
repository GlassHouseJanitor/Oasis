import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedWithRoom } from "@shared/schema";

export function useBeds(houseId?: number | null) {
  const {
    data: bedsWithRooms,
    isLoading,
    isError,
    error,
  } = useQuery<BedWithRoom[]>({
    queryKey: ['/api/beds/with-rooms', houseId ? `?houseId=${houseId}` : ''],
    enabled: houseId !== undefined,
  });

  return {
    bedsWithRooms,
    isLoading,
    isError,
    error,
  };
}

export function useSingleBed(bedId: number | null) {
  const {
    data: bed,
    isLoading,
    isError,
    error,
  } = useQuery<BedWithRoom>({
    queryKey: [`/api/beds/${bedId}`],
    enabled: bedId !== null && bedId !== undefined,
  });

  return {
    bed,
    isLoading,
    isError,
    error,
  };
}
