-- ============================================
-- CCM ELEMENTARY CHALLENGES - 60 Total
-- 10 Companies × 6 P Categories
-- Ages 5-10 (K-5), Simple kid-friendly scenarios
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

-- Note: Elementary companies use "_ELEM" suffix (e.g., QUICKSERVE_ELEM, TRENDFWD_ELEM, etc.)
-- These are kid-friendly versions of the main companies

-- ========================================
-- QUICKSERVE_ELEM (Elementary) - 6 Challenges
-- Simple burger restaurant, 200 helpers
-- ========================================

-- PEOPLE: Hiring Friendly Workers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Finding Happy Helpers',
    'Our burger restaurant needs people who are friendly and make customers smile. Should we choose helpers who are really nice to customers, or helpers who can work very fast? Nice helpers make people happy. Fast helpers make food quickly.',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I''m the leader. I want customers to love coming to our restaurant. Happy, smiling helpers make customers want to come back!',
        'cfo', 'I count our money. Friendly helpers might make customers visit more. But fast helpers can serve more people. Which helps us more?',
        'cmo', 'I tell people about our restaurant. If our helpers are super friendly, customers will tell their friends. That''s the best advertising!',
        'cto', 'I help with our computers and machines. Maybe we can use machines to help fast helpers be friendlier, or help friendly helpers work faster!',
        'chro', 'I hire helpers. Being friendly and working fast are both important! Maybe I can find helpers who can do both, or teach them the skills they need.',
        'coo', 'I make sure everything runs smoothly. I see what happens every day. We need helpers who make customers smile AND keep our line moving!'
    ),
    get_lens_multipliers('people'),
    ARRAY['hiring', 'customer_service', 'friendliness', 'elementary']
);

-- PRODUCT: New Menu Item
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Chicken Nuggets or Salad?',
    'We want to add one new food to our menu. Should it be chicken nuggets that kids love, or a healthy salad that parents want? Nuggets will sell a lot. Salads are healthy.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about what''s best for everyone. Kids love nuggets, but healthy food is important too. What should our restaurant be known for?',
        'cfo', 'I keep track of money. Nuggets might sell more and make more money. But maybe parents who want salads will bring their whole family more often.',
        'cmo', 'I tell people about our food. Nuggets are fun and kids will ask parents to come. Salads show we care about healthy eating. Both are good messages!',
        'cto', 'I think about cooking. Nuggets need a fryer. Salads need fresh vegetables kept cold. Each choice needs different kitchen equipment.',
        'chro', 'I think about our workers. Teaching helpers to make nuggets or salads - which is easier? Happy workers make better food!',
        'coo', 'I run the kitchen. Nuggets are easier - just heat and serve. Salads need washing, chopping, and keeping fresh. Nuggets might be simpler for us.'
    ),
    get_lens_multipliers('product'),
    ARRAY['menu', 'kids', 'healthy', 'elementary']
);

-- PROCESS: Faster Line
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Waiting in Line',
    'Sometimes customers wait a long time in line. We could add a number system where people get a number and sit down while waiting. Or we could practice making food faster. Which will help customers wait less?',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want happy customers. Waiting in line is boring. Making it better will help customers enjoy visiting us more!',
        'cfo', 'I think about money. Number systems cost money to set up. Making food faster might just need practice. Which works better for less money?',
        'cmo', 'I think about how customers feel. Sitting down with a number feels nicer than standing in line. But super-fast service is exciting too!',
        'cto', 'I can help with numbers! We could use screens that show numbers and maybe even text messages. Technology makes waiting easier.',
        'chro', 'I think about workers. Number systems might be confusing at first. Training helpers to work faster takes time. Which is easier to teach?',
        'coo', 'I watch how things work. I see the line every day. Sometimes food takes time to cook - numbers help. Sometimes helpers just need to move faster!'
    ),
    get_lens_multipliers('process'),
    ARRAY['speed', 'waiting', 'service', 'elementary']
);

-- PLACE: Where to Open
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Next to School or by Highway?',
    'We want to open a new restaurant. One spot is next to an elementary school where lots of families walk by. Another spot is by the highway where people driving can stop. Which place is better?',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about who we want to serve. School location gets families. Highway location gets travelers. Both could work!',
        'cfo', 'I count how many customers might come. Schools mean lunch time is busy. Highway means all day travelers. Which makes more money?',
        'cmo', 'I tell people about us. Near school, families see us every day - great advertising! Near highway, we need signs so drivers notice us.',
        'cto', 'I think about equipment needs. Both locations need the same kitchen. But highway location might need a drive-through window!',
        'chro', 'I think about workers. Near school, high school students can work after school. Near highway, we need helpers all different times of day.',
        'coo', 'I make things run smoothly. School location is super busy at lunch, then quiet. Highway is busy all day. Different locations need different planning.'
    ),
    get_lens_multipliers('place'),
    ARRAY['location', 'school', 'customers', 'elementary']
);

-- PROMOTION: Making People Know About Us
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Balloons or Coupons?',
    'We want more people to know about our restaurant. Should we give free balloons to kids so they have fun and remember us? Or give parents coupons for money off their food? Balloons are fun. Coupons save money.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want people to love our restaurant. Balloons make kids happy and parents see their happy kids. Coupons help families save money. Both are good!',
        'cfo', 'I watch our money. Balloons cost a little. Coupons mean we make less money on each meal. But both might bring in lots of new customers!',
        'cmo', 'This is what I do! Balloons create fun memories - kids will ask to come back. Coupons give parents a reason to try us. I think we should do BOTH!',
        'cto', 'I can help! We could make a special balloon day and share photos online. For coupons, I can make them on our website and app!',
        'chro', 'I think about helpers. Giving out balloons and coupons - our workers need to know how. Training them is important!',
        'coo', 'I manage daily work. Balloons need storage and someone to hand them out. Coupons need scanning at the register. Both add steps but could be fun!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'fun', 'savings', 'elementary']
);

-- PRICE: How Much to Charge
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Kids Meal Price',
    'Our kids meal costs $5. Should we lower it to $4 so more families can afford it? Or keep it at $5 so we make enough money? Lower price helps more people. Higher price gives us more money.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUICKSERVE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want to help families and keep our business going. Lower prices help more people. But we need money to pay our workers and keep the restaurant running!',
        'cfo', 'This is my job! If we charge $4 instead of $5, we need lots more customers to make the same money. Can we do that?',
        'cmo', 'I think about families. A $4 meal sounds really good! Parents might bring kids more often. More visits could mean more total money!',
        'cto', 'I manage our systems. I can track how many kids meals we sell at different prices. Numbers help us make good choices!',
        'chro', 'I think about workers. Lower prices might mean busier restaurant - we might need more helpers! That''s more jobs, which is good!',
        'coo', 'I watch costs. Food, cooking, packaging all cost money. At $4, do we still make enough after paying for everything? Math is important!'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'kids', 'affordability', 'elementary']
);

-- ========================================
-- TRENDFWD_ELEM (Elementary) - 6 Challenges
-- Kids' clothing store, 300 helpers
-- ========================================

-- PEOPLE: Helpful Store Workers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Teaching Helpers About Clothes',
    'We sell kids'' clothes. Should our helpers know a lot about fashion and styles? Or should they just be really good at helping kids find the right sizes? Both are helpful in different ways.',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our store. Kids want to look cool! Helpers who know what''s popular can really help. But finding the right size matters too!',
        'cfo', 'I count money. Helpers who know fashion might sell more clothes. But size helpers make fewer mistakes and returns. Which saves money?',
        'cmo', 'I tell people about our store. If our helpers are fashion experts, that''s exciting! Parents will trust us to help kids look great.',
        'cto', 'I work with computers. Maybe our helpers can use tablets to show what''s popular and check sizes at the same time!',
        'chro', 'I hire helpers. Fashion knowledge takes time to learn. Being friendly and helpful with sizes is easier to teach. What should we focus on?',
        'coo', 'I run the store daily. I see kids trying on clothes. Getting the right fit makes everyone happy. But knowing what''s cool helps kids feel confident!'
    ),
    get_lens_multipliers('people'),
    ARRAY['helping', 'fashion', 'kids', 'elementary']
);

-- PRODUCT: What to Sell
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'School Uniforms or Fun Clothes?',
    'Should we sell school uniforms that kids need, or fun clothes they want to wear? Uniforms are practical. Fun clothes are exciting. We can''t carry everything.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about our store''s purpose. Uniforms are needed - families must buy them. Fun clothes are wanted - kids love picking them out!',
        'cfo', 'I watch money. Uniform sales are steady - families buy them every year. Fun clothes might sell more, but kids grow fast and styles change!',
        'cmo', 'I advertise. Uniforms bring families who NEED clothes. Fun clothes bring families who WANT to shop. Both reasons to visit are good!',
        'cto', 'I handle technology. We can track what sells more. Computer numbers show us what families really buy!',
        'chro', 'I think about workers. Uniforms are simpler - same styles each year. Fun clothes change with trends - helpers need to learn new things often.',
        'coo', 'I manage inventory. Uniforms come in standard sizes and colors - easy! Fun clothes have lots of choices - harder to keep track of everything.'
    ),
    get_lens_multipliers('product'),
    ARRAY['clothing', 'school', 'kids', 'elementary']
);

-- PROCESS: Faster Checkout
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Long Checkout Lines',
    'Families wait too long to pay for clothes. Should we add more cash registers? Or teach helpers to work faster at the registers we have? Both help, but in different ways.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want happy shoppers. Standing in line with tired kids is hard! Making checkout faster shows we respect families'' time.',
        'cfo', 'I count costs. New registers cost money to buy. Training helpers costs time. Which gives us better results for less money?',
        'cmo', 'I think about experience. Fast checkout makes people want to come back. Slow lines make people shop somewhere else!',
        'cto', 'I work with technology. Maybe we can add self-checkout where parents scan clothes themselves? Technology can help lines move faster!',
        'chro', 'I train workers. Teaching speed takes practice. Adding registers means hiring more helpers. Both choices need my help!',
        'coo', 'I watch the store. Sometimes we''re really busy, sometimes quiet. More registers help busy times. Faster helpers help all the time!'
    ),
    get_lens_multipliers('process'),
    ARRAY['checkout', 'lines', 'speed', 'elementary']
);

-- PLACE: Store Location
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Mall or Shopping Center?',
    'We need a new store location. The mall has lots of shoppers but costs more. The shopping center is cheaper but has fewer people walking by. Where should we go?',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I make big choices. Malls are exciting with lots happening. Shopping centers are convenient with easy parking. Different families like different things!',
        'cfo', 'I count money. Mall rent costs more. But more shoppers might mean more sales. I need to do math to see which is better!',
        'cmo', 'I tell people about us. Malls let people discover us while shopping. Shopping centers need us to advertise so families know we''re there!',
        'cto', 'I think about our systems. Both locations need the same computers and technology. Location doesn''t change our tech needs much.',
        'chro', 'I think about workers. Mall hours are longer. Shopping centers often close earlier. Different hours mean different helper schedules!',
        'coo', 'I run the store. Malls have rules about stores. Shopping centers give us more freedom. Each place works differently!'
    ),
    get_lens_multipliers('place'),
    ARRAY['location', 'mall', 'shopping', 'elementary']
);

-- PROMOTION: Getting Noticed
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Fashion Show or Sale Signs?',
    'How should we tell families about our clothes? Hold a fun kids'' fashion show? Or make big bright signs about our sale? Shows are exciting. Signs save money.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about our image. Fashion shows are special events - memorable and fun! Signs are simple and work every day. Both have good points!',
        'cfo', 'I watch spending. Fashion shows cost money to organize. Signs are cheaper. But shows might bring lots of new customers!',
        'cmo', 'This is my specialty! Fashion shows create excitement and give families a fun experience. Signs remind people we exist. I like doing both!',
        'cto', 'I help with tech. For fashion shows, I can take photos and share online. For signs, I can make digital displays that move and catch eyes!',
        'chro', 'I think about helpers. Fashion shows need extra workers that day. Signs just need someone to hang them up. Planning is different!',
        'coo', 'I run daily operations. Fashion shows are busy but fun! Signs are simple. Both bring customers, just in different ways!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'events', 'fashion', 'elementary']
);

-- PRICE: Sale Prices
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Big Sale or Regular Prices?',
    'Should we have a big 50% off sale? Families love saving money! But sales mean we make less money on each item. What should we do?',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRENDFWD_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our business. Sales bring lots of shoppers! But we need money to keep the store running. Finding the right balance is important.',
        'cfo', 'This is my job! Half-price means we need to sell twice as many clothes to make the same money. Can we do that?',
        'cmo', 'I market to families. Big sales are exciting! Parents tell their friends. Even if each family spends less, more families visit!',
        'cto', 'I handle our systems. I can track sales and see if more shoppers during sale time makes up for lower prices. Numbers help us decide!',
        'chro', 'I think about workers. Big sales mean busy days! We need enough helpers to take care of all the extra families shopping.',
        'coo', 'I manage the store. Sales move older clothes to make room for new styles. That''s good! But we need to make sure we still make enough money.'
    ),
    get_lens_multipliers('price'),
    ARRAY['sales', 'discounts', 'pricing', 'elementary']
);

-- ========================================
-- HORIZON_ELEM (Elementary) - 6 Challenges
-- Travel helper service, 150 helpers
-- ========================================

-- PEOPLE: Friendly Travel Helpers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Travel Experts Who Love Helping',
    'We help families plan trips. Should our helpers know everything about lots of places? Or should they be really good at listening to what families want? Knowledge and listening are both important!',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I run our travel business. Knowing about places helps give good advice. Listening helps understand what families really want. Both make great helpers!',
        'cfo', 'I count money. Expert helpers might plan fancier trips that cost more. Good listeners might plan trips that make families happier. Happy families come back!',
        'cmo', 'I tell people about us. Families love helpers who really understand their dream vacation. That''s our special thing - personal attention!',
        'cto', 'I work with computers. Technology can help helpers learn about places. But computers can''t listen like people can!',
        'chro', 'I hire helpers. Travel knowledge takes time to learn. Listening skills can be taught faster. What''s most important for our helpers to have?',
        'coo', 'I make sure things work smoothly. Knowledgeable helpers plan trips faster. Good listeners might take more time but make better choices. Both matter!'
    ),
    get_lens_multipliers('people'),
    ARRAY['travel', 'helping', 'listening', 'elementary']
);

-- PRODUCT: What Trips to Offer
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Beach Trips or Mountain Trips?',
    'Should we focus on beach vacations or mountain adventures? We can''t be experts in everything. Beaches are relaxing. Mountains are exciting. Different families like different things!',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about what makes us special. Being the BEST at one type of vacation might be better than being okay at many types!',
        'cfo', 'I watch money. Beach trips might be popular in summer. Mountain trips might be popular in winter. Focusing on one might mean quiet times.',
        'cmo', 'I advertise. "Best Beach Vacation Planners!" sounds exciting! Or "Mountain Adventure Experts!" Both are strong messages. We need to choose!',
        'cto', 'I help with technology. Our website can show beautiful pictures of beaches OR mountains. Focusing helps make our website really good!',
        'chro', 'I train helpers. Learning everything about beaches OR mountains is easier than learning both. Focused training makes better experts!',
        'coo', 'I run operations. Beach and mountain trips need different partner companies - different hotels, different activities. Focusing is simpler!'
    ),
    get_lens_multipliers('product'),
    ARRAY['vacations', 'travel', 'specialization', 'elementary']
);

-- PROCESS: Fast Trip Planning
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Quick or Careful Planning?',
    'Should we plan trips really fast so families get answers quickly? Or take more time to make sure every detail is perfect? Fast is convenient. Careful is thorough.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want happy families. Quick answers feel good. Perfect plans make vacations great. Maybe we can be both quick AND careful!',
        'cfo', 'I count time and money. Quick planning means helping more families. Careful planning means fewer problems that cost money to fix later.',
        'cmo', 'I think about what families say about us. "Fast service!" and "Perfect trips!" are both good reviews. Which do families care about more?',
        'cto', 'I work with computers. Technology can help! Computers can check details fast. This helps us be quick AND careful together!',
        'chro', 'I train workers. Quick planning is stressful - helpers must work fast. Careful planning is relaxing - helpers take their time. Different feels!',
        'coo', 'I watch how we work. Being careful catches mistakes before they become problems. Being fast makes families happy right away. Balance is important!'
    ),
    get_lens_multipliers('process'),
    ARRAY['planning', 'speed', 'quality', 'elementary']
);

-- PLACE: Office or Online
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Visit Us or Use Computer?',
    'Should families come to our office to plan trips? Or should they plan everything on our website from home? Office visits are personal. Websites are convenient.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about serving families best. Some like face-to-face help. Others like planning in pajamas at home! Maybe we can offer both?',
        'cfo', 'I count costs. Offices cost money - rent, electricity, furniture. Websites cost money to build. Which reaches more families for less money?',
        'cmo', 'I tell families about us. In-person visits feel special and personal. Website planning is easy and modern. Both are good messages!',
        'cto', 'I do websites! I can make a really good website where families plan their dream vacation. It can be almost as helpful as visiting!',
        'chro', 'I think about helpers. Office work means meeting families face-to-face. Website work means answering emails and chats. Different skills needed!',
        'coo', 'I run operations. Offices need set hours. Websites work 24/7! But offices let us show brochures and maps. Each way has good parts!'
    ),
    get_lens_multipliers('place'),
    ARRAY['office', 'online', 'website', 'elementary']
);

-- PROMOTION: How to Tell Families
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Photos or Stories?',
    'Should we show pretty pictures of vacations to get families excited? Or share stories from families who had great trips? Pictures are eye-catching. Stories are convincing.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want families to trust us. Beautiful pictures show what''s possible. Real stories from real families prove we deliver great vacations!',
        'cfo', 'I watch spending. Professional photos cost money. Stories from happy families are free! But which brings more customers?',
        'cmo', 'This is my job! Pictures make people dream. Stories make people believe. I think we should use both! Pictures catch attention, stories close the deal.',
        'cto', 'I handle technology. Our website and social media can show photos AND stories! Videos are even better - stories with moving pictures!',
        'chro', 'I think about helpers. Asking families for stories means our helpers need to follow up after trips. That''s extra work, but builds relationships!',
        'coo', 'I make things work. Collecting good photos and stories takes organization. But customer testimonials are powerful! Worth the effort!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'photos', 'stories', 'elementary']
);

-- PRICE: Trip Costs
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Helping Families Afford Vacations',
    'Should we plan more budget-friendly trips so more families can afford them? Or focus on special luxury trips? Budget trips help more families. Luxury trips are extra special.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'HORIZON_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want to help families make memories. Budget trips let more families go. Luxury trips make smaller vacations unforgettable. Both are valuable!',
        'cfo', 'I count money. Budget trips mean more families but less money per trip. Luxury trips mean fewer families but more money per trip. Which works better?',
        'cmo', 'I advertise our services. "Vacations for every family!" or "Luxury experiences you deserve!" are different messages. We need to pick our audience!',
        'cto', 'I work with systems. Our website can show options for different budgets. Technology helps families find trips they can afford!',
        'chro', 'I train helpers. Budget trip planning finds deals and saves money. Luxury trip planning finds special unique experiences. Different skills!',
        'coo', 'I coordinate trips. Budget trips use regular hotels and airlines. Luxury trips need special partnerships. Each type needs different connections!'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'budget', 'vacations', 'elementary']
);

-- ========================================
-- SKYCONNECT_ELEM (Elementary) - 6 Challenges
-- Friendly airplane company, 400 helpers
-- ========================================

-- PEOPLE: Friendly Flight Helpers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Helpers Who Make Flying Fun',
    'Flight helpers can be really friendly and make kids smile, or they can be super organized and get things done fast. Which type of helper is better for our airplane company?',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our airplane company. Happy helpers make flying fun for families! But organized helpers keep planes on time. Both are important!',
        'cfo', 'I count money. Happy passengers come back! But late planes cost money. Which type of helper saves us more money?',
        'cmo', 'I tell people about our airplanes. Families love friendly helpers who make kids comfortable flying. That''s what makes us special!',
        'cto', 'I work with technology. Computers can help organized helpers stay on schedule. And help friendly helpers know passenger names!',
        'chro', 'I hire helpers. Being friendly AND organized is best! Maybe I can find people who are both, or teach them both skills.',
        'coo', 'I make flights run smoothly. Friendly helpers create great experiences. Organized helpers keep us on time. We need both!'
    ),
    get_lens_multipliers('people'),
    ARRAY['airlines', 'friendly', 'service', 'elementary']
);

-- PRODUCT: Snacks on Planes
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Free Snacks or Special Meals?',
    'Should we give everyone free pretzels and juice? Or charge money for fancier meals? Free snacks make everyone happy. Paid meals taste better but cost families money.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about what families want. Free snacks feel nice - everyone gets something! But some people might want better food and are happy to pay.',
        'cfo', 'I watch money. Free snacks cost us money but make people happy. Sold meals make money but some people might be hungry. What works better?',
        'cmo', 'I advertise our planes. "Free snacks for everyone!" sounds great! Or "Delicious meals available!" Both are good messages.',
        'cto', 'I handle systems. I can make it easy to order meals on our app before flying. Technology makes buying meals simple!',
        'chro', 'I think about helpers. Giving out free snacks is easier. Selling meals means helpers take orders and handle money. Different work!',
        'coo', 'I run our planes. Free snacks are simpler - everyone gets the same thing. Meals need more storage and preparation. Operations matter!'
    ),
    get_lens_multipliers('product'),
    ARRAY['snacks', 'airlines', 'food', 'elementary']
);

-- PROCESS: Faster Boarding
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Getting on the Plane Faster',
    'Getting everyone on the plane takes a long time. Should we call people by row numbers to board? Or let families with kids go first? Both ways help, but differently.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want smooth boarding. Row numbers might be fastest. But families with kids need extra time. What makes everyone happiest?',
        'cfo', 'I count time. Every minute on the ground costs money. Faster boarding saves money! But unhappy families might not fly with us again.',
        'cmo', 'I think about families. Parents with kids appreciate help getting on first. That kindness makes us look good!',
        'cto', 'I work with technology. Our system can show which boarding method works fastest. We can track and test different ways!',
        'chro', 'I think about helpers. Row boarding is clear and simple. Family-first boarding requires helpers to check for kids. Different training!',
        'coo', 'I watch boarding every day. Families with kids DO need more time. But we want everyone on quickly. Maybe combine both ideas?'
    ),
    get_lens_multipliers('process'),
    ARRAY['boarding', 'airlines', 'speed', 'elementary']
);

-- PLACE: Which Cities to Fly To
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Fun Cities or Business Cities?',
    'Should we fly to fun vacation cities like Orlando? Or business cities where grown-ups work? Vacation cities are fun for families. Business cities have lots of travelers.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I choose where we fly. Vacation cities make kids happy! Business cities keep us busy year-round. Both types of cities are valuable!',
        'cfo', 'I count passengers. Vacation flights are full during summer and holidays. Business flights are steady all year. Which makes more money total?',
        'cmo', 'I tell people about our flights. "We fly to Disney World!" is exciting for families. "We fly to big cities!" is good for everyone.',
        'cto', 'I manage bookings. Technology shows which routes people want. Data helps us pick the best cities!',
        'chro', 'I think about helpers. Vacation routes mean busier summers. Business routes mean steady work all year. Different staffing!',
        'coo', 'I plan flights. Vacation cities need bigger planes during holidays. Business cities need flights every day. Different operations!'
    ),
    get_lens_multipliers('place'),
    ARRAY['destinations', 'airlines', 'cities', 'elementary']
);

-- PROMOTION: How to Tell People About Us
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'TV Commercials or Airplane Paint?',
    'Should we make fun TV commercials kids see? Or paint our planes with bright, fun colors? Commercials reach lots of people. Painted planes look exciting at airports!',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want people to remember us. TV reaches people at home. Colorful planes make impressions at airports. Both catch attention!',
        'cfo', 'I watch spending. TV commercials cost a lot of money. Painting planes costs money once but lasts years. Which is smarter?',
        'cmo', 'This is my job! TV commercials tell our story. Bright planes become our brand - kids point and say "That''s our airplane!" I like both!',
        'cto', 'I think about technology. We can share TV commercials online too! And photos of our colorful planes on social media!',
        'chro', 'I think about helpers. Colorful planes make our workers proud! They like working for a fun, bright company.',
        'coo', 'I manage planes. Special paint needs extra care and costs more. But it definitely makes us stand out at airports!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['advertising', 'airlines', 'branding', 'elementary']
);

-- PRICE: Ticket Prices
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Lower Ticket Prices',
    'Plane tickets cost a lot. Should we make them cheaper so more families can fly? Or keep prices the same so we have money to run great flights? Helping families vs. running our business.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SKYCONNECT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want flying to be possible for families. Lower prices help more people fly. But planes are expensive to run safely!',
        'cfo', 'This is my job! If we lower prices, we need many more passengers to make the same money. Can our planes hold that many people?',
        'cmo', 'I market our flights. Lower prices sound great! "Affordable family flights!" But people also trust higher prices mean good service.',
        'cto', 'I use technology. Our systems can show when empty seats could be sold cheaper. Smart pricing helps!',
        'chro', 'I think about helpers. Lower prices might mean busier flights. That''s more work! We need enough helpers for more passengers.',
        'coo', 'I run operations. Full planes make sense! But we need to make enough money to pay for fuel, helpers, and keeping planes safe.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'airlines', 'affordability', 'elementary']
);

-- ========================================
-- GREENGRID_ELEM (Elementary) - 6 Challenges
-- Power company, 250 helpers
-- ========================================

-- PEOPLE: Helpful Power Workers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Workers Who Fix Power Fast',
    'When storms knock out power, we need workers who can fix things quickly. Should they also be really good at explaining to families when power will come back? Fast work or good explaining?',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our power company. Families need power back fast! But they also want to know what''s happening. Both matter!',
        'cfo', 'I count money. Fast repairs save money. Good communication makes families happier. Which is more important for our business?',
        'cmo', 'I tell families about us. When power is out, good communication shows we care! That builds trust.',
        'cto', 'I work with systems. Technology can help! Workers can use apps to update families while they fix problems!',
        'chro', 'I hire helpers. Technical skills take time to learn. Communication skills can be taught. What should we focus on when hiring?',
        'coo', 'I coordinate repairs. During big storms, fixing power quickly helps the most families. But scared families need updates too!'
    ),
    get_lens_multipliers('people'),
    ARRAY['power', 'repairs', 'communication', 'elementary']
);

-- PRODUCT: Clean Energy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Solar Power or Regular Power?',
    'Should we make power from the sun using solar panels? Or use regular power plants? Solar is clean and good for Earth. Regular power plants are what we know.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about the future. Solar power is clean! But we need power even when it''s cloudy. Maybe we can use both?',
        'cfo', 'I watch money. Solar panels cost a lot to start, but sunshine is free! Regular power costs less to start but fuel costs money forever.',
        'cmo', 'I tell families about our power. "Clean energy from the sun!" sounds amazing! Families care about helping Earth.',
        'cto', 'I work with technology. Solar panels are technology! I can help us learn to use sun power well.',
        'chro', 'I train helpers. Solar power is new - helpers need to learn. Regular power is what our workers already know.',
        'coo', 'I manage power delivery. Solar only works when sun shines. We need backup power for nighttime! Operations are tricky.'
    ),
    get_lens_multipliers('product'),
    ARRAY['solar', 'power', 'clean_energy', 'elementary']
);

-- PROCESS: Reading Electric Meters
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Smart Meters or Helper Visits?',
    'Should we use smart meters that tell us power use automatically? Or have helpers visit homes to read meters? Smart meters are automatic. Helper visits are personal.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about the best way to work. Smart meters are modern! But some families like seeing our friendly helpers.',
        'cfo', 'I count costs. Smart meters cost money to install. But helper visits cost money every month forever. Which costs less over time?',
        'cmo', 'I think about families. Smart meters are convenient - no waiting for meter readers! But friendly visits create connections.',
        'cto', 'I love technology! Smart meters send information instantly. I can make sure they work perfectly. This is what I do!',
        'chro', 'I think about helpers. Smart meters mean we need fewer meter readers. Some helpers might need different jobs.',
        'coo', 'I run operations. Smart meters work all the time, even holidays! Helper visits need schedules. Automation is simpler!'
    ),
    get_lens_multipliers('process'),
    ARRAY['meters', 'power', 'technology', 'elementary']
);

-- PLACE: Where to Build Power Plants
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Near City or Far Away?',
    'Should we build power plants close to cities where people live? Or far away where there''s more space? Close is convenient. Far away means more land for solar panels.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I pick where we build. Near cities means power travels less distance. Far away means more room for equipment. Both have good reasons!',
        'cfo', 'I count costs. Land near cities costs more! Far away land is cheaper. But long power lines cost money too.',
        'cmo', 'I tell families about us. Solar farms are pretty! But people might not want them blocking their view. Location matters for neighbors!',
        'cto', 'I manage power delivery. Technology can send power long distances. But some energy gets lost. Closer is more efficient!',
        'chro', 'I think about workers. Power plants need helpers. Far locations are harder for workers to reach every day.',
        'coo', 'I run facilities. Maintenance is easier close by. Emergency repairs in far locations take longer. Distance affects operations!'
    ),
    get_lens_multipliers('place'),
    ARRAY['location', 'power', 'facilities', 'elementary']
);

-- PROMOTION: Teaching About Energy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'School Programs About Saving Power',
    'Should we visit schools to teach kids about saving electricity? This costs time and money but helps families use less power. Teaching vs. just providing power.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want to help families. Teaching kids to save power helps Earth AND saves families money. That''s good even if we sell less power!',
        'cfo', 'I count money. If families use less power, we make less money. But programs make families like us more. Which matters more?',
        'cmo', 'I tell our story. Teaching kids shows we care about more than money! We care about Earth and families. Great message!',
        'cto', 'I can help! We can make fun computer games that teach energy saving. Technology makes learning fun!',
        'chro', 'I think about workers. Helpers visiting schools is extra work. But it might make them feel proud of helping kids learn!',
        'coo', 'I manage schedules. School visits take time away from other work. But happy, educated customers are valuable!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['education', 'power', 'conservation', 'elementary']
);

-- PRICE: Electric Bills
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Helping Families Pay Bills',
    'Electricity bills can be expensive. Should we let families pay a little bit each month instead of big bills? Smaller payments are easier but take longer.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'GREENGRID_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want to help families. Big bills can be hard to pay. Spreading costs out helps families budget their money better!',
        'cfo', 'I manage money. Smaller monthly payments mean we wait longer for our money. But happy customers pay their bills! Which is better?',
        'cmo', 'I think about families. Offering payment plans shows we understand families struggle sometimes. That builds loyalty!',
        'cto', 'I handle billing systems. Technology makes payment plans easy to track. I can set up automatic monthly payments!',
        'chro', 'I think about helpers. Payment plans mean more paperwork and tracking. Our billing helpers need good systems!',
        'coo', 'I run operations. Payment plans help families but require more tracking. Good systems make this workable!'
    ),
    get_lens_multipliers('price'),
    ARRAY['billing', 'power', 'payment_plans', 'elementary']
);

-- ========================================
-- CLOUDPEAK_ELEM (Elementary) - 6 Challenges
-- App and game maker company, 180 helpers
-- ========================================

-- PEOPLE: Helpful Programmers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Finding Great Programmers',
    'We make apps and games on computers. Should our helpers be really creative and think of cool new ideas? Or should they be really careful and make sure everything works perfectly? Both skills are helpful!',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our app company. Creative helpers make exciting new games! Careful helpers make sure nothing breaks. We need both kinds!',
        'cfo', 'I count money. Creative helpers might make popular apps. Careful helpers mean fewer bugs to fix. Both save us money in different ways!',
        'cmo', 'I tell people about our apps. Creativity makes fun games kids love! Reliability means games work great. Both make good selling points!',
        'cto', 'I understand programming! Being creative AND careful is best. Maybe I can teach helpers to be both!',
        'chro', 'I hire helpers. Creative people think differently than careful people. What type fits our company best right now?',
        'coo', 'I make sure work gets done. Creative helpers are exciting but sometimes unpredictable. Careful helpers are steady. Both matter!'
    ),
    get_lens_multipliers('people'),
    ARRAY['programming', 'creativity', 'quality', 'elementary']
);

-- PRODUCT: Apps or Games
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Educational Apps or Fun Games?',
    'Should we make apps that help kids learn math and reading? Or make fun games kids play for entertainment? Learning apps help school. Fun games make kids happy.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about our purpose. Educational apps help kids learn - that''s important! Fun games make kids happy - that''s important too!',
        'cfo', 'I watch money. Parents buy learning apps for kids. Kids ask parents for fun games. Both can sell well!',
        'cmo', 'I advertise our apps. "Help your child learn!" is great for parents. "Super fun games!" is great for kids. Different messages!',
        'cto', 'I make the apps. Learning apps and fun games use similar technology. We could make either one really well!',
        'chro', 'I think about helpers. Educational apps need people who understand how kids learn. Game helpers need to know what''s fun!',
        'coo', 'I coordinate projects. Learning apps take longer to research. Fun games can be made faster. Different timelines!'
    ),
    get_lens_multipliers('product'),
    ARRAY['apps', 'games', 'education', 'elementary']
);

-- PROCESS: Testing Apps
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Making Sure Apps Work',
    'Before we release apps, should we test them really carefully ourselves? Or let kids try them and tell us what doesn''t work? We can test. Or kids can test.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want great apps. Our testing finds technical problems. Kid testing shows if apps are actually fun and make sense!',
        'cfo', 'I count costs. Our testing is free but slow. Kid testing costs money but shows what really works. Which is smarter?',
        'cmo', 'I think about customers. Kid testers show us what real kids like! That makes better products kids actually want.',
        'cto', 'I run technical testing. Our helpers find bugs. But kids find confusing parts we might miss. Both types of testing help!',
        'chro', 'I manage people. We have testers on our team already. Kid testing means finding kids and organizing tests. More work!',
        'coo', 'I watch our process. In-house testing is faster and private. Kid testing takes longer but gives real feedback. Trade-offs!'
    ),
    get_lens_multipliers('process'),
    ARRAY['testing', 'quality', 'apps', 'elementary']
);

-- PLACE: Where to Sell Apps
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'App Store or Our Website?',
    'Should we sell apps in the App Store where everyone shops? Or sell them on our own website? App Store reaches more people but takes some of our money. Website lets us keep all the money.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about reaching customers. App Store has millions of shoppers! Our website needs people to find it first.',
        'cfo', 'This is my area! App Store takes 30% of sales. But we''d make way more sales. Website keeps 100% but sells less. Math time!',
        'cmo', 'I market apps. Being in the App Store is like being in a huge mall - automatic advertising! Website shopping needs us to tell people.',
        'cto', 'I handle technology. App Store handles all the technical stuff. Our own website means we build and maintain everything ourselves.',
        'chro', 'I think about work. App Store is simple - they handle most things. Website selling means more helpers needed for support.',
        'coo', 'I run operations. App Store does payments, downloads, updates automatically. Website means we do all that work!'
    ),
    get_lens_multipliers('place'),
    ARRAY['distribution', 'apps', 'sales', 'elementary']
);

-- PROMOTION: How to Tell People
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'YouTube Videos or School Visits?',
    'Should we make fun YouTube videos showing our apps? Or visit schools to let kids try them? Videos reach lots of kids online. School visits let kids touch and try apps.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about spreading the word. YouTube reaches kids everywhere! School visits create hands-on experiences. Both work!',
        'cfo', 'I watch budgets. YouTube videos cost money to make but last forever. School visits cost travel money for each visit. Which works better?',
        'cmo', 'This is what I do! YouTube videos go viral and get shared. School visits build trust with teachers and parents. I like both strategies!',
        'cto', 'I can help! I can make interactive YouTube videos. And I can prepare special demo tablets for school visits!',
        'chro', 'I think about helpers. YouTube needs video makers. School visits need presenters who love talking to kids. Different skills!',
        'coo', 'I coordinate activities. YouTube is one-time effort with lasting reach. School visits need ongoing scheduling. Different operations!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'youtube', 'schools', 'elementary']
);

-- PRICE: App Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Free Apps or Apps That Cost Money?',
    'Should our apps be free for everyone? Or charge $3 per app? Free apps get downloaded more. Paid apps make money from each download.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'CLOUDPEAK_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I balance business and users. Free apps reach everyone! But we need money to keep making great apps. What''s the right choice?',
        'cfo', 'This is my job! Free apps get lots of downloads but no money. $3 apps get fewer downloads but make money. 10,000 free downloads or 1,000 paid?',
        'cmo', 'I think about users. Kids can''t easily buy apps. Parents buy apps for kids. Free with ads? Paid with no ads? Many options!',
        'cto', 'I build apps. Free apps can have ads to make money. Paid apps should have no ads. Technology supports both models!',
        'chro', 'I think about our team. Making money means we can hire more helpers to make more great apps! Business success matters.',
        'coo', 'I watch operations. Free apps with lots of users need more servers - costs money! Paid apps with fewer users cost less to run.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'apps', 'free', 'elementary']
);

-- ========================================
-- MEDICORE_ELEM (Elementary) - 6 Challenges
-- Doctor's office and health helper, 120 helpers
-- ========================================

-- PEOPLE: Friendly Doctors and Nurses
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Doctors Who Are Good Listeners',
    'Should our doctors be really smart about medicine? Or really good at listening to patients and being kind? Being smart helps find problems. Being kind makes patients feel safe.',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our medical office. Smart doctors diagnose well. Kind doctors make patients comfortable and willing to share symptoms. Both are important!',
        'cfo', 'I watch our finances. Happy patients come back and recommend us. Smart doctors solve problems faster. Both help our business!',
        'cmo', 'I tell people about our office. "Kind, caring doctors!" makes families feel safe. "Expert medical care!" builds trust. Great doctors are both!',
        'cto', 'I manage our medical technology. Tech can help doctors be smarter with information. But it can''t replace human kindness!',
        'chro', 'I hire doctors. Medical knowledge comes from school. Listening skills come from caring about people. I can look for both!',
        'coo', 'I run our office. Kind doctors sometimes take extra time with scared kids. Smart doctors work efficiently. We need balance!'
    ),
    get_lens_multipliers('people'),
    ARRAY['healthcare', 'doctors', 'kindness', 'elementary']
);

-- PRODUCT: Services to Offer
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Checkups or Sick Visits?',
    'Should we focus on healthy checkups where we make sure kids are growing well? Or focus on sick visits when kids don''t feel good? Checkups prevent problems. Sick visits fix problems.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about our mission. Checkups keep kids healthy - prevention! Sick visits help kids feel better - treatment! Both help kids.',
        'cfo', 'I count money. Checkups are scheduled and steady. Sick visits are unpredictable - some days busy, some quiet. Which works better?',
        'cmo', 'I tell families about our services. "Keep your kids healthy!" is checkup message. "We help kids feel better fast!" is sick visit message.',
        'cto', 'I manage scheduling. Checkups can be booked weeks ahead. Sick visits need same-day slots. Different scheduling technology!',
        'chro', 'I think about helpers. Checkups are calm and planned. Sick visits can be stressful with worried parents. Different pace!',
        'coo', 'I run operations. Checkups are predictable and organized. Sick visits need flexibility and quick response. Both need different planning!'
    ),
    get_lens_multipliers('product'),
    ARRAY['healthcare', 'services', 'prevention', 'elementary']
);

-- PROCESS: Appointment System
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Phone Calls or Website Booking?',
    'Should families call us on the phone to make appointments? Or book appointments on our website themselves? Phone calls are personal. Website booking works anytime.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want what works best for families. Some like talking to people. Some like doing things online. Maybe we should offer both?',
        'cfo', 'I count costs. Phone answering needs helpers during business hours. Website works 24/7 with no extra helpers! Websites might save money.',
        'cmo', 'I think about family experience. Phone calls feel caring and personal. Websites feel modern and convenient. Both are good for different families!',
        'cto', 'I love technology! I can build an easy booking website. Parents can book appointments at bedtime when they remember!',
        'chro', 'I manage helpers. Phone booking needs receptionists. Website booking needs tech support people. Different types of helpers!',
        'coo', 'I run the office. Phone scheduling during busy times creates long holds. Website booking doesn''t have wait times! Efficiency matters!'
    ),
    get_lens_multipliers('process'),
    ARRAY['scheduling', 'healthcare', 'technology', 'elementary']
);

-- PLACE: Office Location
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Near School or Near Home?',
    'Should we open a new office near schools where parents can stop by after school? Or in neighborhoods where families live? Different locations help different families.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I choose locations. Near schools helps working parents. Near homes is convenient for sick kids. Both make sense!',
        'cfo', 'I analyze money. School locations are busy after school. Neighborhood locations serve families all day. Which gets more patients?',
        'cmo', 'I tell families about our office. "Convenient after-school care!" or "Right in your neighborhood!" Both are good messages!',
        'cto', 'I set up office technology. Both locations need the same computers and equipment. Location doesn''t change my work much.',
        'chro', 'I staff offices. School locations need more helpers in afternoon. Neighborhood offices need helpers spread through the day.',
        'coo', 'I run facilities. School locations have busy times and quiet times. Neighborhoods have steadier flow. Different patterns!'
    ),
    get_lens_multipliers('place'),
    ARRAY['location', 'healthcare', 'convenience', 'elementary']
);

-- PROMOTION: Building Trust
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Health Fair or Facebook Posts?',
    'Should we hold health fairs at schools with free checkups? Or post helpful health tips on Facebook and Instagram? Fairs are in-person. Social media reaches more families.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want families to know us. Health fairs let families meet our doctors in person! Social media shares helpful info and builds trust online.',
        'cfo', 'I watch costs. Health fairs cost money to organize. Social media is cheaper. But which brings more new patients?',
        'cmo', 'This is my job! Fairs create real connections and show we care about community. Social media reaches thousands. Both build our reputation!',
        'cto', 'I can help! Social media posts can share photos from health fairs! We can do both and they help each other!',
        'chro', 'I think about helpers. Fairs need doctors and nurses to volunteer time. Social media needs someone to write posts. Different work!',
        'coo', 'I coordinate events. Fairs are big one-time efforts. Social media is ongoing daily work. Both need planning!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'healthcare', 'community', 'elementary']
);

-- PRICE: Visit Costs
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Lower Prices for Families',
    'Doctor visits cost a lot. Should we lower our prices so more families can afford care? Or keep current prices to pay our helpers well? Helping more families vs. sustaining business.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'MEDICORE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want to help all families. Lower prices help more kids get care - that''s our mission! But we need money to keep great doctors and nurses.',
        'cfo', 'This is about money. Lower prices need many more patients to make same money. Can we handle more patients? Do we have room?',
        'cmo', 'I think about families. Affordable care is a strong message! But people also trust that good care costs appropriate money.',
        'cto', 'I manage systems. More patients means busier schedules and longer waits. Our technology needs to handle increased volume!',
        'chro', 'I think about helpers. We need good pay to keep great doctors and nurses. But our helpers also want to help families afford care!',
        'coo', 'I run operations. Lower prices with more patients could work! But we need more rooms, equipment, and helpers. Expansion costs money too!'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'healthcare', 'affordability', 'elementary']
);

-- ========================================
-- NEXTGEN_ELEM (Elementary) - 6 Challenges
-- Tutoring and learning helper, 100 helpers
-- ========================================

-- PEOPLE: Great Tutors
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Teachers or College Students?',
    'Should we hire real teachers to tutor kids? Or hire college students who love helping kids learn? Teachers have experience. College students are closer in age and energetic.',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our tutoring company. Teachers know teaching methods really well! College students relate to kids and make learning fun!',
        'cfo', 'I watch money. Teachers charge more per hour. College students charge less. But which type helps kids learn better?',
        'cmo', 'I tell parents about us. "Experienced teachers!" sounds professional. "Enthusiastic college mentors!" sounds energetic. Different appeals!',
        'cto', 'I set up our learning tools. Both types can use our educational technology. The person matters more than the tech!',
        'chro', 'I hire tutors. Teachers have certificates and experience. College students need more training. Both can be great with right support!',
        'coo', 'I schedule tutoring. Teachers might have daytime teaching jobs. College students have flexible schedules. Availability matters!'
    ),
    get_lens_multipliers('people'),
    ARRAY['tutoring', 'education', 'hiring', 'elementary']
);

-- PRODUCT: What Subjects
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'All Subjects or Just Math and Reading?',
    'Should we help kids with all school subjects? Or focus only on math and reading? All subjects help with homework. Math and reading are what kids need most.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about our focus. Being THE BEST at math and reading is powerful! Helping with all subjects serves more student needs.',
        'cfo', 'I count money. Specializing in math and reading means fewer tutors needed. All subjects means hiring experts in science, history, etc.',
        'cmo', 'I market our services. "Math and reading experts!" is clear and focused. "Complete homework help!" is broad and helpful. Both good!',
        'cto', 'I build learning tools. Math and reading have lots of great apps and programs! Other subjects have fewer digital tools available.',
        'chro', 'I hire tutors. Finding great math and reading tutors is easier. Finding experts in ALL subjects is much harder!',
        'coo', 'I manage tutoring. Focused subjects mean simpler scheduling. All subjects need more tutors with different expertise. Complexity!'
    ),
    get_lens_multipliers('product'),
    ARRAY['tutoring', 'subjects', 'education', 'elementary']
);

-- PROCESS: One-on-One or Small Groups
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Private Tutoring or Group Classes?',
    'Should each kid get a private tutor just for them? Or have small groups of 3-4 kids learn together? Private is personal. Groups are social and fun.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about learning. One-on-one means all attention on one kid! Groups let kids learn from each other. Both work differently!',
        'cfo', 'I count costs. Private tutoring is expensive for families. Group classes cost less per family. Which do parents want to pay for?',
        'cmo', 'I market learning. "Personal attention!" sells private tutoring. "Learn with friends!" sells group classes. Different value messages!',
        'cto', 'I provide learning technology. Both formats can use the same digital tools and apps. Format doesn''t change tech needs!',
        'chro', 'I schedule tutors. One tutor helps four kids in group vs. one kid privately. Groups are more efficient with helper time!',
        'coo', 'I run sessions. Private tutoring needs more time slots. Group classes fit more kids in less time. Efficiency differs!'
    ),
    get_lens_multipliers('process'),
    ARRAY['tutoring', 'teaching_format', 'education', 'elementary']
);

-- PLACE: Learning Center or Online
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Building or Video Calls?',
    'Should kids come to our learning center building for tutoring? Or have tutoring through video calls at home? In-person is traditional. Online is convenient.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I decide how we serve families. Learning centers create focused study space. Online tutoring works from home. Both have benefits!',
        'cfo', 'I count costs. Buildings need rent, furniture, utilities. Online needs good technology. Which costs less but works well?',
        'cmo', 'I think about families. Some parents like dropping kids at a learning center. Others love the convenience of online from home!',
        'cto', 'I handle technology! I can make online tutoring really great with digital whiteboards and fun tools!',
        'chro', 'I think about tutors. Some tutors love in-person connection. Others like working from home online. Different preferences!',
        'coo', 'I manage operations. Buildings need cleaning and maintenance. Online needs strong internet and tech support. Different challenges!'
    ),
    get_lens_multipliers('place'),
    ARRAY['location', 'online', 'education', 'elementary']
);

-- PROMOTION: Parent Reviews or School Partnerships
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Happy Parent Stories or School Flyers?',
    'Should we ask happy parents to tell other parents about us? Or partner with schools to send home flyers? Word-of-mouth is trusted. School flyers reach everyone.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want to reach families. Parents trust other parents! Schools reach every family with kids. Both spread the word!',
        'cfo', 'I watch spending. Parent word-of-mouth is free but slow. School partnerships might cost money but reach many families quickly!',
        'cmo', 'This is my area! Parent reviews are most trusted - real experiences! School flyers give us credibility. I want both!',
        'cto', 'I build systems. I can create a website where happy parents share stories! And make digital flyers schools can email!',
        'chro', 'I think about relationships. Building parent ambassadors takes time. School partnerships need good relationships with principals.',
        'coo', 'I manage outreach. Parent referrals happen naturally over time. School flyers are organized campaigns. Different approaches!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'education', 'word_of_mouth', 'elementary']
);

-- PRICE: Pricing Plans
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pay Per Session or Monthly?',
    'Should families pay $40 each time they come for tutoring? Or pay $150 per month for unlimited sessions? Pay-per-session is flexible. Monthly is predictable.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'NEXTGEN_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about what families need. Pay-per-session helps families trying us out. Monthly plans help families commit to regular learning!',
        'cfo', 'This is my job! Monthly plans give us predictable money each month. Pay-per-session varies but no commitment needed. Which is better?',
        'cmo', 'I market pricing. "$40 per session, no commitment!" sounds low-risk. "$150/month unlimited!" sounds like a great deal for frequent users!',
        'cto', 'I handle billing systems. Both pricing models are easy to set up in our software. Technology supports either choice!',
        'chro', 'I think about tutors. Monthly plans mean predictable schedules. Pay-per-session means varying weekly hours. Staffing is different!',
        'coo', 'I run sessions. Monthly unlimited might mean some kids come a lot! We need enough tutors and time slots. Capacity planning!'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'education', 'subscription', 'elementary']
);

-- ========================================
-- PLAYFORGE_ELEM (Elementary) - 6 Challenges
-- Toy and game maker company, 160 helpers
-- ========================================

-- PEOPLE: Creative Toy Designers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Artists or Engineers?',
    'Should we hire artistic people who draw cool toy designs? Or engineers who figure out how toys work? Artists make toys beautiful. Engineers make toys work well.',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our toy company. Beautiful toys catch kids'' eyes on shelves! Working well keeps kids playing. Both matter!',
        'cfo', 'I count money. Artistic toys might sell more because they look cool. Well-engineered toys have fewer returns. Both save money!',
        'cmo', 'I market toys. Pretty toys photograph well for ads! Durable toys get good reviews from parents. Both help sales!',
        'cto', 'I understand how things work. Great toys need art AND engineering! Maybe we can have both types of helpers working together!',
        'chro', 'I hire people. Artists and engineers think differently. We might need both on our team! They can learn from each other.',
        'coo', 'I make toys happen. Beautiful designs need to be actually buildable! Both skills are needed to make great toys!'
    ),
    get_lens_multipliers('people'),
    ARRAY['toys', 'design', 'engineering', 'elementary']
);

-- PRODUCT: Toy Types
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Action Figures or Building Sets?',
    'Should we make action figures that kids play pretend with? Or building sets where kids create things? Action figures are popular. Building sets help learning.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I choose our toy types. Action figures are classic toys! Building sets teach while kids play. Both are great toys!',
        'cfo', 'I watch money. Action figures might sell more units. Building sets cost more but sell for higher prices. Different profit math!',
        'cmo', 'I advertise toys. Action figures from movies and shows are exciting! Building sets appeal to parents who value learning. Different buyers!',
        'cto', 'I think about making toys. Action figures need molds and painting. Building sets need precise pieces that fit together. Different manufacturing!',
        'chro', 'I think about helpers. Designing characters is different than designing building systems. Different creative skills needed!',
        'coo', 'I manage production. Action figures have many small parts. Building sets need pieces that work together perfectly. Different quality control!'
    ),
    get_lens_multipliers('product'),
    ARRAY['toys', 'products', 'play', 'elementary']
);

-- PROCESS: Testing Toys
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Safety Testing or Fun Testing?',
    'Before selling toys, should we focus on safety testing to make sure they''re not dangerous? Or fun testing to make sure kids really enjoy them? Safety is important. Fun is important.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our company. Safety is absolutely required - kids must be safe! Fun determines if toys succeed. We need both!',
        'cfo', 'I count costs. Safety testing is required by law - we must do it. Fun testing costs extra. Is extra testing worth it?',
        'cmo', 'I market toys. Parents need to know toys are safe! Kids need to know toys are fun! Both messages matter for sales.',
        'cto', 'I manage testing. Safety testing checks for hazards. Fun testing watches kids play. Both types of testing help us make better toys!',
        'chro', 'I think about testers. Safety testing needs technical experts. Fun testing needs watching kids play. Different types of work!',
        'coo', 'I run production. Safety testing prevents recalls - that''s critical! Fun testing prevents poor sales. Both protect our business!'
    ),
    get_lens_multipliers('process'),
    ARRAY['toys', 'testing', 'safety', 'elementary']
);

-- PLACE: Where to Sell
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Toy Stores or Online?',
    'Should we sell toys in toy stores where kids can see and touch them? Or sell online where anyone can buy them? Stores let kids see toys. Online reaches everywhere.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I decide distribution. Toy stores create excitement - kids begging parents! Online shopping is convenient and reaches everyone. Both work!',
        'cfo', 'I count profits. Stores take a cut of our money. Online selling lets us keep more. But stores buy in huge quantities!',
        'cmo', 'I think about marketing. Toys on store shelves are advertising! Online needs us to bring customers to websites. Different marketing!',
        'cto', 'I handle systems. Selling to stores is simpler - big orders. Online means packaging and shipping individual toys. More complex!',
        'chro', 'I think about work. Store selling needs salespeople. Online needs website managers and shipping helpers. Different jobs!',
        'coo', 'I manage distribution. Stores want delivery to warehouses. Online needs shipping each toy to homes. Completely different operations!'
    ),
    get_lens_multipliers('place'),
    ARRAY['distribution', 'toys', 'retail', 'elementary']
);

-- PROMOTION: Toy Commercials
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'TV Commercials or Unboxing Videos?',
    'Should we make TV commercials during kids'' shows? Or send toys to YouTubers who make unboxing videos? TV reaches lots of kids. YouTube videos feel real and honest.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want kids to see our toys. TV commercials are traditional and powerful! YouTube unboxings feel authentic and exciting. Different approaches!',
        'cfo', 'I watch ad budgets. TV commercials cost a lot of money! YouTube unboxings cost less - just sending free toys. Better return?',
        'cmo', 'This is my specialty! TV commercials show toys in best light. Unboxing videos show real reactions - kids trust that! Both create buzz!',
        'cto', 'I think digital. YouTube videos live forever and get shared! TV commercials air once then gone. Lasting value matters!',
        'chro', 'I think about work. TV needs commercial production teams. YouTube needs sending toys and managing relationships. Different work!',
        'coo', 'I coordinate marketing. TV ads run on schedule we control. Unboxing videos depend on YouTubers'' timing. Less control!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'toys', 'advertising', 'elementary']
);

-- PRICE: Toy Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Affordable or Premium?',
    'Should our toys cost $10 so every kid can afford them? Or cost $30 for higher quality that lasts longer? Affordable helps more kids. Premium lasts years.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PLAYFORGE_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I balance business and mission. $10 toys mean more kids can play! $30 toys are higher quality and more profitable. What''s our identity?',
        'cfo', 'This is pricing! $10 needs huge volume to profit. $30 makes more per toy but sells fewer. Which math works better?',
        'cmo', 'I market toys. "Fun for everyone!" works for $10 toys. "Premium quality that lasts!" works for $30 toys. Different positioning!',
        'cto', 'I oversee manufacturing. $10 toys need cheap materials and simple designs. $30 toys use better materials and complex features. Different production!',
        'chro', 'I think about work. High volume $10 toys need more factory workers. Lower volume $30 toys need more skilled craftspeople.',
        'coo', 'I manage operations. Cheap toys sell fast but have lower margins. Expensive toys sell slower but profit more per unit. Trade-offs!'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'toys', 'quality', 'elementary']
);

-- ========================================
-- BUILDRIGHT_ELEM (Elementary) - 6 Challenges
-- Construction and building company, 140 helpers
-- ========================================

-- PEOPLE: Construction Workers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Experienced Builders or Training New Ones?',
    'Should we hire builders who already know how to build houses? Or hire new people and teach them? Experienced workers start fast. New workers learn our special way.',
    'People means the helpers who work at your business. Good helpers are friendly, work hard, and help make customers happy.',
    'people', 'people', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I lead our building company. Experienced builders work fast and make fewer mistakes! New workers can learn exactly our way of building.',
        'cfo', 'I watch money. Experienced builders cost more per hour. Training new builders costs time and money. Which works better long-term?',
        'cmo', 'I tell people about our work. "Expert builders!" sounds professional. "Trained in our quality methods!" also sounds good. Both work!',
        'cto', 'I manage building technology. Experienced workers know old methods. New workers learn new technology easier! Innovation matters!',
        'chro', 'I hire workers. This is my job! Experienced workers are hard to find. New workers are easier to find but need training investment.',
        'coo', 'I run job sites. Experienced workers need less supervision. New workers need guidance at first but become loyal team members!'
    ),
    get_lens_multipliers('people'),
    ARRAY['construction', 'hiring', 'training', 'elementary']
);

-- PRODUCT: What to Build
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Houses or Playgrounds?',
    'Should we build houses for families to live in? Or build playgrounds for kids to play in? Houses are big projects. Playgrounds make communities fun.',
    'Product means what you sell. Good products are things customers want to buy and enjoy.',
    'product', 'product', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I choose our focus. Families always need houses - steady work! Playgrounds make communities better. Both serve families differently!',
        'cfo', 'I count money. Houses cost a lot but take months to build. Playgrounds cost less but finish faster. Different project sizes!',
        'cmo', 'I market our services. "Building dream homes!" is emotional. "Creating play spaces!" is community-focused. Both are meaningful!',
        'cto', 'I think about tools. House building needs certain equipment. Playground building needs different tools. We can''t easily do both!',
        'chro', 'I manage workers. House builders and playground builders have different skills! We''d need to hire different types of helpers.',
        'coo', 'I run projects. Houses are one family at a time. Playgrounds serve whole communities. Different project management!'
    ),
    get_lens_multipliers('product'),
    ARRAY['construction', 'projects', 'community', 'elementary']
);

-- PROCESS: Building Methods
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Traditional Building or Pre-Made Parts?',
    'Should we build houses piece-by-piece on site like traditional building? Or use pre-made wall sections built in a factory? Traditional is custom. Pre-made is faster.',
    'Process means how we do our work. Good processes help us work faster and better.',
    'process', 'process', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about quality and speed. Traditional building is craftsmanship! Pre-made parts are modern and efficient. Both can be quality!',
        'cfo', 'I analyze costs. Pre-made parts cost more upfront but save labor time. Traditional is slower but more flexible. Which saves money?',
        'cmo', 'I market our method. "Handcrafted homes!" sounds special. "Modern efficient building!" sounds innovative. Different appeal!',
        'cto', 'I love new methods! Pre-made parts use factory precision and new technology. Traditional uses skill and experience. Both have merit!',
        'chro', 'I think about workers. Factory building needs factory workers. On-site building needs traditional craftspeople. Different skills!',
        'coo', 'I manage construction. Pre-made parts arrive on schedule - very organized! Traditional building is flexible but weather-dependent. Trade-offs!'
    ),
    get_lens_multipliers('process'),
    ARRAY['construction', 'methods', 'efficiency', 'elementary']
);

-- PLACE: Where to Build
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'City or Suburbs?',
    'Should we build in the city where land is expensive but lots of people live? Or in suburbs where land is cheaper and families want yards? Different locations need different building types.',
    'Place means where customers can find us. Good locations are easy to get to and where lots of customers are.',
    'place', 'place', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I choose where we build. Cities have lots of people who need homes! Suburbs have families wanting space and yards. Both need builders!',
        'cfo', 'I count profits. City land costs more but we can build apartments for many families. Suburb houses cost less but sell for less. Different economics!',
        'cmo', 'I market locations. "Urban living!" attracts young professionals. "Suburban family homes!" attracts parents. Different buyers!',
        'cto', 'I manage projects. City building needs working in tight spaces with rules. Suburb building has more space and freedom. Different challenges!',
        'chro', 'I think about workers. City jobs mean workers can take public transit. Suburb jobs need workers to drive. Logistics matter!',
        'coo', 'I run construction sites. City sites are cramped and complicated. Suburb sites have room for equipment and materials. Different operations!'
    ),
    get_lens_multipliers('place'),
    ARRAY['location', 'construction', 'real_estate', 'elementary']
);

-- PROMOTION: Finding Customers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Yard Signs or Website?',
    'Should we put big "BuildRight Built This!" signs in yards of finished houses? Or spend money on a great website showing our work? Signs are neighborhood advertising. Websites reach everyone.',
    'Promotion means telling people about your business. Good promotions help customers learn about you and want to visit.',
    'promotion', 'promotion', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I want people to know our work. Yard signs show neighbors real results! Websites let anyone find us online. Both spread the word!',
        'cfo', 'I watch marketing costs. Yard signs are cheap and last weeks! Websites cost money to build and maintain. Which brings more customers?',
        'cmo', 'This is my job! Yard signs create local buzz - neighbors talk! Websites show our best photos and all our work. I want both!',
        'cto', 'I can build amazing websites! Virtual tours, photo galleries, testimonials. Technology shows our work beautifully!',
        'chro', 'I think about work. Yard signs just need someone to place them. Websites need constant updating with new projects. Different effort!',
        'coo', 'I manage projects. Yard signs at each site is simple! Website updates need coordinating photos and descriptions. More work!'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['marketing', 'construction', 'advertising', 'elementary']
);

-- PRICE: Project Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Fixed Price or Hourly?',
    'Should we charge families one fixed price for the whole project? Or charge by the hour for our work? Fixed price is predictable. Hourly is fair if problems happen.',
    'Price means how much things cost. Good prices are fair for customers and make enough money for the business.',
    'price', 'price', 'easy', 'elementary',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BUILDRIGHT_ELEM' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'I think about fairness. Families like knowing total cost upfront! But what if we find surprises that cost more? Pricing is tricky!',
        'cfo', 'This is pricing! Fixed prices protect families but risk for us if costs go over. Hourly is safer for us but families worry about final cost!',
        'cmo', 'I think about customers. Families love fixed prices - they can plan their budget! Hourly feels uncertain and worries people.',
        'cto', 'I estimate projects. Good planning makes fixed pricing work! But unexpected problems happen. Hourly is safer when uncertainty exists.',
        'chro', 'I think about workers. Fixed price might mean rushing to finish. Hourly lets workers take time to do quality work!',
        'coo', 'I manage projects. Fixed price means we profit if efficient, lose if slow. Hourly is safer but families watch the clock. Different pressure!'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing', 'construction', 'contracts', 'elementary']
);

-- ========================================
-- COMPLETION
-- ========================================

-- All 180 challenges complete:
-- - 60 High School (in ccm_high_school_challenges.sql)
-- - 60 Middle School (in ccm_middle_school_challenges.sql)
-- - 60 Elementary (ALL COMPLETE in this file)

COMMENT ON FUNCTION get_lens_multipliers IS
'Returns standard lens multiplier JSON for each P category. Ensures consistency across all 180 challenges.';

COMMENT ON FUNCTION get_lens_multipliers IS
'Returns standard lens multiplier JSON for each P category. Ensures consistency across all challenges.';
