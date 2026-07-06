export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}


export interface LeadEmailItem {
  company: string;
  contactName: string;
  email: string;
  status: string;
  temperature: string;
  time?: string; 
  date?: string; 
}

export interface TaskEmailItem {
  title: string;
  priority: string;
  tag: string;
  dueTime?: string;
  completed: boolean;
}