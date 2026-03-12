export interface Project {
  // MongoDB returns _id, but we also map id for convenience
  _id?: string;
  id: string;
  clientEmail: string;
  clientName: string;
  projectName: string;
  description: string;
  websiteType: string;
  numberOfPages: number;
  featuresNeeded: string[];
  techStack: string;
  referenceWebsites: string;
  budgetRange: string;
  deadline: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  fileName: string;
  contactMethod: string;
  status: "Pending" | "In Review" | "In Progress" | "Completed" | "Delivered";
  adminDecision: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  notes: { text: string; date: string }[];
}

export interface User {
  name: string;
  email: string;
  isAdmin: boolean;
}
