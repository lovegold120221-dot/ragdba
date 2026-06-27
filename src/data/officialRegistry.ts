import { OfficialSource, GovernmentEntity, GovernmentService, Dataset } from '../types';

export const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    id: 'src-1',
    source_name: 'Belgium Federal Portal',
    source_type: 'Federal Citizen & Enterprise Gateway',
    government_level: 'Federal',
    owner_agency: 'Federal Public Service Policy and Support (BOSA)',
    official_domain: 'belgium.be',
    base_url: 'https://www.belgium.be',
    languages_available: ['NL', 'FR', 'DE', 'EN'],
    access_type: 'Open',
    trust_score: 99.8,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-2',
    source_name: 'Crossroads Bank for Enterprises (CBE)',
    source_type: 'Authentic Public Registry',
    government_level: 'Federal',
    owner_agency: 'FPS Economy, SME, Self-employed and Energy',
    official_domain: 'economie.fgov.be',
    base_url: 'https://kbopub.economie.fgov.be',
    languages_available: ['NL', 'FR', 'DE', 'EN'],
    access_type: 'Hybrid',
    trust_score: 100.0,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-3',
    source_name: 'MyMinfin Tax & Customs Portal',
    source_type: 'Authenticated Citizen/Enterprise Portal',
    government_level: 'Federal',
    owner_agency: 'FPS Finance',
    official_domain: 'financien.belgium.be',
    base_url: 'https://www.myminfin.be',
    languages_available: ['NL', 'FR', 'DE'],
    access_type: 'Authenticated',
    trust_score: 100.0,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-4',
    source_name: 'CSAM Digital Authentication Gateway',
    source_type: 'Identity & Access Management Standard',
    government_level: 'Federal',
    owner_agency: 'Federal Public Service BOSA',
    official_domain: 'csam.be',
    base_url: 'https://www.csam.be',
    languages_available: ['NL', 'FR', 'DE', 'EN'],
    access_type: 'Authenticated',
    trust_score: 100.0,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-5',
    source_name: 'My eBox / e-Box Enterprise',
    source_type: 'Official Digital Government Mailbox',
    government_level: 'Federal',
    owner_agency: 'National Social Security Office (NSSO / RSZ)',
    official_domain: 'myebox.be',
    base_url: 'https://myebox.be',
    languages_available: ['NL', 'FR', 'DE', 'EN'],
    access_type: 'Authenticated',
    trust_score: 99.5,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-6',
    source_name: 'Statbel Official Statistics Directorate',
    source_type: 'National Statistical Institute',
    government_level: 'Federal',
    owner_agency: 'FPS Economy',
    official_domain: 'statbel.fgov.be',
    base_url: 'https://statbel.fgov.be',
    languages_available: ['NL', 'FR', 'DE', 'EN'],
    access_type: 'Open',
    trust_score: 99.9,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-7',
    source_name: 'Data.gov.be Belgian Open Data Portal',
    source_type: 'DCAT-AP Federated Catalogue',
    government_level: 'Interoperability',
    owner_agency: 'Belgif & BOSA Digital Transformation',
    official_domain: 'data.gov.be',
    base_url: 'https://data.gov.be',
    languages_available: ['NL', 'FR', 'EN'],
    access_type: 'Open',
    trust_score: 98.9,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-8',
    source_name: 'Vlaanderen.be Regional Portal',
    source_type: 'Regional Government Gateway',
    government_level: 'Regional',
    owner_agency: 'Flemish Government (Digitaal Vlaanderen)',
    official_domain: 'vlaanderen.be',
    base_url: 'https://www.vlaanderen.be',
    languages_available: ['NL', 'EN', 'FR', 'DE'],
    access_type: 'Hybrid',
    trust_score: 99.5,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-9',
    source_name: 'Wallonie.be Regional Portal',
    source_type: 'Regional Government Gateway',
    government_level: 'Regional',
    owner_agency: 'Service public de Wallonie (SPW)',
    official_domain: 'wallonie.be',
    base_url: 'https://www.wallonie.be',
    languages_available: ['FR', 'DE', 'EN', 'NL'],
    access_type: 'Hybrid',
    trust_score: 99.4,
    last_verified_at: '2026-06-26',
    active: true
  },
  {
    id: 'src-10',
    source_name: 'Be.Brussels Capital Portal',
    source_type: 'Regional Government Gateway',
    government_level: 'Regional',
    owner_agency: 'Paradigm (Brussels Regional Informatics Center)',
    official_domain: 'be.brussels',
    base_url: 'https://be.brussels',
    languages_available: ['FR', 'NL', 'EN'],
    access_type: 'Hybrid',
    trust_score: 99.2,
    last_verified_at: '2026-06-26',
    active: true
  }
];

export const GOVERNMENT_ENTITIES: GovernmentEntity[] = [
  {
    id: 'ent-fps-eco',
    official_name: 'Federal Public Service Economy, SMEs, Self-employed and Energy',
    name_nl: 'FOD Economie, K.M.O., Middenstand en Energie',
    name_fr: 'SPF Économie, P.M.E., Classes moyennes et Énergie',
    name_de: 'FÖD Wirtschaft, K.M.U., Mittelstand und Energie',
    name_en: 'FPS Economy, SMEs, Self-employed and Energy',
    entity_type: 'Federal Public Service / FPS',
    government_level: 'Federal',
    official_website: 'https://economie.fgov.be',
    service_categories: ['Business registration', 'Company lookup', 'Statbel official statistics', 'CBE administration']
  },
  {
    id: 'ent-fps-fin',
    official_name: 'Federal Public Service Finance',
    name_nl: 'FOD Financiën',
    name_fr: 'SPF Finances',
    name_de: 'FÖD Finanzen',
    name_en: 'FPS Finance',
    entity_type: 'Federal Public Service / FPS',
    government_level: 'Federal',
    official_website: 'https://financien.belgium.be',
    service_categories: ['Taxes', 'VAT', 'MyMinfin', 'Customs']
  },
  {
    id: 'ent-bosa',
    official_name: 'Federal Public Service Policy and Support',
    name_nl: 'FOD Beleid en Ondersteuning (BOSA)',
    name_fr: 'SPF Stratégie et Appui (BOSA)',
    name_de: 'FÖD Politik und Unterstützung',
    name_en: 'FPS Policy and Support',
    entity_type: 'Federal Public Service / FPS',
    government_level: 'Federal',
    official_website: 'https://bosa.belgium.be',
    service_categories: ['CSAM / eID / itsme login', 'Belgif standards', 'Open Data Portal']
  },
  {
    id: 'ent-nsso',
    official_name: 'National Social Security Office',
    name_nl: 'Rijksdienst voor Sociale Zekerheid (RSZ)',
    name_fr: 'Office national de sécurité sociale (ONSS)',
    name_de: 'Landesamt für Soziale Sicherheit (LSS)',
    name_en: 'National Social Security Office (NSSO)',
    entity_type: 'Social security office',
    government_level: 'Federal',
    official_website: 'https://www.socialsecurity.be',
    service_categories: ['Social security', 'Employment', 'My eBox', 'e-Box Enterprise']
  }
];

export const GOVERNMENT_SERVICES: GovernmentService[] = [
  {
    id: 'srv-cbe-reg',
    service_name: 'Registration with Crossroads Bank for Enterprises',
    entity_name: 'FPS Economy / CBE',
    category: 'Business registration',
    auth_method: 'itsme® / CSAM via Enterprise Counter',
    processing_time: '1 - 3 business days',
    official_url: 'https://economie.fgov.be/en/themes/enterprises/crossroads-bank-enterprises'
  },
  {
    id: 'srv-vat-act',
    service_name: 'Activation of Belgian VAT Number',
    entity_name: 'FPS Finance / MyMinfin',
    category: 'VAT & Taxes',
    auth_method: 'eID / itsme® on MyMinfin',
    processing_time: 'Immediate - 24 hours',
    official_url: 'https://www.myminfin.be'
  },
  {
    id: 'srv-ebox-cit',
    service_name: 'Citizen Digital Mailbox Activation (My eBox)',
    entity_name: 'BOSA / NSSO',
    category: 'eBox / digital mailbox',
    auth_method: 'CSAM Gateway (eID, itsme®, MyGov)',
    processing_time: 'Instant activation',
    official_url: 'https://myebox.be'
  },
  {
    id: 'srv-cbe-pub',
    service_name: 'CBE Public Search & Extract Lookup',
    entity_name: 'FPS Economy / CBE',
    category: 'Company lookup',
    auth_method: 'None (Open Access)',
    processing_time: 'Real-time database query',
    official_url: 'https://kbopub.economie.fgov.be/kbopub/zoeken-naar-onderneming-form.html'
  }
];

export const DATASETS: Dataset[] = [
  {
    id: 'dcat-cbe-open',
    dcat_identifier: 'be:fgov:economie:kbo:opendata:v1',
    title: 'CBE Open Data - Active Enterprises and Establishment Units',
    publisher: 'FPS Economy (KBO-BCE Directorate)',
    theme: 'Economy & Business Demographics',
    format: ['CSV', 'JSON', 'RDF / Turtle', 'DCAT-AP'],
    update_frequency: 'Daily incremental update',
    access_url: 'https://economie.fgov.be/nl/themas/ondernemingen/kruispuntbank-van/diensten-voor-iedereen/kbo-open-data'
  },
  {
    id: 'dcat-stat-pop',
    dcat_identifier: 'be:statbel:census:demographics:v2',
    title: 'Statbel Belgian Demographic Statistics by Municipality',
    publisher: 'Statbel (General Directorate Statistics)',
    theme: 'Population & Society',
    format: ['CSV', 'JSON', 'XML', 'API Endpoint'],
    update_frequency: 'Monthly release',
    access_url: 'https://statbel.fgov.be/en/open-data'
  }
];

export const MVP_QUESTIONS_LIST = [
  "How do I start a company in Belgium?",
  "Where can I check a Belgian company?",
  "What is the Crossroads Bank for Enterprises?",
  "How do I access MyMinfin?",
  "What is My eBox?",
  "How do I change my company information?",
  "Where do I find official Belgian statistics?",
  "Which government branch handles this?",
  "What documents do I need for this service?",
  "Is this federal, regional, community, or municipal?",
  "Do I need CSAM, eID, or itsme?",
  "Where is the official government link?"
];

// Rich verified answers for MVP quick clicks
export const MVP_VERIFIED_RESPONSES: Record<string, any> = {
  "How do I start a company in Belgium?": {
    content: "Starting a business in Belgium involves several coordinated steps across Federal and Regional levels. Here is the verified procedure based on official data from FPS Economy.\n\n### Overview\nBefore initiating commercial activity, every entrepreneur or corporation must register with the **Crossroads Bank for Enterprises (CBE) / Kruispuntbank van Ondernemingen (KBO) / Banque-Carrefour des Entreprises (BCE)**. If you sell commercial goods or taxable services, VAT activation via **MyMinfin** is mandatory.",
    responsibleBranch: "FPS Economy / CBE",
    loginRequired: true,
    loginMethod: "itsme® / CSAM",
    officialSource: "belgium.be & FPS Economy",
    sourceUrl: "https://www.belgium.be/en/economy/business",
    requirements: [
      "Valid Identity Card (eID) or Belgian Residence Card",
      "Business Bank Account opened with a recognized financial institution",
      "Proof of basic management knowledge (if required in Brussels or Wallonia)"
    ],
    steps: [
      "Choose legal form (Sole trader / Eenmanszaak vs. BV-SRL)",
      "Open a business bank account and obtain a bank financial certificate",
      "Register with an accredited Enterprise Counter (Ondernemingsloket / Guichet d'entreprises)",
      "Activate VAT number via FPS Finance portal (MyMinfin)",
      "Affiliate with a recognized Social Insurance Fund within 90 days"
    ],
    regionalWarning: "Demonstration of basic management skills is abolished in Flanders, but remains strictly required in Brussels-Capital Region and Wallonia.",
    confidence: "High (Verified Official Source)"
  },
  "Where can I check a Belgian company?": {
    content: "You can check any registered Belgian company or sole trader free of charge through the **CBE Public Search (KBO Public Search / BCE Public)** maintained by FPS Economy.\n\n### What data is available?\nYou can search by Enterprise Number (10 digits starting with 0 or 1, e.g. `0123.456.789`) or company name. The public registry displays active establishment units, official NACE business activity codes, legal form, registered address, and authorized representatives.",
    responsibleBranch: "FPS Economy / CBE",
    loginRequired: false,
    loginMethod: "none",
    officialSource: "CBE Public Search Portal",
    sourceUrl: "https://kbopub.economie.fgov.be/kbopub/zoeken-naar-onderneming-form.html",
    requirements: [
      "Belgian Enterprise Number (Ondernemingsnummer / Numéro d'entreprise)",
      "OR Official Registered Company Name"
    ],
    steps: [
      "Open the official CBE Public Search tool",
      "Enter the 10-digit Enterprise Number or exact legal entity name",
      "Select 'Search' to view official authentic data"
    ],
    regionalWarning: null,
    confidence: "High (Verified Official Source)"
  },
  "What is the Crossroads Bank for Enterprises?": {
    content: "The **Crossroads Bank for Enterprises (CBE)** — known in Dutch as **Kruispuntbank van Ondernemingen (KBO)** and in French as **Banque-Carrefour des Entreprises (BCE)** — is the official federal secure register containing all identification data concerning enterprises and their establishment units in Belgium.\n\n### Role & Authentic Source\nManaged by FPS Economy, the CBE acts as the single authentic source of truth for business identity under the 'Only Once' legislation. Government departments are legally required to fetch company data directly from the CBE rather than asking citizens to re-submit documents.",
    responsibleBranch: "FPS Economy / CBE",
    loginRequired: false,
    loginMethod: "none",
    officialSource: "FPS Economy CBE Directorate",
    sourceUrl: "https://economie.fgov.be/en/themes/enterprises/crossroads-bank-enterprises",
    requirements: [],
    steps: [
      "Access public extracts via KBO Public Search",
      "Access private company notifications via My Enterprise (login required)"
    ],
    regionalWarning: null,
    confidence: "High (Verified Official Source)"
  },
  "How do I access MyMinfin?": {
    content: "**MyMinfin** is the official secure online portal of the Federal Public Service Finance (FPS Finance / FOD Financiën / SPF Finances) where citizens and enterprises manage tax returns, VAT filings, withholding taxes, property cadastral records, and rental agreements.\n\n### Authentication Method\nTo access MyMinfin, you must authenticate through the federal **CSAM** gateway using **itsme®**, a Belgian electronic Identity Card (**eID**) with card reader, or the mobile **MyGov.be** application.",
    responsibleBranch: "FPS Finance / MyMinfin",
    loginRequired: true,
    loginMethod: "itsme® / CSAM",
    officialSource: "FPS Finance Portal",
    sourceUrl: "https://www.myminfin.be",
    requirements: [
      "Belgian eID card with PIN code or active itsme® mobile account",
      "CSAM digital access token"
    ],
    steps: [
      "Navigate to official portal https://www.myminfin.be",
      "Click 'Sign In' (Log in / Connexion)",
      "Choose your digital key (itsme® or eID)",
      "Select whether you log in 'In your own name' or 'On behalf of an enterprise'"
    ],
    regionalWarning: "While personal income tax and corporate tax are federal, property withholding tax (Onroerende voorheffing / Précompte immobilier) bills are managed directly by Regional tax offices (Vlaamse Belastingdienst VLABEL, SPW Fiscalité, or Brussels Fiscalité).",
    confidence: "High (Verified Official Source)"
  },
  "What is My eBox?": {
    content: "**My eBox** is the official digital mailbox provided by the Belgian government where citizens safely receive personal official notifications, tax assessment notices, pension summaries, and municipal documents.\n\n### For Businesses: e-Box Enterprise\nWhile individual citizens use *My eBox*, companies and employers receive official correspondence from NSSO (RSZ/ONSS) and government departments via **e-Box Enterprise**.",
    responsibleBranch: "BOSA / NSSO",
    loginRequired: true,
    loginMethod: "itsme® / CSAM",
    officialSource: "My eBox Federal Gateway",
    sourceUrl: "https://myebox.be",
    requirements: [
      "Belgian National Register Number (Rijksregisternummer)",
      "CSAM authenticated login"
    ],
    steps: [
      "Go to https://myebox.be",
      "Authenticate with itsme® or eID",
      "Link your email address to receive immediate SMS/email alert pings whenever a new government letter arrives"
    ],
    regionalWarning: null,
    confidence: "High (Verified Official Source)"
  }
};
