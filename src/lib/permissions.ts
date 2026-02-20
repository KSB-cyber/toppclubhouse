import { AppRole } from '@/types/database';

export interface RolePermissions {
  canApproveUsers: boolean;
  canApproveAdmins: boolean;
  canApproveThirdParty: boolean;
  canApproveGuestRooms: boolean;
  canFinalApproveGuestRooms: boolean;
  canApproveFacilities: boolean;
  canFinalApproveFacilities: boolean;
  canUpdateMenu: boolean;
  canManageAccommodations: boolean;
  canManageFacilities: boolean;
  canDownloadReports: boolean;
  canManageRoomAvailability: boolean;
  hasUnlimitedAccess: boolean;
  approvalLevel: number;
}

export const ROLE_PERMISSIONS: Record<AppRole, RolePermissions> = {
  superadmin: {
    canApproveUsers: true,
    canApproveAdmins: true,
    canApproveThirdParty: true,
    canApproveGuestRooms: false,
    canFinalApproveGuestRooms: false,
    canApproveFacilities: false,
    canFinalApproveFacilities: false,
    canUpdateMenu: false,
    canManageAccommodations: false,
    canManageFacilities: false,
    canDownloadReports: false,
    canManageRoomAvailability: false,
    hasUnlimitedAccess: false,
    approvalLevel: 0,
  },
  managing_director: {
    canApproveUsers: false,
    canApproveAdmins: false,
    canApproveThirdParty: false,
    canApproveGuestRooms: true,
    canFinalApproveGuestRooms: true,
    canApproveFacilities: true,
    canFinalApproveFacilities: true,
    canUpdateMenu: false,
    canManageAccommodations: false,
    canManageFacilities: false,
    canDownloadReports: true,
    canManageRoomAvailability: false,
    hasUnlimitedAccess: true,
    approvalLevel: 3,
  },
  hr_office: {
    canApproveUsers: true,
    canApproveAdmins: false,
    canApproveThirdParty: false,
    canApproveGuestRooms: true,
    canFinalApproveGuestRooms: false,
    canApproveFacilities: false,
    canFinalApproveFacilities: false,
    canUpdateMenu: false,
    canManageAccommodations: true,
    canManageFacilities: false,
    canDownloadReports: true,
    canManageRoomAvailability: false,
    hasUnlimitedAccess: false,
    approvalLevel: 1,
  },
  club_house_manager: {
    canApproveUsers: true,
    canApproveAdmins: false,
    canApproveThirdParty: false,
    canApproveGuestRooms: true,
    canFinalApproveGuestRooms: false,
    canApproveFacilities: false,
    canFinalApproveFacilities: false,
    canUpdateMenu: true,
    canManageAccommodations: true,
    canManageFacilities: true,
    canDownloadReports: false,
    canManageRoomAvailability: true,
    hasUnlimitedAccess: false,
    approvalLevel: 2,
  },
  employee: {
    canApproveUsers: false,
    canApproveAdmins: false,
    canApproveThirdParty: false,
    canApproveGuestRooms: false,
    canFinalApproveGuestRooms: false,
    canApproveFacilities: false,
    canFinalApproveFacilities: false,
    canUpdateMenu: false,
    canManageAccommodations: false,
    canManageFacilities: false,
    canDownloadReports: false,
    canManageRoomAvailability: false,
    hasUnlimitedAccess: false,
    approvalLevel: 0,
  },
  third_party: {
    canApproveUsers: false,
    canApproveAdmins: false,
    canApproveThirdParty: false,
    canApproveGuestRooms: false,
    canFinalApproveGuestRooms: false,
    canApproveFacilities: false,
    canFinalApproveFacilities: false,
    canUpdateMenu: false,
    canManageAccommodations: false,
    canManageFacilities: false,
    canDownloadReports: false,
    canManageRoomAvailability: false,
    hasUnlimitedAccess: false,
    approvalLevel: 0,
  },
};

export const hasPermission = (role: AppRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[role][permission] as boolean;
};

export const getApprovalLevel = (role: AppRole): number => {
  return ROLE_PERMISSIONS[role].approvalLevel;
};

export const canAccessAdminPanel = (role: AppRole): boolean => {
  return ['superadmin', 'managing_director', 'hr_office', 'club_house_manager'].includes(role);
};