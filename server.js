import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/tantverk"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 9000
const app = express()

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: [3, 'Minimum length is 3 characters'],
    maxlength: [250, 'Maximium length is 250 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
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
  res.send('Hello world')
})

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: 'desc' }).exec()
  res.json(messages)
})

app.post('/messages', async (req, res) => {
  try {
    const newMessage = await new Message(req.body).save()
    res.status(200).json(newMessage)
  } catch (error) {
    res.status(400).json({
      message: 'Could not save to database',
      error
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
