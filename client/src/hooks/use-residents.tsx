import { useQuery } from "@tanstack/react-query";
import { Resident, ResidentWithBed } from "@shared/schema";

export function useResidents() {
  const {
    data: residents,
    isLoading,
    isError,
    error,
  } = useQuery<Resident[]>({
    queryKey: ['/api/residents'],
  });

  const {
    data: residentsWithBeds,
    isLoading: isLoadingWithBeds,
    isError: isErrorWithBeds,
    error: errorWithBeds,
  } = useQuery<ResidentWithBed[]>({
    queryKey: ['/api/residents/with-beds'],
  });

  return {
    residents,
    residentsWithBeds,
    isLoading: isLoading || isLoadingWithBeds,
    isError: isError || isErrorWithBeds,
    error: error || errorWithBeds,
  };
}

export function useSingleResident(residentId: number | null) {
  const {
    data: resident,
    isLoading,
    isError,
    error,
  } = useQuery<Resident>({
    queryKey: [`/api/residents/${residentId}`],
    enabled: !!residentId,
  });

  return {
    resident,
    isLoading,
    isError,
    error,
  };
}
