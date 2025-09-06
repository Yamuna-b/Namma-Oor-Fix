import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing min-h-screen bg-gradient-to-br from-red-500 to-yellow-400 text-white">
      <nav className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold">CivicConnect</h1>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 rounded-lg bg-white text-red-600 font-semibold hover:bg-gray-100 transition">Log In</Link>
          <Link to="/register" className="px-4 py-2 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 transition">Sign Up</Link>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center mt-20 text-center px-4">
        <h2 className="text-5xl font-bold mb-6">Report. Resolve. Connect.</h2>
        <p className="text-xl max-w-2xl mb-10">
          Join your community in making your neighborhood better. Report issues, follow others, and track progress together.
        </p>
        <Link to="/register" className="px-8 py-3 rounded-full bg-white text-red-600 font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105">
          Get Started
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 px-4 pb-20">
        <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
          <div className="text-4xl mb-4">📍</div>
          <h3 className="text-xl font-semibold mb-2">Location-Based Reporting</h3>
          <p>Pinpoint issues on an interactive map and help authorities respond faster.</p>
        </div>
        <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">Community Building</h3>
          <p>Follow other active citizens and build a network of community advocates.</p>
        </div>
        <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
          <p>Monitor the status of reported issues and celebrate community victories.</p>
        </div>
      </div>
    </div>
  );
}