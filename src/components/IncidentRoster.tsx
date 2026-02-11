import React, { useState } from 'react';
import { Plus, Trash2, Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';

interface RosterMember {
  id: string;
  person: string;
  position: string;
  activationStatus: 'active' | 'inactive' | 'pending';
  checkInStatus: 'checked-in' | 'not-checked-in' | 'pending';
  signInStatus: 'signed-in' | 'not-signed-in' | 'pending';
  letPersonSelfActivate: boolean;
  letPersonSelfCheckIn: boolean;
  notificationMethod: 'email' | 'sms' | 'phone' | 'radio';
  notificationStatus: {
    status: 'sent' | 'pending' | 'failed';
    timestamp: string;
  };
}

const ACTIVATION_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];

const CHECK_IN_STATUS_OPTIONS = [
  { value: 'checked-in', label: 'Checked In' },
  { value: 'not-checked-in', label: 'Not Checked In' },
  { value: 'pending', label: 'Pending' },
];

const SIGN_IN_STATUS_OPTIONS = [
  { value: 'signed-in', label: 'Signed In' },
  { value: 'not-signed-in', label: 'Not Signed In' },
  { value: 'pending', label: 'Pending' },
];

const NOTIFICATION_METHOD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'radio', label: 'Radio' },
];

const AVAILABLE_MEMBERS = [
  'sarah.johnson@uscg.mil',
  'michael.chen@uscg.mil',
  'emily.rodriguez@uscg.mil',
  'james.wilson@uscg.mil',
  'amanda.foster@uscg.mil',
  'robert.martinez@uscg.mil',
  'david.thompson@uscg.mil',
  'jennifer.lee@uscg.mil',
  'christopher.davis@uscg.mil',
  'patricia.garcia@uscg.mil',
  'john.anderson@uscg.mil',
  'maria.gonzalez@uscg.mil',
  'william.brown@uscg.mil',
  'linda.taylor@uscg.mil',
  'richard.moore@uscg.mil',
];

const AVAILABLE_POSITIONS = [
  'Incident Commander',
  'Operations Section Chief',
  'Planning Section Chief',
  'Logistics Section Chief',
  'Finance/Administration Section Chief',
  'Safety Officer',
  'Liaison Officer',
  'Public Information Officer',
  'Operations Branch Director',
  'Planning Unit Leader',
  'Resources Unit Leader',
  'Situation Unit Leader',
  'Documentation Unit Leader',
  'Demobilization Unit Leader',
  'Supply Unit Leader',
  'Facilities Unit Leader',
  'Ground Support Unit Leader',
  'Communications Unit Leader',
  'Medical Unit Leader',
  'Food Unit Leader',
  'Time Unit Leader',
  'Procurement Unit Leader',
  'Compensation/Claims Unit Leader',
  'Cost Unit Leader',
];

interface Team {
  id: string;
  name: string;
  members: Array<{
    person: string;
    position: string;
  }>;
}

const AVAILABLE_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Incident Command Team',
    members: [
      { person: 'sarah.johnson@uscg.mil', position: 'Incident Commander' },
      { person: 'michael.chen@uscg.mil', position: 'Operations Section Chief' },
      { person: 'emily.rodriguez@uscg.mil', position: 'Planning Section Chief' },
      { person: 'james.wilson@uscg.mil', position: 'Logistics Section Chief' },
    ],
  },
  {
    id: 'team-2',
    name: 'Operations Team Alpha',
    members: [
      { person: 'robert.martinez@uscg.mil', position: 'Operations Branch Director' },
      { person: 'jennifer.lee@uscg.mil', position: 'Safety Officer' },
      { person: 'david.thompson@uscg.mil', position: 'Ground Support Unit Leader' },
    ],
  },
  {
    id: 'team-3',
    name: 'Planning and Documentation',
    members: [
      { person: 'christopher.davis@uscg.mil', position: 'Planning Unit Leader' },
      { person: 'patricia.garcia@uscg.mil', position: 'Resources Unit Leader' },
      { person: 'john.anderson@uscg.mil', position: 'Situation Unit Leader' },
      { person: 'maria.gonzalez@uscg.mil', position: 'Documentation Unit Leader' },
    ],
  },
  {
    id: 'team-4',
    name: 'Logistics Support',
    members: [
      { person: 'william.brown@uscg.mil', position: 'Supply Unit Leader' },
      { person: 'linda.taylor@uscg.mil', position: 'Facilities Unit Leader' },
      { person: 'amanda.foster@uscg.mil', position: 'Communications Unit Leader' },
    ],
  },
  {
    id: 'team-5',
    name: 'Finance and Administration',
    members: [
      { person: 'richard.moore@uscg.mil', position: 'Finance/Administration Section Chief' },
      { person: 'patricia.garcia@uscg.mil', position: 'Time Unit Leader' },
      { person: 'john.anderson@uscg.mil', position: 'Procurement Unit Leader' },
    ],
  },
];

const initialRoster: RosterMember[] = [
  {
    id: '1',
    person: 'sarah.johnson@uscg.mil',
    position: 'Incident Commander',
    activationStatus: 'active',
    checkInStatus: 'checked-in',
    signInStatus: 'signed-in',
    letPersonSelfActivate: true,
    letPersonSelfCheckIn: true,
    notificationMethod: 'email',
    notificationStatus: {
      status: 'sent',
      timestamp: '2025-01-24T14:32:00Z',
    },
  },
  {
    id: '2',
    person: 'michael.chen@uscg.mil',
    position: 'Operations Section Chief',
    activationStatus: 'active',
    checkInStatus: 'checked-in',
    signInStatus: 'signed-in',
    letPersonSelfActivate: false,
    letPersonSelfCheckIn: true,
    notificationMethod: 'sms',
    notificationStatus: {
      status: 'sent',
      timestamp: '2025-01-24T14:28:15Z',
    },
  },
  {
    id: '3',
    person: 'emily.rodriguez@uscg.mil',
    position: 'Planning Section Chief',
    activationStatus: 'pending',
    checkInStatus: 'pending',
    signInStatus: 'not-signed-in',
    letPersonSelfActivate: true,
    letPersonSelfCheckIn: false,
    notificationMethod: 'phone',
    notificationStatus: {
      status: 'sent',
      timestamp: '2025-01-24T14:15:42Z',
    },
  },
  {
    id: '4',
    person: 'james.wilson@uscg.mil',
    position: 'Logistics Section Chief',
    activationStatus: 'active',
    checkInStatus: 'checked-in',
    signInStatus: 'signed-in',
    letPersonSelfActivate: false,
    letPersonSelfCheckIn: false,
    notificationMethod: 'email',
    notificationStatus: {
      status: 'sent',
      timestamp: '2025-01-24T13:45:30Z',
    },
  },
  {
    id: '5',
    person: 'amanda.foster@uscg.mil',
    position: 'Communications Unit Leader',
    activationStatus: 'active',
    checkInStatus: 'checked-in',
    signInStatus: 'signed-in',
    letPersonSelfActivate: true,
    letPersonSelfCheckIn: true,
    notificationMethod: 'radio',
    notificationStatus: {
      status: 'sent',
      timestamp: '2025-01-24T13:22:18Z',
    },
  },
];

export function IncidentRoster() {
  const [roster, setRoster] = useState<RosterMember[]>(initialRoster);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isInvitingTeam, setIsInvitingTeam] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkNotifyClicked, setBulkNotifyClicked] = useState(false);
  const [newMemberNotifyToggle, setNewMemberNotifyToggle] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<Partial<Omit<RosterMember, 'id' | 'person' | 'position'>>>({
    activationStatus: 'inactive',
    checkInStatus: 'not-checked-in',
    signInStatus: 'not-signed-in',
    letPersonSelfActivate: false,
    letPersonSelfCheckIn: false,
    notificationMethod: 'email',
  });
  const [newMember, setNewMember] = useState<Omit<RosterMember, 'id'>>(
    {
      person: '',
      position: '',
      activationStatus: 'inactive',
      checkInStatus: 'not-checked-in',
      signInStatus: 'not-signed-in',
      letPersonSelfActivate: false,
      letPersonSelfCheckIn: false,
      notificationMethod: 'email',
      notificationStatus: {
        status: 'sent',
        timestamp: new Date().toISOString(),
      },
    }
  );
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberData, setEditMemberData] = useState<Omit<RosterMember, 'id'> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    column: keyof RosterMember | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });
  const [newMemberPersonError, setNewMemberPersonError] = useState('');
  const [newMemberPositionError, setNewMemberPositionError] = useState('');
  const [editMemberPersonError, setEditMemberPersonError] = useState('');
  const [editMemberPositionError, setEditMemberPositionError] = useState('');
  const [newMemberPersonOpen, setNewMemberPersonOpen] = useState(false);
  const [editMemberPersonOpen, setEditMemberPersonOpen] = useState(false);
  const [newMemberPositionOpen, setNewMemberPositionOpen] = useState(false);
  const [editMemberPositionOpen, setEditMemberPositionOpen] = useState(false);

  // Validate person and position - show error if 1-3 characters
  const validateField = (value: string) => {
    const length = value.trim().length;
    if (length >= 1 && length <= 3) {
      return 'Must be at least 4 characters';
    }
    return '';
  };

  const handleAddMember = () => {
    if (newMember.person.trim()) {
      const member: RosterMember = {
        id: String(Date.now()),
        ...newMember,
        notificationStatus: newMemberNotifyToggle ? {
          status: 'sent',
          timestamp: new Date().toISOString(),
        } : newMember.notificationStatus,
      };
      setRoster([...roster, member]);
      setNewMember({
        person: '',
        position: '',
        activationStatus: 'inactive',
        checkInStatus: 'not-checked-in',
        signInStatus: 'not-signed-in',
        letPersonSelfActivate: false,
        letPersonSelfCheckIn: false,
        notificationMethod: 'email',
        notificationStatus: {
          status: 'sent',
          timestamp: new Date().toISOString(),
        },
      });
      setIsAddingMember(false);
      setNewMemberNotifyToggle(false);
    }
  };

  const handleDeleteMember = (id: string) => {
    setRoster(roster.filter((member) => member.id !== id));
  };

  const toggleSort = (column: keyof RosterMember) => {
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

  const filteredRoster = roster.filter((member) =>
    member.person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRoster = sortConfig.column && sortConfig.order
    ? [...filteredRoster].sort((a, b) => {
        const aVal = a[sortConfig.column!];
        const bVal = b[sortConfig.column!];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return 0;
      })
    : filteredRoster;

  const handleEditMember = (member: RosterMember) => {
    setEditingMemberId(member.id);
    setEditMemberData({
      person: member.person,
      position: member.position,
      activationStatus: member.activationStatus,
      checkInStatus: member.checkInStatus,
      signInStatus: member.signInStatus,
      letPersonSelfActivate: member.letPersonSelfActivate,
      letPersonSelfCheckIn: member.letPersonSelfCheckIn,
      notificationMethod: member.notificationMethod,
      notificationStatus: member.notificationStatus,
    });
    setEditMemberPersonError('');
    setEditMemberPositionError('');
  };

  const handleSaveMember = () => {
    if (editMemberData && editMemberData.person.trim() && editingMemberId) {
      setRoster((prev) =>
        prev.map((member) =>
          member.id === editingMemberId
            ? { id: member.id, ...editMemberData }
            : member
        )
      );
      setEditingMemberId(null);
      setEditMemberData(null);
    }
  };

  const handleCancelEditMember = () => {
    setEditingMemberId(null);
    setEditMemberData(null);
    setEditMemberPersonError('');
    setEditMemberPositionError('');
  };

  const handleSendNotification = (member: RosterMember) => {
    // Update the notification status with a new timestamp
    const currentTimestamp = new Date().toISOString();
    setRoster((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              notificationStatus: {
                status: 'sent',
                timestamp: currentTimestamp
              }
            }
          : m
      )
    );
    // Here you would typically make an API call to send the notification
    console.log(`Sending notification to ${member.person} via ${member.notificationMethod}`);
  };

  const handleInviteTeams = () => {
    const teamsToInvite = AVAILABLE_TEAMS.filter((team) => selectedTeams.includes(team.id));
    const newMembers: RosterMember[] = [];

    teamsToInvite.forEach((team) => {
      team.members.forEach((member) => {
        // Check if member is already in roster
        const existingMember = roster.find((r) => r.person === member.person);
        if (!existingMember) {
          newMembers.push({
            id: `${Date.now()}-${Math.random()}`,
            person: member.person,
            position: member.position,
            activationStatus: 'inactive',
            checkInStatus: 'not-checked-in',
            signInStatus: 'not-signed-in',
            letPersonSelfActivate: true,
            letPersonSelfCheckIn: true,
            notificationMethod: 'email',
            notificationStatus: {
              status: 'sent',
              timestamp: new Date().toISOString(),
            },
          });
        }
      });
    });

    if (newMembers.length > 0) {
      setRoster((prev) => [...prev, ...newMembers]);
      // Auto-select all newly added members
      const newMemberIds = newMembers.map(m => m.id);
      setSelectedRows(newMemberIds);
      // Show bulk edit row
      setIsBulkEditing(true);
    }

    setSelectedTeams([]);
    setIsInvitingTeam(false);
  };

  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedRows.length === sortedRoster.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedRoster.map((member) => member.id));
    }
  };

  const handleBulkDelete = () => {
    setRoster((prev) => prev.filter((member) => !selectedRows.includes(member.id)));
    setSelectedRows([]);
    setIsBulkEditing(false);
  };

  const handleApplyBulkEdit = () => {
    setRoster((prev) =>
      prev.map((member) => {
        if (selectedRows.includes(member.id)) {
          return {
            ...member,
            ...(bulkEditData.activationStatus && { activationStatus: bulkEditData.activationStatus }),
            ...(bulkEditData.checkInStatus && { checkInStatus: bulkEditData.checkInStatus }),
            ...(bulkEditData.signInStatus && { signInStatus: bulkEditData.signInStatus }),
            ...(bulkEditData.letPersonSelfActivate !== undefined && { letPersonSelfActivate: bulkEditData.letPersonSelfActivate }),
            ...(bulkEditData.letPersonSelfCheckIn !== undefined && { letPersonSelfCheckIn: bulkEditData.letPersonSelfCheckIn }),
            ...(bulkEditData.notificationMethod && { notificationMethod: bulkEditData.notificationMethod }),
            ...(bulkNotifyClicked && {
              notificationStatus: {
                status: 'sent',
                timestamp: new Date().toISOString(),
              },
            }),
          };
        }
        return member;
      })
    );
    setIsBulkEditing(false);
    setSelectedRows([]);
    setBulkNotifyClicked(false);
  };

  const handleCancelBulkEdit = () => {
    setIsBulkEditing(false);
    setSelectedRows([]);
    setBulkNotifyClicked(false);
    setBulkEditData({
      activationStatus: 'inactive',
      checkInStatus: 'not-checked-in',
      signInStatus: 'not-signed-in',
      letPersonSelfActivate: false,
      letPersonSelfCheckIn: false,
      notificationMethod: 'email',
    });
  };

  const getActivationStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-status-success';
      case 'pending':
        return 'text-status-warning';
      case 'inactive':
        return 'text-status-error';
      default:
        return 'text-card-foreground';
    }
  };

  const getCheckInStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'text-status-success';
      case 'pending':
        return 'text-status-warning';
      case 'not-checked-in':
        return 'text-status-error';
      default:
        return 'text-card-foreground';
    }
  };

  const getSignInStatusColor = (status: string) => {
    switch (status) {
      case 'signed-in':
        return 'text-status-success';
      case 'not-signed-in':
        return 'text-status-error';
      default:
        return 'text-card-foreground';
    }
  };

  const SortableHeader = ({ column, children }: { column: keyof RosterMember; children: React.ReactNode }) => {
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
          <span className="text-sm font-medium text-card-foreground">Incident Roster</span>
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-input-background border-border"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={isInvitingTeam} onOpenChange={setIsInvitingTeam}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-foreground h-8 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Invite Team
                {selectedTeams.length > 0 && (
                  <span className="ml-2 bg-foreground text-background rounded-full px-2 py-0.5" style={{ fontSize: 'var(--text-xs)' }}>
                    {selectedTeams.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-popover border-border" align="start">
              <Command className="bg-popover">
                <CommandInput 
                  placeholder="Search teams..." 
                  className="h-9 border-b border-border text-popover-foreground"
                />
                <CommandList>
                  <CommandEmpty className="text-popover-foreground p-4 text-center">No teams found.</CommandEmpty>
                  <CommandGroup className="p-2">
                    {AVAILABLE_TEAMS.map((team) => {
                      const isSelected = selectedTeams.includes(team.id);
                      return (
                        <CommandItem
                          key={team.id}
                          onSelect={() => {
                            if (isSelected) {
                              setSelectedTeams(selectedTeams.filter((id) => id !== team.id));
                            } else {
                              setSelectedTeams([...selectedTeams, team.id]);
                            }
                          }}
                          className="flex items-start gap-3 p-2 cursor-pointer hover:bg-accent/10 rounded"
                        >
                          <Checkbox
                            checked={isSelected}
                            className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <div className="flex-1">
                            <div className="text-popover-foreground">{team.name}</div>
                            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
                {selectedTeams.length > 0 && (
                  <div className="border-t border-border p-3 bg-card">
                    <Button
                      onClick={handleInviteTeams}
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                    >
                      Invite to Incident ({selectedTeams.reduce((total, teamId) => {
                        const team = AVAILABLE_TEAMS.find((t) => t.id === teamId);
                        return total + (team?.members.length || 0);
                      }, 0)} member{selectedTeams.reduce((total, teamId) => {
                        const team = AVAILABLE_TEAMS.find((t) => t.id === teamId);
                        return total + (team?.members.length || 0);
                      }, 0) !== 1 ? 's' : ''})
                    </Button>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => setIsAddingMember(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
          {selectedRows.length > 0 && (
            <Button
              onClick={handleBulkDelete}
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 px-4"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedRows.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '50px' }} />
            <col style={{ width: 'auto', minWidth: '180px' }} />
            <col style={{ width: 'auto', minWidth: '180px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '90px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '120px' }} />
          </colgroup>
          <thead className="bg-card sticky top-0 z-10 border-b border-border">
            <tr>
              <th className="text-center px-3 py-3">
                <Checkbox
                  checked={selectedRows.length > 0 && selectedRows.length === sortedRoster.length}
                  onCheckedChange={handleToggleAll}
                  className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="person">Person</SortableHeader>
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="position">Position</SortableHeader>
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="activationStatus">Activation Status</SortableHeader>
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="checkInStatus">Check-In Status</SortableHeader>
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="signInStatus">Sign-In Status</SortableHeader>
              </th>
              <th className="text-center px-2 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="letPersonSelfActivate">Self-Activate</SortableHeader>
              </th>
              <th className="text-center px-2 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="letPersonSelfCheckIn">Self Check-In</SortableHeader>
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                <SortableHeader column="notificationMethod">Notification Method</SortableHeader>
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-foreground">
                Notification Status
              </th>
              <th className="text-left px-3 py-3 text-sm font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {/* Bulk Edit Row */}
            {isBulkEditing && selectedRows.length > 0 && (
              <>
                <tr className="bg-primary/10">
                  <td className="px-3 py-4"></td>
                  <td className="px-3 py-4" colSpan={2}>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">
                        Bulk Editing {selectedRows.length} member{selectedRows.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={bulkEditData.activationStatus}
                      onValueChange={(value: any) => setBulkEditData({ ...bulkEditData, activationStatus: value })}
                    >
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {ACTIVATION_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-popover-foreground hover:bg-muted/10"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={bulkEditData.checkInStatus}
                      onValueChange={(value: any) => setBulkEditData({ ...bulkEditData, checkInStatus: value })}
                    >
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {CHECK_IN_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-popover-foreground hover:bg-muted/10"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={bulkEditData.signInStatus}
                      onValueChange={(value: any) => setBulkEditData({ ...bulkEditData, signInStatus: value })}
                    >
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {SIGN_IN_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-popover-foreground hover:bg-muted/10"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={bulkEditData.letPersonSelfActivate}
                        onCheckedChange={(checked) =>
                          setBulkEditData({ ...bulkEditData, letPersonSelfActivate: checked as boolean })
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={bulkEditData.letPersonSelfCheckIn}
                        onCheckedChange={(checked) =>
                          setBulkEditData({ ...bulkEditData, letPersonSelfCheckIn: checked as boolean })
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={bulkEditData.notificationMethod}
                      onValueChange={(value: any) => setBulkEditData({ ...bulkEditData, notificationMethod: value })}
                    >
                      <SelectTrigger className="bg-input-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {NOTIFICATION_METHOD_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-popover-foreground hover:bg-muted/10"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={bulkNotifyClicked}
                        onCheckedChange={setBulkNotifyClicked}
                        className="border-2 border-white data-[state=unchecked]:bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      {bulkNotifyClicked ? (
                        <span className="text-card-foreground">
                          {selectedRows.length} {selectedRows.length === 1 ? 'person' : 'people'} to be notified
                        </span>
                      ) : (
                        <span className="text-card-foreground">
                          Send Notification
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4"></td>
                </tr>
                <tr className="bg-primary/10 border-b-2 border-primary">
                  <td colSpan={11} className="px-3 pb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleApplyBulkEdit}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelBulkEdit}
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground h-8 px-3"
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              </>
            )}

            {/* Empty State */}
            {!isAddingMember && sortedRoster.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center">
                  <span className="text-muted-foreground">
                    There are no roster members yet. Click + Invite Member to add a member.
                  </span>
                </td>
              </tr>
            )}

            {/* Add New Member Row */}
            {isAddingMember && (
              <>
                <tr className="bg-card/50">
                  <td className="px-3 py-4"></td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                      <Popover open={newMemberPersonOpen} onOpenChange={setNewMemberPersonOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={newMemberPersonOpen}
                            className={`w-full justify-between bg-input-background mt-4 ${newMemberPersonError ? 'border-destructive' : 'border-border'}`}
                          >
                            {newMember.person || "Select email..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-popover text-popover-foreground" align="start">
                          <Command className="bg-popover">
                            <CommandInput placeholder="Search email..." className="bg-input-background border-border" />
                            <CommandList>
                              <CommandEmpty className="text-muted-foreground">No email found.</CommandEmpty>
                              <CommandGroup>
                                {AVAILABLE_MEMBERS.map((email) => (
                                  <CommandItem
                                    key={email}
                                    value={email}
                                    onSelect={(currentValue) => {
                                      setNewMember({ ...newMember, person: currentValue });
                                      setNewMemberPersonOpen(false);
                                      setNewMemberPersonError(validateField(currentValue));
                                    }}
                                    className="text-card-foreground hover:bg-muted/10"
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        newMember.person === email ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {email}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="h-4 mt-0.5">
                        {newMemberPersonError && (
                          <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                            {newMemberPersonError}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                      <Popover open={newMemberPositionOpen} onOpenChange={setNewMemberPositionOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={newMemberPositionOpen}
                            className={`w-full justify-between bg-input-background mt-4 ${newMemberPositionError ? 'border-destructive' : 'border-border'}`}
                          >
                            {newMember.position || "Select position..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-popover text-popover-foreground" align="start">
                          <Command className="bg-popover">
                            <CommandInput placeholder="Search position..." className="bg-input-background border-border" />
                            <CommandList>
                              <CommandEmpty className="text-muted-foreground">No position found.</CommandEmpty>
                              <CommandGroup>
                                {AVAILABLE_POSITIONS.map((position) => (
                                  <CommandItem
                                    key={position}
                                    value={position}
                                    onSelect={(currentValue) => {
                                      setNewMember({ ...newMember, position: currentValue });
                                      setNewMemberPositionOpen(false);
                                      setNewMemberPositionError(validateField(currentValue));
                                    }}
                                    className="text-card-foreground hover:bg-muted/10"
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        newMember.position === position ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {position}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <div className="h-4 mt-0.5">
                        {newMemberPositionError && (
                          <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                            {newMemberPositionError}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={newMember.activationStatus}
                      onValueChange={(value: RosterMember['activationStatus']) =>
                        setNewMember({ ...newMember, activationStatus: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        {ACTIVATION_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={newMember.checkInStatus}
                      onValueChange={(value: RosterMember['checkInStatus']) =>
                        setNewMember({ ...newMember, checkInStatus: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        {CHECK_IN_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={newMember.signInStatus}
                      onValueChange={(value: RosterMember['signInStatus']) =>
                        setNewMember({ ...newMember, signInStatus: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        {SIGN_IN_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={newMember.letPersonSelfActivate}
                        onCheckedChange={(checked) =>
                          setNewMember({ ...newMember, letPersonSelfActivate: checked as boolean })
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={newMember.letPersonSelfCheckIn}
                        onCheckedChange={(checked) =>
                          setNewMember({ ...newMember, letPersonSelfCheckIn: checked as boolean })
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <Select
                      value={newMember.notificationMethod}
                      onValueChange={(value: RosterMember['notificationMethod']) =>
                        setNewMember({ ...newMember, notificationMethod: value })
                      }
                    >
                      <SelectTrigger className="w-full bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-popover-foreground">
                        {NOTIFICATION_METHOD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newMemberNotifyToggle}
                        onCheckedChange={setNewMemberNotifyToggle}
                        className="border-2 border-white data-[state=unchecked]:bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      {newMemberNotifyToggle ? (
                        <span className="text-card-foreground">
                          1 person to be notified
                        </span>
                      ) : (
                        <span className="text-card-foreground">
                          Send Notification
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4"></td>
                </tr>
                <tr className="border-b border-border bg-card/50">
                  <td className="px-3 pb-4" colSpan={10}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddMember}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingMember(false);
                          setNewMember({
                            person: '',
                            position: '',
                            activationStatus: 'inactive',
                            checkInStatus: 'not-checked-in',
                            signInStatus: 'not-signed-in',
                            letPersonSelfActivate: false,
                            letPersonSelfCheckIn: false,
                            notificationMethod: 'email',
                            notificationStatus: {
                              status: 'sent',
                              timestamp: new Date().toISOString(),
                            },
                          });
                          setNewMemberPersonError('');
                          setNewMemberPositionError('');
                          setNewMemberNotifyToggle(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              </>
            )}

            {/* Roster Members */}
            {sortedRoster.map((member) => (
              <React.Fragment key={member.id}>
                {/* Member Row */}
                {editingMemberId === member.id && editMemberData ? (
                  <>
                    <tr className="bg-card/50">
                      <td className="px-3 py-4"></td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col">
                          <Popover open={editMemberPersonOpen} onOpenChange={setEditMemberPersonOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={editMemberPersonOpen}
                                className={`w-full justify-between bg-input-background mt-4 ${editMemberPersonError ? 'border-destructive' : 'border-border'}`}
                              >
                                {editMemberData.person || "Select email..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 bg-popover text-popover-foreground" align="start">
                              <Command className="bg-popover">
                                <CommandInput placeholder="Search email..." className="bg-input-background border-border" />
                                <CommandList>
                                  <CommandEmpty className="text-muted-foreground">No email found.</CommandEmpty>
                                  <CommandGroup>
                                    {AVAILABLE_MEMBERS.map((email) => (
                                      <CommandItem
                                        key={email}
                                        value={email}
                                        onSelect={(currentValue) => {
                                          setEditMemberData({ ...editMemberData, person: currentValue });
                                          setEditMemberPersonOpen(false);
                                          setEditMemberPersonError(validateField(currentValue));
                                        }}
                                        className="text-card-foreground hover:bg-muted/10"
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            editMemberData.person === email ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        {email}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="h-4 mt-0.5">
                            {editMemberPersonError && (
                              <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                                {editMemberPersonError}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col">
                          <Popover open={editMemberPositionOpen} onOpenChange={setEditMemberPositionOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={editMemberPositionOpen}
                                className={`w-full justify-between bg-input-background mt-4 ${editMemberPositionError ? 'border-destructive' : 'border-border'}`}
                              >
                                {editMemberData.position || "Select position..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 bg-popover text-popover-foreground" align="start">
                              <Command className="bg-popover">
                                <CommandInput placeholder="Search position..." className="bg-input-background border-border" />
                                <CommandList>
                                  <CommandEmpty className="text-muted-foreground">No position found.</CommandEmpty>
                                  <CommandGroup>
                                    {AVAILABLE_POSITIONS.map((position) => (
                                      <CommandItem
                                        key={position}
                                        value={position}
                                        onSelect={(currentValue) => {
                                          setEditMemberData({ ...editMemberData, position: currentValue });
                                          setEditMemberPositionOpen(false);
                                          setEditMemberPositionError(validateField(currentValue));
                                        }}
                                        className="text-card-foreground hover:bg-muted/10"
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            editMemberData.position === position ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        {position}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <div className="h-4 mt-0.5">
                            {editMemberPositionError && (
                              <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                                {editMemberPositionError}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <Select
                          value={editMemberData.activationStatus}
                          onValueChange={(value: RosterMember['activationStatus']) =>
                            setEditMemberData({ ...editMemberData, activationStatus: value })
                          }
                        >
                          <SelectTrigger className="w-full bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground">
                            {ACTIVATION_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-4">
                        <Select
                          value={editMemberData.checkInStatus}
                          onValueChange={(value: RosterMember['checkInStatus']) =>
                            setEditMemberData({ ...editMemberData, checkInStatus: value })
                          }
                        >
                          <SelectTrigger className="w-full bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground">
                            {CHECK_IN_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-4">
                        <Select
                          value={editMemberData.signInStatus}
                          onValueChange={(value: RosterMember['signInStatus']) =>
                            setEditMemberData({ ...editMemberData, signInStatus: value })
                          }
                        >
                          <SelectTrigger className="w-full bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground">
                            {SIGN_IN_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={editMemberData.letPersonSelfActivate}
                            onCheckedChange={(checked) =>
                              setEditMemberData({ ...editMemberData, letPersonSelfActivate: checked as boolean })
                            }
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={editMemberData.letPersonSelfCheckIn}
                            onCheckedChange={(checked) =>
                              setEditMemberData({ ...editMemberData, letPersonSelfCheckIn: checked as boolean })
                            }
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <Select
                          value={editMemberData.notificationMethod}
                          onValueChange={(value: RosterMember['notificationMethod']) =>
                            setEditMemberData({ ...editMemberData, notificationMethod: value })
                          }
                        >
                          <SelectTrigger className="w-full bg-input-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover text-popover-foreground">
                            {NOTIFICATION_METHOD_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-card-foreground">
                            {editMemberData.notificationStatus.status.charAt(0).toUpperCase() + editMemberData.notificationStatus.status.slice(1)}
                          </span>
                          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                            {editMemberData.notificationStatus.timestamp.replace('T', ' ').replace('Z', '').substring(0, 19)} UTC
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 mt-1 border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              const member = roster.find(m => m.id === editingMemberId);
                              if (member) {
                                handleSendNotification(member);
                                setEditMemberData({
                                  ...editMemberData,
                                  notificationStatus: {
                                    status: 'sent',
                                    timestamp: new Date().toISOString(),
                                  },
                                });
                              }
                            }}
                          >
                            Notify
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-4"></td>
                    </tr>
                    <tr className="border-b border-border bg-card/50">
                      <td className="px-3 pb-4" colSpan={10}>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveMember}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditMember}
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr
                    className="border-b border-border hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedRows.includes(member.id)}
                          onCheckedChange={() => handleToggleRow(member.id)}
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </div>
                    </td>
                    <td className={`px-3 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <span className="text-card-foreground">{member.person}</span>
                    </td>
                    <td className={`px-3 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <span className="text-card-foreground">{member.position}</span>
                    </td>
                    <td className={`px-3 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <span className={getActivationStatusColor(member.activationStatus)}>
                        {ACTIVATION_STATUS_OPTIONS.find((s) => s.value === member.activationStatus)?.label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <span className={getCheckInStatusColor(member.checkInStatus)}>
                        {CHECK_IN_STATUS_OPTIONS.find((s) => s.value === member.checkInStatus)?.label}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <span className={getSignInStatusColor(member.signInStatus)}>
                        {SIGN_IN_STATUS_OPTIONS.find((s) => s.value === member.signInStatus)?.label}
                      </span>
                    </td>
                    <td className={`px-2 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={member.letPersonSelfActivate}
                          disabled
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </div>
                    </td>
                    <td className={`px-2 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={member.letPersonSelfCheckIn}
                          disabled
                          className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </div>
                    </td>
                    <td className={`px-3 py-4 ${!isBulkEditing ? 'cursor-pointer' : ''}`} onClick={!isBulkEditing ? () => handleEditMember(member) : undefined}>
                      <span className="text-card-foreground">
                        {NOTIFICATION_METHOD_OPTIONS.find((s) => s.value === member.notificationMethod)?.label}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-card-foreground">
                          {member.notificationStatus.status.charAt(0).toUpperCase() + member.notificationStatus.status.slice(1)}
                        </span>
                        <span className="text-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                          {member.notificationStatus.timestamp.replace('T', ' ').replace('Z', '').substring(0, 16)} UTC
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 mt-1 border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendNotification(member);
                          }}
                        >
                          Notify
                        </Button>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMember(member);
                          }}
                          aria-label={`Edit ${member.person}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMember(member.id);
                          }}
                          aria-label={`Delete ${member.person}`}
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
          {roster.length} {roster.length === 1 ? 'member' : 'members'}
        </span>
      </div>
    </div>
  );
}
