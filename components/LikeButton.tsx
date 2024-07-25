"use client";

import { useEffect, useState } from "react";
import IconWithTooltip from "./IconWithTooltip";
import likeIcon from "@/public/assets/heart-gray.svg";
import likeFilledIcon from "@/public/assets/heart-filled.svg";
import { getNumberOfLikes, likePost } from "@/lib/actions/thread.actions";
import { fetchUserByClerkId } from "@/lib/actions/user.actions";

export default function LikeButton({ postId, userId} : { postId: string, userId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0); // adjust based on your initial data
    var user : any = null;

    const handleLike = async () => {
        setIsLiked(!isLiked);

        try {
            const res = await likePost(postId, userId); // returns number of likes
            setLikesCount(res);

        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    useEffect(() => {

        const fetchUser = async () => {
            try{
                user = await fetchUserByClerkId(userId);
            }
            catch(error){
                console.error("Error fetching user:", error);
            }
        }

        const fetchLikes = async () => {
            try {
                const res = await getNumberOfLikes(postId);  // returns array of likes with user ids

                // if res array contains user._id then set isLiked to true else false
                if (res.includes(user._id)) {
                    setIsLiked(true);
                    setLikesCount(res.length);
                } else {
                    setIsLiked(false);
                }
                
            } catch (error) {
                console.error("Error getting number of likes:", error);
            }
        };

        
        fetchUser();
        fetchLikes();

    },[])



    return (
        <button onClick={handleLike} className="flex gap-3">
            <IconWithTooltip src={isLiked ? likeFilledIcon : likeIcon} alt='heart' tooltipText='Like' style="rounded-full cursor-pointer object-contain hover:scale-110 hover:shadow-lg hover:shadow-[#f14d4d] transition-all duration-200" />
            <p className='-ml-2 hidden md:block text-light-4'>{likesCount}</p>
        </button>
    );
}
