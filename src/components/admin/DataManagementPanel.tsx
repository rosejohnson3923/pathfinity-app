import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Shield,
  Calendar,
  BarChart3,
  FileText,
  Archive,
  Clock,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  Server,
  Cloud,
  Filter,
  Search,
  Eye,
  Settings,
  Copy,
  Save,
  Info
} from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface DataSnapshot {
  id: string;
  name: string;
  type: 'backup' | 'export' | 'archive';
  size: number; // in MB
  created_at: string;
  status: 'completed' | 'processing' | 'failed';
  location: 'local' | 'cloud' | 'azure';
  retention_days: number;
  encrypted: boolean;
}

interface DataUsage {
  category: string;
  current_size: number; // in GB
  limit: number; // in GB
  growth_rate: number; // % per month
  projected_full: string; // date
}

interface RetentionPolicy {
  data_type: string;
  retention_period: number; // days
  auto_delete: boolean;
  backup_required: boolean;
  compliance_required: boolean;
  last_reviewed: string;
}

// Mock data for PlainviewISD
const mockDataSnapshots: DataSnapshot[] = [
  {
    id: '1',
    name: 'Daily Student Progress Backup',
    type: 'backup',
    size: 2450,
    created_at: '2024-01-15T06:00:00Z',
    status: 'completed',
    location: 'azure',
    retention_days: 90,
    encrypted: true
  },
  {
    id: '2',
    name: 'Q2 Academic Reports Export',
    type: 'export',
    size: 890,
    created_at: '2024-01-14T15:30:00Z',
    status: 'completed',
    location: 'local',
    retention_days: 2555, // 7 years for compliance
    encrypted: true
  },
  {
    id: '3',
    name: 'Weekly System Backup',
    type: 'backup',
    size: 15600,
    created_at: '2024-01-14T02:00:00Z',
    status: 'completed',
    location: 'cloud',
    retention_days: 365,
    encrypted: true
  },
  {
    id: '4',
    name: 'Student Assessment Data',
    type: 'archive',
    size: 5200,
    created_at: '2024-01-13T10:15:00Z',
    status: 'processing',
    location: 'azure',
    retention_days: 2555,
    encrypted: true
  }
];

const mockDataUsage: DataUsage[] = [
  {
    category: 'Student Records',
    current_size: 12.5,
    limit: 50,
    growth_rate: 8.2,
    projected_full: '2026-08-15'
  },
  {
    category: 'Assessment Data',
    current_size: 8.9,
    limit: 25,
    growth_rate: 12.5,
    projected_full: '2025-11-20'
  },
  {
    category: 'Content Library',
    current_size: 15.2,
    limit: 75,
    growth_rate: 5.8,
    projected_full: '2027-03-10'
  },
  {
    category: 'System Logs',
    current_size: 3.1,
    limit: 10,
    growth_rate: 15.2,
    projected_full: '2025-06-30'
  },
  {
    category: 'Media Files',
    current_size: 22.8,
    limit: 100,
    growth_rate: 18.5,
    projected_full: '2025-12-15'
  }
];

const mockRetentionPolicies: RetentionPolicy[] = [
  {
    data_type: 'Student Academic Records',
    retention_period: 2555, // 7 years
    auto_delete: false,
    backup_required: true,
    compliance_required: true,
    last_reviewed: '2023-08-15'
  },
  {
    data_type: 'Assessment Results',
    retention_period: 1825, // 5 years
    auto_delete: false,
    backup_required: true,
    compliance_required: true,
    last_reviewed: '2023-08-15'
  },
  {
    data_type: 'Communication Logs',
    retention_period: 1095, // 3 years
    auto_delete: true,
    backup_required: false,
    compliance_required: true,
    last_reviewed: '2023-08-15'
  },
  {
    data_type: 'System Audit Logs',
    retention_period: 1095, // 3 years
    auto_delete: true,
    backup_required: true,
    compliance_required: true,
    last_reviewed: '2023-08-15'
  },
  {
    data_type: 'Temporary Files',
    retention_period: 30,
    auto_delete: true,
    backup_required: false,
    compliance_required: false,
    last_reviewed: '2023-08-15'
  }
];

export function DataManagementPanel() {
  const [snapshots] = useState<DataSnapshot[]>(mockDataSnapshots);
  const [dataUsage] = useState<DataUsage[]>(mockDataUsage);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(mockRetentionPolicies);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getTabStyle = (isActive: boolean) => ({
    padding: 'var(--space-4) var(--space-1)',
    borderBottom: isActive ? '2px solid var(--dashboard-nav-tab-active)' : '2px solid transparent',
    fontWeight: 'var(--font-medium)',
    fontSize: 'var(--text-sm)',
    whiteSpace: 'nowrap' as const,
    color: isActive ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 200ms ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  });

  const filteredSnapshots = snapshots.filter(snapshot => {
    const matchesSearch = snapshot.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || snapshot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle style={{ width: '1rem', height: '1rem', color: '#059669' }} />;
      case 'processing':
        return <Clock style={{ width: '1rem', height: '1rem', color: '#2563EB' }} className="animate-spin" />;
      case 'failed':
        return <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#DC2626' }} />;
      default:
        return <Clock style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'azure':
        return <Cloud style={{ width: '1rem', height: '1rem', color: '#2563EB' }} />;
      case 'cloud':
        return <Cloud style={{ width: '1rem', height: '1rem', color: '#9333EA' }} />;
      case 'local':
        return <HardDrive style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />;
      default:
        return <Server style={{ width: '1rem', height: '1rem', color: '#6B7280' }} />;
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const totalDataUsed = dataUsage.reduce((sum, item) => sum + item.current_size, 0);
  const totalDataLimit = dataUsage.reduce((sum, item) => sum + item.limit, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Data Management</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>Manage data backups, exports, and retention policies</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'transparent',
              color: 'var(--dashboard-text-secondary)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <RefreshCw style={{ width: '1rem', height: '1rem' }} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#2563EB',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#1D4ED8')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#2563EB')}
          >
            <Save style={{ width: '1rem', height: '1rem' }} />
            Create Backup
          </button>
        </div>
      </div>

      {/* Data Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Database style={{ width: '2rem', height: '2rem', color: '#2563EB' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#2563EB' }}>{totalDataUsed.toFixed(1)} GB</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Total Data Used</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>of {totalDataLimit} GB allocated</p>
          <div style={{ marginTop: 'var(--space-3)', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '0.5rem' }}>
            <div
              className={getUsageColor(getUsagePercentage(totalDataUsed, totalDataLimit))}
              style={{ height: '0.5rem', borderRadius: '9999px', width: `${getUsagePercentage(totalDataUsed, totalDataLimit)}%` }}
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Archive style={{ width: '2rem', height: '2rem', color: '#059669' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#059669' }}>{snapshots.length}</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Data Snapshots</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{snapshots.filter(s => s.status === 'completed').length} completed</p>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Shield style={{ width: '2rem', height: '2rem', color: '#9333EA' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#9333EA' }}>100%</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Encryption</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>All data encrypted</p>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Calendar style={{ width: '2rem', height: '2rem', color: '#EA580C' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#EA580C' }}>7</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Retention Policies</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{retentionPolicies.length} active policies</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid var(--dashboard-border-primary)' }}>
        <nav style={{ display: 'flex', gap: 'var(--space-8)', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'snapshots', label: 'Data Snapshots', icon: Archive },
            { id: 'usage', label: 'Storage Usage', icon: HardDrive },
            { id: 'retention', label: 'Retention Policies', icon: Calendar },
            { id: 'compliance', label: 'Compliance', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={getTabStyle(activeSection === id)}
            >
              <Icon style={{ width: '1rem', height: '1rem' }} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Recent Activity */}
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--dashboard-border-primary)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Recent Data Operations</h3>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {snapshots.slice(0, 4).map((snapshot) => (
                  <div key={snapshot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', border: '1px solid #F3F4F6', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {getStatusIcon(snapshot.status)}
                      <div>
                        <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{snapshot.name}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                          {formatFileSize(snapshot.size)} • {formatDate(snapshot.created_at)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {getLocationIcon(snapshot.location)}
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', textTransform: 'capitalize' }}>{snapshot.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'snapshots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Search and Filters */}
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} className="sm:flex-row">
              <div style={{ flex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', height: '1rem', width: '1rem', color: '#9CA3AF' }} />
                  <input
                    type="text"
                    placeholder="Search snapshots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      paddingLeft: '2.5rem',
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      border: '1px solid var(--dashboard-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--dashboard-bg-elevated)',
                      color: 'var(--dashboard-text-primary)',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dashboard-border-primary)'}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="focus:ring-2 focus:ring-blue-500"
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    color: 'var(--dashboard-text-primary)',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'transparent',
                    color: 'var(--dashboard-text-secondary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Download style={{ width: '1rem', height: '1rem' }} />
                  Export List
                </button>
              </div>
            </div>
          </div>

          {/* Snapshots Table */}
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--dashboard-border-primary)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>
                Data Snapshots ({filteredSnapshots.length})
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead style={{ backgroundColor: '#F9FAFB' }}>
                  <tr>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Snapshot
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Type
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Size
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Location
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Status
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Created
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'var(--dashboard-bg-elevated)' }}>
                  {filteredSnapshots.map((snapshot) => (
                    <tr
                      key={snapshot.id}
                      style={{ borderTop: '1px solid #E5E7EB' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <Shield style={{ width: '1rem', height: '1rem', color: '#059669' }} />
                          <div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{snapshot.name}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: '#6B7280' }}>
                              Retention: {snapshot.retention_days} days
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          snapshot.type === 'backup' ? 'bg-blue-100 text-blue-800' :
                          snapshot.type === 'export' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {snapshot.type}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                        {formatFileSize(snapshot.size)}
                      </td>
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {getLocationIcon(snapshot.location)}
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)', textTransform: 'capitalize' }}>{snapshot.location}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {getStatusIcon(snapshot.status)}
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)', textTransform: 'capitalize' }}>{snapshot.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                        {formatDate(snapshot.created_at)}
                      </td>
                      <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: '#6B7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <button
                            style={{ color: '#2563EB', padding: 'var(--space-1)', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                          >
                            <Download style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button
                            style={{ color: '#6B7280', padding: 'var(--space-1)', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                          >
                            <Eye style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button
                            style={{ color: '#DC2626', padding: 'var(--space-1)', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#B91C1C'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#DC2626'}
                          >
                            <Trash2 style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'usage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Storage Usage by Category */}
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Storage Usage by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {dataUsage.map((usage, index) => (
                <div key={index} style={{ border: '1px solid #F3F4F6', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{usage.category}</h4>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                      {usage.current_size.toFixed(1)} GB / {usage.limit} GB
                    </div>
                  </div>
                  <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '0.5rem', marginBottom: 'var(--space-2)' }}>
                    <div
                      className={getUsageColor(getUsagePercentage(usage.current_size, usage.limit))}
                      style={{ height: '0.5rem', borderRadius: '9999px', width: `${getUsagePercentage(usage.current_size, usage.limit)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: '#6B7280' }}>
                    <span>Growth: {usage.growth_rate}% per month</span>
                    <span>Projected full: {new Date(usage.projected_full).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'retention' && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Data Retention Policies</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Data Type
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Retention Period
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Auto Delete
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Backup Required
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Compliance
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Last Reviewed
                  </th>
                  <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--dashboard-bg-elevated)' }}>
                {retentionPolicies.map((policy, index) => (
                  <tr
                    key={index}
                    style={{ borderTop: '1px solid #E5E7EB' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{policy.data_type}</div>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                      {Math.round(policy.retention_period / 365)} years
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                      {policy.auto_delete ? (
                        <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
                      ) : (
                        <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid #D1D5DB', borderRadius: '9999px' }} />
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                      {policy.backup_required ? (
                        <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
                      ) : (
                        <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid #D1D5DB', borderRadius: '9999px' }} />
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                      {policy.compliance_required ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Optional
                        </span>
                      )}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                      {new Date(policy.last_reviewed).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: '#6B7280' }}>
                      <button
                        style={{ color: '#2563EB', cursor: 'pointer', border: 'none', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
                      >
                        <Settings style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>Compliance Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
                    <div>
                      <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>FERPA Compliance</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Educational privacy protection</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
                    <div>
                      <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Data Encryption</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>AES-256 encryption at rest and in transit</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
                    <div>
                      <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Backup Retention</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>7-year retention for academic records</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Governance */}
            <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>Data Governance</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                  <Info style={{ width: '1.25rem', height: '1.25rem', color: '#2563EB', marginTop: '0.125rem' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Access Controls</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Role-based access with audit logging</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                  <Info style={{ width: '1.25rem', height: '1.25rem', color: '#2563EB', marginTop: '0.125rem' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Data Classification</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Automatic PII detection and protection</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                  <Info style={{ width: '1.25rem', height: '1.25rem', color: '#2563EB', marginTop: '0.125rem' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Regular Audits</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Quarterly data governance reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}