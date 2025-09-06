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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'azure':
        return <Cloud className="w-4 h-4 text-blue-600" />;
      case 'cloud':
        return <Cloud className="w-4 h-4 text-purple-600" />;
      case 'local':
        return <HardDrive className="w-4 h-4 text-gray-600" />;
      default:
        return <Server className="w-4 h-4 text-gray-600" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Management</h2>
          <p className="text-gray-600 mt-1">Manage data backups, exports, and retention policies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Create Backup
          </button>
        </div>
      </div>

      {/* Data Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{totalDataUsed.toFixed(1)} GB</span>
          </div>
          <h3 className="font-medium text-gray-900">Total Data Used</h3>
          <p className="text-sm text-gray-600">of {totalDataLimit} GB allocated</p>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(totalDataUsed, totalDataLimit))}`}
              style={{ width: `${getUsagePercentage(totalDataUsed, totalDataLimit)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Archive className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{snapshots.length}</span>
          </div>
          <h3 className="font-medium text-gray-900">Data Snapshots</h3>
          <p className="text-sm text-gray-600">{snapshots.filter(s => s.status === 'completed').length} completed</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">100%</span>
          </div>
          <h3 className="font-medium text-gray-900">Encryption</h3>
          <p className="text-sm text-gray-600">All data encrypted</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">7</span>
          </div>
          <h3 className="font-medium text-gray-900">Retention Policies</h3>
          <p className="text-sm text-gray-600">{retentionPolicies.length} active policies</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
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
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeSection === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Data Operations</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {snapshots.slice(0, 4).map((snapshot) => (
                  <div key={snapshot.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(snapshot.status)}
                      <div>
                        <div className="font-medium text-gray-900">{snapshot.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatFileSize(snapshot.size)} • {formatDate(snapshot.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getLocationIcon(snapshot.location)}
                      <span className="text-sm text-gray-600 capitalize">{snapshot.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'snapshots' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search snapshots..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export List
                </button>
              </div>
            </div>
          </div>

          {/* Snapshots Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Data Snapshots ({filteredSnapshots.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Snapshot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSnapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{snapshot.name}</div>
                            <div className="text-xs text-gray-500">
                              Retention: {snapshot.retention_days} days
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          snapshot.type === 'backup' ? 'bg-blue-100 text-blue-800' :
                          snapshot.type === 'export' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {snapshot.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(snapshot.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getLocationIcon(snapshot.location)}
                          <span className="text-sm text-gray-900 capitalize">{snapshot.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(snapshot.status)}
                          <span className="text-sm text-gray-900 capitalize">{snapshot.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(snapshot.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-1">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-800 p-1">
                            <Trash2 className="w-4 h-4" />
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
        <div className="space-y-6">
          {/* Storage Usage by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Storage Usage by Category</h3>
            <div className="space-y-4">
              {dataUsage.map((usage, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{usage.category}</h4>
                    <div className="text-sm text-gray-600">
                      {usage.current_size.toFixed(1)} GB / {usage.limit} GB
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usage.current_size, usage.limit))}`}
                      style={{ width: `${getUsagePercentage(usage.current_size, usage.limit)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Retention Policies</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retention Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auto Delete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup Required
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Reviewed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {retentionPolicies.map((policy, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{policy.data_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(policy.retention_period / 365)} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {policy.auto_delete ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {policy.backup_required ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(policy.last_reviewed).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Settings className="w-4 h-4" />
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">FERPA Compliance</div>
                      <div className="text-sm text-gray-600">Educational privacy protection</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Data Encryption</div>
                      <div className="text-sm text-gray-600">AES-256 encryption at rest and in transit</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Backup Retention</div>
                      <div className="text-sm text-gray-600">7-year retention for academic records</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Governance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Governance</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Access Controls</div>
                    <div className="text-sm text-gray-600">Role-based access with audit logging</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Data Classification</div>
                    <div className="text-sm text-gray-600">Automatic PII detection and protection</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Regular Audits</div>
                    <div className="text-sm text-gray-600">Quarterly data governance reviews</div>
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