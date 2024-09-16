const http = require('http');
const mongoose = require('mongoose');

const hostname = '127.0.0.1';
const port = 3000;
const mongoUrl = 'mongodb://localhost:27017/myproject';

const citySchema = new mongoose.Schema({
  name: String,
  population: Number
});
const City = mongoose.model('City', citySchema);

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function handlePostCity(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const { name, population } = JSON.parse(body);
      const result = await City.create({ name, population });
      sendJsonResponse(res, 201, { message: 'City saved successfully', id: result._id });
    } catch (error) {
      sendJsonResponse(res, 400, { error: 'Invalid request body' });
    }
  });
}

async function handleGetCities(req, res) {
  try {
    const cities = await City.find({});
    sendJsonResponse(res, 200, cities.length ? cities : { message: 'No cities found' });
  } catch (error) {
    sendJsonResponse(res, 500, { error: 'Server error' });
  }
}

function sendJsonResponse(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function handleRequest(req, res) {
  if (req.method === 'POST' && req.url === '/city') {
    await handlePostCity(req, res);
  } else if (req.method === 'GET' && req.url === '/') {
    await handleGetCities(req, res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
}

async function runServer() {
  await connectToDatabase();
  const server = http.createServer(handleRequest);
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

runServer();
