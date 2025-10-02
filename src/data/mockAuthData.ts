import { v4 as uuidv4 } from 'uuid';

// Mock tenants data - Updated for Plainview ISD Structure + Individual Family Schools
export const mockTenants = [
  // District-level tenant for superintendent access
  {
    id: 'plainview-isd-district-001',
    name: 'Plainview ISD District Office',
    slug: 'plainview-isd-district',
    domain: 'plainviewisd.edu',
    subscription_tier: 'enterprise',
    logo: 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  // Traditional School District Tenants
  {
    id: 'sand-view-elementary-school-001',
    name: 'Sand View Elementary School',
    slug: 'sand-view-elementary',
    domain: 'sandview.plainviewisd.edu',
    subscription_tier: 'premium',
    logo: 'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: 'ocean-view-middle-school-001',
    name: 'Ocean View Middle School',
    slug: 'ocean-view-middle',
    domain: 'oceanview.plainviewisd.edu',
    subscription_tier: 'enterprise',
    logo: 'https://images.pexels.com/photos/5428011/pexels-photo-5428011.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: 'city-view-high-school-001',
    name: 'City View High School',
    slug: 'city-view-high',
    domain: 'cityview.plainviewisd.edu',
    subscription_tier: 'enterprise',
    logo: 'https://images.pexels.com/photos/8471799/pexels-photo-8471799.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  
  // Individual Family School Tenants (Private School as a Service)
  {
    id: 'davis-family-school-001',
    name: 'Davis Family School',
    slug: 'davis-family',
    domain: 'davis.family.pathfinity.edu',
    subscription_tier: 'family',
    logo: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },
  {
    id: 'brown-family-school-001',
    name: 'Brown Family School',
    slug: 'brown-family',
    domain: 'brown.family.pathfinity.edu',
    subscription_tier: 'family',
    logo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  },

  // Micro School Tenant
  {
    id: 'new-frontier-micro-school-001',
    name: 'New Frontier Micro School',
    slug: 'new-frontier-micro',
    domain: 'newfrontier.pathfinity.edu',
    subscription_tier: 'premium',
    logo: 'https://images.pexels.com/photos/5427648/pexels-photo-5427648.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2'
  }
];

// Mock users data - Updated for Plainview ISD Structure with Proper Student Assignments
export const mockUsers = [
  // Elementary Student - Alex Davis (Grade 1)
  {
    id: '18eb6e8c-eb5b-433f-9ed0-f9599c2c7c01',
    email: 'alex.davis@sandview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Alex Davis',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: '1',
    subjects: null,
    school: 'Sand View Elementary School',
    district: 'Plainview ISD',
    tenant_ids: ['sand-view-elementary-school-001'],
    sso_provider: null
  },
  // Elementary Student - Sam Brown (Kindergarten)
  {
    id: 'd472ea4d-4174-432f-a273-ea213f2ebae4',
    email: 'sam.brown@sandview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Sam Brown',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: 'K',
    subjects: null,
    school: 'Sand View Elementary School',
    district: 'Plainview ISD',
    tenant_ids: ['sand-view-elementary-school-001'],
    sso_provider: null
  },
  // Middle School Student - Jordan Smith (Grade 7)
  {
    id: 'e56af6a7-4eb8-4c68-b99e-2dadad0ccca3',
    email: 'jordan.smith@oceanview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Jordan Smith',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: '7',
    subjects: null,
    school: 'Ocean View Middle School',
    district: 'Plainview ISD',
    tenant_ids: ['ocean-view-middle-school-001'],
    sso_provider: null
  },
  // High School Student - Taylor Johnson (Grade 10)
  {
    id: 'c7518a53-36e7-459d-a41a-43d413b02230',
    email: 'taylor.johnson@cityview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Taylor Johnson',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: '10',
    subjects: null,
    school: 'City View High School',
    district: 'Plainview ISD',
    tenant_ids: ['city-view-high-school-001'],
    sso_provider: null
  },
  // Teacher - Ms Jenna Grain (Elementary Teacher)
  {
    id: '12eb6e8c-eb5b-433f-9ed0-f9599c2c7c12',
    email: 'jenna.grain@sandview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Ms. Jenna Grain',
    role: 'educator',
    avatar_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null, 
    subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
    school: 'Sand View Elementary School',
    district: 'Plainview ISD',
    tenant_ids: ['sand-view-elementary-school-001'],
    sso_provider: null
  },
  // Teacher - Mr John Land (High School Math)
  {
    id: '13eb6e8c-eb5b-433f-9ed0-f9599c2c7c13',
    email: 'john.land@cityview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Mr John Land',
    role: 'educator',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null, 
    subjects: ['Algebra I', 'Algebra II'],
    school: 'City View High School',
    district: 'Plainview ISD',
    tenant_ids: ['city-view-high-school-001'],
    sso_provider: null
  },
  // Teacher - Ms Brenda Sea (Middle School ELA)
  {
    id: '20eb6e8c-eb5b-433f-9ed0-f9599c2c7c20',
    email: 'brenda.sea@oceanview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Ms. Brenda Sea',
    role: 'educator',
    avatar_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: ['ELA', 'Math', 'Science', 'Social Studies'],
    school: 'Ocean View Middle School',
    district: 'Plainview ISD',
    tenant_ids: ['ocean-view-middle-school-001'],
    sso_provider: null
  },
  // School Admin - Mr David Wilson (Elementary Principal)
  {
    id: '14eb6e8c-eb5b-433f-9ed0-f9599c2c7c14',
    email: 'david.wilson@sandview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Mr David Wilson',
    role: 'school_admin',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: 'Sand View Elementary School',
    district: 'Plainview ISD',
    tenant_ids: ['sand-view-elementary-school-001'], // Only access to their school
    sso_provider: null
  },
  // School Admin - Dr. Maria Rodriguez (Principal)
  {
    id: '14eb6e8c-eb5b-433f-9ed0-f9599c2c7c99',
    email: 'principal@plainviewisd.edu',
    password: 'password123',
    full_name: 'Dr. Maria Rodriguez',
    role: 'school_admin',
    avatar_url: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: 'Ocean View Middle School',
    district: 'Plainview ISD',
    tenant_ids: ['ocean-view-middle-school-001'], // Access to their school
    sso_provider: null
  },
  // District Admin - Dr. James Wilson (Superintendent)
  {
    id: '15eb6e8c-eb5b-433f-9ed0-f9599c2c7c15',
    email: 'superintendent@plainviewisd.edu',
    password: 'password123',
    full_name: 'Dr. James Wilson',
    role: 'district_admin',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: null, // District admins are not assigned to specific schools
    district: 'Plainview ISD',
    tenant_ids: ['plainview-isd-district-001', 'sand-view-elementary-school-001', 'ocean-view-middle-school-001', 'city-view-high-school-001'], // Access to district office and all schools
    sso_provider: null
  },
  // Product Admin (Platform-wide access)
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'product@example.com',
    password: 'password123',
    full_name: 'Emma Davis',
    role: 'product_admin',
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: 'Pathfinity HQ',
    district: null, // Platform admin - not tied to specific district
    tenant_ids: ['sand-view-elementary-school-001', 'ocean-view-middle-school-001', 'city-view-high-school-001'],
    sso_provider: null
  },
  // Parent - Sarah Davis (Alex's Mom - Public School Parent)
  {
    id: '16eb6e8c-eb5b-433f-9ed0-f9599c2c7c17',
    email: 'sarah.davis@sandview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Sarah Davis',
    role: 'parent',
    avatar_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: 'Sand View Elementary School', // Same school as child
    district: 'Plainview ISD',
    tenant_ids: ['sand-view-elementary-school-001'], // Access to child's school
    sso_provider: null,
    children: ['18eb6e8c-eb5b-433f-9ed0-f9599c2c7c01'] // Alex Davis
  },
  // Parent - Mike Brown (Sam's Dad - Public School Parent)
  {
    id: '17eb6e8c-eb5b-433f-9ed0-f9599c2c7c18',
    email: 'mike.brown@sandview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Mike Brown',
    role: 'parent',
    avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: 'Sand View Elementary School', // Same school as child
    district: 'Plainview ISD',
    tenant_ids: ['sand-view-elementary-school-001'], // Access to child's school
    sso_provider: null,
    children: ['d472ea4d-4174-432f-a273-ea213f2ebae4'] // Sam Brown
  },
  // Parent - Lisa Johnson (Taylor's Mom - Private School Parent)
  {
    id: '18eb6e8c-eb5b-433f-9ed0-f9599c2c7c19',
    email: 'lisa.johnson@cityview.plainviewisd.edu',
    password: 'password123',
    full_name: 'Lisa Johnson',
    role: 'parent',
    avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: null,
    school: 'City View High School', // Same school as child
    district: 'Plainview ISD',
    tenant_ids: ['city-view-high-school-001'], // Access to child's school
    sso_provider: null,
    children: ['c7518a53-36e7-459d-a41a-43d413b02230'] // Taylor Johnson
  },

  // NEW FRONTIER MICRO SCHOOL USERS
  // Teacher - Samantha Johnson (Micro School Teacher)
  {
    id: '30eb6e8c-eb5b-433f-9ed0-f9599c2c7c30',
    email: 'samantha.johnson@newfrontier.pathfinity.edu',
    password: 'password123',
    full_name: 'Samantha Johnson',
    role: 'educator',
    avatar_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: null,
    subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
    school: 'New Frontier Micro School',
    district: null,
    tenant_ids: ['new-frontier-micro-school-001'],
    sso_provider: null
  },
  // Student - Zara Jones (Grade K)
  {
    id: '31eb6e8c-eb5b-433f-9ed0-f9599c2c7c31',
    email: 'zara.jones@newfrontier.pathfinity.edu',
    password: 'password123',
    full_name: 'Zara Jones',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: 'K',
    subjects: null,
    school: 'New Frontier Micro School',
    district: null,
    tenant_ids: ['new-frontier-micro-school-001'],
    sso_provider: null
  },
  // Student - Alexis Martin (Grade 1)
  {
    id: '32eb6e8c-eb5b-433f-9ed0-f9599c2c7c32',
    email: 'alexis.martin@newfrontier.pathfinity.edu',
    password: 'password123',
    full_name: 'Alexis Martin',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: '1',
    subjects: null,
    school: 'New Frontier Micro School',
    district: null,
    tenant_ids: ['new-frontier-micro-school-001'],
    sso_provider: null
  },
  // Student - David Brown (Grade 7) - Talent Agent
  {
    id: '33eb6e8c-eb5b-433f-9ed0-f9599c2c7c33',
    email: 'david.brown@newfrontier.pathfinity.edu',
    password: 'password123',
    full_name: 'David Brown',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: '7',
    subjects: null,
    school: 'New Frontier Micro School',
    district: null,
    tenant_ids: ['new-frontier-micro-school-001'],
    sso_provider: null
  },
  // Student - Mike Johnson (Grade 10) - mentioned as Sports Analyst
  {
    id: '34eb6e8c-eb5b-433f-9ed0-f9599c2c7c34',
    email: 'mike.johnson@newfrontier.pathfinity.edu',
    password: 'password123',
    full_name: 'Mike Johnson',
    role: 'student',
    avatar_url: 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade_level: '10',
    subjects: null,
    school: 'New Frontier Micro School',
    district: null,
    tenant_ids: ['new-frontier-micro-school-001'],
    sso_provider: null
  },
];

// Mock user profiles (what would be stored in user_profiles table)
export const mockUserProfiles = mockUsers.map(user => {
  const { password, tenant_ids, sso_provider, ...profile } = user;
  return {
    ...profile,
    preferences: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

// Helper function to find user by email
export const findUserByEmail = (email: string) => {
  console.log('🔍 findUserByEmail called with:', email);
  console.log('🔍 Available emails:', mockUsers.map(u => u.email));
  const result = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
  console.log('🔍 findUserByEmail result:', result ? `Found: ${result.full_name}` : 'NOT FOUND');
  return result;
};

// Helper function to find user by ID
export const findUserById = (id: string) => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to find tenant by ID
export const findTenantById = (id: string) => {
  return mockTenants.find(tenant => tenant.id === id);
};

// Helper function to get user tenants
export const getUserTenants = (userId: string) => {
  const user = findUserById(userId);
  if (!user) return [];
  
  return user.tenant_ids.map(id => findTenantById(id)).filter(Boolean);
};

// Helper function to create a new user
export const createUser = (email: string, password: string, fullName: string, role: string = 'student') => {
  const newUser = {
    id: uuidv4(),
    email,
    password,
    full_name: fullName,
    role,
    avatar_url: null,
    grade_level: role === 'student' ? '9th Grade' : null,
    subjects: null,
    school: role === 'product_admin' ? 'Pathfinity HQ' : 'Riverside Elementary',
    district: role === 'product_admin' ? null : 'Riverside School District',
    tenant_ids: ['550e8400-e29b-41d4-a716-446655440000'], // Default to first tenant
    sso_provider: null
  };
  
  // In a real app, we would add this to the database
  // For mock purposes, we'll just log it
  console.log('Created new user:', newUser);
  
  return newUser;
};