export type BeltLevel = 
  | 'White' 
  | 'Yellow' 
  | 'Orange' 
  | 'Green' 
  | 'Blue' 
  | 'Purple' 
  | 'Brown' 
  | 'Black';

export interface Student {
  id: string;
  name: string;
  belt: BeltLevel;
  kyuDan: string;
  avatar: string;
  attendance: number;
  targetAttendance: number;
  streak: number;
  progress: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface GradingStep {
  id: number;
  title: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Locked';
  progress?: number;
  requirement?: string;
  value?: string;
  subItems?: { name: string; status: 'Mastered' | 'In Progress' | 'Not Started' | 'Pending Approval'; count?: string }[];
}
