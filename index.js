const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const { PersonModel, connectDB } = require('./models/person')
// const connectDB = require('./models/person')
const path = require('path')
const app = express()
morgan.token('data', (req) => {
    return JSON.stringify(req.body)
})
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms :data')
)
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
//serving the frontend
app.get('/', async (res) => {
    await res.sendFile(path.join(__dirname, 'build', 'index.html'))
    res.send('Home')
})
app.get('/persons', async (req, res, next) => {
    await PersonModel.find({}).then(result => {
        res.send(result)
    })
    next()
})

app.get('/persons/:id', async (req, res) => {
    const id = req.params.id
    await PersonModel.find({ id }).then(result => {
        if (result) {
            res.send(result)
        }
        else {
            res.status(404).end()
        }
    }).catch(err => console.log(err))
})
app.post('/api/persons', async (req, res) => {
    const newName = req.body.newName
    const newNumber = req.body.newNumber
    const person = new PersonModel({ phoneName: newName, phoneNumber: newNumber })
    const body = req.body
    if (body.newName === undefined || body.newNumber === undefined) {
        return res.status(500).json({ error: 'Name/Phone Number is missing' })
    } else {
        await person.save().catch(error => console.log(error))
    }
})


app.put('/update/:id', async (req) => {
    const reqId = req.params.id
    const updateNumber = req.body.phoneNumber
    const oldNumber = await PersonModel.findById(reqId)
    oldNumber.phoneNumber = updateNumber
    await oldNumber.save()
})
app.delete('/delete/:id', async (req) => {
    const reqId = req.params.id
    await PersonModel.findByIdAndDelete(reqId)
})

const UnknownEndpoint = (req, res) => {
    res.status(404).json({ error: 'unknown endpoint' })
}

app.use(UnknownEndpoint)
const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}
app.use(errorHandler)
const PORT = 3001
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
})

