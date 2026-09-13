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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-slate-200 mb-8 shadow-sm relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-xl border border-slate-200 object-cover shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
                  <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {user?.role}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {user?.email} &bull;{' '}
                  <span className="text-slate-700 font-mono">
                    {user?.rollNumber || 'Roll No. Not Set'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-md border ${
                  user?.isProfileComplete
                    ? 'bg-green-100 border-green-200 text-green-800'
                    : 'bg-yellow-100 border-yellow-200 text-yellow-800'
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
          <div className="mb-6 p-4 rounded-md bg-blue-50 border border-blue-200 flex items-start gap-3 text-xs text-blue-800">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900">Official Academic Records Protection:</span>
              <p className="mt-0.5 text-blue-700 leading-relaxed">
                Academic attributes such as CGPA, Current Semester, and Disciplinary Standing are
                locked and synchronized with the SRM AP University Registrar & ERP. They cannot be
                self-modified by students.
              </p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <User className="w-4 h-4 text-blue-600" /> Personal & Departmental Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  University Roll / Registration Number
                </label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. AP21110010042"
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department / School
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Skills & Domains (comma-separated)
              </label>
              <input
                type="text"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="Python, React, PyTorch, Docker, Kubernetes, NLP"
                className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Official Academic Details Section */}
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 pt-4">
              <GraduationCap className="w-4 h-4 text-blue-600" /> Verified Academic Credentials
            </h2>

            {user?.role === 'student' ? (
              // Read-only view for students
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Official Cumulative GPA</div>
                  <div className="text-xl font-bold text-blue-600 font-mono">
                    {user.cgpa ? user.cgpa.toFixed(2) : '0.00'}{' '}
                    <span className="text-xs font-normal text-slate-500">/ 10.0</span>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Current Academic Semester</div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    Semester {user.semester || 6}
                  </div>
                </div>

                <div className="p-4 rounded-md bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Disciplinary Status</div>
                  <div className="text-sm font-semibold mt-1">
                    {user.hasDisciplinaryAction ? (
                      <span className="text-red-600">Action Pending</span>
                    ) : (
                      <span className="text-green-600">Clean Standing</span>
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
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-full px-3.5 py-2 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-200 focus:ring-blue-500"
                  />
                  <label htmlFor="discCheck" className="text-xs font-semibold text-slate-700">
                    Active Disciplinary Action
                  </label>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
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

export default Profile;
