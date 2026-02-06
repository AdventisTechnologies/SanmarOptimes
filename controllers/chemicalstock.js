const StockModel = require('../models/chemicalstock');
const Chemical = require('../models/chemical');
const Location = require('../models/location');

const unitFactors = {
  L: 1000,
  ml: 1,
  kg: 1000,
  g: 1
};

function convertToMLorG(value, unit) {
  return value * (unitFactors[unit] || 1);
}

function convertBack(value, unit) {
  return value / (unitFactors[unit] || 1);
}

function convertToCelsius(temp) {
  const value = parseFloat(temp?.value || 0);
  const unit = temp?.unit || '°C';
  return unit === '°F' ? (value - 32) * 5 / 9 : value;
}

function parseDateString(dateStr) {
  return new Date(dateStr.split('/').reverse().join('-'));
}

module.exports = {
 StockDetailspost: async (req, res) => {
  console.log('📥 Incoming Stock POST Request');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  try {
    const {
      itemname,
      itemndescription,
      capacity,
      expiryDate,
      purchaseDate,
      location,
      price,
      reference
    } = req.body;

    // 🔍 Validate required fields
    if (!itemname || !capacity || !location || !Array.isArray(location)) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🧪 Find chemical
    const chemical = await Chemical.findOne({ chemicalName: itemname });
    if (!chemical) {
      console.log(`❌ Chemical not found: ${itemname}`);
      return res.status(404).json({ message: 'Chemical not found' });
    }
    console.log('✅ Chemical found');

    const addedCap = convertToMLorG(capacity.value, capacity.unit);
    const priceValue = price?.value || 0;
    const priceUnit = price?.unit || 'INR';

    let matchingLocationsCount = 0;
    const rejectedLocations = [];

    // 🔁 Loop locations
    for (let loc of location) {
      console.log(`📍 Processing location: ${loc}`);

      const locationDoc = await Location.findOne({ locationname: loc.trim() });
      if (!locationDoc) {
        console.log(`❌ Location not found: ${loc}`);
        rejectedLocations.push({
          location: loc,
          reason: 'Location not found'
        });
        continue;
      }

      const reasons = [];

      // 🧪 Incompatibility check
      const existingChemicals =
        (locationDoc.chemicalStocks || []).map(s => s.itemname.toLowerCase());
      const incompatibleWithNew =
        (chemical.incompatibleChemicals || []).map(c => c.toLowerCase());

      const isIncompatible = existingChemicals.some(existing =>
        incompatibleWithNew.includes(existing)
      );

      if (isIncompatible) {
        reasons.push('Incompatible chemical exists in location');
      }

      // 🌡 Temperature check
      const locTemp = convertToCelsius(locationDoc.suggestedStorageTemperature);
      const chemTemp = convertToCelsius(chemical.suggestedStorageTemperature);

      if (locTemp > chemTemp) {
        reasons.push('Location temperature exceeds allowed chemical temperature');
      }

      // 📦 Capacity check
      const locCap = convertToMLorG(
        locationDoc.quantity?.value || 0,
        locationDoc.quantity?.unit || capacity.unit
      );
      const occCap = convertToMLorG(
        locationDoc.occupiedquantity?.value || 0,
        locationDoc.occupiedquantity?.unit || capacity.unit
      );

      const totalAfterAddition = occCap + addedCap;
      if (totalAfterAddition > locCap) {
        reasons.push('Insufficient capacity in location');
      }

      // ❌ Reject if any rule fails
      if (reasons.length > 0) {
        console.log(`❌ Rejected location ${loc}:`, reasons);
        rejectedLocations.push({ location: loc, reasons });
        continue;
      }

      console.log(`✅ Location ${loc} passed all checks`);

      matchingLocationsCount++;

      // 🔄 Update location quantities
      const unit = locationDoc.quantity.unit;
      const remainingAvailable = Math.max(locCap - totalAfterAddition, 0);

      locationDoc.occupiedquantity = {
        value: convertBack(totalAfterAddition, unit),
        unit
      };
      locationDoc.availablequantity = {
        value: convertBack(remainingAvailable, unit),
        unit
      };
      locationDoc.price = {
        value: (locationDoc.price?.value || 0) + priceValue,
        unit: priceUnit
      };

      // 🔎 Central stock lookup
      let stock = await StockModel.findOne({
        itemname,
        location: { $in: [loc] }
      });

      let stockId;

      if (stock) {
        console.log('🔁 Updating existing central stock');

        const existingCap = convertToMLorG(stock.capacity.value, stock.capacity.unit);
        const newCap = existingCap + addedCap;

        stock.capacity = {
          value: convertBack(newCap, capacity.unit),
          unit: capacity.unit
        };

        stock.price.value += priceValue;

        const oldDate = parseDateString(stock.expiryDate);
        const newDate = parseDateString(expiryDate);
        if (newDate > oldDate) {
          stock.expiryDate = expiryDate;
        }

        stock.itemndescription += `; ${itemndescription}`;

        stock.movements.push({
          type: 'INCOMING',
          quantity: capacity,
          toLocation: loc,
          date: new Date(),
          reference: reference || `PO-${Date.now()}`
        });

        await stock.save();
        stockId = stock._id;
      } else {
        console.log('➕ Creating new central stock');

        const newStock = new StockModel({
          itemname,
          itemndescription,
          capacity,
          price: { value: priceValue, unit: priceUnit },
          expiryDate,
          purchaseDate,
          location: [loc],
          movements: [{
            type: 'INCOMING',
            quantity: capacity,
            toLocation: loc,
            date: new Date(),
            reference: reference || `PO-${Date.now()}`
          }]
        });

        await newStock.save();
        stockId = newStock._id;
      }

      // ➕ Add chemical to location
      locationDoc.chemicalStocks.push({
        itemname,
        itemndescription,
        capacity,
        price: { value: priceValue, unit: priceUnit },
        expiryDate,
        stockId
      });

      await locationDoc.save();
      console.log(`💾 Saved stock to location: ${loc}`);
    }

    // 🚨 NOTHING SAVED
    if (matchingLocationsCount === 0) {
      console.log('🚫 Stock not added to any location');
      return res.status(400).json({
        message: 'Stock not added to any location',
        rejectedLocations
      });
    }

    console.log('✅ Stock processing completed');

    return res.status(201).json({
      message: 'Stock added successfully',
      matchingLocationsCount,
      rejectedLocations
    });

  } catch (error) {
    console.error('🔥 Server Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
},


  StockDetailsget: async (req, res) => {
    try {
      const result = await StockModel.find();
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        err: err
      });
    }
  },

  // Get movement history for a specific stock item
  getStockMovements: async (req, res) => {
    try {
      const { id } = req.params;
      const stock = await StockModel.findById(id);
      
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.status(200).json(stock.movements);
    } catch (err) {
      res.status(400).json({
        err: err.message
      });
    }
  },

  StockDetailsupdate: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const {
        itemname,
        itemndescription,
        capacity,
        expiryDate,
        purchaseDate,
        location,
        price
      } = updates;

      // 🧪 Get full chemical data from DB
      const chemical = await Chemical.findOne({ chemicalName: itemname });
      if (!chemical) {
        return res.status(404).json({ message: "Chemical not found" });
      }

      const addedCap = convertToMLorG(capacity.value, capacity.unit);
      const priceValue = price?.value || 0;
      const priceUnit = price?.unit || 'INR';

      let updated = false;
      const rejectedLocations = [];

      for (let loc of location) {
        const locationDoc = await Location.findOne({ locationname: loc.trim() });
        if (!locationDoc) continue;

        const reasons = [];

        // 🧪 Incompatibility check
        const newIncompatibles = (chemical.incompatibleChemicals || []).map(c => c.toLowerCase());
        const existingChemicals = locationDoc.chemicalStocks.map(stock => stock.itemname.toLowerCase());

        const existingChemicalDocs = await Chemical.find({
          chemicalName: { $in: existingChemicals }
        });

        const isIncompatibleWithExisting = existingChemicals.some(existing =>
          newIncompatibles.includes(existing)
        );

        const isExistingIncompatibleWithNew = existingChemicalDocs.some(existingChem =>
          (existingChem.incompatibleChemicals || []).map(c => c.toLowerCase()).includes(itemname.toLowerCase())
        );

        if (isIncompatibleWithExisting || isExistingIncompatibleWithNew) {
          reasons.push("Incompatible chemical conflict with existing stock.");
        }

        // 🌡 Temperature check
        const locTemp = convertToCelsius(locationDoc.suggestedStorageTemperature);
        const chemTemp = convertToCelsius(chemical.suggestedStorageTemperature);
        if (locTemp > chemTemp) {
          reasons.push("Location temperature exceeds allowed chemical storage temperature.");
        }

        // 📦 Capacity check
        const locCap = convertToMLorG(locationDoc.quantity?.value || 0, locationDoc.quantity?.unit || capacity.unit);
        const occCap = convertToMLorG(locationDoc.occupiedquantity?.value || 0, locationDoc.occupiedquantity?.unit || capacity.unit);
        const totalAfterAddition = occCap + addedCap;
        if (totalAfterAddition > locCap) {
          reasons.push("Not enough capacity in location.");
        }

        // ❌ If any rule fails, reject
        if (reasons.length > 0) {
          rejectedLocations.push({ locationname: loc, reasons });
          continue;
        }

        // ✅ Passed all checks — update location
        const unit = locationDoc.quantity.unit;
        const remainingAvailable = Math.max(locCap - totalAfterAddition, 0);

        locationDoc.occupiedquantity = {
          value: convertBack(totalAfterAddition, unit),
          unit: unit
        };
        locationDoc.availablequantity = {
          value: convertBack(remainingAvailable, unit),
          unit: unit
        };
        locationDoc.price = {
          value: (locationDoc.price?.value || 0) + priceValue,
          unit: priceUnit
        };

        // 🔄 Update StockModel
        let stock = await StockModel.findById(id);
        if (!stock) {
          return res.status(404).json({ message: "Stock not found" });
        }

        const existingCap = convertToMLorG(stock.capacity.value, stock.capacity.unit);
        const newTotalCap = existingCap + addedCap;

        stock.itemname = itemname;
        stock.itemndescription = itemndescription;
        stock.capacity = {
          value: convertBack(newTotalCap, capacity.unit),
          unit: capacity.unit
        };
        stock.price = {
          value: (stock.price?.value || 0) + priceValue,
          unit: priceUnit
        };
        stock.expiryDate = expiryDate;
        stock.purchaseDate = purchaseDate;

        if (!stock.location.includes(loc)) {
          stock.location.push(loc);
        }

        // Add movement record for update
        stock.movements.push({
          type: 'INCOMING',
          quantity: capacity,
          toLocation: loc,
          date: new Date(),
          reference: `UPDATE-${Date.now()}`
        });

        await stock.save();

        // Check if chemical already exists in location
        const existingChemIndex = locationDoc.chemicalStocks.findIndex(
          chem => chem.stockId && chem.stockId.toString() === id
        );

        if (existingChemIndex >= 0) {
          // Update existing chemical stock in location
          locationDoc.chemicalStocks[existingChemIndex].capacity = capacity;
          locationDoc.chemicalStocks[existingChemIndex].price = {
            value: priceValue,
            unit: priceUnit
          };
          locationDoc.chemicalStocks[existingChemIndex].expiryDate = expiryDate;
        } else {
          // Add new chemical stock to location
          locationDoc.chemicalStocks.push({
            itemname,
            itemndescription,
            capacity,
            price: {
              value: priceValue,
              unit: priceUnit
            },
            expiryDate,
            stockId: id
          });
        }

        await locationDoc.save();
        updated = true;
      }

      if (updated) {
        return res.status(200).json({ message: 'Stock updated successfully', rejectedLocations });
      } else {
        return res.status(400).json({ message: 'Update rejected in all locations', rejectedLocations });
      }

    } catch (error) {
  
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

takeStockOut: async (req, res) => {
  

  try {
    const { itemname, location, quantityToTake, purpose, reference } = req.body;

    if (!itemname || !location || !quantityToTake || !quantityToTake.value) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find stock by item name and location
    const stock = await StockModel.findOne({
      itemname,
      location: { $in: [location] },
    });

    if (!stock) {
      return res.status(404).json({ message: "Stock not found for this location." });
    }

    const stockCap = convertToMLorG(stock.capacity.value, stock.capacity.unit);
    const takeOutCap = convertToMLorG(quantityToTake.value, quantityToTake.unit);

    if (takeOutCap <= 0) {
      return res.status(400).json({ message: "Take out quantity must be greater than zero." });
    }

    if (takeOutCap > stockCap) {
      return res.status(400).json({ message: "Not enough stock available." });
    }

    // Proportional price calculation
    const unitPrice = stock.price.value / stockCap;
    const reducePrice = takeOutCap * unitPrice;
    const newCap = stockCap - takeOutCap;

    // Update stock document - DON'T DELETE, just mark as depleted
    stock.capacity.value = convertBack(newCap, stock.capacity.unit);
    stock.price.value = Math.max(stock.price.value - reducePrice, 0);
    
    // Add movement record
    stock.movements.push({
      type: 'OUTGOING',
      quantity: quantityToTake,
      fromLocation: location,
      purpose: purpose || 'Consumption',
      date: new Date(),
      reference: reference || `USAGE-${Date.now()}`
    });
    
    // Add a status field to track if stock is depleted
    stock.status = newCap === 0 ? 'depleted' : 'active';
    
    await stock.save();

    // Update location document
    const locationDoc = await Location.findOne({ locationname: location });

    if (locationDoc) {
      const locOcc = convertToMLorG(locationDoc.occupiedquantity.value, locationDoc.occupiedquantity.unit);
      const locAvail = convertToMLorG(locationDoc.availablequantity.value, locationDoc.availablequantity.unit);
      const locUnit = locationDoc.quantity.unit;

      const newOcc = Math.max(locOcc - takeOutCap, 0);
      const newAvail = locAvail + takeOutCap;

      locationDoc.occupiedquantity.value = convertBack(newOcc, locUnit);
      locationDoc.availablequantity.value = convertBack(newAvail, locUnit);
      locationDoc.price.value = Math.max(locationDoc.price.value - reducePrice, 0);

      // ✅ Defensive check for chemicalStocks array
      if (!Array.isArray(locationDoc.chemicalStocks)) {
        locationDoc.chemicalStocks = [];
      }

      const chemIndex = locationDoc.chemicalStocks.findIndex(
        (chem) => chem?.itemname === itemname
      );

      if (chemIndex >= 0) {
        const chem = locationDoc.chemicalStocks[chemIndex];
        const chemCap = convertToMLorG(chem.capacity.value, chem.capacity.unit);
        const remainingChemCap = chemCap - takeOutCap;

        if (remainingChemCap <= 0) {
          // Remove from location but keep in central stock for history
          locationDoc.chemicalStocks.splice(chemIndex, 1);
        } else {
          chem.capacity.value = convertBack(remainingChemCap, chem.capacity.unit);
          chem.price.value = Math.max(chem.price.value - reducePrice, 0);
        }
      }

      await locationDoc.save();
    }

    return res.status(200).json({ 
      message: "Stock taken out successfully.",
      remainingStock: {
        value: convertBack(newCap, stock.capacity.unit),
        unit: stock.capacity.unit
      },
      status: newCap === 0 ? 'depleted' : 'active'
    });
  } catch (err) {
   
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
},

  // Transfer stock between locations
  transferStock: async (req, res) => {
    

    try {
      const { stockId, fromLocation, toLocation, quantityToTransfer, purpose, reference } = req.body;

      if (!stockId || !fromLocation || !toLocation || !quantityToTransfer || !quantityToTransfer.value) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // Find the stock
      const stock = await StockModel.findById(stockId);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found." });
      }

      // Check if stock exists in fromLocation
      if (!stock.location.includes(fromLocation)) {
        return res.status(400).json({ message: "Stock not found in the specified fromLocation." });
      }

      const stockCap = convertToMLorG(stock.capacity.value, stock.capacity.unit);
      const transferCap = convertToMLorG(quantityToTransfer.value, quantityToTransfer.unit);

      if (transferCap <= 0) {
        return res.status(400).json({ message: "Transfer quantity must be greater than zero." });
      }

      if (transferCap > stockCap) {
        return res.status(400).json({ message: "Not enough stock available for transfer." });
      }

      // Check if toLocation exists
      const toLocationDoc = await Location.findOne({ locationname: toLocation.trim() });
      if (!toLocationDoc) {
        return res.status(404).json({ message: "Destination location not found." });
      }

      // Check compatibility with destination location
      const chemical = await Chemical.findOne({ chemicalName: stock.itemname });
      if (!chemical) {
        return res.status(404).json({ message: "Chemical not found." });
      }

      // Check temperature compatibility
      const locTemp = convertToCelsius(toLocationDoc.suggestedStorageTemperature);
      const chemTemp = convertToCelsius(chemical.suggestedStorageTemperature);
      if (locTemp > chemTemp) {
        return res.status(400).json({ message: "Destination location temperature exceeds allowed chemical storage temperature." });
      }

      // Check capacity in destination location
      const locCap = convertToMLorG(toLocationDoc.quantity?.value || 0, toLocationDoc.quantity?.unit || stock.capacity.unit);
      const occCap = convertToMLorG(toLocationDoc.occupiedquantity?.value || 0, toLocationDoc.occupiedquantity?.unit || stock.capacity.unit);
      const totalAfterTransfer = occCap + transferCap;
      
      if (totalAfterTransfer > locCap) {
        return res.status(400).json({ message: "Not enough capacity in destination location." });
      }

      // Check for incompatible chemicals in destination
      const existingChemicals = toLocationDoc.chemicalStocks.map(stock => stock.itemname.toLowerCase());
      const incompatibleWithNew = chemical.incompatibleChemicals?.map(c => c.toLowerCase()) || [];

      const isIncompatible = existingChemicals.some(existing =>
        incompatibleWithNew.includes(existing)
      );

      if (isIncompatible) {
        return res.status(400).json({ message: "Incompatible chemical detected in destination location." });
      }

      // Update source location
      const fromLocationDoc = await Location.findOne({ locationname: fromLocation.trim() });
      if (fromLocationDoc) {
        const fromOcc = convertToMLorG(fromLocationDoc.occupiedquantity.value, fromLocationDoc.occupiedquantity.unit);
        const fromAvail = convertToMLorG(fromLocationDoc.availablequantity.value, fromLocationDoc.availablequantity.unit);
        const fromUnit = fromLocationDoc.quantity.unit;

        const newFromOcc = Math.max(fromOcc - transferCap, 0);
        const newFromAvail = fromAvail + transferCap;

        fromLocationDoc.occupiedquantity.value = convertBack(newFromOcc, fromUnit);
        fromLocationDoc.availablequantity.value = convertBack(newFromAvail, fromUnit);

        // Update chemical stock in source location
        const chemIndex = fromLocationDoc.chemicalStocks.findIndex(
          (chem) => chem.stockId && chem.stockId.toString() === stockId
        );

        if (chemIndex >= 0) {
          const chem = fromLocationDoc.chemicalStocks[chemIndex];
          const chemCap = convertToMLorG(chem.capacity.value, chem.capacity.unit);
          const remainingChemCap = chemCap - transferCap;

          if (remainingChemCap <= 0) {
            fromLocationDoc.chemicalStocks.splice(chemIndex, 1);
          } else {
            chem.capacity.value = convertBack(remainingChemCap, chem.capacity.unit);
          }
        }

        await fromLocationDoc.save();
      }

      // Update destination location
      const toUnit = toLocationDoc.quantity.unit;
      const toOcc = convertToMLorG(toLocationDoc.occupiedquantity.value, toLocationDoc.occupiedquantity.unit);
      const toAvail = convertToMLorG(toLocationDoc.availablequantity.value, toLocationDoc.availablequantity.unit);

      const newToOcc = toOcc + transferCap;
      const newToAvail = Math.max(toAvail - transferCap, 0);

      toLocationDoc.occupiedquantity.value = convertBack(newToOcc, toUnit);
      toLocationDoc.availablequantity.value = convertBack(newToAvail, toUnit);

      // Add chemical to destination location
      const existingChemIndex = toLocationDoc.chemicalStocks.findIndex(
        (chem) => chem.stockId && chem.stockId.toString() === stockId
      );

      if (existingChemIndex >= 0) {
        // Update existing chemical in destination
        const chem = toLocationDoc.chemicalStocks[existingChemIndex];
        const chemCap = convertToMLorG(chem.capacity.value, chem.capacity.unit);
        const newChemCap = chemCap + transferCap;
        chem.capacity.value = convertBack(newChemCap, chem.capacity.unit);
      } else {
        // Add new chemical to destination
        toLocationDoc.chemicalStocks.push({
          itemname: stock.itemname,
          itemndescription: stock.itemndescription,
          capacity: {
            value: convertBack(transferCap, stock.capacity.unit),
            unit: stock.capacity.unit
          },
          price: {
            value: 0, // Will be calculated based on proportional value
            unit: stock.price.unit
          },
          expiryDate: stock.expiryDate,
          stockId: stock._id
        });
      }

      await toLocationDoc.save();

      // Update central stock record
      const newCap = stockCap - transferCap;
      stock.capacity.value = convertBack(newCap, stock.capacity.unit);

      // Add toLocation if not already present
      if (!stock.location.includes(toLocation)) {
        stock.location.push(toLocation);
      }

      // Add movement record
      stock.movements.push({
        type: 'TRANSFER',
        quantity: quantityToTransfer,
        fromLocation: fromLocation,
        toLocation: toLocation,
        purpose: purpose || 'Transfer',
        date: new Date(),
        reference: reference || `TRANSFER-${Date.now()}`
      });

      await stock.save();

      return res.status(200).json({ message: "Stock transferred successfully." });
    } catch (err) {
      
      return res.status(500).json({ message: "Internal server error", error: err.message });
    }
  },

  StockDetailsdelete: async (req, res) => {
    try {
      await StockModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Stock deleted successfully" });
    } catch (err) {
      res.status(400).json({
        err: err
      });
    }
  }
};