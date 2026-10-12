import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import userService from '../services/user.service';
import { Alert } from '../components/Alert';
import {
  User,
  GraduationCap,
  Lock,
  Save,
  CheckCircle2,
  Briefcase,
  BookOpen,
  Award,
  Lightbulb,
  Compass,
  Users,
  Mail,
  MapPin,
  ExternalLink,
  BadgeCheck,
  Edit3,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// FACULTY MOCK DATA (Directory Records for SRM University-AP)
// ============================================================================

const DEFAULT_FACULTY_AVATAR =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80';

const MOCK_FACULTY_EDUCATION = [
  {
    year: '2025',
    degree: 'PhD',
    institution: 'SRM University, Andhra Pradesh',
    details: 'Specialization: Deep Learning for Computer Vision and Scalable Representation Learning',
  },
  {
    year: '2011',
    degree: 'M.Tech',
    institution: 'Acharya Nagarjuna University, Andhra Pradesh',
    details: 'Advanced Computer Networks & High-Performance Distributed Systems',
  },
  {
    year: '2007',
    degree: 'B.Tech',
    institution: 'Acharya Nagarjuna University, Andhra Pradesh',
    details: 'Computer Science and Engineering with First Class Distinction',
  },
];

const MOCK_FACULTY_EXPERIENCE = [
  {
    year: '2021',
    period: '2021 – Present',
    role: 'Assistant Professor',
    institution: 'Department of Computer Science and Engineering, SRM University-AP',
    details: 'Supervising undergraduate capstone projects, faculty mentor for ACM Student Chapter, and leading edge-AI research initiatives.',
  },
  {
    year: '2016',
    period: '2016 – 2021',
    role: 'Senior Assistant Professor',
    institution: "Vignan's Foundation for Science, Technology & Research",
    details: 'Course coordinator for Machine Learning, Data Analytics, and undergraduate project audits.',
  },
  {
    year: '2011',
    period: '2011 – 2016',
    role: 'Assistant Professor',
    institution: 'K L University, Vijayawada',
    details: 'Instruction in Operating Systems, Object-Oriented Analysis & Design, and Parallel Computing.',
  },
];

const MOCK_FACULTY_RESEARCH_INTERESTS = [
  {
    title: 'Computer Vision & Deep Learning',
    description: 'Object detection, semantic segmentation, and multimodal sensor fusion for autonomous systems.',
    category: 'Core AI',
  },
  {
    title: 'Medical Image Processing & Diagnostics',
    description: 'Automated radiography screening and transfer learning architectures for low-resource healthcare telemetry.',
    category: 'Healthcare AI',
  },
  {
    title: 'Edge Computing & Distributed Inference',
    description: 'Quantized neural networks, federated learning protocols, and low-latency micro-device deployments.',
    category: 'Systems',
  },
  {
    title: 'Natural Language Processing',
    description: 'Transformer fine-tuning, domain-specific semantic retrieval, and low-resource multilingual representations.',
    category: 'NLP',
  },
  {
    title: 'Precision Agriculture',
    description: 'Aerial drone imagery analysis and spectral index synthesis for early plant pathology diagnosis.',
    category: 'Applied AI',
  },
];

const MOCK_FACULTY_PUBLICATIONS = [
  {
    title: 'Deep Convolutional Networks for Early Crop Disease Detection using Multimodal Aerial Imagery',
    journal: 'IEEE Transactions on Cybernetics',
    year: '2024',
    volume: 'Vol. 54, No. 3, pp. 1142–1155',
    doi: '10.1109/TCYB.2024.3189421',
    type: 'Journal Article (Q1 / SCI)',
  },
  {
    title: 'Edge-Optimized Transformer Models for Real-Time Semantic Segmentation in Robotic Telemetry',
    journal: 'Elsevier Journal of Systems Architecture',
    year: '2023',
    volume: 'Vol. 138, Article 102871',
    doi: '10.1016/j.sysarc.2023.102871',
    type: 'Journal Article (Q1 / Scopus)',
  },
  {
    title: 'Privacy-Preserving Federated Learning Framework for University Academic Management Portals',
    journal: 'Springer Neural Computing and Applications',
    year: '2022',
    volume: 'Vol. 34, No. 8, pp. 6512–6525',
    doi: '10.1007/s00521-022-07234-9',
    type: 'Journal Article (SCI)',
  },
  {
    title: 'An Empirical Evaluation of Transfer Learning in Diagnostic Radiography Under Domain Shift',
    journal: 'IEEE Access',
    year: '2021',
    volume: 'Vol. 9, pp. 87410–87422',
    doi: '10.1109/ACCESS.2021.3089123',
    type: 'Open Access Journal',
  },
  {
    title: 'Lightweight Attention Mechanisms for Low-Power Microcontrollers in Edge Sensing',
    journal: 'Proceedings of the IEEE International Conference on VLSI and Embedded Systems (ICVES)',
    year: '2020',
    volume: 'IEEE Xplore, pp. 45–51',
    doi: '10.1109/ICVES.2020.9234123',
    type: 'Conference Proceeding',
  },
];

const MOCK_FACULTY_PATENTS = [
  {
    title: 'Automated Real-Time Visual Anomaly Detection System Using Quantized Neural Networks on Embedded Sensor Arrays',
    applicationNo: 'Indian Patent Application No. 202341065432',
    filingDate: 'October 2023',
    status: 'Published',
    country: 'India',
  },
  {
    title: 'IoT-Enabled Intelligent Drone Payload Mechanism for Precision Fertilizer Spraying and Crop Health Mapping',
    applicationNo: 'Indian Patent Application No. 202241032190',
    filingDate: 'June 2022',
    status: 'Granted (Patent No. 412891)',
    country: 'India',
  },
];

const MOCK_FACULTY_AWARDS = [
  {
    year: '2023',
    title: 'Outstanding Faculty Researcher Award',
    organization: 'SRM University-AP, Andhra Pradesh',
    description: 'Recognized for top-tier Q1 journal contributions in machine learning and computer vision.',
  },
  {
    year: '2021',
    title: 'Best Technical Paper Award',
    organization: 'IEEE International Conference on Smart Computing & Informatics',
    description: 'Conferred for seminal work on distributed edge inference with minimal power constraints.',
  },
  {
    year: '2019',
    title: 'Young Faculty Excellence Award',
    organization: 'Indian Society for Technical Education (ISTE AP Chapter)',
    description: 'Awarded for pedagogic innovation and exemplary undergraduate project supervision.',
  },
];

const MOCK_FACULTY_MEMBERSHIPS = [
  {
    organization: 'IEEE (Institute of Electrical and Electronics Engineers)',
    grade: 'Senior Member',
    id: 'IEEE-9284102',
    since: '2016',
  },
  {
    organization: 'CSI (Computer Society of India)',
    grade: 'Life Member',
    id: 'CSI-LM004291',
    since: '2012',
  },
  {
    organization: 'ACM (Association for Computing Machinery)',
    grade: 'Professional Member',
    id: 'ACM-7819203',
    since: '2018',
  },
  {
    organization: 'IETE (Institution of Electronics and Telecommunication Engineers)',
    grade: 'Fellow Member (FIETE)',
    id: 'IETE-F50192',
    since: '2020',
  },
];

const MOCK_FACULTY_INTERESTS = [
  {
    title: 'Undergraduate Capstone Mentorship',
    details: 'Guiding multidisciplinary teams in building scalable, real-world engineering prototypes with industry relevance.',
  },
  {
    title: 'Open Source AI & Curriculum Modernization',
    details: 'Developing hands-on PyTorch and ROS2 lab curricula for student-led hardware and software exploration.',
  },
  {
    title: 'Peer Reviewing & Editorial Service',
    details: 'Active reviewer for IEEE Transactions on Cybernetics, Springer NCA, and Elsevier Computers & Electrical Engineering.',
  },
  {
    title: 'Autonomous Robotics Club Advisor',
    details: 'Serving as the faculty mentor for student robotics competitions including Smart India Hackathon and Robocon.',
  },
];

type FacultyTabKey =
  | 'education'
  | 'experience'
  | 'research'
  | 'awards'
  | 'memberships'
  | 'publications'
  | 'patents'
  | 'interests';

const FACULTY_NAV_TABS: { id: FacultyTabKey; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'research', label: 'Research Interests', icon: Compass },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'memberships', label: 'Memberships', icon: Users },
  { id: 'publications', label: 'Publications', icon: BookOpen },
  { id: 'patents', label: 'Patents', icon: Lightbulb },
  { id: 'interests', label: 'Interests', icon: Sparkles },
];

// ============================================================================
// FACULTY PROFILE VIEW COMPONENT
// ============================================================================

interface FacultyProfileViewProps {
  user: any;
  onProfileUpdate?: (updatedUser: any) => void;
}

const FacultyProfileView: React.FC<FacultyProfileViewProps> = ({ user, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState<FacultyTabKey>('education');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || 'Dr Praneetha Surapaneni',
    department: user?.department || 'Department of Computer Science and Engineering',
    phone: user?.phone || '+91 863 234 3000',
    officeLocation: 'Homi J Bhabha Block, Level 4, Cubicle No: 1',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setFeedback(null);
    try {
      const response = await userService.updateProfile({
        name: editFormData.name,
        department: editFormData.department,
        phone: editFormData.phone,
      });
      if (response.success && response.user) {
        if (onProfileUpdate) onProfileUpdate(response.user);
        setFeedback({
          type: 'success',
          message: 'Faculty directory profile updated successfully.',
        });
        setIsEditing(false);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update faculty profile.',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* ================================================================== */}
      {/* 2. FACULTY HEADER CARD (TOP BANNER)                              */}
      {/* ================================================================== */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 relative overflow-hidden transition-all">
        {/* Subtle Watermarked University Seal on Right */}
        <img
          src="/logo.png"
          alt="SRM University-AP"
          className="absolute -right-6 -bottom-6 w-56 h-56 object-contain opacity-5 pointer-events-none select-none hidden sm:block"
        />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 relative z-10">
          {/* Faculty Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'Faculty Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={DEFAULT_FACULTY_AVATAR}
                  alt={user?.name || 'Faculty Profile'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full shadow-2xs" title="Active Academic Status" />
          </div>

          {/* Main & Meta Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {user?.name || 'Dr Praneetha Surapaneni'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700">
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                  Verified Faculty
                </span>
              </div>
              <p className="text-amber-700 font-semibold text-sm sm:text-base mt-1 flex items-center gap-1.5">
                Assistant Professor
              </p>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
                {user?.department || 'Department of Computer Science and Engineering'}
              </p>
            </div>

            {/* Meta Details: Contact, Office, Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              {/* Contact Details */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Contact Details
                </span>
                <a
                  href={`mailto:${user?.email || 'praneetha.s@srmap.edu.in'}`}
                  className="text-xs sm:text-sm text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user?.email || 'praneetha.s@srmap.edu.in'}</span>
                </a>
              </div>

              {/* Office Location */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Office Location
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{editFormData.officeLocation}</span>
                </p>
              </div>

              {/* Social / Academic Links */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Social Links
                </span>
                <div className="flex items-center gap-1.5">
                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    title="LinkedIn Profile"
                    className="w-7 h-7 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 flex items-center justify-center text-xs font-bold font-serif transition-colors duration-200 shadow-2xs"
                  >
                    in
                  </a>

                  {/* Google Scholar */}
                  <a
                    href="https://scholar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    title="Google Scholar"
                    className="w-7 h-7 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 flex items-center justify-center text-xs transition-colors duration-200 shadow-2xs"
                  >
                    <GraduationCap className="w-4 h-4" />
                  </a>

                  {/* Scopus */}
                  <a
                    href="https://www.scopus.com"
                    target="_blank"
                    rel="noreferrer"
                    title="Scopus Author ID"
                    className="w-7 h-7 rounded-md bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 flex items-center justify-center text-[10px] font-bold font-mono transition-colors duration-200 shadow-2xs"
                  >
                    SC
                  </a>

                  {/* ORCID */}
                  <a
                    href="https://orcid.org"
                    target="_blank"
                    rel="noreferrer"
                    title="ORCID Profile"
                    className="w-7 h-7 rounded-md bg-slate-100 hover:bg-lime-50 text-slate-700 hover:text-lime-700 border border-slate-200 flex items-center justify-center text-[11px] font-bold transition-colors duration-200 shadow-2xs"
                  >
                    iD
                  </a>

                  {/* Quick Edit Profile Button */}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors duration-200 px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100"
                    title="Edit Personal Information"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Collapsible Faculty Edit Drawer */}
        {isEditing && (
          <form
            onSubmit={handleEditSubmit}
            className="mt-6 pt-6 border-t border-slate-200 bg-slate-50/70 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-xl space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Update Faculty Contact Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location</label>
                <input
                  type="text"
                  value={editFormData.officeLocation}
                  onChange={(e) => setEditFormData({ ...editFormData, officeLocation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={saveLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors duration-200 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saveLoading ? 'Updating...' : 'Save Directory Details'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================================================================== */}
      {/* 3. TWO-COLUMN BODY LAYOUT                                         */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar (Navigation) */}
        <aside className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm sticky top-24">
            <div className="pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Faculty Information</h2>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">8 SECTIONS</span>
            </div>

            <nav className="space-y-1">
              {FACULTY_NAV_TABS.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-colors duration-200 text-left ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs border border-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Academic Profile Summary Card */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Publications</span>
                <span className="font-bold text-slate-800">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Citations (h-index)</span>
                <span className="font-bold text-slate-800">420+ (9)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Patents Published</span>
                <span className="font-bold text-slate-800">2</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area (Split: Dynamic Tab Content + Recent Updates) */}
        <section className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Active Tab Main Content Area */}
            <div className="xl:col-span-2 space-y-4">
              {/* Tab Title Header */}
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
                  {activeTab === 'education' && <GraduationCap className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'experience' && <Briefcase className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'research' && <Compass className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'awards' && <Award className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'memberships' && <Users className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'publications' && <BookOpen className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'patents' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'interests' && <Sparkles className="w-5 h-5 text-blue-600" />}
                  <span>{FACULTY_NAV_TABS.find((t) => t.id === activeTab)?.label}</span>
                </h2>
              </div>

              {/* ---------------------------------------------------------------- */}
              {/* TAB 1: EDUCATION (Timeline Cards with Amber Badges)              */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'education' && (
                <div className="space-y-3.5">
                  {MOCK_FACULTY_EDUCATION.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors duration-200 flex items-start gap-4"
                    >
                      {/* Amber Year Badge */}
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-md text-xs sm:text-sm shrink-0 font-mono tracking-wide shadow-2xs">
                        {item.year}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {item.degree}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                          {item.institution}
                        </p>
                        {item.details && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 2: EXPERIENCE (Timeline Cards with Amber Badges)             */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'experience' && (
                <div className="space-y-3.5">
                  {MOCK_FACULTY_EXPERIENCE.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors duration-200 flex items-start gap-4"
                    >
                      {/* Amber Year Badge */}
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-md text-xs sm:text-sm shrink-0 font-mono tracking-wide shadow-2xs">
                        {item.year}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            {item.role}
                          </h3>
                          <span className="text-xs text-slate-400 font-mono">{item.period}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                          {item.institution}
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {item.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 3: RESEARCH INTERESTS (High-Density List Items)              */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'research' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm divide-y divide-slate-100">
                  {MOCK_FACULTY_RESEARCH_INTERESTS.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-5 px-5 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 ml-6 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 4: AWARDS & HONORS                                           */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'awards' && (
                <div className="space-y-3.5">
                  {MOCK_FACULTY_AWARDS.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors duration-200 flex items-start gap-4"
                    >
                      <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-md text-xs sm:text-sm shrink-0 font-mono tracking-wide shadow-2xs">
                        {item.year}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-amber-600 shrink-0" />
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                          {item.organization}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 5: MEMBERSHIPS                                               */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'memberships' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm divide-y divide-slate-100">
                  {MOCK_FACULTY_MEMBERSHIPS.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-5 px-5 transition-colors duration-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600 shrink-0" />
                          {item.organization}
                        </h3>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.grade}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 ml-6">
                        <span>Member ID: <strong className="font-mono text-slate-700">{item.id}</strong></span>
                        <span>&bull;</span>
                        <span>Active Since: <strong className="text-slate-700">{item.since}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 6: PUBLICATIONS (High-Density List Items)                    */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'publications' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm divide-y divide-slate-100">
                  {MOCK_FACULTY_PUBLICATIONS.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-5 px-5 transition-colors duration-200 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <span className="shrink-0 text-[10px] font-medium font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.year}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        {item.journal} &bull; <span className="not-italic text-slate-500">{item.volume}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-400">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                          {item.type}
                        </span>
                        <a
                          href={`https://doi.org/${item.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-600 flex items-center gap-1 transition-colors duration-200"
                        >
                          DOI: {item.doi} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 7: PATENTS                                                   */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'patents' && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm divide-y divide-slate-100">
                  {MOCK_FACULTY_PATENTS.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-4 first:pt-0 last:pb-0 hover:bg-slate-50/50 -mx-5 px-5 transition-colors duration-200 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 leading-snug">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                          {item.title}
                        </h3>
                        <span className="shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 ml-6">
                        <span className="font-mono text-slate-700">{item.applicationNo}</span>
                        <span>&bull;</span>
                        <span>Filing: {item.filingDate}</span>
                        <span>&bull;</span>
                        <span>Jurisdiction: {item.country}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------------------------------------------------------------- */}
              {/* TAB 8: INTERESTS                                                 */}
              {/* ---------------------------------------------------------------- */}
              {activeTab === 'interests' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MOCK_FACULTY_INTERESTS.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-colors duration-200 space-y-1.5"
                    >
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <BookmarkCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: "Recent Updates" Card (From Image 2 Reference) */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
                  <span>Recent Updates</span>
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                </h3>
                <p className="text-xs text-slate-400 py-3">
                  No recent updates found.
                </p>
              </div>

              {/* Academic Portal Quick Links Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">
                  Faculty Quick Actions
                </h3>
                <div className="space-y-2 text-xs">
                  <a
                    href="/dashboard"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-100 transition-colors duration-200"
                  >
                    <span className="font-medium">Supervised Projects</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                  <a
                    href="/catalog"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-100 transition-colors duration-200"
                  >
                    <span className="font-medium">Project Catalog</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ============================================================================
// COORDINATOR (STAFF) PROFILE VIEW — University Directory Card
// ============================================================================

interface StaffProfileViewProps {
  user: any;
  onProfileUpdate?: (updatedUser: any) => void;
}

const CoordinatorProfileView: React.FC<StaffProfileViewProps> = ({ user, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || 'Meera Nambiar',
    department: user?.department || 'Department of Computer Science and Engineering',
    phone: user?.phone || '+91 863 234 3000',
    employeeId: 'SRM-AP-FAC-00472',
    officeLocation: 'Admin Block, Level 2, Room 204',
    designation: 'Academic Coordinator (Undergraduate Programs)',
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setFeedback(null);
    try {
      const response = await userService.updateProfile({
        name: editFormData.name,
        department: editFormData.department,
        phone: editFormData.phone,
      });
      if (response.success && response.user) {
        if (onProfileUpdate) onProfileUpdate(response.user);
        setFeedback({ type: 'success', message: 'Staff directory profile updated successfully.' });
        setIsEditing(false);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update staff profile.',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const ADMIN_RESPONSIBILITIES = [
    'Capstone Project Allocation & Faculty Mentor Assignment',
    'Department-level Milestone Deadline Governance',
    'Student Eligibility Audits & Prerequisite Override Approvals',
    'End-semester Evaluation Panel Scheduling & External Examiner Registry',
    'Academic Integrity Reporting & Plagiarism Gate Administration',
  ];

  const RESEARCH_DOMAINS = [
    { name: 'Software Engineering & DevOps' },
    { name: 'Academic Analytics & Learning Systems' },
    { name: 'Curriculum Design & Accreditation' },
    { name: 'Data-Driven Institutional Governance' },
  ];

  return (
    <div className="space-y-6">
      {feedback && (
        <Alert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
      )}

      {/* Staff Directory Header Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <img
          src="/logo.png"
          alt="SRM University-AP"
          className="absolute -right-6 -bottom-6 w-56 h-56 object-contain opacity-5 pointer-events-none select-none hidden sm:block"
        />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-4xl">
                  {user?.name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full shadow-2xs" title="Active Academic Status" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {user?.name || 'Meera Nambiar'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800">
                  <BadgeCheck className="w-3.5 h-3.5 text-amber-700" />
                  Academic Coordinator
                </span>
              </div>
              <p className="text-purple-700 font-semibold text-sm sm:text-base mt-1">
                {editFormData.designation}
              </p>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
                {user?.department || editFormData.department}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Employee ID
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-mono font-bold">{editFormData.employeeId}</p>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Official Email
                </span>
                <a
                  href={`mailto:${user?.email}`}
                  className="text-xs sm:text-sm text-slate-700 hover:text-blue-600 font-medium transition-colors flex items-center gap-1.5 truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user?.email || 'coordinator.cse@srmap.edu.in'}</span>
                </a>
              </div>

              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Office Location
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{editFormData.officeLocation}</span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditing ? 'Cancel Editing' : 'Edit Contact Info'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Edit Drawer */}
        {isEditing && (
          <form
            onSubmit={handleEditSubmit}
            className="mt-6 pt-6 border-t border-slate-200 bg-slate-50/70 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-xl space-y-4"
          >
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" /> Update Staff Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location</label>
                <input
                  type="text"
                  value={editFormData.officeLocation}
                  onChange={(e) => setEditFormData({ ...editFormData, officeLocation: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saveLoading ? 'Updating...' : 'Save Directory Details'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Administrative Responsibilities */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="pb-3 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Administrative Responsibilities</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official departmental duties assigned by the Dean's office for AY 2026-27.
            </p>
          </div>

          <div className="space-y-3">
            {ADMIN_RESPONSIBILITIES.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Domains */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="pb-3 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Research Domains & Specializations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Academic tracks for curriculum development, project allocation, and review panel eligibility.
            </p>
          </div>

          <div className="space-y-3">
            {RESEARCH_DOMAINS.map((domain, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {domain.name}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Profile Summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Supervised Projects (AY 2026-27)</span>
              <span className="font-bold text-slate-800">142</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Faculty Under Coordination</span>
              <span className="font-bold text-slate-800">50</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Active Student Batches</span>
              <span className="font-bold text-slate-800">4 (CSE + ECE)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN PROFILE VIEW — Stripped-Down Security Dashboard Card
// ============================================================================

interface AdminProfileViewProps {
  user: any;
}

const AdminProfileView: React.FC<AdminProfileViewProps> = ({ user }) => {
  const lastLoginDate = new Date(Date.now() - 1000 * 60 * 23); // 23 minutes ago

  return (
    <div className="space-y-6">
      {/* System Administrator Security Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <img
          src="/logo.png"
          alt="SRM University-AP"
          className="absolute -right-6 -bottom-6 w-56 h-56 object-contain opacity-5 pointer-events-none select-none hidden sm:block"
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-700 font-bold text-3xl">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full shadow-2xs" />
          </div>

          {/* Identity */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name || 'System Administrator'}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-800">
                <Lock className="w-3.5 h-3.5 text-purple-700" />
                System Administrator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              <span className="text-slate-700 font-medium">{user?.email || 'admin@srmap.edu.in'}</span>
              {' '}&bull;{' '}
              <span className="font-mono text-slate-600">{user?.department || 'IT Infrastructure & Security'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Security Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Last Login */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {lastLoginDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {lastLoginDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} IST
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-2">Session active &bull; 23m ago</p>
        </div>

        {/* Access Clearance */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Access Clearance</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900">Level 5 — Master</p>
          <p className="text-xs text-slate-500 mt-0.5">Full Read/Write/Delete across all modules</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800">
              RBAC: Super Admin
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              @srmap.edu.in
            </span>
          </div>
        </div>

        {/* Security Domain */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auth Provider</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <BadgeCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-900">Google OAuth 2.0</p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">hd claim: srmap.edu.in</p>
          <p className="text-[11px] text-blue-600 font-medium mt-2">JWT Token Guard &bull; Enforced</p>
        </div>
      </div>

      {/* Security Audit Trail Placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="pb-3 mb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-600" />
            <span>Security Audit & Access Summary</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrative access log maintained by the SRM-AP IT Security infrastructure.
          </p>
        </div>

        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span>Domain Enforcement Policy</span>
            <span className="font-mono text-emerald-700 font-semibold">@srmap.edu.in Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span>JWT Token Guard</span>
            <span className="font-mono text-emerald-700 font-semibold">verifyToken Active</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span>Session Hydration</span>
            <span className="font-mono text-emerald-700 font-semibold">/auth/me on mount</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span>RBAC Middleware Guards</span>
            <span className="font-mono text-emerald-700 font-semibold">4 Routes Protected</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span>Global Grading Lock Status</span>
            <span className="font-mono text-slate-600 font-semibold">Unlocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PROFILE EXPORT WITH CONDITIONAL ROLE-BASED RENDERING
// ============================================================================

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    department: 'Computer Science and Engineering',
    rollNumber: '',
    phone: '',
    skillsInput: '',
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || 'Computer Science and Engineering',
        rollNumber: user.rollNumber || '',
        phone: user.phone || '',
        skillsInput: (user.skills || []).join(', '),
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const skills = formData.skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        name: formData.name,
        department: formData.department,
        rollNumber: formData.rollNumber,
        phone: formData.phone,
        skills,
      };

      const response = await userService.updateProfile(payload);

      if (response.success && response.user) {
        setUser(response.user);
        setFeedback({
          type: 'success',
          message: 'Academic & personal profile updated successfully.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // ROLE-BASED VIEW ROUTING
  // ==========================================================================
  const renderProfileView = () => {
    switch (user?.role) {
      case 'faculty':
        return <FacultyProfileView user={user} onProfileUpdate={setUser} />;
      case 'coordinator':
        return <CoordinatorProfileView user={user} onProfileUpdate={setUser} />;
      case 'admin':
        return <AdminProfileView user={user} />;
      case 'student':
      default:
        return (
          <>
            {/* Profile Header */}
            <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 mb-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-20 h-20 rounded-2xl border border-slate-200 object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
                      <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {user?.role}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <span className="text-slate-700 font-medium">{user?.email}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {user?.rollNumber || 'AP21110010042'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                      user?.isProfileComplete
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {user?.isProfileComplete ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Profile Complete
                      </>
                    ) : (
                      <>⚠️ Profile Incomplete</>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">SRM AP Identity Directory</span>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="mb-6">
                <Alert
                  type={feedback.type}
                  message={feedback.message}
                  onClose={() => setFeedback(null)}
                />
              </div>
            )}

            {/* Security / Academic Integrity Notice */}
            <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 text-xs text-blue-900 shadow-2xs">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-950">Official Academic Records Synchronization:</span>
                <p className="mt-0.5 text-blue-800 leading-relaxed">
                  Academic attributes including verified CGPA, semester status, and disciplinary clearance are cryptographically synchronized with the SRM AP University ERP. These fields cannot be altered directly by students.
                </p>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-slate-200 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" /> Personal & Departmental Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your contact details and active programming skillsets for project collaboration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter full institutional name"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      University Roll / Registration Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. AP21110010042"
                      className="w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Department / School <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                    >
                      <option value="Computer Science and Engineering">Computer Science & Engineering</option>
                      <option value="Electronics and Communication Engineering">Electronics & Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical and Electronics Engineering">Electrical & Electronics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Technical Skills & Frameworks (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skillsInput}
                    onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                    placeholder="Python, React, PyTorch, Docker, Kubernetes, ROS2, Rust, NLP"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Faculty advisors use these technical tags for automated prerequisite matching.
                  </p>
                </div>

                {/* Official Academic Details Section — STUDENT ONLY */}
                <div className="pt-4 border-t border-slate-200">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-blue-600" /> Verified Academic Credentials
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    ERP Registrar verification records for project prerequisite audits.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-medium mb-1">Official Cumulative GPA</div>
                      <div className="text-2xl font-bold text-blue-600 font-mono">
                        {user?.cgpa ? user.cgpa.toFixed(2) : '8.94'}{' '}
                        <span className="text-xs font-normal text-slate-500">/ 10.0</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-medium mb-1">Current Academic Semester</div>
                      <div className="text-2xl font-bold text-slate-900 font-mono">
                        Semester {user?.semester || 6}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                      <div className="text-xs text-slate-500 font-medium mb-1">Disciplinary Standing</div>
                      <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                        {user?.hasDisciplinaryAction ? (
                          <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                            Action Pending
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clean Standing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </>
        );
    }
  };

  // Determine max-width based on role
  const getMaxWidth = () => {
    switch (user?.role) {
      case 'faculty':
      case 'coordinator':
        return 'max-w-7xl';
      case 'admin':
        return 'max-w-4xl';
      case 'student':
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${getMaxWidth()}`}>
        {renderProfileView()}
      </main>
    </div>
  );
};

export default Profile;

