export const malaysianDepartments = [
  { id: 'MOH', name: 'Ministry of Health', nameMs: 'Kementerian Kesihatan' },
  { id: 'MOE', name: 'Ministry of Education', nameMs: 'Kementerian Pendidikan' },
  { id: 'MOT', name: 'Ministry of Transport', nameMs: 'Kementerian Pengangkutan' },
  { id: 'MOF', name: 'Ministry of Finance', nameMs: 'Kementerian Kewangan' },
  { id: 'MOD', name: 'Ministry of Defence', nameMs: 'Kementerian Pertahanan' },
  { id: 'MOHA', name: 'Ministry of Home Affairs', nameMs: 'Kementerian Dalam Negeri' },
  { id: 'MOSTI', name: 'Ministry of Science, Technology and Innovation', nameMs: 'Kementerian Sains, Teknologi dan Inovasi' },
  { id: 'MOTAC', name: 'Ministry of Tourism, Arts and Culture', nameMs: 'Kementerian Pelancongan, Seni dan Budaya' }
];

export const projectTypes = [
  'Infrastructure',
  'Healthcare',
  'Education',
  'Technology',
  'Social Welfare',
  'Environmental',
  'Transportation',
  'Public Safety',
  'Economic Development',
  'Cultural Heritage'
];

export const malaysianStates = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya',
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
];

export const generateMockTransactions = (count: number = 50) => {
  const transactions = [];
  
  for (let i = 1; i <= count; i++) {
    const department = malaysianDepartments[Math.floor(Math.random() * malaysianDepartments.length)];
    const projectType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
    const state = malaysianStates[Math.floor(Math.random() * malaysianStates.length)];
    
    const budgetAllocated = (Math.random() * 10000000 + 100000); // RM 100K to 10M
    const amountSpent = budgetAllocated * (0.3 + Math.random() * 0.7); // 30% to 100% utilization
    
    const projectNames = {
      'Infrastructure': [
        `${state} Highway Improvement Project`,
        `Bridge Construction in ${state}`,
        `Water Treatment Plant - ${state}`,
        `Drainage System Upgrade - ${state}`
      ],
      'Healthcare': [
        `Hospital Equipment Modernization - ${state}`,
        `Primary Care Clinic Construction - ${state}`,
        `Medical Staff Training Program - ${state}`,
        `Healthcare IT System Implementation - ${state}`
      ],
      'Education': [
        `School Building Renovation - ${state}`,
        `Digital Learning Initiative - ${state}`,
        `Teacher Training Program - ${state}`,
        `University Research Facility - ${state}`
      ],
      'Technology': [
        `Digital Government Services - ${state}`,
        `Smart City Initiative - ${state}`,
        `Broadband Infrastructure - ${state}`,
        `Cybersecurity Enhancement - ${state}`
      ],
      'Social Welfare': [
        `Community Center Development - ${state}`,
        `Elderly Care Program - ${state}`,
        `Youth Development Initiative - ${state}`,
        `Affordable Housing Project - ${state}`
      ],
      'Environmental': [
        `Waste Management System - ${state}`,
        `Renewable Energy Project - ${state}`,
        `Forest Conservation Program - ${state}`,
        `Air Quality Monitoring - ${state}`
      ],
      'Transportation': [
        `Public Transport Enhancement - ${state}`,
        `Bus Terminal Upgrade - ${state}`,
        `Traffic Management System - ${state}`,
        `Railway Infrastructure - ${state}`
      ],
      'Public Safety': [
        `Emergency Response Center - ${state}`,
        `Fire Station Equipment - ${state}`,
        `Disaster Preparedness Program - ${state}`,
        `Police Station Modernization - ${state}`
      ],
      'Economic Development': [
        `Small Business Support Program - ${state}`,
        `Industrial Zone Development - ${state}`,
        `Tourism Promotion Campaign - ${state}`,
        `Export Facilitation Center - ${state}`
      ],
      'Cultural Heritage': [
        `Historical Site Preservation - ${state}`,
        `Cultural Festival Support - ${state}`,
        `Museum Modernization - ${state}`,
        `Traditional Arts Program - ${state}`
      ]
    };

    const projectName = projectNames[projectType as keyof typeof projectNames][
      Math.floor(Math.random() * projectNames[projectType as keyof typeof projectNames].length)
    ];

    transactions.push({
      department: department.id,
      projectName,
      projectType,
      budgetAllocated: budgetAllocated.toFixed(0),
      amountSpent: amountSpent.toFixed(0),
      location: state,
      description: `This is a ${projectType.toLowerCase()} project aimed at improving public services and infrastructure in ${state}. The project involves collaboration with local authorities and stakeholders to ensure successful implementation and sustainable outcomes.`
    });
  }
  
  return transactions;
};

export const mockFeedbackComments = [
  'Excellent project management and execution. Very satisfied with the progress.',
  'Good initiative, but there could be better communication with the community.',
  'The project has significantly improved our local infrastructure. Thank you!',
  'Happy to see transparency in government spending. Keep up the good work.',
  'The project timeline could be improved, but overall satisfied with the outcome.',
  'Great to see investment in our area. The results are clearly visible.',
  'More community consultation would be helpful for future projects.',
  'The project has brought positive changes to our neighborhood.',
  'Impressed by the quality of work and attention to detail.',
  'This project addresses a long-standing need in our community.'
];

export const generateMockFeedback = (transactionId: number, count: number = 5) => {
  const feedbacks = [];
  
  for (let i = 0; i < count; i++) {
    const comment = mockFeedbackComments[Math.floor(Math.random() * mockFeedbackComments.length)];
    const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
    
    feedbacks.push({
      transactionId,
      comment,
      rating,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    });
  }
  
  return feedbacks;
};