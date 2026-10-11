import api from './api';
import { Group, MyGroupsResponse, PeerUser } from '../types/group.types';

export const groupService = {
  /**
   * Create a new project group
   */
  async createGroup(data: { name: string; courseType: string }): Promise<{ success: boolean; message: string; group: Group }> {
    const response = await api.post<{ success: boolean; message: string; group: Group }>('/groups', data);
    return response.data;
  },

  /**
   * Get user's active groups and pending incoming invitations
   */
  async getMyGroups(): Promise<MyGroupsResponse> {
    const response = await api.get<MyGroupsResponse>('/groups/me');
    return response.data;
  },

  /**
   * Search fellow students by name, email, or roll number (privacy-safe projection)
   */
  async searchPeers(query: string): Promise<{ success: boolean; peers: PeerUser[] }> {
    const response = await api.get<{ success: boolean; peers: PeerUser[] }>('/groups/peers', {
      params: { search: query },
    });
    return response.data;
  },

  /**
   * Invite peer to join group
   */
  async inviteMember(groupId: string, identifier: string): Promise<{ success: boolean; message: string; group: Group }> {
    const response = await api.post<{ success: boolean; message: string; group: Group }>(
      `/groups/${groupId}/invite`,
      { identifier }
    );
    return response.data;
  },

  /**
   * Accept incoming group invitation
   */
  async acceptInvite(groupId: string): Promise<{ success: boolean; message: string; group: Group }> {
    const response = await api.put<{ success: boolean; message: string; group: Group }>(
      `/groups/${groupId}/accept`
    );
    return response.data;
  },

  /**
   * Decline incoming group invitation
   */
  async declineInvite(groupId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.put<{ success: boolean; message: string }>(
      `/groups/${groupId}/decline`
    );
    return response.data;
  },

  /**
   * Lock group roster (ready for project application)
   */
  async lockGroup(groupId: string): Promise<{ success: boolean; message: string; group: Group }> {
    const response = await api.put<{ success: boolean; message: string; group: Group }>(
      `/groups/${groupId}/lock`
    );
    return response.data;
  },

  /**
   * Unlock group roster (allowed only if 0 pending applications exist)
   */
  async unlockGroup(groupId: string): Promise<{ success: boolean; message: string; group: Group }> {
    const response = await api.put<{ success: boolean; message: string; group: Group }>(
      `/groups/${groupId}/unlock`
    );
    return response.data;
  },
};

export default groupService;
