import { useState } from 'react';
import axios from 'axios';

export default function IssueForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    wardNumber: '',
    location: { lat: '', lng: '', address: '' },
  });

  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Handle generic form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
        location: { lat: '', lng: '', address: '' },
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

      {/* Ward Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ward Number
        </label>
        <input
          name="wardNumber"
          value={form.wardNumber}
          onChange={handleChange}
          placeholder="e.g., Ward 5"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          required
        />
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
