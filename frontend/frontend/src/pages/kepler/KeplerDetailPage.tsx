// src/pages/kepler/KeplerDetailPage.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api";
import { ExoplanetVisualizer } from "@/components/shared/ExoplanetVisualizer";
import { generateTextureFromAPI } from "@/services/stabilityApiService";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// --- THE "BRAIN": AI PROMPT ENGINE ---
const generateStructuredPrompt = (
  data: any
): { prompt: string; negative_prompt: string } => {
  let prompt =
    "Create a 2D image that will be used as a texture map on a 3D sphere. The left and right edges MUST be perfectly identical to create a seamless, horizontally tileable texture. This is an equirectangular projection of a planet's surface. ";
  prompt +=
    "STYLE: Photorealistic, high-resolution satellite imagery, NASA scientific visualization style, hyper-detailed. ";

  const temp = data.koi_teq;
  const radius = data.koi_prad;
  let planetType = "rocky";
  if (radius > 4) planetType = "neptune-like";
  else if (radius > 1.7) planetType = "mini-neptune";

  if (planetType.includes("neptune")) {
    prompt += "SUBJECT: The swirling cloud tops of a gas giant planet. ";
    if (temp < 200)
      prompt +=
        "FEATURES: Calm, parallel bands of frozen ammonia and methane clouds in white, pale blue, and light grey. ";
    else
      prompt +=
        "FEATURES: Dynamic, turbulent bands of colored gas in orange, brown, cream, and white. Massive hurricane-like storm systems. ";
  } else {
    prompt +=
      "SUBJECT: The solid, rocky surface of a terrestrial planet as seen from orbit. ";
    if (temp < 150)
      prompt +=
        "FEATURES: A deep-freeze iceball world. The entire surface is thick, cracked glaciers of white and blue water ice. ";
    else if (temp < 273)
      prompt +=
        "FEATURES: A frigid world with large polar ice caps, continents of barren frost-covered rock, and dark frozen oceans. ";
    else if (temp < 373)
      prompt +=
        "FEATURES: A temperate world with liquid water, green forests, yellow deserts, and snow-capped mountains, separated by deep blue oceans. ";
    else if (temp < 600)
      prompt +=
        "FEATURES: A hot, arid desert planet. The surface is a vast, dry expanse of red and orange rock and sand dunes. ";
    else if (temp < 900)
      prompt +=
        "FEATURES: A scorching hot volcanic world with black volcanic rock and glowing orange rivers of molten lava. ";
    else
      prompt +=
        "FEATURES: An extreme, molten-surface planet. The entire surface is a glowing, churning ocean of red and yellow magma. ";
  }
  prompt += "Include a few scattered, ancient impact craters for realism. ";
  const negative_prompt =
    "seam, visible edge, border, abrupt change, stars, galaxy, nebula, space background, unrealistic, 3d render, text, watermark, signature, ugly, blurry, cartoony, earth";

  return { prompt, negative_prompt };
};

// --- Main Detail Page Component ---
const KeplerDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  // THE CRITICAL FIX: The `select` option is used to extract the nested `data` object from the API response.
  // The `planetData` constant will now correctly hold the object with planet properties.
  const {
    data: planetData,
    isLoading: isPlanetDataLoading,
    isError: isPlanetDataError,
  } = useQuery({
    queryKey: ["keplerDetail", id],
    queryFn: async () => (await apiClient.get(`/datasets/kepler/${id}`)).data,
    select: (response) => response.data,
    enabled: !!id,
  });

  const [textureUrl, setTextureUrl] = useState<string | null>(null);
  const [textureStatus, setTextureStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [textureError, setTextureError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchTexture = async () => {
      if (!planetData) return;

      setTextureStatus("loading");
      setTextureError(null);
      if (textureUrl && textureUrl.startsWith("blob:"))
        URL.revokeObjectURL(textureUrl);

      try {
        const { prompt, negative_prompt } =
          generateStructuredPrompt(planetData);
        const url = await generateTextureFromAPI(prompt, negative_prompt);
        if (isMounted.current) {
          setTextureUrl(url);
          setTextureStatus("success");
        }
      } catch (err: any) {
        if (isMounted.current) {
          setTextureError(
            err.message || "An unknown error occurred during AI generation."
          );
          setTextureStatus("error");
        }
      }
    };

    fetchTexture();

    return () => {
      // Cleanup function
      isMounted.current = false;
      if (textureUrl && textureUrl.startsWith("blob:"))
        URL.revokeObjectURL(textureUrl);
    };
  }, [planetData]);

  if (isPlanetDataLoading) return <PageSkeleton />;
  if (isPlanetDataError) return <PageError />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* --- LEFT COLUMN: DATA PANELS --- */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-6 overflow-y-auto"
      >
        <Card className="glass-effect hud-corners">
          <CardHeader>
            <CardTitle className="text-4xl font-display text-glow">
              {planetData.kepler_name || planetData.koi_name}
            </CardTitle>
            <p className="text-primary font-mono text-lg">{`KOI Name: ${planetData.kepoi_name}`}</p>
            <Separator className="my-2 bg-primary/20" />
            <p className="text-muted-foreground text-sm">
              This visualization is an artistic interpretation generated by AI
              based on available scientific data.
            </p>
          </CardHeader>
        </Card>

        {/* --- Defensive data access (`?.` and `??`) is used to prevent runtime errors --- */}
        <DataCard title="Physical Characteristics">
          <DataItem
            label="Disposition"
            value={planetData.koi_disposition ?? "N/A"}
            highlight
          />
          <DataItem
            label="Planet Radius (vs Earth)"
            value={`${planetData.koi_prad?.toFixed(2) ?? "N/A"}x`}
          />
          <DataItem
            label="Planet Mass (vs Earth)"
            value={`${planetData.koi_pmas?.toFixed(2) ?? "N/A"}x`}
          />
          <DataItem
            label="Equilibrium Temperature"
            value={`${planetData.koi_teq ?? "N/A"} K`}
          />
          <DataItem
            label="Insolation Flux (Earth Flux)"
            value={planetData.koi_insol ?? "N/A"}
          />
        </DataCard>

        <DataCard title="Orbital Properties">
          <DataItem
            label="Orbital Period"
            value={`${planetData.koi_period?.toFixed(2) ?? "N/A"} days`}
          />
          <DataItem
            label="Orbit Semi-Major Axis"
            value={`${planetData.koi_sma?.toFixed(3) ?? "N/A"} AU`}
          />
          <DataItem
            label="Transit Duration"
            value={`${planetData.koi_duration?.toFixed(2) ?? "N/A"} hours`}
          />
          <DataItem
            label="Inclination"
            value={`${planetData.koi_incl?.toFixed(4) ?? "N/A"}°`}
          />
        </DataCard>

        <DataCard title="Host Star Details">
          <DataItem
            label="Star Temperature"
            value={`${planetData.koi_steff ?? "N/A"} K`}
          />
          <DataItem
            label="Star Radius (vs Sol)"
            value={`${planetData.koi_srad?.toFixed(2) ?? "N/A"}x`}
          />
          <DataItem
            label="Star Mass (vs Sol)"
            value={`${planetData.koi_smas?.toFixed(2) ?? "N/A"}x`}
          />
          <DataItem
            label="Surface Gravity (log(cm/s²))"
            value={planetData.koi_slogg ?? "N/A"}
          />
        </DataCard>
      </motion.div>

      {/* --- RIGHT COLUMN: 3D VISUALIZER --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="relative h-[calc(100vh-10rem)] -m-8 lg:m-0 rounded-lg overflow-hidden glass-effect hud-corners"
      >
        {textureStatus === "success" && textureUrl && (
          <ExoplanetVisualizer
            planetData={planetData}
            textureUrl={textureUrl}
          />
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
          <StatusPanel status={textureStatus} error={textureError} />
        </div>
      </motion.div>
    </div>
  );
};

// --- Helper UI Components ---

const DataCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="glass-effect">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

const DataItem = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => {
  const dispositionColor =
    value === "CONFIRMED"
      ? "bg-green-400/20 text-green-300"
      : value === "CANDIDATE"
      ? "bg-amber-400/20 text-amber-300"
      : "bg-red-400/20 text-red-300";

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <p className="text-muted-foreground">{label}</p>
        {highlight ? (
          <span
            className={`px-3 py-1 text-sm rounded-full font-semibold w-fit justify-self-end ${dispositionColor}`}
          >
            {value}
          </span>
        ) : (
          <p className="font-semibold text-lg text-right font-mono text-foreground">
            {value ?? "N/A"}
          </p>
        )}
      </div>
      <Separator className="mt-3 bg-primary/10" />
    </div>
  );
};

const StatusPanel = ({
  status,
  error,
}: {
  status: string;
  error: string | null;
}) => {
  if (status === "idle" || status === "loading") {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-effect p-3 rounded-lg flex items-center gap-3 max-w-xs mx-auto shadow-lg"
      >
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <span className="font-semibold">Generating Planet Texture...</span>
      </motion.div>
    );
  }
  if (status === "error") {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Alert
          variant="destructive"
          className="glass-effect max-w-xs mx-auto shadow-lg"
        >
          <ServerCrash className="h-5 w-5" />
          <AlertTitle>Texture Generation Failed</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      </motion.div>
    );
  }
  return null;
};

const PageSkeleton = () => (
  <div className="flex items-center justify-center h-full text-center p-16 flex-col">
    <Loader2 className="h-12 w-12 text-primary animate-spin" />
    <h3 className="mt-4 text-xl font-semibold">Loading Archive Data...</h3>
    <p className="text-muted-foreground">
      Please wait while we establish a connection to the Kepler archives.
    </p>
  </div>
);

const PageError = () => (
  <div className="flex items-center justify-center h-full">
    <Alert variant="destructive" className="glass-effect m-8 max-w-lg">
      <ServerCrash className="h-5 w-5" />
      <AlertTitle>Failed to Retrieve Planet Data</AlertTitle>
      <AlertDescription>
        Could not establish a connection with the Kepler archives. Please try
        again later or select a different object.
      </AlertDescription>
    </Alert>
  </div>
);

export default KeplerDetailPage;
