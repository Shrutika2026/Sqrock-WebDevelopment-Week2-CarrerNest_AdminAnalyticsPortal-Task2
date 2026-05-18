// --- STATE MANAGEMENT ---
let isLoginMode = true;
let selectedRole = '';
let otpSent = false;
let generatedOTP = '';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let applications = JSON.parse(localStorage.getItem('applications')) || [];

// Active view index tracking for dynamic list navigation
let selectedJobIndex = 0;
let selectedJob = null;
let currentResumePreviewUrl = null;
let editingJobId = null;

function normalizeText(text) {
    return String(text || '').trim().toLowerCase();
}

function getStatusBadgeClass(status) {
    if(status === 'Accepted') return 'status-badge-accepted';
    if(status === 'Rejected') return 'status-badge-rejected';
    return 'status-badge-applied';
}

function showApplicantsForJob(jobTitle) {
    const apps = applications.filter(a => a.jobTitle === jobTitle);
    const detailEl = document.getElementById('emp-application-detail-modal');
    const modal = document.getElementById('emp-details-modal');
    if(!apps || apps.length === 0) {
        detailEl.innerHTML = `<p style="color:var(--grey);">No applications found for this job.</p>`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return;
    }
    detailEl.innerHTML = apps.map(app => `
        <div style="background:white; border-radius:10px; padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-weight:800; color:var(--dark);">${app.candidateName || app.candidateEmail}</div>
                <div style="color:var(--grey); font-size:0.9rem;">${app.jobTitle} • ${app.dateApplied}</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn-secondary" type="button" onclick="showEmployerApplicationDetail('${app.id || app.candidateEmail}')">View Profile</button>
                <button class="btn-secondary" type="button" onclick="previewApplicationResume('${app.id}')">View Resume</button>
                <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Accepted')">Accept</button>
                <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Rejected')">Reject</button>
            </div>
        </div>
    `).join('');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// EXACTLY 50 UNIQUE IT/SOFTWARE OPENINGS
const staticJobsDatabase = [
    { title: "Senior React Developer", company: "DevNexus Solutions", type: "Full-Time", cat: "Web Development", salary: "$110k - $140k", loc: "Remote", date: "10/05/2026", logo: "D", desc: "Build enterprise React core systems.", req: ["React Hooks architecture", "State management setups", "REST API integration profiles"], vacancies: 3, lang: "English, JavaScript, TypeScript", exp: "5+ Years", mode: "Online", address: "Tech Park Phase II, Sector 62, Noida, India" },
    { title: "Full Stack Engineer (Node/Vue)", company: "AlphaStream", type: "Full-Time", cat: "Web Development", salary: "$95k - $125k", loc: "New York, NY", date: "11/05/2026", logo: "A", desc: "Develop next-gen full stack tools.", req: ["NodeJS framework layers", "VueJS setup patterns", "NoSQL database architectures"], vacancies: 2, lang: "English, JavaScript", exp: "3+ Years", mode: "Hybrid", address: "555 Broadway, Manhattan, NY 10012, USA" },
    { title: "Frontend UI Developer", company: "PixelCraft Agency", type: "Part-Time", cat: "Web Development", salary: "$60k - $80k", loc: "Austin, TX", date: "12/05/2026", logo: "P", desc: "Convert elegant prototypes into clean responsive layouts.", req: ["Expert HTML/CSS modules", "Tailwind framework fluency", "Cross-browser engine tests"], vacancies: 5, lang: "English", exp: "1-2 Years", mode: "Online", address: "701 Brazos St, Austin, TX 78701, USA" },
    { title: "Backend Systems Lead", company: "CoreLink Global", type: "Full-Time", cat: "Web Development", salary: "$140k - $175k", loc: "San Francisco, CA", date: "14/05/2026", logo: "C", desc: "Architect heavy-traffic microservices infrastructure structures.", req: ["Python system optimizations", "Distributed cloud messaging tracks", "SQL optimization models"], vacancies: 1, lang: "English, Python, SQL", exp: "7+ Years", mode: "Hybrid", address: "100 Pine St, San Francisco, CA 94111, USA" },
    { title: "Senior Java Software Engineer", company: "Enterprise Systems Corp", type: "Full-Time", cat: "Software Engineering", salary: "$130k - $160k", loc: "Chicago, IL", date: "09/05/2026", logo: "E", desc: "Scale enterprise cloud-based application modules.", req: ["Java 17 / Spring Boot ecosystem", "Multi-threaded synchronization models", "Kubernetes engine clusters"], vacancies: 4, lang: "English, Java", exp: "6+ Years", mode: "Hybrid", address: "222 W Adams St, Chicago, IL 60606, USA" },
    { title: "C++ Desktop Application Engineer", company: "Vector Graphics LLC", type: "Full-Time", cat: "Software Engineering", salary: "$120k - $150k", loc: "Remote", date: "08/05/2026", logo: "V", desc: "Build advanced low-latency graphic compilation architectures.", req: ["Modern C++ setups", "Memory optimization profiling layouts", "OpenGL/Vulkan matrix APIs"], vacancies: 2, lang: "English, C++", exp: "4+ Years", mode: "Online", address: "Digital Hub East, Level 4, Berlin, Germany" },
    { title: "Embedded Systems Developer", company: "Quantum Robotics", type: "Full-Time", cat: "Software Engineering", salary: "$115k - $145k", loc: "Boston, MA", date: "07/05/2026", logo: "Q", desc: "Program real-time microcontrollers for autonomous automation setups.", req: ["Embedded C programming control structures", "Hardware driver prototyping routines", "RTOS scheduling tracking"], vacancies: 3, lang: "English, C, Assembly", exp: "3+ Years", mode: "Hybrid", address: "Innovation Way, Building B, Boston, MA 02110, USA" },
    { title: "Senior Data Analyst", company: "Metric Insights", type: "Full-Time", cat: "Data Analytics", salary: "$90k - $115k", loc: "Seattle, WA", date: "13/05/2026", logo: "M", desc: "Interpret data matrices for strategic executive tracking analytics.", req: ["Advanced Tableau design patterns", "Complex nested SQL scripts", "Statistical data mapping rules"], vacancies: 6, lang: "English, SQL", exp: "4+ Years", mode: "Online", address: "500 Westlake Ave N, Seattle, WA 98109, USA" },
    { title: "Business Intelligence Analyst", company: "FinTech Solutions", type: "Full-Time", cat: "Data Analytics", salary: "₹12L - ₹18L", loc: "Mumbai, India", date: "14/05/2026", logo: "F", desc: "Construct operational KPI performance pipeline reports.", req: ["PowerBI suite data configurations", "Data warehousing models", "ETL validation structures"], vacancies: 4, lang: "English, Hindi", exp: "2-5 Years", mode: "Hybrid", address: "Bandra Kurla Complex, G Block, Mumbai, Maharashtra 400051, India" },
    { title: "Marketing Data Analyst", company: "GrowthHacks Corp", type: "Part-Time", cat: "Data Analytics", salary: "$50k - $70k", loc: "Remote", date: "12/05/2026", logo: "G", desc: "Audit web-traffic cross-channel conversion pipelines.", req: ["Google Analytics configurations", "Python data parsing libraries", "A/B setup analytics structures"], vacancies: 2, lang: "English, Python", exp: "2+ Years", mode: "Online", address: "Silicon Tower High Street, Toronto, Canada" },
    { title: "Data Scientist - NLP Specialist", company: "LingoAI Labs", type: "Full-Time", cat: "Data Science", salary: "$150k - $190k", loc: "Remote", date: "13/05/2026", logo: "L", desc: "Build structured text parsing data models.", req: ["Python NLP packages", "Transformer neural structures", "LLM tuning models"], vacancies: 2, lang: "English, Python", exp: "5+ Years", mode: "Online", address: "AI Research Strip, London, EC1A 1BB, UK" },
    { title: "Quantitative Data Scientist", company: "Apex Capital", type: "Full-Time", cat: "Data Science", salary: "$180k - $230k", loc: "New York, NY", date: "10/05/2026", logo: "A", desc: "Invent real-time predictive risk metrics algorithms.", req: ["Predictive math analytics arrays", "Time-series computing layouts", "Python compilation tools"], vacancies: 1, lang: "English, R, Python", exp: "6+ Years", mode: "Hybrid", address: "Wall Street Financial Tower, Suite 400, New York, NY 10005, USA" },
    { title: "Product Data Scientist", company: "SocialSphere Inc", type: "Full-Time", cat: "Data Science", salary: "$140k - $175k", loc: "Los Angeles, CA", date: "06/05/2026", logo: "S", desc: "Model user behavior patterns across active cloud targets.", req: ["Statistical experimental matrices", "PySpark large scale computation", "Big data storage checks"], vacancies: 3, lang: "English, SQL, Python", exp: "4+ Years", mode: "Hybrid", address: "Sunset Blvd, Creative Space 12, Los Angeles, CA 90028, USA" },
    { title: "Information Security Analyst", company: "Shield Network", type: "Full-Time", cat: "Cyber Security", salary: "$105k - $135k", loc: "Washington, DC", date: "12/05/2026", logo: "S", desc: "Monitor infrastructure data streams against breach threats.", req: ["SIEM configuration tool sets", "Incident triage validation tracks", "Security certification guidelines"], vacancies: 4, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Pennsylvania Ave NW, Washington, DC 20006, USA" },
    { title: "Penetration Tester", company: "RedTeam Defensive", type: "Full-Time", cat: "Cyber Security", salary: "$125k - $160k", loc: "Remote", date: "11/05/2026", logo: "R", desc: "Execute target digital audits via simulated attack strategies.", req: ["Metasploit framework setups", "Network penetration maps", "Script audit procedures"], vacancies: 2, lang: "English, Bash, Python", exp: "4+ Years", mode: "Online", address: "Cyber Defense Hub, Sector 4, Bucharest, Romania" },
    { title: "Cloud Security Architect", company: "SecureCloud Inc", type: "Full-Time", cat: "Cyber Security", salary: "$160k - $200k", loc: "Denver, CO", date: "05/05/2026", logo: "S", desc: "Secure distributed cloud deployments against intrusion vectors.", req: ["AWS IAM control validation steps", "Kubernetes system enforcement policies", "Zero Trust system paths"], vacancies: 1, lang: "English", exp: "8+ Years", mode: "Hybrid", address: "17th Street Skyline Court, Denver, CO 80202, USA" },
    { title: "AWS Cloud Infrastructure Engineer", company: "Skyward Systems", type: "Full-Time", cat: "Cloud Computing", salary: "$120k - $155k", loc: "Dallas, TX", date: "13/05/2026", logo: "S", desc: "Oversee high-availability application cloud operations.", req: ["Terraform tracking scripts", "AWS network configuration topologies", "Cost reduction maps"], vacancies: 3, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "LBJ Freeway Gateway Tower, Dallas, TX 75240, USA" },
    { title: "Azure Cloud Architect", company: "Enterprise Grid", type: "Full-Time", cat: "Cloud Computing", salary: "$150k - $190k", loc: "Remote", date: "10/05/2026", logo: "E", desc: "Migrate traditional legacy system apps to secure hybrid platforms.", req: ["Azure Enterprise cloud topologies", "Active Directory federation setups", "CI/CD server integrations"], vacancies: 2, lang: "English", exp: "6+ Years", mode: "Online", address: "Cloud Network Complex, Amsterdam, Netherlands" },
    { title: "Senior DevOps Engineer", company: "Velocity Software", type: "Full-Time", cat: "DevOps", salary: "$140k - $180k", loc: "San Francisco, CA", date: "13/05/2026", logo: "V", desc: "Optimize deployment build processes across multi-cloud clusters.", req: ["Docker & Kubernetes tracking rules", "GitHub Actions pipeline structures", "Linux kernel shell scripting"], vacancies: 3, lang: "English, Go, Bash", exp: "5+ Years", mode: "Hybrid", address: "Market St, Tech Center Floor 9, San Francisco, CA 94103, USA" },
    { title: "Site Reliability Engineer (SRE)", company: "AlwaysOn Media", type: "Full-Time", cat: "DevOps", salary: "$150k - $195k", loc: "Remote", date: "12/05/2026", logo: "A", desc: "Sustain network uptime across global service infrastructure maps.", req: ["Prometheus metrics layouts", "Python infrastructure coding", "Chaos resilience models"], vacancies: 2, lang: "English, Python", exp: "4+ Years", mode: "Online", address: "Global Server Grid, Dublin, Ireland" },
    { title: "DevSecOps Specialist", company: "DefenseTech Systems", type: "Full-Time", cat: "DevOps", salary: "$135k - $170k", loc: "Atlanta, GA", date: "09/05/2026", logo: "D", desc: "Inject automated compliance scans right inside compilation runs.", req: ["SonarQube script analysis patterns", "Vulnerability mapping metrics", "Infrastructure as Code policies"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Peachtree St NE, Corporate Square, Atlanta, GA 30309, USA" },
    { title: "Senior Product Designer", company: "ScaleAI", type: "Full-Time", cat: "UI/UX Design", salary: "$160k - $220k", loc: "San Francisco, CA", date: "13/05/2026", logo: "S", desc: "Lead the evolution of core enterprise application workflows.", req: ["Figma design token mapping systems", "Interactive prototyping user loops", "Complex data layouts"], vacancies: 2, lang: "English", exp: "5+ Years", mode: "Hybrid", address: "Mission St, Studio Block A, San Francisco, CA 94105, USA" },
    { title: "UX Researcher", company: "HumanCentric Labs", type: "Full-Time", cat: "UI/UX Design", salary: "$100k - $130k", loc: "Remote", date: "11/05/2026", logo: "H", desc: "Organize dynamic user testing matrices for item feedback metrics.", req: ["User testing strategy structures", "Quantitative survey logic blueprints", "Wireframe evaluation flows"], vacancies: 3, lang: "English", exp: "3+ Years", mode: "Online", address: "Behavior Analytics Block, Stockholm, Sweden" },
    { title: "UI Designer - Mobile Apps", company: "Creative Minds", type: "Part-Time", cat: "UI/UX Design", salary: "$70k - $90k", loc: "Miami, FL", date: "08/05/2026", logo: "C", desc: "Generate asset layouts for mobile interactive applications.", req: ["Mobile style platform rule sets", "Micro-interaction design structures", "Vector graphics design paths"], vacancies: 4, lang: "English", exp: "2+ Years", mode: "Hybrid", address: "Biscayne Blvd, Design District Suite 10, Miami, FL 33137, USA" },
    { title: "Senior iOS Developer (Swift)", company: "AppVantage Studio", type: "Full-Time", cat: "Mobile Development", salary: "$130k - $165k", loc: "Remote", date: "14/05/2026", logo: "A", desc: "Develop advanced user features within consumer iOS utilities.", req: ["SwiftUI design layout frameworks", "CoreData model storage control", "App Store build pipeline processes"], vacancies: 2, lang: "English, Swift", exp: "5+ Years", mode: "Online", address: "Mobile Application Grid, Tokyo, Japan" },
    { title: "Android Engineer (Kotlin)", company: "Mobility Global", type: "Full-Time", cat: "Mobile Development", salary: "$125k - $160k", loc: "Chicago, IL", date: "12/05/2026", logo: "M", desc: "Maintain clean application architectures within native environments.", req: ["Jetpack Compose components", "Kotlin Coroutines async patterns", "Dagger Hilt dependency flows"], vacancies: 3, lang: "English, Kotlin", exp: "4+ Years", mode: "Hybrid", address: "Michigan Ave, Engineering Floor 14, Chicago, IL 60611, USA" },
    { title: "Flutter Cross-Platform Developer", company: "SyncLabs", type: "Full-Time", cat: "Mobile Development", salary: "$100k - $135k", loc: "Remote", date: "10/05/2026", logo: "S", desc: "Unify dual-platform setups with clean, reusable codebase matrices.", req: ["Dart functional programming rules", "State management tracking layouts", "Native mobile bridge controls"], vacancies: 5, lang: "English, Dart", exp: "2+ Years", mode: "Online", address: "CrossPlatform Technology Park, Singapore" },
    { title: "QA Automation Engineer", company: "TestDriven Tech", type: "Full-Time", cat: "QA & Testing", salary: "$95k - $120k", loc: "Phoenix, AZ", date: "13/05/2026", logo: "T", desc: "Program automated testing scripts for tracking software interface states.", req: ["Selenium / Playwright validation scripts", "JavaScript scripting parameters", "CI test configuration pipeline items"], vacancies: 4, lang: "English, JavaScript", exp: "3+ Years", mode: "Hybrid", address: "Camelback Rd Core Center, Phoenix, AZ 85016, USA" },
    { title: "Manual QA Analyst", company: "FirstRelease Corp", type: "Full-Time", cat: "QA & Testing", salary: "$70k - $90k", loc: "Salt Lake City, UT", date: "11/05/2026", logo: "F", desc: "Draft verification plan logs matching complex real-world use tracks.", req: ["Detailed test case layout charts", "Bug lifecycle logging paths", "Regression sequence audits"], vacancies: 6, lang: "English", exp: "1-2 Years", mode: "Hybrid", address: "Main St, Verification Office 300, Salt Lake City, UT 84101, USA" },
    { title: "Performance Testing Engineer", company: "LoadMax Labs", type: "Full-Time", cat: "QA & Testing", salary: "$110k - $140k", loc: "Remote", date: "08/05/2026", logo: "L", desc: "Simulate massive parallel usage sequences against network servers.", req: ["JMeter load script configurations", "Server bottleneck capture routines", "Network throughput diagnostics"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Online", address: "Automation Infrastructure Strip, Zurich, Switzerland" },
    { title: "Machine Learning Engineer", company: "NeuralSystems AI", type: "Full-Time", cat: "AI/ML", salary: "$160k - $210k", loc: "Boston, MA", date: "14/05/2026", logo: "N", desc: "Train large-scale deep learning models on high-performance vector grids.", req: ["PyTorch application development building blocks", "CUDA environment training loops", "Distributed compute clusters"], vacancies: 2, lang: "English, Python", exp: "4+ Years", mode: "Hybrid", address: "Boylston St, Intelligence Center, Boston, MA 02116, USA" },
    { title: "Computer Vision Researcher", company: "SightTech Labs", type: "Full-Time", cat: "AI/ML", salary: "$170k - $220k", loc: "Remote", date: "11/05/2026", logo: "S", desc: "Implement real-time spatial image parsing patterns.", req: ["OpenCV library setups", "Object segmentation algorithms", "Model quantization workflows"], vacancies: 1, lang: "English, C++, Python", exp: "5+ Years", mode: "Online", address: "Neural Vision Campus, Toronto, Canada" },
    { title: "AI Product Integrator", company: "SmartWork Automation", type: "Full-Time", cat: "AI/ML", salary: "$120k - $155k", loc: "San Jose, CA", date: "07/05/2026", logo: "S", desc: "Embed intelligent model APIs into enterprise product configurations.", req: ["Vector database integrations", "Prompt engineer tuning scripts", "Python server development skills"], vacancies: 3, lang: "English, Python", exp: "2+ Years", mode: "Hybrid", address: "First St Tech Plaza, San Jose, CA 95112, USA" },
    { title: "Network Infrastructure Engineer", company: "Global Connect Communications", type: "Full-Time", cat: "Networking", salary: "$95k - $125k", loc: "Houston, TX", date: "12/05/2026", logo: "G", desc: "Configure resilient secure corporate datalink hardware topologies.", req: ["Cisco routing and switching command profiles", "BGP/OSPF layout configuration rules", "Packet capture network tracking tools"], vacancies: 3, lang: "English", exp: "4+ Years", mode: "Hybrid", address: "Louisiana St Corporate Plaza, Houston, TX 77002, USA" },
    { title: "Wireless Network Specialist", company: "TelcoWaves", type: "Full-Time", cat: "Networking", salary: "$90k - $115k", loc: "Remote", date: "09/05/2026", logo: "T", desc: "Design and optimize wide-area corporate network deployments.", req: ["Enterprise wireless network systems", "RF signal attenuation metrics", "Network security verification steps"], vacancies: 4, lang: "English", exp: "3+ Years", mode: "Online", address: "Telecom Infrastructure Tower, Sydney, Australia" },
    { title: "Database Administrator (Oracle/SQL)", company: "DataFortress Corp", type: "Full-Time", cat: "Database Administration", salary: "$110k - $145k", loc: "Minneapolis, MN", date: "13/05/2026", logo: "D", desc: "Preserve structural database integrity maps and validation tracks.", req: ["Oracle DB cluster administration rules", "Advanced PL/SQL optimization maps", "Disaster recovery scripting metrics"], vacancies: 2, lang: "English, SQL", exp: "5+ Years", mode: "Hybrid", address: "Marquette Ave Data Vault, Minneapolis, MN 55401, USA" },
    { title: "NoSQL Database Architect", company: "CloudScale Data", type: "Full-Time", cat: "Database Administration", salary: "$130k - $165k", loc: "Remote", date: "10/05/2026", logo: "C", desc: "Design high-performance distributed key-value storage grids.", req: ["MongoDB cluster scaling paths", "Cassandra partition control tracks", "Data consistency index models"], vacancies: 3, lang: "English", exp: "4+ Years", mode: "Online", address: "Distributed Storage Strip, Frankfurt, Germany" },
    { title: "IT Support Engineer (Tier 3)", company: "HelpDesk Pros", type: "Full-Time", cat: "Technical Support", salary: "$65k - $85k", loc: "Charlotte, NC", date: "14/05/2026", logo: "H", desc: "Remediate advanced configuration faults escalated from tiers 1 and 2.", req: ["Active Directory configurations", "Network hardware diagnostics", "OS system terminal scripting"], vacancies: 5, lang: "English", exp: "2+ Years", mode: "Hybrid", address: "Tryon St Suite 500, Charlotte, NC 28202, USA" },
    { title: "Enterprise Technical Support Lead", company: "SaaSCorp Global", type: "Full-Time", cat: "Technical Support", salary: "$80k - $105k", loc: "Remote", date: "12/05/2026", logo: "S", desc: "Guide software interface integrations for high-priority business targets.", req: ["API network evaluation metrics", "Linux server shell commands", "SLA control mapping tracking"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Online", address: "Global Solutions Terminal, Bangalore, India" },
    { title: "Technical Product Manager", company: "FutureProducts Inc", type: "Full-Time", cat: "Product Management", salary: "$140k - $185k", loc: "Seattle, WA", date: "14/05/2026", logo: "F", desc: "Bridge technical agile build cycles with corporate item goals.", req: ["Agile product tracking software use", "Technical system roadmap architectures", "Data-centric feature modeling"], vacancies: 2, lang: "English", exp: "4+ Years", mode: "Hybrid", address: "Pine St Strategy Studio, Seattle, WA 98101, USA" },
    { title: "Product Manager - AI Platform", company: "NextGen AI", type: "Full-Time", cat: "Product Management", salary: "$160k - $210k", loc: "New York, NY", date: "11/05/2026", logo: "N", desc: "Steer functional scope for machine learning development SDK packs.", req: ["AI/ML market pattern insights", "API functional lifecycle maps", "Cross-team scope coordination"], vacancies: 1, lang: "English", exp: "5+ Years", mode: "Hybrid", address: "Fifth Ave Creative Suite, New York, NY 10018, USA" },
    { title: "Web Developer - Angular Specialist", company: "WebWorks Studio", type: "Full-Time", cat: "Web Development", salary: "$90k - $115k", loc: "Remote", date: "06/05/2026", logo: "W", desc: "Maintain single page application user systems.", req: ["Angular 14 framework rules", "TypeScript optimization matrices"], vacancies: 4, lang: "English, TypeScript", exp: "2+ Years", mode: "Online", address: "Web Development Base, Vancouver, Canada" },
    { title: "Go Backend Engineer", company: "FastStream Tech", type: "Full-Time", cat: "Software Engineering", salary: "$135k - $170k", loc: "Denver, CO", date: "05/05/2026", logo: "F", desc: "Build highly concurrent low-latency messaging microservices systems.", req: ["Go channel paradigms", "gRPC data validation rules"], vacancies: 2, lang: "English, Go", exp: "3+ Years", mode: "Hybrid", address: "Broadway Tech Core, Denver, CO 80203, USA" },
    { title: "Systems Administrator", company: "NetOps LLC", type: "Full-Time", cat: "Networking", salary: "$85k - $110k", loc: "Kansas City, MO", date: "04/05/2026", logo: "N", desc: "Manage server room deployment setups.", req: ["Linux server administration structures", "Bash routine automation scripts"], vacancies: 3, lang: "English, Bash", exp: "3+ Years", mode: "Hybrid", address: "Main St Server Building, Kansas City, MO 64105, USA" },
    { title: "Lead QA Automation Specialist", company: "QualityFirst", type: "Full-Time", cat: "QA & Testing", salary: "$120k - $150k", loc: "Remote", date: "03/05/2026", logo: "Q", desc: "Oversee continuous integration performance check tracks.", req: ["Cypress automation code tracks", "Team workflow management patterns"], vacancies: 2, lang: "English, JavaScript", exp: "5+ Years", mode: "Online", address: "Quality Assurance Square, London, UK" },
    { title: "DevOps Release Coordinator", company: "ShipIt Fast", type: "Full-Time", cat: "DevOps", salary: "$100k - $130k", loc: "Austin, TX", date: "02/05/2026", logo: "S", desc: "Manage multi-stage production delivery nodes safely.", req: ["Git deployment tracking paths", "Docker platform build registries"], vacancies: 4, lang: "English", exp: "2+ Years", mode: "Hybrid", address: "Congress Ave Loop 4, Austin, TX 78701, USA" },
    { title: "Junior Data Analyst", company: "Startup Incubator", type: "Full-Time", cat: "Data Analytics", salary: "$65k - $80k", loc: "Chicago, IL", date: "01/05/2026", logo: "S", desc: "Help business product modules compile performance analytics logs.", req: ["SQL relational tracking", "Excel calculation sheets"], vacancies: 5, lang: "English, SQL", exp: "0-1 Years", mode: "Hybrid", address: "Wacker Dr Launch Space, Chicago, IL 60606, USA" },
    { title: "Data Engineer", company: "BigData Pipeline", type: "Full-Time", cat: "Data Science", salary: "$130k - $165k", loc: "Remote", date: "30/04/2026", logo: "B", desc: "Maintain real-time distributed file parsing system pipes.", req: ["Apache Kafka metrics handling", "Hadoop processing node control"], vacancies: 3, lang: "English, Java, Python", exp: "4+ Years", mode: "Online", address: "Data Architecture Block, Paris, France" },
    { title: "Application Security Analyst", company: "SecureApps", type: "Full-Time", cat: "Cyber Security", salary: "$110k - $140k", loc: "Boston, MA", date: "29/04/2026", logo: "S", desc: "Review production application code targets against potential bugs.", req: ["OWASP Top 10 vulnerabilities", "Static script tracking system run logs"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Beacon St Security Office, Boston, MA 02108, USA" },
    { title: "Cloud Storage Solutions Architect", company: "DataCloud Services", type: "Full-Time", cat: "Cloud Computing", salary: "$145k - $180k", loc: "Remote", date: "28/04/2026", logo: "D", desc: "Design distributed enterprise data array maps globally.", req: ["AWS S3 structure definitions", "Ceph clustering controls"], vacancies: 1, lang: "English", exp: "5+ Years", mode: "Online", address: "Cloud Array Campus, Seattle, WA 98104, USA" },
    { title: "Interaction UI Designer", company: "Studio Fluid", type: "Full-Time", cat: "UI/UX Design", salary: "$95k - $125k", loc: "New York, NY", date: "27/04/2026", logo: "S", desc: "Design smooth digital layout micro-interactions.", req: ["Adobe After Effects rendering tools", "Figma interface variants"], vacancies: 3, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Varick St Studio Suite, New York, NY 10014, USA" },
    { title: "React Native Mobile Engineer", company: "AppWorks", type: "Full-Time", cat: "Mobile Development", salary: "$115k - $145k", loc: "Remote", date: "26/04/2026", logo: "A", desc: "Deploy fast dual-platform native apps.", req: ["React Native hooks structures", "JavaScript runtime checks"], vacancies: 3, lang: "English, JavaScript", exp: "2+ Years", mode: "Online", address: "Mobile Engineering Terminal, Austin, TX 78704, USA" },
    { title: "PostgreSQL DBA Expert", company: "DBTech Group", type: "Full-Time", cat: "Database Administration", salary: "$120k - $155k", loc: "Dallas, TX", date: "25/04/2026", logo: "D", desc: "Manage relational storage shard and cluster arrays.", req: ["PostgreSQL configuration management", "Connection pool tuneup files"], vacancies: 2, lang: "English, SQL", exp: "4+ Years", mode: "Hybrid", address: "Main St Data Base Tower, Dallas, TX 75201, USA" },
    { title: "Help Desk Technician", company: "OfficeSync", type: "Full-Time", cat: "Technical Support", salary: "$50k - $65k", loc: "Houston, TX", date: "24/04/2026", logo: "O", desc: "Remediate basic user hardware errors and ticketing parameters.", req: ["Windows desktop diagnostic procedures", "Basic network hardware checks"], vacancies: 6, lang: "English", exp: "1+ Year" , mode: "Hybrid", address: "Fannin St Infrastructure Block, Houston, TX 77002, USA" },
    { title: "Associate Product Manager", company: "SaaS Launchpad", type: "Full-Time", cat: "Product Management", salary: "$90k - $115k", loc: "Remote", date: "23/04/2026", logo: "S", desc: "Compile feature update specs based on metrics loops.", req: ["Jira board project tracking use", "User narrative documentation drafting"], vacancies: 2, lang: "English", exp: "1-2 Years", mode: "Online", address: "Product Incubation Base, San Francisco, CA 94107, USA" },
    { title: "MLOps Engineer", company: "ModelScale", type: "Full-Time", cat: "AI/ML", salary: "$145k - $185k", loc: "San Francisco, CA", date: "22/04/2026", logo: "M", desc: "Deploy deep learning models onto cloud scaling structures.", req: ["Kubeflow orchestration platforms", "MLflow metrics validation tracks"], vacancies: 2, lang: "English, Python", exp: "3+ Years", mode: "Hybrid", address: "Howard St Intelligence Terminal, San Francisco, CA 94103, USA" }
];

// --- VIEW CONTROLLER ---
function showView(viewId) {
    closeMobileMenu();
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
    if (viewId !== 'landing') {
        document.body.classList.remove('landing-active');
    } else {
        document.body.classList.add('landing-active');
    }
    
    // Update active nav link
    document.querySelectorAll('#nav-links li').forEach(li => li.classList.remove('nav-active'));
    const activeNavItem = document.querySelector(`#nav-links li button[data-view="${viewId}"]`);
    if (activeNavItem) {
        activeNavItem.closest('li').classList.add('nav-active');
    }
    
    if(viewId === 'job-listings') renderJobs();
    if(viewId === 'dashboard') renderDashboard();
    if(viewId === 'my-applications') renderMyApplicationsView();
    if(viewId === 'profile-page') renderProfilePage();
    updateNav();
}

function toggleMobileMenu() {
    document.body.classList.toggle('nav-open');
}

function closeMobileMenu() {
    document.body.classList.remove('nav-open');
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileMenu();
});

function attachNavLinkHandlers() {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
        navLinks.addEventListener('click', function(event) {
            const button = event.target.closest('button[data-view]');
            if (button) {
                event.preventDefault();
                const viewId = button.dataset.view;
                if (viewId) showView(viewId);
            }
        });
    }
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }
}

attachNavLinkHandlers();

function updateNav() {
    if(currentUser) {
        document.getElementById('auth-btn').style.display = 'none';
        document.getElementById('dash-btn').style.display = currentUser.role === 'employer' ? 'block' : 'none';
        
        // Updated: Profile visible for BOTH candidate AND employer
        const profileHeader = document.getElementById('user-profile-header');
        const profileName = document.getElementById('user-profile-name');
        
        // If Employer, show company name or contact person name
        profileName.innerText = currentUser.name || currentUser.company;
        profileHeader.style.display = 'block';

        if(currentUser.role === 'candidate') {
            document.getElementById('my-apps-nav-btn').style.display = 'block';
        } else {
            document.getElementById('my-apps-nav-btn').style.display = 'none';
        }
        
        document.getElementById('logout-btn').style.display = 'block';
    } else {
        document.getElementById('auth-btn').style.display = 'block';
        document.getElementById('dash-btn').style.display = 'none';
        document.getElementById('user-profile-header').style.display = 'none';
        document.getElementById('my-apps-nav-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
    }
}

// --- CUSTOM MODAL POP-UPS ---
let modalAction = null;
function triggerPopup(message, type, callback = null) {
    const modal = document.getElementById('custom-modal');
    const msgH3 = document.getElementById('modal-msg');
    const iconDiv = document.getElementById('modal-icon');
    
    msgH3.innerText = message;
    iconDiv.innerHTML = type === 'success' 
        ? '<i class="fas fa-check-circle" style="color:#22c55e; font-size:3rem;"></i>' 
        : '<i class="fas fa-times-circle" style="color:#ef4444; font-size:3rem;"></i>';
    
    modal.style.display = 'flex';
    modalAction = callback;
}

function closeModal() {
    document.getElementById('custom-modal').style.display = 'none';
    if(modalAction) modalAction();
}

// --- AUTH FLOW LOGIC ---
function selectRole(role) {
    selectedRole = role;
    document.getElementById('auth-selection').style.display = 'none';
    document.getElementById('auth-form-container').style.display = 'block';
    toggleAuthMode(true); 
}

function backToSelection() {
    document.getElementById('auth-selection').style.display = 'block';
    document.getElementById('auth-form-container').style.display = 'none';
}

function toggleAuthMode(forceLogin = false) {
    if(forceLogin) isLoginMode = true;
    else isLoginMode = !isLoginMode;

    document.getElementById('auth-title').innerText = isLoginMode ? "Login" : "Register";
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "Don't have an account? Register" : "Have an account? Login";
    
    document.getElementById('login-fields').style.display = isLoginMode ? 'block' : 'none';
    document.getElementById('register-fields').style.display = isLoginMode ? 'none' : 'block';
    
    if(!isLoginMode) {
        document.getElementById('candidate-fields').style.display = selectedRole === 'candidate' ? 'block' : 'none';
        document.getElementById('employer-fields').style.display = selectedRole === 'employer' ? 'block' : 'none';
    }
}

// --- REAL-TIME VALIDATION HELPERS ---
function setErr(id, msg) {
    if(document.getElementById('err-' + id))
    document.getElementById('err-' + id).innerText = msg;
}

function validateLettersOnly(el) {
    el.value = el.value.replace(/[^a-zA-Z\s]/g, '');
    const errId = el.id;
    if (el.value.length < 2) setErr(errId, "Minimum 2 characters required");
    else setErr(errId, "");
}

function validateName(el) {
    el.value = el.value.replace(/[^a-zA-Z\s]/g, '');
    const errId = el.id;
    if (el.value.length < 2) setErr(errId, "Min 2 characters");
    else if (el.value.length > 50) setErr(errId, "Max 50 characters");
    else setErr(errId, "");
}

function validateEmail(el) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errId = el.id;
    if (!emailRegex.test(el.value)) setErr(errId, "Invalid email format");
    else if (users.find(u => u.email === el.value)) setErr(errId, "Email already registered");
    else setErr(errId, "");
}

function validatePhone(el) {
    el.value = el.value.replace(/\D/g, '');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const errId = el.id;
    if (el.value.length !== 10) setErr(errId, "Must be exactly 10 digits");
    else if (users.find(u => u.phone === el.value)) setErr(errId, "Phone already registered");
    else setErr(errId, "");
}

function validateURL(el) {
    const errId = el.id;
    try { new URL(el.value); setErr(errId, ""); } 
    catch { setErr(errId, "Invalid URL (include http://)"); }
}

function validateDigitsOnly(el, maxLength) {
    el.value = el.value.replace(/\D/g, '');
    if(maxLength) el.value = el.value.slice(0, maxLength);
}

function validatePass(el) {
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(el.value)) setErr(el.id, "8+ chars, Upper, Lower, Num, Special");
    else setErr(el.id, "");
}

function validateConfirmPass(el) {
    const pass = document.getElementById('reg-pass').value;
    if (el.value !== pass) setErr(el.id, "Passwords do not match");
    else setErr(el.id, "");
}

function togglePassVisibility(id) {
    const el = document.getElementById(id);
    const icon = el.nextElementSibling;
    if (el.type === "password") {
        el.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        el.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// --- VALIDATION & BACKEND SIMULATION ---
function validateRegistration() {
    const errors = document.querySelectorAll('.error-msg');
    let hasError = false;
    errors.forEach(e => { if(e.innerText !== "") hasError = true; });
    
    const pass = document.getElementById('reg-pass').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;
    if(pass !== confirmPass || pass === "") return false;

    return !hasError;
}

function handleAuthSubmit() {
    if(isLoginMode) {
        performLogin();
    } else {
        if(validateRegistration()) {
            performRegistration();
        } else {
            triggerPopup("Please fix the validation errors first.", "error");
        }
    }
}

function performRegistration() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let newUser = {
        role: selectedRole,
        pass: document.getElementById('reg-pass').value,
        verified: true,
        linkedin: '',
        portfolio: '',
        summary: '',
        degree: '',
        college: '',
        score: '',
        passyear: '',
        expCompany: '',
        expTitle: '',
        expDuration: '',
        expResponsibilities: '',
        techskills: '',
        softskills: '',
        skillLevel: '',
        certName: '',
        certOrg: '',
        certDate: '',
        projectTitle: '',
        projectDesc: '',
        projectTech: '',
        projectLink: '',
        prefRole: '',
        prefLocation: '',
        prefSalary: '',
        prefEmployment: '',
        notifEmail: false,
        notifSMS: false,
        resumeFileName: '',
        resumeData: '',
        savedJobs: []
    };

    if(selectedRole === 'candidate') {
        newUser.name = document.getElementById('reg-name').value;
        newUser.email = document.getElementById('reg-email').value;
        newUser.phone = document.getElementById('reg-phone').value;
        newUser.location = document.getElementById('reg-loc').value;
    } else {
        newUser.company = document.getElementById('reg-comp-name').value;
        newUser.email = document.getElementById('reg-comp-email').value;
        newUser.phone = document.getElementById('reg-comp-phone').value;
        newUser.website = document.getElementById('reg-comp-web').value;
        newUser.industry = '';
        newUser.companySize = '';
        newUser.founded = '';
        newUser.headquarters = '';
        newUser.description = '';
        newUser.hrName = '';
        newUser.hrEmail = newUser.email;
        newUser.hrPhone = newUser.phone;
        newUser.verificationGST = '';
        newUser.verificationReg = '';
        newUser.notifEmail = false;
        newUser.notifSMS = false;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    triggerPopup("Registration Successful!", "success", () => {
        toggleAuthMode(true); 
    });
}

function performLogin() {
    const identifier = document.getElementById('login-identifier').value;
    const pass = document.getElementById('login-pass').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(u => (u.email === identifier || u.phone === identifier) && u.pass === pass && u.role === selectedRole);

    if(user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        triggerPopup("Login Successful!", "success", () => {
            showView('home');
        });
    } else {
        triggerPopup("Invalid credentials or Role mismatch!", "error");
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// --- DYNAMIC SEARCH AND VIEW INTERACTION ---
function resetJobSelectionAndRender() {
    selectedJobIndex = 0; 
    renderJobs();
}

function getInrSalaryRange(job) {
    const salaryMap = {
        'Web Development': '₹8L - ₹16L',
        'Software Engineering': '₹14L - ₹26L',
        'Data Analytics': '₹10L - ₹18L',
        'Data Science': '₹16L - ₹30L',
        'Cyber Security': '₹12L - ₹22L',
        'Cloud Computing': '₹14L - ₹25L',
        'DevOps': '₹12L - ₹22L',
        'UI/UX Design': '₹7L - ₹15L',
        'Mobile Development': '₹10L - ₹20L',
        'QA & Testing': '₹6L - ₹12L',
        'Technical Support': '₹5L - ₹10L',
        'Product Management': '₹14L - ₹28L',
        'Database Administration': '₹12L - ₹20L',
        'Networking': '₹10L - ₹18L',
        'AI/ML': '₹18L - ₹32L'
    };
    return salaryMap[job.cat] || '₹8L - ₹18L';
}

function getJobDescription(job) {
    return `As a ${job.title} at ${job.company}, you will own the delivery of high-impact solutions with a focus on reliability, maintainability, and scalability. This role requires strong collaboration across product, engineering and quality teams to define technical strategy, execute clean architecture, and deliver customer-facing outcomes in a fast-paced environment. You will build modern systems, document best practices, and continuously improve engineering standards.`;
}

function getJobRequirements(job) {
    const primarySkill = job.lang ? job.lang.split(',')[0] : job.cat;
    return [
        `5+ years of proven experience in ${job.cat.toLowerCase()} or a related discipline.`,
        `Hands-on expertise with ${primarySkill.trim()} and modern development practices.`,
        'Strong communication, cross-functional collaboration, and stakeholder management skills.',
        'Ability to work independently, drive ownership, and mentor junior team members.'
    ];
}

function getLocalizedJob(job) {
    if(!staticJobsDatabase.includes(job)) return job;
    const clone = { ...job };
    const cities = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida', 'Kolkata', 'Delhi', 'Ahmedabad'];
    const cityIndex = Math.abs(job.title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % cities.length;
    clone.loc = `${cities[cityIndex]}, India`;
    clone.salary = getInrSalaryRange(job);
    clone.address = `${clone.loc}`;
    clone.desc = getJobDescription(job);
    clone.req = getJobRequirements(job);
    return clone;
}

function renderJobs() {
    const allJobs = [...jobs, ...staticJobsDatabase];
    const searchVal = document.getElementById('job-search-input').value.toLowerCase();
    
    const filteredJobs = allJobs.filter(j => 
        j.title.toLowerCase().includes(searchVal) || 
        j.cat.toLowerCase().includes(searchVal) || 
        j.company.toLowerCase().includes(searchVal) ||
        j.lang.toLowerCase().includes(searchVal) ||
        j.mode.toLowerCase().includes(searchVal)
    );

    document.getElementById('jobs-count-text').innerText = `${filteredJobs.length} Jobs Found`;

    const targetContainer = document.getElementById('dynamic-job-view');
    if(filteredJobs.length === 0) {
        targetContainer.innerHTML = `<div class="ui-box" style="text-align:center; padding: 40px; color: var(--grey);">No matching jobs found.</div>`;
        return;
    }

    if(selectedJobIndex >= filteredJobs.length) selectedJobIndex = 0;
    const currentJob = getLocalizedJob(filteredJobs[selectedJobIndex]);

    let requirementsHTML = '';
    currentJob.req.forEach(r => { requirementsHTML += `<li><i class="fas fa-check-circle"></i> ${r}</li>`; });

    let miniJobsHTML = '';
    filteredJobs.forEach((job, index) => {
        if(index !== selectedJobIndex) {
            const displayedJob = getLocalizedJob(job);
            miniJobsHTML += `
                <div class="mini-job-card" onclick="viewJob(${index})">
                    <div class="mini-logo">${displayedJob.logo}</div>
                    <div>
                        <p class="mini-title">${displayedJob.title}</p>
                        <p class="mini-meta">${displayedJob.company} • ${displayedJob.loc}</p>
                        <p class="mini-salary">${displayedJob.salary} • <span style="font-weight:600;">${displayedJob.mode}</span></p>
                        <p class="mini-meta" style="margin-top:6px; font-size:0.75rem;">Posted: ${displayedJob.date}</p>
                    </div>
                </div>
            `;
        }
    });

    targetContainer.innerHTML = `
        <div class="job-detail-card ui-box">
            <div class="job-detail-main-header">
                <div class="company-logo-square">${currentJob.logo}</div>
                <div class="job-title-info">
                    <div class="job-tags-row">
                        <span class="badge-blue">${currentJob.type.toUpperCase()}</span>
                        <span class="badge-purple">${currentJob.cat.toUpperCase()}</span>
                        <span class="badge-orange"><i class="fas fa-laptop-house"></i> ${currentJob.mode.toUpperCase()}</span>
                    </div>
                    <h2 class="job-main-h2">${currentJob.title}</h2>
                    <p class="job-sub-info"><strong>${currentJob.company}</strong> • <i class="fas fa-map-marker-alt"></i> ${currentJob.loc}</p>
                    <p style="font-size:0.85rem; color:var(--grey); margin-top:5px;"><i class="fas fa-calendar-alt"></i> Posted: ${currentJob.date}</p>
                    <p style="font-size:0.85rem; color:var(--grey); margin-top:5px;"><i class="fas fa-building"></i> Address: ${currentJob.address}</p>
                </div>
                <div class="job-action-buttons">
                    <button class="btn-icon"><i class="far fa-bookmark"></i></button>
                    <button class="btn-primary" onclick="initiateJobApplicationProcess()">Apply Now</button>
                </div>
            </div>
            <div class="job-stats-grid">
                <div class="stat-item"><p class="stat-label">SALARY</p><p class="stat-value">${currentJob.salary}</p></div>
                <div class="stat-item"><p class="stat-label">EXP</p><p class="stat-value">${currentJob.exp}</p></div>
                <div class="stat-item"><p class="stat-label">STACK</p><p class="stat-value">${currentJob.lang}</p></div>
                <div class="stat-item"><p class="stat-label">VACANCIES</p><p class="stat-value">${currentJob.vacancies}</p></div>
            </div>
            <div class="job-description-split">
                <div class="desc-left">
                    <h3 class="detail-section-title">Job Description</h3>
                    <p class="detail-p">${currentJob.desc}</p>
                    <h3 class="detail-section-title">Requirements</h3>
                    <ul class="requirements-list">${requirementsHTML}</ul>
                </div>
                <div class="desc-right">
                    <h3 class="detail-section-title">Related</h3>
                    <div class="mini-job-list">${miniJobsHTML}</div>
                </div>
            </div>
        </div>
    `;
}

function viewJob(index) {
    selectedJobIndex = index;
    renderJobs();
}

// --- APPLICATION PROCESS ---
function initiateJobApplicationProcess() {
    if(!currentUser || currentUser.role !== 'candidate') {
        triggerPopup("Please login as a Candidate first.", "error");
        return;
    }
    const allJobs = [...jobs, ...staticJobsDatabase];
    const searchVal = document.getElementById('job-search-input').value.toLowerCase();
    const filteredJobs = allJobs.filter(j => 
        j.title.toLowerCase().includes(searchVal) || 
        j.cat.toLowerCase().includes(searchVal) || 
        j.company.toLowerCase().includes(searchVal) ||
        j.lang.toLowerCase().includes(searchVal) ||
        j.mode.toLowerCase().includes(searchVal)
    );
    selectedJob = filteredJobs[selectedJobIndex] || allJobs[0];

    document.getElementById('target-applying-job-title').innerText = `Applying for: ${selectedJob.title} at ${selectedJob.company}`;
    showView('job-application-form-view');

    // Auto-fill application form from logged-in candidate profile when available
    if(currentUser && currentUser.role === 'candidate') {
        document.getElementById('app-fullname').value = currentUser.name || '';
        document.getElementById('app-email').value = currentUser.email || '';
        document.getElementById('app-phone').value = currentUser.phone || '';
        document.getElementById('app-dob').value = currentUser.dob || '';
        document.getElementById('app-address').value = currentUser.address || '';
        document.getElementById('app-city').value = currentUser.city || '';
        document.getElementById('app-state').value = currentUser.state || '';
        document.getElementById('app-country').value = currentUser.country || '';
        document.getElementById('app-pincode').value = currentUser.pincode || '';
        document.getElementById('app-title').value = currentUser.expTitle || '';

        // If candidate has resume uploaded in profile, enable submit button
        if(currentUser.resumeData) {
            document.getElementById('resume-warning-msg').style.display = 'none';
            document.getElementById('actual-submit-application-btn').style.display = 'inline-block';
        } else {
            toggleFormApplyButtonValidity();
        }
    } else {
        toggleFormApplyButtonValidity();
    }
}

function handleJobResumeChange(input) {
    const previewBtn = document.getElementById('app-resume-preview-btn');
    const infoEl = document.getElementById('app-resume-info');
    const file = input.files[0];

    if(currentResumePreviewUrl) {
        URL.revokeObjectURL(currentResumePreviewUrl);
        currentResumePreviewUrl = null;
    }

    if(file) {
        infoEl.innerText = file.name;
        if(file.type === 'application/pdf') {
            currentResumePreviewUrl = URL.createObjectURL(file);
            previewBtn.style.display = 'inline-block';
        } else {
            previewBtn.style.display = 'none';
        }
    } else {
        infoEl.innerText = currentUser && currentUser.resumeFileName ? currentUser.resumeFileName : '';
        previewBtn.style.display = currentUser && currentUser.resumeData && currentUser.resumeFileName && currentUser.resumeFileName.toLowerCase().endsWith('.pdf') ? 'inline-block' : 'none';
    }

    toggleFormApplyButtonValidity();
}

function previewApplicationResume(appId = null) {
    const modal = document.getElementById('resume-preview-modal');
    const iframe = document.getElementById('resume-preview-iframe');
    let resumeSrc = '';
    let fileName = '';

    if(appId) {
        const app = applications.find(a => a.id === appId || a.candidateEmail === appId || String(a.appliedAt) === String(appId));
        if(!app) {
            triggerPopup('Resume not found for this application.', 'error');
            return;
        }
        resumeSrc = app.resumeData || '';
        fileName = app.resumeFileName || '';
    } else {
        const resumeInput = document.getElementById('app-resume-file');
        const file = resumeInput.files[0];
        if(file && file.type === 'application/pdf') {
            if(!currentResumePreviewUrl) {
                currentResumePreviewUrl = URL.createObjectURL(file);
            }
            resumeSrc = currentResumePreviewUrl;
            fileName = file.name;
        } else if(currentUser && currentUser.resumeData && currentUser.resumeFileName && currentUser.resumeFileName.toLowerCase().endsWith('.pdf')) {
            resumeSrc = currentUser.resumeData;
            fileName = currentUser.resumeFileName;
        }
    }

    if(!resumeSrc || !fileName.toLowerCase().endsWith('.pdf')) {
        if(appId) {
            downloadResumeForApplicant(applications.find(a => a.id === appId || a.candidateEmail === appId || String(a.appliedAt) === String(appId)).candidateEmail);
            return;
        }
        triggerPopup('No PDF resume available for preview.', 'error');
        return;
    }

    iframe.src = resumeSrc;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeResumePreviewModal() {
    const modal = document.getElementById('resume-preview-modal');
    const iframe = document.getElementById('resume-preview-iframe');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    iframe.src = '';

    if(currentResumePreviewUrl) {
        URL.revokeObjectURL(currentResumePreviewUrl);
        currentResumePreviewUrl = null;
    }
}

function toggleFormApplyButtonValidity() {
    const resumeInput = document.getElementById('app-resume-file');
    const hasLocalFile = resumeInput && resumeInput.files && resumeInput.files.length > 0;
    const hasProfileResume = currentUser && currentUser.resumeData;
    const ok = hasLocalFile || hasProfileResume;
    document.getElementById('resume-warning-msg').style.display = ok ? 'none' : 'block';
    document.getElementById('actual-submit-application-btn').style.display = ok ? 'inline-block' : 'none';

    const previewBtn = document.getElementById('app-resume-preview-btn');
    const infoEl = document.getElementById('app-resume-info');
    if(hasLocalFile) {
        const file = resumeInput.files[0];
        previewBtn.style.display = file.type === 'application/pdf' ? 'inline-block' : 'none';
        infoEl.innerText = file.name;
    } else if(hasProfileResume) {
        const isPdf = currentUser.resumeFileName && currentUser.resumeFileName.toLowerCase().endsWith('.pdf');
        previewBtn.style.display = isPdf ? 'inline-block' : 'none';
        infoEl.innerText = currentUser.resumeFileName || '';
    } else {
        previewBtn.style.display = 'none';
        infoEl.innerText = '';
    }
}

function handleJobApplicationSubmit(event) {
    event.preventDefault();
    const targetJob = selectedJob || [...jobs, ...staticJobsDatabase].find((_, index) => index === selectedJobIndex) || {...jobs[0], ...staticJobsDatabase[0]};
    const resumeInput = document.getElementById('app-resume-file');

    const candidateEmailVal = (currentUser && currentUser.role === 'candidate') ? (currentUser.email || '') : document.getElementById('app-email').value.trim();
    const candidateNameVal = (currentUser && currentUser.role === 'candidate') ? (currentUser.name || currentUser.email || '') : document.getElementById('app-fullname').value.trim();
    const candidatePhoneVal = (currentUser && currentUser.role === 'candidate') ? (currentUser.phone || '') : document.getElementById('app-phone').value.trim();
    const candidatePincodeVal = document.getElementById('app-pincode').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!candidateNameVal) { triggerPopup('Please enter your full name.', 'error'); return; }
    if(!candidateEmailVal || !emailRegex.test(candidateEmailVal)) { triggerPopup('Please enter a valid email address.', 'error'); return; }
    if(!candidatePhoneVal || candidatePhoneVal.replace(/\D/g,'').length !== 10) { triggerPopup('Please enter a valid 10-digit phone number.', 'error'); return; }
    if(!candidatePincodeVal || !/^\d{6}$/.test(candidatePincodeVal)) { triggerPopup('Please enter a valid 6-digit pincode.', 'error'); return; }
    if(!(resumeInput.files && resumeInput.files.length) && !(currentUser && currentUser.resumeData)) { triggerPopup('Please upload your resume to apply.', 'error'); return; }

    const createApplication = (resumeData) => {
        const applicationPayload = {
            id: 'APP-' + Date.now(),
            jobId: targetJob.id || `${targetJob.title}|${targetJob.company}|${targetJob.date}`,
            jobTitle: targetJob.title,
            company: targetJob.company,
            employerCompany: targetJob.company,
            candidateName: candidateNameVal,
            candidateEmail: candidateEmailVal,
            candidatePhone: candidatePhoneVal,
            candidateDOB: document.getElementById('app-dob').value,
            candidateGender: document.getElementById('app-gender').value,
            candidateAddress: document.getElementById('app-address').value.trim(),
            candidateCity: document.getElementById('app-city').value.trim(),
            candidateState: document.getElementById('app-state').value.trim(),
            candidateCountry: document.getElementById('app-country').value.trim(),
            candidatePincode: document.getElementById('app-pincode').value.trim(),
            candidatePhotoName: document.getElementById('app-photo').files[0]?.name || '',
            currentJobTitle: document.getElementById('app-title').value.trim(),
            totalExperience: document.getElementById('app-exp').value,
            currentCompany: document.getElementById('app-curr-company').value.trim(),
            currentSalary: document.getElementById('app-curr-salary').value.trim(),
            expectedSalary: document.getElementById('app-exp-salary').value.trim(),
            noticePeriod: document.getElementById('app-notice').value.trim(),
            preferredLocation: document.getElementById('app-pref-loc').value.trim(),
            employmentType: document.getElementById('app-emptype').value,
            highestQualification: document.getElementById('app-qual').value.trim(),
            degreeName: document.getElementById('app-degree').value.trim(),
            specialization: document.getElementById('app-spec').value.trim(),
            university: document.getElementById('app-univ').value.trim(),
            educationStatus: document.getElementById('app-status').value,
            score: document.getElementById('app-score').value.trim(),
            technicalSkills: document.getElementById('app-techskills').value.trim(),
            softSkills: document.getElementById('app-softskills').value.trim(),
            certifications: document.getElementById('app-certs').value.trim(),
            languagesKnown: document.getElementById('app-langsknown').value.trim(),
            resumeFileName: resumeInput.files[0]?.name || (currentUser && currentUser.resumeFileName) || '',
            resumeData: resumeData || (currentUser && currentUser.resumeData) || '',
            coverLetter: document.getElementById('app-coverletter').value.trim(),
            portfolioURL: document.getElementById('app-portfolio').value.trim(),
            linkedinURL: document.getElementById('app-linkedin').value.trim(),
            githubURL: document.getElementById('app-github').value.trim(),
            workExpCompany: document.getElementById('app-exp-comp').value.trim(),
            workExpTitle: document.getElementById('app-exp-title').value.trim(),
            workExpStart: document.getElementById('app-exp-start').value,
            workExpEnd: document.getElementById('app-exp-end').value,
            workExpResponsibilities: document.getElementById('app-exp-resp').value.trim(),
            workExpAchievements: document.getElementById('app-exp-achieve').value.trim(),
            dateApplied: new Date().toLocaleDateString(),
            appliedAt: Date.now(),
            status: 'Applied'
        };

        applications.push(applicationPayload);
        localStorage.setItem('applications', JSON.stringify(applications));

        triggerPopup(`Applied for ${targetJob.title} successfully!`, "success", () => {
            selectedJob = null;
            showView('my-applications');
        });
    };

    if(resumeInput.files && resumeInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => createApplication(reader.result);
        reader.onerror = () => triggerPopup('Unable to read resume file. Please try again.', 'error');
        reader.readAsDataURL(resumeInput.files[0]);
    } else {
        createApplication(currentUser && currentUser.resumeData ? currentUser.resumeData : '');
    }
}

function renderMyApplicationsView() {
    const container = document.getElementById('my-applications-list-wrapper');
    const candidateApps = applications.filter(app => app.candidateEmail === currentUser.email);

    if(candidateApps.length === 0) {
        container.innerHTML = `<div class="ui-box">No applications submitted yet.</div>`;
        return;
    }

    let listHTML = '<div style="display:grid; gap:18px;">';
    candidateApps.forEach(app => {
        listHTML += `
            <div class="app-status-card" style="flex-direction:column; align-items:flex-start; gap:16px; padding:22px;">
                <div style="display:flex; justify-content:space-between; width:100%; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h3 style="margin:0; font-size:1.1rem;">${app.jobTitle}</h3>
                        <p style="margin:6px 0 0 0; color:var(--primary); font-weight:700;">${app.company}</p>
                    </div>
                    <span class="${getStatusBadgeClass(app.status)}">${app.status}</span>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:14px; width:100%;">
                    <div><strong>Date Applied</strong><br><span style="color:#475569;">${app.dateApplied}</span></div>
                    <div><strong>Phone</strong><br><span style="color:#475569;">${app.candidatePhone || 'N/A'}</span></div>
                    <div><strong>Education</strong><br><span style="color:#475569;">${app.degreeName || app.highestQualification || 'N/A'}</span></div>
                    <div><strong>Experience</strong><br><span style="color:#475569;">${app.totalExperience || 'N/A'} yrs</span></div>
                </div>
                <div style="width:100%; background:#f8fafc; padding:14px; border-radius:10px; color:#475569;">
                    <p style="margin:0 0 6px 0;"><strong>Cover Letter</strong></p>
                    <p style="margin:0; font-size:0.95rem; line-height:1.6;">${app.coverLetter ? app.coverLetter : 'No cover letter provided.'}</p>
                </div>
            </div>
        `;
    });
    listHTML += '</div>';
    container.innerHTML = listHTML;
}

function saveCurrentUser(previousEmail = null) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const searchEmail = previousEmail || currentUser.email;
    const idx = users.findIndex(u => u.email === searchEmail && u.role === currentUser.role);
    if(idx >= 0) {
        users[idx] = currentUser;
    } else {
        users.push(currentUser);
    }
    localStorage.setItem('users', JSON.stringify(users));
}

function calculateProfileCompletion(user) {
    const keys = ['name', 'email', 'phone', 'linkedin', 'portfolio', 'summary', 'degree', 'college', 'resumeData'];
    let filled = keys.reduce((sum, key) => sum + (user[key] ? 1 : 0), 0);
    return Math.min(100, Math.round((filled / keys.length) * 100));
}

function handleProfileResumeChange(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentUser.resumeData = reader.result;
        currentUser.resumeFileName = file.name;
        saveCurrentUser();
        renderProfilePage();
    };
    reader.readAsDataURL(file);
}

function downloadProfileResume() {
    if(!currentUser || !currentUser.resumeData) {
        triggerPopup('No resume uploaded yet.', 'error');
        return;
    }
    const link = document.createElement('a');
    link.href = currentUser.resumeData;
    link.download = currentUser.resumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadResumeForApplicant(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const candidate = users.find(u => u.email === email && u.role === 'candidate');
    if(!candidate || !candidate.resumeData) {
        triggerPopup('Resume not available for this applicant.', 'error');
        return;
    }
    const link = document.createElement('a');
    link.href = candidate.resumeData;
    link.download = candidate.resumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveProfileData() {
    if(!currentUser) return;
    let previousEmail = null;
    if(currentUser.role === 'candidate') {
        previousEmail = currentUser.email;
        currentUser.name = document.getElementById('prof-fullname').value.trim();
        currentUser.email = document.getElementById('prof-email').value.trim();
        currentUser.phone = document.getElementById('prof-phone').value.trim();
        currentUser.dob = document.getElementById('prof-dob').value;
        currentUser.gender = document.getElementById('prof-gender').value;
        currentUser.address = document.getElementById('prof-address').value.trim();
        currentUser.linkedin = document.getElementById('prof-linkedin').value.trim();
        currentUser.portfolio = document.getElementById('prof-portfolio').value.trim();
        currentUser.summary = document.getElementById('prof-summary').value.trim();
        currentUser.degree = document.getElementById('prof-degree').value.trim();
        currentUser.college = document.getElementById('prof-college').value.trim();
        currentUser.score = document.getElementById('prof-score').value.trim();
        currentUser.passyear = document.getElementById('prof-passyear').value.trim();
        currentUser.expCompany = document.getElementById('prof-exp-company').value.trim();
        currentUser.expTitle = document.getElementById('prof-exp-title').value.trim();
        currentUser.expDuration = document.getElementById('prof-exp-duration').value.trim();
        currentUser.expResponsibilities = document.getElementById('prof-exp-resp').value.trim();
        currentUser.techskills = document.getElementById('prof-techskills').value.trim();
        currentUser.softskills = document.getElementById('prof-softskills').value.trim();
        currentUser.skillLevel = document.getElementById('prof-skill-level').value.trim();
        currentUser.certName = document.getElementById('prof-cert-name').value.trim();
        currentUser.certOrg = document.getElementById('prof-cert-org').value.trim();
        currentUser.certDate = document.getElementById('prof-cert-date').value;
        currentUser.projectTitle = document.getElementById('prof-project-title').value.trim();
        currentUser.projectDesc = document.getElementById('prof-project-desc').value.trim();
        currentUser.projectTech = document.getElementById('prof-project-tech').value.trim();
        currentUser.projectLink = document.getElementById('prof-project-link').value.trim();
        currentUser.prefRole = document.getElementById('prof-pref-role').value.trim();
        currentUser.prefLocation = document.getElementById('prof-pref-loc').value.trim();
        currentUser.prefSalary = document.getElementById('prof-pref-salary').value.trim();
        currentUser.prefEmployment = document.getElementById('prof-pref-emptype').value;
        currentUser.notifEmail = document.getElementById('prof-notif-email').checked;
        currentUser.notifSMS = document.getElementById('prof-notif-sms').checked;
    } else {
        currentUser.company = document.getElementById('emp-company-name').value.trim();
        currentUser.logoLetter = document.getElementById('emp-logo-letter').value.trim();
        currentUser.industry = document.getElementById('emp-industry').value.trim();
        currentUser.companySize = document.getElementById('emp-size').value.trim();
        currentUser.website = document.getElementById('emp-website').value.trim();
        currentUser.founded = document.getElementById('emp-founded').value.trim();
        currentUser.headquarters = document.getElementById('emp-headquarters').value.trim();
        currentUser.description = document.getElementById('emp-description').value.trim();
        currentUser.hrName = document.getElementById('emp-hr-name').value.trim();
        currentUser.hrEmail = document.getElementById('emp-hr-email').value.trim();
        currentUser.hrPhone = document.getElementById('emp-hr-phone').value.trim();
        currentUser.notifEmail = document.getElementById('emp-notif-email').checked;
        currentUser.notifSMS = document.getElementById('emp-notif-sms').checked;
    }
    if(currentUser.role === 'candidate') {
        saveCurrentUser(previousEmail);
    } else {
        saveCurrentUser();
    }
    triggerPopup('Profile updated successfully!', 'success', renderProfilePage);
}

function saveProfilePassword() {
    if(!currentUser) return;
    const oldPass = document.getElementById(currentUser.role === 'candidate' ? 'prof-old-pass' : 'emp-old-pass').value;
    const newPass = document.getElementById(currentUser.role === 'candidate' ? 'prof-new-pass' : 'emp-new-pass').value;
    const confirmPass = document.getElementById(currentUser.role === 'candidate' ? 'prof-confirm-pass' : 'emp-confirm-pass').value;
    if(oldPass !== currentUser.pass) {
        triggerPopup('Current password is incorrect.', 'error');
        return;
    }
    if(newPass.length < 8 || newPass !== confirmPass) {
        triggerPopup('New password must match and be at least 8 characters.', 'error');
        return;
    }
    currentUser.pass = newPass;
    saveCurrentUser();
    triggerPopup('Password updated successfully.', 'success');
}

function deleteAccount() {
    if(!currentUser) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const filtered = users.filter(u => !(u.email === currentUser.email && u.role === currentUser.role));
    localStorage.setItem('users', JSON.stringify(filtered));
    localStorage.removeItem('currentUser');
    triggerPopup('Account deleted. Reloading...', 'success', () => location.reload());
}

function renderProfilePage() {
    if(!currentUser) { showView('home'); return; }
    const candidateSection = document.getElementById('candidate-profile-section');
    const employerSection = document.getElementById('employer-profile-section');
    const allJobs = [...jobs, ...staticJobsDatabase];
    document.getElementById('profile-completion-text').innerText = `Profile Completion: ${calculateProfileCompletion(currentUser)}%`;
    document.getElementById('profile-completion-bar').style.width = `${calculateProfileCompletion(currentUser)}%`;
    if(currentUser.role === 'candidate') {
        candidateSection.style.display = 'block';
        employerSection.style.display = 'none';
        document.getElementById('prof-fullname').value = currentUser.name || '';
        document.getElementById('prof-email').value = currentUser.email || '';
        document.getElementById('prof-phone').value = currentUser.phone || '';
        document.getElementById('prof-dob').value = currentUser.dob || '';
        document.getElementById('prof-gender').value = currentUser.gender || '';
        document.getElementById('prof-address').value = currentUser.address || '';
        document.getElementById('prof-linkedin').value = currentUser.linkedin || '';
        document.getElementById('prof-portfolio').value = currentUser.portfolio || '';
        document.getElementById('prof-summary').value = currentUser.summary || '';
        document.getElementById('prof-degree').value = currentUser.degree || '';
        document.getElementById('prof-college').value = currentUser.college || '';
        document.getElementById('prof-score').value = currentUser.score || '';
        document.getElementById('prof-passyear').value = currentUser.passyear || '';
        document.getElementById('prof-exp-company').value = currentUser.expCompany || '';
        document.getElementById('prof-exp-title').value = currentUser.expTitle || '';
        document.getElementById('prof-exp-duration').value = currentUser.expDuration || '';
        document.getElementById('prof-exp-resp').value = currentUser.expResponsibilities || '';
        document.getElementById('prof-techskills').value = currentUser.techskills || '';
        document.getElementById('prof-softskills').value = currentUser.softskills || '';
        document.getElementById('prof-skill-level').value = currentUser.skillLevel || '';
        document.getElementById('prof-cert-name').value = currentUser.certName || '';
        document.getElementById('prof-cert-org').value = currentUser.certOrg || '';
        document.getElementById('prof-cert-date').value = currentUser.certDate || '';
        document.getElementById('prof-project-title').value = currentUser.projectTitle || '';
        document.getElementById('prof-project-desc').value = currentUser.projectDesc || '';
        document.getElementById('prof-project-tech').value = currentUser.projectTech || '';
        document.getElementById('prof-project-link').value = currentUser.projectLink || '';
        document.getElementById('prof-pref-role').value = currentUser.prefRole || '';
        document.getElementById('prof-pref-loc').value = currentUser.prefLocation || '';
        document.getElementById('prof-pref-salary').value = currentUser.prefSalary || '';
        document.getElementById('prof-pref-emptype').value = currentUser.prefEmployment || '';
        document.getElementById('prof-notif-email').checked = !!currentUser.notifEmail;
        document.getElementById('prof-notif-sms').checked = !!currentUser.notifSMS;
        document.getElementById('prof-resume-filename').innerText = currentUser.resumeFileName || '';
        document.getElementById('prof-download-resume-btn').style.display = currentUser.resumeData ? 'inline-block' : 'none';
        const savedJobsContainer = document.getElementById('profile-saved-jobs');
        savedJobsContainer.innerHTML = currentUser.savedJobs && currentUser.savedJobs.length ? currentUser.savedJobs.map(job => `<div style="padding:12px; border-bottom:1px solid #e2e8f0;">${job}</div>`).join('') : '<p style="color:var(--grey);">No saved jobs yet.</p>';
        const appliedJobsContainer = document.getElementById('profile-applied-jobs');
        const candidateApps = applications.filter(app => app.candidateEmail === currentUser.email);
        if(candidateApps.length === 0) {
            appliedJobsContainer.innerHTML = '<p style="color:var(--grey);">No applications yet.</p>';
        } else {
            appliedJobsContainer.innerHTML = candidateApps.map(app => `
                <div class="app-status-card">
                    <div>
                        <h3 style="font-weight:700; margin-bottom:5px;">${app.jobTitle}</h3>
                        <p style="color:var(--primary); margin:0;">${app.company}</p>
                        <p style="color:var(--grey); font-size:0.8rem; margin:4px 0 0 0;">Applied: ${app.dateApplied}</p>
                    </div>
                    <div><span class="${getStatusBadgeClass(app.status)}">${app.status}</span></div>
                </div>
            `).join('');
        }
    } else {
        candidateSection.style.display = 'none';
        employerSection.style.display = 'block';
        document.getElementById('emp-company-name').value = currentUser.company || '';
        document.getElementById('emp-logo-letter').value = currentUser.logoLetter || (currentUser.company ? currentUser.company.charAt(0) : '');
        document.getElementById('emp-industry').value = currentUser.industry || '';
        document.getElementById('emp-size').value = currentUser.companySize || '';
        document.getElementById('emp-website').value = currentUser.website || '';
        document.getElementById('emp-founded').value = currentUser.founded || '';
        document.getElementById('emp-headquarters').value = currentUser.headquarters || '';
        document.getElementById('emp-description').value = currentUser.description || '';
        document.getElementById('emp-hr-name').value = currentUser.hrName || '';
        document.getElementById('emp-hr-email').value = currentUser.hrEmail || currentUser.email || '';
        document.getElementById('emp-hr-phone').value = currentUser.hrPhone || currentUser.phone || '';
        document.getElementById('emp-notif-email').checked = !!currentUser.notifEmail;
        document.getElementById('emp-notif-sms').checked = !!currentUser.notifSMS;
        const companyName = normalizeText(currentUser.company || currentUser.name);
        const empJobs = allJobs.filter(j => normalizeText(j.company) === companyName);
        document.getElementById('emp-posted-jobs').innerHTML = empJobs.length ? empJobs.map(job => `<div style="padding:12px; border-bottom:1px solid #e2e8f0;"><strong>${job.title}</strong><br><span style="color:var(--grey);">${job.loc} • ${job.type}</span></div>`).join('') : '<p style="color:var(--grey);">No jobs posted yet.</p>';
        const appList = applications.filter(app => normalizeText(app.employerCompany) === companyName);
        document.getElementById('emp-manage-applications').innerHTML = appList.length ? appList.map(app => `
            <div class="app-status-card" style="align-items:flex-start; gap:12px;">
                <div style="flex:1; min-width:180px;">
                    <p style="margin:0; font-size:0.95rem; color:#0f172a;"><strong>${app.candidateName || app.candidateEmail}</strong></p>
                    <p style="margin:8px 0 0 0; color:#64748b; font-size:0.88rem;">${app.jobTitle} at ${app.company}</p>
                </div>
                <div style="display:grid; gap:6px; text-align:right; flex:0 0 auto; min-width:150px;">
                    <span style="color:#475569; font-size:0.85rem;">${app.dateApplied}</span>
                    <span class="${getStatusBadgeClass(app.status)}">${app.status}</span>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="showEmployerApplicationDetail('${app.id || app.candidateEmail}')">View Details</button>
                    <button class="btn-secondary" type="button" onclick="previewApplicationResume('${app.id}')">View Resume</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Accepted')">Accept</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Rejected')">Reject</button>
                </div>
            </div>
        `).join('') : '<p style="color:var(--grey);">No applications yet.</p>';
        document.getElementById('emp-analytic-jobs').value = empJobs.length;
        document.getElementById('emp-analytic-apps').value = appList.length;
        document.getElementById('emp-analytic-views').value = empJobs.length * 5;
    }
}

function showEmployerApplicationDetail(appId) {
    // Support passing either an application id, candidate email, or a fallback key
    let app = applications.find(a => a.id === appId);
    if(!app) {
        app = applications.find(a => a.candidateEmail === appId || String(a.appliedAt) === String(appId));
    }
    if(!app) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const candidate = users.find(u => u.email === app.candidateEmail && u.role === 'candidate');
    const detailEl = document.getElementById('emp-application-detail-modal');
    const modal = document.getElementById('emp-details-modal');
    detailEl.innerHTML = `
        <div class="app-detail-card" style="padding: 30px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
                <div style="min-width:200px;">
                    <h3>Candidate Application</h3>
                    <p style="margin:8px 0 0 0; color:#475569; font-size:0.95rem;">Name: <strong>${app.candidateName || app.candidateEmail}</strong></p>
                    <p style="margin:4px 0 0 0; color:#64748b; font-size:0.9rem;">Email: ${app.candidateEmail}</p>
                    <p style="margin:4px 0 0 0; color:#64748b; font-size:0.9rem;">Applied on: ${app.dateApplied}</p>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="previewApplicationResume('${app.id}')">View Resume</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Accepted')">Accept</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Rejected')">Reject</button>
                    <button class="btn-secondary" type="button" onclick="closeEmployerApplicationModal()">Close</button>
                </div>
            </div>

            <h4 style="margin: 0 0 12px 0;">Application Summary</h4>
            <div class="app-detail-grid">
                <div><strong>Job Applied</strong><br>${app.jobTitle} at ${app.company}</div>
                <div><strong>Status</strong><br>${app.status}</div>
                <div><strong>Preferred Location</strong><br>${app.preferredLocation || 'N/A'}</div>
                <div><strong>Employment Type</strong><br>${app.employmentType || 'N/A'}</div>
                <div><strong>Notice Period</strong><br>${app.noticePeriod || 'N/A'}</div>
                <div><strong>Expected Salary</strong><br>${app.expectedSalary || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Personal Information</h4>
            <div class="app-detail-grid">
                <div><strong>Phone</strong><br>${app.candidatePhone || 'N/A'}</div>
                <div><strong>DOB</strong><br>${app.candidateDOB || 'N/A'}</div>
                <div><strong>Gender</strong><br>${app.candidateGender || 'N/A'}</div>
                <div><strong>Address</strong><br>${app.candidateAddress || 'N/A'}</div>
                <div><strong>City</strong><br>${app.candidateCity || 'N/A'}</div>
                <div><strong>State</strong><br>${app.candidateState || 'N/A'}</div>
                <div><strong>Country</strong><br>${app.candidateCountry || 'N/A'}</div>
                <div><strong>Pincode</strong><br>${app.candidatePincode || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Professional Experience</h4>
            <div class="app-detail-grid">
                <div><strong>Current Job Title</strong><br>${app.currentJobTitle || 'N/A'}</div>
                <div><strong>Current Company</strong><br>${app.currentCompany || 'N/A'}</div>
                <div><strong>Experience</strong><br>${app.totalExperience ? app.totalExperience + ' years' : 'N/A'}</div>
                <div><strong>Current Salary</strong><br>${app.currentSalary || 'N/A'}</div>
                <div><strong>Previous Role</strong><br>${app.workExpTitle || 'N/A'}</div>
                <div><strong>Previous Company</strong><br>${app.workExpCompany || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Work Experience Start</strong><br>${app.workExpStart || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Work Experience End</strong><br>${app.workExpEnd || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Responsibilities</strong><br>${app.workExpResponsibilities || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Achievements</strong><br>${app.workExpAchievements || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Education & Skills</h4>
            <div class="app-detail-grid">
                <div><strong>Qualification</strong><br>${app.highestQualification || 'N/A'}</div>
                <div><strong>Degree</strong><br>${app.degreeName || 'N/A'}</div>
                <div><strong>Specialization</strong><br>${app.specialization || 'N/A'}</div>
                <div><strong>University</strong><br>${app.university || 'N/A'}</div>
                <div><strong>Status</strong><br>${app.educationStatus || 'N/A'}</div>
                <div><strong>Score</strong><br>${app.score || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Languages</strong><br>${app.languagesKnown || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Technical Skills</strong><br>${app.technicalSkills || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Soft Skills</strong><br>${app.softSkills || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Certifications</strong><br>${app.certifications || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Documents & Links</h4>
            <div class="app-detail-grid">
                <div><strong>Resume</strong><br>${candidate && candidate.resumeFileName ? candidate.resumeFileName : (app.resumeFileName || 'Not uploaded')}</div>
                <div><strong>Cover Letter</strong><br>${app.coverLetter ? app.coverLetter : 'Not provided'}</div>
                <div style="grid-column: span 2; display:flex; gap:12px; flex-wrap:wrap;">
                    ${(app.resumeData || (candidate && candidate.resumeData)) ? `<button class="btn-secondary" type="button" onclick="previewApplicationResume('${app.id}')">View Resume</button>` : ''}
                    ${app.portfolioURL ? `<a class="btn-secondary" href="${app.portfolioURL}" target="_blank" style="text-decoration:none;">Portfolio</a>` : ''}
                    ${app.linkedinURL ? `<a class="btn-secondary" href="${app.linkedinURL}" target="_blank" style="text-decoration:none;">LinkedIn</a>` : ''}
                    ${app.githubURL ? `<a class="btn-secondary" href="${app.githubURL}" target="_blank" style="text-decoration:none;">GitHub</a>` : ''}
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEmployerApplicationModal() {
    const modal = document.getElementById('emp-details-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function updateApplicationStatus(appId, status) {
    const idx = applications.findIndex(a => a.id === appId || a.candidateEmail === appId || String(a.appliedAt) === String(appId));
    if(idx < 0) return;
    applications[idx].status = status;
    localStorage.setItem('applications', JSON.stringify(applications));
    renderProfilePage();
    renderDashboard();
    renderMyApplicationsView();
    if(document.getElementById('emp-details-modal')?.style.display === 'flex') {
        closeEmployerApplicationModal();
    }
    triggerPopup(`Application ${status.toLowerCase()} successfully.`, 'success');
}

// --- EMPLOYER FUNCTIONS ---
function toggleJobModal(show, jobId = null) {
    const modal = document.getElementById('job-post-modal');
    const submitBtn = document.getElementById('job-modal-submit-btn');
    editingJobId = jobId || null;

    if(show && editingJobId) {
        const jobToEdit = jobs.find(job => job.id === editingJobId);
        if(jobToEdit) {
            document.getElementById('job-title').value = jobToEdit.title;
            document.getElementById('job-location').value = jobToEdit.loc;
            document.getElementById('job-type-select').value = jobToEdit.type;
            document.getElementById('job-salary').value = jobToEdit.salary;
            document.getElementById('job-category').value = jobToEdit.cat;
            document.getElementById('job-mode').value = jobToEdit.mode;
            document.getElementById('job-address').value = jobToEdit.address;
            document.getElementById('job-desc').value = jobToEdit.desc;
            submitBtn.innerText = 'Update Job';
        }
    }
    if(!show) {
        editingJobId = null;
        submitBtn.innerText = 'Post Job';
        document.getElementById('job-title').value = '';
        document.getElementById('job-location').value = '';
        document.getElementById('job-type-select').value = 'Full-Time';
        document.getElementById('job-salary').value = '';
        document.getElementById('job-category').value = 'Tech';
        document.getElementById('job-mode').value = 'Online';
        document.getElementById('job-address').value = '';
        document.getElementById('job-desc').value = '';
    }
    modal.style.display = show ? 'flex' : 'none';
}

function createJob() {
    const title = document.getElementById('job-title').value.trim();
    const location = document.getElementById('job-location').value.trim();
    const type = document.getElementById('job-type-select').value;
    const salary = document.getElementById('job-salary').value.trim();
    const category = document.getElementById('job-category').value;
    const mode = document.getElementById('job-mode').value;
    const address = document.getElementById('job-address').value.trim();
    const desc = document.getElementById('job-desc').value.trim();

    if(!title || !location || !desc) {
        triggerPopup("Please fill the required job details.", "error");
        return;
    }

    if(editingJobId) {
        jobs = jobs.map(job => {
            if(job.id === editingJobId) {
                return {
                    ...job,
                    title,
                    loc: location,
                    type,
                    salary,
                    cat: category,
                    mode,
                    address,
                    desc,
                    date: new Date().toLocaleDateString()
                };
            }
            return job;
        });
        localStorage.setItem('jobs', JSON.stringify(jobs));
        toggleJobModal(false);
        triggerPopup("Job updated successfully!", "success", () => {
            renderDashboard();
        });
        return;
    }

    const employerName = currentUser.company || currentUser.name || 'Employer';
    const newJob = {
        id: 'JOB-' + Date.now(),
        title,
        company: employerName,
        type,
        cat: category,
        salary,
        loc: location,
        date: new Date().toLocaleDateString(),
        logo: employerName ? employerName.charAt(0).toUpperCase() : 'E',
        desc,
        req: ["Requirement added by Employer"],
        vacancies: 1,
        lang: "Contact Employer",
        exp: "Not Specified",
        mode,
        address
    };

    jobs.unshift(newJob);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    toggleJobModal(false);
    triggerPopup("Job Posted Successfully!", "success", () => {
        renderDashboard();
    });
}

function editJob(jobId) {
    toggleJobModal(true, jobId);
}

function deleteJob(jobId) {
    const confirmDelete = confirm('Delete this job posting?');
    if(!confirmDelete) return;
    jobs = jobs.filter(job => job.id !== jobId);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    triggerPopup('Job deleted successfully.', 'success', () => {
        renderDashboard();
    });
}

function renderDashboard() {
    const container = document.getElementById('dash-content');
    document.getElementById('employer-actions').style.display = 'block';
    
    const companyName = normalizeText(currentUser.company || currentUser.name);
    const allJobs = [...jobs, ...staticJobsDatabase];
    const rawJobs = allJobs.filter(j => normalizeText(j.company) === companyName);
    const myJobs = Array.from(rawJobs.reduce((map, job) => {
        const key = job.id ? job.id : `${normalizeText(job.title)}|${normalizeText(job.loc)}`;
        if(!map.has(key)) map.set(key, job);
        return map;
    }, new Map()).values());
    const myApplications = applications.filter(app => normalizeText(app.employerCompany) === companyName);
    
    let activeVacancies = myJobs.reduce((sum, j) => sum + (j.vacancies || 0), 0);
    const totalApplicants = myApplications.length;
    if(activeVacancies === 0 && myJobs.length > 0) {
        activeVacancies = myJobs.length;
    }
    const profileViewsRaw = activeVacancies > 0 ? activeVacancies * 50000 : (totalApplicants > 0 ? totalApplicants * 20000 : 0);
    const profileViews = profileViewsRaw > 0 ? `${(profileViewsRaw / 100000).toFixed(2).replace(/\.0+$/, '')} Lakh` : '0';
    
    document.getElementById('active-vacancies-count').innerText = activeVacancies;
    document.getElementById('total-applicants-count').innerText = totalApplicants;
    document.getElementById('profile-views-count').innerText = profileViews;
    
    const recentApplications = myApplications
        .slice()
        .sort((a, b) => b.appliedAt - a.appliedAt)
        .slice(0, 5);

    const recentApplicationsHTML = recentApplications.length ? recentApplications.map(app => `
        <div style="background:white; border-radius:10px; padding:16px; margin-bottom:12px; box-shadow:0 2px 7px rgba(15,23,42,.06);">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <h4 style="margin:0 0 8px 0; color: var(--dark);">${app.candidateName || app.candidateEmail}</h4>
                    <p style="margin:0; color: var(--grey); font-size:0.9rem;"><strong>Role:</strong> ${app.jobTitle}</p>
                    <p style="margin:6px 0 0 0; color: var(--grey); font-size:0.85rem;"><strong>Applied on:</strong> ${app.dateApplied}</p>
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="showEmployerApplicationDetail('${app.id || app.candidateEmail}')">View Profile</button>
                    <button class="btn-secondary" type="button" onclick="previewApplicationResume('${app.id}')">View Resume</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Accepted')">Accept</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id}','Rejected')">Reject</button>
                    <span class="${getStatusBadgeClass(app.status)}" style="padding: 10px 16px; border-radius: 999px; font-weight: 700;">${app.status}</span>
                </div>
            </div>
        </div>
    `).join('') : '<p style="color: var(--grey); text-align:center;">No recent applications yet.</p>';

    document.getElementById('dashboard-recent-applications').innerHTML = recentApplicationsHTML;
    
    let postingsHTML = '';
    if(myJobs.length === 0) {
        postingsHTML = '<p style="color: var(--grey); text-align: center;">No active job postings yet.</p>';
    } else {
        postingsHTML = '<div style="display: grid; gap: 20px;">';
        myJobs.forEach(j => {
            const jobApplicants = myApplications.filter(app => app.jobTitle === j.title);
            postingsHTML += `
                <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="display:flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                        <div style="flex:1; min-width:220px;">
                            <h4 style="margin:0 0 8px 0; font-size:1.15rem; font-weight:700; color:#111827;">${j.title}</h4>
                            <p style="margin:0; color:#475569; font-size:0.9rem;"><strong>Location:</strong> ${j.loc}</p>
                            <p style="margin:4px 0 0 0; color:#475569; font-size:0.9rem;"><strong>Type:</strong> ${j.type} • <strong>Posted:</strong> ${j.date}</p>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                            ${j.id ? `<button class="btn-secondary" type="button" onclick="editJob('${j.id}')">Edit</button>` : ''}
                            ${j.id ? `<button class="btn-secondary" type="button" onclick="deleteJob('${j.id}')">Delete</button>` : ''}
                            <button class="btn-secondary" type="button" onclick="showApplicantsForJob('${j.title.replace(/'/g, "\\'")}')">View Applicants</button>
                            <div style="background:#f8fafc; color:#0f172a; padding:10px 14px; border-radius:999px; font-size:0.9rem;">${jobApplicants.length} Apps</div>
                        </div>
                    </div>
                    <p style="margin:16px 0 0 0; color:#64748b; font-size:0.95rem;">${j.desc}</p>
                </div>
            `;
        });
        postingsHTML += '</div>';
    }
    container.innerHTML = postingsHTML;
    document.getElementById('active-postings-list').style.display = 'none';
}

function submitContactForm() {
    const name = document.getElementById('contact-name').value;
    if(!name) return;
    document.getElementById('contact-form-container').style.display = 'none';
    document.getElementById('contact-success').style.display = 'block';
}

function resetContactForm() {
    document.getElementById('contact-form-container').style.display = 'block';
    document.getElementById('contact-success').style.display = 'none';
}

updateNav();