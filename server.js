import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import listEndpoints from 'express-list-endpoints'

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/tantverk"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 9000
const app = express()

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 140
  },
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
 })

 const Message = mongoose.model('Message', messageSchema)

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({
      message: 'Service unavailable'
    })
  }
})

app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})
 
app.get('/messages', async (req, res) => {
  const { page = 1, limit = 8 } = req.query

  try {
    const messages = await Message.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: 'desc'})
      .exec()

    const count = await Message.countDocuments()

    res.json({
      success: true,
      messages,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    })
  }
})

app.post('/messages', async (req, res) => {
  try {
    const newMessage = await new Message(req.body).save()
    res.status(200).json({
      success: true,
      newMessage
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
