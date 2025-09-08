import { useEffect, useState } from 'react';
import axios from 'axios';

export default function IssueForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    wardNumber: '',
    zoneNumber: '',
    location: { lat: '', lng: '', address: '' },
    streetName: '',
    landmark: '',
    fullAddress: '',
    pincode: '',
    images: [],
    videos: []
  });

  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [wards, setWards] = useState([]);

  // Handle generic form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetch('http://localhost:5000/wards')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setWards(d.data.wards || []);
      })
      .catch(() => setWards([]));
  }, []);

  // Fetch suggestions from Nominatim
  const handleAddressChange = async (e) => {
    const value = e.target.value;
    setAddress(value);

    if (value.length > 2) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching OSM suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // When a suggestion is clicked
  const handleSuggestionClick = (sugg) => {
    setAddress(sugg.display_name);
    setForm((prev) => ({
      ...prev,
      location: {
        lat: sugg.lat,
        lng: sugg.lon,
        address: sugg.display_name,
      },
    }));
    setSuggestions([]);
  };

  // Use current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const display = data.display_name || `${latitude}, ${longitude}`;
        setAddress(display);
        setForm(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude, address: display },
          fullAddress: display,
          pincode: (data.address && (data.address.postcode || data.address.pincode)) || ''
        }));
      } catch (e) {
        setForm(prev => ({ ...prev, location: { lat: latitude, lng: longitude, address: `${latitude}, ${longitude}` } }));
      }
    }, () => alert('Unable to retrieve your location'));
  };

  // Handle media
  const handleMedia = async (e, key) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    const dataUrls = await Promise.all(readers);
    setForm(prev => ({ ...prev, [key]: [...(prev[key] || []), ...dataUrls] }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', form);

    if (!form.location.lat || !form.location.lng) {
      alert('Please select a valid location from the suggestions.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.post('http://localhost:5000/issues', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Issue submitted successfully!');
      setForm({
        title: '',
        description: '',
        category: '',
        wardNumber: '',
        zoneNumber: '',
        location: { lat: '', lng: '', address: '' },
        streetName: '',
        landmark: '',
        fullAddress: '',
        pincode: '',
        images: [],
        videos: []
      });
      setAddress('');
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert(
        'Error submitting issue. Please log in or try again. Details: ' +
          error.message
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Issue Title
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., Water Logging on Main Street"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue in detail..."
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          required
        >
          <option value="">Select Category</option>
          <option value="Water Logging">Water Logging</option>
          <option value="Stray Dogs">Stray Dogs</option>
          <option value="Road Damage">Road Damage</option>
          <option value="No Street Lights">No Street Lights</option>
          <option value="Uncemented Road">Uncemented Road</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Safety">Safety</option>
          <option value="Environment">Environment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Ward / Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ward Number
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            name="wardNumber"
            value={form.wardNumber}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select Ward</option>
            {[...new Set(wards.map(w => w.wardNumber))].map((ward, i) => (
              <option key={i} value={ward}>{ward}</option>
            ))}
          </select>
          <select
            name="zoneNumber"
            value={form.zoneNumber}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            required
          >
            <option value="">Select Zone</option>
            {[...new Set(wards
              .filter(w => !form.wardNumber || w.wardNumber === form.wardNumber)
              .map(w => w.zoneNumber))].map((zone, i) => (
                <option key={i} value={zone}>{zone}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          value={address}
          onChange={handleAddressChange}
          placeholder="Search for an address..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          required
        />
        <button type="button" onClick={useCurrentLocation} className="mt-2 text-sm text-blue-600">Use Current Location</button>
        <p className="text-xs text-gray-500 mt-1">
          Start typing and select from suggestions
        </p>

        {suggestions.length > 0 && (
          <ul className="border border-gray-300 rounded-lg mt-2 bg-white max-h-40 overflow-y-auto shadow-md">
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(s)}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Address Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input name="streetName" value={form.streetName} onChange={handleChange} placeholder="Street/Road Name" className="p-3 border border-gray-300 rounded-lg" />
        <input name="landmark" value={form.landmark} onChange={handleChange} placeholder="Landmark (optional)" className="p-3 border border-gray-300 rounded-lg" />
        <input name="fullAddress" value={form.fullAddress} onChange={handleChange} placeholder="Full Address (optional)" className="p-3 border border-gray-300 rounded-lg" />
        <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="p-3 border border-gray-300 rounded-lg" />
      </div>

      {/* Severity removed from user submission. Officials can set from their actions. */}

      {/* Media Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <input type="file" accept="image/*" capture="environment" multiple onChange={(e) => handleMedia(e, 'images')} className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Videos</label>
          <input type="file" accept="video/*" capture="environment" multiple onChange={(e) => handleMedia(e, 'videos')} className="w-full" />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
      >
        Submit Issue
      </button>
    </form>
  );
}
