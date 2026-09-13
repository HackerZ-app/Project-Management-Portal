import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAssessment extends Document {
  title: string;
  description: string;
  project: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  deadline: Date;
  maxMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Assessment description is required'],
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project association is required'],
      index: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty mentor is required'],
      index: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Assessment deadline is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      min: [1, 'Maximum marks must be at least 1'],
      default: 100,
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

// Compound index for querying assessments for a project ordered by deadline
assessmentSchema.index({ project: 1, deadline: 1 });
assessmentSchema.index({ faculty: 1, createdAt: -1 });

export const Assessment: Model<IAssessment> = mongoose.model<IAssessment>(
  'Assessment',
  assessmentSchema
);
