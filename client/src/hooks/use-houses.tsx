import { useQuery } from "@tanstack/react-query";
import { House } from "@shared/schema";

export function useHouses() {
  const {
    data: houses,
    isLoading,
    isError,
    error,
  } = useQuery<House[]>({
    queryKey: ['/api/houses'],
  });

  return {
    houses,
    isLoading,
    isError,
    error,
  };
}

export function useSingleHouse(houseId: number | null) {
  const {
    data: house,
    isLoading,
    isError,
    error,
  } = useQuery<House>({
    queryKey: [`/api/houses/${houseId}`],
    enabled: !!houseId,
  });

  return {
    house,
    isLoading,
    isError,
    error,
  };
}
