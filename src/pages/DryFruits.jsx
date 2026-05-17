import React from 'react';
import { Nut } from 'lucide-react';
import CountTracker from '../components/CountTracker.jsx';
import { defaultDryFruits } from '../data/dryfruits.js';

export default function DryFruits() {
  return (
    <CountTracker
      title="Dry Fruits"
      subtitle="A handful a day. Tap + each time you have one — soaked is best."
      icon={Nut}
      listKey="ht.dryfruits.list"
      logKey="ht.dryfruits.log"
      defaultList={defaultDryFruits}
      accent="amber"
    />
  );
}
