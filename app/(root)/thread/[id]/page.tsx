import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchPostById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// this is how we can get the id from the url
const Page = async ({params}:{params : {id:string}}) => {

    if(!params.id){
        return null;
    }

    const user = await currentUser();
    if(!user){
        return null;
    }

    const userInfo =  await fetchUser(user?.id);
    if( !userInfo?.onboarded ) redirect('/onboarding');

    const post = await fetchPostById ( params.id) ;
    return (
        <section className="relative ">
        <div>
            <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId = {user?.id || ' '}
                parentId = {post.parentId}
                content = {post.text}
                comments = {post.children}
                community = {post.community}
                author = {post.author}
                createdAt = {post.createdAt}
                likes={post.likes}
            />
        </div>

        <div className="mt-7">
            <Comment
                threadId={params.id}
                currentUserImg={userInfo.image}
                currentUserId={JSON.stringify(userInfo._id)}
            />
        </div>
        
        {/*this is for the comments in the post*/}
        <div className='mt-10'>
            {post.children.map((childItem: any) => (
                <ThreadCard
                    key={childItem._id}
                    id={childItem._id}
                    currentUserId={user.id}
                    parentId={childItem.parentId}
                    content={childItem.text}
                    author={childItem.author}
                    community={childItem.community}
                    createdAt={childItem.createdAt}
                    comments={childItem.children}
                    likes={childItem.likes}
                    isComment
                />
            ))}
      </div>

    </section>
    )
}

export default Page;