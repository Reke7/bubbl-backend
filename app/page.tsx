import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900">Bubbl</h1>
          </div>
          <div>
            {/* This is the magic Clerk button that handles profile and sign out */}
            <UserButton afterSignOutUrl="/"/>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to your Dashboard!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            You are successfully logged in as user: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{userId}</code>
          </p>
          <div className="p-6 bg-red-50 rounded-xl border border-red-100 inline-block">
             <p className="text-red-700 font-medium">
               👈 Open the Bubbl extension to view your video library.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}