const ChemicalModel = require('../models/chemical');
const LocationModel = require('../models/location');

// ✅ Move these outside of module.exports
convertTemperature = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === '°C' && toUnit === '°F') return value * 9/5 + 32;
  if (fromUnit === '°F' && toUnit === '°C') return (value - 32) * 5/9;
  return value;
};

convertQuantity = (value, fromUnit, toUnit) => {
  const unitMap = { kg: 1000, g: 1, mg: 0.001, l: 1000, ml: 1 };
  if (fromUnit === toUnit) return value;
  return (value * unitMap[fromUnit]) / unitMap[toUnit];
};

module.exports = {
GetMatchingChemicalDetails: async (req, res) => {


  try {
    const { chemicalName, capacity } = req.query;

    if (!chemicalName || !capacity) {
      return res.status(400).json({ message: 'chemicalName and capacity are required' });
    }

    // Parse required capacity like "20kg" → { value: 20, unit: "kg" }
    const capacityMatch = capacity.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
    if (!capacityMatch) {
      return res.status(400).json({ message: 'Invalid capacity format. Use like 20kg, 500ml, etc.' });
    }
    const reqValue = parseFloat(capacityMatch[1]);
    const reqUnit = capacityMatch[2].toLowerCase();

    // Unit conversion map (to base unit: g for weight, ml for volume)
    const unitMap = {
      kg: { base: 'g', factor: 1000 },
      g: { base: 'g', factor: 1 },
      mg: { base: 'g', factor: 0.001 },
      l: { base: 'ml', factor: 1000 },
      ml: { base: 'ml', factor: 1 }
    };

    const reqBaseUnit = unitMap[reqUnit]?.base;
    const reqValueInBase = reqValue * (unitMap[reqUnit]?.factor || 1);

    // Fetch chemical + all locations
    const [chemical, locations] = await Promise.all([
      ChemicalModel.findOne({ chemicalName }),
      LocationModel.find({})
    ]);

    if (!chemical) {
      return res.status(404).json({ message: 'Chemical not found' });
    }

    const tempLimit = parseFloat(chemical.suggestedStorageTemperature?.value || '0');
    const compatibleLocations = [];
    let rejectedLocations = [];

    locations.forEach(loc => {
      const reasons = [];

      const locTemp = parseFloat(loc.suggestedStorageTemperature?.value || '0');

      // Location available capacity
      const locValue = parseFloat(loc.quantity?.value || 0);
      const locUnit = (loc.quantity?.unit || '').toLowerCase();

      const locBaseUnit = unitMap[locUnit]?.base;
      const locValueInBase = locValue * (unitMap[locUnit]?.factor || 1);

      // Temperature check
      if (locTemp > tempLimit) {
        reasons.push(`Temperature too high in ${loc.locationname}: ${locTemp}°C > ${tempLimit}°C`);
      }

      // Space check (compare in base units if compatible)
      if (reqBaseUnit && locBaseUnit && reqBaseUnit === locBaseUnit) {
        if (locValueInBase < reqValueInBase) {
          reasons.push(
            `Insufficient space in ${loc.locationname}: Available ${locValue}${locUnit} < Required ${reqValue}${reqUnit}`
          );
        }
      }

      // Incompatible chemical check
      const hasIncompatible = loc.chemicalStocks?.some(stock =>
        chemical.incompatibleChemicals?.includes(stock.itemname)
      );
      if (hasIncompatible) {
        reasons.push(`Incompatible chemical present in ${loc.locationname}`);
      }

      // Final decision
      if (reasons.length > 0) {
        rejectedLocations.push({ locationname: loc.locationname, reasons });
      } else {
        compatibleLocations.push(loc);
      }
    });

    // Clean up rejected reasons
    const allowedKeywords = ['Temperature', 'Insufficient', 'Incompatible'];
    rejectedLocations = rejectedLocations
      .map(loc => ({
        locationname: loc.locationname,
        reasons: loc.reasons.filter(reason =>
          allowedKeywords.some(keyword => reason.includes(keyword))
        )
      }))
      .filter(loc => loc.reasons.length > 0);

    // Send response
    res.json({
      chemical: {
        chemicalName: chemical.chemicalName,
        suggestedStorageTemperature: chemical.suggestedStorageTemperature,
        compatibleChemicals: chemical.compatibleChemicals || [],
        incompatibleChemicals: chemical.incompatibleChemicals || []
      },
      matchingLocations: compatibleLocations,
      rejectedLocations
    });

  } catch (error) {
 
    res.status(500).json({ message: 'Server error' });
  }
},





  ChemicalDetailspost: async (req, res) => {
    try {
      const {
        chemicalName,
        compatibleChemicals = [],
        incompatibleChemicals = [],
        suggestedStorageTemperature,
        // quantity,
        // price,
        // expiryDate,
        // purchaseDate,
      } = req.body;

      const chemicalData = new ChemicalModel({
        chemicalName,
        compatibleChemicals,
        incompatibleChemicals,
        suggestedStorageTemperature: {
          value: suggestedStorageTemperature.value?.trim(),
          unit: suggestedStorageTemperature.unit || '°C'
        },
        // quantity,
        // price,
        // expiryDate,
        // purchaseDate,
      });

      await chemicalData.save();
      return res.status(201).json({ message: 'Success', result: chemicalData });

    } catch (err) {
      return res.status(400).json({ message: 'Failed to save chemical details', error: err.message });
    }
  },

  ChemicalDetailsget: async (req, res) => {
    try {
      const result = await ChemicalModel.find();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ err });
    }
  },

  ChemicalDetailsupdate: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updatedChemical = await ChemicalModel.findByIdAndUpdate(id, updates, { new: true });
      if (updatedChemical) {
        return res.status(200).json({ message: 'Chemical updated successfully', updatedChemical });
      }
      return res.status(404).json({ message: 'Chemical not found' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  ChemicalDetailsdelete: async (req, res) => {
    try {
      await ChemicalModel.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Chemical deleted successfully' });
    } catch (err) {
      return res.status(400).json({ err });
    }
  },

// GetMatchingChemicalDetails: async (req, res) => {
//   try {
//     const { chemicalName } = req.query;

//     if (!chemicalName) {

//       return res.status(400).json({ error: 'Chemical name is required' });
//     }

//     const chemical = await ChemicalModel.findOne({ chemicalName });

//     if (!chemical) {

//       return res.status(404).json({ error: 'Chemical not found' });
//     }

//     const targetTemp = parseFloat(chemical.suggestedStorageTemperature.value);
//     const targetTempUnit = chemical.suggestedStorageTemperature.unit;

//     const targetQty = parseFloat(chemical.quantity.value);
//     const targetQtyUnit = chemical.quantity.unit;

//     const allLocations = await LocationModel.find();

//     const matchingLocations = allLocations.filter(loc => {
//       if (!loc.suggestedStorageTemperature || !loc.quantity) return false;

//       const locTemp = parseFloat(loc.suggestedStorageTemperature.value);
//       const locTempUnit = loc.suggestedStorageTemperature.unit?.toLowerCase();

//       const locQty = parseFloat(loc.quantity.value);
//       const locQtyUnit = loc.quantity.unit?.toLowerCase();

//       const convertedTemp = convertTemperature(locTemp, locTempUnit, targetTempUnit);
//       const convertedQty = convertQuantity(locQty, locQtyUnit, targetQtyUnit);

//       if (isNaN(convertedTemp) || isNaN(convertedQty)) {

//         return false;
//       }

//       const chemicalStocks = loc.chemicalStocks?.filter(Boolean) || [];

//       // ✅ Incompatible chemical check (by name)
//       const hasIncompatible = chemicalStocks.some(stock =>
//         chemical.incompatibleChemicals.includes(stock.itemname)
//       );

//       if (hasIncompatible) {

//         return false;
//       }

//       // ✅ Compatible chemical notification
//       const hasCompatible = chemicalStocks.some(stock =>
//         chemical.compatibleChemicals.includes(stock.itemname)
//       );

//       if (hasCompatible) {

//       }

//       return convertedTemp <= targetTemp && convertedQty >= targetQty;
//     });


//     matchingLocations.forEach(loc =>

//     );

//     return res.status(200).json({
//       chemical,
//       matchingLocations
//     });

//   } catch (error) {

//     return res.status(500).json({ error: 'Internal server error' });
//   }
// },





// GetMatchingChemicalDetails : async (req, res) => {



//   try {
//     const { chemicalName, capacity } = req.query;

//     if (!chemicalName || !capacity) {
//       return res.status(400).json({ error: 'chemicalName and capacity are required' });
//     }

//     const match = capacity.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/); // also supports decimals like 2.5kg
//     if (!match) {
//       return res.status(400).json({ error: 'Invalid capacity format. Use format like 30kg' });
//     }

//     const targetQty = parseFloat(match[1]);
//     const targetQtyUnit = match[2].toLowerCase();

//     // Step 1: Get chemical details
//     const chemical = await ChemicalModel.findOne({ chemicalName });
//     if (!chemical) {
//       return res.status(404).json({ error: 'Chemical not found' });
//     }

//     const targetTemp = parseFloat(chemical.suggestedStorageTemperature?.value);
//     const targetTempUnit = chemical.suggestedStorageTemperature?.unit?.toLowerCase();

//     // Step 2: Get all locations
//     const allLocations = await LocationModel.find();

//     const matchingLocations = [];
//     const rejectedLocations = [];

//     for (const loc of allLocations) {
//       const reasons = [];

//       // A. Temperature Check
//       const locTemp = parseFloat(loc.suggestedStorageTemperature?.value);
//       const locTempUnit = loc.suggestedStorageTemperature?.unit?.toLowerCase();

//       if (!isNaN(locTemp) && targetTempUnit && locTempUnit) {
//         const convertedTemp = convertTemperature(locTemp, locTempUnit, targetTempUnit);
//         if (isNaN(convertedTemp)) {
//           reasons.push('Temperature conversion failed');
//         } else if (convertedTemp > targetTemp) {
//           reasons.push(`Temperature too high: ${convertedTemp}${targetTempUnit} > ${targetTemp}${targetTempUnit}`);
//         }
//       } else {
//         reasons.push('Missing temperature data');
//       }

//       // B. Capacity Check
//       const locQty = parseFloat(loc.quantity?.value || 0);
//       const locQtyUnit = loc.quantity?.unit?.toLowerCase();

//       if (locQtyUnit !== targetQtyUnit) {
//         reasons.push(`Unit mismatch: Location has ${locQtyUnit}, required ${targetQtyUnit}`);
//       } else if (locQty < targetQty) {
//         reasons.push(`Insufficient capacity: Available ${locQty}${locQtyUnit}, Required ${targetQty}${targetQtyUnit}`);
//       }

//       // C. Chemical Compatibility Check
//       const chemicalStocks = (loc.chemicalStocks || []).filter(Boolean);
//       const hasIncompatible = chemicalStocks.some(stock =>
//         chemical.incompatibleChemicals.includes(stock.itemname)
//       );
//       const hasCompatible = chemicalStocks.some(stock =>
//         chemical.compatibleChemicals.includes(stock.itemname)
//       );

//       if (hasIncompatible) {
//         reasons.push('Contains incompatible chemicals');
//       }

//       // Final Categorization
//       if (reasons.length) {
//         rejectedLocations.push({
//           locationname: loc.locationname,
//           reasons
//         });
//       } else {
//         matchingLocations.push({
//           ...loc.toObject(),
//           hasCompatible
//         });
//       }
//     }

//     return res.status(200).json({
//       chemical,
//       matchingLocations,
//       rejectedLocations
//     });

//   } catch (error) {

//     return res.status(500).json({ error: 'Internal server error' });
//   }
// },

// GetMatchingChemicalDetails: async (req, res) => {
//   try {
//     const { chemicalName, capacity } = req.query;

//     if (!chemicalName || !capacity) {
//       return res.status(400).json({ error: 'chemicalName and capacity are required' });
//     }

//     const match = capacity.match(/^(\d+)([a-zA-Z]+)$/);
//     if (!match) {
//       return res.status(400).json({ error: 'Invalid capacity format. Use format like 30kg' });
//     }

//     const targetQty = parseFloat(match[1]);
//     const targetQtyUnit = match[2].toLowerCase();

//     // Step 1: Get chemical details
//     const chemical = await ChemicalModel.findOne({ chemicalName });
//     if (!chemical) {
//       return res.status(404).json({ error: 'Chemical not found' });
//     }

//     const targetTemp = parseFloat(chemical.suggestedStorageTemperature.value);
//     const targetTempUnit = chemical.suggestedStorageTemperature.unit?.toLowerCase();

//     // Step 2: Get all locations
//     const allLocations = await LocationModel.find();

//     const matchingLocations = [];
//     const rejectedLocations = [];

//     for (const loc of allLocations) {
//       const reasons = [];

//       // A. Temperature check
//       const locTemp = parseFloat(loc.suggestedStorageTemperature?.value);
//       const locTempUnit = loc.suggestedStorageTemperature?.unit?.toLowerCase();

//       const convertedTemp = convertTemperature(locTemp, locTempUnit, targetTempUnit);
//       if (isNaN(convertedTemp)) {
//         reasons.push('Temperature conversion failed');
//       } else if (convertedTemp > targetTemp) {
//         reasons.push(`Temperature too high: ${convertedTemp}${targetTempUnit} > ${targetTemp}${targetTempUnit}`);
//       }

//       // B. Capacity check - Use location.quantity directly
//       const locQty = parseFloat(loc.quantity?.value || 0);
//       const locQtyUnit = loc.quantity?.unit?.toLowerCase();

//       if (locQtyUnit !== targetQtyUnit) {
//         reasons.push(`Unit mismatch: Location has ${locQtyUnit}, required ${targetQtyUnit}`);
//       } else if (locQty < targetQty) {
//         reasons.push(`Insufficient capacity: Available ${locQty}${locQtyUnit}, Required ${targetQty}${targetQtyUnit}`);
//       }

//       // C. Chemical compatibility check - optional if chemicalStocks is null or not used
//       const chemicalStocks = (loc.chemicalStocks || []).filter(Boolean);

//       const hasIncompatible = chemicalStocks.some(stock =>
//         chemical.incompatibleChemicals.includes(stock.itemname)
//       );
//       if (hasIncompatible) {
//         reasons.push('Contains incompatible chemicals');
//       }

//       const hasCompatible = chemicalStocks.some(stock =>
//         chemical.compatibleChemicals.includes(stock.itemname)
//       );

//       // Final: Categorize
//       if (reasons.length) {
//         rejectedLocations.push({
//           locationname: loc.locationname,
//           reasons
//         });
//       } else {
//         matchingLocations.push({
//           ...loc.toObject(),
//           hasCompatible
//         });
//       }
//     }

//     return res.status(200).json({
//       chemical,
//       matchingLocations,
//       rejectedLocations
//     });

//   } catch (error) {

//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }




// GetMatchingChemicalDetails: async (req, res) => {

//   try {
//     const { chemicalName } = req.query;

//     if (!chemicalName) {
//       return res.status(400).json({ error: 'Chemical name is required' });
//     }

//     const chemical = await ChemicalModel.findOne({ chemicalName });

//     if (!chemical) {
//       return res.status(404).json({ error: 'Chemical not found' });
//     }

//     const targetTemp = parseFloat(chemical.suggestedStorageTemperature.value);
//     const targetTempUnit = chemical.suggestedStorageTemperature.unit;

//     // const targetQty = parseFloat(chemical.quantity.value);
//     // const targetQtyUnit = chemical.quantity.unit;

//     const allLocations = await LocationModel.find();

//     const matchingLocations = [];
//     const rejectedLocations = [];

//     for (const loc of allLocations) {
//       const reasons = [];

//       if (!loc.suggestedStorageTemperature || !loc.quantity) {
//         reasons.push('Missing temperature or quantity info');
//         rejectedLocations.push({ locationname: loc.locationname, reasons });
//         continue;
//       }

//       const locTemp = parseFloat(loc.suggestedStorageTemperature.value);
//       const locTempUnit = loc.suggestedStorageTemperature.unit?.toLowerCase();

//       const locQty = parseFloat(loc.quantity.value);
//       const locQtyUnit = loc.quantity.unit?.toLowerCase();

//       const convertedTemp = convertTemperature(locTemp, locTempUnit, targetTempUnit);
//       const convertedQty = convertQuantity(locQty, locQtyUnit, targetQtyUnit);

//       if (isNaN(convertedTemp)) reasons.push('Temperature conversion failed');
//       if (isNaN(convertedQty)) reasons.push('Quantity conversion failed');

//       const chemicalStocks = loc.chemicalStocks?.filter(Boolean) || [];

//       const incompatible = chemicalStocks.filter(stock =>
//         chemical.incompatibleChemicals.includes(stock.itemname)
//       );
//       const compatible = chemicalStocks.filter(stock =>
//         chemical.compatibleChemicals.includes(stock.itemname)
//       );

//       if (incompatible.length) {
//         reasons.push(`Contains incompatible chemical(s): ${incompatible.map(i => i.itemname).join(', ')}`);
//       }

//       if (convertedTemp > targetTemp) {
//         reasons.push(`Temperature too high: ${convertedTemp}${targetTempUnit} > ${targetTemp}${targetTempUnit}`);
//       }

//       if (convertedQty < targetQty) {
//         reasons.push(`Insufficient quantity: ${convertedQty}${targetQtyUnit} < ${targetQty}${targetQtyUnit}`);
//       }

//       if (reasons.length) {
//         rejectedLocations.push({ locationname: loc.locationname, reasons });
//       } else {
//         matchingLocations.push({
//           ...loc.toObject(),
//           hasCompatible: compatible.length > 0
//         });
//       }
//     }

//     return res.status(200).json({
//       chemical,
//       matchingLocations,
//       rejectedLocations
//     });

//   } catch (error) {

//     return res.status(500).json({ error: 'Internal server error' });
//   }
// },



};
