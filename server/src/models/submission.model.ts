import mongoose, { Document, Schema, Model } from 'mongoose';

export type SubmissionStatus = 'submitted' | 'late' | 'graded';

// Strict GitHub repository URL regex pattern (Safeguard 2)
export const GITHUB_REPO_REGEX = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;

export interface ISubmission extends Document {
  assessment: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId | null;
  githubUrl: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'Assessment reference is required'],
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitting student is required'],
      index: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
      index: true,
    },
    githubUrl: {
      type: String,
      required: [true, 'GitHub repository URL is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return GITHUB_REPO_REGEX.test(v);
        },
        message:
          'Please provide a valid GitHub repository URL (e.g. https://github.com/username/repository)',
      },
    },
    fileUrl: {
      type: String,
      required: [true, 'Uploaded file URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary asset public ID is required for storage lifecycle management'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded'],
      default: 'submitted',
      index: true,
    },
    marks: {
      type: Number,
      min: [0, 'Marks cannot be negative'],
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
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

// Guardrail: Unique compound index preventing multiple submissions for the same assessment
// Case A: For Group Submissions
submissionSchema.index(
  { assessment: 1, group: 1 },
  {
    unique: true,
    partialFilterExpression: { group: { $exists: true, $type: 'objectId' } },
  }
);

// Case B: For Solo Submissions
submissionSchema.index(
  { assessment: 1, submittedBy: 1 },
  {
    unique: true,
    partialFilterExpression: { group: null },
  }
);

export const Submission: Model<ISubmission> = mongoose.model<ISubmission>(
  'Submission',
  submissionSchema
);
