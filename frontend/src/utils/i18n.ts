import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      projects: 'Projects',
      departments: 'Departments',
      admin: 'Admin',
      
      // Dashboard
      governmentSpending: 'Government Spending',
      transparency: 'Transparency',
      totalBudget: 'Total Budget',
      totalSpent: 'Total Spent',
      activeProjects: 'Active Projects',
      utilizationRate: 'Utilization Rate',
      
      // Projects
      projectName: 'Project Name',
      department: 'Department',
      budget: 'Budget',
      spent: 'Spent',
      location: 'Location',
      projectType: 'Project Type',
      
      // Common
      search: 'Search',
      filter: 'Filter',
      loading: 'Loading...',
      error: 'Error',
      submit: 'Submit',
      cancel: 'Cancel',
      
      // Malaysian departments
      departmentNames: {
        MOH: 'Ministry of Health',
        MOE: 'Ministry of Education',
        MOT: 'Ministry of Transport',
        MOF: 'Ministry of Finance',
        MOD: 'Ministry of Defence',
        MOHA: 'Ministry of Home Affairs',
        MOSTI: 'Ministry of Science, Technology and Innovation',
        MOTAC: 'Ministry of Tourism, Arts and Culture'
      }
    }
  },
  ms: {
    translation: {
      // Navigation
      dashboard: 'Papan Pemuka',
      projects: 'Projek',
      departments: 'Kementerian',
      admin: 'Pentadbir',
      
      // Dashboard
      governmentSpending: 'Perbelanjaan Kerajaan',
      transparency: 'Ketelusan',
      totalBudget: 'Jumlah Bajet',
      totalSpent: 'Jumlah Dibelanjakan',
      activeProjects: 'Projek Aktif',
      utilizationRate: 'Kadar Penggunaan',
      
      // Projects
      projectName: 'Nama Projek',
      department: 'Kementerian',
      budget: 'Bajet',
      spent: 'Dibelanjakan',
      location: 'Lokasi',
      projectType: 'Jenis Projek',
      
      // Common
      search: 'Cari',
      filter: 'Tapis',
      loading: 'Memuatkan...',
      error: 'Ralat',
      submit: 'Hantar',
      cancel: 'Batal',
      
      // Malaysian departments
      departmentNames: {
        MOH: 'Kementerian Kesihatan',
        MOE: 'Kementerian Pendidikan',
        MOT: 'Kementerian Pengangkutan',
        MOF: 'Kementerian Kewangan',
        MOD: 'Kementerian Pertahanan',
        MOHA: 'Kementerian Dalam Negeri',
        MOSTI: 'Kementerian Sains, Teknologi dan Inovasi',
        MOTAC: 'Kementerian Pelancongan, Seni dan Budaya'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;