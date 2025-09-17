// Trade-specific document recommendations for ISO 9001 and Health & Safety compliance

export interface DocumentRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'iso9001' | 'health_safety' | 'trade_specific';
  priority: 'essential' | 'recommended' | 'optional';
  applicableTradesExtend?: string[]; // If specified, only for these trades
  questionsRequired?: string[]; // Specific questions needed for this document
}

export const DOCUMENT_RECOMMENDATIONS: Record<string, DocumentRecommendation[]> = {
  // Core Building Trades
  'general_contractor': [
    // ISO 9001 Documents
    {
      id: 'quality_manual',
      title: 'Quality Management System Manual',
      description: 'Comprehensive quality management framework compliant with ISO 9001:2015',
      category: 'iso9001',
      priority: 'essential',
      questionsRequired: ['company_vision', 'key_services', 'quality_objectives']
    },
    {
      id: 'quality_policy',
      title: 'Quality Policy Statement',
      description: 'Executive commitment to quality management and continuous improvement',
      category: 'iso9001',
      priority: 'essential'
    },
    {
      id: 'document_control_procedure',
      title: 'Document Control Procedure',
      description: 'System for controlling quality management system documents',
      category: 'iso9001',
      priority: 'essential'
    },
    {
      id: 'management_review_procedure',
      title: 'Management Review Procedure',
      description: 'Framework for systematic review of quality management system effectiveness',
      category: 'iso9001',
      priority: 'essential'
    },
    // Health & Safety Documents
    {
      id: 'health_safety_policy',
      title: 'Health & Safety Policy',
      description: 'Comprehensive health and safety management framework',
      category: 'health_safety',
      priority: 'essential',
      questionsRequired: ['safety_objectives', 'key_hazards']
    },
    {
      id: 'risk_assessment_procedure',
      title: 'Risk Assessment Procedure',
      description: 'Systematic approach to identifying and controlling workplace hazards',
      category: 'health_safety',
      priority: 'essential'
    },
    {
      id: 'accident_incident_procedure',
      title: 'Accident & Incident Reporting Procedure',
      description: 'Framework for reporting, investigating, and learning from workplace incidents',
      category: 'health_safety',
      priority: 'essential'
    },
    {
      id: 'training_procedure',
      title: 'Health & Safety Training Procedure',
      description: 'System for ensuring competence through training and development',
      category: 'health_safety',
      priority: 'essential'
    },
    // Trade-Specific Documents
    {
      id: 'construction_phase_plan',
      title: 'Construction Phase Plan Template',
      description: 'CDM 2015 compliant construction phase planning framework',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['typical_projects', 'main_hazards', 'specialist_equipment']
    }
  ],

  'scaffolder': [
    // Inherit general contractor docs
    ...[], // Will be populated with general docs plus trade-specific
    // Scaffolding-Specific Documents
    {
      id: 'scaffolding_inspection_checklist',
      title: 'CISRS Scaffolding Inspection Checklist',
      description: 'Comprehensive inspection framework compliant with TG20:13 and CISRS standards',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['scaffolding_types', 'inspection_frequency']
    },
    {
      id: 'scaffolding_method_statement',
      title: 'Scaffolding Erection Method Statement',
      description: 'Detailed procedure for safe scaffolding erection and dismantling',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['typical_heights', 'access_equipment']
    },
    {
      id: 'loading_bay_procedure',
      title: 'Loading Bay & Materials Handling Procedure',
      description: 'Safe systems for materials handling and loading bay operations',
      category: 'trade_specific',
      priority: 'recommended'
    }
  ],

  'plasterer': [
    {
      id: 'plastering_method_statement',
      title: 'Plastering Operations Method Statement',
      description: 'Safe working procedures for internal and external plastering',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['plastering_types', 'chemical_products_used']
    },
    {
      id: 'dust_control_procedure',
      title: 'Dust Control & RPE Procedure',
      description: 'Respiratory protection and dust control measures for plastering operations',
      category: 'trade_specific',
      priority: 'essential'
    },
    {
      id: 'coshh_assessment_template',
      title: 'COSHH Assessment Template',
      description: 'Control of substances hazardous to health assessment framework',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['chemical_products', 'ventilation_systems']
    }
  ],

  // Building Services & MEP
  'electrician': [
    {
      id: 'electrical_safety_procedure',
      title: '18th Edition Electrical Safety Procedure',
      description: 'Safe systems for electrical installation and maintenance work',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['voltage_levels', 'testing_equipment']
    },
    {
      id: 'permit_to_work_procedure',
      title: 'Electrical Permit to Work Procedure',
      description: 'Isolation and permit system for electrical work',
      category: 'trade_specific',
      priority: 'essential'
    },
    {
      id: 'inspection_testing_procedure',
      title: 'Electrical Inspection & Testing Procedure',
      description: 'Framework for electrical installation testing and certification',
      category: 'trade_specific',
      priority: 'recommended'
    }
  ],

  'plumber': [
    {
      id: 'gas_safety_procedure',
      title: 'Gas Safe Procedures',
      description: 'Safe working procedures for gas installation and maintenance',
      category: 'trade_specific',
      priority: 'essential',
      applicableTradesExtend: ['heating_engineer'],
      questionsRequired: ['gas_work_types', 'detection_equipment']
    },
    {
      id: 'water_hygiene_procedure',
      title: 'Water Hygiene & Legionella Control',
      description: 'Prevention and control of waterborne bacteria in plumbing systems',
      category: 'trade_specific',
      priority: 'essential'
    },
    {
      id: 'confined_space_procedure',
      title: 'Confined Space Working Procedure',
      description: 'Safe entry and work in confined spaces including tanks and manholes',
      category: 'trade_specific',
      priority: 'recommended'
    }
  ],

  // Glazing & Windows Trades
  'window_fitter': [
    // Trade-Specific Documents
    {
      id: 'fensa_compliance_procedure',
      title: 'FENSA Compliance Procedure',
      description: 'Building regulation compliance for domestic window and door installations',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['installation_types', 'building_types', 'fensa_membership']
    },
    {
      id: 'mtc_certification_tracking',
      title: 'MTC Certification Tracking System',
      description: 'Minimum Technical Competency certification management and renewal tracking',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['surveyor_roles', 'installer_roles', 'nvq_levels']
    },
    {
      id: 'building_regs_l1b_compliance',
      title: 'Building Regulations L1B Compliance Checklist',
      description: 'Thermal performance and energy efficiency compliance for replacement windows',
      category: 'trade_specific',
      priority: 'essential'
    },
    {
      id: 'safety_glazing_procedure',
      title: 'Safety Glazing Installation Procedure',
      description: 'Compliance with Approved Document K4/N for safety glazing requirements',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['glazing_types', 'installation_locations', 'safety_requirements']
    },
    {
      id: 'window_installation_rams',
      title: 'Window Installation RAMS',
      description: 'Risk assessment and method statement for window and door installation work',
      category: 'health_safety',
      priority: 'essential',
      questionsRequired: ['work_height', 'glass_handling', 'tool_usage', 'site_access']
    },
    {
      id: 'glass_handling_procedure',
      title: 'Safe Glass Handling Procedure',
      description: 'Manual handling and safety procedures for glazing materials',
      category: 'health_safety',
      priority: 'essential'
    },
    {
      id: 'coshh_sealants_adhesives',
      title: 'COSHH Assessment - Sealants & Adhesives',
      description: 'Chemical safety assessment for window installation materials',
      category: 'health_safety',
      priority: 'essential',
      questionsRequired: ['chemical_types', 'application_methods', 'ventilation_requirements']
    },
    {
      id: 'working_at_height_procedure',
      title: 'Working at Height Procedure',
      description: 'Safe working procedures for elevated window installation work',
      category: 'health_safety',
      priority: 'essential',
      questionsRequired: ['height_categories', 'access_equipment', 'fall_protection']
    },
    {
      id: 'ggf_quality_standards',
      title: 'GGF Quality Standards Compliance',
      description: 'Glass and Glazing Federation quality and technical standards',
      category: 'trade_specific',
      priority: 'recommended'
    },
    {
      id: 'energy_certification_procedure',
      title: 'Energy Performance Certification',
      description: 'WER ratings and thermal performance documentation',
      category: 'trade_specific',
      priority: 'recommended',
      questionsRequired: ['energy_ratings', 'testing_standards', 'certification_bodies']
    }
  ],

  // Specialized Trades
  'asbestos_removal': [
    {
      id: 'asbestos_removal_plan',
      title: 'Asbestos Removal Plan Template',
      description: 'HSE-compliant plan for licensed asbestos removal operations',
      category: 'trade_specific',
      priority: 'essential',
      questionsRequired: ['licence_type', 'removal_methods', 'waste_routes']
    },
    {
      id: 'decontamination_procedure',
      title: 'Decontamination Unit Procedure',
      description: 'Personnel and equipment decontamination procedures',
      category: 'trade_specific',
      priority: 'essential'
    },
    {
      id: 'air_monitoring_procedure',
      title: 'Air Monitoring Procedure',
      description: 'Framework for background and clearance air monitoring',
      category: 'trade_specific',
      priority: 'essential'
    }
  ]
};

// Add general contractor documents to all trades
Object.keys(DOCUMENT_RECOMMENDATIONS).forEach(trade => {
  if (trade !== 'general_contractor') {
    DOCUMENT_RECOMMENDATIONS[trade] = [
      ...DOCUMENT_RECOMMENDATIONS.general_contractor,
      ...DOCUMENT_RECOMMENDATIONS[trade]
    ];
  }
});

export function getRecommendationsForTrade(tradeType: string): DocumentRecommendation[] {
  return DOCUMENT_RECOMMENDATIONS[tradeType] || DOCUMENT_RECOMMENDATIONS.general_contractor;
}

export function getEssentialDocuments(tradeType: string): DocumentRecommendation[] {
  return getRecommendationsForTrade(tradeType).filter(doc => doc.priority === 'essential');
}

export function getDocumentsByCategory(tradeType: string, category: DocumentRecommendation['category']): DocumentRecommendation[] {
  return getRecommendationsForTrade(tradeType).filter(doc => doc.category === category);
}