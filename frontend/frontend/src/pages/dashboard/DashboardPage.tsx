// src/pages/dashboard/DashboardPage.tsx
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { Rocket, Binary, Users, Signal, FileCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveCounter } from "@/components/shared/LiveCounter";

// --- API Functions (remain the same) ---
const fetchDistributionData = async () => {
  /* ... */
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
} as const;

// --- Main Dashboard Component ---
const DashboardPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dispositionDistribution"],
    queryFn: fetchDistributionData,
  });

  // Placeholder data for the activity feed to make it feel alive
  const activityFeed = [
    {
      icon: Signal,
      text: "New signal detected from TIC 288735205",
      time: "2m ago",
      color: "text-green-400",
    },
    {
      icon: FileCheck,
      text: "Candidate Kepler-1649c confirmed",
      time: "1h ago",
      color: "text-primary",
    },
    {
      icon: Search,
      text: "Search complete for 'Trappist'",
      time: "3h ago",
      color: "text-muted-foreground",
    },
    {
      icon: Signal,
      text: "Data stream from TESS Sector 52 active",
      time: "8h ago",
      color: "text-green-400",
    },
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-bold text-glow">
          Mission Control
        </h1>
        <p className="text-muted-foreground">
          Welcome back, Explorer. Here is the current status of your universe.
        </p>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- Left/Main Column --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stat Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <StatCard icon={Rocket} label="Confirmed Planets" value={5637} />
            <StatCard icon={Users} label="Kepler Candidates" value={9791} />
            <StatCard icon={Signal} label="TESS Objects" value={7142} />
            <StatCard
              icon={Binary}
              label="Data Points (M)"
              value={275}
              isMillion
            />
          </motion.div>

          {/* Chart Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-effect hud-corners scanline-effect">
              <CardHeader>
                <CardTitle>Kepler Planet Disposition Analysis</CardTitle>
                <CardDescription>
                  Classification summary of candidate objects from the Kepler
                  mission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <Skeleton className="h-[300px] w-full" />}
                {isError && (
                  <p className="text-center text-destructive">
                    Could not load chart data from command.
                  </p>
                )}
                {data != null && (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer>
                      <BarChart data={data}>
                        <defs>
                          <linearGradient
                            id="colorUv"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          stroke="hsl(var(--border) / 0.5)"
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background) / 0.8)",
                            borderColor: "hsl(var(--primary) / 0.2)",
                            backdropFilter: "blur(4px)",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="url(#colorUv)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* --- Right/Side Column --- */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass-effect h-full">
            <CardHeader>
              <CardTitle>System Activity Feed</CardTitle>
              <CardDescription>Live updates from the network.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activityFeed.map((item, index) => (
                  <li key={index} className="flex items-start gap-4 text-sm">
                    <div className="mt-1">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, isMillion = false }: any) => (
    <Card className="glass-effect hud-corners">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">
                <div className="flex items-baseline">
                    <LiveCounter to={value} />
                    {isMillion && <span className="text-2xl ml-1">M</span>}
                </div>
            </div>
        </CardContent>
    </Card>
);


export default DashboardPage;
