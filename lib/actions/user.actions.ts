'use server'

import { revalidatePath } from "next/cache";
import User from "../models/user.model"
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    path: string;
    image: string;
}

export async function updateUser({
    userId ,
    username ,
    name ,
    bio ,
    path ,
    image 
}:Params):  Promise<void> {
    connectToDB();
    

    try{
        await User.findOneAndUpdate(
            {id : userId},
            {
                username : username.toLowerCase(),
                name,
                bio,
                image,
                onboarded : true   
            },
            {upsert : true}
        );
    
        if( path === '/profile/edit'){
            revalidatePath(path); // revalidatePath is a nextjs funrction that allows you to revalidate data associated with a specific path
            // this is userful when you want to update the cache data
        }
    }
    catch(error : any){
        throw new Error(`Falied to create/upadte user: ${error.message}`);
    }
}

export async function fetchUser( userId:string){
  try{
    connectToDB();
    return await User
    .findOne({id:userId})
    // .populate({
    //   path: 'communities',
    //   model: Community,
    // })
  }

  catch(error : any){
    throw new Error(`Failed to fetch user: ${error.message}`);

  }
}

export async function fetchUserByClerkId(clerkId:string){
    connectToDB();
    try{
        return await User.findOne({id:clerkId});
   }
    catch(error : any){
      throw new Error(`Failed to fetch user by clerk id: ${error.message}`);
    }
}

export async function fetchUserPosts(userId:string){
    connectToDB();
    try{
        // Find all posts authored by user with the given userid
        // TODO : Populate community
        const posts = await User.findOne({id:userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate:{
                path: 'children',
                model: Thread,
                populate:{
                    path: 'author',
                    model: User,
                    select:'name image id'
                }
            }

        })

        return posts;
    }

    catch(error : any){
        throw new Error(`Failed to fetch user posts: ${error.message}`);
    }

}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
  }: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
  }) {
    try {
      connectToDB();
  
      // Calculate the number of users to skip based on the page number and page size.
      const skipAmount = (pageNumber - 1) * pageSize;
  
      // Create a case-insensitive regular expression for the provided search string.
      const regex = new RegExp(searchString, "i");
  
      // Create an initial query object to filter users.
      const query: FilterQuery<typeof User> = {
        id: { $ne: userId }, // Exclude the current user from the results.
      };
  
      // If the search string is not empty, add the $or operator to match either username or name fields.
      if (searchString.trim() !== "") {
        query.$or = [
          { username: { $regex: regex } },
          { name: { $regex: regex } },
        ];
      }
  
      // Define the sort options for the fetched users based on createdAt field and provided sort order.
      const sortOptions = { createdAt: sortBy };
  
      const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);
  
      // Count the total number of users that match the search criteria (without pagination).
      const totalUsersCount = await User.countDocuments(query);
  
      const users = await usersQuery.exec();
  
      // Check if there are more users beyond the current page.
      const isNext = totalUsersCount > skipAmount + users.length;
  
      return { users, isNext };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }


export async function getActivity(userId:string) {
    try{
        connectToDB();
        
        // find all threads created by the user
        const userThreads = await Thread.find({author:userId})

        // Collect all the child thread ids (replies) from the 'children' field of each user thread
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);


        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId }, // Exclude threads authored by the same user
        }).populate({
            path: "author",
            model: User,
            select: "name image _id",
        }).populate({
            path: "likes",
        });


        return replies ;
    }
    catch(error : any){
        throw new Error(`Failed to fetch user activity: ${error.message}`);
    }
}