import api from './api';
import { EligibilityResponse } from '../types/eligibility.types';

export const eligibilityService = {
  /**
   * Check or retrieve cached project eligibility for current student
   */
  async checkEligibility(forceRefresh: boolean = false): Promise<EligibilityResponse> {
    const url = forceRefresh ? '/eligibility/check?forceRefresh=true' : '/eligibility/check';
    const response = await api.get<EligibilityResponse>(url);
    return response.data;
  },
};

export default eligibilityService;
