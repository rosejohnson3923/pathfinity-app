/**
 * API Endpoint for AI Content Generation
 * /api/career-challenge/generate
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CareerChallengeAzureAIService } from '../../../services/CareerChallengeAzureAIService';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for API routes
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data' });
  }

  // Initialize AI service
  const aiService = new CareerChallengeAzureAIService(supabase);

  try {
    let result;

    switch (type) {
      case 'challenge':
        result = await aiService.generateChallenge(data);

        // Save to database
        const { error: challengeError } = await supabase
          .from('dd_challenges')
          .insert({
            industry_id: await getIndustryId(data.industry),
            challenge_code: `AI_${Date.now()}`,
            title: result.title,
            scenario_text: result.scenarioText,
            category: result.category,
            difficulty: result.difficulty,
            min_roles_required: result.minRolesRequired,
            max_roles_allowed: result.maxRolesAllowed,
            base_difficulty_score: result.baseDifficultyScore,
            perfect_score: result.perfectScore,
            failure_threshold: result.failureThreshold,
            skill_connections: result.skillConnections,
            learning_outcomes: result.learningOutcomes,
            real_world_example: result.realWorldExample,
            ai_generated: true,
            ai_prompt_used: JSON.stringify(data),
            human_reviewed: false,
          });

        if (challengeError) {
          console.error('Failed to save challenge:', challengeError);
        }
        break;

      case 'role_card':
        result = await aiService.generateRoleCard(data);

        // Save to database
        const { error: roleError } = await supabase
          .from('dd_role_cards')
          .insert({
            industry_id: await getIndustryId(data.industry),
            role_code: `AI_${Date.now()}`,
            role_name: result.roleName,
            role_title: result.roleTitle,
            description: result.description,
            rarity: result.rarity,
            base_power: result.basePower,
            category_bonuses: result.categoryBonuses,
            special_abilities: result.specialAbilities,
            flavor_text: result.flavorText,
            backstory: result.backstory,
            key_skills: result.keySkills,
            education_requirements: result.educationRequirements,
            salary_range: result.salaryRange,
          });

        if (roleError) {
          console.error('Failed to save role card:', roleError);
        }
        break;

      case 'synergy':
        result = await aiService.generateSynergy(data);

        // Save to database
        const { error: synergyError } = await supabase
          .from('dd_synergies')
          .insert({
            industry_id: await getIndustryId(data.industry),
            synergy_name: result.synergyName,
            synergy_type: data.synergyType || 'additive',
            required_roles: result.requiredRoles,
            power_bonus: result.powerBonus,
            power_multiplier: result.powerMultiplier,
            description: result.description,
            explanation: result.explanation,
            real_world_example: result.realWorldExample,
          });

        if (synergyError) {
          console.error('Failed to save synergy:', synergyError);
        }
        break;

      case 'industry_pack':
        result = await aiService.generateIndustryPack(data.industryCode, data.industryName);

        // Save all generated content
        const industryId = await getIndustryId(data.industryCode);

        // Save challenges
        for (const challenge of result.challenges) {
          await supabase.from('dd_challenges').insert({
            industry_id: industryId,
            challenge_code: `AI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: challenge.title,
            scenario_text: challenge.scenarioText,
            category: challenge.category,
            difficulty: challenge.difficulty,
            min_roles_required: challenge.minRolesRequired,
            max_roles_allowed: challenge.maxRolesAllowed,
            base_difficulty_score: challenge.baseDifficultyScore,
            perfect_score: challenge.perfectScore,
            failure_threshold: challenge.failureThreshold,
            skill_connections: challenge.skillConnections,
            learning_outcomes: challenge.learningOutcomes,
            real_world_example: challenge.realWorldExample,
            ai_generated: true,
          });
        }

        // Save role cards
        for (const roleCard of result.roleCards) {
          await supabase.from('dd_role_cards').insert({
            industry_id: industryId,
            role_code: `AI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role_name: roleCard.roleName,
            role_title: roleCard.roleTitle,
            description: roleCard.description,
            rarity: roleCard.rarity,
            base_power: roleCard.basePower,
            category_bonuses: roleCard.categoryBonuses,
            special_abilities: roleCard.specialAbilities,
            flavor_text: roleCard.flavorText,
            backstory: roleCard.backstory,
            key_skills: roleCard.keySkills,
            education_requirements: roleCard.educationRequirements,
            salary_range: roleCard.salaryRange,
          });
        }

        // Save synergies
        for (const synergy of result.synergies) {
          await supabase.from('dd_synergies').insert({
            industry_id: industryId,
            synergy_name: synergy.synergyName,
            synergy_type: 'additive',
            required_roles: synergy.requiredRoles,
            power_bonus: synergy.powerBonus,
            power_multiplier: synergy.powerMultiplier,
            description: synergy.description,
            explanation: synergy.explanation,
            real_world_example: synergy.realWorldExample,
          });
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid type' });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate content',
      details: error.message,
    });
  }
}

// Helper function to get industry ID
async function getIndustryId(industryCode: string): Promise<string> {
  const { data, error } = await supabase
    .from('dd_industries')
    .select('id')
    .eq('code', industryCode)
    .single();

  if (error || !data) {
    throw new Error(`Industry not found: ${industryCode}`);
  }

  return data.id;
}