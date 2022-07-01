var mongoose = require('mongoose');
var otherdetailsSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    phonenumber: String,
    email: String,
    emailsent: {
        type: Boolean,
        default: false
    },
    user: {type: mongoose.Schema.Types.ObjectId, ref:'User'}
});
module.exports = mongoose.model('Otherdetails', otherdetailsSchema);
