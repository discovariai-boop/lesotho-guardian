import { Map, AlertTriangle, TrafficCone, Building2, BarChart3, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  { id: "map",             title: "Smart Map",       icon: Map,          badge: null },
  { id: "incidents",       title: "Incidents",       icon: AlertTriangle, badge: "live" },
  { id: "traffic-lights",  title: "Traffic Lights",  icon: TrafficCone,  badge: null },
  { id: "infrastructure",  title: "Infrastructure",  icon: Building2,    badge: null },
  { id: "analytics",       title: "Analytics",       icon: BarChart3,    badge: null },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className={`border-b border-border/40 ${collapsed ? 'px-2 py-3' : 'px-4 py-3'}`}>
        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground leading-none">LTRA</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">Command Centre</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[9px] uppercase tracking-widest text-muted-foreground px-3 mb-1">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    tooltip={item.title}
                    className="relative"
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1 text-xs">{item.title}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="absolute bottom-4 left-3 right-3">
            <div className="glass-panel-sm p-2.5 text-center">
              <div className="w-2 h-2 bg-green-500 rounded-full status-pulse mx-auto mb-1" />
              <p className="text-[9px] text-muted-foreground">System Operational</p>
              <p className="text-[9px] font-mono text-green-600 font-semibold">ALL SYSTEMS ONLINE</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
