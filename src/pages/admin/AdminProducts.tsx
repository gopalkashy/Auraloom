import * as React from 'react'
import { Plus, Pencil, Trash2, Search, X, Star, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { AdminLayout } from './AdminLayout'
import { supabase, getImageUrl } from '@/lib/supabase'
import type { Product, Category, Subcategory } from '@/types'
import { toast } from 'sonner'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', sale_price: '', discount_percentage: '0',
  stock_qty: '0', sku: '', subcategory_id: '', images: [] as string[],
  is_active: true, is_featured: false, tags: '',
}

export function AdminProducts() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filterCat, setFilterCat] = React.useState('')
  const [page] = React.useState(0)
  const PAGE_SIZE = 20

  const [dialog, setDialog] = React.useState(false)
  const [editing, setEditing] = React.useState<Product | null>(null)
  const [form, setForm] = React.useState(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const load = React.useCallback(async () => {
    const [{ data: prods }, { data: cats }, { data: subs }] = await Promise.all([
      supabase.from('products')
        .select('*, subcategory:subcategories(*, category:categories(*))')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('subcategories').select('*').order('sort_order'),
    ])
    setProducts(prods ?? [])
    setCategories(cats ?? [])
    setSubcategories(subs ?? [])
    setLoading(false)
  }, [page])

  React.useEffect(() => { load() }, [load])

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || p.subcategory?.category_id === filterCat
    return matchSearch && matchCat
  })

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialog(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name: product.name, slug: product.slug, description: product.description ?? '',
      price: String(product.price), sale_price: product.sale_price ? String(product.sale_price) : '',
      discount_percentage: String(product.discount_percentage ?? 0),
      stock_qty: String(product.stock_qty), sku: product.sku ?? '',
      subcategory_id: product.subcategory_id, images: product.images ?? [],
      is_active: product.is_active, is_featured: product.is_featured,
      tags: (product.tags ?? []).join(', '),
    })
    setDialog(true)
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const uploaded: string[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (error) throw error
        uploaded.push(getImageUrl(path))
      }
      if (uploaded.length > 0) {
        setForm(p => ({ ...p, images: [...p.images, ...uploaded] }))
        toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`)
      }
    } catch {
      toast.error('Upload failed. Check storage policies.')
    } finally {
      setUploading(false)
      setDragOver(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleImageUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const removeImage = (i: number) => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))

  const save = async () => {
    if (!form.name || !form.price || !form.subcategory_id) {
      toast.error('Name, price, and subcategory are required')
      return
    }
    setSaving(true)
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      discount_percentage: Math.max(0, parseInt(form.discount_percentage) || 0),
      stock_qty: parseInt(form.stock_qty) || 0,
      sku: form.sku || null,
      subcategory_id: form.subcategory_id,
      images: form.images,
      is_active: form.is_active,
      is_featured: form.is_featured,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      updated_at: new Date().toISOString(),
    }
    try {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success('Product added')
      }
      setDialog(false)
      load()
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('products').delete().eq('id', deleteId)
    toast.success('Product deleted')
    setDeleteId(null)
    load()
  }

  const toggleActive = async (product: Product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    load()
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground text-sm">{products.length} total</p>
          </div>
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="size-4" /> Add Product
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
          </div>
          <Select value={filterCat || '__all'} onValueChange={v => setFilterCat(v === '__all' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No products found</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={getImageUrl(p.images[0])} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full bg-secondary flex items-center justify-center text-muted-foreground text-xs">No img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1 max-w-[160px]">{p.name}</p>
                          {p.is_featured && <Badge variant="secondary" className="text-[10px] mt-0.5"><Star className="size-2.5 mr-0.5" />Featured</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <span>{p.subcategory?.category?.name}</span>
                      <span className="text-xs block">{p.subcategory?.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">₹{p.price.toLocaleString('en-IN')}</p>
                      {p.sale_price && (
                        <p className="text-xs text-primary">Sale: ₹{p.sale_price.toLocaleString('en-IN')}</p>
                      )}
                      {p.discount_percentage > 0 && (
                        <p className="text-xs text-green-600">{p.discount_percentage}% off</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={p.stock_qty === 0 ? 'text-destructive' : p.stock_qty <= 5 ? 'text-orange-500' : ''}>
                        {p.stock_qty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={() => toggleActive(p)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(p)}>
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: p.slug || slugify(e.target.value) }))} placeholder="Product name" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>Category / Subcategory *</Label>
                <Select value={form.subcategory_id} onValueChange={v => setForm(p => ({ ...p, subcategory_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <React.Fragment key={cat.id}>
                        <SelectItem value={`__${cat.id}`} disabled className="font-semibold text-xs uppercase text-muted-foreground">
                          {cat.name}
                        </SelectItem>
                        {subcategories.filter(s => s.category_id === cat.id).map(sub => (
                          <SelectItem key={sub.id} value={sub.id} className="pl-6">
                            {sub.name}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Sale Price (₹)</Label>
                <Input type="number" value={form.sale_price} onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))} placeholder="Leave blank if no sale" />
              </div>
              <div className="space-y-1.5">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={form.discount_percentage}
                  onChange={e => {
                    const val = Math.max(0, parseInt(e.target.value) || 0)
                    setForm(p => ({ ...p, discount_percentage: String(val) }))
                  }}
                  min={0}
                  placeholder="0"
                />
                <p className="text-[10px] text-muted-foreground">Enter any percentage (e.g., 10, 25, 50)</p>
              </div>
              <div className="space-y-1.5">
                <Label>Stock Quantity</Label>
                <Input type="number" value={form.stock_qty} onChange={e => setForm(p => ({ ...p, stock_qty: e.target.value }))} min="0" />
              </div>
              <div className="space-y-1.5">
                <Label>Tags (comma separated)</Label>
                <Input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="trendy, summer, bestseller" />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <Label>Product Images</Label>

              {/* Drag-drop upload area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50',
                  uploading && 'opacity-50 pointer-events-none'
                )}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-12 rounded-full bg-secondary flex items-center justify-center">
                      <ImagePlus className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Drop images here or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">Select multiple files to upload at once</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image preview grid */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative aspect-square group">
                      <img
                        src={img.startsWith('http') ? img : getImageUrl(img)}
                        alt={`Product ${i + 1}`}
                        className="size-full rounded-lg object-cover border bg-secondary"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 size-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* URL input fallback */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Or paste image URLs:</p>
                <Input
                  placeholder="https://example.com/image.jpg (press Enter to add)"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const url = (e.target as HTMLInputElement).value.trim()
                      if (url) {
                        setForm(p => ({ ...p, images: [...p.images, url] }))
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the product.</AlertDialogDescription>
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
