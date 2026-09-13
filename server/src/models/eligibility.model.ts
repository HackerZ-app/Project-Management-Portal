import mongoose, { Document, Schema, Model } from 'mongoose';

export type CourseType = 'Capstone Project' | 'Mini Project' | 'Industrial Project' | 'Research Project';

export interface IEligibility extends Document {
  courseType: CourseType;
  department: string;
  minCgpa: number;
  minSemester: number;
  requiredPrerequisites: string[];
  allowDisciplinaryAction: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eligibilitySchema = new Schema<IEligibility>(
  {
    courseType: {
      type: String,
      required: [true, 'Course type is required'],
      enum: ['Capstone Project', 'Mini Project', 'Industrial Project', 'Research Project'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      default: 'Computer Science and Engineering',
      trim: true,
    },
    minCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 6.5,
    },
    minSemester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
      default: 5,
    },
    requiredPrerequisites: {
      type: [String],
      default: [],
    },
    allowDisciplinaryAction: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index per course type & department
eligibilitySchema.index({ courseType: 1, department: 1 }, { unique: true });

export const Eligibility: Model<IEligibility> = mongoose.model<IEligibility>(
  'Eligibility',
  eligibilitySchema
);

/**
 * Ensures default SRM AP CSE departmental eligibility rules exist in the database.
 */
export const ensureDefaultEligibilityRules = async (): Promise<void> => {
  const defaultRules = [
    {
      courseType: 'Capstone Project' as CourseType,
      department: 'Computer Science and Engineering',
      minCgpa: 7.5,
      minSemester: 7,
      requiredPrerequisites: ['CSE201', 'CSE301'],
      allowDisciplinaryAction: false,
      description: 'Senior year Capstone Project for final evaluation and thesis submission.',
    },
    {
      courseType: 'Mini Project' as CourseType,
      department: 'Computer Science and Engineering',
      minCgpa: 6.5,
      minSemester: 5,
      requiredPrerequisites: ['CSE201'],
      allowDisciplinaryAction: false,
      description: 'Pre-final year Mini Project focused on software engineering design patterns.',
    },
    {
      courseType: 'Industrial Project' as CourseType,
      department: 'Computer Science and Engineering',
      minCgpa: 7.0,
      minSemester: 6,
      requiredPrerequisites: ['CSE201', 'CSE302'],
      allowDisciplinaryAction: false,
      description: 'Industry-sponsored or co-mentored corporate research project.',
    },
  ];

  for (const rule of defaultRules) {
    await Eligibility.updateOne(
      { courseType: rule.courseType, department: rule.department },
      { $setOnInsert: rule },
      { upsert: true }
    );
  }
};
