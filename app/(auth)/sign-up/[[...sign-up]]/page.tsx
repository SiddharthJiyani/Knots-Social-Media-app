import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center w-100vh min-h-screen ">
      <SignUp />;
    </div>
  )
    
}
