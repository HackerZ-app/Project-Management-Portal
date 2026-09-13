import mongoose, { Document, Schema, Model } from 'mongoose';
import { UserRole } from '../types/auth.types';

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  isProfileComplete: boolean;
  cgpa: number;
  rollNumber?: string;
  semester: number;
  prerequisitesCompleted: string[];
  hasDisciplinaryAction: boolean;
  isEligible: boolean;
  eligibilityDetails?: Record<string, any> | null;
  phone?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    googleId: {
      type: String,
      trim: true,
      default: undefined,
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'faculty', 'coordinator', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: 'Computer Science and Engineering',
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: 0,
    },
    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
      default: 6,
    },
    prerequisitesCompleted: {
      type: [String],
      default: [],
    },
    hasDisciplinaryAction: {
      type: Boolean,
      default: false,
    },
    isEligible: {
      type: Boolean,
      default: false,
    },
    eligibilityDetails: {
      type: Schema.Types.Mixed,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
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

// Explicitly defined indexes with sparse on googleId for dev/manual accounts
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
