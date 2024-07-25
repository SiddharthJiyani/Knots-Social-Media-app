import { fetchUser } from "@/lib/actions/user.actions";
import AccountProfile from "../../../components/forms/AccountProfile"
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


async function Page() {
    const user = await currentUser();
    if(!user){ return null; }

    interface UserInfo {
        _id?: string;
        username?: string;
        name?: string;
        bio?: string;
        image?: string;
    }
    
    const userInfo = await fetchUser(user.id);
    if (userInfo?.onboarded) redirect("/");
    const userData = {
      id: user?.id,
      objectId: !userInfo?._id || "",
      username: !userInfo ? userInfo?.username : user.username,
      name: !userInfo ? userInfo?.name : user.firstName ?? "",
      bio: !userInfo ? userInfo?.bio : "",
      image: !userInfo ? userInfo?.image : user.imageUrl,
    };
    
    return( 
        <main className="flex mx-auto max-w-3xl flex-col justify-start px-10 py-20">
            <h1 className="head-text ">Onboarding</h1>
            <p className=" mt-3 text-base-regular text-light-2">Complete your profile now to use Knot</p>

            <section className="mt-9 bg-dark-3 p-10 rounded-md  shadow-count-badge  shadow-sky-600 ">
                <AccountProfile
                    user={userData}
                    btnTitle={'Submit'}
                />
            </section>
        </main>
    )
}

export default Page;