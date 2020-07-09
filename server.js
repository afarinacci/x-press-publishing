const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
