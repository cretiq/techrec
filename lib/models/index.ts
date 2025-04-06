import mongoose from 'mongoose'
import Role from './Role'
import Company from './Company'
import Developer from './Developer'

// Register models
mongoose.models.Role = Role
mongoose.models.Company = Company
mongoose.models.Developer = Developer

export { Role, Company, Developer } 