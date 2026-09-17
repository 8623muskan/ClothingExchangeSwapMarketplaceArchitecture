const mongoose = require('mongoose');

const swapMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: String,
      required: true,
      trim: true
    },

    messageText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true
  }
);

const swapSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    requestedItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingItem',
      required: true
    },

    offeredItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClothingItem',
      default: null
    },

    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },

    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'cancelled',
        'completed'
      ],
      default: 'pending'
    },

    messages: {
      type: [swapMessageSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.model('Swap', swapSchema);
