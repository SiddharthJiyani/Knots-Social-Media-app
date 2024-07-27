import Image from "next/image"
import Link from "next/link"

interface Props {
    accountId : string,
    authUserId : string,
    name : string,
    username : string,
    imgUrl : string,
    bio : string
    type ?: string
}

const ProfileHeader = ({
    accountId,
    authUserId,
    name,
    username,
    imgUrl,
    bio,
    type
} : Props) => {
    return (
        <div className="flex w-full flex-col justify-start">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 object-cover">
                        <Image
                            src={imgUrl}
                            alt="profile_image"
                            fill
                            className="rounded-full object-cover shadow-2xl"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-left text-light-1 text-heading3-bold">
                            {name}
                        </h2>
                        <p className="text-base-medium text-gray-1">@{username}</p>

                    </div>
                </div>
            </div>

                {/* TODO: Community */}
                {accountId === authUserId && type !== "Community" && (
                    <Link href='/profile/edit'>
                        <div className='flex cursor-pointer gap-3 rounded-lg bg-dark-3 px-4 py-2'>
                        <Image
                            src='/assets/edit.svg'
                            alt='logout'
                            width={16}
                            height={16}
                        />

                        <p className='text-light-2 max-sm:hidden'>Edit</p>
                        </div>
                    </Link>
                )}

                <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>

                <div className="mt-12 h-0.5 w-full bg-dark-3"></div>
        </div>
    )
}

export default ProfileHeader