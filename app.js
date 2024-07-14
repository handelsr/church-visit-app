const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const attendanceRoutes = require('./routes/attendanceRoutes');
const secretaryRoutes = require('./routes/secretaryRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const visitsRoutes = require('./routes/visitsRoutes');

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/attendance', attendanceRoutes);
app.use('/api/secretaries', secretaryRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/visits', visitsRoutes);

app.use(express.static('public'));

const PORT =  3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
