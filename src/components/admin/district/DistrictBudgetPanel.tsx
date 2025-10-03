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
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

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

  const getTabStyle = (isActive: boolean) => ({
    padding: 'var(--space-4) var(--space-2)',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: isActive ? 'var(--dashboard-action-bg-active)' : 'transparent',
    color: isActive ? 'var(--dashboard-action-text-active)' : 'var(--dashboard-text-secondary)'
  });

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>District Budget Management</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>Financial planning and budget allocation across all schools</p>
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
              color: 'var(--dashboard-text-primary)',
              backgroundColor: 'var(--dashboard-bg-elevated)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportBudget}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Download className="w-4 h-4" />
            Export Budget
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--dashboard-action-primary)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            cursor: 'pointer'
          }}>
            <Plus className="w-4 h-4" />
            New Budget Request
          </button>
        </div>
      </div>

      {/* District Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Total District Budget</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#3B82F6' }}>{formatCurrency(totalDistrictBudget)}</p>
            </div>
            <Calculator className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Total Spent</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#EF4444' }}>{formatCurrency(totalDistrictSpent)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Remaining Budget</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#10B981' }}>{formatCurrency(totalDistrictRemaining)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Avg Utilization</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#A855F7' }}>{avgUtilization.toFixed(1)}%</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setSelectedView('overview')}
            style={getTabStyle(selectedView === 'overview')}
          >
            District Overview
          </button>
          <button
            onClick={() => setSelectedView('by-school')}
            style={getTabStyle(selectedView === 'by-school')}
          >
            By School
          </button>
          <button
            onClick={() => setSelectedView('by-category')}
            style={getTabStyle(selectedView === 'by-category')}
          >
            By Category
          </button>
        </div>
      </div>

      {/* School Budget Overview */}
      {selectedView === 'by-school' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetData.map((school) => (
            <div key={school.schoolId} style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', transition: 'box-shadow 200ms ease' }}>
              <div style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Building className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>{school.schoolName}</h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Utilization: {school.utilizationRate}%</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Total Budget</span>
                    <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{formatCurrency(school.totalAllocated)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Spent</span>
                    <span style={{ fontWeight: 'var(--font-medium)', color: '#EF4444' }}>{formatCurrency(school.totalSpent)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Remaining</span>
                    <span style={{ fontWeight: 'var(--font-medium)', color: '#10B981' }}>{formatCurrency(school.totalRemaining)}</span>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>
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

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    onClick={() => setSelectedSchool(school)}
                    style={{
                      flex: 1,
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: 'var(--dashboard-action-primary)',
                      color: 'white',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                  <button style={{
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    color: 'var(--dashboard-text-primary)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer'
                  }}>
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
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--dashboard-border-primary)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Budget by Category</h3>
          </div>
          <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Category
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Allocated
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Spent
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Remaining
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Utilization
                    </th>
                    <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                        <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            {getCategoryIcon(categoryId)}
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', textTransform: 'capitalize' }}>
                              {categoryId === 'personnel' ? 'Personnel & Salaries' :
                               categoryId === 'instructional' ? 'Instructional Materials' :
                               categoryId === 'technology' ? 'Technology & Equipment' :
                               categoryId === 'facilities' ? 'Facilities & Maintenance' :
                               'Transportation'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                          {formatCurrency(categoryData.allocated)}
                        </td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                          {formatCurrency(categoryData.spent)}
                        </td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                          {formatCurrency(categoryData.remaining)}
                        </td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                          {utilization.toFixed(1)}%
                        </td>
                        <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
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
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--dashboard-border-primary)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Budget Allocation by School</h3>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {budgetData.map((school) => (
                  <div key={school.schoolId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{school.schoolName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{formatCurrency(school.totalAllocated)}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>
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

          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
            <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--dashboard-border-primary)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Budget Utilization Status</h3>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {budgetData.map((school) => (
                  <div key={school.schoolId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <Building className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{school.schoolName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{school.utilizationRate}%</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>utilized</p>
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', maxWidth: '64rem', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{selectedSchool.schoolName} Budget</h2>
                  <p style={{ color: 'var(--dashboard-text-secondary)' }}>Detailed budget breakdown and category analysis</p>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  style={{ color: 'var(--dashboard-text-secondary)', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {selectedSchool.categories.map((category) => (
                  <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {getCategoryIcon(category.id)}
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>{category.name}</h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                        {getStatusIcon(category.status)}
                        <span className="ml-1 capitalize">{category.status.replace('-', ' ')}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Allocated</p>
                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>{formatCurrency(category.allocated)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Spent</p>
                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: '#EF4444' }}>{formatCurrency(category.spent)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Remaining</p>
                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: '#10B981' }}>{formatCurrency(category.remaining)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Utilization</p>
                        <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>{category.percentage}%</p>
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
                      <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Subcategories:</h4>
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                            <span style={{ color: 'var(--dashboard-text-secondary)' }}>{sub.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                              <span>{formatCurrency(sub.spent)}</span>
                              <span style={{ color: 'var(--dashboard-text-secondary)' }}>/ {formatCurrency(sub.allocated)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  onClick={() => setSelectedSchool(null)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid var(--dashboard-border-primary)',
                    color: 'var(--dashboard-text-primary)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--dashboard-action-primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
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
