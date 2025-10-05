// src/pages/auth/LoginPage.tsx
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/api";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Loader2, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("A valid email is required to establish connection."),
  password: z.string().min(1, "Password is required."),
});
type LoginFormValues = z.infer<typeof loginSchema>;

// Animation Variants
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

const LoginPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get the new 'login' function
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);

      const response = await apiClient.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setIsSuccess(true);
      const { access_token, user, message } = response.data;

      // --- ROBUST AUTO-LOGIN FLOW ---
      // 1. Call the atomic 'login' function: sets token and user data atomically
      login(access_token, user);

      // 2. Display a success toast message
      toast.success(message || "Access Granted! Welcome back, Explorer.");

      // 3. Navigate to the dashboard after a slight delay for the animation
      setTimeout(() => {
        navigate("/dashboard"); // Use the correct path
      }, 1500);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          setApiError(detail);
        } else {
          setApiError("Login failed. Please check your credentials.");
        }
      } else {
        setApiError("An unexpected system error occurred. Please try again.");
      }
      setIsSuccess(false);
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
            <LogIn className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-3xl font-display text-glow glitch-effect [animation-iteration-count:1]">
              Access Console
            </CardTitle>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground pt-2"
          >
            Authenticate to continue your mission with Brahmanda.
          </motion.p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <Label htmlFor="email">Email</Label>
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
            <motion.div variants={itemVariants}>
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
                        <CheckCircle className="mr-2 h-5 w-5" /> Access Granted
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        Verifying Credentials...
                      </>
                    ) : (
                      "Engage Console"
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
            New to the mission?{" "}
            <Link
              to="/signup"
              className="font-semibold text-primary/90 hover:text-primary transition-colors underline"
            >
              Create an account
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
