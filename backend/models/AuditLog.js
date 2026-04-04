const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { 
        type: String, 
        required: true,
        enum: ['CANCEL_INSTANT', 'CANCEL_REQUESTED', 'CANCEL_APPROVED', 'CANCEL_REJECTED'] 
    },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
