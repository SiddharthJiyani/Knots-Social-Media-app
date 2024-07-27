"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface Params{
    text:string,
    author :string,
    communityId:string | null,
    path : string
}

export async function createThread({text,author,communityId,path}:Params){
    try{
        connectToDB();

        // create a new thread
        const createThread = await Thread.create({
            text,
            author,
            community:null,
        });


        // once we created a thread we need to update the user model
        // to push the thread id to the user's threads array
        await User.findByIdAndUpdate(author,{
            $push:{
                threads:createThread._id
            }
        })

        revalidatePath(path);
    }
    catch(err){
        throw new Error(`Error creating thread: ${err}`)
    }


}

export async function fetchPosts(pageNumber=1,pageSize=20){
    try{
        connectToDB();

        // calculate number of posts to skip depending on which page we are on currently
        const skipAmount = (pageNumber-1)*pageSize;
        // fetch threads that have no parent,i.e. the root threads( top-level threads)
        const postsQuery = Thread.find({parentId:{ $in:[null,undefined]}})
            .sort({createdAt:'desc'})
            .skip(skipAmount)
            .limit(pageSize)
            .populate({path:'author', model: User})
            .populate({
                path:'children',
                populate:{
                    path:'author',
                    model:User,
                    select:"_id name parentId image"
                }
            });
        const totalPostsCount = await Thread.countDocuments({parentId:{ $in:[null,undefined]}});

        const posts = await postsQuery.exec();

        const isNext = totalPostsCount > skipAmount + posts.length;

        return {posts,isNext}
    }
    catch(err){
        throw new Error(`Error fetching posts: ${err}`)
    }
}   


export async function fetchPostById(id:string){
    connectToDB();
    try{
        const post = await Thread.findById(id)
            .populate({
                path:'author',
                model: User,
                select:"_id name parentId image"
            })
            .populate({
                path:'children',
                populate:[
                    {
                        path:'author',
                        model: User,
                        select:"_id name parentId image"
                    }
                ]
            })
            //TODO:populate communties
            
            .exec();
            

        return post;
    }

    catch( err ){
        throw new Error(`Error fetching post by id: ${err}`)
    }
}

export async function addCommentToPost(
    postId:string,
    commentText:string,
    userId:string,
    path:string
){
    connectToDB();
    try{
        // fetch the original post
        const originalPost = await Thread.findById(postId);
        
        if(!originalPost){
            throw new Error("Post not found")
        }

        // create a new comment post
        const commentPost = new Thread({
            text:commentText,
            author:userId,
            parentId:postId
        })

        // save the comment post
        const savedCommentPost = await commentPost.save();
    
        // update the original post to include the comment post
        originalPost.children.push(savedCommentPost._id);

        // save the updated original post
        await originalPost.save();

        revalidatePath(path);
    }
    catch(err){
        throw new Error(`Error adding comment to post: ${err}`)
    }
}

export async function likePost(postId:string, userId:string) {
    await connectToDB();

    // get user
    const user = await User.findOne({ id: userId });

    if (!user) {
        throw new Error("User not found");
    }

    try {
        // fetch the post
        const post = await Thread.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }
        // check if the user has already liked the post and remove the like if they have already liked it and like it if they haven't
        if (post.likes.includes(user._id)) { // if the user has already liked the post then remove the like

            post.likes = post.likes.filter((like:object) => like.toString() !== user._id.toString());

            // save changes to db
            await post.save();
        } else {
            // if the user hasn't liked the post then add the like
            post.likes.push(user._id);  
        }

        // save the updated post 
        await post.save();

        return post.likes.length;

    } catch (err) {
        // throw new Error(`Error liking post: ${err}`);
        console.log(`Error liking post: ${err}`);
    }
}

export async function getNumberOfLikes(postId:string){
    connectToDB();

    try{
        const post = await Thread.findById(postId);

        if(!post){
            throw new Error("Post not found");
        }

        return post.likes;
    }
    catch(err){
        throw new Error(`Error getting number of likes: ${err}`);
    }
}


async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }
  
    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        connectToDB();
    
        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate("author community");
    
        if (!mainThread) {
            throw new Error("Thread not found");
        }
    
        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);
    
        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];
    
        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
            ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
            mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );
    
        const uniqueCommunityIds = new Set(
            [
            ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
            mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );
    
        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });
    
        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );
    
        // Update Community model
        // await Community.updateMany(
        //     { _id: { $in: Array.from(uniqueCommunityIds) } },
        //     { $pull: { threads: { $in: descendantThreadIds } } }
        // );
    
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}