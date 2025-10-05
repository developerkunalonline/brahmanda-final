// src/pages/my-research/MyResearchPage.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { apiClient } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  BookOpen,
  Loader2,
  Rocket,
  FileX,
  Info,
  PlusCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// --- Zod Schema with .refine() for Robust Number Validation ---
const predictionSchema = z.object({
  customIdentifier: z.string().min(1, "Identifier is required"),
  koi_period: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_time0bk: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_impact: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .min(0),
  koi_duration: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_depth: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_prad: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_teq: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_insol: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_model_snr: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_steff: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_slogg: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_srad: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  ra: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  dec: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
  koi_kepmag: z.coerce
    .number()
    .refine((val) => !isNaN(val), { message: "Must be a valid number" })
    .positive("Must be positive"),
});
type PredictionFormValues = z.infer<typeof predictionSchema>;

// --- API FUNCTIONS (Prediction) ---
const runPrediction = async (data: PredictionFormValues) =>
  (await apiClient.post("/predictions/predict", data)).data;
const fetchPredictionHistory = async () =>
  (await apiClient.get("/predictions/history")).data;

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

// --- MAIN PAGE COMPONENT ---
const MyResearchPage = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold text-glow">
          My Research Hub
        </h1>
        <p className="text-muted-foreground">
          Run new AI predictions and manage your personal research log.
        </p>
      </motion.div>

      <Tabs defaultValue="predictions" className="w-full">
        <motion.div variants={itemVariants}>
          <TabsList className="grid w-full grid-cols-2 h-12 p-1">
            <TabsTrigger value="predictions" className="text-md">
              <BrainCircuit className="mr-2 h-5 w-5" /> AI Predictions
            </TabsTrigger>
            <TabsTrigger value="log" className="text-md">
              <BookOpen className="mr-2 h-5 w-5" /> Research Log
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="predictions" className="mt-6">
          <AIPredictionTab />
        </TabsContent>
        <TabsContent value="log" className="mt-6">
          <ResearchLogTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// --- AI PREDICTION TAB COMPONENT ---
const AIPredictionTab = () => {
  const queryClient = useQueryClient();

  const predictionMutation = useMutation({
    mutationFn: runPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictionHistory"] });
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.detail ||
        error.message ||
        "An unknown error occurred during prediction.";
      toast.error(errorMsg);
    },
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["predictionHistory"],
    queryFn: fetchPredictionHistory,
  });

  const handleVisualize = (predictionData: any) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-primary" />
          <p>
            Visualization for custom predictions is a feature for a future
            milestone.
          </p>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {predictionMutation.isIdle && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PredictionForm
              onSubmit={predictionMutation.mutate}
              isPending={predictionMutation.isPending}
            />
          </motion.div>
        )}
        {predictionMutation.isPending && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PredictionLoadingState />
          </motion.div>
        )}
        {predictionMutation.isSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PredictionResultCard
              result={predictionMutation.data}
              onVisualize={handleVisualize}
              onReset={() => predictionMutation.reset()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <PredictionHistory
        history={historyData?.predictions}
        isLoading={isHistoryLoading}
      />
    </div>
  );
};

// --- PREDICTION FORM COMPONENT ---
const PredictionForm = ({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: PredictionFormValues) => void;
  isPending: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionSchema),
  });

  const formFields: {
    name: keyof PredictionFormValues;
    label: string;
    placeholder: string;
    type: string;
  }[] = [
    {
      name: "customIdentifier",
      label: "Custom Identifier",
      placeholder: "e.g., My Candidate 1",
      type: "text",
    },
    {
      name: "koi_period",
      label: "Orbital Period (days)",
      placeholder: "e.g., 35.5",
      type: "number",
    },
    {
      name: "koi_time0bk",
      label: "Transit Epoch",
      placeholder: "e.g., 135.6",
      type: "number",
    },
    {
      name: "koi_impact",
      label: "Impact Parameter",
      placeholder: "e.g., 0.6",
      type: "number",
    },
    {
      name: "koi_duration",
      label: "Transit Duration (hours)",
      placeholder: "e.g., 7.3",
      type: "number",
    },
    {
      name: "koi_depth",
      label: "Transit Depth (ppm)",
      placeholder: "e.g., 1550.2",
      type: "number",
    },
    {
      name: "koi_prad",
      label: "Planetary Radius",
      placeholder: "e.g., 2.24",
      type: "number",
    },
    {
      name: "koi_teq",
      label: "Equilibrium Temp (K)",
      placeholder: "e.g., 793",
      type: "number",
    },
    {
      name: "koi_insol",
      label: "Insolation Flux",
      placeholder: "e.g., 250.5",
      type: "number",
    },
    {
      name: "koi_model_snr",
      label: "Transit S/N",
      placeholder: "e.g., 12.7",
      type: "number",
    },
    {
      name: "koi_steff",
      label: "Stellar Temp (K)",
      placeholder: "e.g., 5400",
      type: "number",
    },
    {
      name: "koi_slogg",
      label: "Stellar Gravity",
      placeholder: "e.g., 4.3",
      type: "number",
    },
    {
      name: "koi_srad",
      label: "Stellar Radius",
      placeholder: "e.g., 0.9",
      type: "number",
    },
    {
      name: "ra",
      label: "Right Ascension (deg)",
      placeholder: "e.g., 290.12",
      type: "number",
    },
    {
      name: "dec",
      label: "Declination (deg)",
      placeholder: "e.g., 44.21",
      type: "number",
    },
    {
      name: "koi_kepmag",
      label: "Kepler-band Mag",
      placeholder: "e.g., 14.5",
      type: "number",
    },
  ];

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle>AI Prediction Terminal</CardTitle>
        <CardDescription>
          Input stellar data to run a prediction against the Brahmanda AI model.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  step="any"
                  placeholder={field.placeholder}
                  {...register(field.name)}
                  className="bg-background/50"
                />
                {errors[field.name] && (
                  <p className="text-xs text-destructive">
                    {errors[field.name]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="mt-6 w-full text-lg"
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Run Prediction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// --- PREDICTION STATE COMPONENTS ---
const PredictionLoadingState = () => (
  <div className="text-center py-24 glass-effect rounded-lg flex flex-col items-center">
    <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />
    <h3 className="mt-4 text-2xl font-semibold text-glow">Analyzing Data...</h3>
    <p className="text-muted-foreground mt-2 max-w-sm">
      The Brahmanda AI model is processing the transit data. This may take a
      moment.
    </p>
  </div>
);

const PredictionResultCard = ({
  result,
  onVisualize,
  onReset,
}: {
  result: any;
  onVisualize: (data: any) => void;
  onReset: () => void;
}) => {
  const { prediction } = result;
  const isExoplanet = prediction.isExoplanet;
  const confidencePercent = (prediction.confidence * 100).toFixed(2);

  return (
    <Card
      className={`glass-effect hud-corners border-2 ${
        isExoplanet ? "border-green-400/50" : "border-red-400/50"
      }`}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-display">
          Prediction Complete
        </CardTitle>
        <CardDescription>{result.message}</CardDescription>
      </CardHeader>
      <CardContent className="text-center flex flex-col items-center">
        <div
          className={`p-4 rounded-full mb-4 ${
            isExoplanet ? "bg-green-400/20" : "bg-red-400/20"
          }`}
        >
          {isExoplanet ? (
            <Rocket className="h-12 w-12 text-green-300" />
          ) : (
            <FileX className="h-12 w-12 text-red-300" />
          )}
        </div>
        <h3
          className={`text-3xl font-bold ${
            isExoplanet ? "text-green-300" : "text-red-300"
          }`}
        >
          {isExoplanet ? "Exoplanet Candidate" : "Not an Exoplanet"}
        </h3>
        <p className="text-lg text-muted-foreground">
          Confidence:{" "}
          <span className="font-mono text-xl text-foreground">
            {confidencePercent}%
          </span>
        </p>

        <Card className="text-left mt-6 w-full max-w-lg bg-background/30">
          <CardHeader>
            <CardTitle>Prediction Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="data-item">
              <span className="label text-muted-foreground text-sm">
                Identifier
              </span>
              <span className="value font-semibold">
                {prediction.candidateIdentifier}
              </span>
            </div>
            <div className="data-item">
              <span className="label text-muted-foreground text-sm">
                Planet Type
              </span>
              <span className="value font-semibold">
                {prediction.details.planetType}
              </span>
            </div>
            <div className="data-item">
              <span className="label text-muted-foreground text-sm">
                Radius (Earth)
              </span>
              <span className="value font-semibold">
                {prediction.details.radiusEarth}x
              </span>
            </div>
            <div className="data-item">
              <span className="label text-muted-foreground text-sm">
                Equilibrium Temp.
              </span>
              <span className="value font-semibold">
                {prediction.details.equilibriumTempKelvin} K
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button onClick={onReset} variant="outline" size="lg">
            Run New Prediction
          </Button>
          {isExoplanet && (
            <Button
              onClick={() => onVisualize(result)}
              size="lg"
              className="text-lg"
            >
              Visualize Planet
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PredictionHistory = ({
  history,
  isLoading,
}: {
  history?: any[];
  isLoading: boolean;
}) => (
  <Card className="glass-effect">
    <CardHeader>
      <CardTitle>Prediction History</CardTitle>
      <CardDescription>
        A log of your previous AI prediction queries.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading && (
        <p className="text-muted-foreground text-center py-8">
          Loading history...
        </p>
      )}
      {!isLoading && (!history || history.length === 0) && (
        <p className="text-muted-foreground text-center py-8">
          No predictions have been run yet.
        </p>
      )}
      {history && history.length > 0 && (
        <p className="text-muted-foreground text-center py-8">
          Prediction history table will be implemented here.
        </p>
      )}
    </CardContent>
  </Card>
);

// --- RESEARCH LOG TAB (FULLY INTEGRATED) ---
const annotationFormSchema = z.object({
  dataset_id: z.string().min(1, { message: "Dataset ID is required." }),
  dataset_type: z.enum(["kepler", "tess"], {
    errorMap: () => ({ message: "Type must be 'kepler' or 'tess'." }),
  }),
  notes: z
    .string()
    .min(10, { message: "Notes must be at least 10 characters." }),
  tags: z.string().optional(),
});
type AnnotationFormValues = z.infer<typeof annotationFormSchema>;
interface Annotation {
  id: string;
  dataset_id: string;
  dataset_type: string;
  notes: string;
  tags: string[];
}
interface AnnotationApiPayload extends Omit<Annotation, "id"> {}

const fetchAnnotations = async (): Promise<Annotation[]> =>
  (await apiClient.get("/annotations")).data;
const createAnnotation = async (newData: AnnotationApiPayload) =>
  (await apiClient.post("/annotations", newData)).data;
const updateAnnotation = async ({
  id,
  data,
}: {
  id: string;
  data: AnnotationApiPayload;
}) => (await apiClient.put(`/annotations/${id}`, data)).data;
const deleteAnnotation = async (id: string) =>
  (await apiClient.delete(`/annotations/${id}`)).data;

const ResearchLogTab = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Annotation | null>(null);

  const { data: annotations, isLoading } = useQuery({
    queryKey: ["annotations"],
    queryFn: fetchAnnotations,
  });

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations"] });
      setIsDialogOpen(false);
      toast.success("Annotation saved!");
    },
    onError: () => toast.error("Failed to save annotation."),
  });
  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations"] });
      setIsDialogOpen(false);
      setEditingNote(null);
      toast.success("Annotation updated!");
    },
    onError: () => toast.error("Failed to update annotation."),
  });
  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: deleteAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations"] });
      toast.success("Annotation deleted.");
    },
    onError: () => toast.error("Failed to delete annotation."),
  });

  const handleFormSubmit = (data: AnnotationFormValues) => {
    const payload: AnnotationApiPayload = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    };
    if (editingNote) {
      update({ id: editingNote.id, data: payload });
    } else {
      create(payload);
    }
  };

  const openEditDialog = (note: Annotation) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };
  const openNewDialog = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-bold">
              Your Annotations
            </h2>
            <p className="text-muted-foreground">
              A collection of your personal findings.
            </p>
          </div>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Annotation
            </Button>
          </DialogTrigger>
        </div>
        <AnimatePresence>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full glass-effect" />
              ))}
            </div>
          ) : annotations && annotations.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {annotations.map((note) => (
                <AnnotationCard
                  key={note.id}
                  note={note}
                  onEdit={() => openEditDialog(note)}
                  onDelete={() => remove(note.id)}
                  isDeleting={isDeleting}
                />
              ))}
            </motion.div>
          ) : (
            <AnnotationEmptyState onAddNote={openNewDialog} />
          )}
        </AnimatePresence>
      </div>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {editingNote ? "Edit Annotation" : "Create New Annotation"}
          </DialogTitle>
          <DialogDescription>
            {editingNote
              ? "Update the details of your research note."
              : "Log a new finding."}
          </DialogDescription>
        </DialogHeader>
        <AnnotationForm
          onSubmit={handleFormSubmit}
          isPending={isCreating || isUpdating}
          defaultValues={editingNote}
        />
      </DialogContent>
    </Dialog>
  );
};

const AnnotationForm = ({
  onSubmit,
  isPending,
  defaultValues,
}: {
  onSubmit: (data: AnnotationFormValues) => void;
  isPending: boolean;
  defaultValues: Annotation | null;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AnnotationFormValues>({
    resolver: zodResolver(annotationFormSchema),
    defaultValues: {
      dataset_id: defaultValues?.dataset_id || "",
      dataset_type: defaultValues?.dataset_type as
        | "kepler"
        | "tess"
        | undefined,
      notes: defaultValues?.notes || "",
      tags: defaultValues?.tags.join(", ") || "",
    },
  });

  useEffect(() => {
    reset({
      dataset_id: defaultValues?.dataset_id || "",
      dataset_type: defaultValues?.dataset_type as
        | "kepler"
        | "tess"
        | undefined,
      notes: defaultValues?.notes || "",
      tags: defaultValues?.tags.join(", ") || "",
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataset_id">Dataset ID</Label>
          <Input
            id="dataset_id"
            {...register("dataset_id")}
            disabled={isPending}
          />
          {errors.dataset_id && (
            <p className="text-xs text-destructive">
              {errors.dataset_id.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataset_type">Dataset Type</Label>
          <Input
            id="dataset_type"
            placeholder="kepler or tess"
            {...register("dataset_type")}
            disabled={isPending}
          />
          {errors.dataset_type && (
            <p className="text-xs text-destructive">
              {errors.dataset_type.message}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Research Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          disabled={isPending}
          rows={5}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          placeholder="e.g., interesting, candidate, follow-up"
          {...register("tags")}
          disabled={isPending}
        />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Save Changes" : "Save Note"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const AnnotationCard = ({
  note,
  onEdit,
  onDelete,
  isDeleting,
}: {
  note: Annotation;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => (
  <motion.div
    layout
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
  >
    <Card className="glass-effect hud-corners h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-primary break-all">
            {note.dataset_id}
          </CardTitle>
          <CardDescription>Type: {note.dataset_type}</CardDescription>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {note.notes}
        </p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 mt-auto">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-primary/20 text-primary rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const AnnotationEmptyState = ({ onAddNote }: { onAddNote: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { delay: 0.2 } }}
    className="md:col-span-2 lg:col-span-3 text-center py-24 glass-effect rounded-lg flex flex-col items-center"
  >
    <BookOpen className="h-16 w-16 text-muted-foreground" />
    <h3 className="mt-4 text-xl font-semibold">Your Research Log is Empty</h3>
    <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
      Start documenting your findings by creating your first annotation. Every
      great discovery begins with a single note.
    </p>
    <Button onClick={onAddNote} size="lg">
      <PlusCircle className="mr-2 h-5 w-5" />
      Create First Annotation
    </Button>
  </motion.div>
);

export default MyResearchPage;
