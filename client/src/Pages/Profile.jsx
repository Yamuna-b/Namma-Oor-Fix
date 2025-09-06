import React, { useState } from 'react';
import Navbar from '../Components/Navbar'; // Ensure this import matches your folder structure

export default function Profile() {
  const [activeTab, setActiveTab] = useState('issues');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock user data
  const user = {
    name: 'Jane Smith',
    username: 'janesmith',
    bio: 'Community activist passionate about improving our neighborhood',
    followers: 247,
    following: 183,
    issues: 24,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-red-500 to-yellow-400 relative">
            <div className="absolute -bottom-16 left-6">
              <img
                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                src={user.avatar}
                alt={`${user.name} avatar`}
              />
            </div>
          </div>

          <div className="pt-20 px-6 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                <p className="text-red-600 text-lg">@{user.username}</p>
              </div>

              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-semibold text-sm shadow-md transition-all duration-300 ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            <p className="mt-4 text-gray-700 text-lg max-w-xl">{user.bio}</p>

            <div className="flex space-x-12 mt-8 text-center text-gray-700">
              <div>
                <span className="text-2xl font-bold block text-red-600">{user.followers}</span>
                <span className="text-sm uppercase tracking-widest">Followers</span>
              </div>
              <div>
                <span className="text-2xl font-bold block text-yellow-600">{user.following}</span>
                <span className="text-sm uppercase tracking-widest">Following</span>
              </div>
              <div>
                <span className="text-2xl font-bold block text-red-600">{user.issues}</span>
                <span className="text-sm uppercase tracking-widest">Issues</span>
              </div>
            </div>
          </div>

          <nav className="border-t border-gray-200 bg-gray-50">
            <div className="flex justify-around max-w-4xl mx-auto">
              {['issues', 'following', 'followers'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-grow py-4 text-center font-semibold text-sm transition-colors duration-300 ${
                    activeTab === tab
                      ? 'border-b-4 border-red-500 text-red-600'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {tab === 'issues' && 'Reported Issues'}
                  {tab === 'following' && 'Following'}
                  {tab === 'followers' && 'Followers'}
                </button>
              ))}
            </div>
          </nav>

          <section className="p-6 bg-white">
            {activeTab === 'issues' && (
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Reported Issues</h3>
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg text-red-600">Pothole on Main Street</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported 3 days ago • 12 likes • 5 comments
                    </p>
                  </div>
                  <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
                    <h4 className="font-semibold text-lg text-red-600">Broken Streetlight</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported 1 week ago • 8 likes • 3 comments
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'following' && (
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Following</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full mr-4"
                        src="https://ui-avatars.com/api/?name=John+Doe&background=red&color=white"
                        alt="John Doe"
                      />
                      <div>
                        <h4 className="font-semibold text-red-600">John Doe</h4>
                        <p className="text-sm text-gray-600">Community volunteer</p>
                      </div>
                    </div>
                    <button className="px-4 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-semibold hover:bg-gray-300 transition">
                      Following
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'followers' && (
              <div>
                <h3 className="text-xl font-semibold mb-6 text-gray-800">Followers</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border rounded-lg p-4 shadow hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full mr-4"
                        src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=red&color=white"
                        alt="Sarah Johnson"
                      />
                      <div>
                        <h4 className="font-semibold text-red-600">Sarah Johnson</h4>
                        <p className="text-sm text-gray-600">Local resident</p>
                      </div>
                    </div>
                    <button className="px-4 py-1 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition">
                      Follow
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
