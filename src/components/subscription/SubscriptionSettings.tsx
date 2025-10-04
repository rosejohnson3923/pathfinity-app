import React, { useState } from 'react';
import { SubscriptionTier, getPlanByTier } from '../../types/subscription';
import { SubscriptionInfo } from './SubscriptionInfo';
import { PricingPlans } from './PricingPlans';
import { UpgradeModal } from './UpgradeModal';
import { useSubscription } from '../../hooks/useSubscription';
import { CreditCard, Download, Users, Calendar, Settings, AlertTriangle, Database } from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

export function SubscriptionSettings() {
  const { 
    tier, 
    usersCount, 
    storageUsed, 
    renewalDate, 
    upgradeSubscription 
  } = useSubscription();
  
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Hover states
  const [isInvoicesHovered, setIsInvoicesHovered] = useState(false);
  const [isContactSalesHovered, setIsContactSalesHovered] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredUpdatePaymentButton, setHoveredUpdatePaymentButton] = useState(false);
  const [hoveredUpdateBillingButton, setHoveredUpdateBillingButton] = useState(false);
  const [hoveredDownloadLink, setHoveredDownloadLink] = useState<number | null>(null);
  
  const handleUpgrade = async (newTier: SubscriptionTier) => {
    try {
      setIsLoading(true);
      await upgradeSubscription(newTier);
      // Success message would be shown here
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      // Error message would be shown here
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--dashboard-text-primary)'
        }}>
          Subscription Settings
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: isInvoicesHovered ? 'var(--dashboard-bg-hover)' : 'var(--dashboard-bg-elevated)',
              color: 'var(--dashboard-text-primary)',
              border: `1px solid var(--dashboard-border-primary)`,
              borderRadius: 'var(--radius-lg)',
              transition: 'background-color 200ms',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              cursor: 'pointer'
            }}
            onClick={() => {}}
            onMouseEnter={() => setIsInvoicesHovered(true)}
            onMouseLeave={() => setIsInvoicesHovered(false)}
          >
            <Download style={{ height: '16px', width: '16px' }} />
            <span>Invoices</span>
          </button>
          <button
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: isContactSalesHovered ? '#1d4ed8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              transition: 'background-color 200ms',
              cursor: 'pointer'
            }}
            onClick={() => window.open('mailto:sales@pathfinity.com?subject=Plan Inquiry', '_blank')}
            onMouseEnter={() => setIsContactSalesHovered(true)}
            onMouseLeave={() => setIsContactSalesHovered(false)}
          >
            Contact Sales
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={{ borderBottom: `1px solid var(--dashboard-border-primary)` }}>
        <nav style={{ display: 'flex', gap: 'var(--space-8)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            onMouseEnter={() => setHoveredTab('overview')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              padding: 'var(--space-4) var(--space-1)',
              borderBottom: activeTab === 'overview' ? '2px solid #2563eb' : '2px solid transparent',
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)',
              color: activeTab === 'overview' ? '#2563eb' : (hoveredTab === 'overview' ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)'),
              background: 'none',
              transition: 'color 200ms',
              cursor: 'pointer'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            onMouseEnter={() => setHoveredTab('billing')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              padding: 'var(--space-4) var(--space-1)',
              borderBottom: activeTab === 'billing' ? '2px solid #2563eb' : '2px solid transparent',
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)',
              color: activeTab === 'billing' ? '#2563eb' : (hoveredTab === 'billing' ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)'),
              background: 'none',
              transition: 'color 200ms',
              cursor: 'pointer'
            }}
          >
            Billing & Payment
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            onMouseEnter={() => setHoveredTab('usage')}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              padding: 'var(--space-4) var(--space-1)',
              borderBottom: activeTab === 'usage' ? '2px solid #2563eb' : '2px solid transparent',
              fontWeight: 'var(--font-medium)',
              fontSize: 'var(--text-sm)',
              color: activeTab === 'usage' ? '#2563eb' : (hoveredTab === 'usage' ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)'),
              background: 'none',
              transition: 'color 200ms',
              cursor: 'pointer'
            }}
          >
            Usage & Limits
          </button>
        </nav>
      </div>
      
      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {activeTab === 'overview' && (
          <>
            <SubscriptionInfo
              tier={tier}
              usersCount={usersCount}
              storageUsed={storageUsed}
              renewalDate={renewalDate}
              onUpgrade={() => window.open('mailto:sales@pathfinity.com?subject=Plan Upgrade Inquiry', '_blank')}
            />

            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--dashboard-shadow-card)'
            }}>
              <div style={{
                padding: 'var(--space-5) var(--space-6)',
                borderBottom: `1px solid var(--dashboard-border-primary)`
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-primary)'
                }}>
                  Available Plans
                </h3>
              </div>
              <div style={{ padding: 'var(--space-6)' }}>
                <PricingPlans
                  currentTier={tier}
                />
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'billing' && (
          <div style={{
            backgroundColor: 'var(--dashboard-bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--dashboard-shadow-card)'
          }}>
            <div style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: `1px solid var(--dashboard-border-primary)`
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)'
              }}>
                Billing Information
              </h3>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Payment Method */}
                <div>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    Payment Method
                  </h4>
                  <div style={{
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-4)'
                  }}>
                    <CreditCard style={{ height: '24px', width: '24px', color: '#9ca3af' }} />
                    <div>
                      <p style={{
                        color: 'var(--dashboard-text-primary)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        Visa ending in 4242
                      </p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        Expires 12/2025
                      </p>
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <button
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: hoveredUpdatePaymentButton ? '#1d4ed8' : '#2563eb',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'color 200ms'
                          }}
                          onMouseEnter={() => setHoveredUpdatePaymentButton(true)}
                          onMouseLeave={() => setHoveredUpdatePaymentButton(false)}
                        >
                          Update payment method
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Billing Address */}
                <div>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    Billing Address
                  </h4>
                  <div style={{
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}>
                    <p style={{ color: 'var(--dashboard-text-primary)' }}>Riverside Elementary School</p>
                    <p style={{ color: 'var(--dashboard-text-secondary)' }}>123 Education Lane</p>
                    <p style={{ color: 'var(--dashboard-text-secondary)' }}>Riverside, CA 92501</p>
                    <p style={{ color: 'var(--dashboard-text-secondary)' }}>United States</p>
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <button
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: hoveredUpdateBillingButton ? '#1d4ed8' : '#2563eb',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          transition: 'color 200ms'
                        }}
                        onMouseEnter={() => setHoveredUpdateBillingButton(true)}
                        onMouseLeave={() => setHoveredUpdateBillingButton(false)}
                      >
                        Update billing address
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Recent Invoices */}
                <div>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    Recent Invoices
                  </h4>
                  <div style={{
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: 'var(--dashboard-bg-secondary)' }}>
                        <tr>
                          <th scope="col" style={{
                            padding: 'var(--space-3) var(--space-6)',
                            textAlign: 'left',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Date
                          </th>
                          <th scope="col" style={{
                            padding: 'var(--space-3) var(--space-6)',
                            textAlign: 'left',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Amount
                          </th>
                          <th scope="col" style={{
                            padding: 'var(--space-3) var(--space-6)',
                            textAlign: 'left',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Status
                          </th>
                          <th scope="col" style={{
                            padding: 'var(--space-3) var(--space-6)',
                            textAlign: 'right',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody style={{ backgroundColor: 'var(--dashboard-bg-elevated)' }}>
                        <tr style={{ borderTop: `1px solid var(--dashboard-border-primary)` }}>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)'
                          }}>
                            June 1, 2025
                          </td>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)'
                          }}>
                            $1,200.00
                          </td>
                          <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                            <span style={{
                              padding: '0 var(--space-2)',
                              display: 'inline-flex',
                              fontSize: 'var(--text-xs)',
                              lineHeight: '1.25rem',
                              fontWeight: 'var(--font-semibold)',
                              borderRadius: '9999px',
                              backgroundColor: '#dcfce7',
                              color: '#065f46'
                            }}>
                              Paid
                            </span>
                          </td>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            textAlign: 'right',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)'
                          }}>
                            <a
                              href="#"
                              style={{
                                color: hoveredDownloadLink === 0 ? '#1d4ed8' : '#2563eb',
                                textDecoration: 'none',
                                transition: 'color 200ms'
                              }}
                              onMouseEnter={() => setHoveredDownloadLink(0)}
                              onMouseLeave={() => setHoveredDownloadLink(null)}
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                        <tr style={{ borderTop: `1px solid var(--dashboard-border-primary)` }}>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)'
                          }}>
                            May 1, 2025
                          </td>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)'
                          }}>
                            $1,200.00
                          </td>
                          <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                            <span style={{
                              padding: '0 var(--space-2)',
                              display: 'inline-flex',
                              fontSize: 'var(--text-xs)',
                              lineHeight: '1.25rem',
                              fontWeight: 'var(--font-semibold)',
                              borderRadius: '9999px',
                              backgroundColor: '#dcfce7',
                              color: '#065f46'
                            }}>
                              Paid
                            </span>
                          </td>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            textAlign: 'right',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)'
                          }}>
                            <a
                              href="#"
                              style={{
                                color: hoveredDownloadLink === 1 ? '#1d4ed8' : '#2563eb',
                                textDecoration: 'none',
                                transition: 'color 200ms'
                              }}
                              onMouseEnter={() => setHoveredDownloadLink(1)}
                              onMouseLeave={() => setHoveredDownloadLink(null)}
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                        <tr style={{ borderTop: `1px solid var(--dashboard-border-primary)` }}>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)'
                          }}>
                            April 1, 2025
                          </td>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)'
                          }}>
                            $1,200.00
                          </td>
                          <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                            <span style={{
                              padding: '0 var(--space-2)',
                              display: 'inline-flex',
                              fontSize: 'var(--text-xs)',
                              lineHeight: '1.25rem',
                              fontWeight: 'var(--font-semibold)',
                              borderRadius: '9999px',
                              backgroundColor: '#dcfce7',
                              color: '#065f46'
                            }}>
                              Paid
                            </span>
                          </td>
                          <td style={{
                            padding: 'var(--space-4) var(--space-6)',
                            whiteSpace: 'nowrap',
                            textAlign: 'right',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)'
                          }}>
                            <a
                              href="#"
                              style={{
                                color: hoveredDownloadLink === 2 ? '#1d4ed8' : '#2563eb',
                                textDecoration: 'none',
                                transition: 'color 200ms'
                              }}
                              onMouseEnter={() => setHoveredDownloadLink(2)}
                              onMouseLeave={() => setHoveredDownloadLink(null)}
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'usage' && (
          <div style={{
            backgroundColor: 'var(--dashboard-bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--dashboard-shadow-card)'
          }}>
            <div style={{
              padding: 'var(--space-5) var(--space-6)',
              borderBottom: `1px solid var(--dashboard-border-primary)`
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)'
              }}>
                Usage & Limits
              </h3>
            </div>
            <div style={{
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              {/* User Usage */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-2)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Users style={{ height: '16px', width: '16px', marginRight: 'var(--space-2)' }} />
                    User Accounts
                  </h4>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-secondary)'
                  }}>
                    {usersCount} / {getPlanByTier(tier)?.maxUsers || 100} users
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  backgroundColor: 'var(--dashboard-bg-secondary)',
                  borderRadius: '9999px',
                  height: '10px'
                }}>
                  <div
                    style={{
                      backgroundColor: '#2563eb',
                      height: '10px',
                      borderRadius: '9999px',
                      width: `${Math.min(100, (usersCount / (getPlanByTier(tier)?.maxUsers || 100)) * 100)}%`
                    }}
                  />
                </div>
                {usersCount > (getPlanByTier(tier)?.maxUsers || 100) * 0.9 && (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--text-sm)',
                    color: '#eab308'
                  }}>
                    <AlertTriangle style={{ height: '16px', width: '16px', flexShrink: 0, marginTop: '2px' }} />
                    <p>You're approaching your user limit. Consider upgrading your plan.</p>
                  </div>
                )}
              </div>
              
              {/* Storage Usage */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-2)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Database style={{ height: '16px', width: '16px', marginRight: 'var(--space-2)' }} />
                    Storage
                  </h4>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-secondary)'
                  }}>
                    {storageUsed} GB / {getPlanByTier(tier)?.maxStorage || 50} GB
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  backgroundColor: 'var(--dashboard-bg-secondary)',
                  borderRadius: '9999px',
                  height: '10px'
                }}>
                  <div
                    style={{
                      backgroundColor: '#2563eb',
                      height: '10px',
                      borderRadius: '9999px',
                      width: `${Math.min(100, (storageUsed / (getPlanByTier(tier)?.maxStorage || 50)) * 100)}%`
                    }}
                  />
                </div>
              </div>
              
              {/* Feature Usage */}
              <div>
                <h4 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-primary)',
                  marginBottom: 'var(--space-4)'
                }}>
                  Feature Usage
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <p style={{
                        color: 'var(--dashboard-text-primary)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        AI Assistant Usage
                      </p>
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        1,245 / Unlimited queries
                      </span>
                    </div>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>
                      AI assistant queries used this billing cycle
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <p style={{
                        color: 'var(--dashboard-text-primary)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        Live Sessions
                      </p>
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        12 hours / 20 hours
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      backgroundColor: 'var(--dashboard-bg-secondary)',
                      borderRadius: '9999px',
                      height: '10px',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <div
                        style={{
                          backgroundColor: '#2563eb',
                          height: '10px',
                          borderRadius: '9999px',
                          width: '60%'
                        }}
                      />
                    </div>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>
                      Live streaming hours used this month
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 'var(--space-2)'
                    }}>
                      <p style={{
                        color: 'var(--dashboard-text-primary)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        API Requests
                      </p>
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        {tier === 'enterprise' ? '45,678 / Unlimited' : 'Not Available'}
                      </span>
                    </div>
                    {tier !== 'enterprise' && (
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        API access is only available on Enterprise plans
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={tier}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}