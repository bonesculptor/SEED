import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Shield, Mail, Calendar, MapPin, FileText, CreditCard } from 'lucide-react';
import { identityVerificationService } from '../services/identityVerificationService';
import { stripeService } from '../services/stripeService';
import { SectorThemeSelector } from './SectorThemeSelector';
import { themeService } from '../services/themeService';

export function AdminAccountManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    themeService.initializeTheme();
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchQuery, filterStatus]);

  const loadAccounts = async () => {
    try {
      const data = await identityVerificationService.getAllUserAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    if (searchQuery) {
      filtered = filtered.filter(
        (acc) =>
          acc.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          acc.document_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((acc) => acc.verification_status === filterStatus);
    }

    setFilteredAccounts(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'under_review':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleUpdateStatus = async (accountId: string, status: string) => {
    try {
      await identityVerificationService.updateUserAccount(accountId, {
        verification_status: status
      });
      await loadAccounts();
      if (selectedAccount?.id === accountId) {
        const updated = accounts.find((a) => a.id === accountId);
        setSelectedAccount(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const stats = {
    total: accounts.length,
    verified: accounts.filter((a) => a.verification_status === 'verified').length,
    pending: accounts.filter((a) => a.verification_status === 'pending').length,
    rejected: accounts.filter((a) => a.verification_status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--primary-500)' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Account Management</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Manage user accounts and verify identity documents</p>
          </div>
          <SectorThemeSelector />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Accounts</span>
              <Users className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Verified</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.verified}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Pending</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Rejected</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.rejected}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, email, or document number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'under_review', 'verified', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0f1419] text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                onClick={() => setSelectedAccount(account)}
                className={`bg-[#1a1f2e] border rounded-xl p-6 cursor-pointer transition-all ${
                  selectedAccount?.id === account.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{account.full_name || 'No Name'}</h3>
                    <p className="text-slate-400 text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {account.email}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-2 ${getStatusColor(account.verification_status)}`}>
                    {getStatusIcon(account.verification_status)}
                    {account.verification_status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span>{account.document_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{account.date_of_birth || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{account.nationality || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{account.account_tier}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredAccounts.length === 0 && (
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No accounts found</p>
              </div>
            )}
          </div>

          {/* Account Detail Panel */}
          <div className="lg:col-span-1">
            {selectedAccount ? (
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-6 sticky top-6">
                <h3 className="text-lg font-bold text-white mb-6">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Full Name</label>
                    <p className="text-white">{selectedAccount.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Email</label>
                    <p className="text-white">{selectedAccount.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Phone</label>
                    <p className="text-white">{selectedAccount.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Date of Birth</label>
                    <p className="text-white">{selectedAccount.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Nationality</label>
                    <p className="text-white">{selectedAccount.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Document Type</label>
                    <p className="text-white capitalize">{selectedAccount.document_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Document Number</label>
                    <p className="text-white">{selectedAccount.document_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Document Expiry</label>
                    <p className="text-white">{selectedAccount.document_expiry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Account Tier</label>
                    <p className="text-white capitalize">{selectedAccount.account_tier}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase mb-1 block">Created</label>
                    <p className="text-white">{new Date(selectedAccount.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedAccount.verification_status !== 'verified' && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <label className="text-xs text-slate-500 uppercase mb-3 block">Actions</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedAccount.id, 'verified')}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Account
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAccount.id, 'under_review')}
                        className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Mark Under Review
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAccount.id, 'rejected')}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1a1f2e] border border-slate-800 rounded-xl p-12 text-center">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select an account to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
