import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  // fetch all posts from db
  const result = await fetchPosts(1,30);
  // console.log(result);  // this console.log appear on the server console not on the browser console

  const user = await currentUser();

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        { result.posts.length === 0 ? (
          <p className="no-result"> No threads found</p>
        ) : (
          <>
            {
              result.posts.map( (post) => {
                return <ThreadCard
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
              })  
            }
          </>
        )
        }
      </section>
  </>
  )
}

