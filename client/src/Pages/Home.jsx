import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import IssueForm from '../Components/IssueForm';
import IssueFeed from '../Components/IssueFeed';
import Navbar from '../Components/Navbar';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center = [37.774546, -122.433523];

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState({ name: 'Swetha P', followers: 124, following: 87 });

  useEffect(() => {
    fetch('http://localhost:5000/issues')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch issues');
        return res.json();
      })
      .then(data => {
        setIssues(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Error fetching issues:', err);
        setIssues([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-gradient-to-r from-red-500 to-yellow-400 rounded-xl p-6 text-white mb-6 shadow-lg">
          <h1 className="text-3xl font-bold">🛠️ CivicConnect</h1>
          <p className="mt-2">Report local issues and connect with your community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <MapContainer 
                center={center} 
                zoom={13} 
                style={{ height: '400px', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={center} />
                
                {issues
                  .filter(issue => issue.location && issue.location.lat && issue.location.lng)
                  .map(issue => (
                    <Marker 
                      key={issue._id} 
                      position={[issue.location.lat, issue.location.lng]}
                    >
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{issue.title}</h3>
                          <p>{issue.category}</p>
                          <p>Ward: {issue.wardNumber}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))
                }
              </MapContainer>
            </div>

            <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Report an Issue</h2>
              <IssueForm />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Community Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">247</p>
                  <p className="text-sm text-gray-600">Issues Reported</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">183</p>
                  <p className="text-sm text-gray-600">Issues Resolved</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">1.2k</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">24</p>
                  <p className="text-sm text-gray-600">Wards Covered</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Trending Issues</h2>
              <div className="space-y-4">
                {Array.isArray(issues) && issues.length > 0 ? (
                  issues.slice(0, 3).map(issue => (
                    <div key={issue._id} className="border-l-4 border-red-500 pl-3 py-2">
                      <h3 className="font-semibold">{issue.title || 'Untitled Issue'}</h3>
                      <p className="text-sm text-gray-600">
                        Ward {issue.wardNumber || 'N/A'} • {issue.likes?.length || 0} likes • {issue.comments?.length || 0} comments
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">
                    No trending issues yet. Be the first to report one!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Issues by Cluster</h2>
          <IssueFeed />
        </div>
      </div>
    </div>
  );
}