const WorkPermit = require('../models/workpermit');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate formal notification email for electrical engineer
function generateElectricalDeclarationEmail(declarationData) {
  const activities = declarationData.activities || [];
  const workTypes = declarationData.workTypes || ['LOTOTO Electrical'];
  const location = declarationData.location || 'Not specified';
  const permitNumber = declarationData.permitNumber;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 20px; 
          background-color: #f9f9f9;
        }
        .container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #007bff, #0056b3);
          color: white; 
          padding: 25px; 
          text-align: center; 
        }
        .content { 
          padding: 30px; 
        }
        .section { 
          margin-bottom: 25px; 
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .section-title { 
          color: #007bff; 
          font-weight: 600; 
          margin-bottom: 15px;
          font-size: 18px;
          border-left: 4px solid #007bff;
          padding-left: 12px;
        }
        .detail-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
          margin-top: 10px;
        }
        .detail-item { 
          margin-bottom: 8px; 
        }
        .detail-label { 
          font-weight: 600; 
          color: #555; 
          display: inline-block;
          width: 160px;
        }
        .info-section {
          background: #e8f5e8;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .footer { 
          margin-top: 30px; 
          padding: 20px; 
          background: #f8f9fa; 
          text-align: center; 
          color: #6c757d;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .content {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 LOTOTO Electrical Work Permit Created</h2>
        </div>
        
        <div class="content">
          <div class="section">
            <p>Dear <strong>${declarationData.electricalEngineer.Name}</strong>,</p>
            <p>This is to formally notify you that a LOTOTO Electrical work permit has been created and all safety declarations have been completed.</p>
          </div>

          <div class="section">
            <div class="section-title">Permit Information</div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Permit Number:</span>
                <span class="detail-value"><strong>${declarationData.permitNumber}</strong></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Work Type:</span>
                <span class="detail-value">${workTypes.join(', ')}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${location}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Requested By:</span>
                <span class="detail-value">${declarationData.requester.name} (${declarationData.requester.designation})</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Electrical Activities</div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
              ${activities.length > 0 ? activities.map(activity => `<div style="padding: 5px 0;">• ${activity}</div>`).join('') : '<div style="padding: 5px 0;">No specific activities listed</div>'}
            </div>
          </div>

          <div class="info-section">
            <h4 style="color: #28a745; margin-bottom: 15px;">✅ Safety Declarations Completed</h4>
            <p>All required LOTOTO Electrical safety declarations have been completed by the permit initiator:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${declarationData.declarations.map(declaration => `<li>${declaration}</li>`).join('')}
            </ul>
            <p><strong>Status:</strong> All declarations verified and approved</p>
          </div>

          <div class="section">
            <div class="section-title">Next Steps</div>
            <p>The permit is now proceeding through the standard approval workflow:</p>
            <ol style="color: #555;">
              <li>Area Owner Approval</li>
              <li>HOD Approval</li>
              <li>Safety Officer Approval</li>
            </ol>
            <p>No further action is required from you at this time.</p>
          </div>

          <p style="text-align: center; color: #6c757d; font-style: italic; margin-top: 30px;">
            Safety First | Compliance Always
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Unified Operations & Safety Platform</strong></p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p>If you have questions, contact the system administrator.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
  function generateRejectionEmail(permit, rejection, rejectedBy) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 20px; 
          background-color: #f9f9f9;
        }
        .container { 
          max-width: 700px; 
          margin: 0 auto; 
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white; 
          padding: 25px; 
          text-align: center; 
        }
        .content { 
          padding: 30px; 
        }
        .section { 
          margin-bottom: 20px; 
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .rejection-notice {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
          border-left: 4px solid #dc3545;
        }
        .footer { 
          margin-top: 20px; 
          padding: 20px; 
          background: #f8f9fa; 
          text-align: center; 
          color: #6c757d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>❌ Work Permit Rejected</h2>
          <p>Permit: ${permit.permitNumber}</p>
        </div>
        
        <div class="content">
          <div class="section">
            <p>Dear <strong>${permit.createdBy}</strong>,</p>
            <p>Your work permit has been <strong>rejected</strong> by ${rejectedBy.role}.</p>
          </div>

          <div class="rejection-notice">
            <h4 style="margin: 0 0 10px 0;">Rejection Details</h4>
            <p><strong>Rejected By:</strong> ${rejectedBy.name} (${rejectedBy.role})</p>
            <p><strong>Comments:</strong> ${rejection.comments || 'No comments provided'}</p>
            <p><strong>Rejected At:</strong> ${new Date(rejection.actionAt).toLocaleString()}</p>
          </div>

          <div class="section">
            <h4>Permit Information</h4>
            <p><strong>Permit Number:</strong> ${permit.permitNumber}</p>
            <p><strong>Work Types:</strong> ${permit.selectedWorkTypes.join(', ')}</p>
            <p><strong>Location:</strong> ${permit.formLocation}</p>
            <p><strong>Requested On:</strong> ${new Date(permit.createdAt).toLocaleString()}</p>
          </div>

          <p style="color: #6c757d;">
            Please review the rejection comments and resubmit the permit with necessary corrections.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Unified Operations & Safety Platform</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
class WorkPermitController {
  
  // Create new work permit
async createPermit(req, res) {
  try {
    const permitData = req.body;
    console.log('🔍 [CREATE PERMIT] Received data:', {
      permitNumber: permitData.permitNumber,
      workTypes: permitData.selectedWorkTypes,
      location: permitData.formLocation,
      fullPayload: permitData // Log the entire payload for debugging
    });
    
    // Validate required fields
    if (!permitData.permitNumber || !permitData.startDateTime || !permitData.endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: permitNumber, startDateTime, and endDateTime are required'
      });
    }
    
    // Check if permit number already exists
    const existingPermit = await WorkPermit.findOne({ permitNumber: permitData.permitNumber });
    if (existingPermit) {
      return res.status(400).json({
        success: false,
        message: 'Permit number already exists'
      });
    }

    // Transform the data to match the model schema
    const transformedData = {
      ...permitData,
      // Convert selectedActivities object to Map
      selectedActivities: new Map(Object.entries(permitData.selectedActivities || {})),
      // Convert selectedPPE object to Map  
      selectedPPE: new Map(Object.entries(permitData.selectedPPE || {})),
      // Convert selectedDeclarations object to Map of Maps
      selectedDeclarations: new Map(
        Object.entries(permitData.selectedDeclarations || {}).map(([key, value]) => [
          key, 
          new Map(Object.entries(value || {}))
        ])
      ),
      // Ensure workType object has proper structure
      workType: {
        'Hot Work': false,
        'Cold Work': false,
        'Electrical': false,
        'Confined Space': false,
        'Work at Height': false,
        'Excavation': false,
        'LOTOTO Electrical': false,
        'LOTOTO Mechanical': false,
        'LOTOTO Hydraulic': false,
        'LOTOTO Complex': false,
        'Other': false,
        ...permitData.workType
      },
      // Set default approval stages
      approval1: {
        email: '', // You'll need to get this from your approval workflow
        name: '',
        role: 'Area Owner',
        status: 'Pending'
      },
      approval2: {
        email: '',
        name: '',
        role: 'HOD',
        status: 'Pending'
      },
      approval3: {
        email: '',
        name: '',
        role: 'Safety Officer',
        status: 'Pending'
      }
    };

    console.log('🔄 [CREATE PERMIT] Transformed data:', {
      selectedActivities: Array.from(transformedData.selectedActivities.entries()),
      selectedPPE: Array.from(transformedData.selectedPPE.entries()),
      selectedDeclarations: Array.from(transformedData.selectedDeclarations.entries())
    });

    const newPermit = new WorkPermit(transformedData);
    await newPermit.save();

    console.log('✅ [CREATE PERMIT] Permit saved successfully:', newPermit.permitNumber);
    
    // Send approval email to Area Owner (first approver)
    await this.sendApprovalEmail(newPermit, 'approval1');
    
    res.status(201).json({
      success: true,
      message: 'Work permit created successfully',
      data: newPermit
    });
    
  } catch (error) {
    console.error('❌ Error creating work permit:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}



  // ... (keep all other existing methods the same)
  // Get all permits, getPermitById, updatePermit, etc.

  // Helper method to send approval emails
  async sendApprovalEmails(permit) {
    try {
      // Send to approval1
      if (permit.approval1.email) {
        const mailOptions1 = {
          from: process.env.EMAIL_USER,
          to: permit.approval1.email,
          subject: `Work Permit Approval Required - ${permit.permitNumber}`,
          html: this.generateApprovalEmail(permit, permit.approval1, 'Area Owner')
        };
        await transporter.sendMail(mailOptions1);
      }
      
      // Send to approval2
      if (permit.approval2.email) {
        const mailOptions2 = {
          from: process.env.EMAIL_USER,
          to: permit.approval2.email,
          subject: `Work Permit Approval Required - ${permit.permitNumber}`,
          html: this.generateApprovalEmail(permit, permit.approval2, 'HOD')
        };
        await transporter.sendMail(mailOptions2);
      }
      
    } catch (error) {
      console.error('Error sending approval emails:', error);
    }
  }
  
  // Enhanced approval email with workflow information
  generateApprovalEmail(permit, approval, role) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const approvalUrl = `${frontendUrl}/approvals`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 15px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 25px; background: white; }
          .workflow-info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #007bff; }
          .button { display: inline-block; padding: 12px 25px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { margin-top: 20px; padding: 15px; background: #f4f4f4; text-align: center; border-radius: 0 0 8px 8px; }
          .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
          .detail-item { margin-bottom: 8px; }
          .detail-label { font-weight: bold; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Work Permit Approval Required</h2>
            <p>Role: ${role}</p>
          </div>
          <div class="content">
            <p>Dear ${approval.name},</p>
            <p>A new work permit requires your approval as <strong>${role}</strong>:</p>
            
            <div class="workflow-info">
              <h3>📋 Approval Workflow</h3>
              <p><strong>Current Stage:</strong> ${role} Approval</p>
              <p><strong>Next Stage:</strong> ${role === 'Area Owner' ? 'HOD Approval' : 'Safety Officer Approval'}</p>
              <p><strong>Note:</strong> If you decline, the permit will be returned to the initiator for corrections.</p>
            </div>
            
            <h3>Permit Details:</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Permit Number:</span> ${permit.permitNumber}
              </div>
              <div class="detail-item">
                <span class="detail-label">Work Types:</span> ${permit.selectedWorkTypes?.join(', ') || 'N/A'}
              </div>
              <div class="detail-item">
                <span class="detail-label">Location:</span> ${permit.formLocation}
              </div>
              <div class="detail-item">
                <span class="detail-label">Start Date:</span> ${new Date(permit.startDateTime).toLocaleString()}
              </div>
              <div class="detail-item">
                <span class="detail-label">End Date:</span> ${new Date(permit.endDateTime).toLocaleString()}
              </div>
              <div class="detail-item">
                <span class="detail-label">Created By:</span> ${permit.createdBy}
              </div>
            </div>
            
            <p>Please review the permit details and take appropriate action.</p>
            
            <a href="${approvalUrl}" class="button">Review Permit</a>
            
            <p style="margin-top: 20px;"><em>This is an automated message. Please do not reply to this email.</em></p>
          </div>
          <div class="footer">
            <p>Unified Operations & Safety Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  // Get all permits
  async getPermits(req, res) {
    try {
      const {
        status,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      const filter = {};
      if (status && status !== 'all') {
        filter.status = status;
      }
      
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const permits = await WorkPermit.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
      
      const total = await WorkPermit.countDocuments(filter);
      
      res.json({
        success: true,
        data: permits,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
      
    } catch (error) {
      console.error('Error fetching permits:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Get permit by ID
  async getPermitById(req, res) {
    try {
      const permitId = req.params.id;
      
      console.log('🔍 getPermitById called with ID:', permitId);
      
      // Validate if it's a valid MongoDB ObjectId
      if (!permitId || permitId === 'permits' || permitId === 'send-electrical-declaration') {
        console.log('❌ Invalid permit ID requested:', permitId);
        return res.status(400).json({
          success: false,
          message: 'Invalid permit ID'
        });
      }

      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(permitId);
      if (!isValidObjectId) {
        console.log('❌ Invalid ObjectId format:', permitId);
        return res.status(400).json({
          success: false,
          message: 'Invalid permit ID format'
        });
      }

      const permit = await WorkPermit.findById(permitId);
      
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      res.json({
        success: true,
        data: permit
      });
      
    } catch (error) {
      console.error('Error fetching permit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Update permit
  async updatePermit(req, res) {
    try {
      const permitId = req.params.id;
      const updateData = req.body;
      
      const permit = await WorkPermit.findById(permitId);
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      // Prevent updating certain fields in specific statuses
      if (permit.status === 'Closed' || permit.status === 'Cancelled') {
        return res.status(400).json({
          success: false,
          message: `Cannot update permit with status: ${permit.status}`
        });
      }
      
      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        permitId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Work permit updated successfully',
        data: updatedPermit
      });
      
    } catch (error) {
      console.error('Error updating permit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Update permit date and time (for extension)
  async updatePermitDateTime(req, res) {
    try {
      const permitId = req.params.id;
      const { startDateTime, endDateTime } = req.body;
      
      const permit = await WorkPermit.findById(permitId);
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      // Validate new dates
      const newStart = new Date(startDateTime);
      const newEnd = new Date(endDateTime);
      
      if (newEnd <= newStart) {
        return res.status(400).json({
          success: false,
          message: 'End date/time must be after start date/time'
        });
      }
      
      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        permitId,
        {
          $set: {
            startDateTime: newStart,
            endDateTime: newEnd,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Permit dates updated successfully',
        data: updatedPermit
      });
      
    } catch (error) {
      console.error('Error updating permit dates:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Delete permit
  async deletePermit(req, res) {
    try {
      const permit = await WorkPermit.findById(req.params.id);
      
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      // Only allow deletion of pending or rejected permits
      if (!['Pending', 'Rejected'].includes(permit.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete permit with current status'
        });
      }
      
      await WorkPermit.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Work permit deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting permit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Approve/Reject permit
  async updateApprovalStatus(req, res) {
    try {
      const permitId = req.params.id;
      const { approvalType, status, comments, approverName } = req.body;
      
      if (!['approval1', 'approval2', 'approval3'].includes(approvalType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid approval type'
        });
      }
      
      const permit = await WorkPermit.findById(permitId);
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      // Update approval status
      const updateField = `${approvalType}.status`;
      const updateData = {
        [updateField]: status,
        [`${approvalType}.actionAt`]: new Date()
      };
      
      if (comments) {
        updateData[`${approvalType}.comments`] = comments;
      }
      
      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        permitId,
        { $set: updateData },
        { new: true }
      );
      
      if (status === 'Approved') {
        // Move to next approval stage or complete
        const nextStage = this.getNextApprovalStage(updatedPermit);
        if (nextStage) {
          updatedPermit.currentApprovalStage = nextStage;
          await updatedPermit.save();
          
          // Send email to next approver
          await this.sendApprovalEmail(updatedPermit, nextStage);
        } else {
          // All approvals completed
          updatedPermit.currentApprovalStage = 'completed';
          updatedPermit.status = 'Approved';
          await updatedPermit.save();
          
          // Send completion notification to creator
          await this.sendApprovalCompletionEmail(updatedPermit);
        }
      } else if (status === 'Rejected') {
        // Send rejection notification to creator
        await this.sendRejectionEmail(updatedPermit, approvalType);
      }
      
      res.json({
        success: true,
        message: `Approval ${status.toLowerCase()} successfully`,
        data: updatedPermit
      });
      
    } catch (error) {
      console.error('Error updating approval status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Close permit
  async closePermit(req, res) {
    try {
      const permitId = req.params.id;
      const closureData = req.body;
      
      const permit = await WorkPermit.findById(permitId);
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      if (permit.status !== 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Only completed permits can be closed'
        });
      }
      
      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        permitId,
        {
          $set: {
            status: 'Closed',
            closedAt: new Date(),
            closureData: {
              ...closureData,
              closedBy: req.user?.name || 'System',
              closedAt: new Date()
            }
          }
        },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Permit closed successfully',
        data: updatedPermit
      });
      
    } catch (error) {
      console.error('Error closing permit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Mark permit as completed
  async completePermit(req, res) {
    try {
      const permitId = req.params.id;
      const completionData = req.body;
      
      const permit = await WorkPermit.findById(permitId);
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      if (permit.status !== 'In Progress') {
        return res.status(400).json({
          success: false,
          message: 'Only permits in progress can be completed'
        });
      }
      
      const updatedPermit = await WorkPermit.findByIdAndUpdate(
        permitId,
        {
          $set: {
            status: 'Completed',
            completedAt: new Date(),
            ...completionData
          }
        },
        { new: true }
      );
      
      res.json({
        success: true,
        message: 'Permit marked as completed',
        data: updatedPermit
      });
      
    } catch (error) {
      console.error('Error completing permit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Get closed permits
  async getClosedPermits(req, res) {
    try {
      const closedPermits = await WorkPermit.find({ status: 'Closed' })
        .sort({ closedAt: -1 })
        .lean();
      
      res.json({
        success: true,
        data: closedPermits
      });
      
    } catch (error) {
      console.error('Error fetching closed permits:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // ✅ FIXED: Send electrical declaration email
  async sendElectricalDeclaration(req, res) {
    try {
      const declarationData = req.body;
      console.log('📧 Electrical declaration data received:', declarationData);
      
      // Validate required fields
      if (!declarationData.electricalEngineer || !declarationData.electricalEngineer.EmailID) {
        return res.status(400).json({
          success: false,
          message: 'Electrical engineer email is required'
        });
      }

      console.log('📧 Preparing to send email to:', declarationData.electricalEngineer.EmailID);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: declarationData.electricalEngineer.EmailID,
        subject: `Electrical Declaration Required - Permit ${declarationData.permitNumber}`,
        html: generateElectricalDeclarationEmail(declarationData)
      };

      console.log('📧 Sending email...');
      const result = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully! Message ID:', result.messageId);
      
      res.json({
        success: true,
        message: 'Electrical declaration sent successfully',
        messageId: result.messageId
      });
      
    } catch (error) {
      console.error('❌ Error sending electrical declaration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send electrical declaration',
        error: error.message
      });
    }
  }

  // ✅ FIXED: Only ONE submitElectricalDeclaration method
  async submitElectricalDeclaration(req, res) {
    try {
      console.log('🔍 [1] Starting submitElectricalDeclaration...');
      console.log('🔍 [2] Request headers:', req.headers);
      console.log('🔍 [3] Request body keys:', Object.keys(req.body));
      console.log('🔍 [4] Request files:', req.files ? Object.keys(req.files) : 'No files');

      // Handle multipart/form-data
      const { permitNumber, electricalEngineerId, declarations, submittedAt } = req.body;
      
      console.log('🔍 [5] Raw form data:', {
        permitNumber,
        electricalEngineerId,
        declarations: declarations ? 'Present' : 'Missing',
        submittedAt,
        filesCount: req.files ? Object.keys(req.files).length : 0
      });

      // Validate required fields
      if (!permitNumber) {
        console.log('❌ [6] Missing permitNumber');
        return res.status(400).json({
          success: false,
          message: 'Missing required field: permitNumber'
        });
      }
      
      if (!electricalEngineerId) {
        console.log('❌ [7] Missing electricalEngineerId');
        return res.status(400).json({
          success: false,
          message: 'Missing required field: electricalEngineerId'
        });
      }
      
      if (!declarations) {
        console.log('❌ [8] Missing declarations');
        return res.status(400).json({
          success: false,
          message: 'Missing required field: declarations'
        });
      }

      // Parse declarations if it's a string
      let declarationData;
      try {
        console.log('🔍 [9] Parsing declarations...');
        declarationData = typeof declarations === 'string' ? JSON.parse(declarations) : declarations;
        console.log('🔍 [10] Parsed declaration data:', declarationData);
      } catch (parseError) {
        console.error('❌ [11] Error parsing declarations:', parseError);
        console.log('❌ [12] Raw declarations string:', declarations);
        return res.status(400).json({
          success: false,
          message: 'Invalid declarations format'
        });
      }

      // Find the work permit
      console.log('🔍 [13] Searching for permit with number:', permitNumber);
      const permit = await WorkPermit.findOne({ permitNumber });
      if (!permit) {
        console.log('❌ [14] Permit not found:', permitNumber);
        return res.status(404).json({
          success: false,
          message: `Work permit not found: ${permitNumber}`
        });
      }

      console.log('✅ [15] Found permit:', permit.permitNumber);

      // Handle file uploads (photos)
      const declarationImages = [];
      if (req.files) {
        console.log('🔍 [16] Processing files...');
        Object.entries(req.files).forEach(([fieldName, files]) => {
          console.log('🔍 [17] Processing file field:', fieldName);
          if (files && files[0]) {
            const photo = files[0];
            const declarationIndex = fieldName.replace('photo', '');
            const declarationText = Object.keys(declarationData)[declarationIndex - 1];
            
            declarationImages.push({
              declaration: declarationText || `Declaration ${declarationIndex}`,
              imageData: photo.buffer.toString('base64'),
              mimetype: photo.mimetype,
              filename: photo.originalname,
              timestamp: new Date()
            });
            console.log('✅ [18] Added image for declaration:', declarationText);
          }
        });
      }

      console.log('🔍 [19] Total images processed:', declarationImages.length);

      // Get electrical engineer details from employees collection
      console.log('🔍 [20] Searching for electrical engineer with ID:', electricalEngineerId);
      const Employee = require('../models/employee');
      const electricalEngineer = await Employee.findById(electricalEngineerId);
      
      if (!electricalEngineer) {
        console.log('❌ [21] Electrical engineer not found:', electricalEngineerId);
        return res.status(404).json({
          success: false,
          message: 'Electrical engineer not found'
        });
      }

      console.log('✅ [22] Found electrical engineer:', electricalEngineer.Name);

      // Create electrical declaration object
      const electricalDeclaration = {
        engineer: {
          id: electricalEngineerId,
          name: electricalEngineer.Name,
          designation: electricalEngineer.Designation,
          department: electricalEngineer.Department,
          email: electricalEngineer.EmailID,
          submittedAt: new Date()
        },
        declarations: declarationData,
        images: declarationImages,
        completed: true,
        status: 'Completed',
        submittedAt: new Date(submittedAt),
        completedAt: new Date()
      };

      console.log('🔍 [23] Electrical declaration object created:', electricalDeclaration);

      // Update the permit with electrical declaration
      console.log('🔍 [24] Updating permit in database...');
      const updatedPermit = await WorkPermit.findOneAndUpdate(
        { permitNumber: permitNumber },
        { 
          $set: { 
            electricalDeclaration: electricalDeclaration,
            electricalDeclarationCompleted: true,
            updatedAt: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!updatedPermit) {
        console.log('❌ [25] Failed to update permit in database');
        return res.status(500).json({
          success: false,
          message: 'Failed to update work permit'
        });
      }

      console.log('✅ [26] Permit updated successfully:', updatedPermit.permitNumber);
      console.log('✅ [27] Electrical declaration saved:', updatedPermit.electricalDeclaration ? 'Yes' : 'No');

      // Send success response
      console.log('✅ [28] Sending success response...');
      res.json({
        success: true,
        message: 'Electrical declaration submitted successfully',
        data: {
          permitNumber,
          status: 'completed',
          declarations: declarationData,
          hasPhotos: declarationImages.length > 0,
          submittedAt: new Date(),
          engineer: {
            name: electricalEngineer.Name,
            designation: electricalEngineer.Designation
          }
        }
      });

      console.log('✅ [29] Request completed successfully!');

    } catch (error) {
      console.error('❌ [30] Error in submitElectricalDeclaration:', error);
      console.error('❌ [31] Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to submit electrical declaration',
        error: error.message
      });
    }
  }

  // Get permit counts by status
  async getPermitCounts(req, res) {
    try {
      const counts = await WorkPermit.getPermitCounts();
      
      res.json({
        success: true,
        data: counts
      });
      
    } catch (error) {
      console.error('Error fetching permit counts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Get permit by number
  async getPermitByNumber(req, res) {
    try {
      const { permitNumber } = req.params;
      
      const permit = await WorkPermit.findOne({ permitNumber });
      if (!permit) {
        return res.status(404).json({
          success: false,
          message: 'Work permit not found'
        });
      }
      
      res.json({
        success: true,
        data: permit
      });
      
    } catch (error) {
      console.error('Error fetching permit:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
  
  // Helper method to update overall permit status
  async updateOverallStatus(permitId) {
    const permit = await WorkPermit.findById(permitId);
    
    if (permit.approval1.status === 'Rejected' || permit.approval2.status === 'Rejected') {
      permit.status = 'Rejected';
    } else if (permit.approval1.status === 'Approved' && permit.approval2.status === 'Approved') {
      permit.status = 'Approved';
    } else {
      permit.status = 'Pending';
    }
    
    await permit.save();
  }
  
  // Helper method to send approval emails
  async sendApprovalEmails(permit) {
    try {
      // Send to approval1
      if (permit.approval1.email) {
        const mailOptions1 = {
          from: process.env.EMAIL_USER,
          to: permit.approval1.email,
          subject: `Work Permit Approval Required - ${permit.permitNumber}`,
          html: this.generateApprovalEmail(permit, permit.approval1)
        };
        await transporter.sendMail(mailOptions1);
      }
      
      // Send to approval2
      if (permit.approval2.email) {
        const mailOptions2 = {
          from: process.env.EMAIL_USER,
          to: permit.approval2.email,
          subject: `Work Permit Approval Required - ${permit.permitNumber}`,
          html: this.generateApprovalEmail(permit, permit.approval2)
        };
        await transporter.sendMail(mailOptions2);
      }
      
    } catch (error) {
      console.error('Error sending approval emails:', error);
    }
  }
  
  // Helper method to generate approval email HTML
  generateApprovalEmail(permit, approval) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 10px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          .footer { margin-top: 20px; padding: 10px; background: #f4f4f4; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Work Permit Approval Required</h2>
          </div>
          <div class="content">
            <p>Dear ${approval.name},</p>
            <p>A new work permit requires your approval:</p>
            
            <h3>Permit Details:</h3>
            <ul>
              <li><strong>Permit Number:</strong> ${permit.permitNumber}</li>
              <li><strong>Work Types:</strong> ${permit.selectedWorkTypes.join(', ')}</li>
              <li><strong>Location:</strong> ${permit.formLocation}</li>
              <li><strong>Start Date:</strong> ${new Date(permit.startDateTime).toLocaleString()}</li>
              <li><strong>End Date:</strong> ${new Date(permit.endDateTime).toLocaleString()}</li>
              <li><strong>Created By:</strong> ${permit.createdBy}</li>
            </ul>
            
            <p>Please review the permit details and take appropriate action.</p>
            
            <a href="${process.env.FRONTEND_URL}/approvals" class="button">Review Permit</a>
            
            <p><em>This is an automated message. Please do not reply to this email.</em></p>
          </div>
          <div class="footer">
            <p>Unified Operations & Safety Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  // In your workpermit controller
async showElectricalDeclarationForm(req, res) {
  try {
    const { permitNumber } = req.params;
    
    console.log('🔍 [DECLARATION FORM] Request received for permit:', permitNumber);
    console.log('🔍 [DECLARATION FORM] Full URL:', req.originalUrl);
    console.log('🔍 [DECLARATION FORM] Query params:', req.query);
    console.log('🔍 [DECLARATION FORM] Headers:', req.headers);

    // Check if permitNumber is valid
    if (!permitNumber || permitNumber.trim() === '') {
      console.log('❌ [DECLARATION FORM] Empty permit number');
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h1 style="color: #dc3545;">Invalid Permit Number</h1>
            <p>The permit number is empty or invalid.</p>
          </body>
        </html>
      `);
    }

    console.log('🔍 [DECLARATION FORM] Searching for permit in database...');
    
    // Try to find the permit
    const permit = await WorkPermit.findOne({ permitNumber: permitNumber.trim() });
    
    if (!permit) {
      console.log('❌ [DECLARATION FORM] Permit not found in database:', permitNumber);
      
      // Let's check what permits exist in the database
      const allPermits = await WorkPermit.find({}, 'permitNumber').limit(10);
      console.log('🔍 [DECLARATION FORM] First 10 permits in database:', allPermits.map(p => p.permitNumber));
      
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
            <h1 style="color: #dc3545;">Permit Not Found</h1>
            <p>Work permit <strong>${permitNumber}</strong> was not found in the system.</p>
            <p><strong>Possible reasons:</strong></p>
            <ul style="text-align: left; max-width: 500px; margin: 20px auto;">
              <li>The permit number may be incorrect</li>
              <li>The permit may have been deleted</li>
              <li>There might be a database connection issue</li>
            </ul>
            <p>Please contact the system administrator or verify the permit number.</p>
            <p><a href="/" style="color: #007bff;">Return to Home</a></p>
          </body>
        </html>
      `);
    }

    console.log('✅ [DECLARATION FORM] Permit found:', permit.permitNumber);
    console.log('✅ [DECLARATION FORM] Permit status:', permit.status);
    console.log('✅ [DECLARATION FORM] Permit work types:', permit.selectedWorkTypes);

    // Check if permit has LOTOTO Electrical work type
    const hasElectricalWork = permit.selectedWorkTypes && 
                             permit.selectedWorkTypes.includes('LOTOTO Electrical');
    
    if (!hasElectricalWork) {
      console.log('⚠️ [DECLARATION FORM] Permit does not have LOTOTO Electrical work type');
    }

    // Serve the declaration form HTML
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Electrical Safety Declaration - ${permit.permitNumber}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f9f9f9;
          }
          .container { 
            max-width: 700px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white; 
            padding: 25px; 
            text-align: center; 
          }
          .content { 
            padding: 30px; 
          }
          .declaration-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .declaration-item {
            margin-bottom: 15px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #007bff;
          }
          .declaration-text {
            font-weight: 500;
            margin-bottom: 10px;
          }
          .declaration-options {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
          }
          .option-group {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .btn-submit {
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          }
          .success-message {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
          }
          .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
          }
          .permit-info {
            background: #e9ecef;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚡ Electrical Safety Declaration</h2>
            <p>Permit: ${permit.permitNumber}</p>
          </div>
          
          <div class="content">
            <div class="permit-info">
              <h3>Permit Information</h3>
              <p><strong>Status:</strong> ${permit.status}</p>
              <p><strong>Work Types:</strong> ${permit.selectedWorkTypes ? permit.selectedWorkTypes.join(', ') : 'None'}</p>
              <p><strong>Location:</strong> ${permit.formLocation || 'Not specified'}</p>
            </div>
            
            <div class="declaration-form">
              <h3>Complete Safety Declarations</h3>
              <p>Please complete all declarations for work permit <strong>${permit.permitNumber}</strong></p>
              
              <form id="electricalDeclarationForm">
                <input type="hidden" name="permitNumber" value="${permit.permitNumber}">
                <input type="hidden" name="electricalEngineerId" value="${permit.electricalEngineer?.id || ''}">
                
                <!-- Declaration 1 -->
                <div class="declaration-item">
                  <div class="declaration-text">1. Verified electrical isolation procedures</div>
                  <div class="declaration-options">
                    <div class="option-group">
                      <input type="radio" id="declaration1-yes" name="declaration1" value="YES" required>
                      <label for="declaration1-yes">Yes</label>
                    </div>
                    <div class="option-group">
                      <input type="radio" id="declaration1-no" name="declaration1" value="NO">
                      <label for="declaration1-no">No</label>
                    </div>
                    <div class="option-group">
                      <input type="radio" id="declaration1-na" name="declaration1" value="N/A">
                      <label for="declaration1-na">N/A</label>
                    </div>
                  </div>
                </div>

                <!-- Add declarations 2-5 similarly -->
                <div class="declaration-item">
                  <div class="declaration-text">2. Confirmed zero energy verification</div>
                  <div class="declaration-options">
                    <div class="option-group">
                      <input type="radio" id="declaration2-yes" name="declaration2" value="YES" required>
                      <label for="declaration2-yes">Yes</label>
                    </div>
                    <div class="option-group">
                      <input type="radio" id="declaration2-no" name="declaration2" value="NO">
                      <label for="declaration2-no">No</label>
                    </div>
                    <div class="option-group">
                      <input type="radio" id="declaration2-na" name="declaration2" value="N/A">
                      <label for="declaration2-na">N/A</label>
                    </div>
                  </div>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <button type="submit" class="btn-submit" id="submitBtn">
                    ✅ Submit Electrical Declaration
                  </button>
                </div>
              </form>
            </div>

            <div id="successMessage" class="success-message" style="display: none;">
              <h3>✅ Declaration Submitted Successfully!</h3>
              <p>Thank you for completing the electrical safety declaration.</p>
            </div>

            <div id="errorMessage" class="error-message" style="display: none;">
              <h3>❌ Submission Failed</h3>
              <p id="errorText">There was an error submitting your declaration. Please try again.</p>
            </div>
          </div>
        </div>

        <script>
          console.log('📝 [DECLARATION FORM] JavaScript loaded for permit: ${permit.permitNumber}');
          
          document.getElementById('electricalDeclarationForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📝 [DECLARATION FORM] Form submission started');
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Submitting...';
            
            document.getElementById('successMessage').style.display = 'none';
            document.getElementById('errorMessage').style.display = 'none';
            
            try {
              // Collect form data
              const formData = new FormData();
              formData.append('permitNumber', '${permit.permitNumber}');
              formData.append('electricalEngineerId', '${permit.electricalEngineer?.id || ''}');
              
              // Collect declarations
              const declarations = {
                'Verified electrical isolation procedures': document.querySelector('input[name="declaration1"]:checked')?.value,
                'Confirmed zero energy verification': document.querySelector('input[name="declaration2"]:checked')?.value
                // Add more declarations
              };
              
              formData.append('declarations', JSON.stringify(declarations));
              formData.append('submittedAt', new Date().toISOString());

              console.log('📝 [DECLARATION FORM] Sending data to server...');
              
              const response = await fetch('/api/workpermits/submit-electrical-declaration', {
                method: 'POST',
                body: formData
              });

              const result = await response.json();
              
              if (response.ok && result.success) {
                console.log('✅ [DECLARATION FORM] Submission successful');
                document.getElementById('electricalDeclarationForm').style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
              } else {
                throw new Error(result.message || 'Submission failed');
              }
              
            } catch (error) {
              console.error('❌ [DECLARATION FORM] Form submission error:', error);
              document.getElementById('errorMessage').style.display = 'block';
              document.getElementById('errorText').textContent = 'Error: ' + error.message;
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          });
        </script>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('❌ [DECLARATION FORM] Error loading form:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <h1 style="color: #dc3545;">Error Loading Form</h1>
          <p>There was an error loading the declaration form for permit <strong>${req.params.permitNumber}</strong>.</p>
          <p>Please try again or contact the system administrator.</p>
          <p>Error: ${error.message}</p>
        </body>
      </html>
    `);
  }
}

// Get available electrical engineers
  async getElectricalEngineers(req, res) {
    try {
      const Employee = require('../models/employee');
      const electricalEngineers = await Employee.find({
        Department: { $regex: /electrical/i },
        $or: [
          { Designation: { $regex: /engineer/i } },
          { Designation: { $regex: /officer/i } },
          { Designation: { $regex: /manager/i } }
        ]
      }).select('Name Designation Department EmailID EmployeeImage');

      res.json({
        success: true,
        data: electricalEngineers
      });
    } catch (error) {
      console.error('Error fetching electrical engineers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch electrical engineers',
        error: error.message
      });
    }
  }

// Submit electrical declaration (internal)
async submitInternalElectricalDeclaration(req, res) {
  try {
    const { permitNumber, engineerId, declarations, images } = req.body;

    // Find the permit
    const permit = await WorkPermit.findOne({ permitNumber });
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Work permit not found'
      });
    }

    // Get engineer details
    const Employee = require('../models/employee');
    const engineer = await Employee.findById(engineerId);
    if (!engineer) {
      return res.status(404).json({
        success: false,
        message: 'Electrical engineer not found'
      });
    }

    // Create electrical declaration
    const electricalDeclaration = {
      engineer: {
        id: engineerId,
        name: engineer.Name,
        designation: engineer.Designation,
        department: engineer.Department,
        email: engineer.EmailID,
        submittedAt: new Date()
      },
      declarations: declarations,
      images: images || [],
      completed: true,
      status: 'Completed',
      submittedAt: new Date(),
      completedAt: new Date()
    };

    // Update permit
    const updatedPermit = await WorkPermit.findOneAndUpdate(
      { permitNumber },
      { 
        $set: { 
          electricalDeclaration,
          electricalDeclarationCompleted: true
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Electrical declaration submitted successfully',
      data: updatedPermit
    });

  } catch (error) {
    console.error('Error submitting electrical declaration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit electrical declaration',
      error: error.message
    });
  }
}

  async sendRejectionEmail(permit, rejectedStage) {
    try {
      const rejection = permit[rejectedStage];
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: permit.creatorEmail,
        subject: `Work Permit Rejected - ${permit.permitNumber}`,
        html: generateRejectionEmail(permit, rejection, {
          name: rejection.name,
          role: rejection.role
        })
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Rejection email sent to ${permit.creatorEmail}`);
      
    } catch (error) {
      console.error('Error sending rejection email:', error);
    }
  }
    getNextApprovalStage(permit) {
    if (permit.approval1.status === 'Approved' && permit.approval2.status === 'Pending') {
      return 'approval2';
    } else if (permit.approval2.status === 'Approved' && permit.approval3.status === 'Pending') {
      return 'approval3';
    }
    return null;
  }
  async sendApprovalEmail(permit, approvalStage) {
    try {
      const approval = permit[approvalStage];
      if (!approval || !approval.email) {
        console.log(`No email found for ${approvalStage}`);
        return;
      }
      
      const nextApprover = this.getNextApprover(approvalStage);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: approval.email,
        subject: `Work Permit Approval Required - ${permit.permitNumber}`,
        html: generateApprovalEmail(permit, approval, nextApprover)
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Approval email sent to ${approval.email} for ${approvalStage}`);
      
    } catch (error) {
      console.error('Error sending approval email:', error);
    }
  }
    getNextApprover(currentStage) {
    const workflow = [
      { stage: 'approval1', role: 'Area Owner' },
      { stage: 'approval2', role: 'HOD' },
      { stage: 'approval3', role: 'Safety Officer' }
    ];
    
    const currentIndex = workflow.findIndex(item => item.stage === currentStage);
    if (currentIndex < workflow.length - 1) {
      return workflow[currentIndex + 1];
    }
    return null;
  }
   async sendApprovalCompletionEmail(permit) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: permit.creatorEmail,
        subject: `Work Permit Approved - ${permit.permitNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #28a745; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { margin-top: 20px; padding: 10px; background: #f4f4f4; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>✅ Work Permit Approved</h2>
                <p>Permit: ${permit.permitNumber}</p>
              </div>
              <div class="content">
                <p>Dear <strong>${permit.createdBy}</strong>,</p>
                <p>Your work permit has been <strong>fully approved</strong> and is ready for execution.</p>
                <p><strong>Permit Details:</strong></p>
                <ul>
                  <li><strong>Permit Number:</strong> ${permit.permitNumber}</li>
                  <li><strong>Work Types:</strong> ${permit.selectedWorkTypes.join(', ')}</li>
                  <li><strong>Location:</strong> ${permit.formLocation}</li>
                  <li><strong>Status:</strong> Approved</li>
                </ul>
                <p>You may now proceed with the work as scheduled.</p>
              </div>
              <div class="footer">
                <p>Unified Operations & Safety Platform</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`✅ Approval completion email sent to ${permit.creatorEmail}`);
      
    } catch (error) {
      console.error('Error sending approval completion email:', error);
    }
  }
}

module.exports = new WorkPermitController();
