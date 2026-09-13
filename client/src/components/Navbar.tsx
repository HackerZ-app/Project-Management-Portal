import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  Bell,
  CheckCheck,
  Calendar,
  Award,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types/auth.types';
import { Notification } from '../types/notification.types';
import useNotificationStore from '../store/useNotificationStore';
import useSocket from '../hooks/useSocket';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading: isLoadingNotifs,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize socket listener
  useSocket();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }

    if (notif.link) {
      setIsOpen(false);
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'coordinator':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'faculty':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'student':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grading':
        return <Award className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-glow">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SRM AP</span>
                <span className="text-xs uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Academic Project Management System
              </p>
            </div>
          </div>

          {/* Main Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80 text-xs">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Projects
              </button>
              {user.role === 'student' && (
                <>
                  <button
                    onClick={() => navigate('/groups')}
                    className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    My Groups
                  </button>
                  <button
                    onClick={() => navigate('/workspace')}
                    className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Workspace
                  </button>
                </>
              )}
              {(user.role === 'faculty' || user.role === 'coordinator' || user.role === 'admin') && (
                <>
                  <button
                    onClick={() => navigate('/applications')}
                    className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Applications
                  </button>
                  <button
                    onClick={() => navigate('/assessments')}
                    className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Assessments
                  </button>
                  <button
                    onClick={() => navigate('/meetings')}
                    className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Meetings
                  </button>
                  {(user.role === 'coordinator' || user.role === 'admin') && (
                    <button
                      onClick={() => navigate('/analytics')}
                      className="px-3.5 py-1.5 rounded-xl font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
                    >
                      Analytics
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/projects/create')}
                    className="px-3.5 py-1.5 rounded-xl font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors"
                  >
                    + Propose Project
                  </button>
                </>
              )}
              <button
                onClick={() => navigate('/profile')}
                className="px-3.5 py-1.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Profile
              </button>
            </nav>
          )}

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="notification-bell-btn"
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span
                      id="notification-badge"
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-pulse"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-sm text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                      {isLoadingNotifs ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          Loading alerts...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleMarkAsRead(n)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/60 transition-colors cursor-pointer text-left ${
                              !n.isRead ? 'bg-indigo-950/20' : ''
                            }`}
                          >
                            <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs ${
                                  !n.isRead ? 'font-semibold text-white' : 'text-slate-300'
                                } leading-snug break-words`}
                              >
                                {n.message}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                                <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {n.link && (
                                  <span className="text-indigo-400 flex items-center gap-0.5">
                                    View <ExternalLink className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Pill */}
              <div className="flex items-center gap-3 pl-3 py-1 pr-2 rounded-full glass-panel border border-slate-800">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="flex flex-col text-left pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200 leading-tight">
                      {user.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
