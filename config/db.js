const mongoose= require('mongoose');

const connectDB= async(req, res)=>{
    mongoose.connect(process.env.MONGO_URI)
        .then(()=>{
            console.log(`MongoDB Connected`);
        })
        .catch((err)=>{
            console.log(err);
        })
};

connectDB();

module.exports= connectDB;