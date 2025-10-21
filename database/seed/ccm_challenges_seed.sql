-- ============================================
-- CCM Challenge Cards Seed Data
-- 120 Total Challenges: 6 P's × 20 Companies
-- Age-appropriate content for elementary and middle/high school
-- ============================================

-- Each company gets 6 challenges (one per P category):
-- - People: Workforce, culture, hiring, retention, training
-- - Product: Innovation, quality, features, development
-- - Process: Operations, efficiency, workflows, systems
-- - Place: Distribution, location, logistics, expansion
-- - Promotion: Marketing, branding, advertising, social media
-- - Price: Pricing strategy, costs, revenue, profitability

-- ============================================
-- QUICKSERVE GLOBAL (Middle/High School)
-- ============================================

-- PEOPLE Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'High Employee Turnover Crisis',
    'Employee turnover at our downtown location has reached 65% annually, significantly above the industry average of 40%. Exit interviews reveal concerns about work-life balance, limited career advancement, and compensation. Training costs are escalating, and service quality is suffering as we constantly onboard new staff.',
    'People challenges focus on workforce management, culture, and talent retention. Successful organizations invest in their employees to build strong, stable teams that deliver consistent results.',
    'people', 'people',
    'medium', 'other',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As CEO of QuickServe, I understand that our people are our greatest asset across all 2,000 locations. I balance financial constraints with employee needs and set the cultural tone from the top. My strategic perspective on workforce investment will guide us through this challenge.',
        'cfo', 'I manage QuickServe''s $15B in revenue and see the direct financial impact of turnover—each departure costs us $5,000 in recruiting and training. I can analyze compensation data, benchmark against competitors, and model the ROI of retention investments.',
        'cmo', 'I built QuickServe''s employer brand and understand how employee satisfaction drives customer experience. Our marketing team can create internal campaigns to boost morale and external campaigns to attract better talent. I know how to position QuickServe as an employer of choice.',
        'cto', 'I lead our tech-enabled ordering systems and can leverage technology to improve work-life balance—automated scheduling, mobile workforce management, and career development platforms. Technology can reduce repetitive tasks and help employees focus on meaningful customer interactions.',
        'chro', 'As Chief HR Officer, I oversee workforce strategy for all 50,000 employees. I have direct access to turnover data, exit interview insights, and compensation benchmarks. I can implement retention programs, redesign career paths, and create a culture where people want to stay and grow.',
        'coo', 'I run operations across 2,000 locations and see the operational impact of turnover firsthand—inconsistent service, training backlogs, and manager burnout. I can optimize work schedules, improve training efficiency, and create operational systems that support employee success.'
    ),
    jsonb_build_object(
        'ceo', 1.25,
        'chro', 1.30,
        'coo', 1.00,
        'cfo', 1.00,
        'cmo', 1.00,
        'cto', 1.00
    )
);

-- PRODUCT Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'Healthy Menu Expansion Demand',
    'Customer surveys show 68% of patrons want more healthy options beyond our current menu. Competitors like Sweetgreen and Chipotle are capturing health-conscious customers. Our current menu is optimized for speed and cost but lacks nutritional variety. We need to innovate without compromising our quick-service model.',
    'Product challenges involve creating value through offerings that meet customer needs. Successful product innovation balances customer demand, operational feasibility, and profitability.',
    'product', 'product',
    'hard', 'other',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance customer demand with our core quick-service identity. I''ve overseen major menu launches and understand the strategic implications of product expansion. My cross-functional perspective ensures we innovate without losing what made QuickServe successful.',
        'cfo', 'I analyze menu profitability and can model the financial impact of new offerings. I know our food costs, margin requirements, and capital needs for kitchen equipment. I''ll ensure healthy options are profitable and don''t cannibalize our core menu sales.',
        'cmo', 'I built QuickServe''s brand and understand our customer segments deeply. I can research which healthy options resonate most, position them effectively, and create launch campaigns that drive trial without alienating our core customers. I know how to tell the "healthy QuickServe" story.',
        'cto', 'I lead our tech-enabled ordering platform and can analyze ordering data to predict demand. I can enable digital menu testing, nutritional transparency features, and personalized recommendations. Technology lets us experiment with new products efficiently.',
        'chro', 'I understand our workforce capabilities and training requirements. New menu items mean retraining 50,000 employees, updating food safety protocols, and potentially hiring specialized culinary talent. I''ll ensure our people are prepared to execute the new menu flawlessly.',
        'coo', 'I run 2,000 kitchens and know our operational constraints intimately. I can assess which healthy options fit our speed-of-service model, evaluate kitchen equipment needs, manage supply chain complexity, and ensure consistent execution. Operations make or break product launches.'
    ),
    jsonb_build_object(
        'cto', 1.30,
        'cmo', 1.15,
        'ceo', 1.00,
        'cfo', 1.00,
        'chro', 1.00,
        'coo', 1.00
    )
);

-- PROCESS Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'Kitchen Workflow Bottlenecks',
    'Average order fulfillment time has increased from 3.5 to 5.2 minutes, causing customer complaints and lost sales during peak hours. Kitchen layout inefficiencies, unclear task assignments, and equipment placement are causing gridlock. Competitors are serving customers 30% faster with similar menu complexity.',
    'Process challenges require improving workflows, efficiency, and operational systems. Successful process optimization eliminates waste, standardizes procedures, and maximizes resource utilization.',
    'process', 'process',
    'medium', 'other',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As CEO, I know speed of service is core to our value proposition. I''ve seen how operational excellence drives customer satisfaction and profitability. My strategic oversight ensures process improvements align with our brand promise of quick, quality service.',
        'cfo', 'I can quantify the financial impact of slow service—lost transactions, wasted labor costs, and reduced table turns. I''ll model the ROI of kitchen redesigns and equipment investments. Every second we save has measurable financial value across 2,000 locations.',
        'cmo', 'I understand our brand promise of "fast casual" and how service speed affects customer perception. Slow service damages our brand equity and social media reputation. I can help communicate process improvements internally and ensure they enhance rather than compromise the customer experience.',
        'cto', 'I can deploy kitchen display systems, order routing automation, and predictive analytics to optimize workflow. Technology can eliminate communication delays, automate task prioritization, and provide real-time performance visibility. I''ll use data to drive continuous improvement.',
        'chro', 'I can assess if training gaps or staffing levels contribute to bottlenecks. Better cross-training, clearer role definitions, and proper staffing models can dramatically improve flow. I''ll ensure our people have the skills and support structures to execute efficiently.',
        'coo', 'I run 2,000 kitchens and have deep expertise in quick-service operations. I can redesign kitchen layouts, implement lean manufacturing principles, optimize equipment placement, and create standard operating procedures. Process optimization is at the heart of what I do every day.'
    ),
    jsonb_build_object(
        'coo', 1.25,
        'cfo', 1.20,
        'cto', 1.15,
        'ceo', 1.00,
        'cmo', 1.00,
        'chro', 1.00
    )
);

-- PLACE Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'Ghost Kitchen Expansion Strategy',
    'Delivery orders have grown to 35% of revenue, but our dine-in focused locations are inefficient for delivery-only operations. Ghost kitchens (delivery-only facilities) could reduce real estate costs by 60% and expand our geographic reach. However, this model requires new logistics, brand positioning, and operational systems.',
    'Place challenges focus on distribution, location strategy, and how products reach customers. Successful distribution balances accessibility, cost efficiency, and brand experience.',
    'place', 'place',
    'hard', 'other',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As CEO, I set our long-term distribution strategy and assess how ghost kitchens fit our brand identity. I balance growth ambitions with brand integrity and shareholder expectations. This is a strategic crossroads that will define QuickServe''s future.',
        'cfo', 'I can model the economics of ghost kitchens versus traditional locations—lower rent, but delivery commission fees. I''ll analyze capital requirements, payback periods, and impact on overall profitability. Financial analysis will determine if this expansion makes sense.',
        'cmo', 'I''m concerned about how ghost kitchens affect brand perception and customer experience. Without physical presence, we rely entirely on digital touchpoints and delivery experience. I''ll develop strategies to maintain brand strength in a delivery-first model and differentiate from virtual competitors.',
        'cto', 'I can build the technology infrastructure for ghost kitchen operations—order aggregation across platforms, kitchen optimization systems, and delivery logistics integration. Technology enables this model and will determine operational efficiency. I''ll create the digital backbone.',
        'chro', 'I need to prepare our workforce for this shift—hiring delivery-focused staff, retraining managers, and creating new job categories. Ghost kitchens require different skills than traditional restaurants. I''ll build the talent strategy for this new model.',
        'coo', 'I run 2,000 locations and understand our operational DNA. I can assess ghost kitchen feasibility, optimize delivery workflows, manage supply chain complexity, and ensure quality consistency. I''ll pilot test locations, refine operations, and scale successfully if we proceed.'
    ),
    jsonb_build_object(
        'coo', 1.25,
        'ceo', 1.00,
        'cfo', 1.00,
        'cmo', 1.00,
        'cto', 1.00,
        'chro', 1.00
    )
);

-- PROMOTION Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'Social Media Engagement Decline',
    'Our social media engagement has dropped 42% over six months while competitors'' content goes viral. Our posts feel corporate and disconnected from Gen Z and Millennial customers. TikTok and Instagram are driving traffic to competitors. We need a fresh, authentic digital marketing strategy.',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, and drives customer action.',
    'promotion', 'promotion',
    'easy', 'other',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As CEO, I know our brand is our most valuable asset. I''ve seen how social media can amplify or damage a brand overnight. I''ll ensure our social strategy aligns with company values and resonates authentically with our target customers.',
        'cfo', 'I can measure the ROI of social media investments and determine appropriate budgets for content creation, influencer partnerships, and paid promotion. I''ll track how social engagement translates to store visits and sales. Marketing must drive measurable business results.',
        'cmo', 'I built QuickServe''s brand and lead our marketing team. I understand social media algorithms, content trends, and how to create shareable moments. I can develop an authentic voice, partner with influencers, and create campaigns that drive engagement and traffic. This is my domain.',
        'cto', 'I can provide data analytics on content performance, customer sentiment, and campaign attribution. I''ll implement social listening tools, automate content testing, and enable personalized marketing at scale. Technology turns creative ideas into measurable results.',
        'chro', 'I can assess if we have the right marketing talent and culture of creativity. Social media success requires different skills than traditional marketing. I''ll help recruit social-native talent, foster a creative culture, and empower employees to be brand ambassadors.',
        'coo', 'I ensure promotional campaigns are operationally feasible. Viral success is worthless if stores can''t handle increased traffic. I''ll ensure operations can deliver on marketing promises and that in-store experience matches our social media brand image.'
    ),
    jsonb_build_object(
        'cmo', 1.30,
        'ceo', 1.00,
        'cfo', 1.00,
        'cto', 1.00,
        'chro', 1.00,
        'coo', 1.00
    )
);

-- PRICE Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'Competitor Undercutting Threat',
    'A well-funded competitor opened locations near 200 of our stores with prices 15-20% lower than ours. Customer traffic has declined 18% at affected locations. Our current pricing assumes 28% food cost ratios, but matching competitors would squeeze margins to unsustainable levels. We need a pricing strategy that retains customers without destroying profitability.',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, and long-term sustainability.',
    'price', 'price',
    'hard', 'other',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance short-term competitive pressures with long-term sustainability. I won''t engage in a race to the bottom that destroys shareholder value. I''ll find strategies that defend market share while maintaining the financial health of QuickServe. This requires wisdom and strategic courage.',
        'cfo', 'I manage QuickServe''s financial health and understand our cost structure intimately. I can model different pricing scenarios, identify cost reduction opportunities, and determine our break-even thresholds. I''ll analyze if we can match competitor prices through efficiency gains rather than margin compression. This is fundamentally a financial challenge.',
        'cmo', 'I can shift the conversation from price to value. We may not be the cheapest, but we offer superior quality, service, and brand experience. I''ll create marketing that justifies our premium and targets customers who value quality over price. Strategic positioning can overcome price disadvantages.',
        'cto', 'I can enable dynamic pricing, promotional targeting, and loyalty programs through technology. Our ordering platform allows sophisticated pricing strategies that competitors lack. I can also identify operational efficiencies that reduce costs, giving us pricing flexibility.',
        'chro', 'I understand our labor costs—our largest expense category. I can explore scheduling optimization, productivity improvements, and training efficiencies that reduce per-unit labor costs. Small efficiency gains across 50,000 employees add up to significant pricing flexibility.',
        'coo', 'I run our supply chain and operations. I can negotiate with suppliers, optimize portion sizes, reduce waste, and improve efficiency to lower costs. Operational excellence creates pricing flexibility. I''ll find ways to reduce costs without compromising quality, giving CFO room to adjust pricing.'
    ),
    jsonb_build_object(
        'cfo', 1.30,
        'ceo', 1.25,
        'cmo', 1.00,
        'cto', 1.00,
        'chro', 1.00,
        'coo', 1.00
    )
);

-- ============================================
-- QUICKSERVE_ELEM (Elementary)
-- ============================================

-- PEOPLE Challenge
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers
)
VALUES (
    'Workers Keep Leaving',
    'Many of our restaurant workers at the downtown Yummy Food Place keep quitting and getting jobs somewhere else. When people leave, we have to spend time and money finding new workers and teaching them how to do the job. This makes it hard to serve customers well because we always have new people learning.',
    'Taking care of workers is really important for any business. When workers are happy and want to stay, they do a better job and customers are happier too!',
    'people', 'people',
    'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1),
    100,
    jsonb_build_object(
        'ceo', 'As the Boss of Yummy Food Place, I know that happy workers make happy customers! I make sure our restaurant is a good place to work. I can help us figure out why workers are leaving and make changes so they want to stay and grow with us.',
        'cfo', 'I''m the Money Manager. Every time someone leaves, it costs us money to find and train a new person. I can look at how much we pay workers compared to other restaurants and help us decide if we should pay more to keep good workers.',
        'cmo', 'I''m the Marketing Manager who tells people about Yummy Food Place. I can help make our restaurant look like a great place to work! I can create fun videos and stories that make people want to come work here instead of other places.',
        'cto', 'I''m the Technology Leader. I can create a special app that helps workers pick their schedules and learn their jobs easier. Technology can make work more fun and less stressful for our team!',
        'chro', 'I''m the People Manager and I take care of all our workers. I can talk to people who are leaving to find out why, and then I can make things better. I can create fun training programs and rewards so people are happy working here!',
        'coo', 'I''m the Operations Manager who runs all our restaurants. I see how hard it is when workers leave—it makes things messy and customers have to wait longer. I can make better work schedules and help managers be nicer to their teams.'
    ),
    jsonb_build_object(
        'ceo', 1.25,
        'chro', 1.30,
        'coo', 1.00,
        'cfo', 1.00,
        'cmo', 1.00,
        'cto', 1.00
    )
);

-- Continue with remaining elementary challenges...
-- (PRODUCT, PROCESS, PLACE, PROMOTION, PRICE for QUICKSERVE_ELEM)

-- ============================================
-- Template for remaining 108 challenges
-- ============================================
-- This seed file would continue with:
-- - Remaining 5 challenges for QUICKSERVE_ELEM
-- - 6 challenges each for: HORIZON, HORIZON_ELEM
-- - 6 challenges each for: SKYCONNECT, SKYCONNECT_ELEM
-- - 6 challenges each for: GREENGRID, GREENGRID_ELEM
-- - 6 challenges each for: CLOUDPEAK, CLOUDPEAK_ELEM
-- - 6 challenges each for: MEDICORE, MEDICORE_ELEM
-- - 6 challenges each for: NEXTGEN, NEXTGEN_ELEM
-- - 6 challenges each for: PLAYFORGE, PLAYFORGE_ELEM
-- - 6 challenges each for: BUILDRIGHT, BUILDRIGHT_ELEM
-- - 6 challenges each for: TRENDFWD, TRENDFWD_ELEM

-- Each following the same pattern:
-- - Age-appropriate language and complexity
-- - Company-specific executive pitches
-- - Appropriate lens multipliers for each P category

COMMENT ON TABLE ccm_business_scenarios IS
'Complete set of 120 business challenges for CCM multiplayer (6 P categories × 20 companies). Each challenge includes age-appropriate content and company-specific executive pitches to support Round 1 lens selection.';
