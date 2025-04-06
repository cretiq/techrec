import mongoose from 'mongoose'

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  website: String,
  logo: String,
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
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

export type Company = {
  _id: string
  name: string
  description: string
  website?: string
  logo?: string
  roles: string[]
  createdAt: Date
  updatedAt: Date
}

export default mongoose.models.Company || mongoose.model('Company', CompanySchema) 