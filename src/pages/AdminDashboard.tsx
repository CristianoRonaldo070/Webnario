import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/types/project";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Trash2, MessageSquare, Search, Shield, CheckCircle, XCircle, MessageSquareText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import ChatWindow from "@/components/ChatWindow";

const STATUSES: Project["status"][] = ["Pending", "In Review", "In Progress", "Completed", "Delivered"];
const WEBSITE_TYPES = ["All", "Business", "E-commerce", "Portfolio", "Blog", "Other"];

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
  Pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  Accepted: "bg-green-500/20 text-green-700 dark:text-green-400",
  Rejected: "bg-red-500/20 text-red-700 dark:text-red-400",
};

const normalize = (p: Project): Project => ({ ...p, id: p._id || p.id });

const AdminDashboard = () => {
  const { user, isAdmin, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [noteText, setNoteText] = useState("");
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin) { navigate("/login"); return; }
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
  }, [user, isAdmin, loading, navigate]);

  const updateStatus = async (id: string, status: Project["status"]) => {
    try {
      const updated = await api.patch(`/projects/${id}/status`, { status });
      setProjects((prev) => prev.map((p) => (p.id === id ? normalize(updated) : p)));
      toast({ title: `Status updated to ${status}` });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const updateDecision = async (id: string, decision: "Accepted" | "Rejected") => {
    try {
      const updated = await api.patch(`/projects/${id}/decision`, { decision });
      setProjects((prev) => prev.map((p) => (p.id === id ? normalize(updated) : p)));
      toast({ title: `Project ${decision}` });
    } catch {
      toast({ title: "Failed to update decision", variant: "destructive" });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Project deleted" });
    } catch {
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };

  const addNote = async (id: string) => {
    if (!noteText.trim()) return;
    try {
      const updated = await api.post(`/projects/${id}/notes`, { text: noteText });
      setProjects((prev) => prev.map((p) => (p.id === id ? normalize(updated) : p)));
      setNoteText("");
      toast({ title: "Note added" });
    } catch {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.projectName.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchPriority = filterPriority === "all" || p.priority === filterPriority;
    const matchTab = activeTab === "All" || p.websiteType === activeTab;
    return matchSearch && matchStatus && matchPriority && matchTab;
  });

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Loading admin panel...</p>
    </div>
  );
  if (!user || !isAdmin) return null;

  const ProjectCard = ({ p, i }: { p: Project; i: number }) => (
    <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg">{p.projectName}</CardTitle>
              <p className="text-sm text-muted-foreground">by {p.clientName} ({p.clientEmail})</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={priorityColor[p.priority]}>{p.priority}</Badge>
              <Badge className={decisionColor[p.adminDecision || "Pending"]}>
                {p.adminDecision || "Pending"}
              </Badge>
              <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v as Project["status"])}>
                <SelectTrigger className="h-8 w-[140px]">
                  <Badge className={statusColor[p.status]}>{p.status}</Badge>
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
            <span>Type: {p.websiteType}</span>
            <span>Pages: {p.numberOfPages}</span>
            {p.budgetRange && <span>Budget: {p.budgetRange}</span>}
            {p.deadline && <span>Deadline: {p.deadline}</span>}
            {p.techStack && <span>Stack: {p.techStack}</span>}
            {p.contactMethod && <span>Contact: {p.contactMethod}</span>}
            <span>Submitted: {new Date(p.createdAt).toLocaleDateString()}</span>
          </div>
          {p.featuresNeeded && p.featuresNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {p.featuresNeeded.map((f) => <Badge key={f} variant="outline" className="text-xs">{f}</Badge>)}
            </div>
          )}
          {p.notes && p.notes.length > 0 && (
            <div className="border-t pt-3 mb-3 space-y-1">
              {p.notes.map((n, ni) => (
                <p key={ni} className="text-xs text-muted-foreground">
                  <span className="font-medium">{new Date(n.date).toLocaleDateString()}:</span> {n.text}
                </p>
              ))}
            </div>
          )}
          {/* Accept / Reject / Note / Delete */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-green-500/50 text-green-600 hover:bg-green-500/10"
              disabled={p.adminDecision === "Accepted"}
              onClick={() => updateDecision(p.id, "Accepted")}
            >
              <CheckCircle className="h-3 w-3" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 border-red-500/50 text-red-600 hover:bg-red-500/10"
              disabled={p.adminDecision === "Rejected"}
              onClick={() => updateDecision(p.id, "Rejected")}
            >
              <XCircle className="h-3 w-3" /> Reject
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" /> Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Note to {p.projectName}</DialogTitle></DialogHeader>
                <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write a note..." />
                <Button onClick={() => addNote(p.id)}>Add Note</Button>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-1">
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{p.projectName}"?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteProject(p.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {p.adminDecision === "Accepted" && (
              <Button
                size="sm"
                className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setActiveChat({ id: p.id, name: p.projectName })}
              >
                <MessageSquareText className="h-3 w-3" /> Live Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold text-xl text-primary">Webnario Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-8">{projects.length} total project{projects.length !== 1 ? "s" : ""}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by project or client..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {["Low", "Medium", "High", "Urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            {WEBSITE_TYPES.map((type) => {
              const count = type === "All" ? projects.length : projects.filter((p) => p.websiteType === type).length;
              return (
                <TabsTrigger key={type} value={type} className="gap-1">
                  {type}
                  <span className="ml-1 text-xs opacity-70">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {WEBSITE_TYPES.map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">No projects found.</div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
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

export default AdminDashboard;
