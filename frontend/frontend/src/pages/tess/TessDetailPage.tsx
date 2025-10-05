// src/pages/tess/TessDetailPage.tsx
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Telescope } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AnimatedPageWrapper from "@/components/shared/AnimatedPageWrapper";
import PageHeader from "@/components/shared/PageHeader";
import type { TessObject } from "@/types";

const fetchTessObjectById = async (id: string): Promise<TessObject> => {
  const { data } = await apiClient.get(`/datasets/tess/${id}`);
  return data;
};

const DetailCard = ({
  title,
  value,
  unit,
}: {
  title: string;
  value?: string | number;
  unit?: string;
}) => (
  <Card className="glass-effect">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">
        {value ?? "N/A"} <span className="text-sm font-normal">{unit}</span>
      </p>
    </CardContent>
  </Card>
);

const TessDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: tessObject,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tessDetail", id],
    queryFn: () => fetchTessObjectById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AnimatedPageWrapper>
        <PageHeader
          title="Loading Data..."
          description="Fetching from TESS archives."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AnimatedPageWrapper>
    );
  }

  if (isError || !tessObject) {
    return (
      <AnimatedPageWrapper>
        <Alert variant="destructive">
          <Telescope className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not retrieve TESS object data.
          </AlertDescription>
        </Alert>
      </AnimatedPageWrapper>
    );
  }

  return (
    <AnimatedPageWrapper>
      <PageHeader
        title={`TIC ID: ${tessObject.tic_id}`}
        description="TESS Object of Interest Detailed View"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailCard title="Disposition" value={tessObject.disposition} />
        <DetailCard
          title="Orbital Period"
          value={tessObject.orbital_period?.toFixed(4)}
          unit="days"
        />
        <DetailCard
          title="Planet Radius"
          value={tessObject.planet_radius?.toFixed(2)}
          unit="R⊕"
        />
      </div>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Data Visualization (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          Advanced visualization would be rendered here.
        </CardContent>
      </Card>
    </AnimatedPageWrapper>
  );
};

export default TessDetailPage;
