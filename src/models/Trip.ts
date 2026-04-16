import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema({
  name: String,
  description: String,
  geo: {
    lat: Number,
    lng: Number
  },
  timeToSpend: String,
  category: String,
  photoUrl: String
});

const DayPlanSchema = new mongoose.Schema({
  day: Number,
  theme: String,
  places: [PlaceSchema]
});

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: String,
  travelers: String,
  itinerary: [DayPlanSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.models.Trip || mongoose.model('Trip', TripSchema);
