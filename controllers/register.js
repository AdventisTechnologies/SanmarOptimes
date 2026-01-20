const EmployeeModel = require('../models/register');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// AWS SDK v3 imports
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configure AWS S3 v3 with correct region and bucket
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Correct bucket name - ONLY THIS BUCKET
const BUCKET_NAME = 'sanmarcuddalore';

module.exports = {
  // Login function (unchanged)
Login: async (req, res) => {
  console.log('🟩 [LOGIN API HIT]', new Date().toISOString());
  console.log('📦 Incoming Request Body:', req.body);

  try {
    const { EmailID, Password } = req.body;

    console.log('🔍 Step 1: Extracted Fields =>', { EmailID, Password: Password ? '****' : 'MISSING' });

    if (!EmailID || !Password) {
      console.log('❌ Missing Email or Password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('⏳ Step 2: Searching user by EmailID...');
    const existingUser = await EmployeeModel.findOne({ EmailID });

    if (!existingUser) {
      console.log('❌ User not found for Email:', EmailID);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ Step 3: User found in DB:', {
      id: existingUser._id,
      email: existingUser.EmailID,
      employeeId: existingUser.EmployeeID,
      name: existingUser.Name
    });

    console.log('⏳ Step 4: Comparing password using bcrypt...');
    const isPasswordValid = await bcrypt.compare(Password, existingUser.Password);
    console.log('🔐 Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid credentials for Email:', EmailID);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('🛠 Step 5: Generating JWT token...');
    const token = jwt.sign(
      { 
        id: existingUser._id,
        email: existingUser.EmailID,
        employeeId: existingUser.EmployeeID
      },
      process.env.JWT_SECRET || 'credo_secret',
      { expiresIn: '24h' }
    );

    console.log('🎟 Step 6: JWT generated successfully:', token ? 'Yes' : 'No');
    console.log('✅ Step 7: Sending success response');

    return res.status(200).json({ 
      message: 'Successfully logged in', 
      token,
      user: {
        id: existingUser._id,
        name: existingUser.Name,
        email: existingUser.EmailID,
        employeeId: existingUser.EmployeeID,
        department: existingUser.Department,
        Designation: existingUser.Designation,        // Added
        EmployeeImage: existingUser.EmployeeImage,    // Added
        MobileNumber: existingUser.MobileNumber,      // Optional
        Rfid: existingUser.Rfid,                       // Optional
        Location: existingUser.Location                // Optional
      }
    });

  } catch (err) {
    console.error('💥 [LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
},



  // Employee Registration - DIRECT TO BUCKET ROOT
  EmployeeRegistration: async (req, res) => {
    console.log(req.body)
    try {
      const { 
        EmployeeID, 
        Name, 
        Rfid, 
        Department, 
        Designation, 
        EmailID, 
        Password, 
        Location,
        MobileNumber 
      } = req.body;

      console.log('AWS Region:', process.env.AWS_REGION);
      console.log('AWS Bucket:', BUCKET_NAME);

      // Validate required fields
      if (!EmployeeID || !Name || !Rfid || !Department || !Designation || !EmailID || !Password) {
        return res.status(400).json({ error: 'All mandatory fields are required' });
      }

      // Check for duplicate EmployeeID, RFID, Email, and MobileNumber
      const existingEmployee = await EmployeeModel.findOne({
        $or: [
          { EmployeeID },
          { Rfid },
          { EmailID },
          ...(MobileNumber ? [{ MobileNumber }] : [])
        ]
      });

      if (existingEmployee) {
        let duplicateField = '';
        if (existingEmployee.EmployeeID === EmployeeID) duplicateField = 'Employee ID';
        else if (existingEmployee.Rfid === Rfid) duplicateField = 'RFID';
        else if (existingEmployee.EmailID === EmailID) duplicateField = 'Email';
        else if (existingEmployee.MobileNumber === MobileNumber) duplicateField = 'Mobile Number';
        
        return res.status(409).json({ 
          error: `${duplicateField} already exists` 
        });
      }

      // Validate image files
      if (!req.files || !req.files.front || !req.files.left || !req.files.right || !req.files.signature) {
        return res.status(400).json({ 
          error: 'All images (front, left, right, signature) are required.' 
        });
      }

      // Upload images to S3 - DIRECT TO BUCKET ROOT (NO FOLDER)
      const uploadImageToS3 = async (file, fileType) => {
        try {
          const ext = path.extname(file.originalname);
          // Store directly in bucket root with unique name
          const s3Key = `${uuidv4()}${ext}`;
          
          const command = new PutObjectCommand({
            Bucket: BUCKET_NAME, // Only this bucket
            Key: s3Key, // No folder path
            Body: file.buffer,
            ContentType: file.mimetype,
          });

          console.log(`Uploading file to S3: ${s3Key} in bucket: ${BUCKET_NAME}`);
          await s3Client.send(command);
          
          // Construct the URL - DIRECT BUCKET URL
          const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;
          console.log(`File uploaded successfully: ${fileUrl}`);
          return fileUrl;
          
        } catch (uploadError) {
          console.error('S3 Upload Error:', uploadError);
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
      };

      console.log('Starting image uploads...');
      const [frontUrl, leftUrl, rightUrl, signatureUrl] = await Promise.all([
        uploadImageToS3(req.files.front[0], 'front'),
        uploadImageToS3(req.files.left[0], 'left'),
        uploadImageToS3(req.files.right[0], 'right'),
        uploadImageToS3(req.files.signature[0], 'signature')
      ]);

      console.log('All images uploaded successfully');

      // Check for duplicate image URLs
      const existingWithImages = await EmployeeModel.findOne({
        $or: [
          { 'EmployeeImage.front': frontUrl },
          { 'EmployeeImage.left': leftUrl },
          { 'EmployeeImage.right': rightUrl },
          { 'EmployeeImage.signature': signatureUrl }
        ]
      });

      if (existingWithImages) {
        return res.status(409).json({ 
          error: 'Image already exists in system' 
        });
      }

      const hashedPassword = await bcrypt.hash(Password, 10);

      const newEmployee = new EmployeeModel({
        EmployeeID,
        Name,
        Rfid,
        Department,
        Designation,
        EmailID,
        MobileNumber: MobileNumber || null,
        Password: hashedPassword,
        Location,
        EmployeeImage: {
          front: frontUrl,
          left: leftUrl,
          right: rightUrl,
          signature: signatureUrl
        },
      });

      await newEmployee.save();
      console.log('Employee saved to database');
      
      res.status(201).json({ 
        message: 'Employee registered successfully',
        employeeId: EmployeeID
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        let fieldName = field;
        if (field === 'EmployeeID') fieldName = 'Employee ID';
        else if (field === 'Rfid') fieldName = 'RFID';
        else if (field === 'EmailID') fieldName = 'Email';
        else if (field === 'MobileNumber') fieldName = 'Mobile Number';
        
        return res.status(409).json({ 
          error: `${fieldName} already exists` 
        });
      }
      
      res.status(400).json({ 
        error: 'Employee registration failed', 
        details: error.message 
      });
    }
  },

  // Get all employee details
  UserDetails: async (req, res) => {
    try {
      const data = await EmployeeModel.find();
      return res.status(200).json(data);
    } catch (error) {
      console.error('User details error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update employee details - DIRECT TO BUCKET ROOT
  updateEmployeeDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Check if employee exists
      const existingEmployee = await EmployeeModel.findById(id);
      if (!existingEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Check for duplicates excluding current employee
      const duplicateCheck = {};
      if (updateData.EmployeeID) {
        duplicateCheck.EmployeeID = updateData.EmployeeID;
      }
      if (updateData.Rfid) {
        duplicateCheck.Rfid = updateData.Rfid;
      }
      if (updateData.EmailID) {
        duplicateCheck.EmailID = updateData.EmailID;
      }
      if (updateData.MobileNumber) {
        duplicateCheck.MobileNumber = updateData.MobileNumber;
      }

      if (Object.keys(duplicateCheck).length > 0) {
        const existing = await EmployeeModel.findOne({
          $or: [duplicateCheck],
          _id: { $ne: id }
        });

        if (existing) {
          let duplicateField = '';
          if (existing.EmployeeID === updateData.EmployeeID) duplicateField = 'Employee ID';
          else if (existing.Rfid === updateData.Rfid) duplicateField = 'RFID';
          else if (existing.EmailID === updateData.EmailID) duplicateField = 'Email';
          else if (existing.MobileNumber === updateData.MobileNumber) duplicateField = 'Mobile Number';
          
          return res.status(409).json({ 
            error: `${duplicateField} already exists` 
          });
        }
      }

      // Handle password update
      if (updateData.Password) {
        updateData.Password = await bcrypt.hash(updateData.Password, 10);
      }

      // Handle image updates - DIRECT TO BUCKET ROOT
      if (req.files) {
        const uploadImageToS3 = async (file) => {
          try {
            const ext = path.extname(file.originalname);
            // Store directly in bucket root
            const s3Key = `${uuidv4()}${ext}`;
            
            const command = new PutObjectCommand({
              Bucket: BUCKET_NAME, // Only this bucket
              Key: s3Key, // No folder path
              Body: file.buffer,
              ContentType: file.mimetype,
            });

            await s3Client.send(command);
            return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${s3Key}`;
            
          } catch (uploadError) {
            console.error('S3 Upload Error:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
        };

        updateData.EmployeeImage = { ...existingEmployee.EmployeeImage };

        if (req.files.front) {
          const url = await uploadImageToS3(req.files.front[0]);
          updateData.EmployeeImage.front = url;
        }
        if (req.files.left) {
          const url = await uploadImageToS3(req.files.left[0]);
          updateData.EmployeeImage.left = url;
        }
        if (req.files.right) {
          const url = await uploadImageToS3(req.files.right[0]);
          updateData.EmployeeImage.right = url;
        }
        if (req.files.signature) {
          const url = await uploadImageToS3(req.files.signature[0]);
          updateData.EmployeeImage.signature = url;
        }
      }

      const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-Password');

      res.status(200).json({ 
        message: 'Employee updated successfully', 
        data: updatedEmployee 
      });

    } catch (error) {
      console.error('Update error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        let fieldName = field;
        if (field === 'EmployeeID') fieldName = 'Employee ID';
        else if (field === 'Rfid') fieldName = 'RFID';
        else if (field === 'EmailID') fieldName = 'Email';
        else if (field === 'MobileNumber') fieldName = 'Mobile Number';
        
        return res.status(409).json({ 
          error: `${fieldName} already exists` 
        });
      }
      
      res.status(400).json({
        error: 'Failed to update employee details',
        details: error.message
      });
    }
  },

  // Delete employee details
  EmployeeDetailsDelete: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedEmployee = await EmployeeModel.findByIdAndDelete(id);
      if (!deletedEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      return res.status(200).json({ 
        message: 'Employee deleted successfully',
        deletedEmployeeId: deletedEmployee.EmployeeID
      });
    } catch (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};