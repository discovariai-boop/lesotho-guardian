import { useRealTimeRoadData } from '@/hooks/useRealTimeRoadData';
import DashboardHeader from '@/components/DashboardHeader';
import SmartLesothoTransportMap from '@/components/SmartLesothoTransportMap';
import TrafficIncidentQueue from '@/components/TrafficIncidentQueue';
import SmartTrafficLightControl from '@/components/SmartTrafficLightControl';
import AITransportAssistant from '@/components/AITransportAssistant';
import RoadInfrastructureHealth from '@/components/RoadInfrastructureHealth';
import AnalyticsPanel from '@/components/AnalyticsPanel';

export default function Index() {
  const { incidents, vehicles, trafficLights, roads, stats, overrideLight, activateGreenWave } = useRealTimeRoadData();

  return (
    <div className="min-h-screen gradient-bg p-3 flex flex-col gap-3">
      <DashboardHeader stats={stats} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-0" style={{ height: 'calc(100vh - 100px)' }}>
        {/* Map - takes 2 columns */}
        <div className="lg:col-span-2 min-h-[400px]">
          <SmartLesothoTransportMap incidents={incidents} vehicles={vehicles} trafficLights={trafficLights} />
        </div>

        {/* Right side panels */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <TrafficIncidentQueue incidents={incidents} />
          </div>
          <div className="flex-1 min-h-0">
            <SmartTrafficLightControl lights={trafficLights} onOverride={overrideLight} onGreenWave={activateGreenWave} />
          </div>
        </div>

        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <AITransportAssistant />
          </div>
          <div className="flex-1 min-h-0">
            <RoadInfrastructureHealth roads={roads} />
          </div>
        </div>
      </div>

      {/* Bottom analytics */}
      <div className="h-[220px]">
        <AnalyticsPanel stats={stats} />
      </div>
    </div>
  );
}
