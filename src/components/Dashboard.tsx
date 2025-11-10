import { Activity, TrendingUp, Users, Zap, Database, Network, FileHeart } from 'lucide-react';
import { useState, useEffect } from 'react';
import NavigationMenu from './NavigationMenu';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'records' | 'graph' | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [autoSeeding, setAutoSeeding] = useState(false);

  useEffect(() => {
    checkForData();
  }, []);

  const checkForData = async () => {
    try {
      const { data, error } = await supabase
        .from('fhir_patient_protocols')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Error checking for data:', error);
        setHasData(false);
        return;
      }

      const dataExists = data && data.length > 0;
      setHasData(dataExists);

      if (!dataExists && !autoSeeding) {
        setAutoSeeding(true);
        await handleSeedData(true);
      }
    } catch (error) {
      console.error('Error in checkForData:', error);
      setHasData(false);
    }
  };

  const handleSeedData = async (isAutomatic = false) => {
    setSeeding(true);
    try {
      console.log(isAutomatic ? 'Auto-seeding data...' : 'Manual seed initiated...');
      const { seedSimonGrangeData } = await import('../scripts/seedSimonGrangeData');
      const result = await seedSimonGrangeData();
      console.log('Seed completed:', result);
      setHasData(true);

      if (!isAutomatic) {
        alert('✅ Simon Grange medical records loaded successfully!\n\nVisit the Graph View to see all 29 records visualized.');
      }
    } catch (error: any) {
      console.error('Error seeding data:', error);
      const errorMessage = error?.message || 'Unknown error';
      if (!isAutomatic) {
        alert(`❌ Error loading data:\n\n${errorMessage}\n\nCheck browser console for details.`);
      }
    }
    setSeeding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavigationMenu currentPath="/" />

      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pl-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">SEED Platform Dashboard</h1>
            </div>
            <div className="text-sm text-slate-400">
              Personal Medical Record System
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-20">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Personal Medical Record System</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => window.location.href = '/medical-records'}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 cursor-pointer hover:from-blue-500 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Medical Records</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Manage your complete health history with FHIR R4 compliant records across 8 protocol levels
              </p>
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <span>Manage Records</span>
                <span>→</span>
              </div>
            </div>

            <div
              onClick={() => window.location.href = '/medical-graph'}
              className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 cursor-pointer hover:from-purple-500 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Graph View</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Visualize relationships between patients, practitioners, conditions, and treatments
              </p>
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <span>View Graph</span>
                <span>→</span>
              </div>
            </div>

            <div
              onClick={() => window.location.href = '/workflow'}
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 cursor-pointer hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileHeart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Medical Workflow</h3>
              </div>
              <p className="text-green-100 text-sm mb-4">
                Process medical records through context-aware agent-driven workflows
              </p>
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <span>Start Workflow</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Patient Records"
            value="1"
            change="Simon Grange"
            icon={Users}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Records"
            value="29"
            change="8 Levels"
            icon={Activity}
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Graph Edges"
            value="24"
            change="Connections"
            icon={TrendingUp}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title="System Health"
            value="Optimal"
            change="All Systems"
            icon={Zap}
            color="from-amber-500 to-amber-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">FHIR Protocol Levels</h2>
            <div className="space-y-3">
              {[
                { level: 1, name: 'Patient', count: 1, color: 'blue' },
                { level: 2, name: 'Practitioner', count: 3, color: 'purple' },
                { level: 3, name: 'Encounter', count: 4, color: 'green' },
                { level: 4, name: 'Condition', count: 4, color: 'red' },
                { level: 5, name: 'Medication', count: 7, color: 'orange' },
                { level: 6, name: 'Procedure', count: 2, color: 'cyan' },
                { level: 7, name: 'Observation', count: 6, color: 'teal' },
                { level: 8, name: 'Document', count: 1, color: 'slate' }
              ].map((item) => (
                <div
                  key={item.level}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-${item.color}-500/20 rounded-lg flex items-center justify-center text-${item.color}-400 font-bold text-sm`}>
                      L{item.level}
                    </div>
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-slate-400">{item.count} records</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              <StatusItem label="Database" status="connected" />
              <StatusItem label="FHIR API" status="connected" />
              <StatusItem label="Graph Engine" status="connected" />
              <StatusItem label="Workflow Engine" status="connected" />
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSeedData(false)}
                  disabled={seeding || hasData === null}
                  className="w-full text-left px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasData === null ? 'Checking data...' :
                   seeding ? 'Loading...' :
                   hasData ? 'Reload Sample Records' :
                   'Load Simon Grange Records'}
                </button>
                {hasData && (
                  <div className="px-3 py-2 bg-green-600/20 text-green-400 rounded-lg text-xs">
                    ✓ Sample data loaded
                  </div>
                )}
                <button className="w-full text-left px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm transition-colors">
                  Export Records
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className: string }>;
  color: string;
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mb-2">
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <p className="text-xs text-green-400">{change}</p>
    </div>
  );
}

interface StatusItemProps {
  label: string;
  status: 'connected' | 'disconnected' | 'warning';
}

function StatusItem({ label, status }: StatusItemProps) {
  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="text-xs text-slate-400 capitalize">{status}</span>
      </div>
    </div>
  );
}
