import { storage } from '../server/storage';

const defaultTemplates = [
  {
    name: 'Web Application',
    description: 'Template for building modern web applications with frontend and backend components',
    category: 'web_app',
    templateData: {
      type: 'web application',
      industry: 'technology',
      teamSize: '5-10',
      timeline: '3-6 months',
      budget: 50000, // $50k in cents
      tasks: [
        { title: 'UI/UX Design', description: 'Create wireframes and mockups', priority: 'high', status: 'todo' },
        { title: 'Frontend Development', description: 'Build React/Next.js frontend', priority: 'high', status: 'todo' },
        { title: 'Backend Development', description: 'Set up API and database', priority: 'high', status: 'todo' },
        { title: 'Testing & QA', description: 'Comprehensive testing', priority: 'medium', status: 'todo' },
        { title: 'Deployment', description: 'Deploy to production', priority: 'medium', status: 'todo' },
      ],
    },
  },
  {
    name: 'Mobile Application',
    description: 'Template for iOS and Android mobile app development',
    category: 'mobile_app',
    templateData: {
      type: 'mobile application',
      industry: 'technology',
      teamSize: '3-8',
      timeline: '4-8 months',
      budget: 75000, // $75k in cents
      tasks: [
        { title: 'App Design', description: 'Design UI/UX for iOS and Android', priority: 'high', status: 'todo' },
        { title: 'iOS Development', description: 'Build native iOS app', priority: 'high', status: 'todo' },
        { title: 'Android Development', description: 'Build native Android app', priority: 'high', status: 'todo' },
        { title: 'Backend API', description: 'Develop backend services', priority: 'high', status: 'todo' },
        { title: 'Testing', description: 'Cross-platform testing', priority: 'medium', status: 'todo' },
        { title: 'App Store Submission', description: 'Submit to App Store and Play Store', priority: 'medium', status: 'todo' },
      ],
    },
  },
  {
    name: 'E-commerce Platform',
    description: 'Template for building online stores with payment integration',
    category: 'ecommerce',
    templateData: {
      type: 'e-commerce',
      industry: 'retail',
      teamSize: '6-12',
      timeline: '5-9 months',
      budget: 100000, // $100k in cents
      tasks: [
        { title: 'Product Catalog', description: 'Build product management system', priority: 'high', status: 'todo' },
        { title: 'Shopping Cart', description: 'Implement cart functionality', priority: 'high', status: 'todo' },
        { title: 'Payment Integration', description: 'Integrate Stripe/PayPal', priority: 'high', status: 'todo' },
        { title: 'Admin Panel', description: 'Build admin dashboard', priority: 'high', status: 'todo' },
        { title: 'Order Management', description: 'Order processing system', priority: 'medium', status: 'todo' },
        { title: 'Security & Compliance', description: 'PCI compliance and security', priority: 'high', status: 'todo' },
      ],
    },
  },
];

export async function seedDefaultTemplates() {
  try {
    for (const template of defaultTemplates) {
      // Check if template already exists
      const existing = await storage.getProjectTemplates(template.category);
      const exists = existing.some(t => t.name === template.name);
      
      if (!exists) {
        await storage.createProjectTemplate({
          name: template.name,
          description: template.description,
          category: template.category,
          templateData: JSON.stringify(template.templateData),
          isPublic: true,
          createdBy: null, // System template
          usageCount: 0,
        });
        console.log(`Created template: ${template.name}`);
      }
    }
    console.log('Default templates seeded successfully');
  } catch (error) {
    console.error('Error seeding default templates:', error);
    throw error;
  }
}

