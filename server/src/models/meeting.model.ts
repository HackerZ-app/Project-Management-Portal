import mongoose, { Document, Schema, Model } from 'mongoose';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface IMeeting extends Document {
  project: mongoose.Types.ObjectId;
  faculty: mongoose.Types.ObjectId;
  title: string;
  agenda: string;
  scheduledAt: Date;
  meetingLink: string;
  status: MeetingStatus;
  meetingMinutes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Strict regex enforcing Google Meet, Zoom, or Microsoft Teams URLs
export const VALID_MEETING_URL_REGEX = /^https:\/\/(www\.)?([a-zA-Z0-9-]+\.)*(meet\.google\.com|zoom\.us|teams\.microsoft\.com)(\/.*)?$/i;

const meetingSchema = new Schema<IMeeting>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    agenda: {
      type: String,
      required: [true, 'Meeting agenda is required'],
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date and time is required'],
      index: true,
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return VALID_MEETING_URL_REGEX.test(v);
        },
        message:
          'Meeting link must be a valid HTTPS URL from Google Meet, Zoom, or Microsoft Teams (e.g. https://meet.google.com/xyz-abcd-efg)',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    meetingMinutes: {
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

// Performance compound indexes
meetingSchema.index({ project: 1, scheduledAt: -1 });
meetingSchema.index({ faculty: 1, scheduledAt: -1 });

export const Meeting: Model<IMeeting> = mongoose.model<IMeeting>('Meeting', meetingSchema);
