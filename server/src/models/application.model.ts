import mongoose, { Document, Schema, Model } from 'mongoose';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface IApplication extends Document {
  project: mongoose.Types.ObjectId;
  appliedBy: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  statementOfPurpose: string;
  status: ApplicationStatus;
  feedback?: string;
  evaluatedAt?: Date;
  evaluatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    appliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user reference is required'],
      index: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      default: undefined,
      index: true,
    },
    statementOfPurpose: {
      type: String,
      required: [true, 'Statement of Purpose is required'],
      trim: true,
      minlength: [50, 'Statement of Purpose must be at least 50 characters long'],
      maxlength: [3000, 'Statement of Purpose cannot exceed 3000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    evaluatedAt: {
      type: Date,
      default: undefined,
    },
    evaluatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
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

// Prevent duplicate active applications from the same applicant/group to the same project
applicationSchema.index({ project: 1, appliedBy: 1, status: 1 });
applicationSchema.index({ project: 1, group: 1, status: 1 });

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  'Application',
  applicationSchema
);
