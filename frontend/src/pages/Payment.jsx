import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { generateTicketPDF } from "../utils/ticketPDF";
import "../styles/Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Discount State
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      alert("Please login to complete your booking.");
      navigate("/login");
      return;
    }

    // Get booking data from localStorage
    const data = localStorage.getItem("bookingData");
    if (!data) {
      alert("No booking data found. Please select seats first.");
      navigate("/");
      return;
    }

    const parsedData = JSON.parse(data);
    setBookingData(parsedData);

    // Initialize passenger array based on selected seats
    setPassengers(
      parsedData.selectedSeats.map((seatNumber) => ({
        seatNumber,
        name: "",
        age: "",
        gender: "Male",
      }))
    );

    // Fetch route details (endpoint changed to flight)
    fetchRouteDetails(parsedData.flightId, parsedData.routeId);
  }, []);

  const fetchRouteDetails = async (flightId, routeId) => {
    try {
      const response = await api.get(`/flights/${flightId}`);
      const route = response.data.data.routes.find((r) => r._id === routeId);
      setRouteDetails({
        ...route,
        flight: response.data.data.flight, // Renamed from bus to flight based on controller update
      });
    } catch (err) {
      setError("Failed to load flight details");
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const toggleDiscount = () => {
    // Logic for "Celebrate Christmas" Deal: Get up to 2500 off.
    // Let's implement flat 2500 off if total > 5000, else 10% or similar logic?
    // User said "Get Upto 2500". I'll apply a flat 2500 for demonstration or min(2500, 20% of total).

    if (discountApplied) {
      setDiscountApplied(false);
      setDiscountAmount(0);
    } else {
      const maxDiscount = 2500;
      const calculatedDiscount = Math.min(maxDiscount, bookingData.totalAmount * 0.25); // 25% upto 2500

      // Or just fixed 2500 as per banner text implying a big deal? "Get upto 2500" usually means variable.
      // Let's settle on a nice round number for the demo, e.g., 2500 if total is high enough.

      let finalDisc = 0;
      if (bookingData.totalAmount > 5000) finalDisc = 2500;
      else finalDisc = 500; // Small discount for cheap flights

      setDiscountApplied(true);
      setDiscountAmount(finalDisc);
    }
  };

  const validateForm = () => {
    // Check all passengers have name and age
    for (const passenger of passengers) {
      if (!passenger.name.trim()) {
        alert("Please fill in all passenger names");
        return false;
      }
      if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
        alert("Please enter valid age for all passengers (1-120)");
        return false;
      }
    }

    if (!termsAccepted) {
      alert("Please accept terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const finalTotal = bookingData.totalAmount - discountAmount;

      const bookingPayload = {
        flightId: bookingData.flightId, // Updated param
        routeId: bookingData.routeId,
        journeyDate: bookingData.date,
        seats: passengers.map((p) => ({
          seatNumber: p.seatNumber,
          passengerName: p.name,
          passengerAge: parseInt(p.age),
          passengerGender: p.gender,
        })),
        totalAmount: finalTotal, // Send discounted amount
        paymentMethod: paymentMethod,
        bookingStatus: "confirmed",
      };

      const response = await api.post("/bookings", bookingPayload);
      const bookingId = response.data.data._id;

      // Generate PDF ticket data (pass Flight details here)
      const ticketData = {
        bookingId: bookingId,
        passengers: passengers,
        route: routeDetails,
        flight: routeDetails.flight, // Updated
        journeyDate: bookingData.date,
        totalSeats: bookingData.selectedSeats.length,
        totalAmount: finalTotal,
      };

      // Generate and download PDF ticket
      generateTicketPDF(ticketData);

      // Clear booking data from localStorage
      localStorage.removeItem("bookingData");

      alert(
        `Booking confirmed! Your booking ID is ${bookingId}\nTicket has been downloaded.`
      );
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.error ||
          "Failed to create booking. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData || !routeDetails) {
    return <div className="loader">Loading booking details...</div>;
  }

  const finalAmount = bookingData.totalAmount - discountAmount;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Booking</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-content">
          {/* Booking Summary */}
          <div className="booking-summary-card">
            <h2>Booking Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Flight:</span>
                <strong>{routeDetails.flight?.name} ({routeDetails.flight?.airline})</strong>
              </div>
              <div className="summary-row">
                <span>Route:</span>
                <strong>
                  {routeDetails.source} → {routeDetails.destination}
                </strong>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <strong>
                  {new Date(bookingData.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </div>
              <div className="summary-row">
                <span>Departure:</span>
                <strong>{routeDetails.departureTime}</strong>
              </div>
              <div className="summary-row">
                <span>Selected Seats:</span>
                <strong>{bookingData.selectedSeats.join(", ")}</strong>
              </div>
              <div className="summary-row">
                <span>Base Fare:</span>
                <strong>₹{bookingData.totalAmount}</strong>
              </div>

              {/* Promo Section */}
              <div
                className={`promo-box ${discountApplied ? 'applied' : ''}`}
                onClick={toggleDiscount}
              >
                <div className="promo-title">
                  <span>🎄 Use Code: XMAS2025</span>
                  <span className="apply-text">{discountApplied ? "REMOVE" : "APPLY"}</span>
                </div>
                <div className="promo-desc">
                  Celebrate Christmas & New Year! Get upto ₹2,500* off.
                </div>
                {discountApplied && (
                  <div style={{ color: '#27ae60', fontSize: '12px', marginTop: '5px' }}>
                    <strong>Success!</strong> ₹{discountAmount} discount applied.
                  </div>
                )}
              </div>

              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong>₹{finalAmount}</strong>
              </div>
            </div>
          </div>

          {/* Passenger Details Form */}
          <div className="passenger-details-card">
            <h2>Passenger Details</h2>
            <form onSubmit={handleSubmit}>
              {passengers.map((passenger, index) => (
                <div key={passenger.seatNumber} className="passenger-form">
                  <h3>
                    Passenger {index + 1} - Seat {passenger.seatNumber}
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, "name", e.target.value)
                        }
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Age *</label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) =>
                          handlePassengerChange(index, "age", e.target.value)
                        }
                        placeholder="Age"
                        min="1"
                        max="120"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) =>
                          handlePassengerChange(index, "gender", e.target.value)
                        }
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Payment Method */}
              <div className="payment-method-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">📱</span>
                      UPI
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💳</span>
                      Credit/Debit Card
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === "netbanking"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">🏦</span>
                      Net Banking
                    </span>
                  </label>
                </div>
                <p className="payment-note">
                  <strong>Note:</strong> This is a demo. Payment will be
                  simulated.
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-section">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>
                    I accept the{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      terms and conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-large btn-block"
                disabled={loading}
              >
                {loading ? "Processing..." : `Pay ₹${finalAmount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
