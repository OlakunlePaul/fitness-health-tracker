import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Save, Target } from 'lucide-react';
import backend from '~backend/client';
import { useToast } from '@/components/ui/use-toast';
import type { CreateUserRequest } from '~backend/users/create';

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    name: '',
    age: undefined,
    weightKg: undefined,
    heightCm: undefined,
    activityLevel: 'moderate',
    fitnessGoal: '',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userId = 1;

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => backend.users.get({ id: userId }),
    retry: false,
  });

  const createUserMutation = useMutation({
    mutationFn: backend.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setIsEditing(false);
      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to create profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof CreateUserRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user && !isEditing) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Create your profile to get personalized fitness recommendations.
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No profile found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your profile to start tracking your fitness journey.
            </p>
            <Button onClick={() => setIsEditing(true)}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing || !user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user ? 'Edit Profile' : 'Create Profile'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user ? 'Update your profile information.' : 'Set up your profile to get started.'}
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Fill in your details to personalize your fitness experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Age"
                    min="13"
                    max="120"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weightKg || ''}
                    onChange={(e) => handleInputChange('weightKg', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Weight"
                    min="20"
                    max="300"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.heightCm || ''}
                    onChange={(e) => handleInputChange('heightCm', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Height"
                    min="100"
                    max="250"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) => handleInputChange('activityLevel', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="light">Light (light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (moderate exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (hard exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (very hard exercise, physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                <Textarea
                  id="fitnessGoal"
                  value={formData.fitnessGoal || ''}
                  onChange={(e) => handleInputChange('fitnessGoal', e.target.value)}
                  placeholder="Describe your fitness goals (e.g., lose weight, build muscle, improve endurance)"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createUserMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
                {user && (
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile and fitness preferences.
          </p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user.age && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                  <p className="text-lg">{user.age} years</p>
                </div>
              )}
              {user.weightKg && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                  <p className="text-lg">{user.weightKg} kg</p>
                </div>
              )}
              {user.heightCm && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Height</Label>
                  <p className="text-lg">{user.heightCm} cm</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Activity Level</Label>
              <p className="text-lg capitalize">{user.activityLevel.replace('_', ' ')}</p>
            </div>

            {user.fitnessGoal && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fitness Goal</Label>
                <p className="text-lg">{user.fitnessGoal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.weightKg && user.heightCm && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">BMI</Label>
                <p className="text-2xl font-bold">
                  {((user.weightKg / (user.heightCm / 100)) ** 2).toFixed(1)}
                </p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
              <p className="text-lg">
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Profile Completion</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Complete</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
