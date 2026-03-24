import { useState } from 'react';
import { useRealTimeRoadData } from '@/hooks/useRealTimeRoadData';
import DashboardHeader from '@/components/DashboardHeader';
import SmartLesothoTransportMap from '@/components/SmartLesothoTransportMap';
import TrafficIncidentQueue from '@/components/TrafficIncidentQueue';
import SmartTrafficLightControl from '@/components/SmartTrafficLightControl';
import AITransportAssistant from '@/components/AITransportAssistant';
import RoadInfrastructureHealth from '@/components/RoadInfrastructureHealth';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const CONTENT_HEIGHT = 'calc(100vh - 88px)';

export default function Index() {
  const { incidents, vehicles, trafficLights, roads, stats, overrideLight, activateGreenWave, resolveIncident, dispatchUnit } = useRealTimeRoadData();
  const [activeSection, setActiveSection] = useState('map');

  const renderContent = () => {
    switch (activeSection) {
      case 'map':
        return (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-0" style={{ height: CONTENT_HEIGHT }}>
            <div className="lg:col-span-2 min-h-[400px]">
              <SmartLesothoTransportMap incidents={incidents} vehicles={vehicles} trafficLights={trafficLights} />
            </div>
            <div className="flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0">
                <TrafficIncidentQueue incidents={incidents} onResolve={resolveIncident} onDispatch={dispatchUnit} />
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
        );
      case 'incidents':
        return (
          <div className="flex-1 min-h-0" style={{ height: CONTENT_HEIGHT }}>
            <TrafficIncidentQueue
              incidents={incidents}
              onResolve={resolveIncident}
              onDispatch={dispatchUnit}
              fullView
            />
          </div>
        );
      case 'traffic-lights':
        return (
          <div className="flex-1 min-h-0" style={{ height: CONTENT_HEIGHT }}>
            <SmartTrafficLightControl lights={trafficLights} onOverride={overrideLight} onGreenWave={activateGreenWave} />
          </div>
        );
      case 'infrastructure':
        return (
          <div className="flex-1 min-h-0" style={{ height: CONTENT_HEIGHT }}>
            <RoadInfrastructureHealth roads={roads} />
          </div>
        );
      case 'analytics':
        return (
          <div className="flex-1 min-h-0" style={{ height: CONTENT_HEIGHT }}>
            <AnalyticsPanel stats={stats} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 flex flex-col gradient-bg p-3 gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <DashboardHeader stats={stats} />
            </div>
          </div>
          {renderContent()}
        </div>
      </div>
    </SidebarProvider>
  );
}
