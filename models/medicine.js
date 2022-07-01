var mongoose = require('mongoose');
var medicineSchema = new mongoose.Schema({
    medicineName    : String,
    remindertimeStamps: [String],
    dosage: String,
    Frequency: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User'}
});
module.exports = mongoose.model('Medicine', medicineSchema);
