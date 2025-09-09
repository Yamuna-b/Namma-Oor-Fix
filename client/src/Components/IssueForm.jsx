import { useState, useEffect } from "react";

export default function IssueForm({ selectedLocation }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ward: "",
    zone: "",
    lat: "",
    lng: "",
    address: "",
    images: [],
    videos: [],
  });

  // Update when location selected from map
  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedLocation.address,
      }));
    }
  }, [selectedLocation]);

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle media upload
  const handleMedia = (e, type) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files],
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    try {
      const res = await fetch("http://localhost:5000/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit");
      alert("✅ Issue submitted successfully!");
      setFormData({
        title: "",
        description: "",
        category: "",
        ward: "",
        zone: "",
        lat: "",
        lng: "",
        address: "",
        images: [],
        videos: [],
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit issue");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          placeholder="Enter issue title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          placeholder="Describe the issue"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">-- Select Category --</option>
          <option value="Garbage">🗑 Garbage</option>
          <option value="Road">🛣 Road</option>
          <option value="Water">💧 Water</option>
          <option value="Electricity">💡 Electricity</option>
          <option value="Other">⚡ Other</option>
        </select>
      </div>

      {/* Ward & Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ward</label>
          <select
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Select Ward --</option>
            {["Ward 1", "Ward 2", "Ward 3", "Ward 4", "Ward 5", "Ward 6", "Ward 7", "Ward 8", "Ward 9", "Ward 10"].map(
              (w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Zone</label>
          <select
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">-- Select Zone --</option>
            {[
              "Madurai North",
              "Madurai South",
              "Madurai East",
              "Madurai West",
              "Anna Nagar",
              "KK Nagar",
              "Tallakulam",
              "Simmakkal",
              "Thiruparankundram",
              "Koodal Nagar",
            ].map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location (auto from map) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="text"
            name="lat"
            value={formData.lat}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="text"
            name="lng"
            value={formData.lng}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            readOnly
            className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-100"
          />
        </div>
      </div>

      {/* Media Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📷 Media Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition-colors p-6 text-gray-500">
              <span className="text-sm mb-2">📁 Click to select images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMedia(e, "images")}
                className="hidden"
              />
            </label>
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Videos
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition-colors p-6 text-gray-500">
              <span className="text-sm mb-2">🎥 Click to select videos</span>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleMedia(e, "videos")}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
        >
          🚀 Submit Issue
        </button>
      </div>
    </form>
  );
}
