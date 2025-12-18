import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import "../styles/SeatSelection.css";

const SeatSelection = () => {
  const { flightId, routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [seatLayout, setSeatLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [route, setRoute] = useState(null);
  const date = searchParams.get("date");

  useEffect(() => {
    fetchSeatLayout();
    fetchRouteDetails();
  }, []);

  const fetchSeatLayout = async () => {
    try {
      const response = await api.get(
        `/flights/${flightId}/seats?routeId=${routeId}&date=${date}`
      );
      setSeatLayout(response.data.data);
    } catch (err) {
      setError("Failed to load seat layout");
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteDetails = async () => {
    try {
      const response = await api.get(`/flights/${flightId}`);
      const routeData = response.data.data.routes.find(
        (r) => r._id === routeId
      );
      setRoute(routeData);
    } catch (err) {
      console.error("Error fetching route details");
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    if (selectedSeats.find((s) => s.seatNumber === seat.seatNumber)) {
      setSelectedSeats(
        selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber)
      );
    } else {
      if (selectedSeats.length < 9) { // Allow more seats for groups
        setSelectedSeats([...selectedSeats, seat]);
      } else {
        alert("You can select maximum 9 seats");
      }
    }
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      alert("Please login to continue booking");
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    // Store booking data in localStorage and navigate to booking form
    const bookingData = {
      flightId,
      routeId,
      date,
      selectedSeats: selectedSeats.map((s) => s.seatNumber),
      totalAmount: route?.price * selectedSeats.length,
    };
    localStorage.setItem("bookingData", JSON.stringify(bookingData));
    navigate("/booking-form");
  };

  if (loading) return <div className="loader">Loading seats...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="seat-selection">
      <div className="seat-selection-header">
        <h2>Select Your Seats</h2>
        {route && (
          <p>
            {route.source} → {route.destination}
          </p>
        )}
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat-demo available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="seat-demo selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="seat-demo booked"></div>
          <span>Booked</span>
        </div>
      </div>

      <div className="seat-layout-container">
        {/* Aircraft Nose / Cockpit visual */}
        <div className="cockpit-section" style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: "60px solid #e2e8f0",
            margin: "0 auto",
            borderRadius: "50% 50% 0 0 / 100% 100% 0 0"
          }}></div>
        </div>

        <div className="seats-grid" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${seatLayout?.layout === '3x3' ? 7 : (seatLayout?.layout === '2x2' ? 5 : 4)}, 1fr)`,
          gap: '10px',
          justifyContent: 'center',
          maxWidth: '500px',
          margin: '0 auto'  // Center the grid
        }}>
          {seatLayout?.seats.map((seat, index) => {
            const isSelected = selectedSeats.find(
              (s) => s.seatNumber === seat.seatNumber
            );

            // Logic for Aisle: depends on layout. 
            // Simple generic check: if column is "aisleAfter" column? 
            // The backend layout template had "aisleAfter". But here we receive flattened seats array.
            // We can approximate aisle by column number if we knew the layout string.
            // For 3x3 (ABC DEF), aisle is after col 3.
            // For 2x2 (AC DF), aisle is after col 2.

            let isAisle = false;
            if (seatLayout?.layout === '3x3' && seat.column === 3) isAisle = true;
            if (seatLayout?.layout === '2x2' && seat.column === 2) isAisle = true;

            const isBusiness = seat.type === "business" || seat.type === "first";

            return (
              <React.Fragment key={seat.seatNumber}>
                <div
                  className={`seat ${seat.isBooked ? "booked" : ""} ${isSelected ? "selected" : ""
                    } ${isBusiness ? "business-class" : ""}`}
                  onClick={() => handleSeatClick(seat)}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: isSelected ? '#10b981' : (seat.isBooked ? '#cbd5e1' : '#fff'),
                    border: isSelected ? 'none' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: isSelected ? 'white' : '#1e293b'
                  }}
                >
                  {seat.seatNumber}
                </div>
                {/* Spacer for Aisle in Grid */}
                {isAisle && <div className="aisle-spacer" style={{ width: '20px' }}></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="booking-summary">
        <div className="summary-content">
          <div className="selected-info">
            <h3>
              Selected Seats:{" "}
              {selectedSeats.map((s) => s.seatNumber).join(", ") || "None"}
            </h3>
            <p>Total: ₹{route ? route.price * selectedSeats.length : 0}</p>
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={handleProceed}
            disabled={selectedSeats.length === 0}
          >
            Proceed to Book ({selectedSeats.length} seats)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
