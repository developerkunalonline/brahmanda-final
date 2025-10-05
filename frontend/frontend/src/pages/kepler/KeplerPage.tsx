// src/pages/kepler/KeplerPage.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { apiClient } from "@/api";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Type Definitions ---
export interface KeplerPlanet {
  id: string;
  kepid: number;
  koi_name: string;
  kepler_name: string;
  koi_disposition: string;
  koi_period: number;
}
type SortKey = keyof KeplerPlanet;

// --- API Function ---
const fetchKeplerData = async (): Promise<KeplerPlanet[]> => {
  const { data } = await apiClient.get("/datasets/kepler?limit=200"); // Fetch a larger dataset for better filtering
  return data;
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

// --- Main Page Component ---
const KeplerPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["keplerData"],
    queryFn: fetchKeplerData,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "koi_name", direction: "ascending" });

  // useMemo will efficiently filter and sort data only when inputs change
  const processedData = useMemo(() => {
    if (!data) return [];

    let filteredData = data.filter(
      (planet) =>
        planet.koi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (planet.kepler_name &&
          planet.kepler_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold text-glow">
          Kepler Archive
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and analyze confirmed planets and candidates from the Kepler
          mission.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glass-effect hud-corners">
          <CardHeader>
            <CardTitle>Data Controls</CardTitle>
            <CardDescription>
              Filter and sort the dataset in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Filter by KOI or Kepler name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/80 border-primary/20"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="glass-effect">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-primary/20">
                    <SortableHeader
                      title="KOI Name"
                      sortKey="koi_name"
                      handleSort={handleSort}
                      sortConfig={sortConfig}
                    />
                    <SortableHeader
                      title="Kepler Name"
                      sortKey="kepler_name"
                      handleSort={handleSort}
                      sortConfig={sortConfig}
                    />
                    <SortableHeader
                      title="Disposition"
                      sortKey="koi_disposition"
                      handleSort={handleSort}
                      sortConfig={sortConfig}
                    />
                    <SortableHeader
                      title="Orbital Period (days)"
                      sortKey="koi_period"
                      handleSort={handleSort}
                      sortConfig={sortConfig}
                      isNumeric
                    />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading &&
                    Array.from({ length: 10 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  {isError && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-destructive"
                      >
                        Failed to load data from the archive.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && processedData.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-16"
                      >
                        No results match your filter.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    !isError &&
                    processedData.map((planet) => (
                      <PlanetRow key={planet.id} planet={planet} />
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// --- Helper Components for the Table ---

const SortableHeader = ({
  title,
  sortKey,
  handleSort,
  sortConfig,
  isNumeric = false,
}: any) => (
  <TableHead className={isNumeric ? "text-right" : ""}>
    <Button
      variant="ghost"
      onClick={() => handleSort(sortKey)}
      className="px-2"
    >
      {title}
      <ArrowUpDown
        className={`ml-2 h-4 w-4 ${
          sortConfig?.key === sortKey ? "text-primary" : "text-muted-foreground"
        }`}
      />
    </Button>
  </TableHead>
);

const PlanetRow = ({ planet }: { planet: KeplerPlanet }) => {
  const dispositionColor =
    planet.koi_disposition === "CONFIRMED"
      ? "bg-green-400/20 text-green-300"
      : planet.koi_disposition === "CANDIDATE"
      ? "bg-amber-400/20 text-amber-300"
      : "bg-red-400/20 text-red-300";

  return (
    <TableRow className="border-b-primary/10 hover:bg-primary/5">
      <TableCell>
        <Link
          to={`/datasets/kepler/${planet.id}`}
          className="font-medium text-primary hover:underline"
        >
          {planet.koi_name}
        </Link>
      </TableCell>
      <TableCell>{planet.kepler_name || "N/A"}</TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold ${dispositionColor}`}
        >
          {planet.koi_disposition}
        </span>
      </TableCell>
      <TableCell className="text-right font-mono">
        {planet.koi_period.toFixed(4)}
      </TableCell>
    </TableRow>
  );
};

const SkeletonRow = () => (
  <TableRow className="border-b-primary/10">
    <TableCell>
      <Skeleton className="h-4 w-24 bg-muted/50" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32 bg-muted/50" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-6 w-28 bg-muted/50 rounded-full" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-4 w-20 bg-muted/50 ml-auto" />
    </TableCell>
  </TableRow>
);

export default KeplerPage;
