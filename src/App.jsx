import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme.js';
import Sidebar from './components/Sidebar.jsx';
import TrackerGate from './components/TrackerGate.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Water from './pages/Water.jsx';
import GreenTea from './pages/GreenTea.jsx';
import FoodLog from './pages/FoodLog.jsx';
import Supplements from './pages/Supplements.jsx';
import Protein from './pages/Protein.jsx';
import WeightLoss from './pages/WeightLoss.jsx';
import WeightJourney from './pages/WeightJourney.jsx';
import DryFruits from './pages/DryFruits.jsx';
import Superfoods from './pages/Superfoods.jsx';
import MyFoods from './pages/MyFoods.jsx';
import Yoga from './pages/Yoga.jsx';
import Library from './pages/Library.jsx';
import FoodBenefits from './pages/FoodBenefits.jsx';
import Skincare from './pages/Skincare.jsx';
import Haircare from './pages/Haircare.jsx';

export default function App() {
  useTheme(); // applies the persisted theme to <html> on mount + on change
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 main-scroll">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/water" element={<TrackerGate label="water"><Water /></TrackerGate>} />
            <Route path="/green-tea" element={<TrackerGate label="green tea"><GreenTea /></TrackerGate>} />
            <Route path="/food-log" element={<TrackerGate label="the food log"><FoodLog /></TrackerGate>} />
            <Route path="/supplements" element={<TrackerGate label="supplements"><Supplements /></TrackerGate>} />
            <Route path="/protein" element={<TrackerGate label="protein"><Protein /></TrackerGate>} />
            <Route path="/weight-loss" element={<WeightLoss />} />
            <Route path="/weight-journey" element={<TrackerGate label="your weight journey"><WeightJourney /></TrackerGate>} />
            <Route path="/dry-fruits" element={<TrackerGate label="dry fruits"><DryFruits /></TrackerGate>} />
            <Route path="/superfoods" element={<TrackerGate label="superfoods"><Superfoods /></TrackerGate>} />
            <Route path="/my-foods" element={<MyFoods />} />
            <Route path="/yoga" element={<TrackerGate label="yoga & meditation"><Yoga /></TrackerGate>} />
            <Route path="/library" element={<Library />} />
            <Route path="/food-benefits" element={<FoodBenefits />} />
            <Route path="/skincare" element={<TrackerGate label="skincare"><Skincare /></TrackerGate>} />
            <Route path="/haircare" element={<TrackerGate label="haircare"><Haircare /></TrackerGate>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
