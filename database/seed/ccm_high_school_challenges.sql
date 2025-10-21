-- ============================================
-- CCM HIGH SCHOOL CHALLENGES - 60 Total
-- 10 Companies × 6 P Categories
-- Ages 14-18, Complex business scenarios
-- ============================================

-- Helper function for lens multipliers (create if not exists)
CREATE OR REPLACE FUNCTION get_lens_multipliers(p_cat TEXT)
RETURNS JSONB AS $$
BEGIN
    RETURN CASE p_cat
        WHEN 'people' THEN '{"ceo": 1.25, "chro": 1.30, "coo": 1.0, "cfo": 1.0, "cmo": 1.0, "cto": 1.0}'::jsonb
        WHEN 'product' THEN '{"cto": 1.30, "cmo": 1.15, "ceo": 1.0, "cfo": 1.0, "chro": 1.0, "coo": 1.0}'::jsonb
        WHEN 'process' THEN '{"coo": 1.25, "cfo": 1.20, "cto": 1.15, "ceo": 1.0, "cmo": 1.0, "chro": 1.0}'::jsonb
        WHEN 'place' THEN '{"coo": 1.25, "ceo": 1.25, "cfo": 1.0, "cmo": 1.0, "chro": 1.0, "cto": 1.0}'::jsonb
        WHEN 'promotion' THEN '{"cmo": 1.30, "ceo": 1.15, "coo": 1.0, "cfo": 1.0, "chro": 1.0, "cto": 1.0}'::jsonb
        WHEN 'price' THEN '{"cfo": 1.30, "ceo": 1.25, "coo": 1.0, "cmo": 1.0, "chro": 1.0, "cto": 1.0}'::jsonb
    END;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- QUICKSERVE GLOBAL (High School) - 6 Challenges
-- Fast food chain, 50,000 employees
-- ========================================

-- PEOPLE: Employee Turnover Crisis
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Staff Retention Emergency',
    'Annual turnover reaches 180% at store level—three times the industry average. Exit interviews reveal low wages, unpredictable scheduling, and lack of career advancement. Each departure costs $3,500 in recruiting and training. With 50,000 employees, this crisis threatens service quality and profitability.',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of QuickServe, I oversee 50,000 employees across 2,000 locations. Our people are our competitive advantage. High turnover damages service quality, brand reputation, and shareholder value. I''ll balance employee investment with financial sustainability and set the strategic direction.',
        'cfo', 'I manage QuickServe''s finances and see the direct cost of turnover—$3,500 per employee times 90,000 annual departures equals $315M annually. I can model wage increases, benefit investments, and ROI calculations. Financial analysis determines what we can afford and what drives profitability.',
        'cmo', 'I built QuickServe''s brand and understand employee satisfaction drives customer experience. Happy employees create happy customers. I can develop employer branding campaigns, employee recognition programs, and measure impact on customer satisfaction scores.',
        'cto', 'I lead our tech-enabled ordering systems and employee scheduling platforms. Technology can improve scheduling predictability, automate training, enable career pathing, and provide real-time feedback. I''ll build systems that make employees'' lives better.',
        'chro', 'As Chief HR Officer overseeing 50,000 employees, this is fundamentally my domain. I understand compensation benchmarking, benefits design, career development pathways, and retention strategies. I''ll diagnose root causes and implement comprehensive solutions.',
        'coo', 'I run operations across 2,000 locations and see turnover''s operational impact daily—understaffed shifts, service delays, quality issues. I can improve scheduling practices, create better training programs, and ensure operational changes are implementable at scale.'
    ),
    get_lens_multipliers('people'),
    ARRAY['retention', 'compensation', 'employee_satisfaction', 'talent_management']
);

-- PRODUCT: Menu Innovation vs. Simplicity
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Menu Complexity Crisis',
    'We offer 127 menu items but data shows 80% of revenue comes from just 15 items. Complex menus slow service by 40 seconds per order, increase food waste by 23%, and confuse customers. Competitors with streamlined menus have faster service and higher satisfaction. Do we simplify or innovate?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance growth ambitions with operational excellence. Menu decisions affect brand identity, market positioning, and customer perception. I''ll ensure we make strategic choices aligned with our long-term vision and competitive strategy.',
        'cfo', 'I can analyze menu profitability—food costs, labor time, waste rates, and revenue per item. I''ll model financial impact of menu changes and identify which items drive profit versus complications. This is fundamentally a financial optimization problem.',
        'cmo', 'I lead marketing and understand customer preferences deeply. Menu variety might attract customers even if they order the same items. I''ll analyze customer research, competitive positioning, and brand perception. Marketing insights should drive product decisions.',
        'cto', 'I built our ordering systems and see real-time data on order patterns, timing, and customer behavior. Technology provides insights into what customers actually want versus what we think they want. I can A/B test menu changes and measure impact precisely.',
        'chro', 'I consider how menu complexity affects employee training, stress levels, and turnover. Simpler menus reduce training time and employee overwhelm. I''ll advocate for changes that improve employee experience while maintaining quality.',
        'coo', 'I run 2,000 kitchens and see menu complexity''s operational impact daily—slower service, more mistakes, higher waste, complicated inventory. As COO, I understand what''s operationally feasible and can execute menu simplification while maintaining quality standards. This is my domain.'
    ),
    get_lens_multipliers('product'),
    ARRAY['menu_optimization', 'product_portfolio', 'customer_experience', 'efficiency']
);

-- PROCESS: Digital Order Integration
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Digital Order Chaos',
    'Orders flow from six platforms—app, website, UberEats, DoorDash, Grubhub, Postmates—creating kitchen chaos. Tickets print from multiple devices, timing is unpredictable, and 15% of orders are wrong. Integrated systems cost $2M but promise 50% fewer errors and 30% faster fulfillment.',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I see digital ordering as strategic imperative representing 35% of revenue. Process improvements enable growth. I''ll evaluate if this investment aligns with our digital transformation strategy and competitive positioning.',
        'cfo', 'I evaluate the $2M investment against projected benefits. I''ll model ROI considering error reduction, faster service, labor savings, and customer retention. I can determine payback period and compare against alternative investments. Financial rigor drives this decision.',
        'cmo', 'I worry about customer experience—errors damage brand reputation and online reviews. I''ll quantify brand impact of service improvements and assess if better digital experience drives customer acquisition and retention.',
        'cto', 'As CTO, this is my domain. I built our digital infrastructure and understand system integration complexity. I''ll evaluate vendor solutions, implementation risks, technical architecture, and long-term scalability. Technology decisions require technical expertise.',
        'chro', 'I consider impact on kitchen staff—current chaos creates stress and turnover. Better systems improve employee experience. I''ll ensure training programs support new workflows and assess whether this reduces employee frustration.',
        'coo', 'I run operations across 2,000 locations and manage kitchen workflows daily. I understand operational complexity, implementation challenges, and change management. I''ll pilot test, refine processes, and scale successfully. As COO, I know what actually works in real kitchens.'
    ),
    get_lens_multipliers('process'),
    ARRAY['digital_transformation', 'system_integration', 'operational_efficiency', 'workflow']
);

-- PLACE: Ghost Kitchen Expansion
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Ghost Kitchen Distribution Strategy',
    'Delivery orders now represent 35% of revenue, but our dine-in focused locations are inefficient for delivery-only operations. Ghost kitchens (delivery-only facilities) could reduce real estate costs by 60% and expand geographic reach, but require new logistics, brand positioning, and operational systems.',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I set long-term distribution strategy. Ghost kitchens represent a fundamental business model shift. I''ll balance growth ambitions with brand integrity, assess strategic fit, and ensure this aligns with shareholder expectations and competitive positioning.',
        'cfo', 'I can model the economics—lower rent offset by delivery commission fees. I''ll analyze capital requirements, payback periods, unit economics, and impact on overall profitability. Financial analysis determines if this expansion strategy makes economic sense.',
        'cmo', 'I''m concerned about brand perception without physical presence. We''d rely entirely on digital touchpoints and delivery experience. I''ll develop strategies to maintain brand strength in a delivery-first model and differentiate from virtual competitors.',
        'cto', 'I''ll build the technology infrastructure—order aggregation across platforms, kitchen optimization systems, delivery logistics integration. Technology enables this model and determines operational efficiency. I''ll create the digital backbone.',
        'chro', 'I need to prepare our workforce—hiring delivery-focused staff, retraining managers, creating new job categories. Ghost kitchens require different skills than traditional restaurants. I''ll build the talent strategy for this new model.',
        'coo', 'I run 2,000 locations and understand our operational DNA. As COO, I can assess ghost kitchen feasibility, optimize delivery workflows, manage supply chain complexity, and ensure quality consistency. I''ll pilot test, refine operations, and scale successfully.'
    ),
    get_lens_multipliers('place'),
    ARRAY['distribution', 'delivery', 'expansion', 'business_model']
);

-- PROMOTION: Social Media Engagement Crisis
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Social Media Relevance Decline',
    'Our social media engagement has dropped 42% over six months while competitors'' content goes viral daily. Our posts feel corporate and disconnected from Gen Z and Millennial customers. TikTok and Instagram drive significant traffic to competitors. We need an authentic, fresh digital marketing strategy.',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, our brand is our most valuable asset. Social media can amplify or damage reputation overnight. I''ll ensure our social strategy aligns with company values, resonates authentically, and supports our overall business strategy.',
        'cfo', 'I can measure ROI of social media investments and determine appropriate budgets for content creation, influencer partnerships, and paid promotion. I''ll track how social engagement translates to store visits and sales. Marketing must drive measurable results.',
        'cmo', 'I built QuickServe''s brand and lead marketing. As CMO, I understand social algorithms, content trends, and creating shareable moments. I can develop an authentic voice, partner with influencers, and create campaigns that drive engagement and traffic. This is my domain.',
        'cto', 'I provide data analytics on content performance, customer sentiment, and campaign attribution. I''ll implement social listening tools, automate content testing, and enable personalized marketing at scale. Technology turns creative ideas into measurable results.',
        'chro', 'I can assess if we have the right marketing talent and creative culture. Social media success requires different skills than traditional marketing. I''ll help recruit social-native talent, foster creativity, and empower employees as brand ambassadors.',
        'coo', 'I ensure promotional campaigns are operationally feasible. Viral success is worthless if stores can''t handle increased traffic. I''ll ensure operations can deliver on marketing promises and in-store experience matches our social media brand image.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['social_media', 'brand', 'engagement', 'digital_marketing']
);

-- PRICE: Competitive Pricing Pressure
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Price Competition Crisis',
    'A well-funded competitor opened near 200 of our stores with prices 15-20% lower. Customer traffic declined 18% at affected locations. Our current pricing assumes 28% food cost ratios, but matching competitors would squeeze margins to unsustainable levels. We need a pricing strategy that retains customers without destroying profitability.',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance short-term competitive pressures with long-term sustainability. I won''t engage in a race to the bottom that destroys shareholder value. I''ll find strategies that defend market share while maintaining QuickServe''s financial health.',
        'cfo', 'I manage our financial health and understand our cost structure intimately. As CFO, I can model pricing scenarios, identify cost reduction opportunities, and determine break-even thresholds. I''ll analyze if we can match competitors through efficiency gains rather than margin compression.',
        'cmo', 'I can shift the conversation from price to value. We may not be cheapest, but we offer superior quality, service, and experience. I''ll create marketing that justifies our premium and targets customers who value quality over price.',
        'cto', 'I can enable dynamic pricing, promotional targeting, and loyalty programs. Our ordering platform allows sophisticated pricing strategies competitors lack. I can also identify operational efficiencies that reduce costs, giving pricing flexibility.',
        'chro', 'I understand labor costs—our largest expense. I can explore scheduling optimization, productivity improvements, and training efficiencies that reduce per-unit labor costs. Small efficiency gains across 50,000 employees create significant pricing flexibility.',
        'coo', 'I run supply chain and operations. I can negotiate with suppliers, optimize portion sizes, reduce waste, and improve efficiency to lower costs without compromising quality. Operational excellence creates pricing flexibility.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'competition', 'margins', 'value']
);

-- ========================================
-- TRENDFWD FASHION (High School) - 6 Challenges
-- Fashion retail chain, 15,000 employees
-- ========================================

-- PEOPLE: Seasonal Workforce Management
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Holiday Hiring Strategy',
    'TrendFwd needs 3,000 seasonal workers for the holiday rush, but last year 40% quit before Christmas due to inadequate training and poor scheduling. Underst staffing resulted in $15M in lost sales. We must create a seasonal hiring model that ensures adequate coverage, quick ramp-up, and acceptable retention.',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of TrendFwd, holiday season represents 40% of our annual profit. Workforce readiness is a strategic priority. I''ll ensure we balance short-term staffing needs with brand reputation and long-term talent pipeline development.',
        'cfo', 'I can model the economics—recruiting costs, training investments, and revenue impact of understaffing. Last year we lost $15M in sales plus recruiting waste. I''ll determine optimal investment levels and measure ROI on seasonal workforce programs.',
        'cmo', 'I worry about customer experience during our busiest season. Poorly trained staff damage brand perception. I''ll ensure marketing campaigns align with store capacity and our seasonal employees can deliver the TrendFwd experience.',
        'cto', 'I can build technology solutions—streamlined hiring platforms, mobile training apps, automated scheduling systems, and performance tracking. Technology can accelerate onboarding and reduce management burden.',
        'chro', 'As Chief HR Officer for 15,000 employees, seasonal hiring is fundamentally my domain. I understand rapid recruiting, accelerated training, retention strategies, and workforce planning. I''ll design comprehensive solutions that ensure holiday success.',
        'coo', 'I run 400 retail locations and experience the operational chaos of inadequate seasonal staffing firsthand. I know what works in stores—training shortcuts, scheduling strategies, and manageable processes. I''ll ensure solutions are operationally practical.'
    ),
    get_lens_multipliers('people'),
    ARRAY['seasonal_workforce', 'hiring', 'training', 'retention']
);

-- PRODUCT: Fast Fashion vs. Sustainability
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Sustainable Fashion Dilemma',
    'Gen Z customers demand sustainable fashion, but our fast-fashion model releases 200 new styles monthly with 15% profit margins. Sustainable materials cost 40% more, slow production by 3 weeks, and reduce variety. Do we transform to sustainability and risk profitability, or maintain fast fashion and risk brand relevance?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I consider TrendFwd''s long-term positioning. Sustainability is both ethical imperative and business risk. I''ll evaluate if we can lead this transition, balance stakeholder expectations, and ensure strategic alignment with market trends.',
        'cfo', 'I understand the financial trade-offs—40% higher costs against potential premium pricing and customer loyalty. I''ll model scenarios, analyze competitive moves, and determine if sustainability drives profitability or destroys margins.',
        'cmo', 'I lead marketing and conduct customer research. Gen Z says they want sustainability, but do they pay for it? I''ll analyze purchase behavior versus stated preferences, identify target segments, and develop positioning that resonates.',
        'cto', 'I can leverage technology for transparency—blockchain supply chain tracking, virtual try-on reducing returns, AI optimizing inventory to reduce waste. Technology can enable sustainability while managing costs.',
        'chro', 'I consider workforce implications—sustainable sourcing requires different supplier relationships, new skills, and cultural change. I''ll assess if we have talent to execute this transformation and build change management strategies.',
        'coo', 'As COO running supply chain and operations, this is fundamentally my domain. I manage suppliers, production timelines, inventory, and logistics. I understand what''s operationally feasible, how to source sustainable materials, and execute product strategy at scale.'
    ),
    get_lens_multipliers('product'),
    ARRAY['sustainability', 'product_strategy', 'materials', 'brand_values']
);

-- PROCESS: Returns Processing Efficiency
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Returns Crisis Management',
    'Online returns hit 32% of sales—costing $180M annually in processing, restocking, and markdowns. Current process takes 8 days from customer return to resale. Competitors complete in 3 days. Streamlined processing could recover $40M annually and improve cash flow, but requires $5M technology investment.',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, high return rates signal product or sizing issues. I''ll ensure we address root causes, not just symptoms. Process improvements must align with customer experience strategy and brand positioning.',
        'cfo', 'I see $180M in annual returns costs and $5M proposed investment. As CFO, I''ll model ROI, evaluate payback periods, and determine if this is our highest priority investment. Financial discipline drives resource allocation decisions.',
        'cmo', 'I worry about customer experience—returns are customer interactions. Painful returns damage loyalty. I''ll measure impact on customer satisfaction and repeat purchase rates. Better returns experience may drive long-term value.',
        'cto', 'I built our e-commerce platform and understand returns technology. As CTO, I can evaluate automation solutions—AI-powered sorting, predictive restocking, real-time inventory updates. Technology investment requires technical evaluation and implementation planning.',
        'chro', 'I consider workforce impact—returns processing is labor-intensive and repetitive. Automation may displace workers or allow redeployment to higher-value activities. I''ll manage workforce transition and ensure adequate training.',
        'coo', 'I run operations and distribution centers where returns are processed. I see the inefficiency daily—manual sorting, delayed restocking, warehouse congestion. As COO, I understand operational bottlenecks and can implement process improvements that actually work.'
    ),
    get_lens_multipliers('process'),
    ARRAY['returns', 'efficiency', 'automation', 'cash_flow']
);

-- PLACE: Omnichannel Integration
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Store vs. Online Conflict',
    'Online sales grew to 35% of revenue, but stores and e-commerce operate as separate businesses with different inventory, pricing, and promotions. Customers want seamless omnichannel—buy online/pickup in store, same-day delivery, easy returns anywhere. Integration requires unified systems and organizational restructuring.',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I set strategic direction for TrendFwd. Channel conflict creates organizational silos and poor customer experience. Omnichannel transformation is strategic imperative, but requires breaking down internal barriers. I''ll drive organizational alignment and ensure strategic commitment.',
        'cfo', 'I evaluate financial implications—inventory allocation, cost structures, margin differences across channels. I''ll model profitability by channel and determine optimal inventory deployment. Financial analysis guides distribution strategy.',
        'cmo', 'I lead marketing and understand customers don''t see "channels"—they see TrendFwd. Inconsistent experiences damage brand. I''ll advocate for unified customer experience and develop marketing strategies that leverage both physical and digital strengths.',
        'cto', 'As CTO, I''ll build the technology infrastructure—unified inventory systems, real-time stock visibility, order management across channels. Technology enables omnichannel, but integration is complex. This requires significant technical architecture and investment.',
        'chro', 'I manage organizational implications—store and online teams currently compete. I''ll redesign incentive structures, redefine roles, and manage cultural change. Omnichannel requires organizational transformation, not just technology.',
        'coo', 'I run both stores and distribution centers. As COO, I see operational complexity—stores become fulfillment centers, inventory flows bidirectionally, picking/packing happens in retail spaces. I understand operational feasibility and can execute omnichannel at scale.'
    ),
    get_lens_multipliers('place'),
    ARRAY['omnichannel', 'distribution', 'integration', 'customer_experience']
);

-- PROMOTION: Influencer Marketing ROI
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Influencer Investment Question',
    'We spent $8M on influencer partnerships last year, but measuring actual sales impact is challenging. Some influencers drove 10x ROI, others near zero. Competitors invest 30% of marketing budgets in influencers while we allocate 15%. Should we double down on influencer strategy or shift resources to other channels?',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I demand marketing accountability. $8M investments require measurable results. I''ll ensure we make data-driven decisions about marketing allocation and don''t chase trends without ROI evidence.',
        'cfo', 'I evaluate marketing spend rigorously. I''ll improve attribution modeling, measure customer acquisition costs, and calculate lifetime value from influencer-driven customers. Financial discipline determines marketing allocation.',
        'cmo', 'I lead marketing and understand influencer landscape intimately. As CMO, I know authentic partnerships drive engagement while forced ads fail. I''ll develop influencer strategy, improve selection criteria, and measure brand impact beyond direct sales. This is my domain.',
        'cto', 'I can build attribution technology—tracking links, customer journey analytics, multi-touch attribution models. Technology improves marketing measurement and enables real-time optimization. Data-driven marketing requires technical infrastructure.',
        'chro', 'I consider if we have the right marketing talent. Influencer marketing requires different skills—relationship management, content collaboration, trend sensing. I''ll assess capability gaps and recruit digital-native marketers.',
        'coo', 'I ensure operational readiness for influencer campaigns. Viral moments can overwhelm inventory or fulfillment. I''ll ensure operations can capitalize on influencer-driven traffic spikes without stockouts or delays.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['influencer_marketing', 'marketing_roi', 'attribution', 'digital_marketing']
);

-- PRICE: Dynamic Pricing Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Dynamic Pricing Ethics',
    'AI-powered dynamic pricing could optimize revenue by adjusting prices based on demand, inventory, and customer behavior—potentially increasing margins by 8-12%. However, customers may perceive this as unfair, and "surge pricing" creates negative publicity. Do we optimize algorithmically or maintain transparent, stable pricing?',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance profitability with brand reputation. Dynamic pricing could boost margins but damage trust. I''ll evaluate strategic risks, consider competitive dynamics, and ensure pricing decisions align with TrendFwd''s values and long-term positioning.',
        'cfo', '8-12% margin improvement represents $50M+ annually. As CFO, I''ll model financial upside against potential customer backlash. I''ll determine optimal pricing strategies that maximize profitability within acceptable risk parameters. This is fundamentally financial optimization.',
        'cmo', 'I lead brand strategy and worry about customer perception. "Surge pricing" creates negative associations. I''ll conduct customer research, test messaging, and determine if sophisticated pricing can be positioned positively or will damage brand equity.',
        'cto', 'As CTO, I built our pricing systems and can implement dynamic algorithms. I''ll ensure technical infrastructure supports pricing strategies, prevents errors, and allows rapid adjustment. Technology enables sophisticated pricing if we choose to pursue it.',
        'chro', 'I consider employee implications—sales associates face customer complaints about pricing. Dynamic pricing may create workplace stress and require different training. I''ll prepare workforce for pricing changes and manage internal communication.',
        'coo', 'I run stores where pricing changes must be executed—updating systems, training staff, managing promotions. I''ll ensure operational feasibility of pricing strategies and avoid creating execution complexity that damages customer experience.'
    ),
    get_lens_multipliers('price'),
    ARRAY['dynamic_pricing', 'pricing_strategy', 'ethics', 'revenue_optimization']
);

-- ========================================
-- HORIZON TRAVEL (High School) - 6 Challenges
-- Travel agency, 8,000 employees
-- ========================================

-- PEOPLE: Travel Agent vs. AI Automation
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Human Expertise vs. AI Efficiency',
    'AI chatbots can handle 70% of booking inquiries at $2 per transaction versus $35 for human agents. However, our premium customers value personalized service, and complex itineraries require human expertise. Do we automate to cut costs or invest in high-touch service as differentiation?',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of Horizon Travel, I define our competitive strategy. Are we a technology-enabled discount service or a premium human-expertise brand? This decision shapes our entire business model and market positioning.',
        'cfo', 'I see clear cost differential—$2 versus $35 per transaction. Across 2M annual bookings, automation saves $66M annually. As CFO, I''ll model financial scenarios and determine optimal blend of automation and human service.',
        'cmo', 'I lead brand positioning and understand customer segmentation. Different customers value different things. I''ll analyze which segments demand human service and what they''ll pay for it. Marketing insights should drive service design.',
        'cto', 'As CTO, I can build sophisticated AI that handles routine requests while routing complex needs to experts. Technology can augment humans, not just replace them. I''ll design hybrid models that balance efficiency with service quality.',
        'chro', 'I oversee 8,000 employees, many of whom are travel agents facing automation. As CHRO, I''ll manage workforce transition—retraining agents for higher-value consulting roles, managing downsizing humanely, and maintaining morale through change.',
        'coo', 'I run operations and understand service delivery complexity. I''ll pilot hybrid models, measure customer satisfaction, and optimize the blend of AI and human service. Operational execution determines if this strategy actually works.'
    ),
    get_lens_multipliers('people'),
    ARRAY['automation', 'ai', 'workforce_transition', 'service_model']
);

-- PRODUCT: Sustainable Travel Packages
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Eco-Tourism vs. Traditional Packages',
    'Customers increasingly request sustainable travel options—eco-lodges, carbon offsets, responsible tourism. Sustainable packages command 25% premiums but require extensive vetting of partners and limit destination options. Do we lead in sustainable tourism or maintain broad, affordable offerings?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I consider Horizon''s brand positioning. Leading in sustainable tourism could differentiate us, but alienating budget travelers risks market share. I''ll evaluate strategic opportunities and competitive landscape.',
        'cfo', 'I analyze financial implications—25% premiums offset by higher vetting costs and limited scale. I''ll model profitability, assess market size, and determine if sustainable tourism drives financial returns.',
        'cmo', 'I understand customer motivations and market trends. As CMO, I can identify target segments, develop positioning, and determine if sustainability is authentic differentiator or marketing buzzword. This is fundamentally brand strategy.',
        'cto', 'I can build technology to verify sustainability claims—carbon calculators, partner certification tracking, transparency reporting. Technology enables trust in sustainability marketing and operational execution.',
        'chro', 'I consider if we have expertise in sustainable tourism. This requires different knowledge—environmental standards, cultural sensitivity, impact assessment. I''ll assess capability gaps and build training programs.',
        'coo', 'As COO running partnerships and operations, I''ll vet sustainable partners, negotiate contracts, and ensure service quality. I understand operational complexity of managing specialty travel products and can execute new product strategies.'
    ),
    get_lens_multipliers('product'),
    ARRAY['sustainability', 'eco_tourism', 'product_differentiation', 'responsible_travel']
);

-- PROCESS: Real-Time Disruption Management
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Travel Disruption Response System',
    'Weather, strikes, and cancellations disrupt 12% of trips. Our current manual response averages 4 hours, causing customer frustration and negative reviews. AI-powered systems could rebook automatically within minutes, but cost $3M and require deep integration with airline, hotel, and rental systems.',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, travel disruptions are our moment of truth—when customers need us most. Excellent disruption management builds loyalty. I''ll evaluate if this investment aligns with our service promise and competitive positioning.',
        'cfo', 'I assess $3M investment against benefits—reduced staffing, improved customer retention, fewer refund requests. As CFO, I''ll model ROI and determine if this is our highest priority technology investment.',
        'cmo', 'I measure customer satisfaction and online reputation. Disruption response directly impacts reviews and repeat bookings. I''ll quantify brand value of improved service and assess competitive advantage.',
        'cto', 'As CTO, this is my domain. I''ll evaluate technical feasibility—API integrations, AI reliability, system redundancy. Complex technical architecture requires deep evaluation. I understand implementation risks and ongoing maintenance requirements.',
        'chro', 'I consider workforce implications. Automation may reduce need for emergency response teams, requiring workforce transition. I''ll manage change humanely and retrain staff for proactive customer service roles.',
        'coo', 'I run operations and manage disruption response daily. I understand current process bottlenecks and customer pain points. As COO, I''ll ensure new systems integrate with existing operations and actually improve service delivery.'
    ),
    get_lens_multipliers('process'),
    ARRAY['automation', 'customer_service', 'ai', 'crisis_management']
);

-- PLACE: Direct vs. Partner Distribution
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Distribution Channel Strategy',
    'Our website generates 40% of bookings with 12% margins, while Expedia/Kayak drive 35% at 4% margins due to commission fees. Building traffic to our direct channel requires $10M annual marketing investment. Do we invest in direct channel or accept lower margins from aggregators?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, distribution strategy is critical to profitability and brand control. I''ll balance short-term revenue needs with long-term strategic positioning. Channel decisions shape our competitive future.',
        'cfo', 'I see the margin differential—12% direct versus 4% through aggregators. $10M marketing investment must drive sufficient channel shift to ROI positive. As CFO, I''ll model break-even scenarios and determine optimal channel mix.',
        'cmo', 'I lead marketing and can build direct traffic through SEO, content marketing, loyalty programs, and brand advertising. As CMO, I understand customer acquisition costs and lifetime value across channels. Marketing strategy should drive distribution decisions.',
        'cto', 'I built our booking platform and can optimize conversion rates, personalization, and user experience. Technology improvements reduce customer acquisition costs. I''ll enhance our direct channel to compete effectively with aggregators.',
        'chro', 'I consider organizational implications. Shifting to direct channel may require different skills—digital marketing, CRM, data analytics. I''ll assess talent needs and build capabilities to support channel strategy.',
        'coo', 'As COO managing partnerships, I negotiate with aggregators and understand contractual obligations. I''ll explore better commission rates, preferred placement, and partnership optimization while we build direct channel.'
    ),
    get_lens_multipliers('place'),
    ARRAY['distribution', 'channel_strategy', 'margins', 'direct_booking']
);

-- PROMOTION: Influencer Travel Partnerships
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Travel Influencer Content Strategy',
    'Travel influencers generate aspirational content reaching millions. We could sponsor 50 micro-influencers for $500K or 5 mega-influencers for the same cost. Micro-influencers offer authentic engagement; mega-influencers provide massive reach. Which strategy drives actual bookings versus just brand awareness?',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want marketing that drives measurable business results, not just social media vanity metrics. I''ll ensure influencer strategy aligns with business objectives and customer acquisition goals.',
        'cfo', 'I demand marketing accountability. I''ll measure cost per booking acquisition across influencer types and calculate ROI. As CFO, financial analysis determines marketing allocation across channels and influencer tiers.',
        'cmo', 'I lead marketing and understand influencer landscape intimately. As CMO, I know micro-influencers drive engagement while mega-influencers build awareness. I''ll develop strategy that balances reach and conversion, measuring both brand lift and bookings.',
        'cto', 'I provide attribution technology—tracking codes, landing page analytics, conversion measurement. Technology enables precise influencer ROI measurement. Data infrastructure is critical to marketing optimization.',
        'chro', 'I assess if we have influencer marketing expertise in-house. This requires relationship management, content collaboration, and contract negotiation skills. I''ll identify capability gaps and recruit specialized talent.',
        'coo', 'I ensure operational readiness for influencer campaigns. Viral content can spike demand unexpectedly. I''ll ensure we can handle increased booking volume without service degradation.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['influencer_marketing', 'social_media', 'marketing_strategy', 'brand_awareness']
);

-- PRICE: Dynamic Pricing for Tours
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Yield Management Implementation',
    'Airlines use dynamic pricing to optimize revenue, but travel packages have traditionally been fixed-price. Dynamic pricing could increase revenue by 15-20% by adjusting for demand, seasonality, and booking timing. However, customers may perceive price fluctuations as unfair or confusing.',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance revenue optimization with customer trust. Dynamic pricing could boost profitability significantly, but pricing transparency builds long-term loyalty. I''ll evaluate strategic trade-offs.',
        'cfo', '15-20% revenue increase represents $30M+ annually. As CFO, I''ll model financial upside, assess implementation costs, and determine optimal pricing strategies that maximize profitability within acceptable parameters.',
        'cmo', 'I worry about customer perception and competitive positioning. I''ll test messaging strategies, conduct customer research, and determine if dynamic pricing can be positioned positively or damages brand equity.',
        'cto', 'As CTO, I can implement sophisticated pricing algorithms that optimize revenue while maintaining customer experience. I''ll build systems that enable flexible pricing strategies with appropriate guardrails.',
        'chro', 'I consider employee implications—sales agents must explain price variations to customers. Dynamic pricing creates customer service complexity. I''ll prepare workforce through training and communication.',
        'coo', 'I run operations where pricing strategies are executed. I''ll ensure systems can handle dynamic pricing without creating operational chaos or customer confusion. Execution feasibility determines success.'
    ),
    get_lens_multipliers('price'),
    ARRAY['dynamic_pricing', 'yield_management', 'revenue_optimization', 'pricing_strategy']
);

-- ========================================
-- SKYCONNECT AIRLINES (High School) - 6 Challenges
-- Major airline, 25,000 employees
-- ========================================

-- PEOPLE: Pilot Shortage Crisis
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pilot Recruitment Emergency',
    'The aviation industry faces a critical pilot shortage. SkyConnect needs 500 new pilots over 3 years but training takes 2+ years and costs $150K per pilot. Competitors offer signing bonuses up to $50K. We must develop a comprehensive pilot pipeline strategy or cancel routes due to staffing shortages.',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of SkyConnect with 25,000 employees, pilot shortage threatens our growth strategy. This is existential—without pilots, we can''t fly. I''ll evaluate strategic options including training partnerships, acquisitions, and schedule optimization.',
        'cfo', 'I model the economics—$150K training investment plus $50K signing bonuses times 500 pilots equals $100M investment. As CFO, I''ll determine optimal investment levels, compare build versus buy strategies, and assess ROI on pilot development programs.',
        'cmo', 'I can build employer brand targeting aspiring pilots. Marketing isn''t just for customers—it attracts talent. I''ll develop recruitment campaigns highlighting SkyConnect''s culture, career paths, and competitive advantages.',
        'cto', 'I can leverage flight simulators, VR training, and AI-assisted learning to accelerate pilot development and reduce costs. Technology can improve training efficiency and assessment accuracy.',
        'chro', 'As Chief HR Officer, pilot recruitment and retention is fundamentally my domain. I understand aviation talent markets, training partnerships with flight schools, retention strategies, and workforce planning. I''ll develop comprehensive solutions.',
        'coo', 'I run flight operations and understand pilot scheduling, route planning, and operational requirements. I can optimize schedules to reduce pilot needs, improve work-life balance, and ensure we maintain safe operations.'
    ),
    get_lens_multipliers('people'),
    ARRAY['pilot_shortage', 'talent_acquisition', 'training', 'workforce_planning']
);

-- PRODUCT: Premium vs. Economy Service
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Service Class Optimization',
    'First class generates 12% margins on 20% of revenue, while economy generates 3% margins on 80% of revenue. We could eliminate first class and increase economy seats by 15%, boosting capacity. Or we could enhance premium offerings and target high-value travelers. Which strategy maximizes long-term profitability?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, this decision shapes SkyConnect''s competitive positioning—are we a premium carrier or volume player? I''ll evaluate strategic implications, competitive landscape, and alignment with brand vision.',
        'cfo', 'I analyze profitability across segments. First class drives disproportionate profits despite lower volume. As CFO, I''ll model scenarios—premium enhancement, economy optimization, or hybrid approaches. Financial analysis drives strategic decisions.',
        'cmo', 'I understand customer segmentation and brand perception. As CMO, I know business travelers value premium service while leisure travelers prioritize price. I''ll analyze customer lifetime value and competitive positioning across segments.',
        'cto', 'I manage booking systems, pricing algorithms, and customer data. Technology enables sophisticated revenue management and personalized service. I''ll provide data analytics to inform product strategy.',
        'chro', 'I consider workforce implications. Premium service requires highly trained flight attendants. Economy focus needs efficiency optimization. I''ll assess training requirements and service delivery capabilities.',
        'coo', 'As COO running flight operations, I understand aircraft configuration trade-offs, service delivery complexity, and operational costs across cabins. I manage fleet decisions and can execute product strategy efficiently.'
    ),
    get_lens_multipliers('product'),
    ARRAY['service_strategy', 'customer_segmentation', 'premium_economy', 'product_mix']
);

-- PROCESS: Turnaround Time Optimization
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Aircraft Turnaround Efficiency',
    'Our average turnaround time is 45 minutes versus competitors'' 35 minutes. Faster turnarounds enable an additional flight per aircraft daily—potentially adding $200M annual revenue. Achieving this requires coordinated improvements across cleaning, fueling, catering, baggage, and boarding processes.',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, operational efficiency directly impacts profitability and growth. $200M revenue opportunity is significant. I''ll ensure we pursue this strategically without compromising safety or service quality.',
        'cfo', 'I see clear financial upside—$200M revenue with modest cost increases. As CFO, I''ll model investment requirements, incremental costs, and net profitability impact. I''ll determine optimal investment in turnaround optimization.',
        'cmo', 'I worry about customer experience—rushed boarding creates stress and complaints. I''ll measure satisfaction impact and ensure process improvements don''t damage brand perception.',
        'cto', 'I can leverage technology—automated baggage systems, digital boarding, predictive maintenance scheduling, real-time coordination platforms. As CTO, technology enables process optimization and real-time visibility.',
        'chro', 'I manage ground crews, flight attendants, and maintenance teams. Process improvements require training, change management, and potentially different staffing models. I''ll prepare workforce for new processes.',
        'coo', 'As COO running airline operations, turnaround time optimization is fundamentally my domain. I manage all turnaround processes—cleaning, fueling, catering, baggage, boarding. I understand bottlenecks and can orchestrate cross-functional improvements.'
    ),
    get_lens_multipliers('process'),
    ARRAY['operational_efficiency', 'turnaround_time', 'process_improvement', 'productivity']
);

-- PLACE: Hub vs. Point-to-Point Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Network Architecture Transformation',
    'Our hub-and-spoke model requires connections through 3 major hubs, causing delays and customer frustration. Point-to-point service on popular routes could reduce travel time by 2 hours and improve satisfaction. However, hub systems enable broader network reach and operational efficiency. Which model best serves our strategy?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, network architecture is fundamental strategic choice that shapes competitive positioning. Hub systems offer scale; point-to-point offers simplicity. I''ll evaluate what aligns with SkyConnect''s long-term vision and market opportunities.',
        'cfo', 'I analyze economics of each model. Hubs enable aircraft utilization and network breadth but add complexity. As CFO, I''ll model profitability across network designs, considering load factors, pricing power, and cost structures.',
        'cmo', 'I understand customer preferences—business travelers value direct flights and time savings; leisure travelers prioritize price and destination options. I''ll analyze customer segmentation and competitive positioning.',
        'cto', 'I manage scheduling systems, yield management, and network optimization algorithms. Technology enables sophisticated network design. I''ll provide data analytics on route performance and network efficiency.',
        'chro', 'I consider workforce implications. Hub operations concentrate employees; point-to-point distributes them. Different models require different staffing, training, and labor relations approaches.',
        'coo', 'As COO running operations, network design is fundamentally my domain. I manage fleet allocation, scheduling, gate operations, and maintenance logistics. I understand operational trade-offs and can execute network strategies effectively.'
    ),
    get_lens_multipliers('place'),
    ARRAY['network_design', 'hub_spoke', 'point_to_point', 'route_strategy']
);

-- PROMOTION: Loyalty Program Redesign
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Frequent Flyer Program Overhaul',
    'Our loyalty program has 5M members but engagement is declining. Members complain about blackout dates, devalued points, and limited redemption options. Competitors offer dynamic pricing and broader redemption networks. We need to redesign our program to drive loyalty while managing liability of 100B outstanding points.',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, loyalty programs drive repeat business and customer lifetime value. However, 100B outstanding points represent significant liability. I''ll balance customer satisfaction with financial prudence and strategic objectives.',
        'cfo', 'I manage the financial liability of loyalty programs—100B points represent $1B+ obligation. As CFO, I''ll redesign program economics, manage breakage rates, and ensure program generates positive ROI while controlling costs.',
        'cmo', 'I lead customer loyalty strategy and understand competitive landscape. As CMO, I know successful programs drive emotional connection and behavioral change. I''ll redesign program benefits, communication strategy, and redemption options to drive engagement.',
        'cto', 'I built our loyalty platform and can enable dynamic redemption, personalized offers, and real-time rewards. Technology transforms static programs into dynamic engagement engines. As CTO, I''ll build technical infrastructure for modern loyalty.',
        'chro', 'I consider employee participation in loyalty programs—employee engagement drives customer experience. I''ll ensure employees understand and advocate for our loyalty program benefits.',
        'coo', 'I ensure operational execution of loyalty benefits—priority boarding, seat upgrades, lounge access. I''ll ensure operations can deliver promised benefits consistently without disrupting processes.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['loyalty_program', 'customer_retention', 'rewards', 'engagement']
);

-- PRICE: Unbundled Pricing Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'A La Carte Pricing Controversy',
    'We could unbundle services—charging separately for seat selection, carry-ons, early boarding, and refreshments. This allows ultra-low base fares attracting price-sensitive customers while premium customers pay for desired services. However, customers hate "nickel-and-diming" and this may damage brand perception.',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, pricing strategy shapes brand positioning. Are we a budget carrier or full-service airline? Unbundling shifts us toward ultra-low-cost model. I''ll evaluate strategic implications and competitive positioning carefully.',
        'cfo', 'I analyze revenue potential—unbundling can increase revenue per passenger by 15-20% while advertising lower base fares. As CFO, I''ll model financial scenarios, assess competitive dynamics, and determine optimal pricing architecture.',
        'cmo', 'I manage brand perception and customer satisfaction. Unbundling is controversial—customers say they hate it yet choose airlines that use it. I''ll conduct research, test messaging, and determine impact on brand equity.',
        'cto', 'I manage booking systems and must implement complex pricing logic, clear communication, and seamless purchase flows. As CTO, I''ll ensure technology enables transparent unbundled pricing without creating confusion.',
        'chro', 'I consider employee implications—flight attendants enforce carry-on policies and face customer complaints. Unbundling creates front-line stress. I''ll prepare workforce and develop customer service protocols.',
        'coo', 'As COO, I ensure operational execution of pricing policies—enforcing bag limits, managing boarding groups, delivering paid services. Operations must deliver on pricing promises consistently.'
    ),
    get_lens_multipliers('price'),
    ARRAY['unbundled_pricing', 'revenue_management', 'pricing_strategy', 'customer_experience']
);

-- ========================================
-- GREENGRID ENERGY (High School) - 6 Challenges
-- Clean energy company, 4,000 employees
-- ========================================

-- PEOPLE: Clean Energy Workforce Transition
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Fossil Fuel Worker Retraining',
    'As we transition to renewable energy, 800 workers from our coal operations face job displacement. Retraining for solar/wind requires 6-18 months and costs $25K per worker. Do we invest $20M in comprehensive retraining or offer severance packages? This decision impacts communities and our social license to operate.',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of GreenGrid, our clean energy transition must be just and equitable. How we treat displaced workers shapes our reputation, stakeholder trust, and ability to operate. I''ll balance financial realities with social responsibility.',
        'cfo', 'I evaluate $20M retraining investment versus severance costs and reputational risk. As CFO, I''ll model financial scenarios, tax incentives for retraining, and long-term talent availability in renewable markets.',
        'cmo', 'I manage GreenGrid''s brand and social license. How we treat workers during transition affects customer perception, regulatory relations, and recruitment. Responsible transition builds brand value; layoffs create backlash.',
        'cto', 'I understand technical skill gaps between fossil and renewable energy. I can identify transferable skills, develop training curricula, and leverage technology for accelerated learning. Technical assessment guides retraining feasibility.',
        'chro', 'As CHRO overseeing 4,000 employees, workforce transition is fundamentally my domain. I understand retraining programs, change management, union relations, and community impact. I''ll develop humane, comprehensive solutions.',
        'coo', 'I run operations and need skilled renewable energy workers. Retraining our existing workforce preserves institutional knowledge and fills critical talent gaps. I''ll ensure retraining produces operationally competent employees.'
    ),
    get_lens_multipliers('people'),
    ARRAY['workforce_transition', 'retraining', 'clean_energy', 'social_responsibility']
);

-- PRODUCT: Energy Storage Innovation
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Battery Storage Investment',
    'Solar and wind are intermittent—the sun doesn''t always shine and wind doesn''t always blow. Large-scale battery storage enables 24/7 renewable power but costs $400M for grid-scale installation. Do we invest in storage to offer reliable renewable energy, or continue supplementing with natural gas?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, energy storage is strategic imperative for competitive renewable energy. $400M investment reshapes our product offering and market positioning. I''ll evaluate strategic fit, competitive dynamics, and stakeholder expectations.',
        'cfo', 'I assess $400M investment against revenue potential, financing options, and risk. As CFO, I''ll model financial returns, evaluate government incentives, compare build versus partner options, and determine optimal capital structure.',
        'cmo', 'I position GreenGrid''s value proposition. As CMO, reliable 24/7 renewable energy is powerful marketing message. I''ll assess customer willingness to pay premium for storage-backed clean energy and develop compelling positioning.',
        'cto', 'As CTO, I evaluate battery technologies—lithium-ion, flow batteries, emerging solutions. I understand technical specifications, grid integration complexity, and operational performance. Technology assessment requires deep technical expertise.',
        'chro', 'I consider workforce implications—battery storage requires new technical skills. I''ll assess talent availability, training requirements, and safety protocols for large-scale energy storage operations.',
        'coo', 'I run energy operations and understand grid management, reliability requirements, and operational complexity. As COO, I''ll evaluate storage integration, maintenance requirements, and operational feasibility of 24/7 renewable supply.'
    ),
    get_lens_multipliers('product'),
    ARRAY['energy_storage', 'batteries', 'renewable_energy', 'innovation']
);

-- PROCESS: Smart Grid Implementation
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Grid Modernization Initiative',
    'Our aging grid infrastructure causes 8% energy loss and limited renewable integration. Smart grid technology—IoT sensors, AI optimization, real-time monitoring—reduces loss to 3% and enables distributed renewable energy. Investment: $150M over 3 years. Benefits: efficiency gains and renewable expansion.',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, grid modernization enables our renewable energy strategy and future growth. $150M is significant capital commitment. I''ll evaluate strategic imperative, competitive necessity, and long-term positioning.',
        'cfo', 'I model economics—5% efficiency gain across our operations represents $80M annually. As CFO, I''ll analyze ROI, financing options, payback period, and compare against alternative investments.',
        'cmo', 'I consider customer communication—outages during installation, rate impacts, long-term benefits. I''ll develop messaging that maintains customer support during grid modernization.',
        'cto', 'As CTO, smart grid is fundamentally technology transformation. I understand IoT architecture, cybersecurity requirements, data analytics, and system integration. This requires significant technical leadership and execution.',
        'chro', 'I prepare workforce for technology transition—upskilling technicians, hiring data scientists, managing organizational change. Smart grid requires different capabilities than traditional energy infrastructure.',
        'coo', 'I run grid operations daily and see inefficiency costs. As COO, I''ll manage implementation while maintaining reliability, coordinate across systems, and ensure successful execution of grid modernization.'
    ),
    get_lens_multipliers('process'),
    ARRAY['smart_grid', 'grid_modernization', 'iot', 'efficiency']
);

-- PLACE: Distributed vs. Centralized Generation
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Rooftop Solar Distribution Strategy',
    'Traditional model: large centralized power plants distributing electricity. Emerging model: distributed rooftop solar with battery storage, reducing grid dependence. Do we fight rooftop solar to protect our distribution business, or embrace it by offering solar-plus-storage packages?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, distributed generation disrupts our traditional business model. I can resist change and decline, or adapt and lead transformation. This strategic choice determines GreenGrid''s future viability.',
        'cfo', 'I analyze economics—distributed solar reduces transmission revenue but creates new service opportunities. As CFO, I''ll model business model transformation, assess stranded assets, and determine optimal strategic response.',
        'cmo', 'I understand customer motivations—energy independence, sustainability, cost savings. As CMO, I can position GreenGrid as partner in distributed energy, not obstacle. Brand positioning determines our role in energy future.',
        'cto', 'I can build technology platforms—virtual power plants, peer-to-peer energy trading, grid balancing services. As CTO, technology enables new business models in distributed energy landscape.',
        'chro', 'I consider workforce implications—shift from centralized operations to distributed services requires different skills. I''ll manage workforce transition from traditional utility model to distributed energy services.',
        'coo', 'As COO, I manage both centralized generation and distribution infrastructure. I understand operational complexity of integrating distributed resources while maintaining grid reliability. Execution determines success.'
    ),
    get_lens_multipliers('place'),
    ARRAY['distributed_energy', 'rooftop_solar', 'business_model', 'disruption']
);

-- PROMOTION: Clean Energy Messaging
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Sustainability Marketing Strategy',
    'Customers say they want clean energy, but only 15% voluntarily pay the 8% green energy premium. We could launch aggressive marketing campaign highlighting environmental impact, or focus on cost parity messaging. How do we drive clean energy adoption—appeal to values or economic self-interest?',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want clean energy adoption at scale, not just green marketing. I''ll ensure messaging drives behavior change and aligns with business objectives, not just positive brand perception.',
        'cfo', 'I measure marketing ROI—conversion rates, customer acquisition costs, lifetime value. As CFO, I''ll determine optimal marketing investment and measure financial returns of different messaging strategies.',
        'cmo', 'I lead marketing strategy and understand customer psychology. As CMO, I know emotional appeals build brand affinity while economic appeals drive immediate action. I''ll develop messaging that resonates and converts.',
        'cto', 'I provide data on customer behavior—usage patterns, price sensitivity, engagement metrics. Technology enables personalized messaging and precise measurement of campaign effectiveness.',
        'chro', 'I ensure employees can authentically represent our sustainability message. Employee advocacy is powerful marketing. I''ll develop programs that engage employees as clean energy ambassadors.',
        'coo', 'I ensure operational delivery matches marketing promises. I''ll verify our clean energy claims are accurate, verify renewable sources, and prevent greenwashing that damages credibility.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['sustainability_marketing', 'clean_energy', 'messaging', 'customer_adoption']
);

-- PRICE: Time-of-Use Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Dynamic Energy Pricing Implementation',
    'Electricity costs vary dramatically by time—expensive during peak demand, cheap during off-peak. Time-of-use pricing could reduce peak demand by 20%, avoiding $100M in infrastructure investment. However, customers resist complex pricing and may see it as unfair. Should we implement dynamic pricing?',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, time-of-use pricing aligns customer behavior with grid realities and avoids massive infrastructure investment. I''ll balance economic efficiency with customer acceptance and regulatory approval.',
        'cfo', 'I see $100M infrastructure savings plus improved capacity utilization. As CFO, I''ll model financial benefits, assess implementation costs, and evaluate customer adoption scenarios. Economics strongly favor dynamic pricing.',
        'cmo', 'I worry about customer backlash and complexity. As CMO, I must educate customers, demonstrate savings opportunities, and position time-of-use pricing positively. Customer communication determines success or failure.',
        'cto', 'I built smart meter infrastructure that enables dynamic pricing. As CTO, I can provide real-time pricing data, usage analytics, and customer-facing tools. Technology makes complex pricing comprehensible.',
        'chro', 'I prepare customer service teams for pricing complexity—explaining bills, handling complaints, supporting customers. Dynamic pricing creates customer service challenges requiring training and support.',
        'coo', 'As COO, I understand grid operations and peak demand challenges. Time-of-use pricing improves grid efficiency and reliability. I''ll manage implementation and ensure billing systems work correctly.'
    ),
    get_lens_multipliers('price'),
    ARRAY['dynamic_pricing', 'time_of_use', 'demand_management', 'infrastructure']
);

-- ========================================
-- CLOUDPEAK SOFTWARE (High School) - 6 Challenges
-- Cloud software company, 3,000 employees
-- ========================================

-- PEOPLE: Remote Work Culture
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Return-to-Office Mandate',
    'CloudPeak has been fully remote since the pandemic, enabling nationwide talent recruitment and $15M annual real estate savings. However, collaboration suffers—innovation declined 25%, onboarding takes longer, and culture feels fragmented. Should we require office return, stay remote, or implement hybrid model?',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of CloudPeak with 3,000 employees, workplace model shapes our culture, innovation, and competitive positioning. I''ll balance employee preferences with business needs and long-term success requirements.',
        'cfo', 'I quantify trade-offs—$15M real estate savings versus productivity impacts and potential turnover costs. As CFO, I''ll model financial scenarios across workplace models and determine optimal approach.',
        'cmo', 'I consider employer brand and talent attraction. CloudPeak''s remote-first policy attracted top talent nationwide. Mandate could trigger resignations and recruitment challenges. I''ll assess talent market implications.',
        'cto', 'As CTO of a software company, I understand that great software requires deep collaboration and knowledge sharing. I can build better collaboration tools, but technology can''t fully replace in-person interaction for innovation.',
        'chro', 'As CHRO, workplace policy is fundamentally my domain. I understand employee preferences, productivity research, legal considerations, and change management. I''ll develop evidence-based workplace strategies that balance needs.',
        'coo', 'I run operations and see collaboration challenges firsthand. I can implement hybrid models, design office spaces for collaboration, and measure productivity. Operational execution determines if workplace policies actually work.'
    ),
    get_lens_multipliers('people'),
    ARRAY['remote_work', 'workplace_policy', 'collaboration', 'culture']
);

-- PRODUCT: AI Feature Integration
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'AI-Powered Product Features',
    'Every competitor is embedding AI into their products. Customers expect intelligent automation, predictive analytics, and AI assistants. We could invest $50M to integrate AI across our platform, potentially increasing customer value significantly. Or is this AI hype that distracts from core product excellence?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, AI represents potential transformation or expensive distraction. I''ll evaluate if AI creates genuine customer value for CloudPeak or is feature theater. Strategic clarity prevents wasted investment.',
        'cfo', 'I assess $50M AI investment against customer willingness to pay and retention impact. As CFO, I''ll demand clear ROI models, not vague "innovation" justifications. Financial discipline guides technology investment.',
        'cmo', 'I understand customer needs and competitive positioning. As CMO, I know customers expect AI, but what specific problems does it solve? I''ll ensure we build AI features that address real customer pain points, not just check marketing boxes.',
        'cto', 'As CTO, AI integration is fundamentally my domain. I evaluate AI technologies, assess build versus buy options, understand data requirements and technical architecture. I''ll determine what''s technically feasible and how to execute.',
        'chro', 'I consider talent implications—AI requires specialized skills. I''ll assess whether we can hire ML engineers in competitive talent market and develop team capabilities to support AI roadmap.',
        'coo', 'I ensure AI features are operationally supportable—model training, monitoring, maintenance, customer support for AI-generated outputs. Operational feasibility determines long-term success.'
    ),
    get_lens_multipliers('product'),
    ARRAY['ai', 'product_features', 'innovation', 'machine_learning']
);

-- PROCESS: Development Velocity vs. Quality
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Agile Transformation Crisis',
    'We ship new features every 2 weeks, but bug rates increased 40% and technical debt accumulated. Customers complain about instability. Should we slow release velocity to improve quality and reduce technical debt, or maintain rapid shipping that keeps us competitive?',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance speed-to-market with product quality. Short-term velocity versus long-term sustainability. I''ll ensure we make strategic decisions about quality standards that align with brand promise.',
        'cfo', 'I quantify costs—customer churn from quality issues, engineering time on bug fixes versus new features, technical debt interest. As CFO, I''ll model financial impact of quality investments.',
        'cmo', 'I measure customer satisfaction and market perception. Quality issues damage brand and create churn. As CMO, I''ll quantify brand impact and customer lifetime value implications of quality decisions.',
        'cto', 'As CTO overseeing engineering, this is fundamentally my domain. I understand technical debt, testing practices, and sustainable development. I''ll implement quality practices that enable both velocity and reliability.',
        'chro', 'I consider developer burnout and retention. Constant firefighting and quality pressure causes turnover. I''ll assess team health and advocate for sustainable pace that retains talent.',
        'coo', 'I run operations and support customers experiencing quality issues. I see direct impact of buggy software on customer satisfaction and support costs. Quality directly affects operational effectiveness.'
    ),
    get_lens_multipliers('process'),
    ARRAY['development_velocity', 'technical_debt', 'quality', 'agile']
);

-- PLACE: Direct Sales vs. Marketplace
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'AWS Marketplace Distribution',
    'AWS Marketplace reaches millions of cloud customers but takes 25% commission. Our direct sales generate higher margins but require $20M sales team. Marketplace offers instant distribution; direct sales offers customer relationships. Which channel strategy drives profitable growth?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, distribution strategy shapes growth trajectory and customer relationships. I''ll evaluate channel economics, competitive positioning, and long-term strategic control.',
        'cfo', 'I compare economics—75% of marketplace revenue versus higher direct margins minus $20M sales costs. As CFO, I''ll model customer acquisition costs, lifetime value, and optimal channel mix.',
        'cmo', 'I lead go-to-market strategy and understand buyer behavior. As CMO, I know enterprise customers expect sales relationships while SMBs prefer self-service. Customer segmentation should drive channel strategy.',
        'cto', 'I manage technical integrations with marketplace platforms and our direct infrastructure. As CTO, I understand technical requirements and limitations of each channel. Technology enables multi-channel strategy.',
        'chro', 'I consider workforce implications—marketplace reduces need for large sales team, requiring different organizational structure. I''ll manage potential workforce transitions and capability development.',
        'coo', 'As COO, I ensure operational execution across channels—order fulfillment, customer onboarding, support delivery. I''ll optimize operations to support multi-channel distribution effectively.'
    ),
    get_lens_multipliers('place'),
    ARRAY['distribution', 'marketplace', 'direct_sales', 'channels']
);

-- PROMOTION: Developer Community Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Open Source Community Building',
    'Successful developer tools build thriving communities—Stack Overflow discussions, GitHub projects, conference talks. We could invest $5M in community programs—hackathons, grants, documentation—to build grassroots adoption. But measuring community investment ROI is notoriously difficult.',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, developer communities create sustainable competitive advantages and organic growth. I''ll evaluate if community investment aligns with our growth strategy and long-term positioning.',
        'cfo', 'I demand measurable returns on $5M investment. As CFO, I''ll establish metrics—developer adoption, conversion rates, customer acquisition costs—to evaluate community program effectiveness.',
        'cmo', 'I lead developer marketing and understand community dynamics. As CMO, authentic community engagement builds brand loyalty that paid advertising can''t buy. I''ll develop programs that genuinely serve developers.',
        'cto', 'As CTO, I can contribute to community—open sourcing tools, contributing to standards, engaging technically. Technical leadership builds credibility. I''ll determine what technical contributions create community value.',
        'chro', 'I ensure employees can participate in community activities—speaking, contributing, answering questions. Developer advocacy requires dedicated roles. I''ll build programs that enable authentic community engagement.',
        'coo', 'I ensure operational support for community programs—event logistics, grants administration, platform maintenance. Effective community programs require operational excellence.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['developer_community', 'open_source', 'developer_marketing', 'community_building']
);

-- PRICE: Freemium vs. Premium Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Free Tier Strategy Redesign',
    'Our generous free tier drives adoption—2M free users but only 3% convert to paid plans. We could restrict free tier to force upgrades, potentially increasing conversions to 8% but losing 60% of free users. Does free tier generate enough brand awareness and viral growth to justify low conversion?',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, freemium strategy shapes growth trajectory and market positioning. I''ll evaluate if free tier drives flywheel effects or subsidizes non-customers. Strategic clarity guides pricing architecture.',
        'cfo', 'I model economics—current 3% conversion versus potential 8% conversion with 60% user loss. As CFO, I''ll analyze customer lifetime value, viral coefficients, and optimal freemium balance.',
        'cmo', 'I understand free users create brand awareness, word-of-mouth, and ecosystem value beyond direct conversion. As CMO, I''ll quantify brand value and viral growth from free tier.',
        'cto', 'I analyze usage data—what features do free users actually use? As CTO, data reveals optimal feature gating that maximizes conversion without killing viral growth. Analytics guide pricing decisions.',
        'chro', 'I consider support costs—free users generate support tickets without revenue. I''ll assess if self-service resources can reduce free tier support burden.',
        'coo', 'As COO, I manage infrastructure costs for 2M free users. I''ll optimize operations to reduce free tier costs while maintaining experience that drives conversion.'
    ),
    get_lens_multipliers('price'),
    ARRAY['freemium', 'pricing_strategy', 'conversion', 'monetization']
);

-- ========================================
-- MEDICORE HEALTH (High School) - 6 Challenges
-- Healthcare provider, 5,000 employees
-- ========================================

-- PEOPLE: Healthcare Worker Burnout
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Nursing Staff Retention Crisis',
    'Post-pandemic nursing turnover hit 30% annually, creating dangerous staffing shortages and $40M in recruiting costs. Nurses report exhaustion, moral injury, and feeling undervalued. We need comprehensive solutions—better ratios, mental health support, competitive pay—but healthcare margins are thin. How do we retain caregivers?',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of MediCore with 5,000 employees, our nurses are our most valuable asset. Patient care depends on nursing excellence. I''ll balance financial constraints with moral imperative to support our caregiving teams.',
        'cfo', 'I see $40M annual recruiting costs plus overtime premiums from understaffing. As CFO, I''ll model ROI of retention investments against ongoing turnover costs. Better retention may actually reduce costs while improving care.',
        'cmo', 'I manage MediCore''s reputation. Nursing shortage affects patient experience and online reviews. Our employment brand impacts recruitment. I''ll develop messaging that demonstrates our commitment to healthcare workers.',
        'cto', 'I can build technology to reduce administrative burden—automated charting, AI documentation, smart scheduling. Technology can give nurses more time for patient care, reducing burnout causes.',
        'chro', 'As CHRO in healthcare, nursing retention is fundamentally my domain. I understand burnout causes, staffing models, competitive compensation, mental health support, and retention strategies. I''ll develop comprehensive evidence-based solutions.',
        'coo', 'I run clinical operations and see understaffing impact daily—patient safety risks, care quality decline, remaining staff burnout. I''ll implement operational changes that improve nurse working conditions while maintaining care standards.'
    ),
    get_lens_multipliers('people'),
    ARRAY['healthcare_workers', 'burnout', 'retention', 'nursing']
);

-- PRODUCT: Telehealth Services
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Virtual Care Expansion Strategy',
    'Telehealth adoption surged during pandemic then plateaued at 25% of visits. We could invest $30M in comprehensive virtual care platform—chronic disease monitoring, mental health services, urgent care. This expands access but may cannibalize profitable in-person visits. How do we balance virtual and physical care?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, telehealth represents healthcare''s future and potential business model disruption. I''ll evaluate strategic positioning—lead virtual care transformation or protect traditional model. This shapes MediCore''s competitive future.',
        'cfo', 'I assess $30M investment against revenue potential and margin impacts. Telehealth visits generate 40% less revenue than in-person. As CFO, I''ll model financial scenarios and determine if telehealth drives growth or erodes profitability.',
        'cmo', 'I understand patient preferences—convenience versus in-person trust. As CMO, I''ll segment patients, identify who values virtual care, and develop positioning that differentiates MediCore''s telehealth offerings.',
        'cto', 'As CTO, telehealth platform is fundamentally my domain. I understand video infrastructure, EHR integration, security requirements, and clinical workflow design. Technology quality determines clinical effectiveness and adoption.',
        'chro', 'I consider workforce implications—telehealth requires different skills and may change staffing models. I''ll assess training needs, licensure requirements, and organizational changes needed for virtual care delivery.',
        'coo', 'I run clinical operations and must integrate telehealth into care delivery. As COO, I''ll ensure quality standards, determine appropriate use cases, manage clinician scheduling across virtual and physical, and maintain care excellence.'
    ),
    get_lens_multipliers('product'),
    ARRAY['telehealth', 'virtual_care', 'healthcare_delivery', 'digital_health']
);

-- PROCESS: Electronic Health Records Optimization
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'EHR System Overhaul',
    'Our electronic health records system is outdated—clinicians spend 50% of patient time on documentation, and systems don''t interoperate with other providers. Modern EHR costs $80M over 5 years but promises 30% documentation time savings and better care coordination. Do we invest in digital infrastructure?',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, EHR is critical infrastructure for modern healthcare. $80M is substantial investment, but suboptimal systems harm clinicians and patients. I''ll evaluate strategic necessity and long-term competitiveness.',
        'cfo', 'I assess $80M investment against efficiency gains and competitive necessity. 30% documentation savings represents significant clinician time value. As CFO, I''ll model ROI, financing options, and compare costs of maintaining outdated systems.',
        'cmo', 'I consider patient experience—seamless records, care coordination, reduced redundant tests. Modern EHR improves care quality and patient satisfaction, affecting reputation and patient retention.',
        'cto', 'As CTO, EHR selection and implementation is fundamentally my domain. I evaluate vendors, understand integration requirements, assess security and compliance, and manage implementation risks. This is complex technical transformation.',
        'chro', 'I prepare clinicians for EHR transition—training requirements, productivity dips during implementation, change management. Major system changes affect all employees. I''ll manage workforce through transformation.',
        'coo', 'I run clinical operations and see EHR limitations daily. As COO, I''ll ensure new system improves workflows, maintain care delivery during transition, and optimize clinical processes around modern technology.'
    ),
    get_lens_multipliers('process'),
    ARRAY['ehr', 'health_records', 'digital_transformation', 'clinical_systems']
);

-- PLACE: Urgent Care Clinic Expansion
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Retail Clinic Distribution Strategy',
    'Patients want convenient access—urgent care clinics in retail locations capture market share from emergency departments. We could open 50 retail clinics for $75M, reaching underserved areas and offering convenience. However, this may cannibalize hospital emergency department revenue. How do we expand access?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, retail clinics represent strategic response to changing patient preferences. I can lead convenient care or cede market to competitors. This shapes MediCore''s market positioning and access strategy.',
        'cfo', 'I model clinic economics—$1.5M per location versus revenue potential. Retail clinics may reduce high-margin ED visits but create new revenue streams. As CFO, I''ll analyze net financial impact and payback periods.',
        'cmo', 'I understand patient preferences—convenience, shorter waits, accessible locations. As CMO, retail clinics extend MediCore''s brand and create patient touchpoints. Strategic placement and marketing drive success.',
        'cto', 'I connect retail clinics to central systems—EHR integration, scheduling platforms, telehealth backup. Technology enables distributed care delivery. As CTO, I''ll build digital infrastructure linking retail clinics.',
        'chro', 'I staff retail clinics—recruiting nurse practitioners, training for retail environment, managing distributed workforce. Different care setting requires different workforce model and support.',
        'coo', 'As COO, retail clinic operations is my domain. I understand site selection, care protocols, supply chain, quality standards, and integration with hospital network. Operational excellence determines success.'
    ),
    get_lens_multipliers('place'),
    ARRAY['retail_clinics', 'urgent_care', 'healthcare_access', 'distribution']
);

-- PROMOTION: Healthcare Marketing Ethics
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Direct-to-Consumer Advertising Debate',
    'Healthcare marketing has traditionally been physician-focused, but patients now research online and request specific treatments. Aggressive consumer advertising could drive volumes but may conflict with medical ethics and evidence-based care. How do we market healthcare services responsibly?',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance growth objectives with medical ethics and patient trust. Marketing must build reputation while maintaining clinical integrity. I''ll ensure marketing supports our mission to deliver excellent care.',
        'cfo', 'I evaluate marketing ROI—patient acquisition costs, lifetime value, service line profitability. As CFO, I''ll determine optimal marketing investment across service lines and measure effectiveness rigorously.',
        'cmo', 'I lead healthcare marketing and understand ethical boundaries. As CMO, I can build awareness and educate patients without aggressive tactics. Marketing in healthcare requires different approach than consumer goods.',
        'cto', 'I provide data on patient acquisition sources, digital engagement, and conversion analytics. Technology enables precise marketing measurement and personalized patient education.',
        'chro', 'I consider clinician perspectives—doctors may resist marketing they perceive as influencing medical decisions. I''ll ensure alignment between marketing and clinical values.',
        'coo', 'I ensure operational readiness for marketing-driven demand. Effective marketing is worthless if we can''t deliver quality care. I''ll match marketing promises with operational capabilities.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['healthcare_marketing', 'medical_ethics', 'patient_acquisition', 'advertising']
);

-- PRICE: Value-Based Care Contracts
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Fee-for-Service vs. Value-Based Payment',
    'Traditional fee-for-service pays per procedure, incentivizing volume. Value-based care pays for outcomes, rewarding quality and prevention. Value-based contracts could align with patient interests but require upfront investment in care coordination and carry financial risk if outcomes fall short.',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, value-based care represents healthcare''s future and fundamental business model transformation. I''ll evaluate strategic readiness, competitive positioning, and alignment with our mission to deliver excellent outcomes.',
        'cfo', 'I assess financial risk—value-based contracts shift risk to providers. As CFO, I''ll model financial scenarios, assess outcome predictability, determine appropriate risk levels, and evaluate required infrastructure investments.',
        'cmo', 'I position MediCore''s value proposition. Value-based care focuses on outcomes rather than volume. As CMO, I''ll communicate quality focus to patients and differentiate based on clinical excellence.',
        'cto', 'I build technology for value-based care—population health analytics, risk stratification, care coordination platforms. As CTO, data infrastructure determines success in value-based contracts.',
        'chro', 'I prepare clinicians for different incentive structures. Value-based care requires different workflows and mindsets. I''ll develop training, performance management, and cultural change programs.',
        'coo', 'As COO, I implement care coordination, manage population health, and optimize clinical processes for outcomes. Value-based care requires operational transformation. Execution determines financial success.'
    ),
    get_lens_multipliers('price'),
    ARRAY['value_based_care', 'payment_models', 'healthcare_reform', 'outcomes']
);

-- ========================================
-- NEXTGEN EDUCATION (High School) - 6 Challenges
-- Educational technology, 20,000 employees
-- ========================================

-- PEOPLE: Teacher Recruitment and Development
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Educator Talent Crisis',
    'Teacher shortages reached crisis levels—30% of new teachers leave within 5 years. NextGen operates 500 schools with 15,000 teachers. We need comprehensive teacher development, competitive compensation, and support systems. Investment: $100M annually. Without excellent teachers, learning outcomes suffer.',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of NextGen Education with 20,000 employees, teacher quality directly determines student outcomes—our core mission. I''ll balance financial sustainability with mission imperative to support teaching excellence.',
        'cfo', 'I assess $100M investment against improved retention and student outcomes. Teacher turnover creates recruiting costs, training expenses, and learning disruption. As CFO, I''ll model whether retention investment improves financial sustainability.',
        'cmo', 'I manage NextGen''s reputation and employer brand. Our ability to attract mission-driven educators depends on reputation as great place to teach. Marketing supports both student enrollment and teacher recruitment.',
        'cto', 'I can build technology to reduce teacher administrative burden—automated grading, lesson planning tools, student progress tracking. Technology gives teachers more time for instruction, reducing burnout.',
        'chro', 'As CHRO, teacher recruitment, development, and retention is fundamentally my domain. I understand educator motivations, professional development, career pathways, and retention strategies. I''ll develop comprehensive solutions.',
        'coo', 'I run 500 schools and see teacher challenges daily. As COO, I''ll implement operational improvements—manageable class sizes, planning time, administrative support—that make teaching sustainable.'
    ),
    get_lens_multipliers('people'),
    ARRAY['teacher_retention', 'educator_development', 'talent_management', 'education']
);

-- PRODUCT: Personalized Learning Technology
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'AI Adaptive Learning Platform',
    'Traditional classroom instruction teaches at average pace—advanced students become bored, struggling students fall behind. AI-powered adaptive learning personalizes instruction for each student. Investment: $60M platform development. Potential: dramatically improved outcomes. Risk: technology can''t replace great teaching.',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, personalized learning represents potential transformation of education. I''ll evaluate if technology genuinely improves outcomes or distracts from effective teaching practices. Strategic clarity prevents wasted investment.',
        'cfo', 'I assess $60M platform investment against outcome improvements and competitive positioning. As CFO, I''ll demand evidence of learning gains, not just engagement metrics. Educational technology must demonstrate ROI in student success.',
        'cmo', 'I understand parent and student expectations. Personalized learning is compelling marketing message. As CMO, I''ll ensure we deliver on promises and position NextGen as innovation leader in education.',
        'cto', 'As CTO, adaptive learning platform is fundamentally my domain. I understand AI algorithms, learning science integration, data privacy, and technical architecture. This requires sophisticated technology development.',
        'chro', 'I prepare teachers for technology integration. Adaptive platforms change teaching roles—from instructor to facilitator. I''ll provide training and support for pedagogical transformation.',
        'coo', 'I implement technology in 500 schools. As COO, I''ll pilot adaptive learning, refine implementation, train teachers, and scale successfully. Operational execution determines whether technology improves learning.'
    ),
    get_lens_multipliers('product'),
    ARRAY['personalized_learning', 'adaptive_learning', 'ai', 'edtech']
);

-- PROCESS: Curriculum Development and Standardization
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Standardized vs. Teacher-Designed Curriculum',
    'Standardized curriculum ensures consistency and quality control across 500 schools but reduces teacher autonomy and creativity. Teacher-designed curriculum enables innovation and customization but creates quality variability. How do we balance consistency with teacher empowerment?',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance quality control with teacher professionalism. Over-standardization demotivates teachers; too much variability creates inconsistent outcomes. I''ll find approach that ensures excellence while empowering educators.',
        'cfo', 'I evaluate costs—centralized curriculum development versus decentralized teacher design. As CFO, I''ll model resource requirements and assess if standardization creates efficiencies or teaching effectiveness improvements.',
        'cmo', 'I communicate NextGen''s educational philosophy. Do we emphasize innovative teaching or proven curricula? As CMO, positioning must align with curriculum approach and resonate with parents seeking quality education.',
        'cto', 'I can build platforms that support both standardization and customization—curriculum frameworks with teacher customization, shared resource libraries, best practice dissemination. Technology enables hybrid approaches.',
        'chro', 'As CHRO, I understand teacher motivations. Autonomy is critical to job satisfaction and retention. I''ll advocate for approaches that respect teacher professionalism while ensuring student learning.',
        'coo', 'I run 500 schools and must ensure quality and consistency. As COO, I''ll implement curriculum frameworks that provide structure while enabling teacher adaptability. Execution determines learning outcomes.'
    ),
    get_lens_multipliers('process'),
    ARRAY['curriculum', 'standardization', 'teacher_autonomy', 'quality_control']
);

-- PLACE: School Expansion Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Geographic Expansion vs. Deepening',
    'We could expand to new cities, growing our network from 500 to 600 schools, or deepen presence in existing markets, adding grades and improving facilities. Geographic expansion increases brand reach; market deepening builds stronger community roots. Which growth strategy serves students best?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, expansion strategy shapes NextGen''s competitive positioning and mission impact. I''ll evaluate where we can best serve students, considering market needs, competitive landscape, and operational capacity.',
        'cfo', 'I model financial scenarios—new market entry costs versus existing market deepening. As CFO, I''ll analyze student enrollment projections, market saturation, and returns on investment across strategies.',
        'cmo', 'I understand market dynamics and brand strength. As CMO, I''ll assess brand awareness in potential new markets versus deepening relationships in existing communities. Marketing efficiency differs by strategy.',
        'cto', 'I provide technology infrastructure supporting growth. Expanding to new markets requires scalable systems. As CTO, I''ll ensure technology enables either growth strategy without becoming bottleneck.',
        'chro', 'I recruit and develop talent for expansion. New markets require new leadership and teachers; market deepening requires depth development. I''ll assess talent availability and organizational capacity.',
        'coo', 'As COO, I implement and operate schools. I understand real estate, permitting, community relations, and operational complexity. Geographic expansion is operationally riskier; deepening leverages existing infrastructure.'
    ),
    get_lens_multipliers('place'),
    ARRAY['expansion_strategy', 'geographic_growth', 'market_strategy', 'scaling']
);

-- PROMOTION: Enrollment Marketing and Community Engagement
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'School Choice Marketing Strategy',
    'Charter schools compete for enrollment through marketing, but aggressive education marketing feels uncomfortable—we serve mission, not sell products. How do we attract families who''d benefit from NextGen while maintaining educational integrity? Marketing investment: $15M annually.',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance enrollment growth with mission integrity. Marketing must inform families, not manipulate. I''ll ensure our marketing approach aligns with educational values and serves student interests.',
        'cfo', 'I evaluate $15M marketing investment against enrollment growth and per-student funding. As CFO, I''ll measure marketing ROI—cost per enrollment, student retention, and long-term financial sustainability.',
        'cmo', 'I lead enrollment marketing and understand education market dynamics. As CMO, authentic storytelling about student outcomes builds trust. I''ll develop marketing that educates families and demonstrates value.',
        'cto', 'I provide enrollment platforms, website optimization, and data analytics. Technology enables families to research schools and simplifies application processes. Digital infrastructure supports enrollment marketing.',
        'chro', 'I ensure teachers and staff can authentically represent NextGen to families. Employee advocacy is powerful marketing. I''ll develop programs engaging staff as school ambassadors.',
        'coo', 'I ensure operational delivery matches marketing promises. Effective marketing attracts families whose expectations we must meet. As COO, I''ll verify that school quality justifies marketing claims.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['enrollment_marketing', 'school_choice', 'community_engagement', 'education_marketing']
);

-- PRICE: Tuition and Funding Models
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Supplemental Program Pricing',
    'Our core education is publicly funded, but we could charge for supplemental programs—after-school enrichment, advanced courses, college counseling. Additional revenue would fund program improvements, but charging fees creates equity concerns and may exclude lower-income families.',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance financial sustainability with equity mission. Additional revenue could improve programs for all students, but creating two-tier system conflicts with educational equity values. This decision shapes NextGen''s mission commitment.',
        'cfo', 'I model revenue potential—supplemental fees could generate $20M annually funding program improvements. As CFO, I''ll analyze financial scenarios and assess whether fee-based programs improve overall sustainability.',
        'cmo', 'I manage NextGen''s brand and mission positioning. Charging fees may damage reputation as equitable education provider. As CMO, I''ll assess brand impact and competitive positioning implications.',
        'cto', 'I can build scholarship platforms and sliding-scale fee systems that generate revenue while maintaining access. Technology enables nuanced pricing approaches.',
        'chro', 'I consider staff implications—teachers may resist creating two-tier system. I''ll assess organizational culture fit and potential employee concerns about equity mission.',
        'coo', 'As COO, I implement and operate supplemental programs. I''ll ensure program quality, manage fee collection, administer scholarship systems, and maintain equitable access. Operational design determines equity outcomes.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing_strategy', 'educational_equity', 'supplemental_programs', 'funding']
);

-- ========================================
-- PLAYFORGE GAMING (High School) - 6 Challenges
-- Game development, 2,000 employees
-- ========================================

-- PEOPLE: Crunch Culture and Work-Life Balance
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Game Development Crunch Crisis',
    'Game launches require intense "crunch" periods—80-hour weeks for months. This drives turnover (40% annually), burnout, and reputational damage. We could extend development timelines by 20%, eliminating crunch but delaying revenue and risking competitive timing. How do we balance deadlines with developer health?',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of PlayForge with 2,000 employees, crunch culture conflicts with our values and damages talent retention. I''ll evaluate if sustainable development is competitive advantage or disadvantage. This decision defines our company culture.',
        'cfo', 'I quantify costs—40% turnover represents $25M annually in recruiting and training. As CFO, I''ll model whether longer development timelines cost less than ongoing turnover expenses and productivity loss.',
        'cmo', 'I manage PlayForge''s reputation. Crunch culture creates negative press affecting both player perception and recruitment. As CMO, healthy workplace culture becomes competitive differentiator and recruitment advantage.',
        'cto', 'As CTO leading game development, I can implement better project management, realistic scoping, and technical practices reducing crunch need. Technical leadership determines whether sustainable development is feasible.',
        'chro', 'As CHRO, developer health and retention is fundamentally my domain. I understand burnout impacts, sustainable work practices, and culture change. I''ll develop evidence-based approaches eliminating crunch while maintaining productivity.',
        'coo', 'I manage game production and release schedules. As COO, I''ll implement processes that prevent crunch—better planning, scope management, quality-first development. Operational discipline enables sustainable development.'
    ),
    get_lens_multipliers('people'),
    ARRAY['crunch_culture', 'work_life_balance', 'game_development', 'burnout']
);

-- PRODUCT: Monetization Strategy Ethics
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Loot Box Controversy',
    'Loot boxes (randomized paid rewards) generate 60% of our revenue but face regulatory scrutiny and player backlash as "predatory gambling mechanics." We could shift to transparent monetization (direct purchases, subscriptions) but risk 40% revenue decline. How do we monetize ethically while sustaining business?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I balance revenue needs with ethical obligations and regulatory risks. Loot boxes are lucrative but potentially exploitative. I''ll evaluate long-term sustainability of monetization model and alignment with company values.',
        'cfo', 'I assess financial impact—60% revenue dependency on controversial mechanics creates regulatory and reputational risk. As CFO, I''ll model alternative monetization scenarios and determine sustainable economic models.',
        'cmo', 'I manage player relationships and brand perception. As CMO, loot box backlash damages trust and player sentiment. I''ll advocate for ethical monetization that builds long-term player loyalty over short-term extraction.',
        'cto', 'I implement monetization systems and analyze player data. As CTO, I see spending patterns and can identify problematic behaviors. Technical data should inform ethical monetization design.',
        'chro', 'I consider employee perspectives—developers may be uncomfortable with exploitative mechanics. I''ll assess cultural impact and ensure monetization aligns with employee values.',
        'coo', 'As COO, I implement and operate monetization systems. I''ll ensure whatever model we choose is executed fairly, transparently, and complies with regulations. Operational integrity determines ethical outcomes.'
    ),
    get_lens_multipliers('product'),
    ARRAY['monetization', 'loot_boxes', 'gaming_ethics', 'revenue_model']
);

-- PROCESS: Agile Development vs. Waterfall
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Development Methodology Transformation',
    'Traditional waterfall development plans everything upfront, but player preferences shift rapidly. Agile development enables iteration based on player feedback but creates scope uncertainty and budget challenges. How do we balance planning with flexibility in multi-year development cycles?',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, development methodology affects speed to market, quality, and team morale. I''ll evaluate which approach best serves PlayForge''s competitive strategy and project types.',
        'cfo', 'I need predictable budgets and timelines for financial planning. Agile creates uncertainty. As CFO, I''ll assess if agile''s benefits justify less predictability and develop financial processes accommodating iteration.',
        'cmo', 'I launch and market games to players. As CMO, I need release date certainty for marketing campaigns. I''ll work with development to balance iteration with marketing requirements.',
        'cto', 'As CTO overseeing game development, this is fundamentally my domain. I understand when agile works versus when upfront planning is necessary. Technical leadership determines effective development methodology.',
        'chro', 'I consider developer preferences and skill sets. Agile requires different mindsets and skills. I''ll assess team readiness, provide training, and support methodological transformation.',
        'coo', 'I manage game production and cross-functional coordination. As COO, I''ll implement processes that enable effective development regardless of methodology. Operational discipline makes either approach work.'
    ),
    get_lens_multipliers('process'),
    ARRAY['development_methodology', 'agile', 'project_management', 'game_development']
);

-- PLACE: Platform Distribution Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Direct vs. Platform Distribution',
    'Steam, Epic, and console platforms take 30% revenue cut but provide massive reach. Direct distribution keeps 100% but requires building audience from scratch. Do we accept platform fees for reach or invest in direct relationships with players?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, distribution strategy shapes revenue economics and player relationships. I''ll evaluate strategic trade-offs between platform reach and direct control. This decision affects long-term positioning.',
        'cfo', 'I model economics—70% of larger platform revenue versus 100% of smaller direct revenue. As CFO, I''ll analyze customer acquisition costs, lifetime value, and optimal channel mix for profitability.',
        'cmo', 'I lead player acquisition. Platforms provide discovery and credibility; direct requires building audience. As CMO, I''ll assess marketing efficiency across channels and determine sustainable acquisition strategies.',
        'cto', 'I manage technical integrations with platforms and direct infrastructure. As CTO, I understand platform requirements, security, payment processing, and technical trade-offs. Technology enables multi-channel strategy.',
        'chro', 'I consider organizational implications. Direct distribution requires different capabilities—community management, customer support, platform operations. I''ll assess talent needs and organizational changes.',
        'coo', 'As COO, I ensure operational execution across distribution channels—platform compliance, payment processing, customer support, update delivery. Operational excellence across channels determines success.'
    ),
    get_lens_multipliers('place'),
    ARRAY['distribution_strategy', 'platform_economics', 'digital_distribution', 'revenue_sharing']
);

-- PROMOTION: Community Engagement Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Esports and Streaming Investment',
    'Competitive gaming and streaming drive player engagement and marketing reach. We could invest $10M in esports leagues and streamer partnerships, building grassroots community. However, esports profitability is elusive and measuring ROI is challenging. Is community investment strategic or speculative?',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, community engagement creates sustainable competitive advantages. I''ll evaluate if esports investment aligns with PlayForge''s strategy and drives meaningful business outcomes beyond brand awareness.',
        'cfo', 'I demand measurable returns on $10M investment. As CFO, I''ll establish metrics—player acquisition, engagement, retention—to evaluate community program effectiveness. Esports must drive business results.',
        'cmo', 'I lead player marketing and understand community dynamics. As CMO, authentic community engagement builds player loyalty that paid advertising can''t create. I''ll develop programs that genuinely serve players.',
        'cto', 'I build platforms supporting competitive play—matchmaking, spectator modes, tournament infrastructure. As CTO, technology quality determines esports viability. Technical excellence enables competitive community.',
        'chro', 'I ensure employees can engage with community—tournament organization, content creation, player interaction. Community programs require dedicated roles and authentic engagement.',
        'coo', 'As COO, I ensure operational support for esports—tournament operations, prize fulfillment, anti-cheat systems. Effective community programs require operational excellence and integrity.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['esports', 'community_engagement', 'streaming', 'competitive_gaming']
);

-- PRICE: Premium vs. Free-to-Play
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Business Model Transformation',
    'Our $60 premium games reach 2M players with 75% margins. Free-to-play reaches 50M players but only 3% pay, generating similar revenue with 50% margins. F2P enables much larger audience but requires different design and monetization. Which model better serves our creative vision and business?',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, business model choice shapes PlayForge''s creative identity and market positioning. Premium enables artistic vision; F2P enables massive reach. I''ll evaluate which model aligns with our strategy and values.',
        'cfo', 'I model economics—premium generates predictable upfront revenue; F2P creates uncertain, ongoing revenue streams. As CFO, I''ll analyze revenue predictability, margin structures, and long-term financial sustainability.',
        'cmo', 'I understand player preferences and market trends. As CMO, F2P enables broader audience but faces "pay-to-win" perception. I''ll assess positioning implications and player sentiment across models.',
        'cto', 'As CTO, F2P requires different technical architecture—live operations, content updates, monetization systems. I''ll evaluate technical requirements and team capabilities for business model transformation.',
        'chro', 'I consider team implications—F2P requires live operations mindset versus premium''s ship-and-move-on approach. Different models require different skills and cultural adaptations.',
        'coo', 'I manage game operations and player support. As COO, F2P creates ongoing operational requirements—live updates, community management, player support. Operational model differs dramatically from premium.'
    ),
    get_lens_multipliers('price'),
    ARRAY['business_model', 'free_to_play', 'premium_games', 'monetization']
);

-- ========================================
-- BUILDRIGHT CONSTRUCTION (High School) - 6 Challenges
-- Construction company, 10,000 employees
-- ========================================

-- PEOPLE: Skilled Labor Shortage
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Construction Workforce Crisis',
    'Skilled trades shortage forces us to turn down projects worth $200M annually. Average age of skilled workers is 55+, and few young people enter trades. We could invest $30M in apprenticeship programs, trade schools partnerships, and competitive wages—or increasingly rely on automation and prefabrication.',
    'People challenges focus on hiring, training, retaining, and developing talent. Successful organizations balance employee satisfaction with business needs, creating cultures where people thrive while driving results.',
    'people', 'people', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of BuildRight with 10,000 employees, skilled labor is our most critical asset. I''ll balance workforce investment with technology adoption, considering long-term industry transformation and BuildRight''s competitive positioning.',
        'cfo', 'I see $200M in lost revenue from labor shortages. $30M workforce investment could unlock growth. As CFO, I''ll model ROI of apprenticeship programs versus automation investments and determine optimal talent strategy.',
        'cmo', 'I manage BuildRight''s reputation and employer brand. Trades career stigma limits recruitment. I''ll develop campaigns elevating construction careers and attracting young talent to skilled trades.',
        'cto', 'I evaluate construction technology—robotics, automation, prefabrication, AI design. As CTO, technology can augment or replace scarce labor. I''ll assess what''s feasible and how technology reshapes workforce needs.',
        'chro', 'As CHRO, workforce development is fundamentally my domain. I understand apprenticeship models, partnerships with vocational schools, competitive compensation, and retention. I''ll build comprehensive talent pipeline strategies.',
        'coo', 'I run construction operations and see labor shortages impact daily. As COO, I''ll optimize workforce deployment, improve productivity, reduce turnover, and ensure apprenticeship programs produce skilled craftspeople.'
    ),
    get_lens_multipliers('people'),
    ARRAY['skilled_trades', 'workforce_development', 'apprenticeship', 'labor_shortage']
);

-- PRODUCT: Sustainable Construction Materials
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Green Building Materials Strategy',
    'Construction generates 40% of global carbon emissions. Sustainable materials—recycled steel, low-carbon concrete, mass timber—reduce environmental impact but cost 25% more and have limited supplier availability. Should we lead in sustainable construction or maintain cost-competitive traditional methods?',
    'Product challenges involve what you sell and how it creates customer value. Successful products balance customer needs, operational feasibility, competitive differentiation, and profitability.',
    'product', 'product', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I consider BuildRight''s role in climate action and competitive positioning. Leading in sustainable construction could differentiate us, but cost premiums may limit market. I''ll evaluate strategic opportunities and risks.',
        'cfo', '25% cost premium affects competitiveness and margins. As CFO, I''ll model financial implications, assess client willingness to pay for sustainability, and evaluate if green building creates premium market positioning.',
        'cmo', 'I understand client motivations—corporations have sustainability commitments creating demand for green buildings. As CMO, sustainable construction expertise becomes competitive differentiator for specific client segments.',
        'cto', 'As CTO, I evaluate construction technologies enabling sustainability—material innovations, waste reduction, energy-efficient design. Technical expertise determines what''s feasible and cost-effective.',
        'chro', 'I consider workforce implications—sustainable construction requires different knowledge and skills. I''ll assess training needs and develop programs building green construction capabilities.',
        'coo', 'I manage construction operations and supplier relationships. As COO, I''ll navigate sustainable material supply chains, adapt construction processes, and ensure quality. Operational execution determines sustainability success.'
    ),
    get_lens_multipliers('product'),
    ARRAY['sustainable_construction', 'green_building', 'construction_materials', 'carbon_reduction']
);

-- PROCESS: Construction Technology Adoption
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Digital Construction Transformation',
    'Construction lags other industries in technology adoption. BIM (Building Information Modeling), drones, AI scheduling, and IoT sensors could reduce costs 15% and timelines 20%. Investment: $50M technology and training. Resistance: veteran workforce uncomfortable with technology.',
    'Process challenges focus on how work gets done—workflows, systems, and operational efficiency. Successful processes balance speed, quality, cost, and scalability.',
    'process', 'process', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, construction technology represents competitive advantage and industry evolution. I''ll evaluate if early adoption creates differentiation or if we should wait for proven solutions. Timing determines success.',
        'cfo', 'I assess $50M investment against 15% cost reduction and 20% timeline improvement. As CFO, ROI is compelling if technology delivers. I''ll model scenarios, assess risks, and determine phased investment approach.',
        'cmo', 'I position BuildRight''s capabilities. Technology adoption demonstrates innovation and attracts sophisticated clients. As CMO, construction technology becomes marketing differentiator.',
        'cto', 'As CTO, construction technology implementation is fundamentally my domain. I evaluate solutions, manage integrations, train users, and ensure adoption. Technology success requires effective change management.',
        'chro', 'I prepare workforce for technology transformation. Veteran workers may resist change. As CHRO, I''ll develop training, communication, and change management programs ensuring successful adoption.',
        'coo', 'I run construction operations where technology must work. As COO, I''ll pilot technology, refine processes, address field challenges, and scale adoption. Operational execution determines if technology delivers promised benefits.'
    ),
    get_lens_multipliers('process'),
    ARRAY['construction_tech', 'bim', 'digital_transformation', 'productivity']
);

-- PLACE: Geographic Market Expansion
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Regional vs. National Strategy',
    'BuildRight dominates 5 regional markets. We could expand nationally to 20 markets, growing revenue potential 4x. However, construction is local—permitting, subcontractors, regulations vary by market. National expansion requires local partnerships, relationships, and expertise. Do we expand or deepen regional dominance?',
    'Place challenges focus on distribution channels and how products reach customers. Successful distribution strategies balance accessibility, cost efficiency, brand experience, and market coverage.',
    'place', 'place', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, expansion strategy shapes BuildRight''s growth trajectory and competitive positioning. I''ll evaluate market opportunities, competitive dynamics, and organizational capacity for geographic expansion.',
        'cfo', 'I model expansion economics—entry costs, market penetration timelines, profitability ramp. As CFO, I''ll analyze whether national expansion or regional deepening generates better returns and sustainable growth.',
        'cmo', 'I assess brand strength across markets and marketing efficiency. As CMO, national expansion requires building awareness in new markets while regional deepening leverages existing reputation.',
        'cto', 'I provide technology infrastructure supporting geographic expansion. Systems must scale across markets. As CTO, I''ll ensure technology enables either strategy without becoming constraint.',
        'chro', 'I recruit and develop leadership for new markets. Geographic expansion requires local expertise and relationships. As CHRO, I''ll assess talent acquisition challenges and leadership development needs.',
        'coo', 'As COO, I understand construction''s local nature—permitting, subcontractors, suppliers, regulations. Geographic expansion is operationally complex requiring local partnerships and expertise. Execution determines success.'
    ),
    get_lens_multipliers('place'),
    ARRAY['geographic_expansion', 'market_strategy', 'regional_growth', 'construction']
);

-- PROMOTION: Client Relationship Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Relationship vs. Competitive Bidding',
    'Construction wins projects through competitive bidding or relationship-based negotiations. Bidding creates price pressure and low margins; relationships enable value-based pricing but require significant business development investment. How do we balance bid competitiveness with relationship building?',
    'Promotion challenges involve marketing, branding, and communicating value to customers. Successful promotion creates awareness, builds brand affinity, drives customer action, and adapts to evolving media landscapes.',
    'promotion', 'promotion', 'medium', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I define BuildRight''s market positioning—low-cost provider or premium partner. Relationship strategy requires investment but enables differentiation. I''ll evaluate which approach aligns with our competitive strategy.',
        'cfo', 'I analyze profitability across bid versus relationship projects. As CFO, I''ll measure margins, determine optimal project mix, and assess business development ROI. Financial analysis guides client strategy.',
        'cmo', 'I lead business development and client marketing. As CMO, relationship-based selling requires thought leadership, networking, and reputation building. I''ll develop strategies that position BuildRight as strategic partner.',
        'cto', 'I provide project visualization, virtual reality walkthroughs, and data analytics demonstrating BuildRight''s value. Technology differentiates us in competitive bids and strengthens relationship selling.',
        'chro', 'I develop business development capabilities. Relationship selling requires different skills than bid management. I''ll assess talent needs and build programs developing client relationship expertise.',
        'coo', 'I ensure operational delivery of project promises. Strong client relationships depend on execution excellence. As COO, I''ll ensure BuildRight consistently delivers on commitments, building reputation that enables relationship-based work.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['business_development', 'client_relationships', 'competitive_bidding', 'construction_sales']
);

-- PRICE: Fixed-Price vs. Cost-Plus Contracts
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Construction Contract Risk Allocation',
    'Fixed-price contracts offer clients budget certainty but shift all risk to BuildRight—material cost fluctuations, labor shortages, unforeseen conditions. Cost-plus contracts pass costs to clients, reducing our risk but creating client pricing uncertainty. How do we balance risk and competitiveness?',
    'Price challenges involve balancing profitability with customer value perception. Successful pricing considers costs, competition, perceived value, brand positioning, and long-term financial sustainability.',
    'price', 'price', 'hard', 'high',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, contract structures determine risk profile and competitive positioning. I''ll balance risk management with market competitiveness, considering which projects and clients suit different contract types.',
        'cfo', 'I manage financial risk from contract types. Fixed-price creates margin risk; cost-plus creates relationship risk. As CFO, I''ll analyze risk-adjusted returns, determine appropriate contract mix, and establish risk management processes.',
        'cmo', 'I understand client preferences—public projects often require fixed-price; sophisticated clients may prefer cost-plus transparency. As CMO, I''ll position contract offerings matching client needs and risk tolerances.',
        'cto', 'I provide project cost estimation tools, risk modeling, and real-time project tracking. As CTO, technology improves cost predictability, reducing fixed-price risks and providing cost-plus transparency.',
        'chro', 'I consider workforce implications—cost overruns and finger-pointing damage morale. I''ll ensure contract structures align with organizational culture and don''t create unmanageable stress.',
        'coo', 'As COO managing project execution, I live with contract consequences daily. I understand where risks emerge—permitting, weather, materials, labor. Operational expertise determines which risks we can manage and which we should transfer.'
    ),
    get_lens_multipliers('price'),
    ARRAY['contract_types', 'risk_management', 'pricing_strategy', 'construction_contracts']
);

-- ========================================
-- COMPLETION: ALL 60 HIGH SCHOOL CHALLENGES
-- ========================================

COMMENT ON FUNCTION get_lens_multipliers IS
'Returns standard lens multiplier JSON for each P category. Ensures consistency across all challenges.';
