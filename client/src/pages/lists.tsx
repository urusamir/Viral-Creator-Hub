import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth.provider";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useLocation } from "wouter";
import { formatDisplayDate } from "@/utils/format";
import {
  fetchLists,
  createList,
  deleteList,
  renameList,
  type CreatorList,
} from "@/services";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ListChecks,
  FolderOpen,
} from "lucide-react";

export default function ListsPage() {
  const { user } = useAuth();
  const prefetched = usePrefetchedData();
  const [, setLocation] = useLocation();
  const [lists, setLists] = useState<CreatorList[]>(() => prefetched.lists);
  const [isLoading, setIsLoading] = useState(() => prefetched.lists.length === 0);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const loadLists = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchLists(user.id);
      setLists(data);
    } catch (err) {
      console.error("[loadLists] error:", err);
    } finally {
      // ALWAYS clear loading state, even on failure
      setIsLoading(false);
    }
  };

  // Sync from prefetch provider when it updates
  useEffect(() => {
    if (prefetched.lists.length > 0 || lists.length === 0) {
      setLists(prefetched.lists);
      setIsLoading(false);
    }
  }, [prefetched.lists]);

  useEffect(() => {
    // Skip initial load if we have pre-fetched data
    if (lists.length > 0) {
      setIsLoading(false);
      return;
    }
    loadLists();

    const handler = () => loadLists();
    window.addEventListener("vairal-lists-updated", handler);
    return () => window.removeEventListener("vairal-lists-updated", handler);
  }, [user?.id]);

  const handleCreate = async () => {
    if (!user?.id || !newListName.trim()) return;
    setIsCreating(true);
    try {
      await createList(user.id, newListName.trim());
      setNewListName("");
      setShowCreateInput(false);
      await loadLists();
    } catch (err) {
      console.error("[handleCreate] error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateClick = () => {
    if (showCreateInput && newListName.trim()) {
      handleCreate();
    } else {
      setShowCreateInput(true);
      // Focus the input after a tick
      setTimeout(() => {
        const input = document.querySelector('[data-testid="input-new-list-name"]') as HTMLInputElement;
        input?.focus();
      }, 50);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this list? This action cannot be undone.")) return;
    await deleteList(id);
    await loadLists();
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    await renameList(id, editName.trim());
    setEditingId(null);
    await loadLists();
  };

  const startEdit = (list: CreatorList, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(list.id);
    setEditName(list.name);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl glass-card border border-white/5 bg-gradient-to-br from-blue-500/10 via-background to-violet-500/5 p-8 lg:p-10">
        <div className="absolute top-0 right-0 -m-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -m-16 w-56 h-56 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" data-testid="text-lists-title">
              My Lists
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2 leading-relaxed">
              Organise creators into curated shortlists. Import them directly into campaigns or export as CSV for reporting.
            </p>
          </div>
          <Button onClick={handleCreateClick} data-testid="button-create-list-header" className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            Create List
          </Button>
        </div>
      </div>


      {/* Create New List — inline form that appears on button click */}
      {showCreateInput && (
        <Card className="p-4 mb-6 bg-card border-border border-blue-500/30 animate-in slide-in-from-top-2 duration-200">
          <div className="flex gap-3">
            <Input
              placeholder="Enter list name (e.g. Winter Campaign, Ramadan 2026…)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") { setShowCreateInput(false); setNewListName(""); }
              }}
              autoFocus
              className="flex-1"
              data-testid="input-new-list-name"
            />
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newListName.trim()}
              data-testid="button-create-list"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setShowCreateInput(false); setNewListName(""); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Lists Grid */}
      {isLoading ? (
        /* Inline skeleton cards — header already visible */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="relative p-5 bg-card border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-24 bg-muted rounded animate-pulse mt-3" />
            </Card>
          ))}
        </div>
      ) : lists.length === 0 ? (
        <Card className="p-12 bg-card border-border text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No lists yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Create your first list to start organizing creators for your campaigns.
          </p>
          <Button onClick={() => { setShowCreateInput(true); setTimeout(() => {
            const input = document.querySelector('[data-testid="input-new-list-name"]') as HTMLInputElement;
            input?.focus();
          }, 50); }}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Your First List
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <Card
              key={list.id}
              onClick={() => setLocation(`/dashboard/lists/${list.id}`)}
              className="relative p-5 bg-card border-border cursor-pointer hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 group"
              data-testid={`card-list-${list.id}`}
            >
              {editingId === list.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(list.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="text-sm"
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleRename(list.id)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {list.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {list.member_count || 0} creator{(list.member_count || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => startEdit(list, e)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={(e) => handleDelete(list.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Created {formatDisplayDate(list.created_at)}
                  </p>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
