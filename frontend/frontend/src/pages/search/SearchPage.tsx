// src/pages/search/SearchPage.tsx
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { apiClient } from "@/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search as SearchIcon,
  Telescope,
  Rocket,
  Loader2,
  ServerCrash,
  ArchiveX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// --- Type Definitions to match your live API response ---
interface KeplerResult {
  _id: string;
  kepid: number;
  kepler_name: string;
  kepoi_name: string;
  koi_disposition: string;
}

interface TessResult {
  _id: string;
  tic_id: string;
  orbital_period?: number;
}

interface SearchResponse {
  query: string;
  results: {
    kepler: KeplerResult[];
    tess: TessResult[];
  };
  total_found: {
    combined: number;
    kepler: number;
    tess: number;
  };
}

// --- Form Schema ---
const searchSchema = z.object({
  query: z.string().min(1, "Search query cannot be empty."),
});
type SearchFormValues = z.infer<typeof searchSchema>;

// --- API Function ---
const searchDatasets = async (query: string): Promise<SearchResponse> => {
  const { data } = await apiClient.get(`/datasets/search?query=${query}`);
  return data;
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

// --- Main Search Page Component ---
const SearchPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const mutation = useMutation({ mutationFn: searchDatasets });
  const onSearch = (data: SearchFormValues) => mutation.mutate(data.query);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-display font-bold text-glow">
            Universal Archive Search
          </h1>
          <p className="text-muted-foreground mt-1">
            Query the entire Brahmanda network for specific objects of interest.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-effect hud-corners shadow-2xl shadow-primary/10">
            <CardContent className="p-4">
              <form
                onSubmit={handleSubmit(onSearch)}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-grow relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="e.g., K00752.01, Kepler-227 b, or a TIC ID"
                    className="pl-10 h-12 text-lg bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/80 transition-all border-primary/20"
                    {...register("query")}
                  />
                  {errors.query && (
                    <p className="text-xs text-destructive mt-1 ml-2">
                      {errors.query.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  size="lg"
                  className="text-lg px-8"
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {mutation.isPending ? "Searching..." : "Execute Query"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="pt-4">
          <AnimatePresence mode="wait">
            {mutation.isIdle && <AwaitingQueryState key="idle" />}
            {mutation.isPending && <LoadingState key="pending" />}
            {mutation.isError && (
              <ErrorState key="error" error={mutation.error} />
            )}
            {mutation.isSuccess && (
              <ResultsState key="success" data={mutation.data} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// --- State Components ---
const AwaitingQueryState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="text-center py-16 text-muted-foreground flex flex-col items-center"
  >
    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center animate-[radar-ping_2s_infinite]">
      <SearchIcon className="h-8 w-8 text-primary" />
    </div>
    <h3 className="mt-4 text-xl font-semibold">Awaiting Query</h3>
    <p>The archive is standing by for your command.</p>
  </motion.div>
);

const LoadingState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="text-center py-16 text-muted-foreground flex flex-col items-center"
  >
    <Loader2 className="h-12 w-12 text-primary animate-spin" />
    <h3 className="mt-4 text-xl font-semibold">
      Searching Universal Archives...
    </h3>
    <p>Analyzing light curves and stellar data across the network.</p>
  </motion.div>
);

const ErrorState = ({ error }: { error: Error }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <Alert variant="destructive" className="glass-effect">
      <ServerCrash className="h-5 w-5" />
      <AlertTitle>Archive Connection Error</AlertTitle>
      <AlertDescription>
        {error.message ||
          "An unknown error occurred while communicating with the data archives."}
      </AlertDescription>
    </Alert>
  </motion.div>
);

const ResultsState = ({ data }: { data: SearchResponse }) => {
  if (data.total_found.combined === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-16 text-muted-foreground flex flex-col items-center"
      >
        <ArchiveX className="h-12 w-12 text-secondary" />
        <h3 className="mt-4 text-xl font-semibold">
          No Matching Objects Found for "{data.query}"
        </h3>
        <p>
          Your query did not return any results. Please try different
          parameters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <ResultCard
        type="Kepler"
        icon={Rocket}
        results={data.results.kepler}
        total={data.total_found.kepler}
      />
      <ResultCard
        type="TESS"
        icon={Telescope}
        results={data.results.tess}
        total={data.total_found.tess}
      />
    </motion.div>
  );
};

// --- Result Components ---
const ResultCard = ({
  type,
  icon: Icon,
  results,
  total,
}: {
  type: string;
  icon: any;
  results: (KeplerResult | TessResult)[];
  total: number;
}) => (
  <motion.div variants={itemVariants}>
    <Card className="glass-effect h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-6 w-6 text-primary" />
          {type} Archive Results ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((p, i) => (
              <ResultItem key={p._id} item={p} type={type} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm p-4 text-center">
            No objects matching query in this archive.
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const ResultItem = ({
  item,
  type,
  index,
}: {
  item: KeplerResult | TessResult;
  type: string;
  index: number;
}) => {
  const isKepler = type === "Kepler";
  const keplerItem = isKepler ? (item as KeplerResult) : null;

  const dispositionColor =
    keplerItem?.koi_disposition === "CONFIRMED"
      ? "bg-green-400/20 text-green-300"
      : keplerItem?.koi_disposition === "CANDIDATE"
      ? "bg-amber-400/20 text-amber-300"
      : "bg-red-400/20 text-red-300";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={
          isKepler
            ? `/datasets/kepler/${item._id}`
            : `datasets/tess/${item._id}`
        }
        className="block p-4 rounded-lg hover:bg-primary/10 transition-colors group"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-primary group-hover:underline truncate">
              {isKepler
                ? keplerItem?.kepler_name || keplerItem?.kepoi_name
                : (item as TessResult).tic_id}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {isKepler
                ? `ID: ${keplerItem?.kepid}`
                : `Orbital Period (days): ${
                    (item as TessResult).orbital_period?.toFixed(2) ?? "N/A"
                  }`}
            </p>
          </div>
          {isKepler && keplerItem?.koi_disposition && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-medium whitespace-nowrap ${dispositionColor}`}
            >
              {keplerItem.koi_disposition}
            </span>
          )}
        </div>
      </Link>
      <Separator className="bg-primary/10" />
    </motion.div>
  );
};

export default SearchPage;
