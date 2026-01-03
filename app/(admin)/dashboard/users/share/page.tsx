'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
  MenuIcon,
  ChevronLeftIcon,
  LogOutIcon,
  ArrowLeft,
  Share2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { logoutAction } from '@/app/actions/logout';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { updateUserPasswordAction } from './actions';

const navigationItems = [
  {
    icon: '/ix-user-management.svg',
    label: 'User Management',
    active: true,
    href: '/dashboard/users',
  },
  {
    icon: '/pajamas-media.svg',
    label: 'Media Management',
    active: false,
    href: '/dashboard/categories',
  },
  {
    icon: '/game-icons-expense.svg',
    label: 'Expense Monitoring',
    active: false,
    href: '/dashboard/expenses',
  },
];

interface User {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string;
  plain_password: string | null;
}

export default function ShareCredentialsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, plain_password')
        .eq('role', 'user')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get email from auth.users
      const usersWithEmail = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
          return {
            ...profile,
            email: authData.user?.email || '',
          };
        })
      );

      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyCredentials = async (username: string, password: string | null, userId: string) => {
    const credentials = `Username: ${username}\nPassword: ${password || 'Not available'}`;
    
    try {
      await navigator.clipboard.writeText(credentials);
      setCopiedItems(prev => ({ ...prev, [userId]: true }));
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [userId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEditPassword = (user: User) => {
    setEditingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setEditDialogOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!editingUser) return;

    setError('');
    
    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setUpdating(true);
    try {
      const result = await updateUserPasswordAction(editingUser.id, newPassword);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh users to get updated password
      await fetchUsers();
      
      setEditDialogOpen(false);
      setEditingUser(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      setError('An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50
        w-[264px] bg-white flex-shrink-0 flex flex-col h-screen overflow-hidden
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <Link href="/dashboard" className="relative w-[200px] h-[80px]">
            <Image
              className="object-contain"
              alt="Dailishaw Logo"
              src="/dashboard-logo.gif"
              fill
              priority
              unoptimized
            />
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <nav className="flex-1 px-4 pt-6 overflow-y-auto">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mb-2 cursor-pointer rounded-lg transition-colors ${
                item.active
                  ? 'bg-[#f9831b1a]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <Image
                className="w-6 h-6"
                alt={item.label}
                src={item.icon}
                width={24}
                height={24}
              />
              <span
                className={`font-['Inter',Helvetica] font-normal text-base ${
                  item.active ? 'text-[#f9831b]' : 'text-[#5d5d5d]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOutIcon className="w-6 h-6 text-[#5d5d5d]" />
            <span className="font-['Inter',Helvetica] font-normal text-base text-[#5d5d5d]">
              Logout
            </span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col w-full transition-all duration-300 ${sidebarOpen ? 'lg:ml-[264px]' : 'ml-0'}`}>
        <header className="h-20 bg-white shadow-[0px_2px_4px_#d9d9d940] flex items-center px-4 lg:px-6 gap-3 lg:gap-6">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <MenuIcon className="w-6 h-6 text-gray-900" />
            </button>
          )}

          <h1 className="font-['Inter',Helvetica] font-medium text-black text-xl lg:text-[32px] whitespace-nowrap">
            Share Credentials
          </h1>

          <div className="hidden md:flex flex-1 max-w-[327px] relative ml-6">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Type to Search"
                className="w-full h-[41px] pl-12 pr-4 bg-white rounded-[10px] border border-black font-['Inter',Helvetica] font-medium text-[15px] placeholder:text-[#b8b3b3]"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3 lg:gap-6">
            <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 cursor-pointer text-gray-900" />

            <div className="hidden sm:flex items-center gap-3 cursor-pointer">
              <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src="/ellipse-1.svg" alt="Admin" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-['Inter',Helvetica] font-normal text-black text-[15px] whitespace-nowrap">
                Admin
              </span>
              <ChevronDownIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-900" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          <Button
            onClick={() => router.push('/dashboard/users')}
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-[#5d5d5d] hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to User Management
          </Button>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-xl">
                  User Credentials
                </h2>
                <p className="text-sm text-gray-600">
                  View, edit and share login credentials with users
                </p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 mb-4">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-4">
                <p className="text-sm text-green-800 font-medium">{success}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-3">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg">
                <p className="text-gray-600">No active users found.</p>
                <Link href="/dashboard/users/create" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  Create a user first →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-['Inter',Helvetica] font-semibold text-gray-900 text-lg mb-1">
                            {user.display_name || user.user_id}
                          </h3>
                          {user.email && (
                            <p className="text-sm text-gray-500">{user.email}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPassword(user)}
                            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Edit password"
                          >
                            <Edit2 className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => copyCredentials(user.user_id, user.plain_password, user.id)}
                            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Copy credentials"
                          >
                            {copiedItems[user.id] ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Username
                          </label>
                          <div className="mt-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <span className="font-['Inter',Helvetica] font-medium text-gray-900 flex-1">
                              {user.user_id}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Password
                          </label>
                          <div className="mt-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            <span className="font-['Inter',Helvetica] font-medium text-gray-900 flex-1">
                              {user.plain_password ? (visiblePasswords[user.id] ? user.plain_password : '••••••••') : 'Not available'}
                            </span>
                            {user.plain_password && (
                              <button
                                onClick={() => togglePasswordVisibility(user.id)}
                                className="p-1 hover:bg-white rounded transition-colors"
                              >
                                {visiblePasswords[user.id] ? (
                                  <EyeOff className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <Eye className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Password Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
            <DialogDescription>
              Update password for {editingUser?.display_name || editingUser?.user_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new_password" className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm">
                New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={updating}
                className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <p className="text-xs text-gray-600">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password" className="font-['Inter',Helvetica] font-medium text-gray-900 text-sm">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={updating}
                className="w-full h-12 bg-white rounded-lg border-2 border-gray-200 text-gray-900 px-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePassword}
              disabled={updating}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {updating ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
