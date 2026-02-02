import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';
import { useToast } from '@/hooks/use-toast';
import { Profile, ROLE_LABELS, AppRole } from '@/types/database';
import {
  Search,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  Loader2,
  Mail,
  Building,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

const UserApprovals: React.FC = () => {
  const { user } = useAuth();
  const { data: pendingUsers = [], isLoading } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_approved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Profile[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>('employee');
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const { toast } = useToast();

  const approveUser = async (profile: Profile, role: AppRole) => {
    setIsApproving(true);
    try {
      // Update profile approval
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_approved: true })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', profile.user_id);

      if (roleError) throw roleError;

      toast({
        title: 'User approved',
        description: `${profile.full_name} approved as ${ROLE_LABELS[role]}.`,
      });

      setSelectedUser(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error approving user',
        description: error.message,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const declineUser = async (profile: Profile) => {
    setIsDeclining(true);
    try {
      // In a real app, you might want to delete the user or mark them as declined
      // For now, we'll just remove them from the pending list
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'User declined',
        description: `${profile.full_name}'s registration has been declined.`,
      });

      setSelectedUser(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error declining user',
        description: error.message,
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const filteredUsers = pendingUsers.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <BackButton />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Account Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve pending user registrations
          </p>
        </div>
        <Badge className="bg-warning/10 text-warning border-warning/20 px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {pendingUsers.length} Pending
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Users Table */}
      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No matching users found' : 'No pending approvals'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search'
              : 'All user registrations have been processed'}
          </p>
        </Card>
      ) : (
        <Card className="premium-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{profile.full_name}</p>
                        {profile.employee_id && (
                          <p className="text-xs text-muted-foreground">
                            ID: {profile.employee_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.department || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={profile.is_third_party ? 'secondary' : 'default'}>
                      {profile.is_third_party ? 'Third Party' : 'Employee'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(profile.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(profile);
                          setSelectedRole(profile.is_third_party ? 'third_party' : 'employee');
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => selectedUser && declineUser(selectedUser)}
                      >
                        <XCircle className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Approve User & Assign Role</DialogTitle>
            <DialogDescription>
              Approve{' '}
              <span className="font-medium text-foreground">
                {selectedUser?.full_name}
              </span>
              's registration and assign their role.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedUser.email}</span>
              </div>
              {selectedUser.department && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedUser.department}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Role:</label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => selectedUser && approveUser(selectedUser, selectedRole)}
              disabled={isApproving}
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve & Assign Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Decline Registration?</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline{' '}
              <span className="font-medium text-foreground">
                {selectedUser?.full_name}
              </span>
              's registration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedUser.email}</span>
              </div>
              {selectedUser.department && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedUser.department}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && declineUser(selectedUser)}
              disabled={isDeclining}
            >
              {isDeclining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Decline Registration
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserApprovals;
