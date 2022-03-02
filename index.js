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
        

          //Create car api
          app.post('/cars', async(req, res) =>{
              const car = req.body;
              console.log('hit post', car)
              res.send('post hits');
              const result = await carsCollection.insertOne(car);
              res.json(result)
          })

          // Add Review Api
        app.post('/review', async(req, res) =>{
          const review = req.body;
          console.log('hit post', review)
          res.send('post hits');
          const result = await reviewCollection.insertOne(review);
          res.json(result)
      })

           //Load Review Api
       app.get('/review', async(req, res) =>{
        const cursor = reviewCollection.find({});
        const review = await cursor.toArray();
        res.send(review);
        
      })
        

         // Load cars Api
         app.get('/cars', async(req, res)=>{
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        })
        //Load single car data
          app.get('/cars/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const car = await carsCollection.findOne(query);
            res.send(car);
        })

    //  buyer Purchase api post
     app.post('/buyer', async (req, res)=>{
      //collect data
      const buyer = req.body;
      
      const result = await buyerCollection.insertOne(buyer);
      
      res.json(result);
    });

    //delete buyer purchase    
    app.delete('/buyer/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      
      const result = await buyerCollection.deleteOne(query);
      res.json(result)
   }) 
    
   //  delete cars api  
    app.delete('/cars/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const result = await carsCollection.deleteOne(query);
      res.json(result)
   }) 
   //myorders
   app.get('/myorders/:email', async(req,res)=>{
    const email = req.params.email;
   
    const buyerOrder =  buyerCollection.find({email: email});
    res.json(await buyerOrder.toArray());
 });

    

        // Put update User
        app.put('/users', async(req,res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert: true};
          const updateDoc = { $set: user };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        });

        // email user api(check if user is an admin)
        app.get('/users/:email', async(req, res)=>{
          const email = req.params.email;
          const query = {email: email};
          const user = await usersCollection.findOne(query);
           let isAdmin = false;
          if (user?.role === 'admin'){
            isAdmin = true;
          } 
          res.json({admin: isAdmin})
        });

        //Maake Admin
        
        app.put('/makeadmin', async(req, res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const updateDoc = { $set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })

          //Update Status
          app.put("/buyerStatus/:id", async (req, res) => {
            const id = req.params.id;

            const updatedStatus = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
              $set: {
                productStatus: updatedStatus.status,
              },
            };
            const result = await buyerCollection.updateOne(filter, updateDoc, options);
            res.json(result);
          });


          //Load All Orders
          app.get("/allorders", async (req, res) => {
            const cursor = buyerCollection.find({});
            const allOrder = await cursor.toArray();
            res.send(allOrder);
          });
     
       


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