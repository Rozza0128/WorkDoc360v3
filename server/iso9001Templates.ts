// ISO 9001:2015 Document Templates for Construction Companies
export const iso9001Templates = [
  {
    name: "Quality Manual",
    description: "ISO 9001:2015 Quality Manual specifically designed for construction companies",
    category: "iso_9001",
    documentType: "quality_manual",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Quality Management System Manual",
      sections: [
        {
          title: "1. Introduction and Scope",
          content: `This Quality Manual describes the Quality Management System (QMS) of {{company_name}}, a {{trade_type}} construction company established in {{establishment_year}}.

Our QMS is designed to:
- Ensure consistent delivery of high-quality construction services
- Meet all applicable UK construction regulations and standards
- Continuously improve our processes and customer satisfaction
- Comply with ISO 9001:2015 requirements

Scope: This QMS covers all construction activities undertaken by {{company_name}}, including project planning, execution, quality control, and handover.`
        },
        {
          title: "2. Company Profile",
          content: `Company Name: {{company_name}}
Registration Number: {{registration_number}}
Address: {{company_address}}
Trade Specialisation: {{trade_specialisation}}
Key Personnel: {{key_personnel}}

Our company specialises in delivering high-quality {{trade_type}} services across the UK construction sector.`
        },
        {
          title: "3. Quality Policy",
          content: `{{company_name}} is committed to:

- Delivering construction services that meet or exceed customer expectations
- Complying with all applicable laws, regulations, and industry standards
- Maintaining a safe working environment for all personnel
- Continuously improving our quality management system
- Ensuring all personnel are competent and properly trained

This policy is communicated throughout the organisation and reviewed annually.`
        },
        {
          title: "4. Quality Management System",
          content: `Our QMS is based on the process approach and incorporates the Plan-Do-Check-Act (PDCA) cycle.

Key Processes:
- Customer Requirements Management
- Project Planning and Design
- Resource Management
- Construction Execution
- Quality Control and Inspection
- Customer Satisfaction Monitoring

Process Documentation:
All processes are documented in procedures, work instructions, and forms maintained in our quality system.`
        },
        {
          title: "5. Management Responsibility",
          content: `Top Management demonstrates leadership and commitment by:
- Taking accountability for the effectiveness of the QMS
- Establishing quality policy and objectives
- Ensuring integration of QMS requirements into business processes
- Promoting awareness of customer requirements
- Ensuring resources are available for the QMS

Management Representative: {{management_rep_name}}
Responsibilities include coordinating QMS activities and reporting to top management.`
        },
        {
          title: "6. Resource Management",
          content: `Human Resources:
- All personnel receive appropriate training and certification
- CSCS cards maintained for all site workers
- Regular competency assessments conducted
- Training records maintained

Infrastructure:
- Construction equipment maintained according to schedules
- Calibration of measurement equipment
- IT systems for project management and documentation

Work Environment:
- Health and safety procedures implemented
- Environmental considerations integrated into operations`
        },
        {
          title: "7. Product Realisation",
          content: `Project Planning:
- Customer requirements reviewed and documented
- Risk assessments conducted for all projects
- Method statements prepared
- Resource allocation planned

Construction Execution:
- Work carried out according to approved plans and specifications
- Regular inspections and quality checks
- Non-conformances addressed immediately
- Progress monitoring and reporting

Quality Control:
- Inspection and test plans implemented
- Material certificates verified
- Workmanship standards maintained
- Customer sign-offs obtained`
        },
        {
          title: "8. Measurement and Improvement",
          content: `Monitoring and Measurement:
- Customer satisfaction surveys
- Internal quality audits
- Management reviews
- Process performance metrics

Continuous Improvement:
- Corrective and preventive actions
- Lessons learned documentation
- Process improvements implemented
- Innovation encouraged

Data Analysis:
- Quality metrics tracked and analysed
- Trends identified and addressed
- Performance reported to management`
        }
      ]
    }
  },
  {
    name: "Document Control Procedure",
    description: "ISO 9001:2015 Document Control Procedure for construction companies",
    category: "iso_9001",
    documentType: "procedure",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Document Control Procedure",
      sections: [
        {
          title: "1. Purpose",
          content: "This procedure defines the controls needed to ensure that documents used within {{company_name}}'s Quality Management System are properly managed, current, and available where needed."
        },
        {
          title: "2. Scope",
          content: "This procedure applies to all QMS documents including the Quality Manual, procedures, work instructions, forms, external documents, and records."
        },
        {
          title: "3. Document Types",
          content: `Level 1: Quality Manual
Level 2: Procedures
Level 3: Work Instructions
Level 4: Forms and Records
External Documents: Standards, regulations, customer specifications`
        },
        {
          title: "4. Document Control Process",
          content: `Document Creation:
- Documents created using approved templates
- Reviewed by competent personnel
- Approved by authorised personnel before use

Document Distribution:
- Master copies maintained electronically
- Controlled copies distributed as needed
- Document lists maintained showing current versions

Document Updates:
- Changes reviewed and approved
- Version control maintained
- Superseded documents removed from use`
        }
      ]
    }
  },
  {
    name: "Management Review Procedure",
    description: "ISO 9001:2015 Management Review process for construction companies",
    category: "iso_9001",
    documentType: "procedure",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Management Review Procedure",
      sections: [
        {
          title: "1. Purpose",
          content: "To define the process for management review of the Quality Management System to ensure its continuing suitability, adequacy, effectiveness, and alignment with strategic direction."
        },
        {
          title: "2. Frequency",
          content: "Management reviews are conducted quarterly or when significant changes occur to the business or QMS."
        },
        {
          title: "3. Review Inputs",
          content: `- Status of actions from previous management reviews
- Changes in external and internal issues relevant to the QMS
- Customer satisfaction and feedback
- Performance of processes and conformity of products/services
- Non-conformities and corrective actions
- Audit results
- Performance of external providers
- Adequacy of resources
- Opportunities for improvement`
        },
        {
          title: "4. Review Outputs",
          content: `- Opportunities for improvement
- Any need for changes to the QMS
- Resource needs
- Actions to enhance customer satisfaction
- Changes to quality policy and objectives`
        }
      ]
    }
  },
  {
    name: "Internal Audit Procedure",
    description: "ISO 9001:2015 Internal Audit procedure for construction companies",
    category: "iso_9001",
    documentType: "procedure",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Internal Audit Procedure",
      sections: [
        {
          title: "1. Purpose",
          content: "To define the process for conducting internal audits to provide information on whether the Quality Management System conforms to requirements and is effectively implemented."
        },
        {
          title: "2. Audit Programme",
          content: `- Annual audit schedule established
- All QMS processes audited at least annually
- Frequency based on importance and results of previous audits
- Auditor competency requirements defined`
        },
        {
          title: "3. Audit Process",
          content: `Planning:
- Audit objectives and scope defined
- Audit criteria established
- Auditors assigned (independent of area being audited)

Execution:
- Opening meeting conducted
- Evidence gathered through interviews, observations, document review
- Findings documented and verified
- Closing meeting held

Reporting:
- Audit report prepared and distributed
- Non-conformities identified and documented
- Follow-up actions planned`
        }
      ]
    }
  },
  {
    name: "Corrective Action Procedure",
    description: "ISO 9001:2015 Corrective Action procedure for construction companies",
    category: "iso_9001",
    documentType: "procedure",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Corrective Action Procedure",
      sections: [
        {
          title: "1. Purpose",
          content: "To define the process for eliminating the causes of non-conformities in order to prevent recurrence."
        },
        {
          title: "2. Triggers for Corrective Action",
          content: `- Customer complaints
- Internal audit findings
- Management review outcomes
- Non-conforming work identified
- Process performance issues
- Supplier performance problems`
        },
        {
          title: "3. Corrective Action Process",
          content: `1. Problem Identification and Description
2. Root Cause Analysis
3. Action Planning
4. Implementation
5. Effectiveness Review
6. Closure

All corrective actions are tracked in the Corrective Action Register with assigned responsibilities and target dates.`
        }
      ]
    }
  },
  {
    name: "Customer Satisfaction Procedure",
    description: "ISO 9001:2015 Customer Satisfaction monitoring for construction companies",
    category: "iso_9001",
    documentType: "procedure",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Customer Satisfaction Procedure",
      sections: [
        {
          title: "1. Purpose",
          content: "To define the process for monitoring customer satisfaction and perception of how well {{company_name}} meets customer expectations."
        },
        {
          title: "2. Monitoring Methods",
          content: `- Customer satisfaction surveys
- Customer feedback forms
- Post-project reviews
- Complaint analysis
- Repeat business tracking
- Customer testimonials`
        },
        {
          title: "3. Survey Process",
          content: `Surveys conducted for all major projects upon completion:
- Project quality assessment
- Timeliness evaluation
- Communication effectiveness
- Professional conduct rating
- Overall satisfaction score
- Likelihood to recommend

Results analysed quarterly and trends identified for improvement opportunities.`
        }
      ]
    }
  }
];

export const healthSafetyTemplates = [
  {
    name: "Health and Safety Policy",
    description: "Comprehensive health and safety policy for construction companies",
    category: "health_safety",
    documentType: "policy",
    tradeTypes: ["scaffolder", "plasterer", "general_builder"],
    template: {
      title: "Health and Safety Policy",
      sections: [
        {
          title: "1. Policy Statement",
          content: `{{company_name}} is committed to ensuring the health, safety and welfare of all employees, subcontractors, and members of the public who may be affected by our construction activities.

We recognise that effective health and safety management is fundamental to successful business operation and will:
- Comply with all relevant health and safety legislation
- Provide safe working conditions and equipment
- Ensure adequate training and supervision
- Continuously improve our safety performance`
        },
        {
          title: "2. Responsibilities",
          content: `Management:
- Provide leadership and resources for health and safety
- Ensure compliance with legal requirements
- Regular monitoring and review of safety performance

Supervisors:
- Implement safety procedures on site
- Provide instruction and training to workers
- Monitor compliance and take corrective action

All Employees:
- Follow safety procedures and instructions
- Use provided safety equipment
- Report hazards and incidents immediately
- Participate in safety training`
        },
        {
          title: "3. Risk Management",
          content: `Risk Assessment Process:
- Systematic identification of hazards for all work activities
- Assessment of risks using the HSE 5-step approach
- Implementation of hierarchy of control measures (eliminate, reduce, isolate, control, protect)
- Regular review and updating of risk assessments
- Communication of risk assessments to all relevant personnel

Method Statements:
- Detailed safe systems of work for all high-risk activities
- Step-by-step procedures including safety precautions
- Emergency procedures and contact details
- Regular review and updating based on lessons learned

Permit to Work Systems:
- Hot work permits for welding and cutting operations
- Confined space entry procedures
- Working at height authorisations
- Excavation permits for underground work`
        },
        {
          title: "4. Training and Competence",
          content: `Induction Training:
- All new employees receive comprehensive health and safety induction
- Site-specific hazard identification and control measures
- Emergency procedures and assembly points
- Personal protective equipment requirements

Ongoing Training:
- Regular toolbox talks on relevant safety topics
- Competency assessments for high-risk activities
- Refresher training on legislation changes
- Specialist training for equipment operation

CSCS Certification:
- All operatives hold appropriate CSCS cards
- Regular verification of card validity
- Support for employees obtaining qualifications
- Maintenance of training records`
        },
        {
          title: "5. Incident Management",
          content: `Incident Reporting:
- All incidents, accidents and near misses reported immediately
- Investigation conducted to identify root causes
- Corrective actions implemented to prevent recurrence
- Lessons learned communicated across organisation

Emergency Procedures:
- Emergency contact numbers prominently displayed
- First aid arrangements with trained first aiders
- Emergency evacuation procedures
- Liaison with emergency services as required

Monitoring and Review:
- Regular safety inspections and audits
- Safety performance indicators tracked
- Management review of safety performance
- Continuous improvement of safety systems`
        }
      ]
    }
  }
];

// Basic starter documents for Essential plan (free health & safety only)
export async function createBasicStarterDocuments(companyId: number, tradeType: string, userId: string) {
  const starterDocs = [];
  
  // Select only health & safety templates for basic plan
  const relevantHealthSafetyTemplates = healthSafetyTemplates.filter(
    template => template.tradeTypes.includes(tradeType) || template.tradeTypes.includes("general_builder")
  );
  
  // Create document instances for the company
  for (const template of relevantHealthSafetyTemplates) {
    starterDocs.push({
      companyId,
      templateType: template.documentType,
      documentName: template.name,
      siteName: "Head Office",
      siteAddress: "Company Registered Address",
      projectManager: "Safety Manager",
      hazards: "",
      controlMeasures: "",
      specialRequirements: JSON.stringify(template.template),
      status: "template",
      isTemplate: true,
      generatedBy: userId,
    });
  }
  
  return starterDocs;
}

// Premium starter documents for Professional/Enterprise plans (includes ISO 9001)
export async function createPremiumStarterDocuments(companyId: number, tradeType: string, userId: string) {
  const starterDocs = [];
  
  // Select relevant templates based on trade type - FULL SUITE
  const relevantISO9001Templates = iso9001Templates.filter(
    template => template.tradeTypes.includes(tradeType) || template.tradeTypes.includes("general_builder")
  );
  
  const relevantHealthSafetyTemplates = healthSafetyTemplates.filter(
    template => template.tradeTypes.includes(tradeType) || template.tradeTypes.includes("general_builder")
  );
  
  // Create document instances for the company
  for (const template of [...relevantISO9001Templates, ...relevantHealthSafetyTemplates]) {
    starterDocs.push({
      companyId,
      templateType: template.documentType,
      documentName: template.name,
      siteName: "Head Office",
      siteAddress: "Company Registered Address",
      projectManager: "Quality Manager",
      hazards: "",
      controlMeasures: "",
      specialRequirements: JSON.stringify(template.template),
      status: "template",
      isTemplate: true,
      generatedBy: userId,
    });
  }
  
  return starterDocs;
}