import mongoose from 'mongoose'

const RoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open',
  },
  applications: [{
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Developer',
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export type Application = {
  developer: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  appliedAt: Date
  coverLetter?: string
}

export type Role = {
  _id: string
  title: string
  description: string
  skills: string[]
  company: string
  status: 'open' | 'closed' | 'filled'
  applications: Application[]
  createdAt: Date
  updatedAt: Date
}

export default mongoose.models.Role || mongoose.model('Role', RoleSchema) 