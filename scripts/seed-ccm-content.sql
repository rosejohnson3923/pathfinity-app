-- =====================================================
-- CCM Content Seeding Script
-- Adapted from Career Challenge (CC) content
-- Created: October 18, 2025
-- Updated: October 19, 2025 - Added cleanup logic for re-seeding
-- =====================================================

-- =====================================================
-- CLEANUP: Delete existing content to allow re-seeding
-- =====================================================

DO $$
BEGIN
  -- Delete from child tables first (respecting foreign keys)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_round_submissions') THEN
    DELETE FROM ccm_round_submissions WHERE game_session_id IN (SELECT id FROM ccm_game_sessions);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_leaderboard') THEN
    DELETE FROM ccm_leaderboard WHERE game_session_id IN (SELECT id FROM ccm_game_sessions);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_session_participants') THEN
    DELETE FROM ccm_session_participants WHERE game_session_id IN (SELECT id FROM ccm_game_sessions);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_game_sessions') THEN
    DELETE FROM ccm_game_sessions;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_perpetual_rooms') THEN
    DELETE FROM ccm_perpetual_rooms;
  END IF;

  -- Delete parent tables last
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_synergy_cards') THEN
    DELETE FROM ccm_synergy_cards;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_role_cards') THEN
    DELETE FROM ccm_role_cards;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ccm_challenge_cards') THEN
    DELETE FROM ccm_challenge_cards;
  END IF;

  RAISE NOTICE '✓ Cleanup complete - ready for fresh seed data';
END $$;

-- =====================================================
-- PART 1: Challenge Cards (30 scenarios across 6 P's)
-- =====================================================

-- PEOPLE CHALLENGES (5 scenarios)
-- =====================================================

INSERT INTO ccm_challenge_cards (
  card_code, p_category, title, description, context, difficulty_level, grade_level, is_active
) VALUES
(
  'CCM_PEOPLE_RETENTION_01',
  'people',
  'Employee Retention Crisis',
  'Your chain of 50 organic coffee shops is experiencing declining foot traffic across all locations. Employee turnover has spiked to 65% annually, with baristas and shift managers leaving for competitors. Training costs have doubled to $2.4M, morale is at an all-time low, and customer service scores have dropped 22% this quarter. The Board expects a comprehensive retention plan by next month.',
  'Employee retention is critical for organizational success. High turnover costs 6-9 months of salary per employee and disrupts team dynamics.',
  'medium',
  'all',
  true
),
(
  'CCM_PEOPLE_DIVERSITY_01',
  'people',
  'Diversity & Inclusion Initiative',
  'Your 1,200-person tech company has a leadership team that is 92% male and lacks diversity across all dimensions. Shareholders and employees are demanding change. A recent diversity audit revealed systemic bias in hiring, promotion, and pay practices. The Board has given you 90 days to present a comprehensive D&I transformation plan, with measurable KPIs and executive accountability built in.',
  'Diverse teams perform 35% better than homogeneous ones. D&I requires systemic change, not just hiring quotas.',
  'hard',
  'high',
  true
),
(
  'CCM_PEOPLE_REMOTE_01',
  'people',
  'Remote Work Transition',
  'Your national insurance company with 3,200 employees across 8 regional offices must transition to permanent hybrid work. Early data shows productivity down 18%, collaboration breaking down across departments, and employee engagement scores dropping monthly. Your infrastructure wasn''t built for distributed teams, and middle managers are struggling to lead remotely. You have 60 days to redesign how work gets done.',
  'Remote work requires new management approaches, tools, and culture. 65% of employees prefer hybrid work models.',
  'medium',
  'all',
  true
),
(
  'CCM_PEOPLE_TRAINING_01',
  'people',
  'Skills Gap Emergency',
  'Your manufacturing company with 850 production employees is implementing AI-powered automation across all 4 plants. Skills analysis shows 340 employees lack the technical capabilities to operate the new systems. You must design and execute a 6-month upskilling program or face layoffs that would devastate communities and trigger union action. The CFO has allocated $1.8M for training, but it''s not enough for traditional methods.',
  'Continuous learning is essential in modern careers. Upskilling costs 6x less than replacing employees.',
  'hard',
  'all',
  true
),
(
  'CCM_PEOPLE_CONFLICT_01',
  'people',
  'Team Conflict Resolution',
  'Your regional healthcare network is paralyzed by conflict between the Chief Medical Officer and VP of Operations. Their 180-person departments have stopped collaborating, causing patient care delays and missed quality metrics. Three joint projects are stalled, turnover in both departments is accelerating, and employees are filing HR complaints. The Board has given you 30 days to resolve the conflict or replace both leaders.',
  'Workplace conflict costs organizations $359 billion annually. Early intervention prevents escalation.',
  'medium',
  'middle',
  true
);

-- PRODUCT CHALLENGES (5 scenarios)
-- =====================================================

INSERT INTO ccm_challenge_cards (
  card_code, p_category, title, description, context, difficulty_level, grade_level, is_active
) VALUES
(
  'CCM_PRODUCT_LAUNCH_01',
  'product',
  'Product Launch Countdown',
  'Your consumer electronics company is 30 days from launching a $180M flagship smart home device into Best Buy, Target, and Amazon. Beta testers report critical usability issues affecting setup and core features. Engineering says fixes require 60 days. Marketing has spent $12M on the holiday launch campaign. Delaying means missing Q4 (65% of annual revenue) and giving competitors a 6-month head start. Launch broken or delay?',
  'First impressions matter. 88% of customers won''t return after a bad user experience.',
  'hard',
  'all',
  true
),
(
  'CCM_PRODUCT_QUALITY_01',
  'product',
  'Quality Control Crisis',
  'Your athletic footwear brand sells 8M pairs annually through 2,400 retail locations. Customer complaints have spiked 340% this quarter due to sole separation defects. Return rates hit 12%, and social media is filled with negative reviews. Investigation traced the issue to your primary supplier in Vietnam. Switching suppliers requires 6-8 months of qualification, but continuing means permanent brand damage.',
  'Quality problems damage brand reputation permanently. Amazon found 1-star reviews reduce sales by 70%.',
  'medium',
  'middle',
  true
),
(
  'CCM_PRODUCT_INNOVATION_01',
  'product',
  'Innovation Stagnation',
  'Your SaaS project management platform serves 45,000 enterprise customers but hasn''t released major features in 3 years. Competitors launched AI assistants, advanced analytics, and mobile-first experiences. Your NPS score dropped from 68 to 41. Churn is accelerating—you lost 6 Fortune 500 accounts last quarter. The Board demands a transformative innovation roadmap in 90 days.',
  'Companies that don''t innovate lose market share. Nokia dominated phones in 2007, went bankrupt by 2013.',
  'hard',
  'high',
  true
),
(
  'CCM_PRODUCT_SUSTAINABILITY_01',
  'product',
  'Sustainability Mandate',
  'Your CPG company sells 240M units annually of packaged snacks through grocery chains. New EU and California regulations require 100% recyclable packaging within 12 months. Current petroleum-based packaging costs $0.08/unit; sustainable alternatives cost $0.18/unit—adding $24M annually. Walmart and Whole Foods are demanding eco-friendly options. Absorb costs, raise prices, or risk losing shelf space?',
  '73% of millennials will pay more for sustainable products. Sustainability is now a competitive requirement.',
  'medium',
  'all',
  true
),
(
  'CCM_PRODUCT_EXPANSION_01',
  'product',
  'Product Line Expansion',
  'Your premium protein bar company owns 12% market share in a $2.8B category, but growth has plateaued at 2% annually. The Board demands 3 new product lines within 18 months to reignite growth: ready-to-drink shakes, performance supplements, and meal replacement bars. Your 40-person R&D team is maxed out, capital budget is $15M, and market research shows unclear consumer demand. Expand or optimize core?',
  'Product diversification reduces risk but requires careful market research. 95% of new products fail.',
  'hard',
  'high',
  true
);

-- PROCESS CHALLENGES (5 scenarios)
-- =====================================================

INSERT INTO ccm_challenge_cards (
  card_code, p_category, title, description, context, difficulty_level, grade_level, is_active
) VALUES
(
  'CCM_PROCESS_EFFICIENCY_01',
  'process',
  'Workflow Bottleneck',
  'Your B2B office furniture company processes 12,000 custom orders annually. Current fulfillment takes 14 days from order to delivery, while competitors deliver in 3-5 days. You''re losing $8M in annual contracts to faster rivals. Customer satisfaction dropped from 4.2 to 2.8 stars. Root cause analysis shows manual processes from 2005: paper quotes, email approvals, spreadsheet tracking. You need a complete digital transformation.',
  'Process efficiency directly impacts customer experience. Amazon''s 2-day shipping changed entire industries.',
  'medium',
  'middle',
  true
),
(
  'CCM_PROCESS_COMPLIANCE_01',
  'process',
  'Regulatory Compliance Overhaul',
  'Your pharmaceutical manufacturing company faces new FDA regulations requiring complete process validation and documentation across all 3 production facilities within 6 months. Current processes were implemented 15 years ago with minimal documentation. FDA auditors arrive in 90 days for pre-inspection. Non-compliance means production shutdown, affecting 2.4M patients and $450M in annual revenue. You need SOPs, training, and validation studies—fast.',
  'Regulatory compliance is non-negotiable in healthcare. Non-compliance can result in $1M+ fines or shutdown.',
  'hard',
  'high',
  true
),
(
  'CCM_PROCESS_AUTOMATION_01',
  'process',
  'Automation Implementation',
  'Your insurance claims processing center employs 240 people manually entering data from paper forms. Error rates hit 22%, processing times average 11 days, and labor costs are $18M annually. RPA (robotic process automation) could reduce errors to 2%, cut processing time to 2 days, and save $6.5M/year. But implementation costs $2.8M, takes 9 months, and 85 jobs would be eliminated. The workforce is anxious and morale is fragile.',
  'Automation increases accuracy and speed. Companies that automate grow 3x faster than those that don''t.',
  'medium',
  'all',
  true
),
(
  'CCM_PROCESS_QUALITY_01',
  'process',
  'Quality System Failure',
  'Your automotive parts supplier ships 15M components annually to Ford, GM, and Toyota. A critical safety defect in brake assemblies passed through quality control and reached 180,000 vehicles. You''re facing a $45M recall, liability lawsuits, and potential loss of OEM contracts worth $200M. Root cause analysis revealed your quality system has systemic failures: outdated inspection methods, undertrained inspectors, and no statistical process control.',
  'Quality systems prevent costly recalls. The average product recall costs companies $10M in direct costs.',
  'hard',
  'high',
  true
),
(
  'CCM_PROCESS_SAFETY_01',
  'process',
  'Safety Violation Response',
  'Your commercial construction company operates 22 active job sites across 4 states. An OSHA inspection at your largest site (400-worker high-rise project) found 18 serious safety violations: fall hazards, improper scaffolding, missing PPE, and inadequate training. OSHA issued stop-work orders affecting $85M in contracts. You have 30 days to implement corrections, retrain all site supervisors, and pass re-inspection while maintaining client confidence and union relations.',
  'Workplace safety is both ethical and economical. Work injuries cost U.S. businesses $170B annually.',
  'medium',
  'all',
  true
);

-- PLACE (Distribution) CHALLENGES (5 scenarios)
-- =====================================================

INSERT INTO ccm_challenge_cards (
  card_code, p_category, title, description, context, difficulty_level, grade_level, is_active
) VALUES
(
  'CCM_PLACE_SUPPLY_CHAIN_01',
  'place',
  'Supply Chain Disruption',
  'Your toy company manufactures 85% of products through a single supplier in China. They filed for bankruptcy overnight. You have 28 days of inventory left, peak holiday season starts in 10 weeks, and orders from Target, Walmart, and Amazon total $320M. No backup suppliers are qualified. Stockouts mean losing shelf space permanently and contract penalties of $15M. Airfreight alternative suppliers at 3x cost, or accept stockouts?',
  'Supply chain resilience is critical. COVID-19 taught companies to diversify suppliers and maintain buffer inventory.',
  'hard',
  'high',
  true
),
(
  'CCM_PLACE_EXPANSION_01',
  'place',
  'International Expansion',
  'Your organic baby food brand dominates 18% of the US market ($240M annual revenue). The Board mandated expansion into UK, Germany, and Japan within 12 months to accelerate growth. Each market has different regulations (EU organic standards, Japanese labeling laws), taste preferences, and distribution networks. You''ve never operated internationally. Budget: $25M. Risk: cannibalizing US focus and cash flow.',
  'International expansion offers growth but requires local expertise. 40% of international ventures fail in year 1.',
  'hard',
  'high',
  true
),
(
  'CCM_PLACE_LOGISTICS_01',
  'place',
  'Logistics Optimization',
  'Your e-commerce furniture company ships 45,000 orders monthly from 3 distribution centers. Freight costs jumped 52% this year to $14M annually. Delivery times slipped from 5 days to 12 days, and customer complaints about late/damaged shipments tripled. Your logistics network was designed for 20,000 orders/month. Competitors offer 3-day delivery. You need network optimization, better carriers, and route planning—without blowing the budget.',
  'Logistics costs average 10-15% of product price. Optimization can significantly improve margins.',
  'medium',
  'middle',
  true
),
(
  'CCM_PLACE_RETAIL_01',
  'place',
  'Retail Channel Conflict',
  'Your outdoor apparel brand sells through 800 specialty retail stores and your own DTC website. Retailers drive 65% of revenue ($180M) but DTC margins are 2x higher. Your website undercuts retail prices by 15%, and major retailers (REI, Dick's Sporting Goods) are threatening to drop your brand. They want price parity or exclusive products. Lose $15M/year in DTC margin or risk $120M in retail revenue?',
  'Channel conflict is common in omnichannel retail. Brands must balance direct sales with retail partnerships.',
  'medium',
  'all',
  true
),
(
  'CCM_PLACE_WAREHOUSE_01',
  'place',
  'Warehouse Capacity Crisis',
  'Your consumer electronics distribution company is out of warehouse space. Your 3 facilities (total 450,000 sq ft) are at 98% capacity during peak Q4 season. Inventory is backing up at ports, orders are delayed 8-12 days, and you''re paying $85K/month in overflow storage fees. Leasing additional space requires 8-month lead time. Lost sales this quarter: $12M. Competitors with better logistics are stealing market share.',
  'Warehouse capacity planning requires 6-12 month lead times. Space constraints limit growth potential.',
  'medium',
  'middle',
  true
);

-- PROMOTION (Marketing) CHALLENGES (5 scenarios)
-- =====================================================

INSERT INTO ccm_challenge_cards (
  card_code, p_category, title, description, context, difficulty_level, grade_level, is_active
) VALUES
(
  'CCM_PROMOTION_CRISIS_01',
  'promotion',
  'Brand Crisis Management',
  'Your athletic apparel brand ($450M annual revenue) is in crisis. Your celebrity spokesperson made controversial statements that sparked outrage across social media. The hashtag #Boycott[YourBrand] is trending with 12M impressions in 24 hours. Three major retailers pulled your products from shelves. Your $8M sponsorship deal is at risk, and brand sentiment dropped 45 points. You have 48 hours to respond before permanent damage occurs. Cut ties, defend, or stay silent?',
  'Brand crises spread rapidly on social media. Response time is critical - silence is interpreted as guilt.',
  'hard',
  'all',
  true
),
(
  'CCM_PROMOTION_LAUNCH_01',
  'promotion',
  'Product Launch Campaign',
  'Your clean energy startup is launching a revolutionary home battery system that could disrupt Tesla Powerwall. Your product is superior: 30% cheaper, 20% more capacity. But your marketing budget is $800K vs. Tesla''s $50M. Traditional advertising won''t work. You need guerrilla marketing, influencer partnerships, and viral content strategies to break through the noise and reach early adopters. Launch in 90 days.',
  'Guerrilla marketing and viral campaigns can outperform big-budget traditional ads. Dollar Shave Club spent $4,500 on a video that generated $12M in sales.',
  'medium',
  'all',
  true
),
(
  'CCM_PROMOTION_SOCIAL_01',
  'promotion',
  'Social Media Disaster',
  'Your fast-casual restaurant chain (350 locations, $280M revenue) is in full crisis mode. A junior social media manager posted an offensive tweet from your corporate account at 2am. It went viral—18M views, 200K angry replies. #[YourBrand]IsOver is trending. Customers are organizing boycotts, franchise owners are panicking, and your stock dropped 8% at market open. You have 12 hours to respond before lasting damage occurs.',
  'Social media mistakes spread instantly. United Airlines lost $1.4B in value after a viral incident video.',
  'hard',
  'high',
  true
),
(
  'CCM_PROMOTION_REBRAND_01',
  'promotion',
  'Rebranding Initiative',
  'Your department store chain (85 locations, $620M revenue) is seen as outdated and irrelevant. Gen Z sales dropped 68% in 3 years, and your core Baby Boomer customer base is aging out. The Board approved a $35M complete rebrand: new logo, store design, product mix, and marketing voice. But alienating your loyal customers (still 60% of revenue) could be fatal. Rebrand boldly or evolve gradually?',
  'Rebranding is risky but sometimes necessary. Old Spice successfully rebranded to appeal to younger men.',
  'medium',
  'all',
  true
),
(
  'CCM_PROMOTION_COMPETITION_01',
  'promotion',
  'Competitive Marketing War',
  'Your telecom company holds 22% market share in a $90B industry. Your main competitor just launched a $50M attack campaign directly mocking your network reliability with side-by-side comparisons. They''re winning: your brand sentiment dropped 18 points, and you lost 120,000 subscribers last quarter. Do you respond aggressively, take the high road, or pivot to a different message entirely?',
  'Comparative advertising can backfire. Apple''s "Mac vs PC" worked because it was humorous, not mean-spirited.',
  'medium',
  'middle',
  true
);

-- PRICE (Pricing & Finance) CHALLENGES (5 scenarios)
-- =====================================================

INSERT INTO ccm_challenge_cards (
  card_code, p_category, title, description, context, difficulty_level, grade_level, is_active
) VALUES
(
  'CCM_PRICE_INCREASE_01',
  'price',
  'Price Increase Dilemma',
  'Your meal kit delivery service (180,000 subscribers, $220M annual revenue) is facing margin compression. Ingredient costs rose 28%, shipping costs up 35%, labor up 18%. You''re now losing $2.50 per box delivered. CFO analysis shows you need 22% price increase to break even, but customers are price-sensitive and competitors held prices flat. Raise prices and risk 30% churn, or bleed cash at $15M/year?',
  'Pricing is psychology, not just math. Customers tolerate price increases if value is clearly communicated.',
  'medium',
  'all',
  true
),
(
  'CCM_PRICE_COMPETITION_01',
  'price',
  'Price War Survival',
  'Your SaaS HR platform ($85M ARR, 12,000 customers) is under attack. A VC-backed competitor slashed prices 55% to steal market share. They raised $200M and can lose money for 3+ years. You lost 340 customers last quarter to their pricing. Matching their prices means burning $18M/year you don''t have. Compete on value, add features, or find a different battlefield?',
  'Price wars destroy industries. Airlines, retail, and tech have all suffered from race-to-bottom pricing.',
  'hard',
  'high',
  true
),
(
  'CCM_PRICE_VALUE_01',
  'price',
  'Premium Positioning',
  'Your premium mattress brand ($95M revenue) charges $2,400 vs. competitors at $800-$1,200. Your mattresses use superior materials and last 2x longer, but customers can''t feel the difference in stores. Sales declined 22% as price-conscious consumers choose cheaper options. You need to justify premium pricing through marketing, education, and experience—or cut costs and compete on price.',
  'Premium brands must clearly communicate value. Apple commands premium prices through brand perception.',
  'medium',
  'middle',
  true
),
(
  'CCM_PRICE_DISCOUNT_01',
  'price',
  'Discount Strategy Trap',
  'Your women''s fashion retail chain (120 stores, $310M revenue) ran aggressive promotions last year: 40% off, BOGO, clearance sales. It worked—sales volume up 18%. But gross margins collapsed from 52% to 31%, and customers now refuse to buy at full price. Full-price sales dropped 74%. You''ve conditioned customers to only shop sales. Restore pricing power or accept permanent margin erosion?',
  'Excessive discounting destroys perceived value. JCPenney nearly failed trying to eliminate sales and restore full pricing.',
  'medium',
  'all',
  true
),
(
  'CCM_PRICE_BUDGET_01',
  'price',
  'Budget Crisis Management',
  'Your industrial equipment manufacturer ($380M revenue) is hit by economic recession. Revenue down 34% year-over-year, and you''re burning $4M/month in cash. The CFO demands $45M in cost cuts within 90 days to avoid bankruptcy. Options: layoff 280 workers (25% of workforce), slash R&D budget by 60% (killing next-gen product pipeline), or cut sales/marketing by 70% (ensuring further revenue decline). Choose wisely.',
  'Budget cuts require strategic thinking. Across-the-board cuts treat all expenses equally when they''re not.',
  'hard',
  'high',
  true
);

-- =====================================================
-- PART 2: Role Cards (50 roles: 10 per C-Suite org)
-- =====================================================

-- CEO Organization Roles (10)
-- =====================================================

INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills,
  color_theme, grade_level, is_active
) VALUES
(
  'CCM_CEO_EXECUTIVE_LEADER',
  'Chief Executive Officer',
  'The CEO provides strategic vision and overall leadership for the organization. They make high-stakes decisions affecting all areas of the business, from people management to financial strategy. CEOs excel at seeing the big picture, inspiring teams, and navigating complex challenges with decisive action.',
  'ceo',
  'perfect', 'good', 'good', 'good', 'good', 'perfect',
  '["leadership", "strategic-thinking", "decision-making"]',
  '["communication", "vision", "accountability"]',
  'purple',
  'all',
  true
),
(
  'CCM_CEO_STRATEGIC_PLANNER',
  'Strategic Planning Director',
  'Develops long-term strategic plans, analyzes market trends, and guides organizational direction. Strategic planners help companies anticipate change, identify opportunities, and position for future success through data-driven planning.',
  'ceo',
  'good', 'good', 'good', 'good', 'good', 'good',
  '["strategic-thinking", "analytical-thinking", "forecasting"]',
  '["research", "critical-thinking", "problem-solving"]',
  'purple',
  'high',
  true
),
(
  'CCM_CEO_INNOVATION_OFFICER',
  'Chief Innovation Officer',
  'Drives innovation initiatives across the organization, fostering creative problem-solving and new product development. Innovation officers challenge status quo thinking and help companies stay ahead of disruption.',
  'ceo',
  'good', 'perfect', 'good', 'not_in', 'good', 'not_in',
  '["creativity", "innovation", "entrepreneurship"]',
  '["risk-taking", "vision", "change-management"]',
  'purple',
  'all',
  true
),
(
  'CCM_CEO_OPERATIONS_MANAGER',
  'Operations Manager',
  'Oversees daily business operations, ensuring efficient processes and resource allocation. Operations managers are problem-solvers who keep organizations running smoothly through practical, hands-on leadership.',
  'ceo',
  'good', 'good', 'perfect', 'good', 'not_in', 'good',
  '["organization", "efficiency", "problem-solving"]',
  '["attention-to-detail", "time-management", "multitasking"]',
  'purple',
  'middle',
  true
),
(
  'CCM_CEO_BUSINESS_ANALYST',
  'Business Analyst',
  'Analyzes business processes, identifies inefficiencies, and recommends improvements. Business analysts bridge the gap between problems and solutions through data analysis and strategic thinking.',
  'ceo',
  'not_in', 'good', 'perfect', 'good', 'not_in', 'good',
  '["analytical-thinking", "problem-solving", "research"]',
  '["communication", "attention-to-detail", "critical-thinking"]',
  'purple',
  'all',
  true
),
(
  'CCM_CEO_PROJECT_MANAGER',
  'Project Manager',
  'Plans, executes, and closes projects on time and within budget. Project managers coordinate teams, manage timelines, and ensure deliverables meet quality standards through organized, detail-oriented leadership.',
  'ceo',
  'good', 'good', 'perfect', 'good', 'not_in', 'not_in',
  '["organization", "leadership", "time-management"]',
  '["communication", "problem-solving", "accountability"]',
  'purple',
  'middle',
  true
),
(
  'CCM_CEO_CONSULTANT',
  'Management Consultant',
  'Provides expert advice to solve complex business problems. Consultants bring outside perspective, industry best practices, and analytical frameworks to help organizations improve performance.',
  'ceo',
  'good', 'good', 'good', 'good', 'not_in', 'good',
  '["problem-solving", "analytical-thinking", "communication"]',
  '["adaptability", "research", "critical-thinking"]',
  'purple',
  'high',
  true
),
(
  'CCM_CEO_ENTREPRENEUR',
  'Entrepreneur',
  'Builds new businesses from the ground up, identifying opportunities and taking calculated risks. Entrepreneurs combine vision, resourcefulness, and determination to create value in uncertain environments.',
  'ceo',
  'good', 'perfect', 'not_in', 'good', 'good', 'not_in',
  '["creativity", "risk-taking", "entrepreneurship"]',
  '["resilience", "vision", "adaptability"]',
  'purple',
  'all',
  true
),
(
  'CCM_CEO_CHANGE_MANAGER',
  'Change Management Specialist',
  'Leads organizational transformation initiatives, helping companies adapt to new strategies, technologies, or processes. Change managers reduce resistance and ensure smooth transitions through empathetic, strategic leadership.',
  'ceo',
  'perfect', 'not_in', 'good', 'not_in', 'not_in', 'not_in',
  '["change-management", "empathy", "communication"]',
  '["leadership", "resilience", "strategic-thinking"]',
  'purple',
  'high',
  true
),
(
  'CCM_CEO_EXECUTIVE_COACH',
  'Executive Coach',
  'Develops leadership capabilities in executives and high-potential employees. Executive coaches improve decision-making, emotional intelligence, and strategic thinking through personalized guidance.',
  'ceo',
  'perfect', 'not_in', 'not_in', 'not_in', 'not_in', 'not_in',
  '["coaching", "empathy", "leadership"]',
  '["communication", "emotional-intelligence", "mentoring"]',
  'purple',
  'high',
  true
);

-- CFO Organization Roles (10)
-- =====================================================

INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills,
  color_theme, grade_level, is_active
) VALUES
(
  'CCM_CFO_FINANCIAL_OFFICER',
  'Chief Financial Officer',
  'The CFO manages all financial operations, from budgeting to financial reporting. They ensure fiscal responsibility, guide investment decisions, and provide financial leadership to drive profitability and sustainable growth.',
  'cfo',
  'not_in', 'not_in', 'good', 'good', 'not_in', 'perfect',
  '["analytical-thinking", "attention-to-detail", "accountability"]',
  '["strategic-thinking", "problem-solving", "decision-making"]',
  'green',
  'high',
  true
),
(
  'CCM_CFO_ACCOUNTANT',
  'Senior Accountant',
  'Manages financial records, prepares reports, and ensures accuracy in all financial transactions. Accountants are detail-oriented professionals who maintain the financial health of organizations through meticulous work.',
  'cfo',
  'not_in', 'not_in', 'perfect', 'not_in', 'not_in', 'good',
  '["attention-to-detail", "analytical-thinking", "organization"]',
  '["accuracy", "time-management", "integrity"]',
  'green',
  'all',
  true
),
(
  'CCM_CFO_FINANCIAL_ANALYST',
  'Financial Analyst',
  'Analyzes financial data to guide investment and business decisions. Financial analysts use data modeling, forecasting, and market research to help companies allocate resources effectively.',
  'cfo',
  'not_in', 'good', 'good', 'not_in', 'not_in', 'perfect',
  '["analytical-thinking", "research", "forecasting"]',
  '["attention-to-detail", "critical-thinking", "problem-solving"]',
  'green',
  'high',
  true
),
(
  'CCM_CFO_BUDGET_MANAGER',
  'Budget Manager',
  'Develops and monitors organizational budgets, ensuring spending aligns with strategic priorities. Budget managers balance financial constraints with operational needs through careful planning.',
  'cfo',
  'not_in', 'not_in', 'good', 'not_in', 'not_in', 'perfect',
  '["organization", "analytical-thinking", "planning"]',
  '["attention-to-detail", "communication", "accountability"]',
  'green',
  'middle',
  true
),
(
  'CCM_CFO_AUDITOR',
  'Internal Auditor',
  'Reviews financial processes to ensure compliance, accuracy, and fraud prevention. Auditors protect organizations through systematic examination of controls and procedures.',
  'cfo',
  'not_in', 'not_in', 'perfect', 'not_in', 'not_in', 'good',
  '["attention-to-detail", "analytical-thinking", "integrity"]',
  '["critical-thinking", "problem-solving", "independence"]',
  'green',
  'high',
  true
),
(
  'CCM_CFO_TAX_SPECIALIST',
  'Tax Specialist',
  'Manages tax strategy, compliance, and planning to minimize tax liability legally. Tax specialists navigate complex regulations to optimize financial outcomes.',
  'cfo',
  'not_in', 'not_in', 'good', 'not_in', 'not_in', 'perfect',
  '["analytical-thinking", "attention-to-detail", "research"]',
  '["problem-solving", "compliance", "planning"]',
  'green',
  'high',
  true
),
(
  'CCM_CFO_INVESTMENT_ADVISOR',
  'Investment Advisor',
  'Guides investment decisions for individuals or organizations. Investment advisors balance risk and return to help clients achieve financial goals through informed portfolio management.',
  'cfo',
  'not_in', 'not_in', 'not_in', 'not_in', 'not_in', 'perfect',
  '["analytical-thinking", "research", "risk-assessment"]',
  '["communication", "strategic-thinking", "forecasting"]',
  'green',
  'all',
  true
),
(
  'CCM_CFO_CONTROLLER',
  'Financial Controller',
  'Oversees accounting operations and financial reporting. Controllers ensure accuracy and compliance while providing financial insights to guide business decisions.',
  'cfo',
  'not_in', 'not_in', 'perfect', 'not_in', 'not_in', 'good',
  '["attention-to-detail", "organization", "accountability"]',
  '["analytical-thinking", "leadership", "problem-solving"]',
  'green',
  'high',
  true
),
(
  'CCM_CFO_RISK_ANALYST',
  'Risk Analyst',
  'Identifies, analyzes, and mitigates financial risks. Risk analysts use quantitative methods to protect organizations from threats ranging from market volatility to operational failures.',
  'cfo',
  'not_in', 'not_in', 'good', 'not_in', 'not_in', 'perfect',
  '["analytical-thinking", "risk-assessment", "forecasting"]',
  '["problem-solving", "research", "critical-thinking"]',
  'green',
  'high',
  true
),
(
  'CCM_CFO_PROCUREMENT',
  'Procurement Specialist',
  'Manages purchasing and vendor relationships to optimize costs and quality. Procurement specialists negotiate contracts and ensure supply chain efficiency through strategic sourcing.',
  'cfo',
  'not_in', 'not_in', 'good', 'perfect', 'not_in', 'good',
  '["negotiation", "analytical-thinking", "relationship-building"]',
  '["attention-to-detail", "communication", "problem-solving"]',
  'green',
  'middle',
  true
);

-- CMO Organization Roles (10)
-- =====================================================

INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills,
  color_theme, grade_level, is_active
) VALUES
(
  'CCM_CMO_MARKETING_OFFICER',
  'Chief Marketing Officer',
  'The CMO leads all marketing strategy, branding, and customer acquisition efforts. They combine creativity with data analytics to build brand awareness, drive sales, and create competitive advantage in the marketplace.',
  'cmo',
  'not_in', 'good', 'not_in', 'good', 'perfect', 'good',
  '["creativity", "strategic-thinking", "communication"]',
  '["leadership", "analytical-thinking", "brand-building"]',
  'orange',
  'high',
  true
),
(
  'CCM_CMO_BRAND_MANAGER',
  'Brand Manager',
  'Develops and protects brand identity, ensuring consistent messaging across all channels. Brand managers balance creativity with strategy to build emotional connections with customers.',
  'cmo',
  'not_in', 'good', 'not_in', 'not_in', 'perfect', 'not_in',
  '["creativity", "brand-building", "strategic-thinking"]',
  '["communication", "attention-to-detail", "market-research"]',
  'orange',
  'all',
  true
),
(
  'CCM_CMO_DIGITAL_MARKETER',
  'Digital Marketing Manager',
  'Leads online marketing through SEO, social media, content marketing, and paid advertising. Digital marketers combine technical skills with creative thinking to reach customers where they spend time online.',
  'cmo',
  'not_in', 'not_in', 'not_in', 'not_in', 'perfect', 'good',
  '["digital-literacy", "analytical-thinking", "creativity"]',
  '["adaptability", "communication", "problem-solving"]',
  'orange',
  'all',
  true
),
(
  'CCM_CMO_CONTENT_CREATOR',
  'Content Marketing Specialist',
  'Creates engaging content (blogs, videos, infographics) that attracts and retains customers. Content creators tell compelling stories that educate, entertain, and convert audiences.',
  'cmo',
  'not_in', 'good', 'not_in', 'not_in', 'perfect', 'not_in',
  '["creativity", "storytelling", "communication"]',
  '["writing", "adaptability", "empathy"]',
  'orange',
  'middle',
  true
),
(
  'CCM_CMO_MARKET_RESEARCHER',
  'Market Research Analyst',
  'Conducts research to understand customer needs, preferences, and behaviors. Market researchers provide data-driven insights that guide product development and marketing strategy.',
  'cmo',
  'not_in', 'good', 'not_in', 'not_in', 'good', 'good',
  '["research", "analytical-thinking", "attention-to-detail"]',
  '["communication", "critical-thinking", "problem-solving"]',
  'orange',
  'high',
  true
),
(
  'CCM_CMO_SOCIAL_MEDIA',
  'Social Media Manager',
  'Manages social media presence, engaging audiences and building community. Social media managers combine creativity, psychology, and data analysis to grow followings and drive engagement.',
  'cmo',
  'not_in', 'not_in', 'not_in', 'not_in', 'perfect', 'not_in',
  '["communication", "creativity", "empathy"]',
  '["adaptability", "relationship-building", "digital-literacy"]',
  'orange',
  'all',
  true
),
(
  'CCM_CMO_PUBLIC_RELATIONS',
  'Public Relations Manager',
  'Manages company reputation, media relations, and crisis communications. PR managers craft narratives, build relationships with journalists, and protect brand image during challenges.',
  'cmo',
  'not_in', 'not_in', 'not_in', 'not_in', 'perfect', 'not_in',
  '["communication", "relationship-building", "storytelling"]',
  '["empathy", "adaptability", "problem-solving"]',
  'orange',
  'high',
  true
),
(
  'CCM_CMO_EVENT_COORDINATOR',
  'Event Marketing Coordinator',
  'Plans and executes marketing events, trade shows, and experiential campaigns. Event coordinators create memorable brand experiences through detailed planning and creative execution.',
  'cmo',
  'good', 'not_in', 'good', 'not_in', 'perfect', 'not_in',
  '["organization", "creativity", "communication"]',
  '["multitasking", "problem-solving", "time-management"]',
  'orange',
  'middle',
  true
),
(
  'CCM_CMO_GRAPHIC_DESIGNER',
  'Graphic Designer',
  'Creates visual content for marketing materials, from logos to advertisements. Graphic designers combine artistic talent with brand understanding to communicate messages visually.',
  'cmo',
  'not_in', 'good', 'not_in', 'not_in', 'perfect', 'not_in',
  '["creativity", "attention-to-detail", "visual-communication"]',
  '["adaptability", "collaboration", "technical-skills"]',
  'orange',
  'all',
  true
),
(
  'CCM_CMO_CUSTOMER_INSIGHTS',
  'Customer Insights Manager',
  'Analyzes customer data to understand behaviors, preferences, and trends. Insights managers turn raw data into actionable strategies that improve customer experience and drive loyalty.',
  'cmo',
  'not_in', 'good', 'not_in', 'not_in', 'good', 'good',
  '["analytical-thinking", "empathy", "research"]',
  '["communication", "problem-solving", "critical-thinking"]',
  'orange',
  'high',
  true
);

-- CTO Organization Roles (10)
-- =====================================================

INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills,
  color_theme, grade_level, is_active
) VALUES
(
  'CCM_CTO_TECHNOLOGY_OFFICER',
  'Chief Technology Officer',
  'The CTO leads technology strategy, innovation, and infrastructure. They guide technical teams, evaluate emerging technologies, and ensure technology investments align with business goals.',
  'cto',
  'not_in', 'perfect', 'good', 'good', 'not_in', 'not_in',
  '["technical-expertise", "strategic-thinking", "innovation"]',
  '["leadership", "problem-solving", "vision"]',
  'blue',
  'high',
  true
),
(
  'CCM_CTO_SOFTWARE_ENGINEER',
  'Software Engineer',
  'Designs, develops, and maintains software applications. Software engineers combine coding skills with problem-solving to build digital products that solve real-world problems.',
  'cto',
  'not_in', 'perfect', 'good', 'not_in', 'not_in', 'not_in',
  '["technical-expertise", "problem-solving", "logical-thinking"]',
  '["creativity", "attention-to-detail", "collaboration"]',
  'blue',
  'all',
  true
),
(
  'CCM_CTO_DATA_SCIENTIST',
  'Data Scientist',
  'Analyzes complex data to extract insights and build predictive models. Data scientists use statistics, machine learning, and programming to turn data into business value.',
  'cto',
  'not_in', 'good', 'perfect', 'not_in', 'not_in', 'good',
  '["analytical-thinking", "technical-expertise", "research"]',
  '["problem-solving", "communication", "critical-thinking"]',
  'blue',
  'high',
  true
),
(
  'CCM_CTO_CYBERSECURITY',
  'Cybersecurity Specialist',
  'Protects systems and data from cyber threats. Cybersecurity specialists identify vulnerabilities, implement security measures, and respond to incidents to keep organizations safe.',
  'cto',
  'not_in', 'not_in', 'perfect', 'not_in', 'not_in', 'not_in',
  '["technical-expertise", "analytical-thinking", "attention-to-detail"]',
  '["problem-solving", "vigilance", "adaptability"]',
  'blue',
  'high',
  true
),
(
  'CCM_CTO_SYSTEMS_ARCHITECT',
  'Systems Architect',
  'Designs complex IT systems and infrastructure. Systems architects ensure scalability, reliability, and efficiency through thoughtful technical planning.',
  'cto',
  'not_in', 'good', 'perfect', 'good', 'not_in', 'not_in',
  '["technical-expertise", "strategic-thinking", "problem-solving"]',
  '["attention-to-detail", "communication", "innovation"]',
  'blue',
  'high',
  true
),
(
  'CCM_CTO_DEVOPS_ENGINEER',
  'DevOps Engineer',
  'Bridges development and operations, ensuring smooth software deployment and infrastructure management. DevOps engineers automate processes and improve system reliability.',
  'cto',
  'not_in', 'good', 'perfect', 'not_in', 'not_in', 'not_in',
  '["technical-expertise", "problem-solving", "automation"]',
  '["collaboration", "efficiency", "adaptability"]',
  'blue',
  'high',
  true
),
(
  'CCM_CTO_UX_DESIGNER',
  'User Experience Designer',
  'Designs intuitive, user-friendly interfaces for digital products. UX designers combine psychology, design thinking, and research to create experiences that delight users.',
  'cto',
  'not_in', 'perfect', 'not_in', 'not_in', 'good', 'not_in',
  '["empathy", "creativity", "problem-solving"]',
  '["research", "attention-to-detail", "communication"]',
  'blue',
  'all',
  true
),
(
  'CCM_CTO_PRODUCT_MANAGER',
  'Product Manager (Tech)',
  'Defines product vision and roadmap for technology products. Product managers balance user needs, business goals, and technical feasibility to create successful products.',
  'cto',
  'not_in', 'perfect', 'good', 'not_in', 'not_in', 'not_in',
  '["strategic-thinking", "communication", "problem-solving"]',
  '["leadership", "analytical-thinking", "empathy"]',
  'blue',
  'high',
  true
),
(
  'CCM_CTO_IT_MANAGER',
  'IT Manager',
  'Manages IT teams, infrastructure, and support operations. IT managers ensure technology runs smoothly, teams are productive, and systems meet business needs.',
  'cto',
  'good', 'not_in', 'perfect', 'not_in', 'not_in', 'not_in',
  '["leadership", "technical-expertise", "problem-solving"]',
  '["organization", "communication", "multitasking"]',
  'blue',
  'middle',
  true
),
(
  'CCM_CTO_AI_SPECIALIST',
  'AI/Machine Learning Engineer',
  'Develops artificial intelligence and machine learning models. AI specialists push the boundaries of what''s possible through innovative applications of cutting-edge technology.',
  'cto',
  'not_in', 'perfect', 'good', 'not_in', 'not_in', 'not_in',
  '["technical-expertise", "innovation", "analytical-thinking"]',
  '["problem-solving", "research", "creativity"]',
  'blue',
  'high',
  true
);

-- CHRO Organization Roles (10)
-- =====================================================

INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills,
  color_theme, grade_level, is_active
) VALUES
(
  'CCM_CHRO_HR_OFFICER',
  'Chief Human Resources Officer',
  'The CHRO leads all people-related strategy, from talent acquisition to culture development. They ensure the organization attracts, develops, and retains top talent while fostering an inclusive, engaging workplace.',
  'chro',
  'perfect', 'not_in', 'good', 'not_in', 'not_in', 'not_in',
  '["leadership", "empathy", "strategic-thinking"]',
  '["communication", "relationship-building", "change-management"]',
  'pink',
  'high',
  true
),
(
  'CCM_CHRO_RECRUITER',
  'Talent Acquisition Specialist',
  'Finds and attracts top talent through strategic recruiting. Recruiters match candidates to roles, building pipelines of qualified professionals to fuel organizational growth.',
  'chro',
  'perfect', 'not_in', 'not_in', 'not_in', 'not_in', 'not_in',
  '["relationship-building", "communication", "persuasion"]',
  '["empathy", "organization", "judgment"]',
  'pink',
  'all',
  true
),
(
  'CCM_CHRO_TRAINING_DEV',
  'Learning & Development Manager',
  'Designs and delivers training programs that develop employee skills. L&D managers invest in people, helping them grow professionally and advance their careers.',
  'chro',
  'perfect', 'not_in', 'not_in', 'not_in', 'not_in', 'not_in',
  '["teaching", "empathy", "communication"]',
  '["creativity", "organization", "patience"]',
  'pink',
  'middle',
  true
),
(
  'CCM_CHRO_COMP_BENEFITS',
  'Compensation & Benefits Analyst',
  'Manages salary structures, benefits packages, and total rewards strategy. Comp & Benefits analysts ensure fair, competitive compensation that attracts and retains talent.',
  'chro',
  'good', 'not_in', 'good', 'not_in', 'not_in', 'good',
  '["analytical-thinking", "fairness", "attention-to-detail"]',
  '["research", "communication", "negotiation"]',
  'pink',
  'high',
  true
),
(
  'CCM_CHRO_EMPLOYEE_RELATIONS',
  'Employee Relations Specialist',
  'Resolves workplace conflicts, manages complaints, and maintains positive labor relations. ER specialists mediate disputes and ensure fair treatment through empathetic, impartial problem-solving.',
  'chro',
  'perfect', 'not_in', 'good', 'not_in', 'not_in', 'not_in',
  '["empathy", "communication", "conflict-resolution"]',
  '["listening", "fairness", "problem-solving"]',
  'pink',
  'all',
  true
),
(
  'CCM_CHRO_DEI_MANAGER',
  'Diversity, Equity & Inclusion Manager',
  'Leads initiatives to create diverse, equitable, inclusive workplaces. DEI managers challenge bias, promote belonging, and help organizations benefit from diverse perspectives.',
  'chro',
  'perfect', 'not_in', 'not_in', 'not_in', 'not_in', 'not_in',
  '["empathy", "cultural-awareness", "change-management"]',
  '["communication", "advocacy", "strategic-thinking"]',
  'pink',
  'high',
  true
),
(
  'CCM_CHRO_PERFORMANCE',
  'Performance Management Specialist',
  'Designs systems for evaluating and improving employee performance. Performance specialists help organizations align individual contributions with strategic goals through fair, effective assessment.',
  'chro',
  'perfect', 'not_in', 'good', 'not_in', 'not_in', 'not_in',
  '["communication", "fairness", "coaching"]',
  '["analytical-thinking", "empathy", "goal-setting"]',
  'pink',
  'middle',
  true
),
(
  'CCM_CHRO_WORKPLACE_SAFETY',
  'Workplace Safety Manager',
  'Ensures safe, healthy work environments through proactive safety programs. Safety managers prevent injuries, ensure compliance, and foster cultures where safety comes first.',
  'chro',
  'perfect', 'not_in', 'perfect', 'not_in', 'not_in', 'not_in',
  '["attention-to-detail", "vigilance", "communication"]',
  '["problem-solving", "empathy", "accountability"]',
  'pink',
  'middle',
  true
),
(
  'CCM_CHRO_ORGANIZATIONAL_DEV',
  'Organizational Development Consultant',
  'Improves organizational effectiveness through strategic interventions. OD consultants assess culture, design change initiatives, and help companies adapt to evolving needs.',
  'chro',
  'perfect', 'not_in', 'good', 'not_in', 'not_in', 'not_in',
  '["strategic-thinking", "change-management", "empathy"]',
  '["analytical-thinking", "communication", "problem-solving"]',
  'pink',
  'high',
  true
),
(
  'CCM_CHRO_HR_ANALYST',
  'HR Analytics Specialist',
  'Uses data to optimize HR decisions, from hiring to retention. HR analysts turn people data into insights that improve workforce planning, engagement, and productivity.',
  'chro',
  'good', 'not_in', 'good', 'not_in', 'not_in', 'not_in',
  '["analytical-thinking", "research", "attention-to-detail"]',
  '["communication", "problem-solving", "critical-thinking"]',
  'pink',
  'high',
  true
);

-- COO Organization Roles (10)
-- =====================================================

INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills,
  color_theme, grade_level, is_active
) VALUES
(
  'CCM_COO_OPERATIONS_OFFICER',
  'Chief Operating Officer',
  'The COO oversees daily operations, ensuring organizational efficiency and effectiveness. They translate strategy into execution, manage resources, and drive operational excellence across all business functions.',
  'coo',
  'good', 'good', 'perfect', 'good', 'not_in', 'good',
  '["leadership", "efficiency", "strategic-thinking"]',
  '["problem-solving", "organization", "decision-making"]',
  'teal',
  'high',
  true
),
(
  'CCM_COO_OPERATIONS_MANAGER',
  'Operations Manager',
  'Manages daily business operations, optimizing processes and coordinating teams. Operations managers ensure smooth workflows, resource allocation, and continuous improvement in operational performance.',
  'coo',
  'good', 'good', 'perfect', 'good', 'not_in', 'good',
  '["organization", "efficiency", "problem-solving"]',
  '["leadership", "multitasking", "attention-to-detail"]',
  'teal',
  'all',
  true
),
(
  'CCM_COO_SUPPLY_CHAIN_DIRECTOR',
  'Supply Chain Director',
  'Oversees end-to-end supply chain operations from sourcing to delivery. Supply chain directors optimize logistics, manage vendor relationships, and ensure product availability while minimizing costs.',
  'coo',
  'not_in', 'good', 'perfect', 'perfect', 'not_in', 'good',
  '["strategic-thinking", "analytical-thinking", "negotiation"]',
  '["problem-solving", "organization", "relationship-building"]',
  'teal',
  'high',
  true
),
(
  'CCM_COO_PROCESS_IMPROVEMENT',
  'Process Improvement Manager',
  'Leads lean and Six Sigma initiatives to eliminate waste and improve efficiency. Process improvement managers use data-driven methodologies to streamline operations and enhance quality.',
  'coo',
  'not_in', 'good', 'perfect', 'good', 'not_in', 'not_in',
  '["analytical-thinking", "problem-solving", "attention-to-detail"]',
  '["critical-thinking", "organization", "efficiency"]',
  'teal',
  'all',
  true
),
(
  'CCM_COO_QUALITY_DIRECTOR',
  'Quality Assurance Director',
  'Establishes and maintains quality standards across all operations. QA directors implement quality management systems, conduct audits, and drive continuous improvement in product and service quality.',
  'coo',
  'not_in', 'perfect', 'perfect', 'good', 'not_in', 'not_in',
  '["attention-to-detail", "analytical-thinking", "accountability"]',
  '["problem-solving", "leadership", "compliance"]',
  'teal',
  'high',
  true
),
(
  'CCM_COO_WAREHOUSE_MANAGER',
  'Warehouse Operations Manager',
  'Manages warehouse operations including inventory, shipping, and receiving. Warehouse managers optimize space utilization, ensure accurate inventory control, and coordinate distribution logistics.',
  'coo',
  'good', 'good', 'perfect', 'perfect', 'not_in', 'good',
  '["organization", "efficiency", "leadership"]',
  '["problem-solving", "attention-to-detail", "time-management"]',
  'teal',
  'middle',
  true
),
(
  'CCM_COO_PRODUCTION_MANAGER',
  'Production Manager',
  'Oversees manufacturing operations to meet production targets efficiently. Production managers coordinate teams, manage resources, and ensure quality output while optimizing costs and timelines.',
  'coo',
  'good', 'perfect', 'perfect', 'not_in', 'not_in', 'good',
  '["leadership", "organization", "problem-solving"]',
  '["efficiency", "attention-to-detail", "multitasking"]',
  'teal',
  'all',
  true
),
(
  'CCM_COO_LOGISTICS_COORDINATOR',
  'Logistics Coordinator',
  'Coordinates shipping, receiving, and distribution activities. Logistics coordinators manage transportation, track shipments, and ensure timely delivery while minimizing costs and optimizing routes.',
  'coo',
  'not_in', 'good', 'good', 'perfect', 'not_in', 'good',
  '["organization", "attention-to-detail", "problem-solving"]',
  '["communication", "time-management", "adaptability"]',
  'teal',
  'middle',
  true
),
(
  'CCM_COO_FACILITIES_MANAGER',
  'Facilities Manager',
  'Manages physical facilities, maintenance, and workplace safety. Facilities managers ensure safe, functional work environments while optimizing costs and coordinating building operations.',
  'coo',
  'good', 'not_in', 'perfect', 'good', 'not_in', 'good',
  '["organization", "problem-solving", "attention-to-detail"]',
  '["communication", "multitasking", "accountability"]',
  'teal',
  'middle',
  true
),
(
  'CCM_COO_CONTINUOUS_IMPROVEMENT',
  'Continuous Improvement Specialist',
  'Drives operational efficiency through Kaizen, lean manufacturing, and process optimization. CI specialists identify bottlenecks, eliminate waste, and foster cultures of continuous improvement.',
  'coo',
  'not_in', 'good', 'perfect', 'good', 'not_in', 'not_in',
  '["analytical-thinking", "problem-solving", "efficiency"]',
  '["attention-to-detail", "critical-thinking", "innovation"]',
  'teal',
  'all',
  true
);

-- =====================================================
-- PART 3: Synergy Cards (5 universal soft skills cards)
-- =====================================================

INSERT INTO ccm_synergy_cards (
  card_code, display_name, tagline, description,
  soft_skills_tags,
  effectiveness_for_people, effectiveness_for_product, effectiveness_for_process,
  effectiveness_for_place, effectiveness_for_promotion, effectiveness_for_price,
  color_theme, display_order, is_active
) VALUES
(
  'CCM_SYNERGY_CAPTAIN_CONNECTOR',
  'Captain Connector',
  'Collaboration & Communication',
  'Captain Connector excels at bringing people together, fostering teamwork, and ensuring clear communication across all levels. This synergy represents the power of relationship-building, active listening, and collaborative problem-solving.',
  '["collaboration", "communication", "relationship-building", "teamwork", "listening"]',
  'primary', 'secondary', 'secondary', 'secondary', 'primary', 'neutral',
  'blue',
  1,
  true
),
(
  'CCM_SYNERGY_THE_PATHFINDER',
  'The Pathfinder',
  'Critical Thinking & Planning',
  'The Pathfinder represents the ability to think critically, analyze complex situations, and develop long-term plans. This synergy embodies strategic thinking, forecasting, and making decisions that balance short-term needs with long-term vision.',
  '["critical-thinking", "strategic-thinking", "planning", "forecasting", "decision-making"]',
  'secondary', 'primary', 'primary', 'primary', 'secondary', 'primary',
  'purple',
  2,
  true
),
(
  'CCM_SYNERGY_MASTER_IMPROVER',
  'Master Improver',
  'Innovation & Creativity',
  'Master Improver unleashes innovative thinking and fresh perspectives. This synergy celebrates creativity, design thinking, entrepreneurial spirit, and the courage to challenge conventional approaches with novel solutions.',
  '["creativity", "innovation", "design-thinking", "entrepreneurship", "risk-taking"]',
  'neutral', 'primary', 'secondary', 'neutral', 'primary', 'neutral',
  'orange',
  3,
  true
),
(
  'CCM_SYNERGY_MISSION_STARTER',
  'Mission Starter',
  'Analytical Thinking & Research',
  'Mission Starter harnesses the power of data, research, and analytical thinking. This synergy represents evidence-based decision-making, quantitative analysis, and the ability to extract insights from complex information.',
  '["analytical-thinking", "research", "data-analysis", "attention-to-detail", "problem-solving"]',
  'secondary', 'primary', 'primary', 'secondary', 'secondary', 'primary',
  'green',
  4,
  true
),
(
  'CCM_SYNERGY_CHIEF_VIBE',
  'Chief Vibe',
  'Empathy & Leadership',
  'Chief Vibe focuses on understanding and developing people. This synergy embodies emotional intelligence, empathetic leadership, coaching, and creating inclusive environments where everyone can thrive.',
  '["empathy", "leadership", "emotional-intelligence", "coaching", "cultural-awareness"]',
  'primary', 'neutral', 'secondary', 'neutral', 'secondary', 'neutral',
  'pink',
  5,
  true
);

-- =====================================================
-- PART 4: Perpetual Rooms (Featured rooms for CCM)
-- =====================================================

INSERT INTO ccm_perpetual_rooms (
  room_code, room_name, description, status,
  max_players_per_game, intermission_duration_seconds,
  theme_color, is_featured, feature_order
) VALUES
(
  'CCM_GLOBAL_01',
  'Global CEO Challenge',
  'Join CEOs from around the world in high-stakes business challenges. All difficulty levels, all industries. The ultimate test of leadership and decision-making.',
  'active',
  8,
  15,
  'purple',
  true,
  1
),
(
  'CCM_SKILL_BUILDER_01',
  'Skills Development Arena',
  'Perfect for students and emerging professionals. Learn fundamental business skills through hands-on challenges. Supportive community, beginner-friendly scenarios.',
  'active',
  8,
  15,
  'blue',
  true,
  2
),
(
  'CCM_RAPID_FIRE_01',
  'Rapid Fire Decisions',
  'Fast-paced business challenges for experienced players. Quick thinking, bold moves, high rewards. Can you keep up with the pressure?',
  'active',
  6,
  10,
  'orange',
  true,
  3
),
(
  'CCM_TEAM_COLLAB_01',
  'Team Collaboration Hub',
  'Focused on teamwork and collaboration challenges. Work together to solve complex problems. Great for clubs, classrooms, and organizations.',
  'active',
  8,
  15,
  'green',
  true,
  4
);

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
  challenge_count INT;
  role_count INT;
  synergy_count INT;
  room_count INT;
BEGIN
  SELECT COUNT(*) INTO challenge_count FROM ccm_challenge_cards;
  SELECT COUNT(*) INTO role_count FROM ccm_role_cards;
  SELECT COUNT(*) INTO synergy_count FROM ccm_synergy_cards;
  SELECT COUNT(*) INTO room_count FROM ccm_perpetual_rooms;

  RAISE NOTICE '';
  RAISE NOTICE '✅ CCM Content Seeded Successfully';
  RAISE NOTICE '   - Challenge Cards: % scenarios', challenge_count;
  RAISE NOTICE '   - Role Cards: % career roles', role_count;
  RAISE NOTICE '   - Synergy Cards: % soft skills cards', synergy_count;
  RAISE NOTICE '   - Perpetual Rooms: % featured rooms', room_count;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Content Distribution:';
  RAISE NOTICE '   - People Challenges: 5';
  RAISE NOTICE '   - Product Challenges: 5';
  RAISE NOTICE '   - Process Challenges: 5';
  RAISE NOTICE '   - Place Challenges: 5';
  RAISE NOTICE '   - Promotion Challenges: 5';
  RAISE NOTICE '   - Price Challenges: 5';
  RAISE NOTICE '   - CEO Roles: 10';
  RAISE NOTICE '   - CFO Roles: 10';
  RAISE NOTICE '   - CMO Roles: 10';
  RAISE NOTICE '   - CTO Roles: 10';
  RAISE NOTICE '   - CHRO Roles: 10';
  RAISE NOTICE '   - COO Roles: 10';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Ready to play!';
  RAISE NOTICE '';
END $$;
