const Task= require('../models/task.model');

const createTask= async(req, res)=>{
    try {
        const {title, description}= req.body;

        const newTask= new Task({
            title,
            description,
            user: req.user.id
        })

        await newTask.save();
        res.status(201).json({message: 'Task created successfully', task:newTask});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});   
    }
};

const getTasks= async(req, res)=>{
    try {
        if(req.user.role == 'Admin'){
            const tasks= await Task.find().populate('user', 'name email');

            if(tasks.length == 0){
                return res.status(404).json({message: 'Tasks not found'});
            }

            res.status(200).json({message: 'All tasks fetched successfully', tasks:tasks});
        }
        else {
            const tasks= await Task.find({user: req.user.id});

            if(tasks.length == 0){
                return res.status(404).json({message: 'Task not found'});
            }

            res.status(200).json({message: 'Your task fetched successfully', tasks:tasks});
        }
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
};

const updateTask= async(req, res)=>{
    try {
        const {title, description}= req.body;
        const {id}= req.params;

        const task= await Task.findById(id);
        if(!task){
            return res.status(404).json({message: 'Task not found'});
        }

        if(req.user.role !== 'Admin' && task.user.toString() !== req.user.id){
            return res.status(403).json({message: 'Access denied. You can update only your own task'});
        }

        const updates= {};

        if(title) updates.title= title;
        if(description) updates.description= description;

        const updateTask= await Task.findByIdAndUpdate(id, updates, {new:true}).populate('user', 'name email');
        res.status(200).json({message: 'Task updated successfully', task:updateTask});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'})
    }
};

const deleteTask= async(req, res)=>{
    try {
        const {id}= req.params;

        const task= await Task.findById(id);
        if(!task){
            return res.status(404).json({message: 'Task not found'});
        }

        if(req.user.role !== 'Admin' && task.user.toString() !== req.user.id){
            return res.status(403).json({message: 'Access denied. You can delete only your own task'});
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({message: 'Task deleted successfully'});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
};

const fetchTaskById= async(req, res)=>{
    try {
        const {id}= req.params;

        const task= await Task.findById(id).populate('user', 'name email');
        if(!task){
            return res.status(404).json({message: 'Task not found'});
        }

        res.status(200).json({message: 'Task fetched successfully', task:task});
        
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
};


module.exports= {createTask, getTasks, updateTask, deleteTask, fetchTaskById};