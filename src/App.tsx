import { useState } from 'react';
import { MonitoringDashboard } from './components/monitoring-dashboard';
import { AIAssistantChat } from './components/ai-assistant-chat';
import { TimelineScreen } from './components/timeline-screen';
import { DeviceSetupScreen } from './components/device-setup-screen';
import { MapEditorV2 } from './components/map-editor-v2';
import { SettingsScreen } from './components/settings-screen';
import { PatientManagementV2 } from './components/patient-management-v2';
import { DemoControlPage } from './components/demo-control-page';
import { UserPage } from './components/user-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { StoreProvider, useStore } from './lib/store';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Bell, Settings, Users } from 'lucide-react';
import { Badge } from './components/ui/badge';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'admin' | 'demo' | 'user'>('admin');
  const { unreadCount } = useStore();

  return (
    <div className="size-full bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="size-full flex flex-col">
      {/* Top Header - Clean & Professional */}
      <div className="border-b bg-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center justify-between py-3 md:py-4 px-3 md:px-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-9 h-9 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-[#0056B3] flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 shrink-0"
              >
                <span className="text-white font-bold text-base md:text-2xl">W</span>
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-[#0056B3] text-sm md:text-xl lg:text-2xl truncate">
                  WheelSense
                </h1>
                <p className="text-muted-foreground text-[10px] md:text-sm hidden sm:block truncate">
                  Smart Indoor Navigation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* View Mode Selector - Mobile Optimized */}
              <Select value={viewMode} onValueChange={(value: any) => {
                setViewMode(value);
                if (value === 'demo') setActiveTab('demo-control');
                else if (value === 'user') setActiveTab('user-page');
                else setActiveTab('dashboard');
              }}>
                <SelectTrigger className="w-[120px] md:w-[180px] h-9 text-xs md:text-sm">
                  <Users className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">👨‍💼 Admin</SelectItem>
                  <SelectItem value="demo">🎬 Demo</SelectItem>
                  <SelectItem value="user">👤 User</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Notification Bell - Mobile Optimized */}
              <button 
                className="relative p-1.5 md:p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 group shrink-0"
                onClick={() => setActiveTab('timeline')}
                title={`${unreadCount} การแจ้งเตือนใหม่`}
                aria-label={`Notifications, ${unreadCount} unread`}
              >
                <Bell 
                  className="text-gray-600 group-hover:text-[#0056B3] transition-colors w-4 h-4 md:w-6 md:h-6" 
                />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 min-w-4 h-4 md:min-w-5 md:h-5 flex items-center justify-center bg-red-500 text-white font-bold text-[10px] md:text-xs shadow-md animate-pulse border-2 border-white px-0.5 md:px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
            <TabsList className="w-full justify-start rounded-none border-0 bg-gray-50 p-0 h-auto overflow-x-auto scrollbar-hide">
              {viewMode === 'admin' && (
                <>
                  <TabsTrigger 
                    value="dashboard" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <span className="english-text font-semibold">📊 Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="map-editor" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <span className="english-text font-semibold">🗺️ Map</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="devices" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <span className="english-text font-semibold">📱 Devices</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="patients" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <span className="english-text font-semibold">👤 Patients</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <span className="english-text font-semibold">📅 Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="assistant" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <span className="english-text font-semibold">🤖 AI</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                  >
                    <Settings className="mr-1 md:mr-2 w-3 h-3 md:w-5 md:h-5" />
                    <span className="english-text font-semibold hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </>
              )}
              {viewMode === 'demo' && (
                <TabsTrigger 
                  value="demo-control" 
                  className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                >
                  <span className="english-text font-semibold">🎬 Demo Control</span>
                </TabsTrigger>
              )}
              {viewMode === 'user' && (
                <TabsTrigger 
                  value="user-page" 
                  className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-2 md:px-4 lg:px-6 py-1.5 md:py-3 text-xs md:text-base flex-shrink-0"
                >
                  <span className="english-text font-semibold">👤 Dashboard</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        
        {/* Content Area - Mobile Optimized */}
        <div className="flex-1 overflow-auto bg-gray-50 p-0 md:p-4 lg:p-6">
          <div className="container mx-auto h-full">
            {/* Admin View Tabs */}
            <TabsContent value="dashboard" className="m-0 h-full bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <MonitoringDashboard />
            </TabsContent>
            <TabsContent value="map-editor" className="m-0 h-full bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <MapEditorV2 />
            </TabsContent>
            <TabsContent value="devices" className="m-0 h-full bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <DeviceSetupScreen />
            </TabsContent>
            <TabsContent value="patients" className="m-0 h-full bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <PatientManagementV2 />
            </TabsContent>
            <TabsContent value="timeline" className="m-0 h-full bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <TimelineScreen />
            </TabsContent>
            <TabsContent value="assistant" className="m-0 h-full flex items-center justify-center bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <AIAssistantChat />
            </TabsContent>
            <TabsContent value="settings" className="m-0 h-full bg-white md:rounded-2xl md:shadow-sm p-2 md:p-4 lg:p-6">
              <SettingsScreen />
            </TabsContent>
            
            {/* Demo Control View */}
            <TabsContent value="demo-control" className="m-0 h-full">
              <DemoControlPage />
            </TabsContent>
            
            {/* User View */}
            <TabsContent value="user-page" className="m-0 h-full">
              <UserPage />
            </TabsContent>
          </div>
        </div>

      </Tabs>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ErrorBoundary>
  );
}
