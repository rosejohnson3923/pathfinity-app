/**
 * C-Suite Lens Benefits Display
 * Shows after Round 1 to explain WHY each C-Suite lens matters
 * Displays lens multiplier benefits for each P category
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Users, Package, Settings, MapPin, Megaphone, DollarSign } from 'lucide-react';

interface CSuiteLensDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  playerLens: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';
}

// Lens multiplier data
const LENS_MULTIPLIERS = {
  ceo: {
    name: 'CEO',
    color: 'purple',
    colorClass: 'from-purple-600 to-indigo-600',
    description: 'Strategic leadership across all business functions with focus on people and financial outcomes',
    multipliers: [
      { category: 'people', multiplier: 25, icon: Users },
      { category: 'price', multiplier: 25, icon: DollarSign }
    ]
  },
  cfo: {
    name: 'CFO',
    color: 'green',
    colorClass: 'from-green-600 to-emerald-600',
    description: 'Financial stewardship and operational efficiency with emphasis on pricing strategy',
    multipliers: [
      { category: 'process', multiplier: 20, icon: Settings },
      { category: 'price', multiplier: 30, icon: DollarSign }
    ]
  },
  cmo: {
    name: 'CMO',
    color: 'orange',
    colorClass: 'from-orange-600 to-red-600',
    description: 'Market positioning and brand building with strong promotional expertise',
    multipliers: [
      { category: 'promotion', multiplier: 30, icon: Megaphone },
      { category: 'product', multiplier: 15, icon: Package }
    ]
  },
  cto: {
    name: 'CTO',
    color: 'blue',
    colorClass: 'from-blue-600 to-cyan-600',
    description: 'Technology innovation and product development leadership',
    multipliers: [
      { category: 'product', multiplier: 30, icon: Package },
      { category: 'process', multiplier: 15, icon: Settings }
    ]
  },
  chro: {
    name: 'CHRO',
    color: 'pink',
    colorClass: 'from-pink-600 to-rose-600',
    description: 'People strategy and organizational development excellence',
    multipliers: [
      { category: 'people', multiplier: 30, icon: Users },
      { category: 'process', multiplier: 15, icon: Settings }
    ]
  },
  coo: {
    name: 'COO',
    color: 'teal',
    colorClass: 'from-teal-600 to-cyan-600',
    description: 'Operational excellence and distribution optimization',
    multipliers: [
      { category: 'process', multiplier: 25, icon: Settings },
      { category: 'place', multiplier: 25, icon: MapPin }
    ]
  }
};

const CATEGORY_LABELS = {
  people: 'People',
  product: 'Product',
  process: 'Process',
  place: 'Place (Distribution)',
  promotion: 'Promotion (Marketing)',
  price: 'Price (Finance)'
};

export const CSuiteLensDisplay: React.FC<CSuiteLensDisplayProps> = ({
  isOpen,
  onClose,
  playerLens
}) => {
  const lensData = LENS_MULTIPLIERS[playerLens];

  if (!lensData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className={`bg-gradient-to-r ${lensData.colorClass} p-6 rounded-t-2xl relative`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Your {lensData.name} Lens</h2>
                    <p className="text-white/90 text-sm mt-1">Understanding Your Strategic Advantage</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">What This Lens Means</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {lensData.description}
                  </p>
                </div>

                {/* Multipliers */}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Your Scoring Multipliers
                  </h3>

                  <div className="space-y-3">
                    {lensData.multipliers.map(({ category, multiplier, icon: Icon }) => (
                      <div
                        key={category}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${lensData.colorClass} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Challenges in this category
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              +{multiplier}%
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Bonus Points
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strategy Tip */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Strategic Tip
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your {lensData.name} lens gives you an advantage when challenges align with your multiplier categories.
                    But don't ignore other categories—choose roles that match the current challenge type for maximum synergy!
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className={`w-full bg-gradient-to-r ${lensData.colorClass} text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity`}
                >
                  Got It! Let's Play
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CSuiteLensDisplay;
