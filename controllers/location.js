const LocationModel = require('../models/location');

module.exports = {
  LocationDetailspost: async (req, res) => {
  

    try {
      let {
        locationname,
        suggestedStorageTemperature,
        quantity,
        availablequantity,
        occupiedquantity,
        price,
        chemicalStocks
      } = req.body;

      // Normalize location name
      const normalizedLocation = locationname
        ?.trim()
        .replace(/\s*-\s*/g, '-')
        .replace(/\s+/g, ' ')
        .toLowerCase();

      if (!normalizedLocation) {
        return res.status(400).json({ message: "Location name is required" });
      }

      // Check for duplicate normalized location name
      const existingLocation = await LocationModel.findOne({
        locationname: normalizedLocation
      });

      if (existingLocation) {
        return res.status(400).json({
          message: `Location '${normalizedLocation}' already exists`
        });
      }

      // Ensure chemicalStocks is always an array
      const formattedChemicalStocks = Array.isArray(chemicalStocks)
        ? chemicalStocks
        : chemicalStocks ? [chemicalStocks] : [];

      // Validate chemicalStocks fields
      for (const stock of formattedChemicalStocks) {
        if (
          !stock.itemname ||
          !stock.itemndescription ||
          !stock.capacity?.value ||
          !stock.capacity?.unit ||
          !stock.expiryDate
        ) {
          return res.status(400).json({
            message: "Invalid or missing fields in chemicalStocks"
          });
        }
      }

      // Set default available quantity if not provided
      if (!availablequantity && quantity) {
        availablequantity = {
          value: quantity.value,
          unit: quantity.unit
        };
      }

      // Set default occupied quantity if not provided
      if (!occupiedquantity) {
        occupiedquantity = {
          value: 0,
          unit: quantity?.unit || 'kg'
        };
      }

      // ✅ Save normalized locationname to DB
      const location = new LocationModel({
        locationname: normalizedLocation,
        suggestedStorageTemperature: {
          value: suggestedStorageTemperature?.value || '',
          unit: suggestedStorageTemperature?.unit || '°C'
        },
        quantity: {
          value: quantity?.value || 0,
          unit: quantity?.unit || 'kg'
        },
        availablequantity: availablequantity,
        occupiedquantity: occupiedquantity,
        price: price?.value
          ? {
              value: price.value,
              unit: price.unit || 'INR'
            }
          : undefined,
        chemicalStocks: formattedChemicalStocks.map(stock => ({
          itemname: stock.itemname,
          itemndescription: stock.itemndescription,
          capacity: {
            value: stock.capacity.value,
            unit: stock.capacity.unit
          },
          price: {
            value: stock.price?.value || 0,
            unit: stock.price?.unit || 'INR'
          },
          expiryDate: stock.expiryDate,
          stockId: stock.stockId || null
        }))
      });

      await location.save();

      return res.status(201).json({
        message: 'Success',
        result: location
      });

    } catch (err) {

      return res.status(400).json({
        message: 'Failed to save Location details',
        error: err.message
      });
    }
  },

  LocationDetailsget: async (req, res) => {
    try {
      const result = await LocationModel.find();
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        err: err
      });
    }
  },

  LocationdDetailsupdate: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updatedWorkOrder = await LocationModel.findByIdAndUpdate(id, updates, { new: true });
      if (updatedWorkOrder) {
        return res.status(200).json({ message: 'Location updated successfully' });
      }
      return res.status(200).json(updatedWorkOrder);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  LocationDetailsdelete: async (req, res) => {
    try {
      await LocationModel.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Location deleted successfully" });
    } catch (err) {
      res.status(400).json({
        err: err
      });
    }
  }
};