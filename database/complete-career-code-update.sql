-- Complete Career Code Update Script
-- Generated from CSV data
-- Run this entire script in Supabase SQL editor

-- Step 1: Add temporary field
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS career_code1 TEXT;

-- Step 2: Import all career codes from CSV
UPDATE career_paths SET career_code1 = 'youth-minister' WHERE id = '58494cf4-6ed7-4287-b976-84c7a1385b20'; -- Youth Minister
UPDATE career_paths SET career_code1 = 'crossing-guard' WHERE id = '6cdb2c96-5c90-4340-8dcf-fb984eab9ae8'; -- Crossing Guard
UPDATE career_paths SET career_code1 = 'grocery-worker' WHERE id = 'ad008276-665a-4ebc-85d3-0ba1bb48f724'; -- Grocery Store Worker
UPDATE career_paths SET career_code1 = 'janitor' WHERE id = 'a7136bbb-8a75-417d-9e36-5ba8301ad9b0'; -- Janitor
UPDATE career_paths SET career_code1 = 'cafeteria-worker' WHERE id = '08765612-7f6c-4776-94f0-7d4e617d22fc'; -- Cafeteria Worker
UPDATE career_paths SET career_code1 = 'game-developer' WHERE id = '9c422536-08e5-40ee-8aea-c73507a4e1b1'; -- Game Developer
UPDATE career_paths SET career_code1 = 'youtuber' WHERE id = '2879e602-2b6a-4296-8f5d-32ecbd80b9fc'; -- YouTuber/Content Creator
UPDATE career_paths SET career_code1 = 'voice-actor' WHERE id = 'fe1e5d5d-b886-45a6-8c39-1e28b7282d82'; -- Voice Actor
UPDATE career_paths SET career_code1 = 'character-artist' WHERE id = 'e150ced1-5fb3-488d-b25e-16bbc2a25db9'; -- Character Artist
UPDATE career_paths SET career_code1 = 'concept-artist' WHERE id = 'c9b7e71a-18cb-45f0-a020-e330ce1c0979'; -- Concept Artist
UPDATE career_paths SET career_code1 = 'sound-designer' WHERE id = '77534b0e-5ae8-4ddd-8c10-7bc6b76c12c6'; -- Sound Designer
UPDATE career_paths SET career_code1 = 'motion-capture' WHERE id = '75262ce6-5bd3-4d91-ada0-c48eed51902a'; -- Motion Capture Specialist
UPDATE career_paths SET career_code1 = 'narrative-designer' WHERE id = '5605a00f-f4fb-4c86-856d-8e40fba2a3b4'; -- Narrative Designer
UPDATE career_paths SET career_code1 = 'game-programmer' WHERE id = '56e8a971-6bb7-4dfe-8298-9e4059f10247'; -- Game Programmer
UPDATE career_paths SET career_code1 = 'it-support' WHERE id = '3ac6e4fa-546a-4738-a54c-4e078c679146'; -- IT Support
UPDATE career_paths SET career_code1 = 'education-consultant' WHERE id = '57eb77dd-0905-4370-89e8-c38100d65941'; -- Education Consultant
UPDATE career_paths SET career_code1 = 'ux-designer' WHERE id = 'a5c848b1-c816-4ca4-bf10-4ceb35b29bbc'; -- UX/UI Designer
UPDATE career_paths SET career_code1 = 'app-developer' WHERE id = '1cdebbc3-f1e4-4afb-b6de-fdcd86c5ad64'; -- Mobile App Developer
UPDATE career_paths SET career_code1 = 'animator' WHERE id = '552b5ae8-f6cd-449a-a8ea-95f52121eae4'; -- Animator
UPDATE career_paths SET career_code1 = 'ceo' WHERE id = 'dc17ee44-07b8-4960-b4fc-83dbabc40d04'; -- Chief Executive Officer
UPDATE career_paths SET career_code1 = 'dev-director' WHERE id = 'eeb1a622-086c-46ac-891b-4968b2524674'; -- Development Director
UPDATE career_paths SET career_code1 = 'impact-investor' WHERE id = '67915b21-0bdd-4f0a-8cc0-fb0d0ab54021'; -- Impact Investor
UPDATE career_paths SET career_code1 = 'humanitarian' WHERE id = 'a545d32e-0ee4-4d76-a17f-9d7658f546a2'; -- Humanitarian Aid Worker
UPDATE career_paths SET career_code1 = 'refugee-worker' WHERE id = '05332a5b-3bfe-459e-a6be-bdece0f006ab'; -- Refugee Support Worker
UPDATE career_paths SET career_code1 = 'united-nations-worker' WHERE id = 'beb56c84-7061-4d73-b922-1d1c91894ed0'; -- UN Program Officer
UPDATE career_paths SET career_code1 = 'peace-mediator' WHERE id = '7d78208a-654e-4af5-aa60-17ddc1815381'; -- International Mediator
UPDATE career_paths SET career_code1 = 'relief-director' WHERE id = 'f42a159d-3f5f-46bc-abed-7a12f55d700d'; -- Relief Operations Director
UPDATE career_paths SET career_code1 = 'global-health' WHERE id = '6ddfcaa7-3cb6-4a67-b201-6ddc466d0520'; -- Global Health Specialist
UPDATE career_paths SET career_code1 = 'archivist' WHERE id = 'befa21e0-e681-49cf-bee0-8d038a4f3de1'; -- Archivist
UPDATE career_paths SET career_code1 = 'research-librarian' WHERE id = '4b956879-88ed-4e32-b382-020099b7b7b0'; -- Research Librarian
UPDATE career_paths SET career_code1 = 'data-librarian' WHERE id = 'b6d1d099-3061-406f-a9bc-f2696b8a0ebf'; -- Data Librarian
UPDATE career_paths SET career_code1 = 'digital-archivist' WHERE id = '1eded60a-20cd-4cc9-b166-cab2fd5806dc'; -- Digital Archivist
UPDATE career_paths SET career_code1 = 'information-architect' WHERE id = '436dbea0-6a54-414f-a426-da4c58eec114'; -- Information Architect
UPDATE career_paths SET career_code1 = 'wildlife-rescue' WHERE id = '4681f0e1-ec2f-4ae2-9bba-7c1b250879e5'; -- Wildlife Rescuer
UPDATE career_paths SET career_code1 = 'conservationist' WHERE id = 'd2351f4b-b87d-448f-9cd7-c2d31644f578'; -- Conservation Scientist
UPDATE career_paths SET career_code1 = 'ai-engineer' WHERE id = 'c35e7e74-c55f-4287-8533-410834df1efe'; -- AI/ML Engineer
UPDATE career_paths SET career_code1 = 'senator' WHERE id = '01d4eea6-afd1-47fd-b13e-386fbd9ba16b'; -- Senator
UPDATE career_paths SET career_code1 = 'cybersecurity-specialist' WHERE id = '84aa0e3b-a51e-485f-8035-f0cebdb7e5f8'; -- Cybersecurity Specialist
UPDATE career_paths SET career_code1 = 'cloud-architect' WHERE id = 'dfd022b6-6e0b-48a3-82eb-1df4624a16fa'; -- Cloud Architect
UPDATE career_paths SET career_code1 = 'game-engine-dev' WHERE id = '50a53d5d-d720-45b5-b53a-602803af7b8d'; -- Game Engine Developer
UPDATE career_paths SET career_code1 = 'technical-artist' WHERE id = '8b0fdf92-b238-4cd2-b846-cb121b8a2216'; -- Technical Artist
UPDATE career_paths SET career_code1 = 'game-producer' WHERE id = '89b705d1-db07-4dff-873c-3a528adb6fea'; -- Game Producer
UPDATE career_paths SET career_code1 = 'game-director' WHERE id = '6b986464-611e-46ab-8bbd-48a528c807c8'; -- Game Director
UPDATE career_paths SET career_code1 = 'gameplay-engineer' WHERE id = '06ea890f-9012-4ec4-a456-4fba211d2c33'; -- Gameplay Engineer
UPDATE career_paths SET career_code1 = 'network-engineer' WHERE id = 'dfd78a3a-aa60-41cd-90bc-9c00c48ed220'; -- Network Engineer
UPDATE career_paths SET career_code1 = 'vr-developer' WHERE id = '86446eed-fa31-406b-a0cf-31e26299bd12'; -- VR/AR Developer
UPDATE career_paths SET career_code1 = 'game-econ-designer' WHERE id = '7d23a5ac-4d76-4ace-bc4a-5526e60cd75d'; -- Game Economy Designer
UPDATE career_paths SET career_code1 = 'ux-researcher' WHERE id = '9c34b92b-c4d8-4af0-a470-b0055f3b2d28'; -- UX Researcher
UPDATE career_paths SET career_code1 = 'streaming-engineer' WHERE id = '0f18b71c-f7ee-40c9-a425-50e3a94429a6'; -- Streaming Platform Engineer
UPDATE career_paths SET career_code1 = 'mission-worker' WHERE id = '6227e15b-9ae5-4869-9a61-2954ef9050de'; -- Missionary
UPDATE career_paths SET career_code1 = 'theologian' WHERE id = 'fb17a919-92b3-48cf-90f6-11cdbb3e288a'; -- Theologian
UPDATE career_paths SET career_code1 = 'content-strategist' WHERE id = 'bbda27ad-fd23-4531-ae0d-2c1921cf1275'; -- Content Strategist
UPDATE career_paths SET career_code1 = 'motion-designer' WHERE id = 'ff9a0dea-ef16-4fd7-ae70-0134a499afd8'; -- Motion Designer
UPDATE career_paths SET career_code1 = 'casting-director' WHERE id = 'b5d8f307-6826-4061-8b92-d9db8c840c80'; -- Casting Director
UPDATE career_paths SET career_code1 = 'legal-compl-officer' WHERE id = 'c8020789-694a-414d-8a5d-cd888234d263'; -- Compliance Officer
UPDATE career_paths SET career_code1 = 'business-dev-mgr' WHERE id = '3305b408-ea75-498a-8617-7684c8a543bb'; -- Business Development Manager
UPDATE career_paths SET career_code1 = 'videographer' WHERE id = 'cbb9dfc2-c94d-4e44-84e8-22168ae9e4f3'; -- Videographer
UPDATE career_paths SET career_code1 = 'supply-chain-mgr' WHERE id = '6a541272-7fe3-4096-811e-58b8fa04e16b'; -- Supply Chain Manager
UPDATE career_paths SET career_code1 = 'risk-analyst' WHERE id = '2721cb05-9f41-47c5-b7fd-832a40eb53e4'; -- Risk Analyst
UPDATE career_paths SET career_code1 = 'mergers-acquisition-spec' WHERE id = '1c71b6c2-55c9-48cf-b50f-1878ceae8e5e'; -- Mergers & Acquisitions Specialist
UPDATE career_paths SET career_code1 = 'auditor' WHERE id = 'f31a2bcd-69b6-4ba2-ac4d-f7ac98cc0750'; -- Auditor
UPDATE career_paths SET career_code1 = 'brand-strategist' WHERE id = 'ed8a941e-3c79-423f-ab8a-d579d9aeb791'; -- Brand Strategist
UPDATE career_paths SET career_code1 = 'customer-success-mgr' WHERE id = '4d1bf0d4-16ab-4e50-a8da-16cc0c5f362c'; -- Customer Success Manager
UPDATE career_paths SET career_code1 = 'security-analyst' WHERE id = '80773f6a-8bca-4edd-934c-3772f6df9dd7'; -- Security Analyst
UPDATE career_paths SET career_code1 = 'grant-writer' WHERE id = '0b4857af-f06a-4b40-9675-f8e4e183577a'; -- Grant Writer
UPDATE career_paths SET career_code1 = 'program-director' WHERE id = 'e487fa1d-d1b4-4068-8b66-a3affba12ebc'; -- Program Director
UPDATE career_paths SET career_code1 = 'foundation-director' WHERE id = '42abb4db-b093-4613-8f2f-74739e14ae04'; -- Foundation Director
UPDATE career_paths SET career_code1 = 'philanthropist' WHERE id = 'c6d93ebc-d69d-47c0-bf77-a2c34f69da75'; -- Philanthropist
UPDATE career_paths SET career_code1 = 'human-rights' WHERE id = '8a218e3c-a057-4a45-be71-0577bbd8ffaf'; -- Human Rights Advocate
UPDATE career_paths SET career_code1 = 'pastry-shef' WHERE id = '8ddfd606-7641-46f1-b979-c3139b12be1b'; -- Pastry Chef
UPDATE career_paths SET career_code1 = 'food-scientist' WHERE id = '8c52b7a6-8ee4-474f-9394-2b537bcf7d4a'; -- Food Scientist
UPDATE career_paths SET career_code1 = 'food-critic' WHERE id = 'fe0bf187-48e9-4583-ac43-d5f3aed76814'; -- Food Critic
UPDATE career_paths SET career_code1 = 'sommelier' WHERE id = 'ec64b022-d1b0-45f1-9600-ee681e49ea55'; -- Sommelier
UPDATE career_paths SET career_code1 = 'food-engineer' WHERE id = 'd2a27eef-8cbe-43a5-83ce-602d13d905c3'; -- Food Engineer
UPDATE career_paths SET career_code1 = 'environment-engineer' WHERE id = 'e1826360-42da-4ad0-a91f-a53b5d55b23f'; -- Environmental Engineer
UPDATE career_paths SET career_code1 = 'climate-scientist' WHERE id = '28d5b6f2-72fe-4bbc-ae42-bdcd75856bba'; -- Climate Scientist
UPDATE career_paths SET career_code1 = 'sustainability-mgr' WHERE id = 'dae28bab-3153-44d4-8fdd-0b74b86be2b9'; -- Sustainability Manager
UPDATE career_paths SET career_code1 = 'renewable-energy-spec' WHERE id = 'a728ccc1-2a9b-489b-b2fa-83499f48e32d'; -- Renewable Energy Specialist
UPDATE career_paths SET career_code1 = 'city-planner' WHERE id = '607d8196-968b-4d87-8df0-39fde71509dd'; -- City Planner
UPDATE career_paths SET career_code1 = 'non-profit-director' WHERE id = 'a12b9dfa-b921-4ef2-bfe5-48ac75d34c4d'; -- Nonprofit Director
UPDATE career_paths SET career_code1 = 'urban-designer' WHERE id = 'dc88a40f-4bb9-4253-88f4-18b91c6a77d2'; -- Urban Designer
UPDATE career_paths SET career_code1 = 'public-health-spec' WHERE id = '90d53af6-f87c-4179-ac4a-4ed4fb6615f1'; -- Public Health Specialist
UPDATE career_paths SET career_code1 = 'podcast-producer' WHERE id = 'd62954cd-0d8a-4285-a09b-9820a8c1037a'; -- Podcast Producer
UPDATE career_paths SET career_code1 = 'football-player' WHERE id = '150dbe34-febf-4227-bf2c-3df74dff2e51'; -- Football Player
UPDATE career_paths SET career_code1 = 'basketball-player' WHERE id = '4f5ae430-3465-44ec-844f-4604ddbc2d53'; -- Basketball Player
UPDATE career_paths SET career_code1 = 'tennis-player' WHERE id = 'e28dacde-da84-4c76-9104-071284ab74a0'; -- Tennis Player
UPDATE career_paths SET career_code1 = 'golfer' WHERE id = 'd269dd6e-0b20-4229-90ee-02cf61040b50'; -- Professional Golfer
UPDATE career_paths SET career_code1 = 'sports-agent' WHERE id = '8e64ccbb-7d81-44b6-bb88-5193fab92453'; -- Sports Agent
UPDATE career_paths SET career_code1 = 'sports-psychologist' WHERE id = 'd390d352-54d6-4ff3-a8dc-cf89bf1e3b34'; -- Sports Psychologist
UPDATE career_paths SET career_code1 = 'nfl-player' WHERE id = '276f70e7-c04b-4a9b-b33d-5847bc60111c'; -- NFL Player
UPDATE career_paths SET career_code1 = 'nba-player' WHERE id = '6a3d819e-8d55-4822-8ebd-a706be9a0ca0'; -- NBA Player
UPDATE career_paths SET career_code1 = 'mlb-player' WHERE id = '96bddc4c-b2ea-4fe6-882b-cc3b97944d2b'; -- MLB Player
UPDATE career_paths SET career_code1 = 'financial-advisor' WHERE id = '7f37f5fa-9084-448d-9ebf-a40fcf9842f3'; -- Financial Advisor
UPDATE career_paths SET career_code1 = 'mls-player' WHERE id = '3dbded1f-9475-408f-9b20-fe4cadc81398'; -- MLS Player
UPDATE career_paths SET career_code1 = 'olympic-athlete' WHERE id = 'c451449f-fb3c-4052-ab65-b8038c64d02b'; -- Olympic Athlete
UPDATE career_paths SET career_code1 = 'sports-general-mgr' WHERE id = '5a259c72-72fe-4822-a6e8-6c2d9dbc0e5e'; -- General Manager
UPDATE career_paths SET career_code1 = 'sports-doctor' WHERE id = '03bc80aa-a970-4647-b9d8-5b5d310212e2'; -- Sports Medicine Doctor
UPDATE career_paths SET career_code1 = 'sports-analyst' WHERE id = '8ef92022-bfa2-460c-9e5b-82b90f63483b'; -- Sports Analytics Director
UPDATE career_paths SET career_code1 = 'fitness-entrepreneur' WHERE id = 'c7d9a711-7927-4c6f-a385-131a2d07bc43'; -- Fitness Entrepreneur
UPDATE career_paths SET career_code1 = 'sports-lawyer' WHERE id = '98ae8282-bb42-4204-87bd-66578f3c5520'; -- Sports Lawyer
UPDATE career_paths SET career_code1 = 'sports-market-dir' WHERE id = '77e0c836-ab64-47a8-8ee9-9d6729502b6d'; -- Sports Marketing Director
UPDATE career_paths SET career_code1 = 'data-entry-spec' WHERE id = '21fa6562-f3c6-4688-b2a4-38bf22fee234'; -- Data Entry Specialist
UPDATE career_paths SET career_code1 = 'game-tester' WHERE id = '03a94311-c1b1-49c6-83ec-cefe8c68837c'; -- Game Tester
UPDATE career_paths SET career_code1 = 'team-manager' WHERE id = 'd2191579-0c7a-44b3-9a1c-d61a73d0ed6b'; -- Team Manager
UPDATE career_paths SET career_code1 = 'streamer' WHERE id = 'f2b57810-3bbb-4154-88e2-690c755b1f6f'; -- Streamer
UPDATE career_paths SET career_code1 = 'level-designer' WHERE id = '49a99751-f838-4966-96c0-31ac3b4e6598'; -- Level Designer
UPDATE career_paths SET career_code1 = 'community-manager' WHERE id = '3c3c44b7-51fe-43fa-a8c1-bd1b3b9c73ba'; -- Community Manager
UPDATE career_paths SET career_code1 = 'pro-athlete' WHERE id = 'af2fc64c-86f7-4ad3-85b6-4b58be9265cd'; -- Professional Athlete
UPDATE career_paths SET career_code1 = 'marketing-director' WHERE id = 'f644a749-a5da-47b5-8be6-5db1255ad8b5'; -- Marketing
UPDATE career_paths SET career_code1 = 'social-media-spec' WHERE id = '60efc1a0-a30d-4b96-83e8-29008c513004'; -- Social Media Specialist
UPDATE career_paths SET career_code1 = 'tax-specialist' WHERE id = '18362a41-e739-4c30-8602-0403b2bf3b61'; -- Tax Specialist
UPDATE career_paths SET career_code1 = 'renewable-energy-engineer' WHERE id = '4e78c708-7ff1-4c2f-9d4c-350a8fee85d0'; -- Renewable Energy Engineer
UPDATE career_paths SET career_code1 = 'localization-specialist' WHERE id = 'ea364c55-0eb1-4569-b852-0b1f6757141b'; -- Localization Specialist
UPDATE career_paths SET career_code1 = 'esports-manager' WHERE id = 'ea801770-7614-42f5-864e-174fe398fdf9'; -- Esports Manager
UPDATE career_paths SET career_code1 = 'marketing-manager' WHERE id = 'b500e38d-188f-4d34-9eae-6c8300df749e'; -- Gaming Marketing Manager
UPDATE career_paths SET career_code1 = 'talent-scout' WHERE id = 'cf6b0439-69f4-449a-9b87-7fbd81b93b59'; -- Esports Talent Scout
UPDATE career_paths SET career_code1 = 'compliance-manager' WHERE id = '7f34fa52-ccd5-4b51-9af9-d08cb0efcda1'; -- Gaming Compliance Manager
UPDATE career_paths SET career_code1 = 'business-analyst' WHERE id = '6a6d4ade-f251-4f6f-92c9-0eef83bc7cf0'; -- Gaming Business Analyst
UPDATE career_paths SET career_code1 = 'worship-leader' WHERE id = 'e938fee5-544a-41ed-992f-3ed633685e28'; -- Worship Leader
UPDATE career_paths SET career_code1 = 'sales-rep' WHERE id = '2c58d5e6-14c8-439c-aecc-a916bce51641'; -- Sales Representative
UPDATE career_paths SET career_code1 = 'customer-service' WHERE id = 'ba37e2c7-02d6-4701-acbf-5809be6f1c37'; -- Customer Service Representative
UPDATE career_paths SET career_code1 = 'copywriter' WHERE id = '191cc1f7-8506-472b-ad8c-111fc37dbd0c'; -- Copywriter
UPDATE career_paths SET career_code1 = 'recruiter' WHERE id = '8cb69fa9-f017-49f0-8172-aa43ae0330e0'; -- Recruiter
UPDATE career_paths SET career_code1 = 'fitness-trainer' WHERE id = 'c643f77f-4992-429e-8f01-ad072618b5c6'; -- Fitness Trainer
UPDATE career_paths SET career_code1 = 'talent-agent' WHERE id = '6b4318ce-54d0-4470-a6fe-77cf6cd91279'; -- Talent Agent
UPDATE career_paths SET career_code1 = 'hr-manager' WHERE id = '607706d5-ca45-474b-bc0c-2e62eeeb485a'; -- Human Resources Manager
UPDATE career_paths SET career_code1 = 'payroll-specialist' WHERE id = '7318d699-4ec8-4806-bdfa-8864264b6011'; -- Payroll Specialist
UPDATE career_paths SET career_code1 = 'media-buyer' WHERE id = 'ea1efb19-543f-45fa-a4b4-061542b6ac0b'; -- Media Buyer
UPDATE career_paths SET career_code1 = 'merchandiser' WHERE id = '66ed8e3a-d39e-4e5d-ada3-5e1e1cf44ad7'; -- Merchandiser
UPDATE career_paths SET career_code1 = 'religious-edu-director' WHERE id = '528d10c7-bb96-4d4b-aee4-6419aa7ca09b'; -- Religious Education Director
UPDATE career_paths SET career_code1 = 'charity-worker' WHERE id = '01242cef-327b-48b7-a902-4a89d7345225'; -- Charity Worker
UPDATE career_paths SET career_code1 = 'volunteer-coordinator' WHERE id = 'ec1de004-aba7-45a4-8a9c-1985cd22a500'; -- Volunteer Coordinator
UPDATE career_paths SET career_code1 = 'peace-worker' WHERE id = '8c61ad5e-c46b-4cf6-ae28-591edadc554e'; -- Peace Worker
UPDATE career_paths SET career_code1 = 'disaster-helper' WHERE id = '90f82514-0a99-4822-b426-4e1f95f39c36'; -- Disaster Relief Worker
UPDATE career_paths SET career_code1 = 'restaurant-manager' WHERE id = '0d787308-de06-42be-b92e-b1366f307e66'; -- Restaurant Manager
UPDATE career_paths SET career_code1 = 'culinary-instructor' WHERE id = '125e37d2-f3d8-4d5f-b6d4-3326f4e40b86'; -- Culinary Instructor
UPDATE career_paths SET career_code1 = 'storyteller' WHERE id = '436e2791-6e9d-4b53-9504-a8f623b64d5e'; -- Storyteller
UPDATE career_paths SET career_code1 = 'marketing-director' WHERE id = 'c1d897e3-e42e-4cb4-b117-c12c8da7f27b'; -- Marketing Director
UPDATE career_paths SET career_code1 = 'info-specialist' WHERE id = 'abf4dbf2-2804-4036-b342-569ec22e119a'; -- Information Specialist
UPDATE career_paths SET career_code1 = 'environment-educator' WHERE id = '13e6da32-a32f-405f-b2c9-19a9bd05e695'; -- Environmental Educator
UPDATE career_paths SET career_code1 = 'recycling-coordinator' WHERE id = 'd4111649-68cb-47ad-b633-75cd330e7aed'; -- Recycling Coordinator
UPDATE career_paths SET career_code1 = 'data_science' WHERE id = 'b2cb1b9a-58eb-47af-add4-964f2a7b63b7'; -- Data Science
UPDATE career_paths SET career_code1 = 'mayor' WHERE id = '2cbd212e-a2cb-46a3-86f5-d09f0340a1ac'; -- Mayor
UPDATE career_paths SET career_code1 = 'community-organizer' WHERE id = 'fb0d967d-9013-4864-b344-e4a2ae92c0cf'; -- Community Organizer
UPDATE career_paths SET career_code1 = 'youth-counselor' WHERE id = '7dadfcf0-8a14-4061-bfe5-2248bf397efb'; -- Youth Counselor
UPDATE career_paths SET career_code1 = 'finance' WHERE id = '86997074-f2e2-4bfd-8130-61c9cc49032f'; -- Finance
UPDATE career_paths SET career_code1 = 'medicine' WHERE id = '8c783d00-bac3-4508-90f0-f9919b747c7a'; -- Medicine
UPDATE career_paths SET career_code1 = 'curriculum-designer' WHERE id = '04c78f7b-2fb6-4f74-ac94-09ef0f5be225'; -- Curriculum Designer
UPDATE career_paths SET career_code1 = 'pastor' WHERE id = 'b667907e-face-4494-b330-e11ce5d7c89f'; -- Pastor/Minister
UPDATE career_paths SET career_code1 = 'law' WHERE id = 'f56abd0a-e664-4418-b20d-35845ebd90e6'; -- Law
UPDATE career_paths SET career_code1 = 'computer-science' WHERE id = '2bbe50d2-9acb-46a4-b943-0fa500e9a245'; -- Computer Science
UPDATE career_paths SET career_code1 = 'soccer-player' WHERE id = 'd83de137-92e6-4276-82ae-d9afee24e748'; -- Soccer Player
UPDATE career_paths SET career_code1 = 'research' WHERE id = 'f6d3c836-0cc2-4bb7-b7fd-435a11545d98'; -- Research
UPDATE career_paths SET career_code1 = 'mental-health-counselor' WHERE id = 'e41a9260-33fb-4e55-9bee-17a542dbce14'; -- Mental Health Counselor
UPDATE career_paths SET career_code1 = 'social-media-strategist' WHERE id = '3e7801ef-8428-47a7-882c-712a68ff7aae'; -- Social Media Strategist
UPDATE career_paths SET career_code1 = 'video-game-designer' WHERE id = '36c4eb2d-6867-403a-96ee-a5147264e4af'; -- Video Game Designer
UPDATE career_paths SET career_code1 = 'sustainability-consultant' WHERE id = 'fe8b78a2-20de-4577-bcdd-0a4e0928c071'; -- Sustainability Consultant
UPDATE career_paths SET career_code1 = 'drone-operator' WHERE id = '7a9c241f-541e-47a4-86ae-85fbc2323deb'; -- Drone Operator
UPDATE career_paths SET career_code1 = 'space-industry-worker' WHERE id = '94167472-149c-4f35-8354-815568f9212f'; -- Space Industry Professional
UPDATE career_paths SET career_code1 = 'policy-advisor' WHERE id = 'a275b85a-98d7-4604-9777-720d6237c03f'; -- Policy Advisor
UPDATE career_paths SET career_code1 = 'engineering' WHERE id = '5b47f35b-428d-4ac7-9c78-4e0ab348289e'; -- Engineering
UPDATE career_paths SET career_code1 = 'geneticist' WHERE id = 'ebf87b48-f9c8-443c-8f31-ef139e1c83b2'; -- Geneticist
UPDATE career_paths SET career_code1 = 'paleontologist' WHERE id = '1147430f-0c11-45b8-9acf-1dbb2d0c3bdc'; -- Paleontologist
UPDATE career_paths SET career_code1 = 'meteorologist' WHERE id = '01d2c8c4-4b4f-46f3-b386-b73ad716c128'; -- Meteorologist
UPDATE career_paths SET career_code1 = 'geologist' WHERE id = '7f0b785e-5df7-4d00-a160-718ba09e2e47'; -- Geologist
UPDATE career_paths SET career_code1 = 'astrophysicist' WHERE id = '19890030-09e1-47cc-a6ec-f14acc13112d'; -- Astrophysicist
UPDATE career_paths SET career_code1 = 'sculptor' WHERE id = '902c73e0-dd85-43ff-ac4c-0b48c7938ebc'; -- Sculptor
UPDATE career_paths SET career_code1 = 'choreographer' WHERE id = 'e9ad7933-a4e5-4cba-aa14-041394fad7b1'; -- Choreographer
UPDATE career_paths SET career_code1 = 'fitness-influencer' WHERE id = 'cbc9f459-f0ba-43cf-91dc-5b78fe01e77f'; -- Fitness Influencer
UPDATE career_paths SET career_code1 = 'physical-therapist' WHERE id = '78c67522-e774-471d-a6a4-9871dc2d4a97'; -- Physical Therapist
UPDATE career_paths SET career_code1 = 'university-professor' WHERE id = '0f7eefeb-a220-4c48-96d4-5f5d070fc45b'; -- University Professor
UPDATE career_paths SET career_code1 = 'school-principal' WHERE id = '35ad19c5-8262-4705-a282-7767027858bd'; -- School Principal
UPDATE career_paths SET career_code1 = 'accountant' WHERE id = '9be571a3-f966-456c-98df-8f005c6c7e9e'; -- Accountant
UPDATE career_paths SET career_code1 = 'carpenter' WHERE id = '6b9726a6-7bcb-4bdf-bf97-f096b7ce18f8'; -- Carpenter
UPDATE career_paths SET career_code1 = 'architect' WHERE id = 'c25405a3-4d17-4c37-966f-28acbf33be4e'; -- Architect
UPDATE career_paths SET career_code1 = 'engineer' WHERE id = '2cd13af0-687d-43a3-b27d-fb69eccf79da'; -- Engineer
UPDATE career_paths SET career_code1 = 'scientist' WHERE id = '14e5f33e-01a9-48e8-b003-e888469a0444'; -- Scientist
UPDATE career_paths SET career_code1 = 'journalist' WHERE id = '6aec753f-5549-44c6-b1c3-61022bccfa4e'; -- Journalist
UPDATE career_paths SET career_code1 = 'environmental-scientist' WHERE id = '23b0c9af-3f95-4ac4-97c0-aeeceb179be3'; -- Environmental Scientist
UPDATE career_paths SET career_code1 = 'graphic-designer' WHERE id = '9a579e5a-8215-4710-86df-af749f531a1b'; -- Graphic Designer
UPDATE career_paths SET career_code1 = 'game-designer' WHERE id = 'a91097e3-aa11-422d-9800-e0c7bc059357'; -- Game Designer
UPDATE career_paths SET career_code1 = 'video-editor' WHERE id = 'bad7b821-6e5e-4fe4-b897-622f1575b583'; -- Video Editor
UPDATE career_paths SET career_code1 = 'marine-biologist' WHERE id = '6ebeddd4-b9e7-4e9b-9181-f7c66fedd292'; -- Marine Biologist
UPDATE career_paths SET career_code1 = 'fashion-designer' WHERE id = '7b316051-c07d-4bdb-949a-1d9ab27456c5'; -- Fashion Designer
UPDATE career_paths SET career_code1 = 'interior-designer' WHERE id = '49970e02-cde3-4e25-9e57-935df32c6341'; -- Interior Designer
UPDATE career_paths SET career_code1 = 'real-estate-agent' WHERE id = 'd55ffdca-64bd-4143-80b7-c3483cf7c7ef'; -- Real Estate Agent
UPDATE career_paths SET career_code1 = 'bank-teller' WHERE id = '44e747ec-4538-4e7f-a18c-3283a359f568'; -- Bank Teller
UPDATE career_paths SET career_code1 = 'policy-analyst' WHERE id = 'feb5cd75-ed6f-49ef-b86d-f5a07477643d'; -- Policy Analyst
UPDATE career_paths SET career_code1 = 'entrepreneur' WHERE id = 'df8b0335-ddb7-458a-8704-27692ba6887b'; -- Entrepreneur
UPDATE career_paths SET career_code1 = 'scientist' WHERE id = 'd1a37e92-af85-43f4-9242-de7021720749'; -- Research Scientist
UPDATE career_paths SET career_code1 = 'social-worker' WHERE id = '452c4ce8-62b1-49d8-a809-fd4f19baefaf'; -- Social Worker
UPDATE career_paths SET career_code1 = 'social-worker' WHERE id = '524d9936-8819-4813-a304-b650baf6cb4c'; -- Social Worker
UPDATE career_paths SET career_code1 = 'financial-analyst' WHERE id = '0dff8378-ccca-4da9-85ac-c9eaccd31433'; -- Financial Analyst
UPDATE career_paths SET career_code1 = 'pharmacist' WHERE id = 'fb7a9074-b29c-4869-89c2-3c51e11f4c1f'; -- Pharmacist
UPDATE career_paths SET career_code1 = 'film-director' WHERE id = '6e8982d0-b724-46c2-8ff2-630d5fb0313c'; -- Film Director
UPDATE career_paths SET career_code1 = 'ceo' WHERE id = 'ec24d711-bcfc-44e0-9cf3-9005159a66cd'; -- CEO
UPDATE career_paths SET career_code1 = 'lawyer' WHERE id = '1601dd23-2037-4624-96b8-4dd10c31be9c'; -- Lawyer
UPDATE career_paths SET career_code1 = 'software-engineer' WHERE id = 'd3b7c872-5213-46b9-bd72-b95648b3d1c9'; -- Software Engineer
UPDATE career_paths SET career_code1 = 'data-scientist' WHERE id = '4a54728b-cbc7-431b-b547-7c4d62123ad7'; -- Data Scientist
UPDATE career_paths SET career_code1 = 'investment-banker' WHERE id = '8ae2d572-2499-4502-9f67-9d22947f23e9'; -- Investment Banker
UPDATE career_paths SET career_code1 = 'surgeon' WHERE id = '9af49d05-6acd-4c51-874a-2a85a673dda1'; -- Surgeon
UPDATE career_paths SET career_code1 = 'robotics-engineer' WHERE id = 'b955ace8-98ea-4b7d-be6d-513f8a8c69c1'; -- Robotics Engineer
UPDATE career_paths SET career_code1 = 'psychologist' WHERE id = 'dcfb7395-0c6a-48e6-83f1-0d8d1e4edecb'; -- Psychologist
UPDATE career_paths SET career_code1 = 'diplomat' WHERE id = '79bbb923-d1a4-4c0e-88c6-3069733190dd'; -- Diplomat
UPDATE career_paths SET career_code1 = 'doctor' WHERE id = '5631d886-42c0-42ac-b6d9-e7fcd8855472'; -- Doctor
UPDATE career_paths SET career_code1 = 'police-officer' WHERE id = '1c7463be-47ad-4a22-89e3-033e2a1366b1'; -- Police Officer
UPDATE career_paths SET career_code1 = 'chef' WHERE id = 'e61ff170-28d4-45f9-8e7d-708435ecb807'; -- Chef
UPDATE career_paths SET career_code1 = 'artist' WHERE id = '2c24cd65-c56a-4393-a1a8-b92fc795da16'; -- Artist
UPDATE career_paths SET career_code1 = 'teacher' WHERE id = '4a826fa8-6461-4b1e-b455-2955c752b9ff'; -- Teacher
UPDATE career_paths SET career_code1 = 'firefighter' WHERE id = '1f838bd2-431a-442e-8ddc-40b44284368e'; -- Firefighter
UPDATE career_paths SET career_code1 = 'chef' WHERE id = '0c975f37-2233-43c9-9af2-306801142e51'; -- Chef
UPDATE career_paths SET career_code1 = 'farmer' WHERE id = 'f60acf89-25e0-45e6-809f-bdd3e3897280'; -- Farmer
UPDATE career_paths SET career_code1 = 'dancer' WHERE id = '6fbf106d-5608-486a-a356-c358ac2cd3a0'; -- Dancer
UPDATE career_paths SET career_code1 = 'musician' WHERE id = '0f1ac8e6-4749-4fc7-8f69-bed618ef078b'; -- Musician
UPDATE career_paths SET career_code1 = 'librarian' WHERE id = 'fc34fc73-384b-49a3-a810-abff3103da72'; -- Librarian
UPDATE career_paths SET career_code1 = 'baker' WHERE id = '448cc17a-ef9d-46b3-b907-c367602bb9bb'; -- Baker
UPDATE career_paths SET career_code1 = 'librarian' WHERE id = '7de055d9-18f1-4a0f-b43a-a719a461d9d6'; -- Librarian
UPDATE career_paths SET career_code1 = 'veterinarian' WHERE id = '8b5f1ab6-9888-4df9-9fb7-87b2bb2c64c4'; -- Veterinarian
UPDATE career_paths SET career_code1 = 'nurse' WHERE id = '750d1673-4dd8-4d6f-82e6-19a72d394737'; -- Nurse
UPDATE career_paths SET career_code1 = 'coach' WHERE id = 'f0b0d474-9da7-4474-a36f-508bfc4b402e'; -- Coach
UPDATE career_paths SET career_code1 = 'photographer' WHERE id = 'bf806286-76f6-4389-9488-bd6b0d8567d3'; -- Photographer
UPDATE career_paths SET career_code1 = 'bus-driver' WHERE id = '5556d3f6-bc7f-4f93-bdc1-9f8b10263392'; -- Bus Driver
UPDATE career_paths SET career_code1 = 'writer' WHERE id = 'bd468b8b-9b18-433b-8b90-9d80568c73e0'; -- Writer
UPDATE career_paths SET career_code1 = 'photographer' WHERE id = '494687a9-2dc1-4f5f-b0ae-1b86be7a2be2'; -- Photographer
UPDATE career_paths SET career_code1 = 'park-ranger' WHERE id = '700a32a2-2417-4e8f-ad42-9630d599c731'; -- Park Ranger
UPDATE career_paths SET career_code1 = 'dentist' WHERE id = '2733d3ec-ec8c-444a-a68e-4194e28f2280'; -- Dentist
UPDATE career_paths SET career_code1 = 'park-ranger' WHERE id = '9d31f08e-75bc-46ab-967d-844b737c0d93'; -- Park Ranger
UPDATE career_paths SET career_code1 = 'game-data-analyst' WHERE id = 'beddf60d-e654-4796-8b9c-06998d661a28'; -- Game Data Analyst
UPDATE career_paths SET career_code1 = 'fundraiser' WHERE id = 'ba1d5aac-a9c1-4a6a-976e-20615d56fd9a'; -- Fundraiser
UPDATE career_paths SET career_code1 = 'ai-engineer' WHERE id = 'a5d93c98-d59a-4742-b9e1-0b97f02ac202'; -- AI Engineer
UPDATE career_paths SET career_code1 = 'esports-player' WHERE id = '422b0e10-0af5-482e-8705-c26463ede045'; -- Professional Gamer
UPDATE career_paths SET career_code1 = 'content-creator' WHERE id = 'e00f9808-1059-403e-818a-5209c102ccfa'; -- Content Creator
UPDATE career_paths SET career_code1 = 'qa-analyst' WHERE id = 'b47f04fb-1003-4930-bdc6-a0b53ca29a99'; -- QA Analyst
UPDATE career_paths SET career_code1 = 'ui-designer' WHERE id = '13355b1c-98fb-4b8e-b07b-e0e97f631b8d'; -- UI Designer
UPDATE career_paths SET career_code1 = 'esports-coach' WHERE id = '1920478f-941f-456c-bc4f-84b032780220'; -- Esports Coach
UPDATE career_paths SET career_code1 = 'education' WHERE id = '928a618e-82c8-49fd-8b4b-09b884f72463'; -- Education
UPDATE career_paths SET career_code1 = 'biotech-researcher' WHERE id = '86420779-3fd9-4df4-825e-e9188d62254f'; -- Biotech Researcher
UPDATE career_paths SET career_code1 = 'copy-editor' WHERE id = '365424c9-860d-48ac-8eaf-449ab6f9c2a1'; -- Copy Editor
UPDATE career_paths SET career_code1 = 'architecture' WHERE id = '45a1cfe4-55a5-483f-af3c-065fe04c1b87'; -- Architecture
UPDATE career_paths SET career_code1 = 'chaplain' WHERE id = '9fef2f2c-08d8-42c9-b9bf-96220f9d6362'; -- Chaplain
UPDATE career_paths SET career_code1 = 'baseball-player' WHERE id = 'e3a0b81f-a3ba-49bf-b912-bdfc90f9e1a2'; -- Baseball Player
UPDATE career_paths SET career_code1 = 'coach' WHERE id = '4fff3e1a-d114-41dd-a2de-6fba6f235425'; -- Sports Coach
UPDATE career_paths SET career_code1 = 'referee' WHERE id = 'e568f251-2723-4f04-8432-eff91038179f'; -- Referee/Umpire
UPDATE career_paths SET career_code1 = 'sports-trainer' WHERE id = '57af7228-e32c-4a5a-92cc-7392ebb819e6'; -- Athletic Trainer
UPDATE career_paths SET career_code1 = 'sports-caster' WHERE id = '798c6a9f-4c6c-46a4-8c43-6538f29840aa'; -- Sports Broadcaster
UPDATE career_paths SET career_code1 = 'talent-scout' WHERE id = 'ec8c8645-4319-476b-97de-a5adf74ce775'; -- Talent Scout
UPDATE career_paths SET career_code1 = 'judge' WHERE id = 'ea90d5c3-0bb1-4704-a049-d3cef0280158'; -- Judge
UPDATE career_paths SET career_code1 = 'mail-carrier' WHERE id = '5888a1f5-13b0-4c59-a5be-2a33a1533a40'; -- Mail Carrier
UPDATE career_paths SET career_code1 = 'programmer' WHERE id = '1b3e4f76-d6f7-4883-aabd-4622a1d7c8a9'; -- Programmer
UPDATE career_paths SET career_code1 = 'web-designer' WHERE id = 'b3aa1917-85ed-4f5a-9640-2d4801d0dcbe'; -- Web Designer
UPDATE career_paths SET career_code1 = 'nutritionist' WHERE id = 'd2a8feb4-790f-4b2d-88d4-afd6389a5de1'; -- Nutritionist
UPDATE career_paths SET career_code1 = 'electrician' WHERE id = 'dba4123e-c402-4e67-8932-11ed6bf99842'; -- Electrician
UPDATE career_paths SET career_code1 = 'plumber' WHERE id = 'cff713c3-8a7b-4775-bf44-6284b66b758f'; -- Plumber
UPDATE career_paths SET career_code1 = 'pediatrician' WHERE id = '22b71baf-0241-44e1-93dd-4eb9391eb1f8'; -- Pediatrician
UPDATE career_paths SET career_code1 = 'software-architect' WHERE id = 'd010a82c-b15e-436f-be01-fc59691c6f71'; -- Software Architect
UPDATE career_paths SET career_code1 = 'executive-chef' WHERE id = 'ada7c93e-8df7-4cad-bef3-1eeb33286c97'; -- Executive Chef
UPDATE career_paths SET career_code1 = 'astronaut' WHERE id = 'ad66c19f-3c49-4cbb-8ac3-352415c89f18'; -- Astronaut
UPDATE career_paths SET career_code1 = 'neurosurgeon' WHERE id = '583014f6-8daf-4755-b6b2-f28abf39ebb8'; -- Neurosurgeon
UPDATE career_paths SET career_code1 = 'oncologist' WHERE id = '9815924a-4676-4f54-8351-77b2d3acd3cc'; -- Oncologist
UPDATE career_paths SET career_code1 = 'orthodontist' WHERE id = '4fb09318-304a-4b56-8c8d-2fbe77ffd1d4'; -- Orthodontist
UPDATE career_paths SET career_code1 = 'plastic_surgeon' WHERE id = '06cb1d04-4c0d-42f3-a849-90379c2de8da'; -- Plastic Surgeon
UPDATE career_paths SET career_code1 = 'ai_researcher' WHERE id = '1c813ecc-fb01-412e-89ac-92c4fcf5e52c'; -- AI Researcher
UPDATE career_paths SET career_code1 = 'devops_engineer' WHERE id = '2316a65d-4134-4f9c-a520-618dcbf12c93'; -- DevOps Engineer
UPDATE career_paths SET career_code1 = 'vr-developer' WHERE id = '664ea832-dae1-4a32-98be-12f100b264f2'; -- VR Developer
UPDATE career_paths SET career_code1 = 'fbi_agent' WHERE id = '5fa01e23-19ff-406a-ab57-ec35d133472a'; -- FBI Agent
UPDATE career_paths SET career_code1 = 'aerospace-engineer' WHERE id = 'b4bb83b2-a4ab-4ec0-945c-d4e51104eabe'; -- Aerospace Engineer
UPDATE career_paths SET career_code1 = 'psychiatrist' WHERE id = 'ea896a8b-bec6-4004-b924-41c27e488a8d'; -- Psychiatrist
UPDATE career_paths SET career_code1 = 'cybersecurity-expert' WHERE id = 'bf8fd354-6fce-49b9-9f3f-6dca2d7b7729'; -- Cybersecurity Expert
UPDATE career_paths SET career_code1 = 'product_manager' WHERE id = 'a6447ed0-4275-41ac-a964-882333cb1dc9'; -- Product Manager
UPDATE career_paths SET career_code1 = 'blockchain-developer' WHERE id = 'd14d69ad-d484-4d62-862e-5a14da2dca6f'; -- Blockchain Developer
UPDATE career_paths SET career_code1 = 'therapist' WHERE id = 'caa2e184-3a9e-46c1-9051-3a233e2234ea'; -- Therapist

-- Step 3: Drop foreign key constraint temporarily
ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey;

-- Step 4: Update career_code with career_code1 values where they differ
UPDATE career_paths
SET career_code = career_code1
WHERE career_code != career_code1
  AND career_code1 IS NOT NULL;

-- Step 5: Update career_attributes table by matching old codes to new codes
-- First, let's see what codes need updating in career_attributes
DO $$
DECLARE
  old_code TEXT;
  new_code TEXT;
  update_count INTEGER := 0;
BEGIN
  -- Update each old code pattern to new code
  FOR old_code, new_code IN
    SELECT DISTINCT cp1.career_code as old_code, cp2.career_code as new_code
    FROM career_paths cp1
    JOIN career_paths cp2 ON cp1.id = cp2.id
    WHERE cp1.career_code != cp2.career_code1
      AND cp2.career_code1 IS NOT NULL
      AND EXISTS (SELECT 1 FROM career_attributes WHERE career_code = cp1.career_code)
  LOOP
    UPDATE career_attributes SET career_code = new_code WHERE career_code = old_code;
    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
      RAISE NOTICE 'Updated % career_attributes records: % -> %', update_count, old_code, new_code;
    END IF;
  END LOOP;
END $$;

-- Step 6: Recreate foreign key constraint
ALTER TABLE career_attributes
ADD CONSTRAINT career_attributes_career_code_fkey
FOREIGN KEY (career_code) REFERENCES career_paths(career_code);

-- Step 7: Drop temporary field
ALTER TABLE career_paths DROP COLUMN IF EXISTS career_code1;

-- Step 8: Verification
SELECT 'VERIFICATION RESULTS:' as verification;

SELECT
  'Career Paths Summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN career_code ~ '^[a-z0-9-]+$' THEN 1 END) as standardized_format,
  COUNT(CASE WHEN career_code ~ '[A-Z_]' THEN 1 END) as old_format_remaining
FROM career_paths
WHERE is_active = true;

SELECT
  'Career Attributes Summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN EXISTS (SELECT 1 FROM career_paths WHERE career_paths.career_code = career_attributes.career_code) THEN 1 END) as matching_references
FROM career_attributes;

-- Show sample of updated careers
SELECT 'Sample Updated Careers:' as sample;
SELECT career_name, career_code
FROM career_paths
WHERE career_name IN ('Youth Minister', 'Voice Actor', 'Game Developer', 'Animator', 'Chef')
  AND is_active = true
ORDER BY career_name;
