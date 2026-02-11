import React, { useState } from 'react';
import { Plus, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

interface IncidentObjective {
  id: string;
  name: string;
}

const initialObjectives: IncidentObjective[] = [
  {
    id: '1',
    name: 'Establish incident command structure and unified command',
  },
  {
    id: '2',
    name: 'Ensure safety of all responders and affected populations',
  },
  {
    id: '3',
    name: 'Conduct search and rescue operations in affected areas',
  },
  {
    id: '4',
    name: 'Provide emergency medical care and transport to injured',
  },
  {
    id: '5',
    name: 'Secure the incident scene and establish perimeter control',
  },
];

export function IncidentObjectivesTable() {
  const [objectives, setObjectives] = useState<IncidentObjective[]>(initialObjectives);
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [newObjectiveName, setNewObjectiveName] = useState('');
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [editObjectiveName, setEditObjectiveName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const handleAddObjective = () => {
    if (newObjectiveName.trim()) {
      const newObjective: IncidentObjective = {
        id: String(Date.now()),
        name: newObjectiveName,
      };
      setObjectives([...objectives, newObjective]);
      setNewObjectiveName('');
      setIsAddingObjective(false);
    }
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives(objectives.filter((obj) => obj.id !== id));
    setSelectedObjectives((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleObjectiveSelection = (objectiveId: string) => {
    setSelectedObjectives((prev) => {
      const next = new Set(prev);
      if (next.has(objectiveId)) {
        next.delete(objectiveId);
      } else {
        next.add(objectiveId);
      }
      return next;
    });
  };

  const toggleAllObjectives = () => {
    if (selectedObjectives.size === sortedObjectives.length) {
      setSelectedObjectives(new Set());
    } else {
      setSelectedObjectives(new Set(sortedObjectives.map((obj) => obj.id)));
    }
  };

  const handleBulkDelete = () => {
    setObjectives(objectives.filter((obj) => !selectedObjectives.has(obj.id)));
    setSelectedObjectives(new Set());
  };

  const toggleSort = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };

  const filteredObjectives = objectives.filter((objective) =>
    objective.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedObjectives = sortOrder
    ? [...filteredObjectives].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      })
    : filteredObjectives;

  const handleEditObjective = (objective: IncidentObjective) => {
    setEditingObjectiveId(objective.id);
    setEditObjectiveName(objective.name);
  };

  const handleSaveObjective = () => {
    if (editObjectiveName.trim() && editingObjectiveId) {
      setObjectives((prev) =>
        prev.map((obj) =>
          obj.id === editingObjectiveId ? { ...obj, name: editObjectiveName } : obj
        )
      );
      setEditingObjectiveId(null);
      setEditObjectiveName('');
    }
  };

  const handleCancelEditObjective = () => {
    setEditingObjectiveId(null);
    setEditObjectiveName('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg shadow-elevation-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-card-foreground">Incident Objectives</h2>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input-background border-border"
            />
          </div>
        </div>
        <Button
          onClick={() => setIsAddingObjective(true)}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Objective
        </Button>
      </div>

      {/* Bulk Action Bar */}
      {selectedObjectives.size > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-primary/10 border-b border-border">
          <span className="text-sm text-card-foreground">
            {selectedObjectives.size} {selectedObjectives.size === 1 ? 'objective' : 'objectives'} selected
          </span>
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
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-card sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground w-12">
                <Checkbox
                  checked={sortedObjectives.length > 0 && selectedObjectives.size === sortedObjectives.length}
                  onCheckedChange={toggleAllObjectives}
                  aria-label="Select all objectives"
                />
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <button
                  onClick={toggleSort}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span>Objective</span>
                  {sortOrder === null && <ArrowUpDown className="w-4 h-4 text-muted-foreground" />}
                  {sortOrder === 'asc' && <ArrowUp className="w-4 h-4 text-primary" />}
                  {sortOrder === 'desc' && <ArrowDown className="w-4 h-4 text-primary" />}
                </button>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground w-12"></th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Objective Row */}
            {isAddingObjective && (
              <tr className="border-b border-border bg-card/50">
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-3">
                    <Input
                      placeholder="Enter objective description..."
                      value={newObjectiveName}
                      onChange={(e) => setNewObjectiveName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddObjective();
                        } else if (e.key === 'Escape') {
                          setIsAddingObjective(false);
                          setNewObjectiveName('');
                        }
                      }}
                      autoFocus
                      className="bg-input-background border-border"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddObjective}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingObjective(false);
                          setNewObjectiveName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            )}

            {/* Objectives */}
            {sortedObjectives.map((objective) => (
              <React.Fragment key={objective.id}>
                {/* Objective Row */}
                {editingObjectiveId === objective.id ? (
                  <tr className="border-b border-border bg-card/50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedObjectives.has(objective.id)}
                        onCheckedChange={() => toggleObjectiveSelection(objective.id)}
                        aria-label={`Select ${objective.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-3">
                        <Input
                          value={editObjectiveName}
                          onChange={(e) => setEditObjectiveName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveObjective();
                            } else if (e.key === 'Escape') {
                              handleCancelEditObjective();
                            }
                          }}
                          autoFocus
                          className="bg-input-background border-border"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveObjective}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditObjective}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ) : (
                  <tr 
                    className="border-b border-border hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => handleEditObjective(objective)}
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedObjectives.has(objective.id)}
                        onCheckedChange={() => toggleObjectiveSelection(objective.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${objective.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-card-foreground">{objective.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditObjective(objective);
                          }}
                          aria-label={`Edit ${objective.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteObjective(objective.id);
                          }}
                          aria-label={`Delete ${objective.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card">
        <span className="text-sm text-muted-foreground">
          {objectives.length} {objectives.length === 1 ? 'objective' : 'objectives'}
        </span>
      </div>
    </div>
  );
}
