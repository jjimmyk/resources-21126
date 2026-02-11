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

interface Action {
  id: string;
  name: string;
  status: 'current' | 'planned';
  time: {
    date: string;
    time: string;
    timezone: string;
  };
}

interface Objective {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  actions: Action[];
}

const initialObjectives: Objective[] = [
  {
    id: '1',
    name: 'Launch Q1 Product Release',
    status: 'in-progress',
    progress: 65,
    actions: [
      { 
        id: '1-1', 
        name: 'Complete feature development', 
        status: 'current', 
        time: { date: '2025-01-15', time: '14:00', timezone: 'PST' }
      },
      { 
        id: '1-2', 
        name: 'Conduct user testing', 
        status: 'current', 
        time: { date: '2025-01-20', time: '10:00', timezone: 'PST' }
      },
      { 
        id: '1-3', 
        name: 'Prepare marketing materials', 
        status: 'planned', 
        time: { date: '2025-01-25', time: '09:00', timezone: 'PST' }
      },
    ],
  },
  {
    id: '2',
    name: 'Improve Customer Satisfaction Score',
    status: 'in-progress',
    progress: 40,
    actions: [
      { 
        id: '2-1', 
        name: 'Implement feedback system', 
        status: 'current', 
        time: { date: '2025-01-10', time: '11:00', timezone: 'EST' }
      },
      { 
        id: '2-2', 
        name: 'Train support team', 
        status: 'current', 
        time: { date: '2025-01-18', time: '13:30', timezone: 'EST' }
      },
      { 
        id: '2-3', 
        name: 'Analyze customer data', 
        status: 'planned', 
        time: { date: '2025-01-28', time: '15:00', timezone: 'EST' }
      },
    ],
  },
  {
    id: '3',
    name: 'Expand to European Market',
    status: 'pending',
    progress: 15,
    actions: [
      { 
        id: '3-1', 
        name: 'Market research', 
        status: 'current', 
        time: { date: '2025-01-22', time: '09:00', timezone: 'CET' }
      },
      { 
        id: '3-2', 
        name: 'Legal compliance review', 
        status: 'planned', 
        time: { date: '2025-02-05', time: '10:00', timezone: 'CET' }
      },
      { 
        id: '3-3', 
        name: 'Partner identification', 
        status: 'planned', 
        time: { date: '2025-02-15', time: '14:00', timezone: 'CET' }
      },
    ],
  },
];

export function ObjectivesTable() {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [newObjectiveName, setNewObjectiveName] = useState('');
  const [addingActionToObjective, setAddingActionToObjective] = useState<string | null>(null);
  const [newActionName, setNewActionName] = useState('');
  const [newActionStatus, setNewActionStatus] = useState<'current' | 'planned'>('planned');
  const [newActionTime, setNewActionTime] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    timezone: 'PST',
  });
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [editObjectiveName, setEditObjectiveName] = useState('');
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editActionData, setEditActionData] = useState<{
    name: string;
    status: 'current' | 'planned';
    time: { date: string; time: string; timezone: string };
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

  const handleAddObjective = () => {
    if (newObjectiveName.trim()) {
      const newObjective: Objective = {
        id: String(objectives.length + 1),
        name: newObjectiveName,
        status: 'pending',
        progress: 0,
        actions: [],
      };
      setObjectives([...objectives, newObjective]);
      setNewObjectiveName('');
      setIsAddingObjective(false);
    }
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives(objectives.filter((obj) => obj.id !== id));
  };

  const handleAddAction = (objectiveId: string) => {
    setAddingActionToObjective(objectiveId);
    // Ensure the row is expanded when adding an action
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.add(objectiveId);
      return next;
    });
  };

  const handleSaveAction = (objectiveId: string) => {
    if (newActionName.trim()) {
      setObjectives((prev) =>
        prev.map((obj) => {
          if (obj.id === objectiveId) {
            const newAction: Action = {
              id: `${objectiveId}-${obj.actions.length + 1}`,
              name: newActionName,
              status: newActionStatus,
              time: newActionTime,
            };
            return {
              ...obj,
              actions: [...obj.actions, newAction],
            };
          }
          return obj;
        })
      );
      setNewActionName('');
      setNewActionStatus('planned');
      setNewActionTime({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        timezone: 'PST',
      });
      setAddingActionToObjective(null);
    }
  };

  const handleStatusChange = (objectiveId: string, actionId: string, newStatus: 'current' | 'planned') => {
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id === objectiveId) {
          return {
            ...obj,
            actions: obj.actions.map((action) =>
              action.id === actionId ? { ...action, status: newStatus } : action
            ),
          };
        }
        return obj;
      })
    );
  };

  const handleCancelAddAction = () => {
    setNewActionName('');
    setNewActionStatus('planned');
    setNewActionTime({
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      timezone: 'PST',
    });
    setAddingActionToObjective(null);
  };

  const handleDeleteAction = (objectiveId: string, actionId: string) => {
    setObjectives((prev) =>
      prev.map((obj) => {
        if (obj.id === objectiveId) {
          return {
            ...obj,
            actions: obj.actions.filter((action) => action.id !== actionId),
          };
        }
        return obj;
      })
    );
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

  const toggleActionSelection = (objectiveId: string, actionId: string) => {
    const key = `${objectiveId}-${actionId}`;
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllObjectives = () => {
    if (selectedObjectives.size === objectives.length) {
      setSelectedObjectives(new Set());
    } else {
      setSelectedObjectives(new Set(objectives.map((obj) => obj.id)));
    }
  };

  const toggleAllActionsForObjective = (objectiveId: string) => {
    const objective = objectives.find((obj) => obj.id === objectiveId);
    if (!objective) return;

    const actionKeys = objective.actions.map((action) => `${objectiveId}-${action.id}`);
    const allSelected = actionKeys.every((key) => selectedActions.has(key));

    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        // Deselect all actions for this objective
        actionKeys.forEach((key) => next.delete(key));
      } else {
        // Select all actions for this objective
        actionKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  const areAllActionsSelected = (objectiveId: string): boolean => {
    const objective = objectives.find((obj) => obj.id === objectiveId);
    if (!objective || objective.actions.length === 0) return false;

    const actionKeys = objective.actions.map((action) => `${objectiveId}-${action.id}`);
    return actionKeys.every((key) => selectedActions.has(key));
  };

  const areSomeActionsSelected = (objectiveId: string): boolean => {
    const objective = objectives.find((obj) => obj.id === objectiveId);
    if (!objective || objective.actions.length === 0) return false;

    const actionKeys = objective.actions.map((action) => `${objectiveId}-${action.id}`);
    return actionKeys.some((key) => selectedActions.has(key)) && !areAllActionsSelected(objectiveId);
  };

  const handleBulkDelete = () => {
    // Delete selected objectives
    const remainingObjectives = objectives
      .filter((obj) => !selectedObjectives.has(obj.id))
      .map((obj) => {
        // Delete selected actions within each remaining objective
        const remainingActions = obj.actions.filter(
          (action) => !selectedActions.has(`${obj.id}-${action.id}`)
        );
        return {
          ...obj,
          actions: remainingActions,
        };
      });

    setObjectives(remainingObjectives);
    setSelectedObjectives(new Set());
    setSelectedActions(new Set());
  };

  const totalSelected = selectedObjectives.size + selectedActions.size;

  // Filter objectives and actions based on search query
  const filteredObjectives = objectives.filter((objective) => {
    const objectiveMatches = objective.name.toLowerCase().includes(searchQuery.toLowerCase());
    const actionMatches = objective.actions.some((action) =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return objectiveMatches || actionMatches;
  });

  const handleEditObjective = (objective: Objective) => {
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

  const handleEditAction = (objectiveId: string, action: Action) => {
    setEditingActionId(`${objectiveId}-${action.id}`);
    setEditActionData({
      name: action.name,
      status: action.status,
      time: { ...action.time },
    });
  };

  const handleSaveEditAction = (objectiveId: string, actionId: string) => {
    if (editActionData && editActionData.name.trim()) {
      setObjectives((prev) =>
        prev.map((obj) => {
          if (obj.id === objectiveId) {
            return {
              ...obj,
              actions: obj.actions.map((action) =>
                action.id === actionId
                  ? {
                      ...action,
                      name: editActionData.name,
                      status: editActionData.status,
                      time: editActionData.time,
                    }
                  : action
              ),
            };
          }
          return obj;
        })
      );
      setEditingActionId(null);
      setEditActionData(null);
    }
  };

  const handleCancelEditAction = () => {
    setEditingActionId(null);
    setEditActionData(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg shadow-elevation-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border">
        <h2 className="text-card-foreground">Initial Response Objectives</h2>
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search objectives and actions..."
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
                  checked={objectives.length > 0 && selectedObjectives.size === objectives.length}
                  onCheckedChange={toggleAllObjectives}
                  aria-label="Select all objectives"
                />
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground w-12"></th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <div className="flex items-center gap-3">
                  <span>Objectives</span>
                  <Button
                    onClick={() => setIsAddingObjective(true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 px-3"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Objective
                  </Button>
                </div>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground w-12"></th>
            </tr>
          </thead>
          <tbody>
            {/* Add New Objective Row */}
            {isAddingObjective && (
              <tr className="border-b border-border bg-card/50">
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4">
                  <Input
                    placeholder="Enter objective name..."
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
                </td>
                <td className="px-6 py-4">
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
                </td>
              </tr>
            )}

            {/* Objectives and Actions */}
            {filteredObjectives.map((objective) => (
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
                      <button
                        className="p-1 hover:bg-muted/20 rounded transition-colors"
                        onClick={() => toggleRow(objective.id)}
                      >
                        {expandedRows.has(objective.id) ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4" colSpan={2}>
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
                  </tr>
                ) : (
                  <tr
                    className="border-b border-border hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => toggleRow(objective.id)}
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
                      <button
                        className="p-1 hover:bg-muted/20 rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(objective.id);
                        }}
                      >
                        {expandedRows.has(objective.id) ? (
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-foreground" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-card-foreground">{objective.name}</span>
                        <span className="caption text-muted-foreground">
                          {objective.actions.length} {objective.actions.length === 1 ? 'action' : 'actions'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                          <DropdownMenuItem onClick={() => handleEditObjective(objective)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteObjective(objective.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )}

                {/* Child Actions - when expanded */}
                {expandedRows.has(objective.id) && (
                  <>
                    {/* Actions Header Row */}
                    <tr className="bg-muted/5 border-b border-border/50">
                      <td className="px-6 py-2"></td>
                      <td className="px-6 py-2">
                        <Checkbox
                          checked={
                            areSomeActionsSelected(objective.id)
                              ? "indeterminate"
                              : areAllActionsSelected(objective.id)
                          }
                          onCheckedChange={() => toggleAllActionsForObjective(objective.id)}
                          aria-label={`Select all actions for ${objective.name}`}
                        />
                      </td>
                      <td className="px-6 py-2">
                        <div className="grid grid-cols-[2fr_1fr_2fr] gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-foreground">Action</span>
                            <Button
                              onClick={() => handleAddAction(objective.id)}
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground h-6 px-2.5"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Action
                            </Button>
                          </div>
                          <span className="text-xs font-medium text-foreground">Status</span>
                          <span className="text-xs font-medium text-foreground">Time</span>
                        </div>
                      </td>
                      <td className="px-6 py-2"></td>
                    </tr>

                    {/* Add New Action Row */}
                    {addingActionToObjective === objective.id && (
                      <tr className="border-b border-border/30 bg-card/50 hover:bg-muted/5 transition-colors">
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4"></td>
                        <td className="px-6 py-4" colSpan={2}>
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-[2fr_1fr_2fr] gap-4">
                              <Input
                                placeholder="Enter action name..."
                                value={newActionName}
                                onChange={(e) => setNewActionName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveAction(objective.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelAddAction();
                                  }
                                }}
                                autoFocus
                                className="bg-input-background border-border"
                              />
                              <Select
                                value={newActionStatus}
                                onValueChange={(value: 'current' | 'planned') =>
                                  setNewActionStatus(value)
                                }
                              >
                                <SelectTrigger className="w-full bg-input-background border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover text-popover-foreground">
                                  <SelectItem value="current">Current</SelectItem>
                                  <SelectItem value="planned">Planned</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="grid grid-cols-3 gap-2">
                                <Input
                                  type="date"
                                  value={newActionTime.date}
                                  onChange={(e) =>
                                    setNewActionTime({ ...newActionTime, date: e.target.value })
                                  }
                                  className="bg-input-background border-border text-xs"
                                />
                                <Input
                                  type="time"
                                  value={newActionTime.time}
                                  onChange={(e) =>
                                    setNewActionTime({ ...newActionTime, time: e.target.value })
                                  }
                                  className="bg-input-background border-border text-xs"
                                />
                                <Input
                                  value={newActionTime.timezone}
                                  onChange={(e) =>
                                    setNewActionTime({ ...newActionTime, timezone: e.target.value })
                                  }
                                  placeholder="TZ"
                                  className="bg-input-background border-border text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveAction(objective.id)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                Add
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelAddAction}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Action Rows */}
                    {objective.actions
                      .filter((action) => 
                        searchQuery === '' || 
                        action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        objective.name.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((action) => {
                        const actionKey = `${objective.id}-${action.id}`;
                        const isEditing = editingActionId === actionKey;

                      return isEditing && editActionData ? (
                        <tr
                          key={action.id}
                          className="border-b border-border/30 last:border-b-0 bg-card/50"
                        >
                          <td className="px-6 py-3"></td>
                          <td className="px-6 py-3">
                            <Checkbox
                              checked={selectedActions.has(actionKey)}
                              onCheckedChange={() => toggleActionSelection(objective.id, action.id)}
                              aria-label={`Select ${action.name}`}
                            />
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col gap-3">
                              <div className="grid grid-cols-[2fr_1fr_2fr] gap-4">
                                <Input
                                  value={editActionData.name}
                                  onChange={(e) =>
                                    setEditActionData({ ...editActionData, name: e.target.value })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveEditAction(objective.id, action.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelEditAction();
                                    }
                                  }}
                                  className="bg-input-background border-border"
                                />
                                <Select
                                  value={editActionData.status}
                                  onValueChange={(value: 'current' | 'planned') =>
                                    setEditActionData({ ...editActionData, status: value })
                                  }
                                >
                                  <SelectTrigger className="w-full bg-input-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover text-popover-foreground">
                                    <SelectItem value="current">Current</SelectItem>
                                    <SelectItem value="planned">Planned</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="grid grid-cols-3 gap-2">
                                  <Input
                                    type="date"
                                    value={editActionData.time.date}
                                    onChange={(e) =>
                                      setEditActionData({
                                        ...editActionData,
                                        time: { ...editActionData.time, date: e.target.value },
                                      })
                                    }
                                    className="bg-input-background border-border text-xs"
                                  />
                                  <Input
                                    type="time"
                                    value={editActionData.time.time}
                                    onChange={(e) =>
                                      setEditActionData({
                                        ...editActionData,
                                        time: { ...editActionData.time, time: e.target.value },
                                      })
                                    }
                                    className="bg-input-background border-border text-xs"
                                  />
                                  <Input
                                    value={editActionData.time.timezone}
                                    onChange={(e) =>
                                      setEditActionData({
                                        ...editActionData,
                                        time: { ...editActionData.time, timezone: e.target.value },
                                      })
                                    }
                                    placeholder="TZ"
                                    className="bg-input-background border-border text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEditAction(objective.id, action.id)}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEditAction}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3"></td>
                        </tr>
                      ) : (
                        <tr
                          key={action.id}
                          className="border-b border-border/30 last:border-b-0 hover:bg-muted/5 transition-colors"
                        >
                          <td className="px-6 py-3"></td>
                          <td className="px-6 py-3">
                            <Checkbox
                              checked={selectedActions.has(actionKey)}
                              onCheckedChange={() => toggleActionSelection(objective.id, action.id)}
                              aria-label={`Select ${action.name}`}
                            />
                          </td>
                          <td className="px-6 py-3">
                            <div className="grid grid-cols-[2fr_1fr_2fr] gap-4 items-center">
                              <div>
                                <span className="text-sm text-card-foreground">{action.name}</span>
                              </div>
                              <div>
                                <Select
                                  value={action.status}
                                  onValueChange={(value: 'current' | 'planned') => 
                                    handleStatusChange(objective.id, action.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-full bg-input-background border-border">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover text-popover-foreground">
                                    <SelectItem value="current">Current</SelectItem>
                                    <SelectItem value="planned">Planned</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-card-foreground">
                                <span>{action.time.date}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>{action.time.time}</span>
                                <span className="text-muted-foreground">•</span>
                                <span>{action.time.timezone}</span>
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
                                <DropdownMenuItem onClick={() => handleEditAction(objective.id, action)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteAction(objective.id, action.id)}
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
          {objectives.length} {objectives.length === 1 ? 'objective' : 'objectives'}
        </span>
        <span className="text-sm text-muted-foreground">
          {objectives.reduce((acc, obj) => acc + obj.actions.length, 0)} total actions
        </span>
      </div>
    </div>
  );
}