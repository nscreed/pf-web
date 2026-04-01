"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useCategories, type Category } from "@/hooks/use-categories";
import apiClient from "@/lib/api-client";

export function CategoriesSection() {
  const { categories, loading, refresh } = useCategories();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formType, setFormType] = useState<string>("expense");
  const [formSaving, setFormSaving] = useState(false);

  const systemCats = categories.filter((c) => c.isSystem);
  const userCats = categories.filter((c) => !c.isSystem);

  function openAdd() {
    setEditCat(null);
    setFormName("");
    setFormIcon("");
    setFormType("expense");
    setFormOpen(true);
  }

  function openEdit(cat: Category) {
    setEditCat(cat);
    setFormName(cat.name);
    setFormIcon(cat.icon || "");
    setFormType(cat.type);
    setFormOpen(true);
  }

  async function handleFormSave() {
    setFormSaving(true);
    try {
      const body = { name: formName, icon: formIcon || undefined, type: formType };
      if (editCat) {
        await apiClient.patch(`/api/categories/${editCat.id}`, body);
      } else {
        await apiClient.post("/api/categories", body);
      }
      setFormOpen(false);
      refresh();
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiClient.delete(`/api/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      refresh();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setDeleteError(msg || "Cannot delete this category");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* System categories */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              System categories
            </p>
            <div className="space-y-1">
              {systemCats.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {cat.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* User categories */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                Your categories
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={openAdd}
                className="cursor-pointer"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            {userCats.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No custom categories yet
              </p>
            ) : (
              <div className="space-y-1">
                {userCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                  >
                    <span>{cat.icon || "📦"}</span>
                    <span>{cat.name}</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px]"
                    >
                      {cat.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(cat)}
                      className="h-7 w-7 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteTarget(cat);
                      }}
                      className="h-7 w-7 cursor-pointer text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icon (emoji)</Label>
              <Input
                id="cat-icon"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                maxLength={10}
                placeholder="e.g. 💪"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v ?? "expense")}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) => value || "Select type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense" label="Expense">Expense</SelectItem>
                  <SelectItem value="income" label="Income">Income</SelectItem>
                  <SelectItem value="both" label="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              }
            />
            <Button
              onClick={handleFormSave}
              disabled={formSaving || !formName}
              className="cursor-pointer"
            >
              {formSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editCat ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
