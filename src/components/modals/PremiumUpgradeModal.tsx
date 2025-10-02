/**
 * Premium Upgrade Modal Component
 * Shows when users click on premium careers without access
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, CheckCircle, TrendingUp, Users, Award } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';
import styles from './PremiumUpgradeModal.module.css';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  careerData?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
    salaryRange?: string;
    growthOutlook?: string;
    education?: string;
  };
  gradeLevel: string;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  careerData,
  gradeLevel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const getCareerCountByGrade = (grade: string) => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    if (gradeNum <= 5) {
      return { basic: 10, premium: 25, additional: 15 };
    } else if (gradeNum <= 8) {
      return { basic: 30, premium: 55, additional: 25 };
    } else {
      return { basic: 50, premium: 115, additional: 65 };
    }
  };

  const careerCounts = getCareerCountByGrade(gradeLevel);

  const handleUpgradeClick = async () => {
    setIsProcessing(true);

    try {
      const upgradeUrl = await subscriptionService.initiateUpgrade();
      if (upgradeUrl) {
        // In a real app, this would redirect to Stripe or open a payment modal
        window.location.href = upgradeUrl;
      }
    } catch (error) {
      console.error('Failed to initiate upgrade:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAskTeacher = () => {
    // Generate a message for the teacher
    const message = `I'm interested in exploring the "${careerData?.name}" career path, which is part of Pathfinity's Premium tier. Could we discuss upgrading our classroom account?`;

    // Copy to clipboard
    navigator.clipboard.writeText(message);

    // Show confirmation
    alert('Message copied to clipboard! Share it with your teacher.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with career preview */}
            {careerData && (
              <div className={styles.careerPreview} style={{ backgroundColor: `${careerData.color}20` }}>
                <div className={styles.careerIcon}>{careerData.icon}</div>
                <h2 className={styles.careerName}>{careerData.name}</h2>
                <div className={styles.premiumBadge}>
                  <Sparkles size={16} />
                  Premium Career
                </div>
              </div>
            )}

            {/* Career details preview */}
            {careerData && (
              <div className={styles.careerDetails}>
                <p className={styles.careerDescription}>{careerData.description}</p>
                {careerData.salaryRange && (
                  <div className={styles.careerStat}>
                    <TrendingUp size={16} />
                    <span>Salary Range: {careerData.salaryRange}</span>
                  </div>
                )}
                {careerData.growthOutlook && (
                  <div className={styles.careerStat}>
                    <Award size={16} />
                    <span>Growth Outlook: {careerData.growthOutlook}</span>
                  </div>
                )}
              </div>
            )}

            {/* Premium benefits */}
            <div className={styles.benefitsSection}>
              <h3 className={styles.benefitsTitle}>
                <Lock className={styles.unlockIcon} size={20} />
                Unlock Premium to Access:
              </h3>
              <ul className={styles.benefitsList}>
                <li>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>
                    <strong>{careerCounts.additional}+ more careers</strong> for your grade level
                  </span>
                </li>
                <li>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Detailed daily tasks and real-world activities</span>
                </li>
                <li>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Success stories from real professionals</span>
                </li>
                <li>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Industry partner connections and resources</span>
                </li>
                <li>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Personalized career exploration paths</span>
                </li>
              </ul>
            </div>

            {/* Pricing and actions */}
            <div className={styles.pricingSection}>
              <div className={styles.priceTag}>
                <span className={styles.priceLabel}>Premium Plan</span>
                <span className={styles.price}>$49/month</span>
                <span className={styles.priceNote}>per classroom</span>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.upgradeButton}
                  onClick={handleUpgradeClick}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Upgrade to Premium
                    </>
                  )}
                </button>

                <button
                  className={styles.teacherButton}
                  onClick={handleAskTeacher}
                >
                  <Users size={18} />
                  Ask My Teacher
                </button>

                <button
                  className={styles.continueButton}
                  onClick={onClose}
                >
                  Continue with Basic
                </button>
              </div>
            </div>

            {/* Social proof */}
            <div className={styles.socialProof}>
              <p>
                <strong>Join 500+ schools</strong> already using Premium to unlock
                student potential
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};