import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, MoreVertical, Trash2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ResourceItem {
  id: string;
  name: string;
  location: string;
  quantity: number;
}

interface ResourceRequirement {
  id: string;
  name: string;
  required: number;
  have: number;
  need: number;
  items: ResourceItem[];
}

const USCG_LOCATIONS = [
  'Base Seattle',
  'Base Alameda',
  'Base San Diego',
  'Station Cape Cod',
  'Station Miami Beach',
  'Station New York',
  'Cutter Healy',
  'Cutter Polar Star',
  'Cutter Bertholf',
  'Air Station San Francisco',
  'Air Station Miami',
  'Air Station Kodiak',
  'Sector New York',
  'Sector Los Angeles',
  'Sector Boston',
  'District 7 HQ',
  'District 11 HQ',
  'District 13 HQ',
  'Training Center Cape May',
  'Academy New London',
];

const initialResources: ResourceRequirement[] = [
  {
    id: '1',
    name: 'Personnel',
    required: 50,
    have: 35,
    need: 15,
    items: [
      { id: '1-1', name: 'Medical Officers', location: 'Base Seattle', quantity: 3 },
      { id: '1-2', name: 'Communications Specialists', location: 'Station Cape Cod', quantity: 8 },
      { id: '1-3', name: 'Operations Personnel', location: 'Air Station Miami', quantity: 15 },
      { id: '1-4', name: 'Support Staff', location: 'Sector New York', quantity: 9 },
    ],
  },
  {
    id: '2',
    name: 'Equipment',
    required: 120,
    have: 80,
    need: 40,
    items: [
      { id: '2-1', name: 'Rescue Boats', location: 'Base Alameda', quantity: 6 },
      { id: '2-2', name: 'Communication Devices', location: 'Cutter Healy', quantity: 35 },
      { id: '2-3', name: 'Medical Kits', location: 'Station Miami Beach', quantity: 20 },
      { id: '2-4', name: 'Safety Gear', location: 'Air Station Kodiak', quantity: 19 },
    ],
  },
  {
    id: '3',
    name: 'Supplies',
    required: 200,
    have: 150,
    need: 50,
    items: [
      { id: '3-1', name: 'Food Rations', location: 'District 7 HQ', quantity: 80 },
      { id: '3-2', name: 'Water Supply', location: 'Cutter Bertholf', quantity: 40 },
      { id: '3-3', name: 'Fuel', location: 'Base San Diego', quantity: 30 },
    ],
  },
];

export function ResourceRequirementsTable() {
  const [resources, setResources] = useState<ResourceRequirement[]>(initialResources);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({ name: '', required: 0, have: 0, need: 0 });

  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editResourceData, setEditResourceData] = useState<{
    name: string;
    required: number;
    have: number;
    need: number;
  } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<{
    name: string;
    location: string;
    quantity: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddResource = () => {
    if (newResource.name.trim()) {
      const resource: ResourceRequirement = {
        id: String(resources.length + 1),
        name: newResource.name,
        required: newResource.required,
        have: newResource.have,
        need: newResource.need,
        items: [],
      };
      setResources([...resources, resource]);
      setNewResource({ name: '', required: 0, have: 0, need: 0 });
      setIsAddingResource(false);
    }
  };

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((res) => res.id !== id));
  };



  const handleDeleteItem = (resourceId: string, itemId: string) => {
    setResources((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          return {
            ...res,
            items: res.items.filter((item) => item.id !== itemId),
          };
        }
        return res;
      })
    );
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources((prev) => {
      const next = new Set(prev);
      if (next.has(resourceId)) {
        next.delete(resourceId);
      } else {
        next.add(resourceId);
      }
      return next;
    });
  };

  const toggleItemSelection = (resourceId: string, itemId: string) => {
    const key = `${resourceId}-${itemId}`;
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllResources = () => {
    if (selectedResources.size === resources.length) {
      setSelectedResources(new Set());
    } else {
      setSelectedResources(new Set(resources.map((res) => res.id)));
    }
  };

  const toggleAllItemsForResource = (resourceId: string) => {
    const resource = resources.find((res) => res.id === resourceId);
    if (!resource) return;

    const itemKeys = resource.items.map((item) => `${resourceId}-${item.id}`);
    const allSelected = itemKeys.every((key) => selectedItems.has(key));

    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        itemKeys.forEach((key) => next.delete(key));
      } else {
        itemKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  const areAllItemsSelected = (resourceId: string): boolean => {
    const resource = resources.find((res) => res.id === resourceId);
    if (!resource || resource.items.length === 0) return false;

    const itemKeys = resource.items.map((item) => `${resourceId}-${item.id}`);
    return itemKeys.every((key) => selectedItems.has(key));
  };

  const areSomeItemsSelected = (resourceId: string): boolean => {
    const resource = resources.find((res) => res.id === resourceId);
    if (!resource || resource.items.length === 0) return false;

    const itemKeys = resource.items.map((item) => `${resourceId}-${item.id}`);
    return itemKeys.some((key) => selectedItems.has(key)) && !areAllItemsSelected(resourceId);
  };

  const handleBulkDelete = () => {
    const remainingResources = resources
      .filter((res) => !selectedResources.has(res.id))
      .map((res) => {
        const remainingItems = res.items.filter(
          (item) => !selectedItems.has(`${res.id}-${item.id}`)
        );
        return {
          ...res,
          items: remainingItems,
        };
      });

    setResources(remainingResources);
    setSelectedResources(new Set());
    setSelectedItems(new Set());
  };

  const totalSelected = selectedResources.size + selectedItems.size;

  const filteredResources = resources.filter((resource) => {
    const resourceMatches = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemMatches = resource.items.some((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return resourceMatches || itemMatches;
  });

  const handleEditResource = (resource: ResourceRequirement) => {
    setEditingResourceId(resource.id);
    setEditResourceData({
      name: resource.name,
      required: resource.required,
      have: resource.have,
      need: resource.need,
    });
  };

  const handleSaveResource = () => {
    if (editResourceData && editResourceData.name.trim() && editingResourceId) {
      setResources((prev) =>
        prev.map((res) =>
          res.id === editingResourceId
            ? {
                ...res,
                name: editResourceData.name,
                required: editResourceData.required,
                have: editResourceData.have,
                need: editResourceData.need,
              }
            : res
        )
      );
      setEditingResourceId(null);
      setEditResourceData(null);
    }
  };

  const handleCancelEditResource = () => {
    setEditingResourceId(null);
    setEditResourceData(null);
  };

  const handleEditItem = (resourceId: string, item: ResourceItem) => {
    setEditingItemId(`${resourceId}-${item.id}`);
    setEditItemData({
      name: item.name,
      location: item.location,
      quantity: item.quantity,
    });
  };

  const handleSaveEditItem = (resourceId: string, itemId: string) => {
    if (editItemData && editItemData.name.trim()) {
      setResources((prev) =>
        prev.map((res) => {
          if (res.id === resourceId) {
            return {
              ...res,
              items: res.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      name: editItemData.name,
                      location: editItemData.location,
                      quantity: editItemData.quantity,
                    }
                  : item
              ),
            };
          }
          return res;
        })
      );
      setEditingItemId(null);
      setEditItemData(null);
    }
  };



  const handleCancelEditItem = () => {
    setEditingItemId(null);
    setEditItemData(null);
  };

  const handleAssignToIncident = (resourceId: string, itemId: string) => {
    console.log(`Assigning item ${itemId} from resource ${resourceId} to incident`);
    // Add your incident assignment logic here
  };

  const handleBulkAssignToIncident = () => {
    const selectedItemsList = Array.from(selectedItems);
    console.log(`Bulk assigning ${selectedItemsList.length} items to incident:`, selectedItemsList);
    // Add your bulk incident assignment logic here
  };

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg shadow-elevation-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <h2 className="text-card-foreground">Resource Requirements</h2>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input-background border-border"
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {totalSelected > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-primary/10 border-b border-border">
          <span className="text-sm text-card-foreground">
            {totalSelected} {totalSelected === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex gap-2">
            {selectedItems.size > 0 && (
              <Button
                size="sm"
                onClick={handleBulkAssignToIncident}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Assign to Incident
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '48px' }} />
            <col style={{ width: '48px' }} />
            <col style={{ width: '400px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '48px' }} />
          </colgroup>
          <thead className="bg-card sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <Checkbox
                  checked={resources.length > 0 && selectedResources.size === resources.length}
                  onCheckedChange={toggleAllResources}
                  aria-label="Select all resources"
                />
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground"></th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <div className="flex items-center gap-3">
                  <span>Resource Requirement</span>
                  <Button
                    onClick={() => setIsAddingResource(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 px-3"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Requirement
                  </Button>
                </div>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Required</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Have in USCG Organization</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Need</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Actions</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Resource Row */}
            {isAddingResource && (
              <tr className="border-b border-border bg-card/50">
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4" colSpan={6}>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        placeholder="Enter resource name..."
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddResource();
                          } else if (e.key === 'Escape') {
                            setIsAddingResource(false);
                            setNewResource({ name: '', required: 0, have: 0, need: 0 });
                          }
                        }}
                        autoFocus
                        className="bg-input-background border-border"
                      />
                      <Input
                        type="number"
                        placeholder="Required"
                        value={newResource.required || ''}
                        onChange={(e) =>
                          setNewResource({ ...newResource, required: parseInt(e.target.value) || 0 })
                        }
                        className="bg-input-background border-border"
                      />
                      <Input
                        type="number"
                        placeholder="Have"
                        value={newResource.have || ''}
                        onChange={(e) =>
                          setNewResource({ ...newResource, have: parseInt(e.target.value) || 0 })
                        }
                        className="bg-input-background border-border"
                      />
                      <Input
                        type="number"
                        placeholder="Need"
                        value={newResource.need || ''}
                        onChange={(e) =>
                          setNewResource({ ...newResource, need: parseInt(e.target.value) || 0 })
                        }
                        className="bg-input-background border-border"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddResource}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingResource(false);
                          setNewResource({ name: '', required: 0, have: 0, need: 0 });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* Resources and Items */}
            {filteredResources.map((resource) => (
              <React.Fragment key={resource.id}>
                {/* Resource Row */}
                {editingResourceId === resource.id && editResourceData ? (
                  <tr className="border-b border-border bg-card/50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedResources.has(resource.id)}
                        onCheckedChange={() => toggleResourceSelection(resource.id)}
                        aria-label={`Select ${resource.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="p-1 hover:bg-muted/20 rounded transition-colors"
                        onClick={() => toggleRow(resource.id)}
                      >
                        {expandedRows.has(resource.id) ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-3">
                        <Input
                          value={editResourceData.name}
                          onChange={(e) =>
                            setEditResourceData({ ...editResourceData, name: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveResource();
                            } else if (e.key === 'Escape') {
                              handleCancelEditResource();
                            }
                          }}
                          autoFocus
                          className="bg-input-background border-border"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveResource}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditResource}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={editResourceData.required}
                        onChange={(e) =>
                          setEditResourceData({
                            ...editResourceData,
                            required: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-input-background border-border w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={editResourceData.have}
                        onChange={(e) =>
                          setEditResourceData({
                            ...editResourceData,
                            have: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-input-background border-border w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={editResourceData.need}
                        onChange={(e) =>
                          setEditResourceData({
                            ...editResourceData,
                            need: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-input-background border-border w-full"
                      />
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ) : (
                  <tr
                    className="border-b border-border hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => toggleRow(resource.id)}
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedResources.has(resource.id)}
                        onCheckedChange={() => toggleResourceSelection(resource.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${resource.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="p-1 hover:bg-muted/20 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(resource.id);
                        }}
                      >
                        {expandedRows.has(resource.id) ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-card-foreground">{resource.name}</span>
                        <span className="caption text-muted-foreground">
                          {resource.items.length} {resource.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-card-foreground">{resource.required}</td>
                    <td className="px-6 py-4 text-card-foreground">{resource.have}</td>
                    <td className="px-6 py-4 text-card-foreground">{resource.need}</td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Requesting resource: ${resource.name}`);
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Request
                      </Button>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                          <DropdownMenuItem onClick={() => handleEditResource(resource)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )}

                {/* Child Items - when expanded */}
                {expandedRows.has(resource.id) && (
                  <>
                    {/* Items Header Row */}
                    <tr className="bg-muted/5 border-b border-border/50">
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2">
                        <Checkbox
                          checked={
                            areSomeItemsSelected(resource.id)
                              ? "indeterminate"
                              : areAllItemsSelected(resource.id)
                          }
                          onCheckedChange={() => toggleAllItemsForResource(resource.id)}
                          aria-label={`Select all items for ${resource.name}`}
                        />
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-xs font-medium text-foreground">Item ID</span>
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-xs font-medium text-foreground">Location</span>
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-xs font-medium text-foreground">Quantity</span>
                      </td>
                      <td className="px-6 py-2">
                        <span className="text-xs font-medium text-foreground">Actions</span>
                      </td>
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2"></td>
                    </tr>


                    {/* Item Rows */}
                    {resource.items
                      .filter((item) =>
                        searchQuery === '' ||
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        resource.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => {
                        const itemKey = `${resource.id}-${item.id}`;
                        const isEditing = editingItemId === itemKey;

                        return isEditing && editItemData ? (
                          <tr
                            key={item.id}
                            className="border-b border-border/30 last:border-b-0 bg-card/50"
                          >
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3">
                              <Checkbox
                                checked={selectedItems.has(itemKey)}
                                onCheckedChange={() => toggleItemSelection(resource.id, item.id)}
                                aria-label={`Select ${item.name}`}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                value={editItemData.name}
                                onChange={(e) =>
                                  setEditItemData({ ...editItemData, name: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEditItem(resource.id, item.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEditItem();
                                  }
                                }}
                                className="bg-input-background border-border"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <Select
                                value={editItemData.location}
                                onValueChange={(value: string) =>
                                  setEditItemData({ ...editItemData, location: value })
                                }
                              >
                                <SelectTrigger className="w-full bg-input-background border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover text-popover-foreground">
                                  {USCG_LOCATIONS.map((loc) => (
                                    <SelectItem key={loc} value={loc}>
                                      {loc}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-6 py-3">
                              <Input
                                type="number"
                                value={editItemData.quantity}
                                onChange={(e) =>
                                  setEditItemData({
                                    ...editItemData,
                                    quantity: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="bg-input-background border-border"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAssignToIncident(resource.id, item.id)}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  Assign to Incident
                                </Button>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEditItem(resource.id, item.id)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEditItem}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                                  <DropdownMenuItem onClick={() => handleEditItem(resource.id, item)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteItem(resource.id, item.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={item.id}
                            className="border-b border-border/30 last:border-b-0 hover:bg-muted/5 transition-colors"
                          >
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3">
                              <Checkbox
                                checked={selectedItems.has(itemKey)}
                                onCheckedChange={() => toggleItemSelection(resource.id, item.id)}
                                aria-label={`Select ${item.name}`}
                              />
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm text-card-foreground">{item.name}</span>
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm text-card-foreground">{item.location}</span>
                            </td>
                            <td className="px-6 py-3">
                              <span className="text-sm text-card-foreground">{item.quantity}</span>
                            </td>
                            <td className="px-6 py-3">
                              <Button
                                size="sm"
                                onClick={() => handleAssignToIncident(resource.id, item.id)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                Assign to Incident
                              </Button>
                            </td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                                  <DropdownMenuItem onClick={() => handleEditItem(resource.id, item)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteItem(resource.id, item.id)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
        <span className="text-sm text-muted-foreground">
          {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
        </span>
        <span className="text-sm text-muted-foreground">
          {resources.reduce((acc, res) => acc + res.items.length, 0)} total items
        </span>
      </div>
    </div>
  );
}
