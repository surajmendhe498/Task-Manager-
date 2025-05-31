const User= require('../models/user.model');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');

const signUp= async(req, res)=>{
    try {
        const {name, email, password, role}= req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        const userExist= await User.findOne({email});
        if(userExist){
            return res.status(409).json({message: 'User already exists.'});
        }

        const hashedPassword= await bcrypt.hash(password, 10);

        const newUser= new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({message: 'User sign up successfully', user:newUser});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

const login= async(req, res)=>{
    try {
        const {email, password}= req.body;

        if(!email || !password){
            return res.status(400).json({message: 'Email and Password are required'});
        }

        const userExist= await User.findOne({email});
        if(!userExist){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const isMatch= await bcrypt.compare(password, userExist.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const token= jwt.sign({id: userExist._id, role: userExist.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({message: 'User login successfully', token});
        
    } catch (error) {
        return res.sttaus(500).json({message: 'Internal server error'});
    }
};

const getAllUsers= async(req, res)=>{
    try {

        if(req.user.role == 'Admin'){
          const users= await User.find().select('-password');

          if(users.length == 0){
            return res.status(404).json({message: 'Users not found'});
        }
        res.status(200).json({message: 'All users fetched successfully', users:users});
        
    }
     else {
            const user= await User.findById(req.user.id).select('-password');

            if(!user){
               return res.status(404).json({message: 'User not found'});
            }

            res.status(200).json({message: 'User fetched successfully', user:user});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

const updateUser= async(req, res)=>{
    try {
        const {name, email, password, role}= req.body;
        const {id}= req.params;

        const user= await User.findById(id);
        if(!user){
            return res.status(200).json({message: 'User not found'}); 
        }

        if(req.user.role !== 'Admin' && req.user.id !== id){
            return res.status(403).json({message: 'Access denied. You can update only your profile'});
        }

        const updates= {};

        if(name) updates.name= name;
        if(email){
            const userExist= await User.findOne({email});
            if(userExist && userExist._id != id){
                return res.status(409).json({message: 'This email is already taken by another user'});
            }
            updates.email= email;
        };

        if(password){
            const hashedPassword= await bcrypt.hash(password, 10);
            updates.password= hashedPassword;
        }

        if(req.user.role == 'Admin' && role){
            updates.role= role;
        }

        const updateUser= await User.findByIdAndUpdate(id, updates, {new:true});
        res.status(200).json({message: 'User updated successfully', user:updateUser});
        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

const deleteUser= async(req, res)=>{
    try {
       const {id}= req.params;

       const user= await User.findById(id);
       if(!user){
            return res.status(404).json({message: 'User not found'});
       }

       if(req.user.role !== 'Admin' && req.user.id !== id){
            return res.status(403).json({message: 'Access denied. You can delete only your own profile'});
       }

        await User.findByIdAndDelete(id);
        res.status(200).json({message: 'User deleted successfully'});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});   
    }
};


module.exports= {signUp, login, getAllUsers, updateUser, deleteUser};


/*
const User= require('../models/user.model');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');

const signUp= async(req, res)=>{
    try {
        const {name, email, password, role}= req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        const userExist= await User.findOne({email});
        if(userExist){
            return res.status(409).json({message: 'User already exists.'});
        }

        const hashedPassword= await bcrypt.hash(password, 10);

        const newUser= new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        res.status(201).json({message: 'User sign up successfully', user:newUser});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

const login= async(req, res)=>{
    try {
        const {email, password}= req.body;

        if(!email || !password){
            return res.status(400).json({message: 'Email and Password are required'});
        }

        const userExist= await User.findOne({email});
        if(!userExist){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const isMatch= await bcrypt.compare(password, userExist.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const token= jwt.sign({id: userExist._id, role: userExist.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({message: 'User login successfully', token});
        
    } catch (error) {
        return res.sttaus(500).json({message: 'Internal server error'});
    }
};

const getAllUsers= async(req, res)=>{
    try {
        const users= await User.find().select('-password');

        if(users.length == 0){
            return res.status(404).json({message: 'Users not found'});
        }

        res.status(200).json({message: 'Users fetched successfully', users:users});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
};

const me= async(req, res)=>{
    try {
        const user= await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        res.status(200).json({message: 'User fetched successfully', user:user});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
};

const updateUser= async(req, res)=>{
    try {
        const {name, email, password, role}= req.body;
        const {id}= req.params;

        const user= await User.findById(id);
        if(!user){
            return res.status(200).json({message: 'User not found'}); 
        }

        if(req.user.role !== 'Admin' && req.user.id !== id){
            return res.status(403).json({message: 'Access denied. You can update only your profile'});
        }

        const updates= {};

        if(name) updates.name= name;
        if(email){
            const userExist= await User.findOne({email});
            if(userExist && userExist._id != id){
                return res.status(409).json({message: 'This email is already taken by another user'});
            }
            updates.email= email;
        };

        if(password){
            const hashedPassword= await bcrypt.hash(password, 10);
            updates.password= hashedPassword;
        }

        if(req.user.role == 'Admin' && role){
            updates.role= role;
        }

        const updateUser= await User.findByIdAndUpdate(id, updates, {new:true});
        res.status(200).json({message: 'User updated successfully', user:updateUser});
        
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

const deleteUser= async(req, res)=>{
    try {
       const {id}= req.params;

       const user= await User.findById(id);
       if(!user){
            return res.status(404).json({message: 'User not found'});
       }

       if(req.user.role !== 'Admin' && req.user.id !== id){
            return res.status(403).json({message: 'Access denied. You can delete only your own profile'});
       }

        await User.findByIdAndDelete(id);
        res.status(200).json({message: 'User deleted successfully'});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});   
    }
};


module.exports= {signUp, login, getAllUsers, me, updateUser, deleteUser};
*/