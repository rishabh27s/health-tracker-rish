import React from 'react';
import { Sprout } from 'lucide-react';
import CountTracker from '../components/CountTracker.jsx';
import { defaultSuperfoods } from '../data/superfoods.js';

export default function Superfoods() {
  return (
    <CountTracker
      title="Superfoods"
      subtitle="Nutrient-dense foods with outsized benefits — tick them off daily."
      icon={Sprout}
      listKey="ht.superfoods.list"
      logKey="ht.superfoods.log"
      defaultList={defaultSuperfoods}
      accent="sage"
    />
  );
}
