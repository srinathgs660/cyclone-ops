import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastScenarioResult, setLastScenarioResult] = useState(null);
  const [simulationActive, setSimulationActive] = useState(true);

  const scenarios = [
    {
      id: 1,
      title: 'Cyclone Approaching',
      desc: 'Wind speed increases +25 km/h, eye advances 35km coastward, risk zones elevate, warning broadcast.',
      badge: 'INTENSIFICATION'
    },
    {
      id: 2,
      title: 'Evacuation Surge',
      desc: 'Mass evacuation triggers: +28,000 citizens evacuated, shelter occupancy spikes to filling status.',
      badge: 'SURGE'
    },
    {
      id: 3,
      title: 'Shelter Overcapacity',
      desc: 'Coastal shelter hits 100% capacity; system reroutes incoming convoys to backup inland facilities.',
      badge: 'REROUTE'
    },
    {
      id: 4,
      title: 'Citizen Emergency SOS',
      desc: '14 civilians trapped in flood surge; system triages threat-to-life and dispatches nearest rescue boat.',
      badge: 'DISPATCH'
    },
    {
      id: 5,
      title: 'Relief Shortage & Convoy',
      desc: 'Critical water shortage detected in Sector A; automated emergency convoy dispatched from Central Hub.',
      badge: 'SUPPLY'
    }
  ];

  const triggerScenario = async (id) => {
    setIsSimulating(true);
    try {
      const res = await axios.post(`/api/simulation/scenario/${id}`);
      if (res.data.success) {
        setLastScenarioResult(res.data.data);
      }
      return res.data;
    } catch (err) {
      console.error('[Simulation Error]:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <SimulationContext.Provider value={{
      scenarios,
      triggerScenario,
      isSimulating,
      lastScenarioResult,
      simulationActive,
      setSimulationActive
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => useContext(SimulationContext);
