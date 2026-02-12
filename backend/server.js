const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const connectDB = require('./config/db');
const authRouter = require('./routes/authRoutes');
const groupsRouter = require('./routes/groupsRoutes');
const expenseRouter = require('./routes/expenseRoutes');
const cookieParser = require('cookie-parser');


connectDB();

const PORT = process.env.PORT || 3000;

app.use(cors({
     origin: process.env.FRONTEND_URL,
     methods: ["GET", "POST", "PUT", "DELETE"],
     credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
     res.send("Hello Brother");
});

app.use('/api/auth', authRouter);
app.use('/user/group', groupsRouter);
app.use('/user/expense', expenseRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});