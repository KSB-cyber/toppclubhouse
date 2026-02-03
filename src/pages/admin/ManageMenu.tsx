import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';
import { Plus, Pencil, Trash2, ChefHat } from 'lucide-react';
import { Tables, Enums } from '@/integrations/supabase/types';

type MenuItem = Tables<'menu_items'>;
type MealType = Enums<'meal_type'>;

const ManageMenu: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Generate food images based on meal type
  const generateFoodImage = (mealType: MealType) => {
    const images = {
      breakfast: '/BREAKFAST.jpeg',
      lunch: '/LUNCH.jpeg',
      supper: '/SUPPER.jpeg'
    };
    return images[mealType];
  };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_type: 'lunch' as MealType,
    price: '',
    is_available: true,
    is_vegetarian: false,
    is_vegan: false,
    allergens: '',
  });

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('meal_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('menu_items').insert({
        name: data.name,
        description: data.description,
        meal_type: data.meal_type,
        price: parseFloat(data.price) || 0,
        image_url: generateFoodImage(data.meal_type),
        is_available: data.is_available,
        is_vegetarian: data.is_vegetarian,
        is_vegan: data.is_vegan,
        allergens: data.allergens.split(',').map(a => a.trim()).filter(Boolean),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast({ title: 'Menu item created successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('menu_items').update({
        name: data.name,
        description: data.description,
        meal_type: data.meal_type,
        price: parseFloat(data.price) || 0,
        image_url: generateFoodImage(data.meal_type),
        is_available: data.is_available,
        is_vegetarian: data.is_vegetarian,
        is_vegan: data.is_vegan,
        allergens: data.allergens.split(',').map(a => a.trim()).filter(Boolean),
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast({ title: 'Menu item updated successfully' });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      toast({ title: 'Menu item deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      meal_type: 'lunch',
      price: '',
      is_available: true,
      is_vegetarian: false,
      is_vegan: false,
      allergens: '',
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      meal_type: item.meal_type,
      price: item.price?.toString() || '',
      is_available: item.is_available ?? true,
      is_vegetarian: item.is_vegetarian ?? false,
      is_vegan: item.is_vegan ?? false,
      allergens: item.allergens?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Manage Menu</h1>
          <p className="text-muted-foreground">Add and manage food menu items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} Menu Item</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the menu item details.' : 'Fill in the details for the new menu item.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="meal_type">Meal Type</Label>
                <Select value={formData.meal_type} onValueChange={(v) => setFormData({ ...formData, meal_type: v as MealType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="supper">Supper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="price">Price (GH₵)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formData.price} 
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="allergens">Allergens (comma-separated)</Label>
                <Input id="allergens" value={formData.allergens} onChange={(e) => setFormData({ ...formData, allergens: e.target.value })} placeholder="Nuts, Dairy, Gluten" />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="available" checked={formData.is_available} onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })} />
                  <Label htmlFor="available">Available</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="vegetarian" checked={formData.is_vegetarian} onCheckedChange={(checked) => setFormData({ ...formData, is_vegetarian: checked })} />
                  <Label htmlFor="vegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="vegan" checked={formData.is_vegan} onCheckedChange={(checked) => setFormData({ ...formData, is_vegan: checked })} />
                  <Label htmlFor="vegan">Vegan</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingItem ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Menu Items ({menuItems?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Meal Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Dietary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.meal_type}</TableCell>
                  <TableCell className="font-medium">GH₵ {item.price?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.is_vegetarian && <Badge variant="outline" className="text-green-600">V</Badge>}
                      {item.is_vegan && <Badge variant="outline" className="text-green-700">VG</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.is_available ? 'default' : 'secondary'}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {menuItems?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No menu items found. Add your first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageMenu;
