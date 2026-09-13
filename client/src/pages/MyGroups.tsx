import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import groupService from '../services/group.service';
import { Group, PeerUser } from '../types/group.types';
import { CourseType } from '../types/project.types';
import { Alert } from '../components/Alert';
import {
  Users,
  Plus,
  Lock,
  Unlock,
  UserPlus,
  Mail,
  CheckCircle2,
  Crown,
  Search,
  Check,
  X,
} from 'lucide-react';

export const MyGroups: React.FC = () => {
  const { user } = useAuthStore();

  const [groups, setGroups] = useState<Group[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('Capstone Project');
  const [creating, setCreating] = useState(false);

  // Invite Peer State per group
  const [invitingGroupId, setInvitingGroupId] = useState<string | null>(null);
  const [peerQuery, setPeerQuery] = useState('');
  const [peerResults, setPeerResults] = useState<PeerUser[]>([]);
  const [searchingPeers, setSearchingPeers] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getMyGroups();
      setGroups(data.groups);
      setIncomingInvites(data.incomingInvites);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load group teams.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Peer search handler
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (peerQuery.trim().length >= 2) {
        setSearchingPeers(true);
        try {
          const res = await groupService.searchPeers(peerQuery);
          setPeerResults(res.peers);
        } catch {
          setPeerResults([]);
        } finally {
          setSearchingPeers(false);
        }
      } else {
        setPeerResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [peerQuery]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFeedback(null);

    try {
      const res = await groupService.createGroup({ name: groupName, courseType });
      if (res.success) {
        setFeedback({ type: 'success', message: `Group '${res.group.name}' created successfully!` });
        setShowCreateModal(false);
        setGroupName('');
        fetchGroups();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create group.',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSendInvite = async (groupId: string, identifier: string) => {
    setSendingInvite(true);
    setFeedback(null);

    try {
      const res = await groupService.inviteMember(groupId, identifier);
      setFeedback({ type: 'success', message: res.message });
      setInvitingGroupId(null);
      setPeerQuery('');
      setPeerResults([]);
      fetchGroups();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send invitation.',
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAcceptInvite = async (groupId: string) => {
    try {
      const res = await groupService.acceptInvite(groupId);
      setFeedback({ type: 'success', message: res.message });
      fetchGroups();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to accept invitation.',
      });
    }
  };

  const handleDeclineInvite = async (groupId: string) => {
    try {
      const res = await groupService.declineInvite(groupId);
      setFeedback({ type: 'success', message: res.message });
      fetchGroups();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to decline invitation.',
      });
    }
  };

  const handleLockGroup = async (groupId: string) => {
    try {
      const res = await groupService.lockGroup(groupId);
      setFeedback({ type: 'success', message: res.message });
      fetchGroups();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to lock group.',
      });
    }
  };

  const handleUnlockGroup = async (groupId: string) => {
    try {
      const res = await groupService.unlockGroup(groupId);
      setFeedback({ type: 'success', message: res.message });
      fetchGroups();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to unlock group.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Project Group Formation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Form multi-member student teams, invite peers, and lock rosters for project submissions.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create New Group
          </button>
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

        {/* Incoming Invitations Notification Section */}
        {incomingInvites.length > 0 && (
          <div className="mb-8 p-6 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Pending Team Invitations ({incomingInvites.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="p-4 rounded-md bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{invite.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Invited by <span className="text-blue-600 font-medium">{invite.leader?.name}</span> for{' '}
                      <span className="text-slate-700 font-semibold">{invite.courseType}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite._id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Groups Section */}
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" /> My Active Teams
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-white border border-slate-200 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Groups Formed Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You are not part of any active student teams. Create a group or ask a peer to invite you using your roll number.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 px-4 py-2 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              Form Your Team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groups.map((group) => {
              const isLeader =
                typeof group.leader === 'object' &&
                ((group.leader as any)._id === user?.id || (group.leader as any).id === user?.id);

              return (
                <div
                  key={group._id}
                  className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Group Card Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                        {group.courseType}
                      </span>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                          group.status === 'assigned'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : group.status === 'locked'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {group.status === 'assigned'
                          ? 'Assigned to Project'
                          : group.status === 'locked'
                          ? 'Locked (Ready to Apply)'
                          : 'Forming (Accepting Members)'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-4">{group.name}</h3>

                    {/* Members List */}
                    <div className="space-y-2 mb-6">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">
                        Team Roster ({group.members.length}/5 members):
                      </span>
                      <div className="space-y-1.5">
                        {group.members.map((member) => (
                          <div
                            key={member._id || member.id || member.email}
                            className="p-2.5 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-7 h-7 rounded-full border border-slate-200"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                                  {member.name?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900">{member.name}</span>
                                  {group.leader &&
                                    (typeof group.leader === 'object'
                                      ? ((group.leader as any)._id || (group.leader as any).id) === (member._id || member.id)
                                      : (group.leader as any) === (member._id || member.id)) && (
                                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-200">
                                        <Crown className="w-2.5 h-2.5" /> Leader
                                      </span>
                                    )}
                                </div>
                                <span className="text-[11px] text-slate-500 font-mono">
                                  {member.rollNumber || member.email}
                                </span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono font-medium text-blue-600">
                              CGPA: {member.cgpa ? member.cgpa.toFixed(2) : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pending Outgoing Invites */}
                    {group.invites && group.invites.filter((i) => i.status === 'pending').length > 0 && (
                      <div className="mb-4 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-600 font-semibold block mb-1">
                          Pending Outgoing Invites:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {group.invites
                            .filter((i) => i.status === 'pending')
                            .map((inv, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-md bg-white text-slate-600 text-[11px] border border-slate-200 shadow-sm"
                              >
                                {inv.rollNumber || inv.email} (Pending)
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Leader Action Controls */}
                  {isLeader && group.status !== 'assigned' && (
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      {group.status === 'forming' ? (
                        <>
                          {/* Invite Peer Toggle / Search */}
                          {invitingGroupId === group._id ? (
                            <div className="p-3.5 rounded-md bg-white border border-blue-200 shadow-sm relative">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                                  <UserPlus className="w-3.5 h-3.5" /> Invite Peer to Team
                                </span>
                                <button
                                  onClick={() => setInvitingGroupId(null)}
                                  className="text-slate-500 hover:text-slate-900 p-0.5"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={peerQuery}
                                  onChange={(e) => setPeerQuery(e.target.value)}
                                  placeholder="Search peer by name, roll no., or email..."
                                  className="w-full pl-9 pr-3 py-2 text-xs rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>

                              {/* Search results dropdown */}
                              {searchingPeers && (
                                <p className="text-[11px] text-slate-500 mt-2 pl-1">Searching directory...</p>
                              )}

                              {peerResults.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                                  {peerResults.map((peer) => (
                                    <div
                                      key={peer._id}
                                      className="p-2 rounded-md bg-white hover:bg-blue-50 border border-slate-200 shadow-sm flex items-center justify-between text-xs transition-colors"
                                    >
                                      <div>
                                        <span className="font-semibold text-slate-900 block">{peer.name}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          {peer.rollNumber || peer.email}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => handleSendInvite(group._id, peer.email)}
                                        disabled={sendingInvite}
                                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium shadow-sm"
                                      >
                                        Invite
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setInvitingGroupId(group._id);
                                  setPeerQuery('');
                                }}
                                disabled={group.members.length >= 5}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm transition-all disabled:opacity-50"
                              >
                                <UserPlus className="w-4 h-4" /> Invite Member
                              </button>

                              <button
                                onClick={() => handleLockGroup(group._id)}
                                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                              >
                                <Lock className="w-4 h-4" /> Lock Roster
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        // Locked Group State: Show Unlock button with guardrail warning
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Roster locked for applications.
                          </p>
                          <button
                            onClick={() => handleUnlockGroup(group._id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 shadow-sm transition-colors"
                            title="Unlock to add/remove members (requires 0 pending applications)"
                          >
                            <Unlock className="w-3.5 h-3.5" /> Unlock Roster
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200 relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-2">Create New Project Team</h2>
              <p className="text-xs text-slate-500 mb-6">
                You will be designated as the group leader and can invite peers via their roll numbers.
              </p>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                    placeholder="e.g. Neural Dynamics Alpha"
                    className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseType}
                    onChange={(e) => setCourseType(e.target.value as CourseType)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-md bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Capstone Project">Capstone Project (Senior Year)</option>
                    <option value="Mini Project">Mini Project (Pre-Final Year)</option>
                    <option value="Industrial Project">Industrial Project</option>
                    <option value="Research Project">Faculty Research Project</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 mt-2 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 mt-2 rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                  >
                    {creating ? 'Creating Team...' : 'Create Team'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
