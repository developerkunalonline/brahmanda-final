// src/pages/tess/TessPage.tsx
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/api";
import type { TessObject } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Orbit, Link as LinkIcon } from "lucide-react"; // FIX: Import the Asteroid icon
import AnimatedPageWrapper from "@/components/shared/AnimatedPageWrapper";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router-dom";

const fetchTessData = async (filters: {
  disposition: string;
  min_period: string;
}): Promise<TessObject[]> => {
  const params = new URLSearchParams();
  if (filters.disposition) params.append("disposition", filters.disposition);
  if (filters.min_period) params.append("min_period", filters.min_period);
  const { data } = await apiClient.get(
    `/datasets/tess?limit=100&${params.toString()}`
  );
  return data;
};

const TessPage = () => {
  const [disposition, setDisposition] = useState("");
  const [minPeriod, setMinPeriod] = useState("");
  const debouncedMinPeriod = useDebounce(minPeriod, 500);

  const filters = { disposition, min_period: debouncedMinPeriod };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tessData", filters],
    queryFn: () => fetchTessData(filters),
    placeholderData: (previousData) => previousData,
  });

  return (
    <AnimatedPageWrapper>
      <PageHeader
        title="TESS Objects of Interest"
        description="Browse and filter objects from the TESS mission."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Select onValueChange={setDisposition} value={disposition}>
          <SelectTrigger className="glass-effect">
            <SelectValue placeholder="Filter by Disposition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Dispositions</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANDIDATE">Candidate</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min. Orbital Period (days)"
          className="glass-effect sm:col-span-2"
          value={minPeriod}
          onChange={(e) => setMinPeriod(e.target.value)}
        />
      </div>

      <div className="glass-effect overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableHead>TIC ID</TableHead>
              <TableHead>Disposition</TableHead>
              <TableHead>Period (days)</TableHead>
              <TableHead className="text-right">Radius (R⊕)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-0">
                  <TableCell>
                    <Skeleton className="h-4 w-[150px] bg-muted/50" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] bg-muted/50" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px] bg-muted/50" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[80px] ml-auto bg-muted/50" />
                  </TableCell>
                </TableRow>
              ))}
            {isError && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Alert variant="destructive" className="my-4">
                    <Orbit className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load data from the archive.
                    </AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            )}
            {data?.map((planet) => (
              <TableRow
                key={planet.id}
                className="border-b border-[hsl(var(--glass-border))] last:border-b-0"
              >
                <TableCell className="font-medium">
                  <Link
                    to={`/app/datasets/tess/${planet.id}`}
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    {planet.tic_id} <LinkIcon className="h-3 w-3 opacity-70" />
                  </Link>
                </TableCell>
                <TableCell>{planet.disposition}</TableCell>
                <TableCell>
                  {planet.orbital_period?.toFixed(4) ?? "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {planet.planet_radius?.toFixed(2) ?? "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AnimatedPageWrapper>
  );
};

export default TessPage;
