// src/pages/auth/SignupPage.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/api";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("A valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
type SignupFormValues = z.infer<typeof signupSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
} as const;

const SignupPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  // Get the new 'login' function from the store
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setApiError(null);
    try {
      const response = await apiClient.post("/auth/signup", data);
      setIsSuccess(true);

      const { access_token, user, message } = response.data;

      // --- THE GUARANTEED AUTO-LOGIN FLOW ---

      // 1. Call the new atomic 'login' function. This handles localStorage,
      //    token, user, and isAuthenticated state all at once.
      login(access_token, user);

      // 2. Show a success toast.
      toast.success(message || "Account created! Welcome to Brahmanda.");

      // 3. Navigate to the dashboard. The ProtectedRoute will now see
      //    isAuthenticated=true because the state update is complete.
      setTimeout(() => {
        // Use the recommended simplified route if you've updated App.tsx
        // If not, use "/app/dashboard"
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          setApiError(detail);
        } else {
          setApiError(
            "Signup failed. The email or username may already be in use."
          );
        }
      } else {
        setApiError("A network or system error occurred. Please try again.");
      }
      setIsSuccess(false); // Reset success state on error
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Card className="glass-effect hud-corners overflow-hidden">
        <CardHeader className="text-center">
          <motion.div
            variants={itemVariants}
            className="mx-auto bg-primary/20 rounded-full p-3 w-fit mb-4"
          >
            <UserPlus className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-3xl font-display text-glow glitch-effect [animation-iteration-count:1]">
              Join the Mission
            </CardTitle>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground pt-2"
          >
            Create your credentials to begin exploring with Brahmanda.
          </motion.p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-center text-destructive bg-destructive/10 p-2 rounded-md"
              >
                {apiError}
              </motion.p>
            )}
            <motion.div
              variants={itemVariants}
              className="space-y-2 input-underline-effect"
            >
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="StarGazer_42"
                className="bg-transparent border-0 border-b-2 border-primary/20 rounded-none px-1 focus-visible:ring-0"
                {...register("username")}
                disabled={isSubmitting || isSuccess}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="space-y-2 input-underline-effect"
            >
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="explorer@brahmanda.io"
                className="bg-transparent border-0 border-b-2 border-primary/20 rounded-none px-1 focus-visible:ring-0"
                {...register("email")}
                disabled={isSubmitting || isSuccess}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="space-y-2 input-underline-effect"
            >
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                className="bg-transparent border-0 border-b-2 border-primary/20 rounded-none px-1 focus-visible:ring-0"
                {...register("password")}
                disabled={isSubmitting || isSuccess}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
              <Button
                type="submit"
                className="w-full text-lg transition-all duration-300"
                disabled={isSubmitting || isSuccess}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={
                      isSuccess
                        ? "success"
                        : isSubmitting
                        ? "submitting"
                        : "idle"
                    }
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    {isSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-5 w-5" /> Success!
                        Entering Console...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Registering Identity...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary/90 hover:text-primary transition-colors underline"
            >
              Access the Console
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SignupPage;
