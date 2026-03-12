import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/types/project";
import { AddProjectDialog } from "@/components/AddProjectDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, FolderOpen, MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import ChatWindow from "@/components/ChatWindow";

const statusColor: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  "In Review": "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  "In Progress": "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  Completed: "bg-green-500/20 text-green-700 dark:text-green-400",
  Delivered: "bg-primary/20 text-primary",
};

const priorityColor: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  High: "bg-orange-500/20 text-orange-700 dark:text-orange-400",
  Urgent: "bg-destructive/20 text-destructive",
};

const decisionColor: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  Accepted: "bg-green-500/20 text-green-700 dark:text-green-400",
  Rejected: "bg-red-500/20 text-red-700 dark:text-red-400",
};

// Normalize MongoDB _id to id
const normalize = (p: Project): Project => ({ ...p, id: p._id || p.id });

const ClientDashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      try {
        const data = await api.get("/projects");
        setProjects(data.map(normalize));
      } catch {
        toast({ title: "Failed to load projects", variant: "destructive" });
      } finally {
        setFetching(false);
      }
    })();
  }, [user, loading, navigate]);

  const addProject = async (p: Omit<Project, "id" | "_id" | "clientEmail" | "clientName" | "status" | "adminDecision" | "notes" | "createdAt">) => {
    try {
      const created = await api.post("/projects", p);
      setProjects((prev) => [normalize(created), ...prev]);
      toast({ title: "Project submitted!" });
    } catch {
      toast({ title: "Failed to submit project", variant: "destructive" });
    }
  };

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b">
        <span className="font-bold text-xl text-primary">Webnario</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {user.name}</span>
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
            <p className="text-muted-foreground">Manage your project requests below.</p>
          </div>
          <AddProjectDialog onAdd={addProject} />
        </motion.div>

        {projects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground">Click "Add Your Project" to get started.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-lg">{p.projectName}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={priorityColor[p.priority]}>{p.priority}</Badge>
                        <Badge className={statusColor[p.status]}>{p.status}</Badge>
                        <Badge className={decisionColor[p.adminDecision || "Pending"]}>
                          {p.adminDecision === "Accepted" ? "✓ Accepted" : p.adminDecision === "Rejected" ? "✗ Rejected" : "⏳ Awaiting Decision"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Type: {p.websiteType}</span>
                      <span>Pages: {p.numberOfPages}</span>
                      {p.budgetRange && <span>Budget: {p.budgetRange}</span>}
                      {p.deadline && <span>Deadline: {p.deadline}</span>}
                    </div>
                    {p.notes && p.notes.length > 0 && (
                      <div className="mt-3 border-t pt-3 space-y-1">
                        {p.notes.map((n, ni) => (
                          <p key={ni} className="text-xs text-muted-foreground"><span className="font-medium">Admin:</span> {n.text}</p>
                        ))}
                      </div>
                    )}
                    {p.adminDecision === "Accepted" && (
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => setActiveChat({ id: p.id, name: p.projectName })}
                        >
                          <MessageSquareText className="h-4 w-4" />
                          Chat with Admin
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {activeChat && user && (
          <ChatWindow
            key={activeChat.id}
            projectId={activeChat.id}
            projectName={activeChat.name}
            currentUserEmail={user.email}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
