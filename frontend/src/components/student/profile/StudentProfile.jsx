import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Calendar,
  Edit,
  Save,
  X,
  Lock,
  Award,
  TrendingUp,
  Target,
} from 'lucide-react';
import { ExamService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/services';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await ExamService.getAttemptStats();
      setStats(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

const handleUpdate = async () => {
  if (!formData.fullName.trim()) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Full name is required',
    });
    return;
  }

  try {
    setLoading(true);

    const response = await UserService.updateProfile({
      fullName: formData.fullName,
      email: formData.email,
    });

    const updatedUser = response.data?.user || response.data;
    await updateUser(updatedUser);

    toast({
      title: 'Success',
      description: 'Profile updated successfully',
    });
    setIsEditing(false);
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message || 'Failed to update profile',
    });
  } finally {
    setLoading(false);
  }
};


const handlePasswordChange = async () => {
  if (!passwordData.currentPassword || !passwordData.newPassword) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'All password fields are required',
    });
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'New passwords do not match',
    });
    return;
  }

  if (passwordData.newPassword.length < 6) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Password must be at least 6 characters',
    });
    return;
  }

  try {
    setLoading(true);

    await UserService.changePassword({
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    toast({
      title: 'Success',
      description: 'Password changed successfully',
    });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: error.message || 'Failed to change password',
    });
  } finally {
    setLoading(false);
  }
};


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const passRate = stats?.totalAttempts > 0
    ? ((stats.passed / stats.totalAttempts) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and view your statistics
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.fullName}</h2>
              <p className="text-muted-foreground">@{user?.username}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    fullName: user?.fullName || '',
                    email: user?.email || '',
                    username: user?.username || '',
                  });
                }}
                variant="outline"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                disabled // Username cannot be changed
                className="bg-secondary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Input
              value="Student"
              disabled
              className="bg-secondary"
            />
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Exams</p>
              <p className="text-2xl font-bold">{stats?.totalAttempts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">{passRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Change Password */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </h3>

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Confirm new password"
            />
          </div>

          <Button onClick={handlePasswordChange} disabled={loading}>
            <Lock className="mr-2 h-4 w-4" />
            Update Password
          </Button>
        </div>
      </Card>

      {/* Account Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Account ID</span>
            <span className="font-mono">{user?._id}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Account Type</span>
            <span className="font-semibold capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Account Status</span>
            <span className="text-green-600 font-semibold">Active</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Member Since</span>
            <span>{user?.createdAt ? formatDate(user.createdAt) : 'Recently'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentProfile;
