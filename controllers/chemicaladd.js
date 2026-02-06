
const ChemicaladdModel = require('../models/chemicaladd');
module.exports = {
ChemicaladdDetailspost: async (req, res) => {

  try {
    const {
      chemicalname,

    } = req.body;

    const result = new ChemicaladdModel({
      chemicalname,

    });

    await result.save();

    return res.status(201).json({ message: 'Success', result });
  } catch (err) {
    return res.status(400).json({
      message: 'Failed to save chemical details',
      error: err.message
    });
  }
},

  ChemicaladdDetailsget: async (req, res) => {
    try{
      const result = await ChemicaladdModel.find();
     res.status(200).json(result);
     return res
     }catch(err){
     res.status(400).json({
         err:err
      })
    }
  },
  ChemicaladdDetailsupdate: async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
     const updatedWorkOrder = await ChemicaladdModel.findByIdAndUpdate(id, updates, { new: true });
    if (updatedWorkOrder) {
      return res.status(200).json({ message: 'Designation updated successfully' });
    }
    return res.status(200).json(updatedWorkOrder);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
 },
 ChemicaladdDetailsdelete: async (req, res) => {
    try{
        await ChemicaladdModel.findByIdAndDelete(req.params.id);
      res.status(200).json({message:"Designation deleted successfully"});
    }catch(err){
      res.status(400).json({
          err:err
      })
    }
 }
};