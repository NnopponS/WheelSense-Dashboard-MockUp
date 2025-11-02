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
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-[#0056B3] flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="text-white font-bold text-lg md:text-2xl">W</span>
              </div>
              <div>
                <h1 className="font-bold text-[#0056B3] text-base md:text-xl lg:text-2xl">
                  WheelSense
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Smart Indoor Navigation Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Selector */}
              <Select value={viewMode} onValueChange={(value: any) => {
                setViewMode(value);
                if (value === 'demo') setActiveTab('demo-control');
                else if (value === 'user') setActiveTab('user-page');
                else setActiveTab('dashboard');
              }}>
                <SelectTrigger className="w-[180px]">
                  <Users className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">👨‍💼 Admin View</SelectItem>
                  <SelectItem value="demo">🎬 Demo Control</SelectItem>
                  <SelectItem value="user">👤 User View</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Notification Bell */}
              <button 
                className="relative p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 group"
                onClick={() => setActiveTab('timeline')}
                title={`${unreadCount} การแจ้งเตือนใหม่`}
                aria-label={`Notifications, ${unreadCount} unread`}
              >
                <Bell 
                  className="text-gray-600 group-hover:text-[#0056B3] transition-colors w-5 h-5 md:w-6 md:h-6" 
                />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white font-bold text-xs shadow-md animate-pulse border-2 border-white px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
            <TabsList className="w-full justify-start rounded-none border-0 bg-gray-50 p-0 h-auto overflow-x-auto">
              {viewMode === 'admin' && (
                <>
                  <TabsTrigger 
                    value="dashboard" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <span className="english-text font-semibold">📊 Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="map-editor" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <span className="english-text font-semibold">🗺️ Map Editor</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="devices" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <span className="english-text font-semibold">📱 Devices</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="patients" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <span className="english-text font-semibold">👤 Patients</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <span className="english-text font-semibold">📅 Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="assistant" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <span className="english-text font-semibold">🤖 AI Assistant</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                  >
                    <Settings className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                    <span className="english-text font-semibold">Settings</span>
                  </TabsTrigger>
                </>
              )}
              {viewMode === 'demo' && (
                <TabsTrigger 
                  value="demo-control" 
                  className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                >
                  <span className="english-text font-semibold">🎬 Demo Control</span>
                </TabsTrigger>
              )}
              {viewMode === 'user' && (
                <TabsTrigger 
                  value="user-page" 
                  className="rounded-none border-b-3 border-transparent data-[state=active]:border-[#0056B3] data-[state=active]:bg-white hover:bg-white/70 transition-all duration-200 cursor-pointer whitespace-nowrap px-3 md:px-4 lg:px-6 py-2 md:py-3 text-sm md:text-base"
                >
                  <span className="english-text font-semibold">👤 User Dashboard</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        
        {/* Content Area */}
        <div className="flex-1 overflow-auto md:bg-gray-50 p-2 md:p-4 lg:p-6">
          <div className="container mx-auto">
            {/* Admin View Tabs */}
            <TabsContent value="dashboard" className="m-0 h-full md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
              <MonitoringDashboard />
            </TabsContent>
            <TabsContent value="map-editor" className="m-0 h-full md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
              <MapEditorV2 />
            </TabsContent>
            <TabsContent value="devices" className="m-0 h-full md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
              <DeviceSetupScreen />
            </TabsContent>
            <TabsContent value="patients" className="m-0 h-full md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
              <PatientManagementV2 />
            </TabsContent>
            <TabsContent value="timeline" className="m-0 h-full md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
              <TimelineScreen />
            </TabsContent>
            <TabsContent value="assistant" className="m-0 h-full flex items-center justify-center md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
              <AIAssistantChat />
            </TabsContent>
            <TabsContent value="settings" className="m-0 h-full md:bg-white md:rounded-2xl md:shadow-sm p-3 md:p-4 lg:p-6">
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
