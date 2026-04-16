import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TripRequest } from '../types';
import { Plane, Calendar, Wallet, Users } from 'lucide-react';

interface TripFormProps {
  onSubmit: (data: TripRequest) => void;
  isLoading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TripRequest>({
    destination: '',
    days: 3,
    budget: 'moderate',
    travelers: 'solo',
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination) return;
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl border-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">Plan Your Next Adventure</CardTitle>
        <CardDescription>Fill in the details and let AI craft your perfect itinerary</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Plane className="w-4 h-4 text-primary" />
              Where do you want to go?
            </label>
            <Input
              placeholder="e.g. Paris, Tokyo, Bali..."
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="h-12 text-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                How many days?
              </label>
              <Input
                type="number"
                min={1}
                max={30}
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                What's your budget?
              </label>
              <Select
                value={formData.budget}
                onValueChange={(value: any) => setFormData({ ...formData, budget: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cheap">Cheap (Backpacker)</SelectItem>
                  <SelectItem value="moderate">Moderate (Mid-range)</SelectItem>
                  <SelectItem value="luxury">Luxury (High-end)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Who are you traveling with?
              </label>
              <Select
                value={formData.travelers}
                onValueChange={(value: any) => setFormData({ ...formData, travelers: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select travelers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo">Solo Traveler</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20" disabled={isLoading}>
            {isLoading ? 'Crafting Itinerary...' : 'Generate Trip Plan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TripForm;
