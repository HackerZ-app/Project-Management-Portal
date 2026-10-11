import mongoose, { Document, Schema, Model } from 'mongoose';
import { CourseType } from './eligibility.model';

export type GroupStatus = 'forming' | 'locked' | 'assigned' | 'closed';

export interface IGroupInvite {
  user: mongoose.Types.ObjectId;
  email: string;
  rollNumber?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface IGroup extends Document {
  name: string;
  leader: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  invites: IGroupInvite[];
  courseType: CourseType;
  status: GroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

const groupInviteSchema = new Schema<IGroupInvite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Group leader is required'],
      index: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    invites: [groupInviteSchema],
    courseType: {
      type: String,
      required: [true, 'Course type is required'],
      enum: ['Capstone Project', 'Mini Project', 'Industrial Project', 'Research Project'],
      index: true,
    },
    status: {
      type: String,
      enum: ['forming', 'locked', 'assigned', 'closed'],
      default: 'forming',
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

// Indexes
groupSchema.index({ leader: 1, courseType: 1, status: 1 });
groupSchema.index({ members: 1, courseType: 1, status: 1 });
groupSchema.index({ 'invites.user': 1, status: 1 });

/**
 * Guardrail: Enforce single active group per student per courseType
 */
groupSchema.pre<IGroup>('save', async function (next) {
  if (this.status === 'closed') {
    return next();
  }

  const activeStatuses: GroupStatus[] = ['forming', 'locked', 'assigned'];
  const allUserIds = Array.from(
    new Set([this.leader.toString(), ...this.members.map((m) => m.toString())])
  ).map((id) => new mongoose.Types.ObjectId(id));

  const conflictGroup = await (this.constructor as Model<IGroup>).findOne({
    _id: { $ne: this._id },
    courseType: this.courseType,
    status: { $in: activeStatuses },
    $or: [{ leader: { $in: allUserIds } }, { members: { $in: allUserIds } }],
  });

  if (conflictGroup) {
    return next(
      new Error(
        `Guardrail Violation: A student can only belong to one active group for '${this.courseType}'. Conflict with group '${conflictGroup.name}'.`
      )
    );
  }

  next();
});

export const Group: Model<IGroup> = mongoose.model<IGroup>('Group', groupSchema);
