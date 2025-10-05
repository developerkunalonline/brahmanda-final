// src/pages/settings/SettingsPage.tsx
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuthStore();

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Update functionality is a placeholder.");
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
        Account Settings
      </h1>
      <Card className="glass-effect p-6">
        <CardHeader className="p-0">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue={user?.username} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                disabled
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      <Alert className="glass-effect !border-secondary/50">
        <Terminal className="h-4 w-4 text-secondary" />
        <AlertTitle>Developer Note</AlertTitle>
        <AlertDescription>
          The "Save Changes" functionality is a placeholder. To fully implement
          this, a `PUT /api/v1/auth/users/me` endpoint would need to be created
          in the FastAPI backend.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SettingsPage;
