const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.okbnb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('CarShop');
        const carsCollection = database.collection('cars');
        const usersCollection = database.collection('users');
        const buyerCollection = database.collection('buyer');
        const reviewCollection = database.collection('review');
        
         // Get cars Api
         app.get('/cars', async(req, res)=>{
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        })
        // get single car data
          app.get('/cars/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const car = await carsCollection.findOne(query);
            res.json(car);
        })
         //post car api
         app.post('/cars', async(req, res) =>{
          const car = req.body;
          console.log('hit post', car)
          res.send('post hits');
          const result = await carsCollection.insertOne(car);
          res.json(result)
      })
      //  delete cars api
      
      app.delete('/cars/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await carsCollection.deleteOne(query);
        res.json(result)
     }) 

      //Get Buyer Api

          app.get('/buyer', async(req, res)=>{
          const cursor = buyerCollection.find({});
          const buyer = await cursor.toArray();
          res.send(buyer);
      })  
      app.get('/buyer/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const buyer = await buyerCollection.findOne(query);
        res.json(buyer);
    })
        /*  app.get('/buyer', async(req, res) =>{
          const email = req.query.email;
          const query = {email: email};
          const cursor = buyerCollection.find(query);
          const buyer = await cursor.toArray();
          res.json(buyer)
        }); 
 */
       
     
        app.post('/buyer', async (req, res)=>{
          //collect data
          const buyer = req.body;
          
          const result = await buyerCollection.insertOne(buyer);
          
          res.json(result);
        });

        app.delete('/buyer/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          console.log(query)
          const result = await buyerCollection.deleteOne(query);
          res.json(result)
       }) 
       //Get Review Api
       app.get('/review', async(req, res) =>{
        const cursor = reviewCollection.find({});
        const review = await cursor.toArray();
        res.send(review);
        
      })
        // Post Review Api
        app.post('/review', async(req, res) =>{
          const review = req.body;
          console.log('hit post', review)
          res.send('post hits');
          const result = await reviewCollection.insertOne(review);
          res.json(result)
      })
       
        
         // email user api
         app.get('/users/:email', async(req, res)=>{
          const email = req.params.email;
          const query = {email: email};
          const user = await usersCollection.findOne(query);
           let isAdmin = false;
          if (user?.role === 'admin'){
            isAdmin = true
          } 
          res.json({admin: isAdmin})
        });
        app.post('/users', async(req,res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result)
          res.json(result)
        });

        app.put('/users', async(req,res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert: true};
          const updateDoc = { $set: user };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        });

        app.put('/users/admin', async(req, res)=>{
          const user = req.body;
          console.log('put', user)
          const filter = {email: user.email};
          const updateDoc = { $set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })

    } finally{
       // await client.close(); 
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})