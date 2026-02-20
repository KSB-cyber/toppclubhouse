import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole, ROLE_LABELS } from '@/types/database';
import { hasPermission } from '@/lib/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, UserCheck, AlertCircle } from 'lucide-react';

const AdminRoleManagement: React.FC = () => {
  const [users, setUsers] = useState<(Profile & { roles: AppRole[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { roles } = useAuth();

  const currentRole = roles[0];
  const canManageAdmins = hasPermission(currentRole, 'canApproveAdmins') || currentRole === 'managing_director';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_approved', true);

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            roles: (userRoles || []).map(r => r.role as AppRole),
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch users',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeRole = async (userId: string, roleToRemove: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', roleToRemove);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Role removed successfully',
      });

      fetchUsers();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to remove role: ${error.message}`,
      });
    }
  };

  const assignRole = async (userId: string, newRole: AppRole) => {
    try {
      console.log('Assigning role:', { userId, newRole, currentRole });
      
      // Use RPC function to handle role assignment
      const { error } = await supabase.rpc('assign_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });

      fetchUsers();
    } catch (error) {
      console.error('Role assignment error:', error);
      // Fallback to direct database operations
      try {
        await supabase.from('user_roles').delete().eq('user_id', userId);
        await supabase.from('user_roles').insert({ user_id: userId, role: newRole });
        
        toast({
          title: 'Success',
          description: 'Role assigned successfully',
        });
        fetchUsers();
      } catch (fallbackError) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to assign role: ${error.message}`,
        });
      }
    }
  };

  if (!canManageAdmins) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You don't have permission to manage admin roles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Admin Role Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Admin Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                    <div className="flex gap-2 mt-2">
                      {user.roles.map((role) => (
                        <Badge 
                          key={role} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/20 transition-colors"
                          onClick={() => removeRole(user.user_id, role)}
                        >
                          {ROLE_LABELS[role]}
                          <span className="ml-1 text-xs">×</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value) => assignRole(user.user_id, value as AppRole)}
                      defaultValue={user.roles[0]}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="third_party">Third Party</SelectItem>
                        <SelectItem value="hr_office">HR Office</SelectItem>
                        <SelectItem value="club_house_manager">Club House Manager</SelectItem>
                        <SelectItem value="managing_director">Managing Director</SelectItem>
                        <SelectItem value="superadmin">Super Admin (IT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoleManagement;