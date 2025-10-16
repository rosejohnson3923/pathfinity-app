/**
 * AI Content Generator Component
 * UI for generating Career Challenge content using Azure AI
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  Link,
  FileText,
  Download,
  RefreshCw,
} from 'lucide-react';

interface GenerationResult {
  type: string;
  data: any;
  timestamp: string;
}

export const AIContentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('esports');
  const [selectedType, setSelectedType] = useState('challenge');
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const industries = [
    { code: 'esports', name: 'Esports Organization' },
    { code: 'healthcare', name: 'Healthcare Startup' },
    { code: 'construction', name: 'Construction Firm' },
    { code: 'fintech', name: 'Financial Technology' },
    { code: 'education', name: 'EdTech Company' },
    { code: 'sustainability', name: 'Green Energy' },
  ];

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let requestData: any = {
        industry: selectedIndustry,
        industryName: industries.find(i => i.code === selectedIndustry)?.name,
      };

      // Add type-specific parameters
      switch (selectedType) {
        case 'challenge':
          requestData = {
            ...requestData,
            difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
            category: ['Management', 'Technical', 'Creative', 'Finance'][Math.floor(Math.random() * 4)],
          };
          break;

        case 'role_card':
          const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          const rarity = rarities[Math.floor(Math.random() * rarities.length)];
          requestData = {
            ...requestData,
            rarity,
            powerRange: getPowerRange(rarity),
          };
          break;

        case 'synergy':
          requestData = {
            ...requestData,
            roleCards: ['Role 1', 'Role 2'], // This would be dynamic in production
            synergyType: 'additive',
          };
          break;

        case 'industry_pack':
          requestData = {
            industryCode: selectedIndustry,
            industryName: industries.find(i => i.code === selectedIndustry)?.name,
          };
          break;
      }

      const response = await fetch('/api/career-challenge/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          data: requestData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();

      setResults([
        {
          type: selectedType,
          data: result.data,
          timestamp: new Date().toISOString(),
        },
        ...results.slice(0, 4), // Keep last 5 results
      ]);

    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPowerRange = (rarity: string) => {
    const ranges: Record<string, { min: number; max: number }> = {
      common: { min: 3, max: 5 },
      uncommon: { min: 4, max: 6 },
      rare: { min: 6, max: 8 },
      epic: { min: 7, max: 9 },
      legendary: { min: 8, max: 10 },
      mythic: { min: 9, max: 10 },
    };
    return ranges[rarity] || { min: 3, max: 5 };
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `career-challenge-${selectedIndustry}-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'challenge': return <FileText className="w-5 h-5" />;
      case 'role_card': return <User className="w-5 h-5" />;
      case 'synergy': return <Link className="w-5 h-5" />;
      case 'industry_pack': return <Package className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          AI Content Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Generate dynamic Career Challenge content using Azure AI
        </p>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={isGenerating}
            >
              {industries.map((industry) => (
                <option key={industry.code} value={industry.code}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled={isGenerating}
            >
              <option value="challenge">Challenge Card</option>
              <option value="role_card">Role Card</option>
              <option value="synergy">Synergy</option>
              <option value="industry_pack">Full Industry Pack</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generateContent}
              disabled={isGenerating}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                isGenerating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>

            {results.length > 0 && (
              <button
                onClick={downloadResults}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                title="Download Results"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(result.type)}
                  <span className="font-semibold capitalize">
                    {result.type.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Render based on type */}
              {result.type === 'challenge' && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-purple-600">
                    {result.data.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.data.scenarioText}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span>Difficulty: {result.data.difficulty}</span>
                    <span>Category: {result.data.category}</span>
                    <span>Roles: {result.data.minRolesRequired}-{result.data.maxRolesAllowed}</span>
                  </div>
                </div>
              )}

              {result.type === 'role_card' && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-blue-600">
                    {result.data.roleName}
                  </h3>
                  <p className="text-sm italic">{result.data.roleTitle}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.data.description}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span>Rarity: {result.data.rarity}</span>
                    <span>Power: {result.data.basePower}</span>
                    <span>Salary: {result.data.salaryRange}</span>
                  </div>
                </div>
              )}

              {result.type === 'synergy' && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-green-600">
                    {result.data.synergyName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.data.description}
                  </p>
                  <p className="text-sm italic">{result.data.explanation}</p>
                  <div className="flex gap-4 text-xs">
                    <span>Power Bonus: +{result.data.powerBonus}</span>
                    <span>Multiplier: {result.data.powerMultiplier}x</span>
                  </div>
                </div>
              )}

              {result.type === 'industry_pack' && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-purple-600">
                    Industry Pack: {result.data.industryName}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {result.data.challenges?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Challenges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {result.data.roleCards?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Role Cards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        {result.data.synergies?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Synergies</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {results.length === 0 && !isGenerating && (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No content generated yet</p>
            <p className="text-sm mt-2">Select an industry and type, then click Generate</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          Azure AI Integration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This generator uses Azure OpenAI models from your Key Vault (pathfinity-kv-2823).
          Generated content is automatically saved to the database and cached for reuse.
        </p>
      </div>
    </div>
  );
};