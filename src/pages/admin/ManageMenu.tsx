import React, { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import BackButton from '@/components/ui/back-button';
import { Plus, Pencil, Trash2, ChefHat, Sparkles, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ManageMenu = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMealType, setFilterMealType] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_type: 'lunch',
    price: '',
    image_url: '',
    is_available: true,
    is_vegetarian: false,
    is_vegan: false,
    allergens: '',
  });

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('meal_type')
        .order('name');
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        meal_type: formData.meal_type,
        price: parseFloat(formData.price) || 0,
        image_url: formData.image_url || null,
        is_available: formData.is_available,
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : [],
      };

      if (editingId) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', editingId);
        if (error) throw error;
        toast({ title: '✓ Updated successfully' });
      } else {
        const { error } = await supabase.from('menu_items').insert(payload);
        if (error) throw error;
        toast({ title: '✓ Created successfully' });
      }

      resetForm();
      loadMenu();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      toast({ title: '✓ Deleted successfully' });
      loadMenu();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      meal_type: item.meal_type || 'lunch',
      price: item.price?.toString() || '',
      image_url: item.image_url || '',
      is_available: item.is_available ?? true,
      is_vegetarian: item.is_vegetarian ?? false,
      is_vegan: item.is_vegan ?? false,
      allergens: item.allergens?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      meal_type: 'lunch',
      price: '',
      image_url: '',
      is_available: true,
      is_vegetarian: false,
      is_vegan: false,
      allergens: '',
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <BackButton />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
              <ChefHat className="h-10 w-10 text-blue-600" />
              Manage Menu
            </h1>
            <p className="text-gray-600 mt-2">Add and manage food menu items</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {editingId ? 'Edit' : 'Add'} Menu Item
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Meal Type *</Label>
                  <Select value={formData.meal_type} onValueChange={(v) => setFormData({ ...formData, meal_type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                      <SelectItem value="lunch">☀️ Lunch</SelectItem>
                      <SelectItem value="supper">🌙 Supper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1" rows={3} />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Price (GH₵) *</Label>
                  <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Image URL</Label>
                  <Input type="url" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Allergens (comma-separated)</Label>
                  <Input value={formData.allergens} onChange={(e) => setFormData({ ...formData, allergens: e.target.value })} placeholder="Nuts, Dairy, Gluten" className="mt-1" />
                </div>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_available} onCheckedChange={(c) => setFormData({ ...formData, is_available: c })} />
                    <Label className="text-sm">Available</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_vegetarian} onCheckedChange={(c) => setFormData({ ...formData, is_vegetarian: c })} />
                    <Label className="text-sm">Vegetarian</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formData.is_vegan} onCheckedChange={(c) => setFormData({ ...formData, is_vegan: c })} />
                    <Label className="text-sm">Vegan</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-semibold mb-2 block">Filter by Meal Type</Label>
                <Select value={filterMealType} onValueChange={setFilterMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Meals</SelectItem>
                    <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="supper">🌙 Supper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-semibold mb-2 block">Filter by Date Created</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filterDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate ? format(filterDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filterDate} onSelect={setFilterDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              {(filterMealType !== 'all' || filterDate) && (
                <Button variant="outline" onClick={() => { setFilterMealType('all'); setFilterDate(undefined); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ChefHat className="h-6 w-6 text-blue-600" />
              Menu Items ({menuItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50/50">
                    <TableHead className="font-bold">Name</TableHead>
                    <TableHead className="font-bold">Meal Type</TableHead>
                    <TableHead className="font-bold">Price</TableHead>
                    <TableHead className="font-bold">Dietary</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems
                    .filter(item => filterMealType === 'all' || item.meal_type === filterMealType)
                    .filter(item => !filterDate || format(new Date(item.created_at), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd'))
                    .map((item) => (
                    <TableRow key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.meal_type === 'breakfast' && '🌅'} 
                          {item.meal_type === 'lunch' && '☀️'} 
                          {item.meal_type === 'supper' && '🌙'} 
                          {item.meal_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">GH₵{item.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {item.is_vegetarian && <Badge variant="outline" className="text-green-600 text-xs">V</Badge>}
                          {item.is_vegan && <Badge variant="outline" className="text-green-700 text-xs">VG</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_available ? 'default' : 'secondary'} className={item.is_available ? 'bg-green-500' : ''}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="hover:bg-blue-50">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} className="hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {menuItems
                    .filter(item => filterMealType === 'all' || item.meal_type === filterMealType)
                    .filter(item => !filterDate || format(new Date(item.created_at), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd'))
                    .length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p>No menu items yet. Add your first one!</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageMenu;
