import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const features = ["Contact Form", "Gallery", "Blog", "Payment Integration", "Live Chat", "Newsletter", "Analytics", "Admin Panel", "Social Media Integration"];

type ProjectFormData = {
  projectName: string;
  description: string;
  websiteType: string;
  numberOfPages: number;
  featuresNeeded: string[];
  techStack: string;
  referenceWebsites: string;
  budgetRange: string;
  deadline: string;
  priority: Project["priority"];
  contactMethod: string;
};

export const AddProjectDialog = ({ onAdd }: { onAdd: (p: ProjectFormData) => void }) => {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [websiteType, setWebsiteType] = useState("");
  const [numberOfPages, setNumberOfPages] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [techStack, setTechStack] = useState("");
  const [referenceWebsites, setReferenceWebsites] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [priority, setPriority] = useState<Project["priority"]>("Medium");
  const [contactMethod, setContactMethod] = useState("");

  const resetForm = () => {
    setProjectName(""); setDescription(""); setWebsiteType(""); setNumberOfPages("");
    setSelectedFeatures([]); setTechStack(""); setReferenceWebsites(""); setBudgetRange("");
    setDeadline(undefined); setPriority("Medium"); setContactMethod("");
  };

  const handleSubmit = () => {
    if (!projectName || !description || !websiteType) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    const projectData: ProjectFormData = {
      projectName, description, websiteType,
      numberOfPages: parseInt(numberOfPages) || 1,
      featuresNeeded: selectedFeatures, techStack, referenceWebsites, budgetRange,
      deadline: deadline ? format(deadline, "yyyy-MM-dd") : "",
      priority, contactMethod,
    };
    onAdd(projectData);
    resetForm();
    setOpen(false);
  };

  const toggleFeature = (f: string) =>
    setSelectedFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" /> Add Your Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Submit a New Project</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My Website" />
              </div>
              <div className="space-y-2">
                <Label>Website Type *</Label>
                <Select value={websiteType} onValueChange={setWebsiteType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["Business", "E-commerce", "Portfolio", "Blog", "Other"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your project..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Pages</Label>
                <Input type="number" value={numberOfPages} onChange={(e) => setNumberOfPages(e.target.value)} placeholder="5" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Tech Stack Preference</Label>
                <Select value={techStack} onValueChange={setTechStack}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {["React", "Next.js", "WordPress", "Shopify", "Custom HTML/CSS", "No Preference"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features Needed</Label>
              <div className="grid grid-cols-2 gap-2">
                {features.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={selectedFeatures.includes(f)} onCheckedChange={() => toggleFeature(f)} />
                    {f}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Websites</Label>
              <Textarea value={referenceWebsites} onChange={(e) => setReferenceWebsites(e.target.value)} placeholder="Paste URLs of websites you like..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <Select value={budgetRange} onValueChange={setBudgetRange}>
                  <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                  <SelectContent>
                    {["₹4,000 - ₹10,000", "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "₹50,000 - ₹1,00,000", "₹1,00,000+"].map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Project["priority"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Low", "Medium", "High", "Urgent"] as const).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={deadline} onSelect={setDeadline} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Contact Method</Label>
                <Select value={contactMethod} onValueChange={setContactMethod}>
                  <SelectTrigger><SelectValue placeholder="Preferred contact" /></SelectTrigger>
                  <SelectContent>
                    {["Email", "Phone", "WhatsApp"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full">Submit Project</Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
