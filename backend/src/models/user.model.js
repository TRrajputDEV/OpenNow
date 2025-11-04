import mongoose, { Mongoose } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please Provide a name'],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength:[50, "Username cannot be longer than 50 Character"],
        index: true // to make it enable for optimised search.
    },
    email:{
        type: String,
        required: [true,'Please Provide a Email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    password: {
        type: String,
        required:[true, 'Please provide the password'],
        minlength: [6,'Password must be Atleast 6 characters']
    },
    role:{
        type: String,
        enum: ['student','teacher','admin'],
        default: 'student'
    },
    /* to be continued by Tushar -- need the user model. */

    }

},{
    timestamps: true,
})