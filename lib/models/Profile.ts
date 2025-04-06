import mongoose from 'mongoose'

const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
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
}

export type Profile = {
  _id: string
  name: string
  title: string
  skills: Skill[]
  experience: Experience[]
  createdAt: Date
  updatedAt: Date
}

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema) 