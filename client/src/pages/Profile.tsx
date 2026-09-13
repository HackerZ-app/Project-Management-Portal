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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel gradient-border mb-8 shadow-xl relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-glow"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-glow">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
                  <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {user?.role}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {user?.email} &bull;{' '}
                  <span className="text-indigo-400 font-mono">
                    {user?.rollNumber || 'Roll No. Not Set'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  user?.isProfileComplete
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}
              >
                {user?.isProfileComplete ? '✓ Profile Complete' : '⚠️ Profile Incomplete'}
              </span>
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
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Official Academic Records Protection:</span>
              <p className="mt-0.5 text-indigo-300/90 leading-relaxed">
                Academic attributes such as CGPA, Current Semester, and Disciplinary Standing are
                locked and synchronized with the SRM AP University Registrar & ERP. They cannot be
                self-modified by students.
              </p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-400" /> Personal & Departmental Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  University Roll / Registration Number
                </label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. AP21110010042"
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Department / School
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science and Engineering">Computer Science & Engineering</option>
                  <option value="Electronics and Communication Engineering">Electronics & Communication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical and Electronics Engineering">Electrical & Electronics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technical Skills & Domains (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="Python, React, PyTorch, Docker, Kubernetes, NLP"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Official Academic Details Section */}
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 pt-4">
              <GraduationCap className="w-4 h-4 text-indigo-400" /> Verified Academic Credentials
            </h2>

            {user?.role === 'student' ? (
              // Read-only view for students
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Official Cumulative GPA</div>
                  <div className="text-xl font-bold text-indigo-400 font-mono">
                    {user.cgpa ? user.cgpa.toFixed(2) : '0.00'}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 10.0</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Current Academic Semester</div>
                  <div className="text-xl font-bold text-white font-mono">
                    Semester {user.semester || 6}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Disciplinary Status</div>
                  <div className="text-sm font-semibold mt-1">
                    {user.hasDisciplinaryAction ? (
                      <span className="text-red-400">Action Pending</span>
                    ) : (
                      <span className="text-emerald-400">Clean Standing</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Editable view for Faculty / Admin
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
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
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
                  />
                  <label htmlFor="discCheck" className="text-xs font-semibold text-slate-300">
                    Active Disciplinary Action
                  </label>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
