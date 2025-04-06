import mongoose from 'mongoose'

const DeveloperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Developer',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: String,
  location: String,
  phone: String,
  about: String,
  skills: [{
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
  }],
  experience: [{
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false,
    },
  }],
  education: [{
    degree: String,
    institution: String,
    location: String,
    year: String,
  }],
  achievements: [String],
  applications: [{
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    coverLetter: String,
  }],
  savedRoles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export type Skill = {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

export type Experience = {
  title: string
  company: string
  description: string
  location?: string
  startDate?: Date
  endDate?: Date
  current?: boolean
}

export type Education = {
  degree: string
  institution: string
  location: string
  year: string
}

export type Application = {
  role: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  appliedAt: Date
  coverLetter?: string
}

export type Developer = {
  _id: string
  name: string
  title: string
  email: string
  image?: string
  location?: string
  phone?: string
  about?: string
  skills: Skill[]
  experience: Experience[]
  education?: Education[]
  achievements?: string[]
  applications: Application[]
  savedRoles: string[]
  createdAt: Date
  updatedAt: Date
}

const Developer = mongoose.models.Developer || mongoose.model('Developer', DeveloperSchema)

export default Developer 