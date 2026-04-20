// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Compass, MapPin, Calendar, Wallet, Users, ChevronRight, History, Trash2, LogIn } from 'lucide-react';
// import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
// import axios from 'axios';
// import TripForm from './components/TripForm';
// import Map from './components/Map';
// import LoadingItinerary from './components/LoadingItinerary';
// import SystemStatus from './components/SystemStatus';
// import { generateTripItinerary } from './lib/gemini';
// import { getPlacePhoto } from './lib/places';
// import { TripRequest, TripItinerary, DayPlan } from './types';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// export default function App() {
//   const { user, isLoaded: isUserLoaded } = useUser();
//   const [isLoading, setIsLoading] = useState(false);
//   const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
//   const [activeDay, setActiveDay] = useState(1);
//   const [savedTrips, setSavedTrips] = useState<TripItinerary[]>([]);
//   const [showHistory, setShowHistory] = useState(false);

//   useEffect(() => {
//     if (user) {
//       fetchTrips();
//     } else {
//       setSavedTrips([]);
//     }
//   }, [user]);

//   const fetchTrips = async () => {
//     if (!user) return;
//     try {
//       const response = await axios.get(`/api/trips/${user.id}`);
//       setSavedTrips(response.data);
//     } catch (error) {
//       // Error fetching trips: ${error}
//     }
//   };

//   const saveTrip = async (trip: TripItinerary) => {
//     try {
//       const response = await axios.post('/api/trips', trip);
//       setSavedTrips([response.data, ...savedTrips]);
//     } catch (error) {
//       // Error saving trip: ${error}
//     }
//   };

//   const deleteTrip = async (id: string) => {
//     try {
//       await axios.delete(`/api/trips/${id}`);
//       setSavedTrips(savedTrips.filter(t => t.id !== id));
//     } catch (error) {
//       // Error deleting trip: ${error}
//     }
//   };

//   const handleGenerateTrip = async (data: TripRequest) => {
//     setIsLoading(true);
//     try {
//       const result = await generateTripItinerary(data);
      
//       // Fetch photos for each place
//       const itineraryWithPhotos = await Promise.all(result.itinerary.map(async (day: DayPlan) => {
//         const placesWithPhotos = await Promise.all(day.places.map(async (place) => {
//           const photoUrl = await getPlacePhoto(place.name, result.destination);
//           return { ...place, photoUrl };
//         }));
//         return { ...day, places: placesWithPhotos };
//       }));

//       const newTrip: TripItinerary = {
//         ...result,
//         itinerary: itineraryWithPhotos,
//         budget: data.budget,
//         travelers: data.travelers,
//         createdAt: Date.now(),
//         userId: user?.id || 'guest'
//       };

//       setItinerary(newTrip);
//       if (user) {
//         await saveTrip(newTrip);
//       }
//       setActiveDay(1);
//     } catch (error) {
//       console.error('Failed to generate trip:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
//       {/* Header */}
//       <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
//         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer" onClick={() => { setItinerary(null); setShowHistory(false); }}>
//             <Compass className="w-6 h-6" />
//             <span>WanderAI</span>
//           </div>
//           <div className="flex items-center gap-4">
//             <SignedIn>
//               <Dialog open={showHistory} onOpenChange={setShowHistory}>
//                 <DialogTrigger
//                   render={
//                     <Button variant="ghost" size="sm" className="gap-2">
//                       <History className="w-4 h-4" />
//                       My Trips
//                     </Button>
//                   }
//                 />
//                 <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//                   <DialogHeader>
//                     <DialogTitle>Your Saved Trips</DialogTitle>
//                     <DialogDescription>
//                       Access your previously generated itineraries (synced to MongoDB).
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     {savedTrips.length === 0 ? (
//                       <div className="text-center py-8 text-slate-500">
//                         No trips saved yet. Start planning!
//                       </div>
//                     ) : (
//                       savedTrips.map((trip, i) => (
//                         <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { setItinerary(trip); setShowHistory(false); }}>
//                           <CardContent className="p-4 flex items-center justify-between">
//                             <div className="flex items-center gap-4">
//                               <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
//                                 <MapPin className="w-6 h-6 text-primary" />
//                               </div>
//                               <div>
//                                 <h4 className="font-bold">{trip.destination}</h4>
//                                 <p className="text-xs text-slate-500">
//                                   {trip.days} days • {new Date(trip.createdAt).toLocaleDateString()}
//                                 </p>
//                               </div>
//                             </div>
//                             <Button 
//                               variant="ghost" 
//                               size="icon" 
//                               className="text-slate-400 hover:text-destructive"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 deleteTrip((trip as any)._id);
//                               }}
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       ))
//                     )}
//                   </div>
//                 </DialogContent>
//               </Dialog>
//               <UserButton afterSignOutUrl="/" />
//             </SignedIn>
//             <SignedOut>
//               <SignInButton mode="modal">
//                 <Button size="sm" className="gap-2">
//                   <LogIn className="w-4 h-4" />
//                   Sign In
//                 </Button>
//               </SignInButton>
//             </SignedOut>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-12">
//         <AnimatePresence mode="wait">
//           {isLoading ? (
//             <motion.div
//               key="loading"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <LoadingItinerary />
//             </motion.div>
//           ) : !itinerary ? (
//             <motion.div
//               key="landing"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="space-y-12"
//             >
//               {/* Hero Section */}
//               <div className="text-center space-y-6 max-w-3xl mx-auto">
//                 <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
//                   Your Next Journey, <span className="text-primary">AI-Powered</span>
//                 </h1>
//                 <p className="text-xl text-slate-600 leading-relaxed">
//                   Stop spending hours planning. Tell us your preferences and get a personalized, 
//                   day-by-day itinerary with interactive maps in seconds.
//                 </p>
//               </div>

//               {/* Form Section */}
//               <TripForm onSubmit={handleGenerateTrip} isLoading={isLoading} />

//               {/* Features Section */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
//                 {[
//                   {
//                     title: "AI-Powered Itineraries",
//                     description: "Get personalized day-by-day plans tailored to your budget and style.",
//                     icon: <Compass className="w-8 h-8 text-primary" />
//                   },
//                   {
//                     title: "Interactive Maps",
//                     description: "Visualize your trip with Mapbox integration for every location.",
//                     icon: <MapPin className="w-8 h-8 text-primary" />
//                   },
//                   {
//                     title: "Smart Recommendations",
//                     description: "Discover hidden gems and must-visit spots curated by advanced AI.",
//                     icon: <History className="w-8 h-8 text-primary" />
//                   }
//                 ].map((feature, i) => (
//                   <Card key={i} className="bg-white/50 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-shadow">
//                     <CardContent className="p-8 space-y-4">
//                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
//                         {feature.icon}
//                       </div>
//                       <h3 className="text-xl font-bold">{feature.title}</h3>
//                       <p className="text-slate-600 leading-relaxed">{feature.description}</p>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="itinerary"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               className="grid grid-cols-1 lg:grid-cols-12 gap-8"
//             >
//               {/* Left Column: Itinerary Details */}
//               <div className="lg:col-span-7 space-y-8">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                   <div>
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       className="mb-2 -ml-2 text-slate-500"
//                       onClick={() => setItinerary(null)}
//                     >
//                       ← Back to planner
//                     </Button>
//                     <h2 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
//                       <MapPin className="w-8 h-8 text-primary" />
//                       {itinerary.destination}
//                     </h2>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     <Badge variant="secondary" className="gap-1 px-3 py-1">
//                       <Calendar className="w-3 h-3" /> {itinerary.days} Days
//                     </Badge>
//                     <Badge variant="secondary" className="gap-1 px-3 py-1 capitalize">
//                       <Wallet className="w-3 h-3" /> {itinerary.budget}
//                     </Badge>
//                     <Badge variant="secondary" className="gap-1 px-3 py-1 capitalize">
//                       <Users className="w-3 h-3" /> {itinerary.travelers}
//                     </Badge>
//                   </div>
//                 </div>

//                 <Tabs value={activeDay.toString()} onValueChange={(v) => setActiveDay(parseInt(v))} className="w-full">
//                   <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-auto p-0 gap-4">
//                     {itinerary.itinerary.map((day) => (
//                       <TabsTrigger 
//                         key={day.day} 
//                         value={day.day.toString()}
//                         className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-semibold"
//                       >
//                         Day {day.day}
//                       </TabsTrigger>
//                     ))}
//                   </TabsList>

//                   {itinerary.itinerary.map((day) => (
//                     <TabsContent key={day.day} value={day.day.toString()} className="mt-6 space-y-6">
//                       <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
//                         <h3 className="text-lg font-bold text-primary flex items-center gap-2">
//                           <Compass className="w-5 h-5" />
//                           {day.theme}
//                         </h3>
//                       </div>

//                       <div className="space-y-4">
//                         {day.places.map((place, idx) => (
//                           <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow group">
//                             <div className="relative h-48 overflow-hidden">
//                               <img 
//                                 src={place.photoUrl || ''} 
//                                 alt={place.name}
//                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                                 referrerPolicy="no-referrer"
//                               />
//                               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//                               <div className="absolute bottom-4 left-4 text-white">
//                                 <Badge className="bg-primary/80 hover:bg-primary border-none mb-2">
//                                   {place.category}
//                                 </Badge>
//                                 <h4 className="text-xl font-bold">{place.name}</h4>
//                               </div>
//                             </div>
//                             <CardHeader className="p-4 pb-2">
//                               <div className="flex items-start justify-between gap-4">
//                                 <div className="flex gap-3">
//                                   <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
//                                     {idx + 1}
//                                   </div>
//                                   <div>
//                                     <p className="text-sm text-slate-500 font-medium">{place.timeToSpend}</p>
//                                   </div>
//                                 </div>
//                               </div>
//                             </CardHeader>
//                             <CardContent className="p-4 pt-0">
//                               <p className="text-slate-600 leading-relaxed">{place.description}</p>
//                             </CardContent>
//                           </Card>
//                         ))}
//                       </div>
//                     </TabsContent>
//                   ))}
//                 </Tabs>
//               </div>

//               {/* Right Column: Map */}
//               <div className="lg:col-span-5">
//                 <div className="sticky top-24 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="font-bold text-lg flex items-center gap-2">
//                       <MapPin className="w-5 h-5 text-primary" />
//                       Interactive Map
//                     </h3>
//                     <span className="text-xs text-slate-500">Day {activeDay} Locations</span>
//                   </div>
//                   <Map 
//                     places={itinerary.itinerary.find(d => d.day === activeDay)?.places || []} 
//                   />
//                   <Card className="bg-slate-900 text-white border-none">
//                     <CardContent className="p-6 space-y-4">
//                       <h4 className="font-bold flex items-center gap-2">
//                         <ChevronRight className="w-4 h-4 text-primary" />
//                         Travel Tips
//                       </h4>
//                       <ul className="text-sm text-slate-300 space-y-2">
//                         <li>• Use local transport for an authentic experience.</li>
//                         <li>• Book popular attractions at least 2 days in advance.</li>
//                         <li>• Keep a digital copy of your itinerary offline.</li>
//                       </ul>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </main>

//       {/* Footer */}
//       <footer className="border-t bg-white py-12 mt-24">
//         <div className="container mx-auto px-4 text-center space-y-4">
//           <div className="flex items-center justify-center gap-2 font-bold text-xl text-primary opacity-50">
//             <Compass className="w-6 h-6" />
//             <span>WanderAI</span>
//           </div>
//           <p className="text-slate-500 text-sm">
//             © 2026 WanderAI Trip Planner. Powered by Gemini AI & Mapbox.
//           </p>
//         </div>
//       </footer>
//       <SystemStatus />
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Calendar, Wallet, Users, ChevronRight, History, Trash2, LogIn } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import TripForm from './components/TripForm';
import Map from './components/Map';
import LoadingItinerary from './components/LoadingItinerary';
import SystemStatus from './components/SystemStatus';
import { generateTripItinerary } from './lib/gemini';
import { getPlacePhoto } from './lib/places';
import { TripRequest, TripItinerary, DayPlan } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function App() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [savedTrips, setSavedTrips] = useState<TripItinerary[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      setSavedTrips([]);
    }
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/trips/${user.id}`);
      setSavedTrips(response.data);
    } catch (error) {
      // Error fetching trips
    }
  };

  const saveTrip = async (trip: TripItinerary) => {
    try {
      const response = await axios.post('/api/trips', trip);
      setSavedTrips([response.data, ...savedTrips]);
    } catch (error) {
      // Error saving trip
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await axios.delete(`/api/trips/${id}`);
      setSavedTrips(savedTrips.filter(t => t.id !== id));
    } catch (error) {
      // Error deleting trip
    }
  };

  const handleGenerateTrip = async (data: TripRequest) => {
    setIsLoading(true);
    try {
      const result = await generateTripItinerary(data);
      
      const itineraryWithPhotos = await Promise.all(result.itinerary.map(async (day: DayPlan) => {
        const placesWithPhotos = await Promise.all(day.places.map(async (place) => {
          const photoUrl = await getPlacePhoto(place.name, result.destination);
          return { ...place, photoUrl };
        }));
        return { ...day, places: placesWithPhotos };
      }));

      const newTrip: TripItinerary = {
        ...result,
        itinerary: itineraryWithPhotos,
        budget: data.budget,
        travelers: data.travelers,
        createdAt: Date.now(),
        userId: user?.id || 'guest'
      };

      setItinerary(newTrip);
      if (user) {
        await saveTrip(newTrip);
      }
      setActiveDay(1);
    } catch (error) {
      console.error('Failed to generate trip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer" onClick={() => { setItinerary(null); setShowHistory(false); }}>
            <Compass className="w-6 h-6" />
            <span>WanderAI</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedIn>
              <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogTrigger
                  render={
                    <Button variant="ghost" size="sm" className="gap-2">
                      <History className="w-4 h-4" />
                      My Trips
                    </Button>
                  }
                />
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Your Saved Trips</DialogTitle>
                    <DialogDescription>
                      Access your previously generated itineraries (synced to MongoDB).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {savedTrips.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No trips saved yet. Start planning!
                      </div>
                    ) : (
                      savedTrips.map((trip, i) => (
                        <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { setItinerary(trip); setShowHistory(false); }}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold">{trip.destination}</h4>
                                <p className="text-xs text-slate-500">
                                  {trip.days} days • {new Date(trip.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-slate-400 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTrip((trip as any)._id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingItinerary />
            </motion.div>
          ) : !itinerary ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
                  Your Next Journey, <span className="text-primary">AI-Powered</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Stop spending hours planning. Tell us your preferences and get a personalized, 
                  day-by-day itinerary with interactive maps in seconds.
                </p>
              </div>

              {/* Form Section */}
              <TripForm onSubmit={handleGenerateTrip} isLoading={isLoading} />

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                {[
                  {
                    title: "AI-Powered Itineraries",
                    description: "Get personalized day-by-day plans tailored to your budget and style.",
                    icon: <Compass className="w-8 h-8 text-primary" />
                  },
                  {
                    title: "Interactive Maps",
                    description: "Visualize your trip with Mapbox integration for every location.",
                    icon: <MapPin className="w-8 h-8 text-primary" />
                  },
                  {
                    title: "Smart Recommendations",
                    description: "Discover hidden gems and must-visit spots curated by advanced AI.",
                    icon: <History className="w-8 h-8 text-primary" />
                  }
                ].map((feature, i) => (
                  <Card key={i} className="bg-white/50 backdrop-blur-sm border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-8 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Itinerary Details */}
              <div className="lg:col-span-7 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mb-2 -ml-2 text-slate-500"
                      onClick={() => setItinerary(null)}
                    >
                      ← Back to planner
                    </Button>
                    <h2 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                      <MapPin className="w-8 h-8 text-primary" />
                      {itinerary.destination}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary" className="gap-1 px-3 py-1">
                      <Calendar className="w-3 h-3" /> {itinerary.days} Days
                    </Badge>
                    <Badge variant="secondary" className="gap-1 px-3 py-1 capitalize">
                      <Wallet className="w-3 h-3" /> {itinerary.budget}
                    </Badge>
                    <Badge variant="secondary" className="gap-1 px-3 py-1 capitalize">
                      <Users className="w-3 h-3" /> {itinerary.travelers}
                    </Badge>
                    <Button
                      size="sm"
                      className="gap-2 bg-green-500 hover:bg-green-600 text-white border-none"
                      onClick={() => window.open(`https://book.olacabs.com/?utm_source=wanderai&drop=${encodeURIComponent(itinerary.destination)}`, '_blank')}
                    >
                      🚖 Book Ola Cab
                    </Button>
                  </div>
                </div>

                <Tabs value={activeDay.toString()} onValueChange={(v) => setActiveDay(parseInt(v))} className="w-full">
                  <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-auto p-0 gap-4">
                    {itinerary.itinerary.map((day) => (
                      <TabsTrigger 
                        key={day.day} 
                        value={day.day.toString()}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2 font-semibold"
                      >
                        Day {day.day}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {itinerary.itinerary.map((day) => (
                    <TabsContent key={day.day} value={day.day.toString()} className="mt-6 space-y-6">
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                          <Compass className="w-5 h-5" />
                          {day.theme}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {day.places.map((place, idx) => (
                          <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={place.photoUrl || ''} 
                                alt={place.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-4 left-4 text-white">
                                <Badge className="bg-primary/80 hover:bg-primary border-none mb-2">
                                  {place.category}
                                </Badge>
                                <h4 className="text-xl font-bold">{place.name}</h4>
                              </div>
                            </div>
                            <CardHeader className="p-4 pb-2">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-500 font-medium">{place.timeToSpend}</p>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-slate-600 leading-relaxed">{place.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Right Column: Map */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Interactive Map
                    </h3>
                    <span className="text-xs text-slate-500">Day {activeDay} Locations</span>
                  </div>
                  <Map 
                    places={itinerary.itinerary.find(d => d.day === activeDay)?.places || []} 
                  />
                  <Card className="bg-slate-900 text-white border-none">
                    <CardContent className="p-6 space-y-4">
                      <h4 className="font-bold flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        Travel Tips
                      </h4>
                      <ul className="text-sm text-slate-300 space-y-2">
                        <li>• Use local transport for an authentic experience.</li>
                        <li>• Book popular attractions at least 2 days in advance.</li>
                        <li>• Keep a digital copy of your itinerary offline.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12 mt-24">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 font-bold text-xl text-primary opacity-50">
            <Compass className="w-6 h-6" />
            <span>WanderAI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 WanderAI Trip Planner. Powered by Gemini AI & Mapbox.
          </p>
        </div>
      </footer>
      <SystemStatus />
    </div>
  );
}
