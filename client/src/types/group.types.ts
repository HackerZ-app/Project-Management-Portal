import { User } from './auth.types';
import { CourseType } from './project.types';

export type GroupStatus = 'forming' | 'locked' | 'assigned' | 'closed';

export interface GroupInvite {
  _id: string;
  user: User | string;
  email: string;
  rollNumber?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  leader: User;
  members: User[];
  invites: GroupInvite[];
  courseType: CourseType;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PeerUser {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  department?: string;
  avatar?: string;
}

export interface MyGroupsResponse {
  success: boolean;
  groups: Group[];
  incomingInvites: {
    _id: string;
    name: string;
    courseType: CourseType;
    leader: User;
    status: GroupStatus;
    createdAt: string;
  }[];
}
