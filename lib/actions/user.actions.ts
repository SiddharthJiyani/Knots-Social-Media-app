'use server'

import { revalidatePath } from "next/cache";
import User from "../models/user.model"
import { connectToDB } from "../mongoose"

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


