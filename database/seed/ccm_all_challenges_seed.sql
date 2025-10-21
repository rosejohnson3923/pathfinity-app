-- ============================================
-- CCM Complete Challenge Library
-- 180 Age-Appropriate Business Scenarios
-- ============================================
-- Structure:
-- - 60 Elementary challenges (10 companies × 6 P's)
-- - 60 Middle School challenges (10 companies × 6 P's)
-- - 60 High School challenges (10 companies × 6 P's)
--
-- Each challenge includes:
-- - Age-appropriate language and complexity
-- - Company-specific executive pitches
-- - Strategic lens multipliers
-- ============================================

-- ============================================
-- HELPER: Standard Lens Multipliers by P Category
-- ============================================
-- People: CEO (1.25x), CHRO (1.30x)
-- Product: CTO (1.30x), CMO (1.15x)
-- Process: COO (1.25x), CFO (1.20x), CTO (1.15x)
-- Place: COO (1.25x), CEO (1.25x)
-- Promotion: CMO (1.30x), CEO (1.15x)
-- Price: CFO (1.30x), CEO (1.25x)

-- ============================================
-- HIGH SCHOOL COMPANIES (10 companies)
-- ============================================
-- Large corporations (2,000-50,000 employees)
-- Complex business scenarios, strategic depth
-- Industry terminology, sophisticated analysis

-- ========================================
-- QUICKSERVE GLOBAL - High School
-- ========================================

-- PEOPLE: High Employee Turnover Crisis
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'High Employee Turnover Crisis',
    'Employee turnover at our downtown location has reached 65% annually, significantly above the industry average of 40%. Exit interviews reveal concerns about work-life balance, limited career advancement, and compensation. Training costs are escalating, and service quality is suffering as we constantly onboard new staff. This retention crisis threatens operational stability and profitability.',
    'People challenges focus on workforce management, talent retention, and organizational culture. Successful companies invest in their employees because satisfied workers deliver better customer experiences and reduce costly turnover.',
    'people', 'people', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of QuickServe Global, I understand that our 50,000 employees are our most valuable asset across 2,000 locations. I balance financial constraints with workforce investment and set the cultural tone from the top. My strategic perspective on talent management and cross-functional thinking will guide us through this retention crisis.',
        'cfo', 'I manage QuickServe''s finances and see the direct cost of turnover—each departure costs $5,000 in recruiting and training. I can analyze compensation data, benchmark against competitors, model the ROI of retention programs, and determine if pay increases are financially sustainable. This is fundamentally a financial optimization problem.',
        'cmo', 'I built QuickServe''s brand and understand how employee satisfaction drives customer experience. Our marketing team can create internal campaigns to boost morale and external campaigns to position us as an employer of choice. I know how to build an employer brand that attracts and retains top talent.',
        'cto', 'I lead our tech-enabled ordering systems and can leverage technology to improve work-life balance—automated scheduling, mobile workforce management, and career development platforms. Technology can reduce repetitive tasks and help employees focus on meaningful work, improving job satisfaction.',
        'chro', 'As Chief HR Officer overseeing 50,000 employees, I have direct access to turnover data, exit interview insights, and compensation benchmarks. I can implement retention programs, redesign career paths, enhance benefits, and create a culture where people want to stay and grow. Workforce strategy is my core expertise.',
        'coo', 'I run operations across 2,000 locations and see the operational impact of turnover firsthand—inconsistent service, training backlogs, manager burnout, and customer complaints. I can optimize work schedules, improve training efficiency, and create operational systems that support employee success and reduce turnover friction.'
    ),
    jsonb_build_object('ceo', 1.25, 'chro', 1.30, 'coo', 1.0, 'cfo', 1.0, 'cmo', 1.0, 'cto', 1.0),
    ARRAY['urgent', 'workforce', 'retention', 'culture']
);

-- PRODUCT: Healthy Menu Expansion Demand
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'Healthy Menu Innovation Pressure',
    'Customer surveys show 68% of patrons want more healthy options beyond our current menu. Competitors like Sweetgreen and Chipotle are capturing health-conscious customers who view our brand as unhealthy. Our menu is optimized for speed and cost but lacks nutritional variety. We need to innovate without compromising our quick-service model or alienating our core customers.',
    'Product challenges involve creating value through offerings that meet evolving customer needs. Successful product innovation balances customer demand, operational feasibility, brand identity, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance customer demand with our core quick-service identity. I''ve overseen major product launches and understand the strategic implications of menu expansion. My cross-functional perspective ensures we innovate authentically without losing what made QuickServe successful—speed, value, and taste.',
        'cfo', 'I analyze menu profitability at the item level. I can model the financial impact of new offerings—food costs, equipment investments, training expenses, and projected sales. I''ll ensure healthy options are profitable and don''t cannibalize our core menu. Every new product must meet our margin requirements.',
        'cmo', 'I built QuickServe''s brand and understand our customer segments deeply. I can research which healthy options resonate most, position them effectively without alienating our base, and create launch campaigns that drive trial. I know how to tell the "healthy QuickServe" story without compromising our brand equity.',
        'cto', 'I lead our tech-enabled ordering platform and can analyze massive ordering data to predict demand patterns. I can enable digital menu testing, nutritional transparency features, personalized recommendations, and A/B testing. Technology lets us experiment with new products efficiently and make data-driven decisions.',
        'chro', 'I understand our workforce capabilities and training requirements. New menu items mean retraining 50,000 employees, updating food safety protocols, and potentially hiring specialized culinary talent. I''ll ensure our people are prepared to execute the new menu flawlessly and maintain quality standards.',
        'coo', 'I run 2,000 kitchens and know our operational constraints intimately. I can assess which healthy options fit our speed-of-service model, evaluate kitchen equipment needs, manage supply chain complexity, and ensure consistent execution. Operations make or break product launches—I''ll determine what''s actually feasible.'
    ),
    jsonb_build_object('cto', 1.30, 'cmo', 1.15, 'ceo', 1.0, 'cfo', 1.0, 'chro', 1.0, 'coo', 1.0),
    ARRAY['innovation', 'customer_demand', 'health_trends', 'menu']
);

-- PROCESS: Kitchen Workflow Bottlenecks
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'Kitchen Workflow Optimization Crisis',
    'Average order fulfillment time has increased from 3.5 to 5.2 minutes, causing customer complaints and lost sales during peak hours. Kitchen layout inefficiencies, unclear task assignments, and equipment placement are creating gridlock. Competitors are serving customers 30% faster with similar menu complexity. Our speed-of-service advantage is eroding.',
    'Process challenges require improving workflows, eliminating waste, and maximizing operational efficiency. Successful process optimization combines lean principles, technology enablement, and continuous improvement culture.',
    'process', 'process', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I know speed of service is core to our value proposition and competitive advantage. I''ve seen how operational excellence drives customer satisfaction and profitability. My strategic oversight ensures process improvements align with our brand promise and financial goals.',
        'cfo', 'I can quantify the financial impact of slow service—lost transactions, wasted labor costs, reduced table turns, and customer defection. I''ll model the ROI of kitchen redesigns and equipment investments. Every second we save has measurable financial value when multiplied across 2,000 locations and millions of transactions.',
        'cmo', 'I understand our brand promise of "fast casual" and how service speed affects customer perception and satisfaction. Slow service damages our brand equity, drives negative social media reviews, and erodes our competitive positioning. I''ll ensure process improvements enhance rather than compromise the customer experience.',
        'cto', 'I can deploy kitchen display systems, order routing automation, predictive analytics, and real-time performance dashboards. Technology can eliminate communication delays, automate task prioritization, provide visibility into bottlenecks, and enable data-driven continuous improvement. I''ll use digital tools to optimize workflow.',
        'chro', 'I can assess if training gaps, skill deficiencies, or staffing levels contribute to bottlenecks. Better cross-training, clearer role definitions, improved scheduling models, and performance incentives can dramatically improve flow. I''ll ensure our people have the skills, tools, and motivation to execute efficiently.',
        'coo', 'I run 2,000 kitchens and have deep expertise in quick-service operations. I can redesign kitchen layouts using lean manufacturing principles, optimize equipment placement, implement standard operating procedures, and eliminate waste. Process optimization is at the heart of what I do every day—this is my domain.'
    ),
    jsonb_build_object('coo', 1.25, 'cfo', 1.20, 'cto', 1.15, 'ceo', 1.0, 'cmo', 1.0, 'chro', 1.0),
    ARRAY['efficiency', 'operations', 'speed', 'workflow']
);

-- Continue with PLACE, PROMOTION, PRICE for QUICKSERVE...
-- Then repeat pattern for remaining 9 high school companies

-- ============================================
-- MIDDLE SCHOOL COMPANIES (10 companies)
-- ============================================
-- Small-medium businesses (240-650 employees)
-- Moderate complexity, business concepts introduced
-- Age-appropriate for 11-14 year olds

-- ========================================
-- BEANBUZZ COFFEE - Middle School
-- ========================================

-- PEOPLE: Staff Training and Development
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'Barista Training Challenge',
    'Our newer employees are struggling to learn drink recipes and customer service skills quickly enough. During busy morning rushes, mistakes are common and lines get long. Some customers are complaining about inconsistent drink quality between different locations. We need a better training system to help new baristas succeed faster.',
    'People challenges are about helping employees learn new skills and do their jobs well. When workers are properly trained, they feel confident, make fewer mistakes, and provide better service to customers.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of BeanBuzz Coffee, I know our friendly baristas are what make customers love us. I need to make sure every employee feels confident and successful in their job. Good training helps our team members grow and makes our business stronger.',
        'cfo', 'I handle our finances and know that when baristas make mistakes, we waste expensive coffee ingredients. Better training costs money up front, but it saves us money by reducing waste and keeping customers happy. I can figure out the best training budget.',
        'cmo', 'I''m responsible for BeanBuzz''s reputation, and customers notice when drinks are made inconsistently. I can create training videos and visual guides that make learning fun. I''ll make sure our brand promise of quality is kept at every location through proper training.',
        'cto', 'I can create a training app for our baristas with recipe videos, interactive quizzes, and skill tracking. Technology can make learning faster and easier. I''ll build digital tools that help new employees master their jobs more quickly.',
        'chro', 'As the HR leader, developing our 350 employees is my main job. I can design a step-by-step training program with hands-on practice, mentorship from experienced baristas, and clear skill levels. I''ll create a system that helps every new team member succeed.',
        'coo', 'I run operations for all our coffee shops. I see how training problems affect our service during busy times. I can create simple, visual standard procedures, set up practice stations, and build training time into work schedules so people learn properly.'
    ),
    jsonb_build_object('ceo', 1.25, 'chro', 1.30, 'coo', 1.0, 'cfo', 1.0, 'cmo', 1.0, 'cto', 1.0),
    ARRAY['training', 'skills', 'quality', 'employees']
);

-- PRODUCT: New Drink Development
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'Seasonal Drink Menu Innovation',
    'Customers are asking for more creative seasonal drinks beyond our standard menu. Coffee shops like Starbucks get lots of attention for their seasonal specials. We want to create exciting new drinks that fit our local, community-focused brand, but we need to make sure they''re not too complicated for our baristas to make during busy times.',
    'Product challenges involve creating new offerings that customers want while making sure they fit with your business. Good product development balances creativity with practicality.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want BeanBuzz to be known for creative, seasonal drinks that reflect our community values. I''ll make sure new products stay true to our local roots and don''t overcomplicate our operations. We need to innovate in a way that makes sense for our small business.',
        'cfo', 'I need to make sure new drinks are profitable. I''ll analyze ingredient costs, predict how many we might sell, and determine prices that customers will pay. Some seasonal ingredients cost more, so I''ll calculate if these special drinks will actually make us money.',
        'cmo', 'I can research what flavors our customers love and create buzz around new seasonal drinks through social media and in-store displays. I''ll design campaigns that get people excited to try our creative drinks and come back for their favorites. Marketing makes new products successful.',
        'cto', 'I can add new drinks to our point-of-sale system and analyze sales data to see which ones are popular. Technology lets us test new drinks in a few stores first, track performance, and make smart decisions about rolling them out to all locations.',
        'chro', 'I need to make sure our baristas can learn new drink recipes without getting overwhelmed. I''ll create simple recipe cards, training videos, and practice sessions. If drinks are too complicated, our team will struggle during rush times and customers will wait too long.',
        'coo', 'I run daily operations and need to ensure new drinks don''t slow down service. I''ll test recipes in our kitchens to make sure they fit our workflow, source ingredients reliably, and check that we have the right equipment. New products must be operationally practical.'
    ),
    jsonb_build_object('cto', 1.30, 'cmo', 1.15, 'ceo', 1.0, 'cfo', 1.0, 'chro', 1.0, 'coo', 1.0),
    ARRAY['innovation', 'menu', 'seasonal', 'creativity']
);

-- Continue with PROCESS, PLACE, PROMOTION, PRICE for BEANBUZZ...
-- Then repeat for remaining 9 middle school companies

-- ============================================
-- ELEMENTARY COMPANIES (10 companies)
-- ============================================
-- Kid-friendly businesses (200-2,000 "helpers")
-- Simple language, clear scenarios
-- Age-appropriate for K-5 students

-- ========================================
-- YUMMY FOOD PLACE (QUICKSERVE_ELEM) - Elementary
-- ========================================

-- PEOPLE: Workers Keep Leaving
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'Workers Keep Leaving',
    'Many workers at our Yummy Food Place keep quitting to get jobs at other restaurants. When workers leave, we have to spend time and money finding new people and teaching them how to do the job. This makes it hard to serve customers well because we always have new people who are still learning.',
    'Taking care of workers is really important for any business. When workers are happy and want to stay, they do a better job helping customers!',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I''m the Boss of Yummy Food Place! I make sure our restaurant is a good place to work. I can help us figure out why workers are leaving and make changes so they want to stay. Happy workers make happy customers!',
        'cfo', 'I''m the Money Manager. Every time someone leaves, it costs us money to find a new person and teach them the job. I can look at how much we pay workers and help decide if we should pay more to keep good workers here.',
        'cmo', 'I''m the Marketing Manager who tells people about Yummy Food Place. I can make our restaurant look like a really fun place to work! I can create videos showing how great our team is, so more people want to come work here.',
        'cto', 'I''m the Technology Leader. I can create a special app where workers can pick their work schedules and learn their jobs more easily. Technology can make work more fun and less stressful for our team!',
        'chro', 'I''m the People Manager who takes care of all our workers. I can talk to people who are leaving to find out why, and then make things better. I can create fun training and give rewards so people are happy working here!',
        'coo', 'I''m the Operations Manager who makes sure our restaurants run smoothly. When workers leave, everything gets messy and customers have to wait longer. I can make better schedules and help managers be nicer to their teams.'
    ),
    jsonb_build_object('ceo', 1.25, 'chro', 1.30, 'coo', 1.0, 'cfo', 1.0, 'cmo', 1.0, 'cto', 1.0),
    ARRAY['workers', 'happy', 'training', 'teamwork']
);

-- PRODUCT: Healthier Food Options
INSERT INTO ccm_business_scenarios (
    title, description, context, business_driver, p_category,
    difficulty_level, grade_category, company_room_id, base_points,
    executive_pitches, lens_multipliers, tags
) VALUES (
    'Kids Want Healthier Food',
    'A lot of parents are asking us to add healthier food to our menu, like fruit and vegetables. Some kids want options that are better for them. Right now we mostly have burgers and fries. We want to add some healthy choices, but we need to make sure kids will actually eat them and that we can make them quickly.',
    'Making new foods that customers want is important for restaurants. When you add new menu items, you need to think about what people like to eat and if your restaurant can make them easily.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I''m the Boss! I want Yummy Food Place to serve food that kids and parents both love. I need to make sure new healthy foods fit with our restaurant and don''t make things too complicated in the kitchen.',
        'cfo', 'I''m the Money Manager. Healthy foods like fresh fruit might cost more money to buy. I need to figure out how much these new foods will cost and if families will be willing to pay for them.',
        'cmo', 'I''m the Marketing Manager! I can find out what healthy foods kids actually like by asking them. Then I can make fun posters and social media posts that make kids excited to try our new healthy options!',
        'cto', 'I''m the Technology Leader. I can add pictures of the new healthy foods to our ordering screens and see how many people choose them. Technology helps us learn what foods are popular!',
        'chro', 'I''m the People Manager. I need to teach our workers how to prepare the new healthy foods. I''ll make sure everyone knows how to make them quickly and correctly so customers don''t have to wait.',
        'coo', 'I''m the Operations Manager. I need to make sure we can get fresh fruits and vegetables delivered to our restaurants and that we have space to store them. I''ll test the new foods in our kitchen to make sure we can make them fast enough.'
    ),
    jsonb_build_object('cto', 1.30, 'cmo', 1.15, 'ceo', 1.0, 'cfo', 1.0, 'chro', 1.0, 'coo', 1.0),
    ARRAY['healthy', 'menu', 'kids', 'parents']
);

-- Continue with PROCESS, PLACE, PROMOTION, PRICE for YUMMY FOOD PLACE...
-- Then repeat for remaining 9 elementary companies

-- ============================================
-- SUMMARY
-- ============================================
-- This seed file will ultimately contain 180 complete challenges:
-- - 60 Elementary (simple language, basic concepts)
-- - 60 Middle School (moderate complexity, business concepts)
-- - 60 High School (strategic depth, sophisticated analysis)
--
-- Each challenge includes company-specific executive pitches
-- that reference real company data and operational context.
--
-- Lens multipliers follow standard patterns:
-- PEOPLE: CEO/CHRO focus
-- PRODUCT: CTO/CMO focus
-- PROCESS: COO/CFO/CTO focus
-- PLACE: COO/CEO focus
-- PROMOTION: CMO/CEO focus
-- PRICE: CFO/CEO focus
