import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  Users,
  BookOpen,
  Truck,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart,
  BarChart3,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Calculator
} from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on-track' | 'over-budget' | 'under-budget';
  subcategories?: BudgetSubcategory[];
}

interface BudgetSubcategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface SchoolBudget {
  schoolId: string;
  schoolName: string;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number;
  categories: BudgetCategory[];
}

// Mock budget data for PlainviewISD
const mockDistrictBudget: SchoolBudget[] = [
  {
    schoolId: 'sand-view-elementary-school-001',
    schoolName: 'Sand View Elementary',
    totalAllocated: 2800000,
    totalSpent: 2450000,
    totalRemaining: 350000,
    utilizationRate: 87.5,
    categories: [
      {
        id: 'personnel',
        name: 'Personnel & Salaries',
        allocated: 1680000,
        spent: 1500000,
        remaining: 180000,
        percentage: 89.3,
        status: 'on-track',
        subcategories: [
          { id: 'teachers', name: 'Teacher Salaries', allocated: 1200000, spent: 1080000, remaining: 120000 },
          { id: 'support', name: 'Support Staff', allocated: 320000, spent: 290000, remaining: 30000 },
          { id: 'admin', name: 'Administration', allocated: 160000, spent: 130000, remaining: 30000 }
        ]
      },
      {
        id: 'instructional',
        name: 'Instructional Materials',
        allocated: 420000,
        spent: 380000,
        remaining: 40000,
        percentage: 90.5,
        status: 'on-track'
      },
      {
        id: 'technology',
        name: 'Technology & Equipment',
        allocated: 350000,
        spent: 320000,
        remaining: 30000,
        percentage: 91.4,
        status: 'on-track'
      },
      {
        id: 'facilities',
        name: 'Facilities & Maintenance',
        allocated: 280000,
        spent: 200000,
        remaining: 80000,
        percentage: 71.4,
        status: 'under-budget'
      },
      {
        id: 'transportation',
        name: 'Transportation',
        allocated: 70000,
        spent: 50000,
        remaining: 20000,
        percentage: 71.4,
        status: 'under-budget'
      }
    ]
  },
  {
    schoolId: 'ocean-view-middle-school-001',
    schoolName: 'Ocean View Middle School',
    totalAllocated: 2200000,
    totalSpent: 1980000,
    totalRemaining: 220000,
    utilizationRate: 90.0,
    categories: [
      {
        id: 'personnel',
        name: 'Personnel & Salaries',
        allocated: 1320000,
        spent: 1200000,
        remaining: 120000,
        percentage: 90.9,
        status: 'on-track'
      },
      {
        id: 'instructional',
        name: 'Instructional Materials',
        allocated: 330000,
        spent: 310000,
        remaining: 20000,
        percentage: 93.9,
        status: 'on-track'
      },
      {
        id: 'technology',
        name: 'Technology & Equipment',
        allocated: 275000,
        spent: 260000,
        remaining: 15000,
        percentage: 94.5,
        status: 'on-track'
      },
      {
        id: 'facilities',
        name: 'Facilities & Maintenance',
        allocated: 220000,
        spent: 160000,
        remaining: 60000,
        percentage: 72.7,
        status: 'under-budget'
      },
      {
        id: 'transportation',
        name: 'Transportation',
        allocated: 55000,
        spent: 50000,
        remaining: 5000,
        percentage: 90.9,
        status: 'on-track'
      }
    ]
  },
  {
    schoolId: 'city-view-high-school-001',
    schoolName: 'City View High School',
    totalAllocated: 3200000,
    totalSpent: 2880000,
    totalRemaining: 320000,
    utilizationRate: 90.0,
    categories: [
      {
        id: 'personnel',
        name: 'Personnel & Salaries',
        allocated: 1920000,
        spent: 1750000,
        remaining: 170000,
        percentage: 91.1,
        status: 'on-track'
      },
      {
        id: 'instructional',
        name: 'Instructional Materials',
        allocated: 480000,
        spent: 450000,
        remaining: 30000,
        percentage: 93.8,
        status: 'on-track'
      },
      {
        id: 'technology',
        name: 'Technology & Equipment',
        allocated: 400000,
        spent: 380000,
        remaining: 20000,
        percentage: 95.0,
        status: 'on-track'
      },
      {
        id: 'facilities',
        name: 'Facilities & Maintenance',
        allocated: 320000,
        spent: 240000,
        remaining: 80000,
        percentage: 75.0,
        status: 'under-budget'
      },
      {
        id: 'transportation',
        name: 'Transportation',
        allocated: 80000,
        spent: 60000,
        remaining: 20000,
        percentage: 75.0,
        status: 'under-budget'
      }
    ]
  }
];

export function DistrictBudgetPanel() {
  const [budgetData] = useState<SchoolBudget[]>(mockDistrictBudget);
  const [selectedSchool, setSelectedSchool] = useState<SchoolBudget | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'by-school' | 'by-category'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  const totalDistrictBudget = budgetData.reduce((sum, school) => sum + school.totalAllocated, 0);
  const totalDistrictSpent = budgetData.reduce((sum, school) => sum + school.totalSpent, 0);
  const totalDistrictRemaining = budgetData.reduce((sum, school) => sum + school.totalRemaining, 0);
  const avgUtilization = budgetData.reduce((sum, school) => sum + school.utilizationRate, 0) / budgetData.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'over-budget':
        return 'bg-red-100 text-red-800';
      case 'under-budget':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'over-budget':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'under-budget':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'personnel':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'instructional':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'technology':
        return <Settings className="w-5 h-5 text-purple-600" />;
      case 'facilities':
        return <Building className="w-5 h-5 text-orange-600" />;
      case 'transportation':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleExportBudget = () => {
    // Generate CSV export
    const csvContent = [
      ['School', 'Category', 'Allocated', 'Spent', 'Remaining', 'Utilization %'],
      ...budgetData.flatMap(school =>
        school.categories.map(category => [
          school.schoolName,
          category.name,
          category.allocated,
          category.spent,
          category.remaining,
          category.percentage
        ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plainview-isd-budget-report.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">District Budget Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Financial planning and budget allocation across all schools</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportBudget}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export Budget
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Budget Request
          </button>
        </div>
      </div>

      {/* District Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total District Budget</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDistrictBudget)}</p>
            </div>
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDistrictSpent)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining Budget</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDistrictRemaining)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Utilization</p>
              <p className="text-2xl font-bold text-purple-600">{avgUtilization.toFixed(1)}%</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'overview'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            District Overview
          </button>
          <button
            onClick={() => setSelectedView('by-school')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'by-school'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By School
          </button>
          <button
            onClick={() => setSelectedView('by-category')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'by-category'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      {/* School Budget Overview */}
      {selectedView === 'by-school' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetData.map((school) => (
            <div key={school.schoolId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{school.schoolName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Utilization: {school.utilizationRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Budget</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(school.totalAllocated)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spent</span>
                    <span className="font-medium text-red-600">{formatCurrency(school.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
                    <span className="font-medium text-green-600">{formatCurrency(school.totalRemaining)}</span>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span>Budget Usage</span>
                    <span>{school.utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        school.utilizationRate > 95 ? 'bg-red-500' :
                        school.utilizationRate > 85 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(school.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSchool(school)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Details
                  </button>
                  <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Budget Overview */}
      {selectedView === 'by-category' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget by Category</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Allocated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {['personnel', 'instructional', 'technology', 'facilities', 'transportation'].map((categoryId) => {
                    const categoryData = budgetData.reduce((acc, school) => {
                      const category = school.categories.find(c => c.id === categoryId);
                      if (category) {
                        acc.allocated += category.allocated;
                        acc.spent += category.spent;
                        acc.remaining += category.remaining;
                      }
                      return acc;
                    }, { allocated: 0, spent: 0, remaining: 0 });

                    const utilization = (categoryData.spent / categoryData.allocated) * 100;
                    const status = utilization > 95 ? 'over-budget' : utilization > 85 ? 'on-track' : 'under-budget';

                    return (
                      <tr key={categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {getCategoryIcon(categoryId)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {categoryId === 'personnel' ? 'Personnel & Salaries' :
                               categoryId === 'instructional' ? 'Instructional Materials' :
                               categoryId === 'technology' ? 'Technology & Equipment' :
                               categoryId === 'facilities' ? 'Facilities & Maintenance' :
                               'Transportation'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(categoryData.allocated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(categoryData.spent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(categoryData.remaining)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {utilization.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* District Overview Charts */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Allocation by School</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {budgetData.map((school) => (
                  <div key={school.schoolId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{school.schoolName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(school.totalAllocated)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {((school.totalAllocated / totalDistrictBudget) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(school.totalAllocated / totalDistrictBudget) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Utilization Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {budgetData.map((school) => (
                  <div key={school.schoolId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{school.schoolName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{school.utilizationRate}%</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">utilized</p>
                      </div>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            school.utilizationRate > 95 ? 'bg-red-500' :
                            school.utilizationRate > 85 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(school.utilizationRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSchool.schoolName} Budget</h2>
                  <p className="text-gray-600 dark:text-gray-400">Detailed budget breakdown and category analysis</p>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {selectedSchool.categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(category.id)}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                        {getStatusIcon(category.status)}
                        <span className="ml-1 capitalize">{category.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Allocated</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(category.allocated)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Spent</p>
                        <p className="text-lg font-semibold text-red-600">{formatCurrency(category.spent)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(category.remaining)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Utilization</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{category.percentage}%</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          category.percentage > 95 ? 'bg-red-500' :
                          category.percentage > 85 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>

                    {category.subcategories && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategories:</h4>
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{sub.name}</span>
                            <div className="flex items-center gap-4">
                              <span>{formatCurrency(sub.spent)}</span>
                              <span className="text-gray-500 dark:text-gray-400">/ {formatCurrency(sub.allocated)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}