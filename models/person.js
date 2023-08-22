require('dotenv').config()

const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)

mongoose.connect(url)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    phoneName: {
        type: String,
        minLength: 4,
        required: true
    },
    phoneNumber: {
        type: Number,
        minLength: 8,
        required: true,
        validate: {
            validator: (number) => {
                return /\d{2,3}-\d{7,8}/.test(number)
            },
            message: 'this is not a valid phone number!'
        }
    }
})
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
    }
})

module.exports = mongoose.model('Person', personSchema)
