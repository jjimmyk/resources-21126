import React, { useState } from 'react';
import { Plus, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DateTimePicker } from './DateTimePicker';

interface OpenAction {
  id: string;
  task: string;
  pointOfContact: string;
  pocBriefed: boolean;
  startDate: {
    date: string;
    time: string;
    timezone: string;
  };
  deadline: {
    date: string;
    time: string;
    timezone: string;
  };
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked';
}

const USCG_PERSONNEL = [
  'CDR Sarah Johnson',
  'LCDR Michael Chen',
  'LT Emily Rodriguez',
  'LT James Wilson',
  'LTJG Amanda Foster',
  'CWO Robert Martinez',
  'BMC David Thompson',
  'BM1 Jennifer Lee',
  'MK2 Christopher Davis',
  'OS3 Patricia Garcia',
];

const initialActions: OpenAction[] = [
  {
    id: '1',
    task: 'Establish incident command post at Base Seattle',
    pointOfContact: 'CDR Sarah Johnson',
    pocBriefed: true,
    startDate: { date: '2025-01-10', time: '08:00', timezone: 'UTC' },
    deadline: { date: '2025-01-12', time: '17:00', timezone: 'UTC' },
    status: 'completed',
  },
  {
    id: '2',
    task: 'Deploy search and rescue teams to affected area',
    pointOfContact: 'LCDR Michael Chen',
    pocBriefed: true,
    startDate: { date: '2025-01-11', time: '06:00', timezone: 'UTC' },
    deadline: { date: '2025-01-13', time: '18:00', timezone: 'UTC' },
    status: 'in-progress',
  },
  {
    id: '3',
    task: 'Coordinate with local law enforcement agencies',
    pointOfContact: 'LT Emily Rodriguez',
    pocBriefed: false,
    startDate: { date: '2025-01-12', time: '09:00', timezone: 'UTC' },
    deadline: { date: '2025-01-15', time: '16:00', timezone: 'UTC' },
    status: 'not-started',
  },
  {
    id: '4',
    task: 'Set up medical triage station',
    pointOfContact: 'LT James Wilson',
    pocBriefed: true,
    startDate: { date: '2025-01-11', time: '10:00', timezone: 'UTC' },
    deadline: { date: '2025-01-14', time: '15:00', timezone: 'UTC' },
    status: 'in-progress',
  },
  {
    id: '5',
    task: 'Establish communication links with all units',
    pointOfContact: 'LTJG Amanda Foster',
    pocBriefed: false,
    startDate: { date: '2025-01-13', time: '07:00', timezone: 'UTC' },
    deadline: { date: '2025-01-16', time: '14:00', timezone: 'UTC' },
    status: 'blocked',
  },
];

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

export function OpenActionsTracker() {
  const [actions, setActions] = useState<OpenAction[]>(initialActions);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newAction, setNewAction] = useState<Omit<OpenAction, 'id'>>({
    task: '',
    pointOfContact: '',
    pocBriefed: false,
    startDate: { date: '', time: '09:00', timezone: 'UTC' },
    deadline: { date: '', time: '17:00', timezone: 'UTC' },
    status: 'not-started',
  });
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editActionData, setEditActionData] = useState<Omit<OpenAction, 'id'> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    column: keyof OpenAction | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });
  const [newActionTaskError, setNewActionTaskError] = useState('');
  const [newActionPOCError, setNewActionPOCError] = useState('');
  const [editActionTaskError, setEditActionTaskError] = useState('');
  const [editActionPOCError, setEditActionPOCError] = useState('');

  // Validate task and POC - show error if 1-3 characters
  const validateField = (value: string) => {
    const length = value.trim().length;
    if (length >= 1 && length <= 3) {
      return 'Must be at least 4 characters';
    }
    return '';
  };

  const handleAddAction = () => {
    if (newAction.task.trim()) {
      const action: OpenAction = {
        id: String(Date.now()),
        ...newAction,
      };
      setActions([...actions, action]);
      setNewAction({
        task: '',
        pointOfContact: '',
        pocBriefed: false,
        startDate: { date: '', time: '09:00', timezone: 'UTC' },
        deadline: { date: '', time: '17:00', timezone: 'UTC' },
        status: 'not-started',
      });
      setIsAddingAction(false);
    }
  };

  const handleDeleteAction = (id: string) => {
    setActions(actions.filter((action) => action.id !== id));
    setSelectedActions((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleActionSelection = (actionId: string) => {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      return next;
    });
  };

  const toggleAllActions = () => {
    if (selectedActions.size === sortedActions.length) {
      setSelectedActions(new Set());
    } else {
      setSelectedActions(new Set(sortedActions.map((action) => action.id)));
    }
  };

  const handleBulkDelete = () => {
    setActions(actions.filter((action) => !selectedActions.has(action.id)));
    setSelectedActions(new Set());
  };

  const toggleSort = (column: keyof OpenAction) => {
    if (sortConfig.column === column) {
      if (sortConfig.order === null) {
        setSortConfig({ column, order: 'asc' });
      } else if (sortConfig.order === 'asc') {
        setSortConfig({ column, order: 'desc' });
      } else {
        setSortConfig({ column: null, order: null });
      }
    } else {
      setSortConfig({ column, order: 'asc' });
    }
  };

  const filteredActions = actions.filter((action) =>
    action.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    action.pointOfContact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedActions = sortConfig.column && sortConfig.order
    ? [...filteredActions].sort((a, b) => {
        const aVal = a[sortConfig.column!];
        const bVal = b[sortConfig.column!];
        
        if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
          return sortConfig.order === 'asc' 
            ? (aVal === bVal ? 0 : aVal ? -1 : 1)
            : (aVal === bVal ? 0 : aVal ? 1 : -1);
        }
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'object' && typeof bVal === 'object' && aVal !== null && bVal !== null) {
          const aDateTime = `${aVal.date} ${aVal.time}`;
          const bDateTime = `${bVal.date} ${bVal.time}`;
          return sortConfig.order === 'asc'
            ? aDateTime.localeCompare(bDateTime)
            : bDateTime.localeCompare(aDateTime);
        }
        
        return 0;
      })
    : filteredActions;

  const handleEditAction = (action: OpenAction) => {
    setEditingActionId(action.id);
    setEditActionData({
      task: action.task,
      pointOfContact: action.pointOfContact,
      pocBriefed: action.pocBriefed,
      startDate: { ...action.startDate },
      deadline: { ...action.deadline },
      status: action.status,
    });
    setEditActionTaskError('');
    setEditActionPOCError('');
  };

  const handleSaveAction = () => {
    if (editActionData && editActionData.task.trim() && editingActionId) {
      setActions((prev) =>
        prev.map((action) =>
          action.id === editingActionId
            ? { id: action.id, ...editActionData }
            : action
        )
      );
      setEditingActionId(null);
      setEditActionData(null);
    }
  };

  const handleCancelEditAction = () => {
    setEditingActionId(null);
    setEditActionData(null);
    setEditActionTaskError('');
    setEditActionPOCError('');
  };

  const SortableHeader = ({ column, children }: { column: keyof OpenAction; children: React.ReactNode }) => {
    const isActive = sortConfig.column === column;
    const order = isActive ? sortConfig.order : null;

    return (
      <button
        onClick={() => toggleSort(column)}
        className="flex items-center gap-2 hover:text-primary transition-colors"
      >
        <span>{children}</span>
        {!isActive && <ArrowUpDown className="w-4 h-4 text-muted-foreground" />}
        {isActive && order === 'asc' && <ArrowUp className="w-4 h-4 text-primary" />}
        {isActive && order === 'desc' && <ArrowDown className="w-4 h-4 text-primary" />}
      </button>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg shadow-elevation-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-card-foreground">Open Actions Tracker</span>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input-background border-border"
            />
          </div>
        </div>
        <Button
          onClick={() => setIsAddingAction(true)}
          size="sm"
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Action
        </Button>
      </div>

      {/* Bulk Action Bar */}
      {selectedActions.size > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-primary/10 border-b border-border">
          <span className="text-sm text-card-foreground">
            {selectedActions.size} {selectedActions.size === 1 ? 'action' : 'actions'} selected
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
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '48px' }} />
            <col style={{ width: 'auto', minWidth: '300px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '220px' }} />
            <col style={{ width: '220px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '100px' }} />
          </colgroup>
          <thead className="bg-card sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">
                <Checkbox
                  checked={sortedActions.length > 0 && selectedActions.size === sortedActions.length}
                  onCheckedChange={toggleAllActions}
                  aria-label="Select all actions"
                />
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="task">Task</SortableHeader>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="pointOfContact">Point of Contact</SortableHeader>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="pocBriefed">POC Briefed</SortableHeader>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="startDate">Start Date</SortableHeader>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="deadline">Deadline</SortableHeader>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="status">Status</SortableHeader>
              </th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {/* Empty State */}
            {!isAddingAction && sortedActions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <span className="text-muted-foreground">
                    There are no actions yet. Click + Add Action to add an action.
                  </span>
                </td>
              </tr>
            )}

            {/* Add New Action Row */}
            {isAddingAction && (
              <>
                <tr className="bg-card/50">
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Input
                        placeholder="Enter task description..."
                        value={newAction.task}
                        onChange={(e) => {
                          setNewAction({ ...newAction, task: e.target.value });
                          setNewActionTaskError(validateField(e.target.value));
                        }}
                        onBlur={(e) => setNewActionTaskError(validateField(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddAction();
                          } else if (e.key === 'Escape') {
                            setIsAddingAction(false);
                            setNewAction({
                              task: '',
                              pointOfContact: '',
                              pocBriefed: false,
                              startDate: { date: '', time: '09:00', timezone: 'UTC' },
                              deadline: { date: '', time: '17:00', timezone: 'UTC' },
                              status: 'not-started',
                            });
                            setNewActionTaskError('');
                            setNewActionPOCError('');
                          }
                        }}
                        autoFocus
                        className={`bg-input-background ${newActionTaskError ? 'border-destructive' : 'border-border'}`}
                      />
                      <div className="h-4 mt-0.5">
                        {newActionTaskError && (
                          <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                            {newActionTaskError}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <Input
                        placeholder="Enter POC name..."
                        value={newAction.pointOfContact}
                        onChange={(e) => {
                          setNewAction({ ...newAction, pointOfContact: e.target.value });
                          setNewActionPOCError(validateField(e.target.value));
                        }}
                        onBlur={(e) => setNewActionPOCError(validateField(e.target.value))}
                        className={`bg-input-background ${newActionPOCError ? 'border-destructive' : 'border-border'}`}
                      />
                      <div className="h-4 mt-0.5">
                        {newActionPOCError && (
                          <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                            {newActionPOCError}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={newAction.pocBriefed}
                      onCheckedChange={(checked) =>
                        setNewAction({ ...newAction, pocBriefed: checked === true })
                      }
                    />
                  </td>
                  <td className="px-6 py-6">
                    <DateTimePicker
                      date={newAction.startDate.date}
                      time={newAction.startDate.time}
                      timezone={newAction.startDate.timezone}
                      onDateChange={(date) =>
                        setNewAction({
                          ...newAction,
                          startDate: { ...newAction.startDate, date },
                        })
                      }
                      onTimeChange={(time) =>
                        setNewAction({
                          ...newAction,
                          startDate: { ...newAction.startDate, time },
                        })
                      }
                      onTimezoneChange={(timezone) =>
                        setNewAction({
                          ...newAction,
                          startDate: { ...newAction.startDate, timezone },
                        })
                      }
                    />
                  </td>
                  <td className="px-6 py-6">
                    <DateTimePicker
                      date={newAction.deadline.date}
                      time={newAction.deadline.time}
                      timezone={newAction.deadline.timezone}
                      onDateChange={(date) =>
                        setNewAction({
                          ...newAction,
                          deadline: { ...newAction.deadline, date },
                        })
                      }
                      onTimeChange={(time) =>
                        setNewAction({
                          ...newAction,
                          deadline: { ...newAction.deadline, time },
                        })
                      }
                      onTimezoneChange={(timezone) =>
                        setNewAction({
                          ...newAction,
                          deadline: { ...newAction.deadline, timezone },
                        })
                      }
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Select
                      value={newAction.status}
                      onValueChange={(value: OpenAction['status']) =>
                        setNewAction({ ...newAction, status: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
                <tr className="border-b border-border bg-card/50">
                  <td className="px-6 pb-4" colSpan={8}>
                    <div className="flex gap-2 pl-12">
                      <Button
                        size="sm"
                        onClick={handleAddAction}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingAction(false);
                          setNewAction({
                            task: '',
                            pointOfContact: '',
                            pocBriefed: false,
                            startDate: { date: '', time: '09:00', timezone: 'UTC' },
                            deadline: { date: '', time: '17:00', timezone: 'UTC' },
                            status: 'not-started',
                          });
                          setNewActionTaskError('');
                          setNewActionPOCError('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              </>
            )}

            {/* Actions */}
            {sortedActions.map((action) => (
              <React.Fragment key={action.id}>
                {/* Action Row */}
                {editingActionId === action.id && editActionData ? (
                  <>
                    <tr className="bg-card/50">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedActions.has(action.id)}
                          onCheckedChange={() => toggleActionSelection(action.id)}
                          aria-label={`Select ${action.task}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <Input
                            value={editActionData.task}
                            onChange={(e) => {
                              setEditActionData({ ...editActionData, task: e.target.value });
                              setEditActionTaskError(validateField(e.target.value));
                            }}
                            onBlur={(e) => setEditActionTaskError(validateField(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveAction();
                              } else if (e.key === 'Escape') {
                                handleCancelEditAction();
                              }
                            }}
                            autoFocus
                            className={`bg-input-background ${editActionTaskError ? 'border-destructive' : 'border-border'}`}
                          />
                          <div className="h-4 mt-0.5">
                            {editActionTaskError && (
                              <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                                {editActionTaskError}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <Input
                            value={editActionData.pointOfContact}
                            onChange={(e) => {
                              setEditActionData({ ...editActionData, pointOfContact: e.target.value });
                              setEditActionPOCError(validateField(e.target.value));
                            }}
                            onBlur={(e) => setEditActionPOCError(validateField(e.target.value))}
                            className={`bg-input-background ${editActionPOCError ? 'border-destructive' : 'border-border'}`}
                          />
                          <div className="h-4 mt-0.5">
                            {editActionPOCError && (
                              <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                                {editActionPOCError}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={editActionData.pocBriefed}
                          onCheckedChange={(checked) =>
                            setEditActionData({ ...editActionData, pocBriefed: checked === true })
                          }
                        />
                      </td>
                      <td className="px-6 py-6">
                        <DateTimePicker
                          date={editActionData.startDate.date}
                          time={editActionData.startDate.time}
                          timezone={editActionData.startDate.timezone}
                          onDateChange={(date) =>
                            setEditActionData({
                              ...editActionData,
                              startDate: { ...editActionData.startDate, date },
                            })
                          }
                          onTimeChange={(time) =>
                            setEditActionData({
                              ...editActionData,
                              startDate: { ...editActionData.startDate, time },
                            })
                          }
                          onTimezoneChange={(timezone) =>
                            setEditActionData({
                              ...editActionData,
                              startDate: { ...editActionData.startDate, timezone },
                            })
                          }
                        />
                      </td>
                      <td className="px-6 py-6">
                        <DateTimePicker
                          date={editActionData.deadline.date}
                          time={editActionData.deadline.time}
                          timezone={editActionData.deadline.timezone}
                          onDateChange={(date) =>
                            setEditActionData({
                              ...editActionData,
                              deadline: { ...editActionData.deadline, date },
                            })
                          }
                          onTimeChange={(time) =>
                            setEditActionData({
                              ...editActionData,
                              deadline: { ...editActionData.deadline, time },
                            })
                          }
                          onTimezoneChange={(timezone) =>
                            setEditActionData({
                              ...editActionData,
                              deadline: { ...editActionData.deadline, timezone },
                            })
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={editActionData.status}
                          onValueChange={(value: OpenAction['status']) =>
                            setEditActionData({ ...editActionData, status: value })
                          }
                        >
                          <SelectTrigger className="w-full bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground">
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                    <tr className="border-b border-border bg-card/50">
                      <td className="px-6 pb-4" colSpan={8}>
                        <div className="flex gap-2 pl-12">
                          <Button
                            size="sm"
                            onClick={handleSaveAction}
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
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr
                    className="border-b border-border hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => handleEditAction(action)}
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedActions.has(action.id)}
                        onCheckedChange={() => toggleActionSelection(action.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${action.task}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-card-foreground">{action.task}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-card-foreground">{action.pointOfContact}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={action.pocBriefed}
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-card-foreground">{action.startDate.date}</span>
                        <div className="flex items-center gap-2 text-sm text-card-foreground">
                          <span>{action.startDate.time}</span>
                          <span>•</span>
                          <span>{action.startDate.timezone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-card-foreground">{action.deadline.date}</span>
                        <div className="flex items-center gap-2 text-sm text-card-foreground">
                          <span>{action.deadline.time}</span>
                          <span>•</span>
                          <span>{action.deadline.timezone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-card-foreground">
                        {STATUS_OPTIONS.find((s) => s.value === action.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAction(action);
                          }}
                          aria-label={`Edit ${action.task}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAction(action.id);
                          }}
                          aria-label={`Delete ${action.task}`}
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
          {actions.length} {actions.length === 1 ? 'action' : 'actions'}
        </span>
      </div>
    </div>
  );
}
