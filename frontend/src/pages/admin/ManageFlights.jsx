import { useState, useEffect } from "react";
import api from "../../config/api";
import "../../styles/AdminPages.css";

const ManageFlights = () => {
  const [flights, setFlights] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    flightNumber: "",
    aircraftType: "Airbus A320",
    class: "Economy",
    airline: "",
    amenities: [],
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await api.get("/admin/flights");
      setFlights(response.data.data);
    } catch (err) {
      alert("Failed to load flights");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting flight data:", formData);

    try {
      let response;
      if (editingId) {
        response = await api.put(`/admin/flights/${editingId}`, formData);
        alert("Flight updated successfully");
      } else {
        response = await api.post("/admin/flights", formData);
        alert("Flight added successfully");
      }
      console.log("Success response:", response.data);
      resetForm();
      fetchFlights();
    } catch (err) {
      console.error("Error adding flight:", err);
      console.error("Error response:", err.response);
      const errorMessage =
        err.response?.data?.error || err.message || "Operation failed";
      alert(`Error: ${errorMessage}\nCheck console for details`);
    }
  };

  const handleEdit = (flight) => {
    setFormData({
      name: flight.name,
      flightNumber: flight.flightNumber,
      aircraftType: flight.aircraftType,
      class: flight.class,
      airline: flight.airline,
      amenities: flight.amenities || [],
    });
    setEditingId(flight._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flight?")) return;
    try {
      await api.delete(`/admin/flights/${id}`);
      alert("Flight deleted");
      fetchFlights();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      flightNumber: "",
      aircraftType: "Airbus A320",
      class: "Economy",
      airline: "",
      amenities: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Manage Flights</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Flight"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            placeholder="Flight Name (e.g. Morning Express)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Flight Number"
            value={formData.flightNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                flightNumber: e.target.value.toUpperCase(),
              })
            }
            required
          />
          <select
            value={formData.aircraftType}
            onChange={(e) =>
              setFormData({ ...formData, aircraftType: e.target.value })
            }
          >
            <option value="Airbus A320">Airbus A320</option>
            <option value="Boeing 737">Boeing 737</option>
            <option value="Boeing 747">Boeing 747</option>
            <option value="Airbus A380">Airbus A380</option>
            <option value="Embraer E190">Embraer E190</option>
          </select>
          <select
            value={formData.class}
            onChange={(e) =>
              setFormData({ ...formData, class: e.target.value })
            }
            required
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First Class">First Class</option>
          </select>
          <div className="info-message">
            <p>
              <strong>ℹ️ Note:</strong> Seat layout will be automatically
              generated based on the selected class (Economy, Premium Economy, Business, First).
            </p>
          </div>
          <input
            type="text"
            placeholder="Airline Name"
            value={formData.airline}
            onChange={(e) =>
              setFormData({ ...formData, airline: e.target.value })
            }
            required
          />
          <button type="submit" className="btn btn-success">
            {editingId ? "Update Flight" : "Add Flight"}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Flight No</th>
              <th>Name</th>
              <th>Aircraft</th>
              <th>Class</th>
              <th>Seats</th>
              <th>Airline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight._id}>
                <td>{flight.flightNumber}</td>
                <td>{flight.name}</td>
                <td>{flight.aircraftType}</td>
                <td>{flight.class}</td>
                <td>{flight.totalSeats}</td>
                <td>{flight.airline}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleEdit(flight)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(flight._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFlights;
