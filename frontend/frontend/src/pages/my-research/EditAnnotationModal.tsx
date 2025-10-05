// src/pages/annotations/EditAnnotationModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/api";
import { useEffect } from "react";
import type { Annotation } from "@/types";
import type { AnnotationUpdatePayload } from "./MyResearchPage";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";

const editSchema = z.object({
  notes: z.string().min(10, "Notes must be at least 10 characters."),
  tags: z.string().optional(),
});
type EditFormValues = z.infer<typeof editSchema>;

interface EditAnnotationModalProps {
  annotation: Annotation | null;
  isOpen: boolean;
  onClose: () => void;
}

const updateAnnotation = async ({ id, data }: { id: string; data: AnnotationUpdatePayload }) => {
  return (await apiClient.put(`/annotations/${id}`, data)).data;
};

const EditAnnotationModal = ({ annotation, isOpen, onClose }: EditAnnotationModalProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  // Pre-fill form when the modal opens with a new annotation
  useEffect(() => {
    if (annotation) {
      reset({
        notes: annotation.notes,
        tags: annotation.tags.join(", "),
      });
    }
  }, [annotation, reset]);

  const mutation = useMutation({
    mutationFn: updateAnnotation,
    onSuccess: (updatedAnnotation) => {
      queryClient.setQueryData(["annotations"], (oldData: Annotation[] | undefined) =>
        oldData?.map((a) => (a.id === updatedAnnotation.id ? updatedAnnotation : a))
      );
      toast.success("Annotation updated!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update annotation.");
    },
  });

  const onSubmit = (data: EditFormValues) => {
    if (!annotation) return;
    const payload: AnnotationUpdatePayload = {
      notes: data.notes,
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    mutation.mutate({ id: annotation.id, data: payload });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect">
        <DialogHeader>
          <DialogTitle>Edit Annotation</DialogTitle>
          <DialogDescription>
            Modify your research notes for dataset ID: {annotation?.dataset_id}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" {...register("notes")} rows={6} />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
            <Input id="edit-tags" {...register("tags")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAnnotationModal;