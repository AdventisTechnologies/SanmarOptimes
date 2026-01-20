const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  workerName: {
    type: String,
    required: true,
    trim: true
  },
  workerId: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  gmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  skillset: {
    type: String,
    required: true,
    trim: true
  }
});

const approvalSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    default: ''
  },
  actionAt: {
    type: Date
  }
});

const declarationImageSchema = new mongoose.Schema({
  declaration: String,
  imageData: String,
  mimetype: String,
  filename: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const workTypeDataSchema = new mongoose.Schema({
  workType: String,
  activities: [String],
  ppe: [String],
  declarations: Map,
  declarationImages: [declarationImageSchema]
});

const electricalDeclarationSchema = new mongoose.Schema({
  engineer: {
    id: String,
    name: String,
    designation: String,
    department: String,
    email: String,
    submittedAt: Date
  },
  declarations: {
    type: Map,
    of: String,
    default: {}
  },
  images: [declarationImageSchema],
  completed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  completedAt: Date
});

const workPermitSchema = new mongoose.Schema({
  permitNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  workType: {
    'Hot Work': { type: Boolean, default: false },
    'Cold Work': { type: Boolean, default: false },
    'Electrical': { type: Boolean, default: false },
    'Confined Space': { type: Boolean, default: false },
    'Work at Height': { type: Boolean, default: false },
    'Excavation': { type: Boolean, default: false },
    'LOTOTO Electrical': { type: Boolean, default: false },
    'LOTOTO Mechanical': { type: Boolean, default: false },
    'LOTOTO Hydraulic': { type: Boolean, default: false },
    'LOTOTO Complex': { type: Boolean, default: false },
    'Other': { type: Boolean, default: false }
  },
  formLocation: {
    type: String,
    required: true,
    trim: true
  },
  otherLocation: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed', 'Closed', 'Cancelled'],
    default: 'Pending'
  },
  activityDescription: {
    type: String,
    required: true,
    trim: true
  },
  workers: [workerSchema],
  
  // Work type specific data
  selectedWorkTypes: [String],
  selectedActivities: {
    // type: Map,
       type: mongoose.Schema.Types.Mixed,
    of: [String],
    default: {}
  },
  selectedPPE: {
    // type: Map,
       type: mongoose.Schema.Types.Mixed,
    of: [String],
    default: {}
  },
  selectedDeclarations: {
    // type: Map,
       type: mongoose.Schema.Types.Mixed,
    of: Map,
    default: {}
  },
  declarationImages: {
    type: Map,
    of: String,
    default: {}
  },
  
  // Electrical Engineer Declaration
  electricalDeclaration: electricalDeclarationSchema,
  electricalDeclarationCompleted: {
    type: Boolean,
    default: false
  },
  
  // Approval workflow - THREE approvers
  approval1: approvalSchema,  // Area Owner
  approval2: approvalSchema,  // HOD
  approval3: approvalSchema,  // Safety Officer
  
  currentApprovalStage: {
    type: String,
    enum: ['approval1', 'approval2', 'approval3', 'completed'],
    default: 'approval1'
  },
  
  // Creator information for notifications
  createdBy: {
    type: String,
    required: true
  },
  creatorEmail: {
    type: String,
    required: true
  },
  creatorDesignation: {
    type: String,
    required: true
  },
  
  // Closure data
  closureData: {
    closedBy: String,
    closedAt: Date,
    closureRemarks: String,
    completionPhotos: [String],
    safetyObservations: String,
    equipmentCondition: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  closedAt: Date
}, {
  timestamps: true
});

// Indexes
workPermitSchema.index({ permitNumber: 1 });
workPermitSchema.index({ status: 1 });
workPermitSchema.index({ startDateTime: 1 });
workPermitSchema.index({ createdBy: 1 });
workPermitSchema.index({ 'approval1.status': 1 });
workPermitSchema.index({ 'approval2.status': 1 });
workPermitSchema.index({ 'approval3.status': 1 });
workPermitSchema.index({ currentApprovalStage: 1 });

// Pre-save middleware
workPermitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get permit counts by status
workPermitSchema.statics.getPermitCounts = async function() {
  const counts = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
    inProgress: 0,
    completed: 0,
    closed: 0,
    cancelled: 0,
    total: 0
  };
  
  counts.forEach(item => {
    const status = item._id.toLowerCase();
    if (result.hasOwnProperty(status)) {
      result[status] = item.count;
    }
    result.total += item.count;
  });
  
  return result;
};

// Instance method to check if permit is active
workPermitSchema.methods.isActive = function() {
  const now = new Date();
  return this.startDateTime <= now && this.endDateTime >= now && this.status === 'Approved';
};

// Instance method to check approval workflow status
workPermitSchema.methods.getNextApprovalStage = function() {
  if (this.approval1.status === 'Pending') return 'approval1';
  if (this.approval1.status === 'Approved' && this.approval2.status === 'Pending') return 'approval2';
  if (this.approval2.status === 'Approved' && this.approval3.status === 'Pending') return 'approval3';
  return 'completed';
};

// Instance method to check if all approvals are complete
workPermitSchema.methods.isFullyApproved = function() {
  return this.approval1.status === 'Approved' && 
         this.approval2.status === 'Approved' && 
         this.approval3.status === 'Approved';
};

// Instance method to check if any approval is rejected
workPermitSchema.methods.isRejected = function() {
  return this.approval1.status === 'Rejected' || 
         this.approval2.status === 'Rejected' || 
         this.approval3.status === 'Rejected';
};

module.exports = mongoose.model('WorkPermit', workPermitSchema);




