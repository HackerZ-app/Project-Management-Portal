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
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    department: 'Computer Science and Engineering',
    rollNumber: '',
    phone: '',
    skillsInput: '',
    // Admin editable fields:
    cgpa: 0,
    semester: 6,
    hasDisciplinaryAction: false,
    prerequisitesInput: '',
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
        cgpa: user.cgpa || 0,
        semester: user.semester || 6,
        hasDisciplinaryAction: user.hasDisciplinaryAction || false,
        prerequisitesInput: (user.prerequisitesCompleted || []).join(', '),
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

      const prerequisitesCompleted = formData.prerequisitesInput
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const payload: any = {
        name: formData.name,
        department: formData.department,
        rollNumber: formData.rollNumber,
        phone: formData.phone,
        skills,
      };

      // Only administrators/coordinators send academic attributes
      if (user?.role !== 'student') {
        payload.cgpa = Number(formData.cgpa);
        payload.semester = Number(formData.semester);
        payload.hasDisciplinaryAction = formData.hasDisciplinaryAction;
        payload.prerequisitesCompleted = prerequisitesCompleted;
      }

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <span className="capitalize text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
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
                className={`text-xs font-bold px-3 py-1 rounded-md border flex items-center gap-1.5 shadow-2xs ${
                  user?.isProfileComplete
                    ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                    : 'bg-amber-100 border-amber-200 text-amber-800'
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
        {user?.role === 'student' && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 text-xs text-blue-900 shadow-2xs">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950">Official Academic Records Synchronization:</span>
              <p className="mt-0.5 text-blue-800 leading-relaxed">
                Academic attributes including verified CGPA, semester status, and disciplinary clearance are cryptographically synchronized with the SRM AP University ERP. These fields cannot be altered directly by students.
              </p>
            </div>
          </div>
        )}

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

            {/* Official Academic Details Section */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-blue-600" /> Verified Academic Credentials
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                ERP Registrar verification records for project prerequisite audits.
              </p>

              {user?.role === 'student' ? (
                // Read-only view for students
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium mb-1">Official Cumulative GPA</div>
                    <div className="text-2xl font-bold text-blue-600 font-mono">
                      {user.cgpa ? user.cgpa.toFixed(2) : '8.94'}{' '}
                      <span className="text-xs font-normal text-slate-500">/ 10.0</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium mb-1">Current Academic Semester</div>
                    <div className="text-2xl font-bold text-slate-900 font-mono">
                      Semester {user.semester || 6}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="text-xs text-slate-500 font-medium mb-1">Disciplinary Standing</div>
                    <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                      {user.hasDisciplinaryAction ? (
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Action Pending
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Clean Standing
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Editable view for Faculty / Admin
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="discCheck"
                      checked={formData.hasDisciplinaryAction}
                      onChange={(e) =>
                        setFormData({ ...formData, hasDisciplinaryAction: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="discCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Active Disciplinary Action
                    </label>
                  </div>
                </div>
              )}
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
      </main>
    </div>
  );
};

export default Profile;
