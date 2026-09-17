const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    size: {
      type: String,
      required: true,
      trim: true
    },

    brand: {
      type: String,
      trim: true
    },

    brandWebsite: {
      type: String,
      trim: true
    },

    condition: {
      type: String,
      required: true,
      trim: true
    },

    gender: {
      type: String,
      required: true,
      trim: true
    },

    color: {
      type: String,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    estimatedValue: {
      type: Number,
      min: 0,
      default: 0
    },

    imageUrl: {
      type: String,
      default: ''
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'ClothingItem',
  clothingItemSchema
);