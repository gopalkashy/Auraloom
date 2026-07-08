import * as React from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { AdminLayout } from './AdminLayout'
import { supabase } from '@/lib/supabase'
import type { Category, Subcategory } from '@/types'
import { toast } from 'sonner'

type CatForm = { name: string; slug: string; description: string; image_url: string; is_active: boolean }
type SubForm = { name: string; slug: string; description: string; image_url: string; is_active: boolean; category_id: string }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function AdminCategories() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expandedCats, setExpandedCats] = React.useState<Set<string>>(new Set())

  // Category dialog
  const [catDialog, setCatDialog] = React.useState(false)
  const [editingCat, setEditingCat] = React.useState<Category | null>(null)
  const [catForm, setCatForm] = React.useState<CatForm>({ name: '', slug: '', description: '', image_url: '', is_active: true })

  // Subcategory dialog
  const [subDialog, setSubDialog] = React.useState(false)
  const [editingSub, setEditingSub] = React.useState<Subcategory | null>(null)
  const [subForm, setSubForm] = React.useState<SubForm>({ name: '', slug: '', description: '', image_url: '', is_active: true, category_id: '' })

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = React.useState<{ type: 'cat' | 'sub'; id: string } | null>(null)

  const load = async () => {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('subcategories').select('*').order('sort_order'),
    ])
    setCategories(cats ?? [])
    setSubcategories(subs ?? [])
    setLoading(false)
  }

  React.useEffect(() => { load() }, [])

  const openAddCat = () => {
    setEditingCat(null)
    setCatForm({ name: '', slug: '', description: '', image_url: '', is_active: true })
    setCatDialog(true)
  }

  const openEditCat = (cat: Category) => {
    setEditingCat(cat)
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', image_url: cat.image_url ?? '', is_active: cat.is_active })
    setCatDialog(true)
  }

  const saveCat = async () => {
    if (!catForm.name) { toast.error('Name required'); return }
    const slug = catForm.slug || slugify(catForm.name)
    if (editingCat) {
      const { error } = await supabase.from('categories').update({ ...catForm, slug }).eq('id', editingCat.id)
      if (error) { toast.error('Failed to update'); return }
    } else {
      const { error } = await supabase.from('categories').insert({ ...catForm, slug, sort_order: categories.length + 1 })
      if (error) { toast.error(error.message); return }
    }
    toast.success(editingCat ? 'Category updated' : 'Category created')
    setCatDialog(false)
    load()
  }

  const openAddSub = (categoryId: string) => {
    setEditingSub(null)
    setSubForm({ name: '', slug: '', description: '', image_url: '', is_active: true, category_id: categoryId })
    setSubDialog(true)
  }

  const openEditSub = (sub: Subcategory) => {
    setEditingSub(sub)
    setSubForm({ name: sub.name, slug: sub.slug, description: sub.description ?? '', image_url: sub.image_url ?? '', is_active: sub.is_active, category_id: sub.category_id })
    setSubDialog(true)
  }

  const saveSub = async () => {
    if (!subForm.name) { toast.error('Name required'); return }
    const slug = subForm.slug || slugify(subForm.name)
    if (editingSub) {
      const { error } = await supabase.from('subcategories').update({ ...subForm, slug }).eq('id', editingSub.id)
      if (error) { toast.error('Failed to update'); return }
    } else {
      const { error } = await supabase.from('subcategories').insert({ ...subForm, slug, sort_order: subcategories.filter(s => s.category_id === subForm.category_id).length + 1 })
      if (error) { toast.error(error.message); return }
    }
    toast.success(editingSub ? 'Updated' : 'Created')
    setSubDialog(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'cat') {
      await supabase.from('categories').delete().eq('id', deleteTarget.id)
    } else {
      await supabase.from('subcategories').delete().eq('id', deleteTarget.id)
    }
    toast.success('Deleted')
    setDeleteTarget(null)
    load()
  }

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground text-sm">Manage categories and subcategories</p>
          </div>
          <Button onClick={openAddCat} className="gap-1.5">
            <Plus className="size-4" /> Add Category
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No categories yet. Add your first category!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(cat => {
              const subs = subcategories.filter(s => s.category_id === cat.id)
              const expanded = expandedCats.has(cat.id)
              return (
                <div key={cat.id} className="bg-card rounded-xl border overflow-hidden">
                  {/* Category row */}
                  <div className="flex items-center gap-3 p-4">
                    <button onClick={() => toggleExpand(cat.id)} className="text-muted-foreground hover:text-foreground">
                      {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="size-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="size-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Image className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{cat.name}</p>
                        <Badge variant={cat.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {cat.is_active ? 'Active' : 'Hidden'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{subs.length} subcategories</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => openEditCat(cat)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: 'cat', id: cat.id })}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {expanded && (
                    <div className="border-t bg-secondary/30">
                      <div className="p-3 space-y-2">
                        {subs.map(sub => (
                          <div key={sub.id} className="flex items-center gap-3 bg-card rounded-lg p-3">
                            {sub.image_url ? (
                              <img src={sub.image_url} alt="" className="size-8 rounded-md object-cover flex-shrink-0" />
                            ) : (
                              <div className="size-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                                <Image className="size-4 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium">{sub.name}</p>
                                <Badge variant={sub.is_active ? 'default' : 'secondary'} className="text-[10px]">
                                  {sub.is_active ? 'Active' : 'Hidden'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">/{sub.slug}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => openEditSub(sub)}>
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ type: 'sub', id: sub.id })}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full gap-1.5 border-dashed" onClick={() => openAddSub(cat.id)}>
                          <Plus className="size-3.5" /> Add Subcategory
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))} placeholder="Category name" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug: slugify(e.target.value) }))} placeholder="auto-generated" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input value={catForm.image_url} onChange={e => setCatForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={catForm.is_active} onCheckedChange={v => setCatForm(p => ({ ...p, is_active: v }))} />
              <Label>Active (visible in store)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button>
            <Button onClick={saveCat}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subDialog} onOpenChange={setSubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Edit Subcategory' : 'Add Subcategory'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={subForm.name} onChange={e => setSubForm(p => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))} placeholder="Subcategory name" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={subForm.slug} onChange={e => setSubForm(p => ({ ...p, slug: slugify(e.target.value) }))} placeholder="auto-generated" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={subForm.description} onChange={e => setSubForm(p => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Image URL</Label>
              <Input value={subForm.image_url} onChange={e => setSubForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={subForm.is_active} onCheckedChange={v => setSubForm(p => ({ ...p, is_active: v }))} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubDialog(false)}>Cancel</Button>
            <Button onClick={saveSub}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {deleteTarget?.type === 'cat' ? 'category' : 'subcategory'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete it and all associated {deleteTarget?.type === 'cat' ? 'subcategories and products' : 'products'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
