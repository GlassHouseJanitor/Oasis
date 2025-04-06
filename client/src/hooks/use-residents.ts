import { useQuery } from "@tanstack/react-query";
import { ResidentWithBed } from "@shared/schema";

export function useResidents() {
  const { data, isLoading, isError, error } = useQuery<ResidentWithBed[]>({
    queryKey: ["/api/residents/with-beds"],
  });

  return {
    residentsWithBeds: data || [],
    isLoading,
    isError,
    error,
  };
}

export function useResidentById(id: number) {
  const { data, isLoading, isError, error } = useQuery<ResidentWithBed>({
    queryKey: [`/api/residents/${id}`],
    enabled: !!id,
  });

  return {
    resident: data,
    isLoading,
    isError,
    error,
  };
}

export function useResidentDocuments(residentId: number) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [`/api/residents/${residentId}/files`],
    enabled: !!residentId,
  });

  return {
    documents: data || [],
    isLoading,
    isError,
    error,
  };
}