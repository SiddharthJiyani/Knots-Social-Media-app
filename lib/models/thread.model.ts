import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    community : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Community"
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    parentId:{
        type:String,
    },
    likes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],  
    children:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Thread"
    }], // recursive relationship with thread for multiple comments on a particular thread

});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
