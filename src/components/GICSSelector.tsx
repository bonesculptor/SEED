import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Building2, Factory, Briefcase, Target, Star, Clock } from 'lucide-react';
import { userContextService, GICSHierarchyLevel, UserContext } from '../services/userContextService';

interface GICSSelectorProps {
  onContextSelect: (context: UserContext) => void;
  onClose: () => void;
}

export function GICSSelector({ onContextSelect, onClose }: GICSSelectorProps) {
  const [currentLevel, setCurrentLevel] = useState<'sector' | 'industry_group' | 'industry' | 'sub_industry'>('sector');
  const [sectors, setSectors] = useState<GICSHierarchyLevel[]>([]);
  const [industryGroups, setIndustryGroups] = useState<GICSHierarchyLevel[]>([]);
  const [industries, setIndustries] = useState<GICSHierarchyLevel[]>([]);
  const [subIndustries, setSubIndustries] = useState<GICSHierarchyLevel[]>([]);

  const [selectedSector, setSelectedSector] = useState<GICSHierarchyLevel | null>(null);
  const [selectedIndustryGroup, setSelectedIndustryGroup] = useState<GICSHierarchyLevel | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<GICSHierarchyLevel | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<GICSHierarchyLevel | null>(null);

  const [loading, setLoading] = useState(false);
  const [shortcuts, setShortcuts] = useState<UserContext[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(true);

  useEffect(() => {
    loadSectors();
    loadShortcuts();
  }, []);

  const loadShortcuts = async () => {
    const frequent = await userContextService.getFrequentContexts();
    setShortcuts(frequent);
  };

  const loadSectors = async () => {
    try {
      setLoading(true);
      await userContextService.loadGICSHierarchyFromCSV();
      const data = await userContextService.getSectors();
      console.log('Loaded sectors:', data);
      setSectors(data);
    } catch (error) {
      console.error('Error loading sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorSelect = async (sector: GICSHierarchyLevel) => {
    setSelectedSector(sector);
    setSelectedIndustryGroup(null);
    setSelectedIndustry(null);
    setSelectedSubIndustry(null);
    setLoading(true);
    const groups = await userContextService.getIndustryGroups(sector.code);
    setIndustryGroups(groups);
    setCurrentLevel('industry_group');
    setLoading(false);
  };

  const handleIndustryGroupSelect = async (group: GICSHierarchyLevel) => {
    setSelectedIndustryGroup(group);
    setSelectedIndustry(null);
    setSelectedSubIndustry(null);
    setLoading(true);
    const inds = await userContextService.getIndustries(group.code);
    setIndustries(inds);
    setCurrentLevel('industry');
    setLoading(false);
  };

  const handleIndustrySelect = async (industry: GICSHierarchyLevel) => {
    setSelectedIndustry(industry);
    setSelectedSubIndustry(null);
    setLoading(true);
    const subs = await userContextService.getSubIndustries(industry.code);
    setSubIndustries(subs);
    setCurrentLevel('sub_industry');
    setLoading(false);
  };

  const handleSubIndustrySelect = (subIndustry: GICSHierarchyLevel) => {
    setSelectedSubIndustry(subIndustry);
  };

  const handleConfirm = async () => {
    if (!selectedSector) return;

    const context: UserContext = {
      gicsSector: selectedSector.code,
      sectorName: selectedSector.name,
      gicsIndustryGroup: selectedIndustryGroup?.code,
      industryGroupName: selectedIndustryGroup?.name,
      gicsIndustry: selectedIndustry?.code,
      industryName: selectedIndustry?.name,
      gicsSubIndustry: selectedSubIndustry?.code,
      subIndustryName: selectedSubIndustry?.name,
      domainContext: {},
    };

    await userContextService.saveContext(context);
    onContextSelect(context);
  };

  const goBack = () => {
    if (currentLevel === 'sub_industry') {
      setCurrentLevel('industry');
      setSelectedSubIndustry(null);
    } else if (currentLevel === 'industry') {
      setCurrentLevel('industry_group');
      setSelectedIndustry(null);
      setSubIndustries([]);
    } else if (currentLevel === 'industry_group') {
      setCurrentLevel('sector');
      setSelectedIndustryGroup(null);
      setIndustries([]);
      setSubIndustries([]);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'sector': return <Building2 className="w-5 h-5" />;
      case 'industry_group': return <Factory className="w-5 h-5" />;
      case 'industry': return <Briefcase className="w-5 h-5" />;
      case 'sub_industry': return <Target className="w-5 h-5" />;
      default: return null;
    }
  };

  const getLevelTitle = (level: string) => {
    switch (level) {
      case 'sector': return 'Select Sector (Level 1)';
      case 'industry_group': return 'Select Industry Group (Level 2)';
      case 'industry': return 'Select Industry (Level 3)';
      case 'sub_industry': return 'Select Sub-Industry (Level 4)';
      default: return '';
    }
  };

  const getCurrentItems = () => {
    switch (currentLevel) {
      case 'sector': return sectors;
      case 'industry_group': return industryGroups;
      case 'industry': return industries;
      case 'sub_industry': return subIndustries;
      default: return [];
    }
  };

  const getSelectedItem = () => {
    switch (currentLevel) {
      case 'sector': return selectedSector;
      case 'industry_group': return selectedIndustryGroup;
      case 'industry': return selectedIndustry;
      case 'sub_industry': return selectedSubIndustry;
      default: return null;
    }
  };

  const handleItemClick = (item: GICSHierarchyLevel) => {
    switch (currentLevel) {
      case 'sector': handleSectorSelect(item); break;
      case 'industry_group': handleIndustryGroupSelect(item); break;
      case 'industry': handleIndustrySelect(item); break;
      case 'sub_industry': handleSubIndustrySelect(item); break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-200 dark:border-dark-border">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text">
              Set Your Domain Context
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-dark-muted flex-wrap">
            {selectedSector && (
              <>
                <span className="font-medium text-blue-600 dark:text-cyber-blue">{selectedSector.name}</span>
                {selectedIndustryGroup && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-blue-600 dark:text-cyber-blue">{selectedIndustryGroup.name}</span>
                  </>
                )}
                {selectedIndustry && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-blue-600 dark:text-cyber-blue">{selectedIndustry.name}</span>
                  </>
                )}
                {selectedSubIndustry && (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-medium text-blue-600 dark:text-cyber-blue">{selectedSubIndustry.name}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Shortcuts */}
        {showShortcuts && shortcuts.length > 0 && currentLevel === 'sector' && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Recent Selections
                </h4>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.slice(0, 3).map((shortcut) => (
                <button
                  key={shortcut.id}
                  onClick={() => onContextSelect(shortcut)}
                  className="w-full flex items-center justify-between p-3 bg-white dark:bg-dark-surface rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all"
                >
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-dark-text">
                      {shortcut.sectorName}
                      {shortcut.subIndustryName && ` → ${shortcut.subIndustryName}`}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                      Used {shortcut.usageCount || 1} times
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Level Header */}
        <div className="p-4 bg-slate-50 dark:bg-dark-hover border-b border-slate-200 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-cyber-blue">
              {getLevelIcon(currentLevel)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-dark-text">
                {getLevelTitle(currentLevel)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-muted">
                Drill down to narrow your domain context
              </p>
            </div>
          </div>
        </div>

        {/* Selection List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : getCurrentItems().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-slate-600 dark:text-dark-muted mb-2">No options available</p>
              <p className="text-sm text-slate-500 dark:text-dark-muted">Loading GICS data...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getCurrentItems().map((item) => {
                const isSelected = getSelectedItem()?.code === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-dark-surface'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium text-slate-900 dark:text-dark-text">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-dark-muted mt-1">
                        Code: {item.code}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-600 dark:text-cyber-blue" />
                      )}
                      {currentLevel !== 'sub_industry' && (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-hover">
          <div className="flex gap-3">
            {currentLevel !== 'sector' && (
              <button
                onClick={goBack}
                className="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-dark-text"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-dark-border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-dark-text"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSector}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {selectedSubIndustry ? 'Confirm Selection' : 'Confirm at This Level'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
