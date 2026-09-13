import mongoose, { Document, Schema, Model } from 'mongoose';
import { CourseType } from './eligibility.model';

export type ProjectStatus = 'draft' | 'published' | 'closed' | 'allocated' | 'completed';

export interface IProject extends Document {
  title: string;
  description: string;
  domain: string;
  courseType: CourseType;
  faculty: mongoose.Types.ObjectId;
  requirements: string;
  maxStudents: number;
  currentStudents: number;
  allocatedGroups: mongoose.Types.ObjectId[];
  deadline: Date;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'Domain is required'],
      trim: true,
      default: 'Artificial Intelligence',
    },
    courseType: {
      type: String,
      required: [true, 'Course type is required'],
      enum: ['Capstone Project', 'Mini Project', 'Industrial Project', 'Research Project'],
      default: 'Capstone Project',
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty mentor is required'],
      index: true,
    },
    requirements: {
      type: String,
      default: 'Proficiency in programming and core domain principles.',
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: [true, 'Max students capacity is required'],
      min: [1, 'Capacity must be at least 1 student'],
      max: [5, 'Maximum students allowed per team is 5'],
      default: 3,
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: 0,
    },
    allocatedGroups: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Group',
      },
    ],
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'allocated', 'completed'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Text search compound index for scalable query matching on title & description
projectSchema.index({ title: 'text', description: 'text' });

// Auxiliary query performance indexes
projectSchema.index({ domain: 1, status: 1 });
projectSchema.index({ courseType: 1, status: 1 });
projectSchema.index({ createdAt: -1 });

export const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);
