// Updated Navbar.jsx with logout functionality
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-lg mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <Link to="/home" className="flex items-center py-4">
              <span className="font-semibold text-gray-800 text-lg">CivicConnect</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/home" className="py-4 px-2 text-gray-700 hover:text-red-600 transition duration-300">Home</Link>
            <Link to="/profile" className="py-4 px-2 text-gray-700 hover:text-red-600 transition duration-300">Profile</Link>
            <Link to="/settings" className="py-4 px-2 text-gray-700 hover:text-red-600 transition duration-300">Settings</Link>
            
            <div className="relative inline-block text-left dropdown ml-4">
              <span className="rounded-md shadow-sm">
                <button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
                  <img 
                    className="h-8 w-8 rounded-full object-cover mr-2" 
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=red&color=white`} 
                    alt="Profile" 
                  />
                  {user.name}
                </button>
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="py-2 px-4 text-white bg-red-600 rounded hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}