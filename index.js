const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config()


// Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dm1di.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
  await client.connect();
  const productCollection = client.db('emaJohn').collection('product')

  // Get all product count
  app.get('/productcount', async (req, res) => {
    const count = await productCollection.estimatedDocumentCount();
    res.send({count})
  })

  // Get all products
  app.get('/product', async (req, res) => {
    const pageNumber = parseInt(req.query.page);
    const pageItems = parseInt(req.query.size);
    const query = {};
    const cursor = productCollection.find(query);
    let products;
    if(pageNumber || pageItems) {
      products = await cursor.skip(pageNumber*pageItems).limit(pageItems).toArray();
    } else {
      products = await cursor.toArray();
    }
    res.send(products)
  }) 

  // Get single product
  app.get('/product/:id', async (req, res) => {
    const productId = req.params.id;
    const query = {_id: ObjectId(productId)}
    const product = await productCollection.findOne(query);
    res.send(product)
  })

  // Get cart product by ID
  app.post('/cartproduct', async (req, res) => {
    const keys = req.body;
    const ids = keys.map(id => ObjectId(id));
    const query = {_id: {$in: ids}}
    const cursor = productCollection.find(query);
    const products = await cursor.toArray();
    res.send(products)
    console.log(keys)
  })


  }
  finally {
  // await client.close()
  }
}
run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Hello dear Ema John')
})

app.listen(port, () => {
  console.log(`Opening the port ${port}`)
})