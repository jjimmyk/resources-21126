import React, { useState, useMemo } from 'react';
import { Trash2, Pencil, Map, ChevronDown, ChevronRight, Search, X, Filter, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './ui/sheet';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ApprovalProgressSection } from './ApprovalProgressSection';

interface ItemizedResource {
  id: string;
  ordered: string;
  orderedTimezone: string;
  eta: string;
  etaTimezone: string;
  unit: string;
  poc: string;
  hullTailNumber: string;
  personsOnBoard: string;
  phone: string;
  aor: string;
  status: 'requested' | 'in-transit' | 'checked-in' | 'checked-out';
  geolocationX: string;
  geolocationY: string;
  geolocationSource: string;
}

interface ResourceRequest {
  id: string;
  priority: string;
  orderId: string;
  reportingLocation: string;
  reportingSite?: string;
  reportingTime: string;
  reportingTimeTimezone: string;
  eta: string;
  etaTimezone: string;
  ordered: string;
  orderedTimezone: string;
  cost?: string;
  orderNumberLSC?: string;
  etaLSC?: string;
  requestRecipient?: string;
  requestCreator?: string;
  incident?: string;
  aor?: string;
  suggestedSourcesOfSupply?: string;
  acceptableSubstitutes?: string;
  kind?: string;
  type?: string;
  unit?: string;
  description?: string;
  workAssignment?: string;
  capabilityEnabled?: string;
  status?: 'pending-approval' | 'approved' | 'rejected' | 'fulfilled';
  approvalSteps?: {
    requestResource: { status: 'completed' | 'pending' | 'rejected'; approver?: string; comments?: string; timestamp?: string };
    sectionChief: { status: 'completed' | 'pending' | 'rejected'; approver?: string; comments?: string; timestamp?: string };
    reslReview: { status: 'completed' | 'pending' | 'rejected'; approver?: string; comments?: string; timestamp?: string; data?: { tactical?: boolean; personnel?: boolean; resourceStatus?: 'available' | 'not-available' } };
    logistics: { status: 'completed' | 'pending' | 'rejected'; approver?: string; comments?: string; timestamp?: string; data?: { orderNumber?: string; etaDate?: string; etaTime?: string; cost?: string; supplierName?: string; phone?: string; email?: string; useCustomSource?: boolean; sourceLocation?: string; orderPlacedBy?: string; orderPlacedByOther?: string; notes?: string } };
    finance: { status: 'completed' | 'pending' | 'rejected'; approver?: string; comments?: string; timestamp?: string };
  };
  currentApprovalStep?: 'requestResource' | 'sectionChief' | 'reslReview' | 'logistics' | 'finance';
}

interface Resource {
  id: string;
  resource: string;
  checkInStatus: 'checked-in' | 'not-checked-in';
  type: string;
  kind: string;
  quantity?: number;
  quantityOwned?: number;
  unit?: string;
  poc?: string;
  aor?: string;
  incident?: string;
  workAssignment?: string;
  requestRecipient?: string;
  currentLocation?: string;
  datetimeOrdered?: string;
  datetimeOrderedTimezone?: string;
  suggestedSourcesAndSubstitutes?: string;
  reslTactical?: boolean;
  reslPersonnel?: boolean;
  reslAvailable?: boolean;
  reslNotAvailable?: boolean;
  logisticsRequisitionNumber?: string;
  logisticsSupplier?: string;
  logisticsNotes?: string;
  logisticsOrderPlacedBySpul?: boolean;
  logisticsOrderPlacedByProc?: boolean;
  logisticsOrderPlacedByOther?: boolean;
  logisticsOrderPlacedByOtherText?: string;
  owner?: string;
  requestStatus?: string;
  latitude?: string;
  longitude?: string;
  assignedToWorkAssignmentListAttachment?: string;
  attachedToResourceRequest?: string;
  requestedReportingDatetime?: string;
  requestedDemobilizationDatetime?: string;
  assignee?: string;
  signInStatus?: string;
  linkedIncidentRosterPosition?: string;
  currentOpPeriod?: string;
  nextOpPeriod?: string;
  currentOpPeriodAssignment?: string;
  nextOpPeriodAssignment?: string;
  items: ItemizedResource[];
  resourceRequests: ResourceRequest[];
}

interface OrganizationalResource {
  id: string;
  name: string;
  kind: string;
  type: string;
  aor: string;
  incident: string;
  inIncident: boolean;
  category: string;
  strikeTeam: boolean;
  taskForce: boolean;
  homeUnitOrAgency: string;
}

const CHECK_IN_STATUS_OPTIONS = [
  { value: 'checked-in', label: 'Checked-In' },
  { value: 'not-checked-in', label: 'Checked-Out' },
];

const REQUEST_STATUS_OPTIONS = [
  { value: 'pending-approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'fulfilled', label: 'Fulfilled' },
];

const RESOURCE_OPTIONS = [
  'Helicopter Request',
  'Helicopter - MH-60 Jayhawk',
  'Requesting Cutter',
  'Cutter - 110ft Patrol Boat',
  'Cutter - 154ft Fast Response Cutter',
  'Cutter - 210ft Medium Endurance Cutter',
  'Cutter - 270ft Medium Endurance Cutter',
  'Cutter - 378ft High Endurance Cutter',
  'Boat - 45ft Response Boat-Medium',
  'Boat - 47ft Motor Lifeboat',
  'Boat - 29ft Response Boat-Small II',
  'Marine Safety Detachment',
  'Port Security Unit',
  'National Strike Force',
  'Investigation Team',
  'Pollution Response Team',
];

const TYPE_OPTIONS = [
  'Aircraft',
  'Vessel',
  'Boat',
  'Personnel Team',
  'Equipment',
  'Support Unit',
];

const AOR_OPTIONS = [
  'District 1',
  'District 5',
  'District 7',
  'District 8',
  'District 9',
  'District 11',
  'District 13',
  'District 14',
  'District 17',
];

const USCG_POSITIONS = [
  'Incident Commander',
  'Section Chief',
  'Operations Section Chief',
  'Planning Section Chief',
  'Logistics Section Chief',
  'Finance Section Chief',
  'Safety Officer',
  'Liaison Officer',
  'Public Information Officer',
];

const INCIDENT_OPTIONS = [
  'Boston Harbor Oil Spill Response',
  'San Francisco Bay Tanker Collision',
  'Great Lakes Ice Rescue Operation',
  'Florida Keys SAR - Missing Vessel',
  'Pacific Northwest Port Security',
];

const WORK_ASSIGNMENT_OPTIONS = [
  'Deploy Boom in AOR 5',
  'Offshore Medical Evacuation',
  'Vessel Traffic Control - Boston Harbor',
  'Oil Spill Containment - Sector 7',
  'Port State Control Inspection',
  'Buoy Maintenance - Channel Marker 12',
  'Ice Breaking Operations - Great Lakes',
  'Illegal Fishing Investigation',
  'Counter-Narcotics Patrol',
  'Migrant Vessel Interdiction',
  'Maritime Security Zone Enforcement',
  'Search Pattern Alpha - Grid 45',
  'Pollution Response Assessment',
  'Facility Inspection - Terminal 3',
  'Distressed Vessel Assistance',
];

// Work Assignment Details Database
const WORK_ASSIGNMENT_DETAILS: Record<string, {
  title: string;
  description: string;
  incident: string;
  aor: string;
  priority: string;
  status: string;
  assignedUnits: string[];
  operationalPeriod: string;
  resources: string[];
}> = {
  'Deploy Boom in AOR 5': {
    title: 'Deploy Boom in AOR 5',
    description: 'Deploy containment boom across the harbor entrance to prevent oil spill migration. Requires coordination with vessel traffic and local authorities.',
    incident: 'INC-2025-001',
    aor: 'District 1',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['USCGC Resolute', 'Station Boston'],
    operationalPeriod: '12/16/2025 0600-1800',
    resources: ['Boom Deployment Vessel', 'Harbor Containment Boom', 'Response Crew']
  },
  'Offshore Medical Evacuation': {
    title: 'Offshore Medical Evacuation',
    description: 'Emergency medical evacuation of injured crew member from offshore drilling platform. Requires helicopter and medical personnel.',
    incident: 'INC-2025-001',
    aor: 'District 1',
    priority: 'Critical',
    status: 'Active',
    assignedUnits: ['Air Station Cape Cod', 'Sector Boston Medical'],
    operationalPeriod: '12/16/2025 0800-2000',
    resources: ['MH-60 Jayhawk', 'Flight Medical Technician', 'Rescue Swimmer']
  },
  'Vessel Traffic Control - Boston Harbor': {
    title: 'Vessel Traffic Control - Boston Harbor',
    description: 'Monitor and coordinate vessel traffic in Boston Harbor during peak commercial shipping hours to ensure safe navigation.',
    incident: 'INC-2025-001',
    aor: 'District 1',
    priority: 'Medium',
    status: 'Active',
    assignedUnits: ['Sector Boston VTS', 'Station Point Allerton'],
    operationalPeriod: '12/16/2025 0600-2200',
    resources: ['VTS Operators', 'Small Boat Station', 'Communication Equipment']
  },
  'Oil Spill Containment - Sector 7': {
    title: 'Oil Spill Containment - Sector 7',
    description: 'Contain and recover oil spill from damaged tanker vessel. Deploy skimmers and conduct cleanup operations.',
    incident: 'INC-2025-002',
    aor: 'District 11',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['Station San Francisco', 'MSST San Francisco'],
    operationalPeriod: '12/16/2025 0600-1800',
    resources: ['Oil Skimmer Equipment', 'Containment Boom', 'Hazmat Response Team']
  },
  'Port State Control Inspection': {
    title: 'Port State Control Inspection',
    description: 'Conduct thorough safety and compliance inspection of foreign-flagged vessel in accordance with international maritime regulations.',
    incident: 'INC-2025-002',
    aor: 'District 11',
    priority: 'Medium',
    status: 'Scheduled',
    assignedUnits: ['Sector San Francisco PSC Team'],
    operationalPeriod: '12/17/2025 0900-1500',
    resources: ['Marine Inspectors', 'Inspection Equipment', 'Documentation Team']
  },
  'Buoy Maintenance - Channel Marker 12': {
    title: 'Buoy Maintenance - Channel Marker 12',
    description: 'Replace damaged navigation buoy and verify proper light operation in main shipping channel.',
    incident: 'INC-2025-003',
    aor: 'District 5',
    priority: 'Medium',
    status: 'Scheduled',
    assignedUnits: ['USCGC Oak', 'ANT Mobile'],
    operationalPeriod: '12/18/2025 0800-1600',
    resources: ['Buoy Tender Vessel', 'Navigation Aid Equipment', 'Marine Science Technician']
  },
  'Ice Breaking Operations - Great Lakes': {
    title: 'Ice Breaking Operations - Great Lakes',
    description: 'Break ice formations to maintain navigable shipping channels during winter operations in the Great Lakes region.',
    incident: 'INC-2025-004',
    aor: 'District 9',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['USCGC Mackinaw', 'Sector Detroit'],
    operationalPeriod: '12/16/2025 - 03/15/2026',
    resources: ['Icebreaker Vessel', 'Ice Navigation Team', 'Weather Monitoring Equipment']
  },
  'Illegal Fishing Investigation': {
    title: 'Illegal Fishing Investigation',
    description: 'Investigate reports of illegal fishing activity in protected marine sanctuary. Conduct vessel boardings and evidence collection.',
    incident: 'INC-2025-005',
    aor: 'District 7',
    priority: 'Medium',
    status: 'Active',
    assignedUnits: ['USCGC Charles David Jr.', 'Station Key West'],
    operationalPeriod: '12/16/2025 0600-2000',
    resources: ['Patrol Boat', 'Boarding Team', 'Law Enforcement Specialist']
  },
  'Counter-Narcotics Patrol': {
    title: 'Counter-Narcotics Patrol',
    description: 'Conduct counter-narcotics patrol operations in known drug trafficking corridor. Intercept and board suspicious vessels.',
    incident: 'INC-2025-006',
    aor: 'District 7',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['USCGC Hamilton', 'Tactical Law Enforcement Team'],
    operationalPeriod: '12/10/2025 - 12/24/2025',
    resources: ['Fast Response Cutter', 'Helicopter Support', 'Tactical Boarding Team']
  },
  'Migrant Vessel Interdiction': {
    title: 'Migrant Vessel Interdiction',
    description: 'Intercept and render assistance to vessel carrying undocumented migrants. Ensure safety and coordinate with appropriate agencies.',
    incident: 'INC-2025-007',
    aor: 'District 7',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['USCGC James', 'Air Station Miami'],
    operationalPeriod: '12/16/2025 0600-2200',
    resources: ['Medium Endurance Cutter', 'Helicopter', 'Medical Personnel']
  },
  'Maritime Security Zone Enforcement': {
    title: 'Maritime Security Zone Enforcement',
    description: 'Enforce maritime security zone around naval vessel during port visit. Monitor and control vessel traffic.',
    incident: 'INC-2025-008',
    aor: 'District 13',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['Station Seattle', 'MSST Seattle'],
    operationalPeriod: '12/16/2025 0000-2359',
    resources: ['Small Boats', 'Security Team', 'Communications Equipment']
  },
  'Search Pattern Alpha - Grid 45': {
    title: 'Search Pattern Alpha - Grid 45',
    description: 'Execute search and rescue pattern in designated grid to locate missing recreational vessel. Coordinate air and surface assets.',
    incident: 'INC-2025-009',
    aor: 'District 8',
    priority: 'Critical',
    status: 'Active',
    assignedUnits: ['Air Station New Orleans', 'Station Grand Isle'],
    operationalPeriod: '12/16/2025 0700-1900',
    resources: ['HC-144 Aircraft', 'Response Boat-Medium', 'Rescue Crew']
  },
  'Pollution Response Assessment': {
    title: 'Pollution Response Assessment',
    description: 'Assess environmental impact of chemical spill from industrial facility. Coordinate with EPA and state environmental agencies.',
    incident: 'INC-2025-010',
    aor: 'District 8',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['Sector Mobile', 'MSU Texas City'],
    operationalPeriod: '12/16/2025 0800-1700',
    resources: ['Marine Safety Specialists', 'Sampling Equipment', 'Environmental Assessment Team']
  },
  'Facility Inspection - Terminal 3': {
    title: 'Facility Inspection - Terminal 3',
    description: 'Conduct annual facility security inspection of major cruise terminal. Verify compliance with MARSEC requirements.',
    incident: 'INC-2025-011',
    aor: 'District 11',
    priority: 'Low',
    status: 'Scheduled',
    assignedUnits: ['Sector Los Angeles-Long Beach'],
    operationalPeriod: '12/17/2025 1000-1600',
    resources: ['Facility Inspectors', 'Security Assessment Team', 'Documentation Equipment']
  },
  'Distressed Vessel Assistance': {
    title: 'Distressed Vessel Assistance',
    description: 'Provide assistance to disabled fishing vessel taking on water. Deploy dewatering pumps and tow to safe harbor.',
    incident: 'INC-2025-012',
    aor: 'District 17',
    priority: 'High',
    status: 'Active',
    assignedUnits: ['Station Juneau', 'USCGC Bailey Barco'],
    operationalPeriod: '12/16/2025 1000-2000',
    resources: ['Response Boat-Medium', 'Dewatering Equipment', 'Salvage Team']
  }
};

const KIND_OPTIONS = [
  'Personnel',
  'Equipment',
  'Teams',
  'Supplies',
  'Facilities',
  'Epidemiological Supplies',
  'Epidemiologists',
  'Epidemiological Equipment',
  'Epidemiological Response Teams',
];

const REPORTING_SITE_OPTIONS = [
  'Incident Command Post',
  'Staging Area',
];

const formatDateTimeMilitary = (dateString: string, timezone: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes} ${timezone || 'UTC'}`;
};

const getCheckInStatusColor = (status: Resource['checkInStatus']) => {
  switch (status) {
    case 'checked-in':
      return 'text-status-success';
    case 'not-checked-in':
      return 'text-status-error';
    default:
      return 'text-card-foreground';
  }
};

const getRequestStatusStyle = (status: ResourceRequest['status']) => {
  // Get CSS variable values
  const getComputedColor = (varName: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
    return '';
  };

  switch (status) {
    case 'pending-approval':
      const warningColor = getComputedColor('--status-warning') || 'rgba(234, 179, 8, 1)';
      return { 
        bg: warningColor.replace('1)', '0.15)'), 
        text: warningColor, 
        border: warningColor.replace('1)', '0.3)') 
      };
    case 'approved':
      const successColor = getComputedColor('--status-success') || 'rgba(34, 197, 94, 1)';
      return { 
        bg: successColor.replace('1)', '0.15)'), 
        text: successColor, 
        border: successColor.replace('1)', '0.3)') 
      };
    case 'rejected':
      const errorColor = getComputedColor('--status-error') || 'rgba(239, 68, 68, 1)';
      return { 
        bg: errorColor.replace('1)', '0.15)'), 
        text: errorColor, 
        border: errorColor.replace('1)', '0.3)') 
      };
    case 'fulfilled':
      const accentColor = getComputedColor('--accent') || 'rgba(2, 163, 254, 1)';
      return { 
        bg: accentColor.replace('1)', '0.15)'), 
        text: accentColor, 
        border: accentColor.replace('1)', '0.3)') 
      };
    default:
      const mutedColor = getComputedColor('--muted') || 'rgba(175, 181, 188, 1)';
      return { 
        bg: mutedColor.replace('1)', '0.15)'), 
        text: mutedColor, 
        border: mutedColor.replace('1)', '0.3)') 
      };
  }
};

const getWorkAssignmentStyle = (assignment: string) => {
  const lowerAssignment = assignment.toLowerCase();
  
  // Search and Rescue related
  if (lowerAssignment.includes('search') || lowerAssignment.includes('rescue') || lowerAssignment.includes('medical evacuation') || lowerAssignment.includes('distressed vessel')) {
    return { bg: 'rgba(2, 163, 254, 0.15)', text: 'rgba(56, 183, 254, 1)', border: 'rgba(56, 183, 254, 0.3)' };
  } 
  // Law Enforcement / Security related
  else if (lowerAssignment.includes('law enforcement') || lowerAssignment.includes('security zone') || lowerAssignment.includes('vessel traffic control')) {
    return { bg: 'rgba(1, 102, 159, 0.15)', text: 'rgba(1, 102, 159, 1)', border: 'rgba(1, 102, 159, 0.3)' };
  } 
  // Port Security related
  else if (lowerAssignment.includes('port') || lowerAssignment.includes('facility inspection') || lowerAssignment.includes('terminal')) {
    return { bg: 'rgba(249, 115, 22, 0.15)', text: 'rgba(249, 115, 22, 1)', border: 'rgba(249, 115, 22, 0.3)' };
  } 
  // Environmental / Pollution related
  else if (lowerAssignment.includes('environmental') || lowerAssignment.includes('pollution') || lowerAssignment.includes('oil spill') || lowerAssignment.includes('boom')) {
    return { bg: 'rgba(34, 197, 94, 0.15)', text: 'rgba(34, 197, 94, 1)', border: 'rgba(34, 197, 94, 0.3)' };
  } 
  // Marine Safety / Inspection related
  else if (lowerAssignment.includes('marine safety') || lowerAssignment.includes('inspection') || lowerAssignment.includes('state control')) {
    return { bg: 'rgba(110, 202, 254, 0.15)', text: 'rgba(110, 202, 254, 1)', border: 'rgba(110, 202, 254, 0.3)' };
  } 
  // Aids to Navigation / Buoy related
  else if (lowerAssignment.includes('aids to navigation') || lowerAssignment.includes('aton') || lowerAssignment.includes('buoy') || lowerAssignment.includes('marker')) {
    return { bg: 'rgba(234, 179, 8, 0.15)', text: 'rgba(234, 179, 8, 1)', border: 'rgba(234, 179, 8, 0.3)' };
  } 
  // Ice Operations
  else if (lowerAssignment.includes('ice')) {
    return { bg: 'rgba(163, 222, 255, 0.15)', text: 'rgba(163, 222, 255, 1)', border: 'rgba(163, 222, 255, 0.3)' };
  } 
  // Fisheries Enforcement
  else if (lowerAssignment.includes('fisheries') || lowerAssignment.includes('fishing')) {
    return { bg: 'rgba(1, 41, 64, 0.35)', text: 'rgba(110, 202, 254, 1)', border: 'rgba(1, 41, 64, 0.5)' };
  } 
  // Counter-Narcotics
  else if (lowerAssignment.includes('drug') || lowerAssignment.includes('narcotic')) {
    return { bg: 'rgba(240, 68, 56, 0.15)', text: 'rgba(240, 68, 56, 1)', border: 'rgba(240, 68, 56, 0.3)' };
  } 
  // Migrant Interdiction
  else if (lowerAssignment.includes('migrant')) {
    return { bg: 'rgba(175, 181, 188, 0.15)', text: 'rgba(175, 181, 188, 1)', border: 'rgba(175, 181, 188, 0.3)' };
  } 
  // Default
  else {
    return { bg: 'rgba(110, 117, 124, 0.15)', text: 'rgba(175, 181, 188, 1)', border: 'rgba(110, 117, 124, 0.3)' };
  }
};

const ORGANIZATIONAL_RESOURCES: OrganizationalResource[] = [
  { id: '1', name: 'CG-6031', kind: 'Helicopter - MH-60 Jayhawk', type: 'Aircraft', aor: 'District 1', incident: 'INC-2025-001', inIncident: true, category: 'FF Firefighting', strikeTeam: false, taskForce: true, homeUnitOrAgency: 'Air Station Cape Cod' },
  { id: '2', name: 'USCGC Point Ledge', kind: 'Cutter - 110ft Patrol Boat', type: 'Vessel', aor: 'District 1', incident: 'INC-2025-001', inIncident: true, category: 'SK Skimmer', strikeTeam: true, taskForce: false, homeUnitOrAgency: 'Sector Boston' },
  { id: '3', name: 'RBM-45624', kind: 'Response Boat-Medium', type: 'Boat', aor: 'District 5', incident: 'INC-2025-002', inIncident: false, category: 'FF Firefighting', strikeTeam: false, taskForce: false, homeUnitOrAgency: 'Station Portsmouth' },
  { id: '4', name: 'MSD Hampton Roads', kind: 'Marine Safety Detachment', type: 'Personnel Team', aor: 'District 7', incident: 'INC-2025-003', inIncident: false, category: 'SK Skimmer', strikeTeam: true, taskForce: true, homeUnitOrAgency: 'Sector Hampton Roads' },
  { id: '5', name: 'PSU 311', kind: 'Port Security Unit', type: 'Support Unit', aor: 'District 9', incident: 'INC-2025-004', inIncident: true, category: 'FF Firefighting', strikeTeam: false, taskForce: true, homeUnitOrAgency: 'PSU 311 Chicago' },
  { id: '6', name: 'NSF Pacific', kind: 'National Strike Force', type: 'Personnel Team', aor: 'District 11', incident: 'INC-2025-005', inIncident: true, category: 'SK Skimmer', strikeTeam: true, taskForce: true, homeUnitOrAgency: 'NSF Pacific Strike Team' },
  { id: '7', name: 'USCGC Charles Moulthrope', kind: 'Cutter - 154ft Fast Response Cutter', type: 'Vessel', aor: 'District 13', incident: 'INC-2025-001', inIncident: true, category: 'FF Firefighting', strikeTeam: true, taskForce: false, homeUnitOrAgency: 'Sector Puget Sound' },
  { id: '8', name: 'CG-6587', kind: 'Helicopter - MH-65 Dolphin', type: 'Aircraft', aor: 'District 14', incident: 'INC-2025-002', inIncident: true, category: 'SK Skimmer', strikeTeam: false, taskForce: true, homeUnitOrAgency: 'Air Station Barbers Point' },
  { id: '9', name: 'CGIS Team Alpha', kind: 'Investigation Team', type: 'Personnel Team', aor: 'District 17', incident: 'INC-2025-003', inIncident: true, category: 'FF Firefighting', strikeTeam: false, taskForce: false, homeUnitOrAgency: 'CGIS Headquarters' },
  { id: '10', name: 'PRT-08', kind: 'Pollution Response Team', type: 'Personnel Team', aor: 'District 8', incident: 'INC-2025-004', inIncident: true, category: 'SK Skimmer', strikeTeam: true, taskForce: false, homeUnitOrAgency: 'Sector New Orleans' },
  { id: '11', name: 'USCGC Bear', kind: 'Cutter - 210ft Medium Endurance Cutter', type: 'Vessel', aor: 'District 1', incident: 'INC-2025-001', inIncident: false, category: 'FF Firefighting', strikeTeam: false, taskForce: true, homeUnitOrAgency: 'Sector Portsmouth' },
  { id: '12', name: 'MLB-47301', kind: 'Boat - 47ft Motor Lifeboat', type: 'Boat', aor: 'District 5', incident: 'INC-2025-002', inIncident: false, category: 'SK Skimmer', strikeTeam: true, taskForce: true, homeUnitOrAgency: 'Station Ocean City' },
  { id: '13', name: 'USCGC Seneca', kind: 'Cutter - 270ft Medium Endurance Cutter', type: 'Vessel', aor: 'District 7', incident: 'INC-2025-005', inIncident: true, category: 'FF Firefighting', strikeTeam: true, taskForce: true, homeUnitOrAgency: 'Sector Miami' },
  { id: '14', name: 'RBS-29418', kind: 'Boat - 29ft Response Boat-Small II', type: 'Boat', aor: 'District 11', incident: 'INC-2025-001', inIncident: false, category: 'SK Skimmer', strikeTeam: false, taskForce: false, homeUnitOrAgency: 'Station San Diego' },
  { id: '15', name: 'USCGC Boutwell', kind: 'Cutter - 378ft High Endurance Cutter', type: 'Vessel', aor: 'District 13', incident: 'INC-2025-003', inIncident: true, category: 'FF Firefighting', strikeTeam: false, taskForce: true, homeUnitOrAgency: 'Sector Seattle' },
];

export function IncidentResources() {
  // Helper function to generate a random 5-digit number for Order ID
  const generateOrderId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const [resourceOptions, setResourceOptions] = useState<string[]>(RESOURCE_OPTIONS);
  const [typeOptions, setTypeOptions] = useState<string[]>(TYPE_OPTIONS);
  const [isAddingNewResource, setIsAddingNewResource] = useState(false);
  const [isAddingNewType, setIsAddingNewType] = useState(false);
  const [newResourceName, setNewResourceName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [isCustomReportingSite, setIsCustomReportingSite] = useState(false);
  const [isEditCustomReportingSite, setIsEditCustomReportingSite] = useState(false);
  const [isAddingCustomKind, setIsAddingCustomKind] = useState<{ [key: string]: boolean }>({});
  const [isAddingCustomType, setIsAddingCustomType] = useState<{ [key: string]: boolean }>({});
  const [customKindValue, setCustomKindValue] = useState<{ [key: string]: string }>({});
  const [customTypeValue, setCustomTypeValue] = useState<{ [key: string]: string }>({});
  const [kindOptions, setKindOptions] = useState<string[]>(KIND_OPTIONS);
  const [showAddItemRow, setShowAddItemRow] = useState(false);
  const [addItemQuantity, setAddItemQuantity] = useState('');
  const [addItemKind, setAddItemKind] = useState('');
  const [addItemType, setAddItemType] = useState('');
  const [addItemPriority, setAddItemPriority] = useState('Medium');
  const [addItemDescription, setAddItemDescription] = useState('');
  const [addItemReportingLocation, setAddItemReportingLocation] = useState('');
  const [addItemReportingDatetime, setAddItemReportingDatetime] = useState('');
  const [addItemDemobilizationDatetime, setAddItemDemobilizationDatetime] = useState('');
  const [addItemOrderNumber, setAddItemOrderNumber] = useState('');
  const [addItemETA, setAddItemETA] = useState('');
  const [addItemCost, setAddItemCost] = useState('');
  
  const [resources, setResources] = useState<Resource[]>([
    {
      id: 'ic-001',
      resource: 'Incident Commander',
      checkInStatus: 'checked-in',
      type: 'Personnel',
      kind: 'Personnel',
      unit: 'Sector Boston',
      poc: 'CDR John Mitchell',
      aor: 'District 1',
      incident: 'Boston Harbor Oil Spill Response',
      assignee: 'CAPT John Smith',
      linkedIncidentRosterPosition: 'Incident Commander',
      items: [],
      resourceRequests: [],
    },
    {
      id: 'rul-001',
      resource: 'Resource Unit Leader',
      checkInStatus: 'checked-in',
      type: 'Personnel',
      kind: 'Personnel',
      unit: 'Sector Boston',
      poc: 'CDR John Mitchell',
      aor: 'District 1',
      incident: 'Boston Harbor Oil Spill Response',
      assignee: 'CAPT John Smith',
      signInStatus: 'Signed In',
      linkedIncidentRosterPosition: 'Resource Unit Leader',
      items: [],
      resourceRequests: [],
    },
    {
      id: '14573',
      resource: 'Helicopter Request',
      checkInStatus: 'checked-in',
      type: 'Type 1',
      kind: 'equipment',
      quantity: 2,
      quantityOwned: 5,
      unit: 'Air Station Cape Cod',
      poc: 'Lt. Sarah Johnson',
      aor: 'District 1',
      incident: 'INC-2025-001',
      workAssignment: 'Offshore Medical Evacuation',
      requestRecipient: 'Sector Boston',
      currentLocation: 'Air Station Cape Cod, MA',
      datetimeOrdered: '2025-11-08T08:30',
      datetimeOrderedTimezone: 'UTC',
      owner: 'District',
      items: [
        {
          id: '1-1',
          ordered: '2025-10-23T10:00',
          orderedTimezone: 'UTC',
          eta: '2025-10-24T14:30',
          etaTimezone: 'UTC',
          unit: 'Air Station Cape Cod',
          poc: 'Lt. Sarah Johnson',
          hullTailNumber: '6565',
          personsOnBoard: 'Lt. Johnson, AMT2 Davis, AMT3 Chen',
          phone: '(508) 555-0123',
          aor: 'District 1',
          status: 'checked-in',
          geolocationX: '41.6688',
          geolocationY: '-70.2962',
          geolocationSource: 'GPS',
        },
        {
          id: '1-2',
          ordered: '2025-10-23T11:30',
          orderedTimezone: 'EST',
          eta: '2025-10-24T16:00',
          etaTimezone: 'EST',
          unit: 'Air Station Cape Cod',
          poc: 'Lt. Mark Stevens',
          hullTailNumber: '6566',
          personsOnBoard: 'Lt. Stevens, AMT1 Rodriguez, AMT2 Park',
          phone: '(508) 555-0124',
          aor: 'District 1',
          status: 'in-transit',
          geolocationX: '41.7544',
          geolocationY: '-70.6119',
          geolocationSource: 'AIS Transponder',
        },
        {
          id: '1-3',
          ordered: '2025-10-23T12:00',
          orderedTimezone: 'UTC',
          eta: '2025-10-24T18:00',
          etaTimezone: 'UTC',
          unit: 'Air Station Cape Cod',
          poc: 'Lt. Emily Carter',
          hullTailNumber: '6567',
          personsOnBoard: 'Lt. Carter, AMT1 Williams',
          phone: '(508) 555-0125',
          aor: 'District 1',
          status: 'requested',
          geolocationX: '41.6432',
          geolocationY: '-70.2845',
          geolocationSource: 'Manual',
        },
      ],
      resourceRequests: [
        {
          id: 'req-1-1',
          priority: 'High',
          orderId: 'ORD-2025-001',
          reportingLocation: 'Air Station Cape Cod',
          reportingSite: 'Incident Command Post',
          reportingTime: '2025-10-24T14:00',
          reportingTimeTimezone: 'UTC',
          eta: '2025-10-24T14:30',
          etaTimezone: 'UTC',
          ordered: '2025-10-23T10:00',
          orderedTimezone: 'UTC',
          cost: '15000',
          requestRecipient: 'Sector Boston',
          requestCreator: 'Lt. Sarah Johnson',
          incident: 'INC-2025-001',
          aor: 'District 1',
          suggestedSourcesOfSupply: 'Air Station Cape Cod, Air Station Elizabeth City, Air Station Atlantic City',
          acceptableSubstitutes: 'Helicopter - MH-60 Jayhawk, Helicopter - HH-65 Dolphin',
          kind: 'Helicopter',
          type: 'Aircraft',
          unit: 'Air Station Cape Cod',
          description: 'Search and rescue helicopter with hoist capability for maritime SAR operations. Required for offshore medical evacuation and vessel assist missions.',
          workAssignment: 'Offshore Medical Evacuation',
          status: 'pending-approval',
          approvalSteps: {
            requestResource: { status: 'completed', approver: 'Lt. Sarah Johnson', timestamp: '2025-10-23T10:00:00Z' },
            sectionChief: { status: 'pending', approver: undefined, timestamp: undefined },
            reslReview: { status: 'pending', approver: undefined, timestamp: undefined },
            logistics: { status: 'pending', approver: undefined, timestamp: undefined },
            finance: { status: 'pending', approver: undefined, timestamp: undefined },
          },
          currentApprovalStep: 'sectionChief',
        },
        {
          id: 'req-1-2',
          priority: 'Medium',
          orderId: 'ORD-2025-002',
          reportingLocation: 'Air Station Cape Cod',
          reportingSite: 'Staging Area',
          reportingTime: '2025-10-24T15:30',
          reportingTimeTimezone: 'EST',
          eta: '2025-10-24T16:00',
          etaTimezone: 'EST',
          ordered: '2025-10-23T11:30',
          orderedTimezone: 'EST',
          cost: '12000',
          requestRecipient: 'Sector Boston',
          requestCreator: 'Lt. Emily Carter',
          incident: 'INC-2025-001',
          aor: 'District 1',
          suggestedSourcesOfSupply: 'Air Station Cape Cod, Air Station Brooklyn',
          acceptableSubstitutes: 'Helicopter - HH-60 Pave Hawk',
          kind: 'Helicopter',
          type: 'Aircraft',
          unit: 'Air Station Cape Cod',
          description: 'Secondary air asset for extended search pattern coverage and crew rotation during prolonged SAR operations.',
          workAssignment: 'Search Pattern Alpha - Grid 45',
          status: 'approved',
          approvalSteps: {
            requestResource: { status: 'completed', approver: 'Lt. Emily Carter', timestamp: '2025-10-23T11:30:00Z' },
            sectionChief: { status: 'completed', approver: 'CDR Mike Thompson', comments: 'Approved for SAR operations', timestamp: '2025-10-23T12:00:00Z' },
            reslReview: { status: 'completed', approver: 'LCDR James Wilson', comments: 'Resource allocation confirmed', timestamp: '2025-10-23T13:15:00Z' },
            logistics: { status: 'completed', approver: 'LT Karen Martinez', comments: 'Logistics support ready', timestamp: '2025-10-23T14:00:00Z' },
            finance: { status: 'completed', approver: 'LT David Chen', comments: 'Budget approved', timestamp: '2025-10-23T14:30:00Z' },
          },
          currentApprovalStep: 'finance',
        },
      ],
    },
    {
      id: '72674',
      resource: 'Requesting Cutter',
      checkInStatus: 'not-checked-in',
      type: 'Type 2',
      kind: 'facilities',
      quantity: 1,
      quantityOwned: 3,
      unit: 'Sector Boston',
      poc: 'BMC James Wilson',
      aor: 'District 1',
      incident: 'INC-2025-001',
      workAssignment: 'Vessel Traffic Control - Boston Harbor',
      requestRecipient: 'District 1 Command Center',
      currentLocation: 'Boston Harbor, MA',
      datetimeOrdered: '2025-11-08T06:15',
      datetimeOrderedTimezone: 'EST',
      owner: 'Sector',
      items: [
        {
          id: '2-1',
          ordered: '2025-10-23T08:00',
          orderedTimezone: 'UTC',
          eta: '2025-10-24T16:00',
          etaTimezone: 'EST',
          unit: 'Sector Boston',
          poc: 'BMC James Wilson',
          hullTailNumber: 'WPB-87345',
          personsOnBoard: 'BMC Wilson, BM2 Taylor, MK3 Lee, SN Garcia',
          phone: '(617) 555-0201',
          aor: 'District 1',
          status: 'in-transit',
          geolocationX: '42.3601',
          geolocationY: '-71.0589',
          geolocationSource: 'GPS',
        },
        {
          id: '2-2',
          ordered: '2025-10-24T10:00',
          orderedTimezone: 'EST',
          eta: '2025-10-25T08:00',
          etaTimezone: 'EST',
          unit: 'Sector Boston',
          poc: 'BM1 Jennifer Adams',
          hullTailNumber: 'WPB-87346',
          personsOnBoard: 'BM1 Adams, MK2 Brown, SN Martinez',
          phone: '(617) 555-0202',
          aor: 'District 1',
          status: 'checked-out',
          geolocationX: '42.3744',
          geolocationY: '-71.0312',
          geolocationSource: 'DGPS',
        },
      ],
      resourceRequests: [
        {
          id: 'req-2-1',
          priority: 'Critical',
          orderId: 'ORD-2025-003',
          reportingLocation: 'Sector Boston Dock 3',
          reportingSite: 'Incident Command Post',
          reportingTime: '2025-10-24T15:30',
          reportingTimeTimezone: 'EST',
          eta: '2025-10-24T16:00',
          etaTimezone: 'EST',
          ordered: '2025-10-23T08:00',
          orderedTimezone: 'UTC',
          cost: '8500',
          requestRecipient: 'District 1 Command Center',
          requestCreator: 'CDR Michael Thompson',
          incident: 'INC-2025-002',
          aor: 'District 1',
          suggestedSourcesOfSupply: 'Sector Boston, Station Gloucester, Station Provincetown',
          acceptableSubstitutes: 'Cutter - 110ft Patrol Boat, Cutter - 154ft Fast Response Cutter',
          kind: 'Cutter',
          type: 'Vessel',
          unit: 'Sector Boston',
          description: 'Medium endurance cutter for extended patrol operations and law enforcement boarding teams. Required for vessel traffic control and maritime security zone enforcement.',
          status: 'pending-approval',
          approvalSteps: {
            requestResource: { status: 'completed', approver: 'CDR Michael Thompson', timestamp: '2025-10-23T08:00:00Z' },
            sectionChief: { status: 'completed', approver: 'CAPT Robert Harris', comments: 'Approved for law enforcement', timestamp: '2025-10-23T09:00:00Z' },
            reslReview: { status: 'completed', approver: 'CDR Patricia Lee', comments: 'Resource verified', timestamp: '2025-10-23T10:30:00Z' },
            logistics: { status: 'pending', approver: undefined, timestamp: undefined },
            finance: { status: 'pending', approver: undefined, timestamp: undefined },
          },
          currentApprovalStep: 'logistics',
        },
      ],
    },
    {
      id: '42573',
      resource: 'Marine Safety Detachment',
      checkInStatus: 'not-checked-in',
      type: 'Type 3',
      kind: 'teams',
      quantity: 4,
      quantityOwned: 8,
      unit: 'Sector San Francisco',
      poc: 'LCDR Michael Chen',
      aor: 'District 11',
      incident: 'INC-2025-002',
      workAssignment: 'Port State Control Inspection',
      requestRecipient: 'Sector San Francisco Operations',
      currentLocation: 'Sector San Francisco HQ, CA',
      datetimeOrdered: '2025-11-08T14:45',
      datetimeOrderedTimezone: 'PST',
      owner: 'Area',
      items: [
        {
          id: '3-1',
          ordered: '2025-10-24T12:00',
          orderedTimezone: 'UTC',
          eta: '2025-10-25T08:00',
          etaTimezone: 'PST',
          unit: 'Sector San Francisco',
          poc: 'LCDR Michael Chen',
          hullTailNumber: 'N/A',
          personsOnBoard: 'LCDR Chen, LT Martinez, MST1 Kim',
          phone: '(415) 555-0301',
          aor: 'District 11',
          status: 'requested',
          geolocationX: '37.8080',
          geolocationY: '-122.4177',
          geolocationSource: 'Manual',
        },
        {
          id: '3-2',
          ordered: '2025-10-24T13:30',
          orderedTimezone: 'UTC',
          eta: '2025-10-25T09:30',
          etaTimezone: 'PST',
          unit: 'Sector San Francisco',
          poc: 'LT Amanda Rodriguez',
          hullTailNumber: 'N/A',
          personsOnBoard: 'LT Rodriguez, MST2 Brown, MST3 White',
          phone: '(415) 555-0302',
          aor: 'District 11',
          status: 'requested',
          geolocationX: '37.7749',
          geolocationY: '-122.4194',
          geolocationSource: 'GPS',
        },
        {
          id: '3-3',
          ordered: '2025-10-24T15:00',
          orderedTimezone: 'UTC',
          eta: '2025-10-25T11:00',
          etaTimezone: 'PST',
          unit: 'Sector San Francisco',
          poc: 'LTJG Chris Park',
          hullTailNumber: 'N/A',
          personsOnBoard: 'LTJG Park, MST1 Anderson, MST2 Thompson',
          phone: '(415) 555-0303',
          aor: 'District 11',
          status: 'requested',
          geolocationX: '37.8267',
          geolocationY: '-122.4233',
          geolocationSource: 'Radar',
        },
      ],
      resourceRequests: [
        {
          id: 'req-3-1',
          priority: 'Low',
          orderId: 'ORD-2025-004',
          reportingLocation: 'Sector SF Building A',
          reportingSite: 'Staging Area',
          reportingTime: '2025-10-25T07:30',
          reportingTimeTimezone: 'PST',
          eta: '2025-10-25T08:00',
          etaTimezone: 'PST',
          ordered: '2025-10-24T12:00',
          orderedTimezone: 'UTC',
          cost: '5500',
          requestRecipient: 'Sector San Francisco Operations',
          requestCreator: 'LTJG Chris Park',
          incident: 'INC-2025-003',
          aor: 'District 11',
          suggestedSourcesOfSupply: 'Sector San Francisco, Sector Los Angeles-Long Beach, Sector San Diego',
          acceptableSubstitutes: 'Marine Inspection Detachment, Port State Control Team',
          kind: 'Personnel',
          type: 'Personnel Team',
          unit: 'Sector San Francisco',
          description: 'Marine Safety Specialist team for vessel inspections and environmental compliance assessments. Required for hazardous materials incident response and vessel casualty investigation.',
          status: 'pending-approval',
          approvalSteps: {
            requestResource: { status: 'completed', approver: 'LTJG Chris Park', timestamp: '2025-10-24T12:00:00Z' },
            sectionChief: { status: 'pending', approver: undefined, timestamp: undefined },
            reslReview: { status: 'pending', approver: undefined, timestamp: undefined },
            logistics: { status: 'pending', approver: undefined, timestamp: undefined },
            finance: { status: 'pending', approver: undefined, timestamp: undefined },
          },
          currentApprovalStep: 'sectionChief',
        },
        {
          id: 'req-3-2',
          priority: 'Medium',
          orderId: 'ORD-2025-005',
          reportingLocation: 'Sector SF Building A',
          reportingSite: 'Incident Command Post',
          reportingTime: '2025-10-25T09:00',
          reportingTimeTimezone: 'PST',
          eta: '2025-10-25T09:30',
          etaTimezone: 'PST',
          ordered: '2025-10-24T13:30',
          orderedTimezone: 'UTC',
          cost: '5500',
          requestRecipient: 'Sector San Francisco Operations',
          suggestedSourcesOfSupply: 'Sector San Francisco, Sector Humboldt Bay',
          acceptableSubstitutes: 'Marine Safety Unit, Marine Safety Detachment',
          kind: 'Personnel',
          type: 'Personnel Team',
          unit: 'Sector San Francisco',
          description: 'Additional marine safety inspection team for increased operational tempo. Supports concurrent vessel examinations and port state control activities.',
          status: 'rejected',
          approvalSteps: {
            requestResource: { status: 'completed', approver: 'LTJG Chris Park', timestamp: '2025-10-24T13:30:00Z' },
            sectionChief: { status: 'completed', approver: 'CAPT Jennifer Wong', comments: 'Not approved - insufficient justification', timestamp: '2025-10-24T14:00:00Z' },
            reslReview: { status: 'pending', approver: undefined, timestamp: undefined },
            logistics: { status: 'pending', approver: undefined, timestamp: undefined },
            finance: { status: 'pending', approver: undefined, timestamp: undefined },
          },
          currentApprovalStep: 'sectionChief',
        },
        {
          id: 'req-3-3',
          priority: 'High',
          orderId: 'ORD-2025-006',
          reportingLocation: 'Sector SF Building B',
          reportingTime: '2025-10-25T10:30',
          reportingTimeTimezone: 'PST',
          eta: '2025-10-25T11:00',
          etaTimezone: 'PST',
          ordered: '2025-10-24T15:00',
          orderedTimezone: 'UTC',
          cost: '5500',
          requestRecipient: 'District 11 Operations Center',
          suggestedSourcesOfSupply: 'Sector San Francisco, District 11 Headquarters',
          acceptableSubstitutes: 'Incident Management Assist Team, Marine Safety Specialists',
          kind: 'Personnel',
          type: 'Personnel Team',
          unit: 'District 11 Headquarters',
          description: 'Incident Management Assist Team for command and control support during complex incident operations. Provides planning section expertise and resource coordination.',
          status: 'approved',
          approvalSteps: {
            requestResource: { status: 'completed', approver: 'LTJG Chris Park', timestamp: '2025-10-24T15:00:00Z' },
            sectionChief: { status: 'completed', approver: 'CAPT Jennifer Wong', comments: 'Approved for incident support', timestamp: '2025-10-24T16:00:00Z' },
            reslReview: { status: 'completed', approver: 'CDR Michael Anderson', comments: 'Resource confirmed available', timestamp: '2025-10-24T17:00:00Z' },
            logistics: { status: 'completed', approver: 'LCDR Sarah Martinez', position: 'Logistics Section Chief', comments: 'Transportation arranged', timestamp: '2025-10-24T18:00:00Z' },
            finance: { status: 'completed', approver: 'LT David Kim', position: 'Finance Section Chief', comments: 'Budget approved', timestamp: '2025-10-24T19:00:00Z' },
          },
          currentApprovalStep: 'finance',
        },
      ],
    },
  ]);

  const [organizationalResources, setOrganizationalResources] = useState<OrganizationalResource[]>(ORGANIZATIONAL_RESOURCES);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [expandedOrgResources, setExpandedOrgResources] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemizedResource | null>(null);
  const [viewMode, setViewMode] = useState<'assigned' | 'requests'>('assigned');
  const [workAssignmentModalOpen, setWorkAssignmentModalOpen] = useState(false);
  const [selectedWorkAssignment, setSelectedWorkAssignment] = useState<{
    title: string;
    resource: string;
    incident: string;
    type: string;
    unit: string;
    poc: string;
    aor: string;
  } | null>(null);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAllResourcesDrawerOpen, setIsAllResourcesDrawerOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<{
    resourceId: string;
    requestId: string;
    requestName: string;
    approverName: string;
    approverPosition: string;
    currentStep: 'requestResource' | 'sectionChief' | 'reslReview' | 'logistics' | 'finance';
    stepLabel: string;
    approvalTimestamp?: string;
  } | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [reslTactical, setReslTactical] = useState(false);
  const [reslPersonnel, setReslPersonnel] = useState(false);
  const [reslResourceStatus, setReslResourceStatus] = useState<'available' | 'not-available'>('available');
  
  // Logistics state
  const [logisticsOrderNumber, setLogisticsOrderNumber] = useState('');
  const [logisticsEtaDate, setLogisticsEtaDate] = useState('');
  const [logisticsEtaTime, setLogisticsEtaTime] = useState('');
  const [logisticsTimeZone, setLogisticsTimeZone] = useState('UTC');
  const [logisticsCost, setLogisticsCost] = useState('');
  const [logisticsSupplierName, setLogisticsSupplierName] = useState('');
  const [logisticsPhone, setLogisticsPhone] = useState('');
  const [logisticsEmail, setLogisticsEmail] = useState('');
  const [logisticsUseCustomSource, setLogisticsUseCustomSource] = useState(false);
  const [logisticsSourceLocation, setLogisticsSourceLocation] = useState('');
  const [logisticsOrderPlacedBy, setLogisticsOrderPlacedBy] = useState<'SPUL' | 'PROC' | 'Other'>('SPUL');
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [logisticsOrderPlacedByOther, setLogisticsOrderPlacedByOther] = useState('');
  
  // Editable approver name and position for approval dialog
  const [approverName, setApproverName] = useState('');
  const [approverPosition, setApproverPosition] = useState('');
  
  // ICS-213RR Preview toggle for approval modal
  const [showIcsPreview, setShowIcsPreview] = useState(false);
  
  // All Resources drawer form state
  const [allResourceName, setAllResourceName] = useState('');
  const [allResourceDescription, setAllResourceDescription] = useState('');
  const [allResourceType, setAllResourceType] = useState('');
  const [allResourceQuantity, setAllResourceQuantity] = useState('');
  const [allResourceOrderedDate, setAllResourceOrderedDate] = useState('');
  const [allResourceOrderedTime, setAllResourceOrderedTime] = useState('00:00');
  const [allResourceEtaDate, setAllResourceEtaDate] = useState('');
  const [allResourceEtaTime, setAllResourceEtaTime] = useState('00:00');
  const [allResourceStatus, setAllResourceStatus] = useState('');
  
  // Check-In drawer state
  const [isCheckInDrawerOpen, setIsCheckInDrawerOpen] = useState(false);
  const [checkInResourceId, setCheckInResourceId] = useState<string | null>(null);
  const [checkInFormData, setCheckInFormData] = useState({
    checkedInByName: '',
    checkedInByPosition: '',
    jurisdiction: '',
    agency: '',
    category: '',
    resourceKind: '',
    resourceType: '',
    stTf: '',
    resourceNameIdentifier: '',
    orderRequestNumber: '',
    leaderName: '',
    numberOfPersonnel: '0',
    incidentContactInfo: '',
    homeUnitAgency: '',
    useCustomDeparture: false,
    departureSite: '',
    departureDate: '',
    departureTime: '00:00',
    methodOfTravel: '',
    useCustomIncidentAssignment: false,
    incidentAssignmentLocation: '',
    otherQualifications: '',
    dataSentToRESL: '',
    dataSentTime: '00:00',
    sentByInitials: ''
  });
  const [personnelDetails, setPersonnelDetails] = useState<Array<{ name: string; contact: string }>>([]);
  
  const [newResource, setNewResource] = useState({
    resource: '',
    requestName: '',
    aor: '',
    incident: '',
    workAssignment: '',
    capabilityEnabled: '',
    suggestedSourcesAndSubstitutes: '',
    reslTactical: false,
    reslPersonnel: false,
    reslAvailable: false,
    reslNotAvailable: false,
    logisticsRequisitionNumber: '',
    logisticsSupplier: '',
    logisticsNotes: '',
    logisticsOrderPlacedBySpul: false,
    logisticsOrderPlacedByProc: false,
    logisticsOrderPlacedByOther: false,
    checkInStatus: 'checked-out' as 'checked-in' | 'not-checked-in',
    resourceItems: [{
      id: `item-${Date.now()}`,
      name: '',
      kind: '',
      type: '',
      unit: '',
      priority: '',
      description: '',
      suggestedSourcesOfSupply: '',
      acceptableSubstitutes: '',
      cost: '',
      orderNumberLSC: '',
      etaLSC: '',
      etaLSCTimezone: 'UTC',
      quantity: 0,
      reportingSite: '',
      reportingDateTime: '',
      reportingDateTimeTimezone: 'UTC',
      status: 'pending-approval' as ResourceRequest['status']
    }]
  });
  
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [expandedResourceItems, setExpandedResourceItems] = useState<Set<string>>(new Set());
  const [expandedIndividualRequests, setExpandedIndividualRequests] = useState<Set<string>>(new Set());
  const [editedResource, setEditedResource] = useState({
    resource: '',
    id: '',
    type: '',
    aor: '',
    incident: '',
    workAssignment: '',
    checkInStatus: 'checked-out' as 'checked-in' | 'not-checked-in',
    requestRecipient: '',
    poc: '',
    currentLocation: '',
    datetimeOrdered: '',
    datetimeOrderedTimezone: 'UTC',
    kind: '',
    unit: '',
    description: '',
    suggestedSourcesOfSupply: '',
    acceptableSubstitutes: '',
    suggestedSourcesAndSubstitutes: '',
    reslTactical: false,
    reslPersonnel: false,
    reslAvailable: false,
    reslNotAvailable: false,
    logisticsRequisitionNumber: '',
    logisticsSupplier: '',
    logisticsNotes: '',
    logisticsOrderPlacedBySpul: false,
    logisticsOrderPlacedByProc: false,
    logisticsOrderPlacedByOther: false,
    cost: '',
    quantity: 0,
    resourceItems: [{
      id: `item-${Date.now()}`,
      name: '',
      kind: '',
      type: '',
      unit: '',
      priority: '',
      description: '',
      suggestedSourcesOfSupply: '',
      acceptableSubstitutes: '',
      cost: '',
      orderNumberLSC: '',
      etaLSC: '',
      etaLSCTimezone: 'UTC',
      quantity: 0,
      reportingSite: '',
      reportingDateTime: '',
      reportingDateTimeTimezone: 'UTC',
      status: 'pending-approval' as ResourceRequest['status']
    }]
  });
  
  // Column filters - multi-select
  const [filterResource, setFilterResource] = useState<Set<string>>(new Set());
  const [filterId, setFilterId] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<Set<string>>(new Set());
  const [filterAor, setFilterAor] = useState<Set<string>>(new Set());
  const [filterIncident, setFilterIncident] = useState<Set<string>>(new Set());
  
  // Selected resources for attaching to request
  const [selectedResourcesToAttach, setSelectedResourcesToAttach] = useState<Set<string>>(new Set());
  const [attachedResources, setAttachedResources] = useState<Array<{ id: string; name: string; kind: string; type: string; quantity: number; availability: string; location: string; priority: string; requestedReportingLocation: string; requestedReportingDatetime: string; orderNumber: string; eta: string; cost: string }>>([]); 
  const [attachResourcesPopoverOpen, setAttachResourcesPopoverOpen] = useState(false);
  const [badgeResources, setBadgeResources] = useState<Array<{ id: string; name: string; kind: string; type: string; quantity: number; availability: string; availabilityUntil: string; location: string }>>([]); 
  const [addNewResourceModalOpen, setAddNewResourceModalOpen] = useState(false);
  const [filterWorkAssignment, setFilterWorkAssignment] = useState<Set<string>>(new Set());
  const [filterRequestedItems, setFilterRequestedItems] = useState<Set<string>>(new Set());
  const [submitConfirmationModalOpen, setSubmitConfirmationModalOpen] = useState(false);
  const [documentPreviewModalOpen, setDocumentPreviewModalOpen] = useState(false);
  const [filterCheckInStatus, setFilterCheckInStatus] = useState<Set<string>>(new Set());
  const [filterIncidentStatus, setFilterIncidentStatus] = useState<Set<string>>(new Set());
  const [filterRequestStatus, setFilterRequestStatus] = useState<Set<string>>(new Set());
  const [rosterPositionModalOpen, setRosterPositionModalOpen] = useState(false);

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((resource) => resource.id !== id));
    setSelectedResources((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSelectResource = (id: string, checked: boolean) => {
    setSelectedResources((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleWorkAssignmentClick = (resource: Resource) => {
    setSelectedWorkAssignment({
      title: resource.workAssignment,
      resource: resource.resource,
      incident: resource.incident,
      type: resource.type,
      unit: resource.unit,
      poc: resource.poc,
      aor: resource.aor,
    });
    setWorkAssignmentModalOpen(true);
  };

  const toggleRowExpansion = (id: string) => {
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

  const toggleOrgResourceExpansion = (id: string) => {
    setExpandedOrgResources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleItemClick = (item: ItemizedResource) => {
    setSelectedItem(item);
  };

  const handleEditResource = (resource: Resource) => {
    // If in requests mode, open the drawer for editing
    if (viewMode === 'requests') {
      // Convert resource requests to resourceItems format
      const resourceItems = resource.resourceRequests.length > 0
        ? resource.resourceRequests.map(req => ({
            id: req.id,
            kind: req.kind || '',
            type: req.type || '',
            unit: req.unit || '',
            priority: req.priority || '',
            description: req.description || '',
            suggestedSourcesOfSupply: req.suggestedSourcesOfSupply || '',
            acceptableSubstitutes: req.acceptableSubstitutes || '',
            cost: req.cost || '',
            quantity: 0,
            reportingSite: req.reportingSite || '',
            reportingDateTime: req.reportingTime || '',
            reportingDateTimeTimezone: req.reportingTimeTimezone || 'UTC',
            status: req.status || 'pending-approval'
          }))
        : [{
            id: `item-${Date.now()}`,
            kind: '',
            type: '',
            unit: '',
            priority: '',
            description: '',
            suggestedSourcesOfSupply: '',
            acceptableSubstitutes: '',
            cost: '',
            quantity: 0,
            reportingSite: '',
            reportingDateTime: '',
            reportingDateTimeTimezone: 'UTC',
            status: 'pending-approval'
          }];
      
      // Set the newResource state with the existing resource data
      setNewResource({
        resource: resource.resource,
        requestName: resource.resource,
        aor: resource.aor || '',
        incident: resource.incident || '',
        workAssignment: resource.workAssignment || '',
        checkInStatus: resource.checkInStatus,
        resourceItems: resourceItems
      });
      
      // Store the editing resource ID so we know to update instead of create
      setEditingResourceId(resource.id);
      
      // Keep all resource items collapsed by default
      setExpandedResourceItems(new Set());
      
      // Open the drawer
      setIsDrawerOpen(true);
    } else {
      // For non-requests mode, use inline editing
      setEditingResourceId(resource.id);
      // Auto-expand the row when entering edit mode
      setExpandedRows(prev => new Set([...prev, resource.id]));
      // Get the first resource request for editing
      const firstRequest = resource.resourceRequests[0];
      // Convert resource requests to resourceItems format
      const resourceItems = resource.resourceRequests.length > 0
        ? resource.resourceRequests.map(req => ({
            id: req.id,
            kind: req.kind || '',
            type: req.type || '',
            unit: req.unit || '',
            priority: req.priority || '',
            description: req.description || '',
            suggestedSourcesOfSupply: req.suggestedSourcesOfSupply || '',
            acceptableSubstitutes: req.acceptableSubstitutes || '',
            cost: req.cost || '',
            quantity: 0,
            reportingSite: req.reportingSite || '',
            reportingDateTime: req.reportingTime || '',
            reportingDateTimeTimezone: req.reportingTimeTimezone || 'UTC',
            status: req.status || 'pending-approval'
          }))
        : [{
            id: `item-${Date.now()}`,
            kind: '',
            type: '',
            unit: '',
            priority: '',
            description: '',
            suggestedSourcesOfSupply: '',
            acceptableSubstitutes: '',
            cost: '',
            quantity: 0,
            reportingSite: '',
            reportingDateTime: '',
            reportingDateTimeTimezone: 'UTC',
            status: 'pending-approval'
          }];
      
      setEditedResource({
        resource: resource.resource,
        id: resource.id,
        type: resource.type,
        aor: resource.aor || '',
        incident: resource.incident || '',
        workAssignment: resource.workAssignment || '',
        checkInStatus: resource.checkInStatus,
        requestRecipient: resource.requestRecipient || '',
        poc: resource.poc || '',
        currentLocation: resource.currentLocation || '',
        datetimeOrdered: resource.datetimeOrdered || '',
        datetimeOrderedTimezone: resource.datetimeOrderedTimezone || 'UTC',
        kind: firstRequest?.kind || '',
        unit: firstRequest?.unit || '',
        description: firstRequest?.description || '',
        suggestedSourcesOfSupply: firstRequest?.suggestedSourcesOfSupply || '',
        acceptableSubstitutes: firstRequest?.acceptableSubstitutes || '',
        cost: firstRequest?.cost || '',
        quantity: resource.quantity || 0,
        resourceItems: resourceItems
      });
    }
  };

  const handleSaveEdit = () => {
    if (editingResourceId) {
      setResources(resources.map(r => 
        r.id === editingResourceId 
          ? { 
              ...r, 
              resource: editedResource.resource,
              id: editedResource.id,
              type: editedResource.type,
              aor: editedResource.aor,
              incident: editedResource.incident,
              workAssignment: editedResource.workAssignment,
              checkInStatus: editedResource.checkInStatus,
              requestRecipient: editedResource.requestRecipient,
              poc: editedResource.poc,
              currentLocation: editedResource.currentLocation,
              datetimeOrdered: editedResource.datetimeOrdered,
              datetimeOrderedTimezone: editedResource.datetimeOrderedTimezone,
              // Update resource requests from resourceItems
              resourceRequests: viewMode === 'requests' ? editedResource.resourceItems.map((item, index) => {
                const existingRequest = r.resourceRequests[index];
                return {
                  id: existingRequest?.id || `req-${Date.now()}-${index}`,
                  priority: existingRequest?.priority || '',
                  orderId: existingRequest?.orderId || generateOrderId(),
                  reportingLocation: existingRequest?.reportingLocation || '',
                  reportingTime: existingRequest?.reportingTime || '',
                  reportingTimeTimezone: existingRequest?.reportingTimeTimezone || 'UTC',
                  eta: existingRequest?.eta || '',
                  etaTimezone: existingRequest?.etaTimezone || 'UTC',
                  ordered: existingRequest?.ordered || '',
                  orderedTimezone: existingRequest?.orderedTimezone || 'UTC',
                  kind: item.kind,
                  type: item.type,
                  unit: item.unit,
                  description: item.description,
                  suggestedSourcesOfSupply: item.suggestedSourcesOfSupply,
                  acceptableSubstitutes: item.acceptableSubstitutes,
                  cost: item.cost,
                  reportingSite: item.reportingSite,
                  quantity: item.quantity,
                  status: item.status || existingRequest?.status || 'pending-approval'
                };
              }) : r.resourceRequests,
              kind: viewMode === 'requests' ? editedResource.resourceItems.map(item => item.kind).filter(k => k).join(', ') : r.kind,
              quantity: editedResource.quantity
            } 
          : r
      ));
      setEditingResourceId(null);
      setIsEditCustomReportingSite(false);
      setEditedResource({
        resource: '',
        id: '',
        type: '',
        aor: '',
        incident: '',
        workAssignment: '',
        checkInStatus: 'checked-out',
        requestRecipient: '',
        poc: '',
        currentLocation: '',
        datetimeOrdered: '',
        datetimeOrderedTimezone: 'UTC',
        kind: '',
        unit: '',
        description: '',
        suggestedSourcesOfSupply: '',
        acceptableSubstitutes: '',
        cost: '',
        quantity: 0,
        resourceItems: [{
          id: `item-${Date.now()}`,
          kind: '',
          type: '',
          unit: '',
          priority: '',
          description: '',
          suggestedSourcesOfSupply: '',
          acceptableSubstitutes: '',
          cost: '',
          quantity: 0,
          reportingSite: '',
          reportingDateTime: '',
          reportingDateTimeTimezone: 'UTC',
          status: 'pending-approval' as ResourceRequest['status']
        }]
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingResourceId(null);
    setIsEditCustomReportingSite(false);
    setEditedResource({
      resource: '',
      id: '',
      type: '',
      aor: '',
      incident: '',
      workAssignment: '',
      checkInStatus: 'checked-out',
      requestRecipient: '',
      poc: '',
      currentLocation: '',
      datetimeOrdered: '',
      datetimeOrderedTimezone: 'UTC',
      kind: '',
      unit: '',
      description: '',
      suggestedSourcesOfSupply: '',
      acceptableSubstitutes: '',
      cost: '',
      quantity: 0,
      resourceItems: [{
        id: `item-${Date.now()}`,
        kind: '',
        type: '',
        unit: '',
        description: '',
        suggestedSourcesOfSupply: '',
        acceptableSubstitutes: '',
        cost: '',
        quantity: 0,
        reportingSite: '',
        status: 'pending-approval' as ResourceRequest['status']
      }]
    });
  };

  const handleAddNewResource = () => {
    if (newResourceName.trim()) {
      setResourceOptions([...resourceOptions, newResourceName.trim()]);
      if (editingResourceId) {
        setEditedResource({ ...editedResource, resource: newResourceName.trim() });
      } else {
        setNewResource({ ...newResource, resource: newResourceName.trim() });
      }
      setNewResourceName('');
      setIsAddingNewResource(false);
    }
  };

  const handleAddNewType = () => {
    if (newTypeName.trim()) {
      setTypeOptions([...typeOptions, newTypeName.trim()]);
      if (editingResourceId) {
        setEditedResource({ ...editedResource, type: newTypeName.trim() });
      } else {
        setNewResource({ ...newResource, type: newTypeName.trim() });
      }
      setNewTypeName('');
      setIsAddingNewType(false);
    }
  };

  // Get unique values for each column
  const uniqueValues = useMemo(() => {
    if (viewMode === 'requests') {
      // For requests mode, aggregate from resourceRequests
      const allKinds = new Set<string>();
      const allAors = new Set<string>();
      const allIncidents = new Set<string>();
      const allRequestCreators = new Set<string>();
      const allRequestRecipients = new Set<string>();
      const allRequestedItemsTypes = new Set<string>();
      
      resources.forEach(r => {
        r.resourceRequests.forEach(req => {
          if (req.kind) {
            allKinds.add(req.kind);
            allRequestedItemsTypes.add(req.kind);
          }
          if (req.aor) allAors.add(req.aor);
          if (req.incident) allIncidents.add(req.incident);
          if (req.requestCreator) allRequestCreators.add(req.requestCreator);
          if (req.requestRecipient) allRequestRecipients.add(req.requestRecipient);
        });
      });
      
      return {
        resources: Array.from(new Set(resources.map(r => r.resource))).sort(), // Request Name
        ids: Array.from(new Set(resources.map(r => r.id))).sort(),
        types: Array.from(allKinds).sort(), // Kinds
        aors: Array.from(allAors).sort(), // AORs
        incidents: Array.from(allIncidents).sort(), // Incidents
        workAssignments: Array.from(allRequestCreators).sort(), // Request Creators
        checkInStatuses: Array.from(allRequestRecipients).sort(), // Request Recipients
        requestedItems: Array.from(allRequestedItemsTypes).sort(), // Requested Resources Types
      };
    } else {
      // For resources mode
      return {
        resources: Array.from(new Set(resources.map(r => r.resource))).sort(),
        ids: Array.from(new Set(resources.map(r => r.id))).sort(),
        types: Array.from(new Set(resources.map(r => r.type))).sort(),
        aors: Array.from(new Set(resources.map(r => r.aor || '-'))).sort(),
        incidents: Array.from(new Set(resources.map(r => r.incident || '-'))).sort(),
        workAssignments: Array.from(new Set(resources.map(r => r.workAssignment || '-'))).sort(),
        checkInStatuses: Array.from(new Set(resources.map(r => r.checkInStatus))).sort(),
        incidentStatuses: Array.from(new Set(resources.map(r => r.inIncident ? (r.incident || 'In Incident') : 'no incident'))).sort(),
        requestedItems: [],
      };
    }
  }, [resources, viewMode]);

  // Filter resources based on column filters
  const filteredResources = resources.filter((resource) => {
    if (viewMode === 'requests') {
      // For requests mode, filter based on resourceRequests data
      const matchesResource = filterResource.size === 0 || filterResource.has(resource.resource); // Request Name
      const matchesId = filterId.size === 0 || filterId.has(resource.id); // ID
      const matchesKind = filterType.size === 0 || resource.resourceRequests.some(req => req.kind && filterType.has(req.kind));
      const matchesRequestCreator = filterWorkAssignment.size === 0 || resource.resourceRequests.some(req => req.requestCreator && filterWorkAssignment.has(req.requestCreator));
      const matchesRequestRecipient = filterCheckInStatus.size === 0 || resource.resourceRequests.some(req => req.requestRecipient && filterCheckInStatus.has(req.requestRecipient));
      const matchesRequestedItems = filterRequestedItems.size === 0 || resource.resourceRequests.some(req => req.kind && filterRequestedItems.has(req.kind));
      
      return matchesResource && matchesId && matchesKind && matchesRequestCreator && matchesRequestRecipient && matchesRequestedItems;
    } else {
      // For resources mode
      const matchesResource = filterResource.size === 0 || filterResource.has(resource.resource);
      const matchesId = filterId.size === 0 || filterId.has(resource.id);
      const matchesType = filterType.size === 0 || filterType.has(resource.type);
      const matchesAor = filterAor.size === 0 || filterAor.has(resource.aor || '-');
      const matchesIncident = filterIncident.size === 0 || filterIncident.has(resource.incident || '-');
      const matchesWorkAssignment = filterWorkAssignment.size === 0 || filterWorkAssignment.has(resource.workAssignment || '-');
      const matchesCheckInStatus = filterCheckInStatus.size === 0 || filterCheckInStatus.has(resource.checkInStatus);
      const incidentStatusValue = resource.inIncident ? (resource.incident || 'In Incident') : 'no incident';
      const matchesIncidentStatus = filterIncidentStatus.size === 0 || filterIncidentStatus.has(incidentStatusValue);
      const requestStatusValue = resource.requestStatus || (
        (resource.id === 'ic-001' || resource.id === '14573') 
          ? 'Not Requested' 
          : 'Requested: RESL Review'
      );
      const matchesRequestStatus = filterRequestStatus.size === 0 || filterRequestStatus.has(requestStatusValue);
      
      return matchesResource && matchesId && matchesType && matchesAor && matchesIncident && matchesWorkAssignment && matchesCheckInStatus && matchesIncidentStatus && matchesRequestStatus;
    }
  });

  // Helper to toggle filter selection
  const toggleFilter = (filterSet: Set<string>, setFilter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
    const newSet = new Set(filterSet);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setFilter(newSet);
  };

  // Helper to toggle individual request expansion
  const toggleIndividualRequest = (requestId: string) => {
    const newSet = new Set(expandedIndividualRequests);
    if (newSet.has(requestId)) {
      newSet.delete(requestId);
    } else {
      newSet.add(requestId);
    }
    setExpandedIndividualRequests(newSet);
  };

  const handleAddResourceClick = () => {
    // For requests mode, add inline in edit state; for other modes, use inline form
    if (viewMode === 'requests') {
      // Create a new resource request inline
      const newRequestId = `req-new-${Date.now()}`;
      const newRequestItemId = `reqitem-${Date.now()}`;
      const newRequest: Resource = {
        id: newRequestId,
        resource: '',
        checkInStatus: 'not-checked-in',
        type: '',
        kind: '',
        unit: '',
        poc: '',
        aor: '',
        incident: '',
        workAssignment: '',
        requestRecipient: '',
        items: [],
        resourceRequests: [{
          id: newRequestItemId,
          priority: '',
          orderId: generateOrderId(),
          reportingLocation: '',
          reportingTime: '',
          reportingTimeTimezone: 'UTC',
          eta: '',
          etaTimezone: 'UTC',
          ordered: '',
          orderedTimezone: 'UTC',
          kind: '',
          type: '',
          unit: '',
          description: '',
          suggestedSourcesOfSupply: '',
          acceptableSubstitutes: '',
          cost: '',
          reportingSite: '',
          status: 'pending-approval',
          approvalSteps: {
            requestResource: { status: 'pending', approver: undefined, timestamp: undefined },
            sectionChief: { status: 'pending', approver: undefined, timestamp: undefined },
            reslReview: { status: 'pending', approver: undefined, timestamp: undefined },
            logistics: { status: 'pending', approver: undefined, timestamp: undefined },
            finance: { status: 'pending', approver: undefined, timestamp: undefined },
          },
          currentApprovalStep: 'requestResource',
        }]
      };
      
      // Add to resources array at the top
      setResources([newRequest, ...resources]);
      
      // Set as editing and expanded
      setEditingResourceId(newRequestId);
      setExpandedRows(new Set([newRequestId]));
      
      // Scroll to the new resource after it's rendered
      setTimeout(() => {
        const element = document.querySelector(`[data-resource-id="${newRequestId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
      // Initialize editedResource state
      setEditedResource({
        resource: '',
        id: newRequestId,
        type: '',
        aor: '',
        incident: '',
        workAssignment: '',
        checkInStatus: 'not-checked-in',
        requestRecipient: '',
        poc: '',
        currentLocation: '',
        datetimeOrdered: '',
        datetimeOrderedTimezone: 'UTC',
        kind: '',
        unit: '',
        description: '',
        suggestedSourcesOfSupply: '',
        acceptableSubstitutes: '',
        cost: '',
        quantity: 0,
        resourceItems: []
      });
    } else {
      setIsAddingResource(true);
    }
    const newItemId = `item-${Date.now()}`;
    setNewResource({
      resource: '',
      requestName: '',
      aor: '',
      incident: '',
      workAssignment: '',
      checkInStatus: 'not-checked-in',
      resourceItems: [{
        id: newItemId,
        kind: '',
        type: '',
        unit: '',
        priority: '',
        description: '',
        suggestedSourcesOfSupply: '',
        acceptableSubstitutes: '',
        cost: '',
        quantity: 0,
        reportingSite: '',
        reportingDateTime: '',
        reportingDateTimeTimezone: 'UTC',
        status: 'pending-approval' as ResourceRequest['status']
      }]
    });
    // Keep resource items collapsed by default
    setExpandedResourceItems(new Set());
  };

  const handleSaveNewResource = () => {
    if (!newResource.requestName) {
      alert('Please fill in Request Name');
      return;
    }

    // Check if we're editing an existing resource
    if (editingResourceId) {
      // Update existing resource
      setResources(resources.map(r => 
        r.id === editingResourceId 
          ? { 
              ...r, 
              resource: newResource.requestName,
              aor: newResource.aor,
              incident: newResource.incident,
              workAssignment: newResource.workAssignment,
              checkInStatus: newResource.checkInStatus,
              kind: viewMode === 'requests' ? newResource.resourceItems.map(item => item.kind).filter(k => k).join(', ') : r.kind,
              resourceRequests: viewMode === 'requests' ? newResource.resourceItems.map((item, index) => {
                const existingRequest = r.resourceRequests[index];
                return {
                  id: item.id || existingRequest?.id || `req-${Date.now()}-${index}`,
                  priority: existingRequest?.priority || '',
                  orderId: existingRequest?.orderId || generateOrderId(),
                  reportingLocation: existingRequest?.reportingLocation || '',
                  reportingTime: existingRequest?.reportingTime || '',
                  reportingTimeTimezone: existingRequest?.reportingTimeTimezone || 'UTC',
                  eta: existingRequest?.eta || '',
                  etaTimezone: existingRequest?.etaTimezone || 'UTC',
                  ordered: existingRequest?.ordered || '',
                  orderedTimezone: existingRequest?.orderedTimezone || 'UTC',
                  kind: item.kind,
                  type: item.type,
                  unit: item.unit,
                  description: item.description,
                  suggestedSourcesOfSupply: item.suggestedSourcesOfSupply,
                  acceptableSubstitutes: item.acceptableSubstitutes,
                  cost: item.cost,
                  reportingSite: item.reportingSite,
                  quantity: item.quantity,
                  status: item.status || existingRequest?.status || 'pending-approval',
                  requestCreator: existingRequest?.requestCreator || '',
                  requestRecipient: existingRequest?.requestRecipient || '',
                  aor: existingRequest?.aor || '',
                  approvalSteps: existingRequest?.approvalSteps || {
                    requestResource: { 
                      status: 'completed', 
                      approver: 'Current User', 
                      timestamp: new Date().toISOString() 
                    },
                    sectionChief: { status: 'pending', approver: undefined, timestamp: undefined },
                    reslReview: { status: 'pending', approver: undefined, timestamp: undefined },
                    logistics: { status: 'pending', approver: undefined, timestamp: undefined },
                    finance: { status: 'pending', approver: undefined, timestamp: undefined },
                  },
                  currentApprovalStep: existingRequest?.currentApprovalStep || 'sectionChief',
                };
              }) : r.resourceRequests
            } 
          : r
      ));
      setEditingResourceId(null);
    } else {
      // Create new resource
      const resourceToAdd: Resource = {
        id: generateOrderId(),
        resource: newResource.requestName,
        checkInStatus: newResource.checkInStatus,
        type: '',
        kind: viewMode === 'requests' ? newResource.resourceItems.map(item => item.kind).filter(k => k).join(', ') : '',
        aor: newResource.aor,
        incident: newResource.incident,
        workAssignment: newResource.workAssignment,
        items: [],
        resourceRequests: viewMode === 'requests' ? newResource.resourceItems.map((item, index) => ({
          id: `req-${Date.now()}-${index}`,
          priority: '',
          orderId: generateOrderId(),
          reportingLocation: '',
          reportingTime: '',
          reportingTimeTimezone: 'UTC',
          eta: '',
          etaTimezone: 'UTC',
          ordered: '',
          orderedTimezone: 'UTC',
          kind: item.kind,
          type: item.type,
          unit: item.unit,
          description: item.description,
          suggestedSourcesOfSupply: item.suggestedSourcesOfSupply,
          acceptableSubstitutes: item.acceptableSubstitutes,
          cost: item.cost,
          reportingSite: item.reportingSite,
          quantity: item.quantity,
          status: item.status || 'pending-approval',
          approvalSteps: {
            requestResource: { 
              status: 'completed', 
              approver: 'Current User', 
              timestamp: new Date().toISOString() 
            },
            sectionChief: { status: 'pending', approver: undefined, timestamp: undefined },
            reslReview: { status: 'pending', approver: undefined, timestamp: undefined },
            logistics: { status: 'pending', approver: undefined, timestamp: undefined },
            finance: { status: 'pending', approver: undefined, timestamp: undefined },
          },
          currentApprovalStep: 'sectionChief',
        })) : []
      };

      setResources([resourceToAdd, ...resources]);
    }
    setIsAddingResource(false);
    setIsDrawerOpen(false);
    setIsCustomReportingSite(false);
    setEditingResourceId(null);
    setNewResource({
      resource: '',
      requestName: '',
      aor: '',
      incident: '',
      workAssignment: '',
      capabilityEnabled: '',
      suggestedSourcesAndSubstitutes: '',
      reslTactical: false,
      reslPersonnel: false,
      reslAvailable: false,
      reslNotAvailable: false,
      logisticsRequisitionNumber: '',
      logisticsSupplier: '',
      logisticsNotes: '',
      logisticsOrderPlacedBySpul: false,
      logisticsOrderPlacedByProc: false,
      logisticsOrderPlacedByOther: false,
      checkInStatus: 'not-checked-in',
      resourceItems: [{
        id: `item-${Date.now()}`,
        kind: '',
        type: '',
        unit: '',
        priority: '',
        description: '',
        suggestedSourcesOfSupply: '',
        acceptableSubstitutes: '',
        cost: '',
        quantity: 0,
        reportingSite: '',
        reportingDateTime: '',
        reportingDateTimeTimezone: 'UTC',
        status: 'pending-approval' as ResourceRequest['status']
      }]
    });
  };

  const handleCancelNewResource = () => {
    setIsAddingResource(false);
    setIsDrawerOpen(false);
    setIsCustomReportingSite(false);
    setEditingResourceId(null);
    setNewResource({
      resource: '',
      requestName: '',
      aor: '',
      incident: '',
      workAssignment: '',
      capabilityEnabled: '',
      suggestedSourcesAndSubstitutes: '',
      reslTactical: false,
      reslPersonnel: false,
      reslAvailable: false,
      reslNotAvailable: false,
      logisticsRequisitionNumber: '',
      logisticsSupplier: '',
      logisticsNotes: '',
      logisticsOrderPlacedBySpul: false,
      logisticsOrderPlacedByProc: false,
      logisticsOrderPlacedByOther: false,
      checkInStatus: 'not-checked-in',
      resourceItems: [{
        id: `item-${Date.now()}`,
        kind: '',
        type: '',
        unit: '',
        priority: '',
        description: '',
        suggestedSourcesOfSupply: '',
        acceptableSubstitutes: '',
        cost: '',
        orderNumberLSC: '',
        etaLSC: '',
        quantity: 0,
        reportingSite: '',
        reportingDateTime: '',
        reportingDateTimeTimezone: 'UTC',
        status: 'pending-approval' as ResourceRequest['status']
      }]
    });
  };

  const handleAddResourceItem = () => {
    if (newResource.resourceItems.length < 6) {
      const newItemId = `item-${Date.now()}`;
      setNewResource({
        ...newResource,
        resourceItems: [
          ...newResource.resourceItems,
          {
            id: newItemId,
            name: '',
            kind: '',
            type: '',
            unit: '',
            priority: '',
            description: '',
            suggestedSourcesOfSupply: '',
            acceptableSubstitutes: '',
            cost: '',
            orderNumberLSC: '',
            etaLSC: '',
            etaLSCTimezone: 'UTC',
            quantity: 0,
            reportingSite: '',
            reportingDateTime: '',
            reportingDateTimeTimezone: 'UTC',
            status: 'pending-approval' as ResourceRequest['status']
          }
        ]
      });
      // Keep newly added resource items collapsed by default
      // Don't auto-expand
    }
  };

  const handleRemoveResourceItem = (itemId: string) => {
    if (newResource.resourceItems.length > 1) {
      setNewResource({
        ...newResource,
        resourceItems: newResource.resourceItems.filter(item => item.id !== itemId)
      });
      // Remove from expanded state
      setExpandedResourceItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleUpdateResourceItem = (itemId: string, field: string, value: any) => {
    setNewResource({
      ...newResource,
      resourceItems: newResource.resourceItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const toggleResourceItemExpanded = (itemId: string) => {
    setExpandedResourceItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddEditedResourceItem = () => {
    if (editedResource.resourceItems.length < 6) {
      setEditedResource({
        ...editedResource,
        resourceItems: [
          ...editedResource.resourceItems,
          {
            id: `item-${Date.now()}`,
            name: '',
            kind: '',
            type: '',
            unit: '',
            priority: '',
            description: '',
            suggestedSourcesOfSupply: '',
            acceptableSubstitutes: '',
            cost: '',
            orderNumberLSC: '',
            etaLSC: '',
            etaLSCTimezone: 'UTC',
            quantity: 0,
            reportingSite: '',
            reportingDateTime: '',
            reportingDateTimeTimezone: 'UTC',
            status: 'pending-approval' as ResourceRequest['status']
          }
        ]
      });
    }
  };

  const handleRemoveEditedResourceItem = (itemId: string) => {
    if (editedResource.resourceItems.length > 1) {
      setEditedResource({
        ...editedResource,
        resourceItems: editedResource.resourceItems.filter(item => item.id !== itemId)
      });
    }
  };

  const handleUpdateEditedResourceItem = (itemId: string, field: string, value: any) => {
    setEditedResource({
      ...editedResource,
      resourceItems: editedResource.resourceItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const handleRequestStatusChange = (resourceId: string, requestId: string, newStatus: ResourceRequest['status']) => {
    setResources(resources.map(resource => {
      if (resource.id === resourceId) {
        return {
          ...resource,
          resourceRequests: resource.resourceRequests.map(req => {
            if (req.id === requestId) {
              // If approving, move to next step
              if (newStatus === 'approved' && req.approvalSteps && req.currentApprovalStep) {
                const updatedSteps = { ...req.approvalSteps };
                const currentStep = req.currentApprovalStep;
                
                // Mark current step as completed
                const stepData: any = {
                  status: 'completed',
                  approver: approverName,
                  position: approverPosition,
                  comments: approvalComments,
                  timestamp: new Date().toISOString()
                };
                
                // Add step-specific data
                if (currentStep === 'reslReview') {
                  stepData.data = {
                    tactical: reslTactical,
                    personnel: reslPersonnel,
                    resourceStatus: reslResourceStatus
                  };
                } else if (currentStep === 'logistics') {
                  stepData.data = {
                    orderNumber: logisticsOrderNumber,
                    etaDate: logisticsEtaDate,
                    etaTime: logisticsEtaTime,
                    cost: logisticsCost,
                    supplierName: logisticsSupplierName,
                    phone: logisticsPhone,
                    email: logisticsEmail,
                    useCustomSource: logisticsUseCustomSource,
                    sourceLocation: logisticsSourceLocation,
                    orderPlacedBy: logisticsOrderPlacedBy,
                    orderPlacedByOther: logisticsOrderPlacedByOther,
                    notes: logisticsNotes
                  };
                }
                
                updatedSteps[currentStep] = stepData;
                
                // Determine next step
                const stepOrder: Array<'requestResource' | 'sectionChief' | 'reslReview' | 'logistics' | 'finance'> = 
                  ['requestResource', 'sectionChief', 'reslReview', 'logistics', 'finance'];
                const currentIndex = stepOrder.indexOf(currentStep);
                const nextStep = stepOrder[currentIndex + 1];
                
                // If all steps complete, mark as approved
                const finalStatus = nextStep ? 'pending-approval' : 'approved';
                
                return {
                  ...req,
                  status: finalStatus,
                  approvalSteps: updatedSteps,
                  currentApprovalStep: nextStep || currentStep
                };
              }
              
              return { ...req, status: newStatus };
            }
            return req;
          })
        };
      }
      return resource;
    }));
  };

  return (
    <div className="w-full h-full px-6">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 bg-card border border-border mb-4 p-4" style={{ borderRadius: 'var(--radius)' }}>
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'assigned' | 'requests')}>
            <TabsList className="bg-background border border-border" style={{ borderRadius: 'var(--radius)' }}>
              <TabsTrigger 
                value="assigned" 
                className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Resources
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="text-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
                style={{ borderRadius: 'var(--radius)' }}
              >
                Resource Requests
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            className="bg-background border border-foreground text-foreground hover:bg-card"
            style={{ borderRadius: 'var(--radius)' }}
          >
            ICS-211
          </Button>
          <Button 
            className="bg-background border border-foreground text-foreground hover:bg-card"
            style={{ borderRadius: 'var(--radius)' }}
          >
            ICS-238
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input-background border-white text-white placeholder:text-white/70"
              style={{ borderRadius: 'var(--radius)' }}
            />
          </div>
          <Button 
            className="bg-background border border-foreground text-foreground hover:bg-card ml-auto"
            style={{ borderRadius: 'var(--radius)' }}
            onClick={handleAddResourceClick}
          >
            {viewMode === 'requests' ? '+ Resource Request' : '+ Add Resource'}
          </Button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="sticky top-20 z-10 bg-card border border-border mb-3 p-4" style={{ borderRadius: 'var(--radius)' }}>
        <div className="flex items-center gap-4">
          {/* Space for expand button */}
          <div className="w-8"></div>
          
          {/* Column Headers with Filters */}
          <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: viewMode === 'requests' ? '0.63fr 0.7fr 0.42fr 2fr' : '0.9fr 1fr 1fr 1fr 1fr 0.8fr 0.8fr' }}>
            {/* Resource/Request Name Filter */}
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                {viewMode === 'requests' ? 'Request Name' : viewMode === 'assigned' ? 'Resource Name' : 'Name'}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterResource.size === 0 ? 'All' : `${filterResource.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {viewMode === 'requests' ? 'Filter by Request Name' : 'Filter by Resource'}
                      </span>
                      {filterResource.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterResource(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.resources.map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterResource.has(value)}
                            onCheckedChange={() => toggleFilter(filterResource, setFilterResource, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterResource, setFilterResource, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            {/* Submitted By Filter */}
            {viewMode === 'requests' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Submitted By
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterWorkAssignment.size === 0 ? 'All' : `${filterWorkAssignment.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>Filter by Submitted By</span>
                      {filterWorkAssignment.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterWorkAssignment(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.workAssignments.map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterWorkAssignment.has(value)}
                            onCheckedChange={() => toggleFilter(filterWorkAssignment, setFilterWorkAssignment, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterWorkAssignment, setFilterWorkAssignment, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}

            {/* Kind Filter - Only for assigned view */}
            {viewMode === 'assigned' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Kind
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      All
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Filter by Kind
                      </span>
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      <div className="text-muted-foreground p-2" style={{ fontSize: 'var(--text-sm)' }}>No filters available</div>
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}

            {/* Type/Kinds Filter */}
            {viewMode !== 'requests' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Type
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterType.size === 0 ? 'All' : `${filterType.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Filter by Type
                      </span>
                      {filterType.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterType(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.types.map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterType.has(value)}
                            onCheckedChange={() => toggleFilter(filterType, setFilterType, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterType, setFilterType, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}

            {viewMode !== 'requests' && (
              /* AOR Filter */
              <div className="flex flex-col gap-2">
                <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {viewMode === 'assigned' ? 'AOR' : 'AOR'}
                </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterAor.size === 0 ? 'All' : `${filterAor.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Filter by District
                      </span>
                      {filterAor.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterAor(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.aors.map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterAor.has(value)}
                            onCheckedChange={() => toggleFilter(filterAor, setFilterAor, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterAor, setFilterAor, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              </div>
            )}

            {viewMode !== 'requests' && viewMode !== 'all' && (
              /* Incident Filter */
              <div className="flex flex-col gap-2">
                <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Incident
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                    >
                      <span className="truncate">
                        {filterIncident.size === 0 ? 'All' : `${filterIncident.size} selected`}
                      </span>
                      <Filter className="ml-2 h-3 w-3 text-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-56 p-0 bg-popover border-border" 
                    style={{ borderRadius: 'var(--radius)' }}
                    align="start"
                  >
                    <div className="p-2 border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>Filter by Incident</span>
                        {filterIncident.size > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilterIncident(new Set())}
                            className="h-6 px-2 text-muted-foreground hover:text-foreground"
                            style={{ fontSize: 'var(--text-xs)' }}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    <ScrollArea className="h-64">
                      <div className="p-2">
                        {uniqueValues.incidents.map((value) => (
                          <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                            <Checkbox
                              checked={filterIncident.has(value)}
                              onCheckedChange={() => toggleFilter(filterIncident, setFilterIncident, value)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label 
                              className="flex-1 cursor-pointer text-foreground" 
                              style={{ fontSize: 'var(--text-sm)' }}
                              onClick={() => toggleFilter(filterIncident, setFilterIncident, value)}
                            >
                              {value}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Status Filter */}
            {viewMode === 'requests' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Status
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterWorkAssignment.size === 0 ? 'All' : `${filterWorkAssignment.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>Filter by Status</span>
                      {filterWorkAssignment.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterWorkAssignment(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.workAssignments.map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterWorkAssignment.has(value)}
                            onCheckedChange={() => toggleFilter(filterWorkAssignment, setFilterWorkAssignment, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterWorkAssignment, setFilterWorkAssignment, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}

            {/* Requested Resources Filter */}
            {viewMode === 'requests' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Requested Resources
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterRequestedItems.size === 0 ? 'All' : `${filterRequestedItems.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>Filter by Requested Resources</span>
                      {filterRequestedItems.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterRequestedItems(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.requestedItems?.map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterRequestedItems.has(value)}
                            onCheckedChange={() => toggleFilter(filterRequestedItems, setFilterRequestedItems, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterRequestedItems, setFilterRequestedItems, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}

            {/* Availability / Request Recipient Filter */}
            {viewMode !== 'requests' && viewMode !== 'all' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Current Work Availability
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterCheckInStatus.size === 0 ? 'All' : `${filterCheckInStatus.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Filter by Current Work Availability
                      </span>
                      {filterCheckInStatus.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterCheckInStatus(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {uniqueValues.checkInStatuses.map((value) => {
                        const statusOption = CHECK_IN_STATUS_OPTIONS.find(opt => opt.value === value);
                        const displayLabel = statusOption?.label || value;
                        return (
                          <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                            <Checkbox
                              checked={filterCheckInStatus.has(value)}
                              onCheckedChange={() => toggleFilter(filterCheckInStatus, setFilterCheckInStatus, value)}
                              className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label 
                              className="flex-1 cursor-pointer text-foreground" 
                              style={{ fontSize: 'var(--text-sm)' }}
                              onClick={() => toggleFilter(filterCheckInStatus, setFilterCheckInStatus, value)}
                            >
                              {displayLabel}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}

            {/* Request Status Filter */}
            {viewMode !== 'requests' && viewMode !== 'all' && (
            <div className="flex flex-col gap-2">
              <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Request Status
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 justify-between bg-input-background border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    <span className="truncate">
                      {filterRequestStatus.size === 0 ? 'All' : `${filterRequestStatus.size} selected`}
                    </span>
                    <Filter className="ml-2 h-3 w-3 text-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-56 p-0 bg-popover border-border" 
                  style={{ borderRadius: 'var(--radius)' }}
                  align="start"
                >
                  <div className="p-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>Filter by Request Status</span>
                      {filterRequestStatus.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFilterRequestStatus(new Set())}
                          className="h-6 px-2 text-muted-foreground hover:text-foreground"
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-2">
                      {['Not Requested', 'Requested: RESL Review'].map((value) => (
                        <div key={value} className="flex items-center gap-2 py-1.5 px-2 hover:bg-muted/10 cursor-pointer" style={{ borderRadius: 'var(--radius)' }}>
                          <Checkbox
                            checked={filterRequestStatus.has(value)}
                            onCheckedChange={() => toggleFilter(filterRequestStatus, setFilterRequestStatus, value)}
                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label 
                            className="flex-1 cursor-pointer text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                            onClick={() => toggleFilter(filterRequestStatus, setFilterRequestStatus, value)}
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
            )}
          </div>



          {/* Space for action buttons */}
          <div className="flex gap-2">
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
            <div className="h-8 w-8"></div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Inline Add Resource Form */}
        {isAddingResource && (
          <div 
            className="bg-card border-2 border-primary p-4"
            style={{ borderRadius: 'var(--radius)' }}
          >
            <div className="flex items-center gap-4 mb-4">
              {/* Space for expand button */}
              <div className="w-8"></div>

              {/* Input Fields */}
              <div className="flex-1 grid gap-4 items-center" style={{ gridTemplateColumns: '1.8fr 0.6fr 1fr 1fr 1fr 0.8fr' }}>
                <div className="relative">
                  {isAddingNewResource ? (
                    <div className="flex gap-1">
                      <Input
                        type="text"
                        placeholder="Enter new resource"
                        value={newResourceName}
                        onChange={(e) => setNewResourceName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewResource();
                          } else if (e.key === 'Escape') {
                            setIsAddingNewResource(false);
                            setNewResourceName('');
                          }
                        }}
                        className="bg-input-background border-border text-foreground flex-1"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleAddNewResource}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingNewResource(false);
                          setNewResourceName('');
                        }}
                        className="bg-card border-border text-foreground hover:bg-muted/10 h-10 px-2"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Enter resource name"
                      value={newResource.resource}
                      onChange={(e) => setNewResource({ ...newResource, resource: e.target.value })}
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                    />
                  )}
                </div>
                <select
                  value={newResource.id}
                  onChange={(e) => setNewResource({ ...newResource, id: e.target.value })}
                  className="h-10 px-3 bg-input-background border border-border text-foreground w-full"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                >
                  <option value="">Select Type</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Equipment">Equipment</option>
                </select>
                <div className="relative">
                  {isAddingNewType ? (
                    <div className="flex gap-1">
                      <Input
                        type="text"
                        placeholder="Enter new type"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddNewType();
                          } else if (e.key === 'Escape') {
                            setIsAddingNewType(false);
                            setNewTypeName('');
                          }
                        }}
                        className="bg-input-background border-border text-foreground flex-1"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleAddNewType}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingNewType(false);
                          setNewTypeName('');
                        }}
                        className="bg-card border-border text-foreground hover:bg-muted/10 h-10 px-2"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <select
                      value={newResource.type}
                      onChange={(e) => {
                        if (e.target.value === '__add_new__') {
                          setIsAddingNewType(true);
                        } else {
                          setNewResource({ ...newResource, type: e.target.value });
                        }
                      }}
                      className="h-10 px-3 bg-input-background border border-border text-foreground w-full"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                    >
                      <option value="">Select Type</option>
                      {typeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                      <option value="__add_new__" className="text-primary">+ New Type</option>
                    </select>
                  )}
                </div>
                <select
                  value={newResource.aor}
                  onChange={(e) => setNewResource({ ...newResource, aor: e.target.value })}
                  className="h-10 px-3 bg-input-background border border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                >
                  <option value="">Select AOR</option>
                  {AOR_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <select
                  value={newResource.incident}
                  onChange={(e) => setNewResource({ ...newResource, incident: e.target.value })}
                  className="h-10 px-3 bg-input-background border border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                >
                  <option value="">Select Incident</option>
                  {INCIDENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <select
                  value={newResource.checkInStatus}
                  onChange={(e) => setNewResource({ ...newResource, checkInStatus: e.target.value as 'checked-in' | 'not-checked-in' })}
                  className="h-10 px-3 bg-input-background border border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                >
                  <option value="">Select Status</option>
                  <option value="not-checked-in">Checked-Out</option>
                  <option value="checked-in">Checked-In</option>
                </select>
              </div>
            </div>

            {/* Expanded Fields for Resource Requests */}
            {viewMode === 'requests' && (
              <div className="border-t border-border px-6 py-4 bg-muted/5 space-y-4">
                {newResource.resourceItems.map((item, index) => (
                  <div key={item.id} className="space-y-4">
                    {index > 0 && <div className="border-t border-border pt-4" />}
                    
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="text-foreground" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Resource {index + 1}
                      </div>
                      {newResource.resourceItems.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveResourceItem(item.id)}
                          className="border-border text-destructive hover:bg-destructive/10 h-7 px-2"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* First Row: Kind, Type, Unit, Description */}
                    <div className="grid grid-cols-4 gap-6">
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Kind
                        </div>
                        <select
                          value={item.kind}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'kind', e.target.value)}
                          className="w-full h-9 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="">Select kind</option>
                          {KIND_OPTIONS.map((kind) => (
                            <option key={kind} value={kind}>
                              {kind}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Type
                        </div>
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'type', e.target.value)}
                          className="w-full h-9 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="">Select type</option>
                          {TYPE_OPTIONS.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Unit
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter unit"
                          value={item.unit}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'unit', e.target.value)}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Description
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter description"
                          value={item.description}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'description', e.target.value)}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                    </div>

                    {/* Second Row: Suggested Sources and Substitutes */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Suggested Sources of Supply
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter suggested sources"
                          value={item.suggestedSourcesOfSupply}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'suggestedSourcesOfSupply', e.target.value)}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Acceptable Substitutes
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter acceptable substitutes"
                          value={item.acceptableSubstitutes}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'acceptableSubstitutes', e.target.value)}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                    </div>

                    {/* Third Row: Cost Per Unit, Quantity, Total Cost */}
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Cost Per Unit
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter cost per unit"
                          value={item.cost}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'cost', e.target.value)}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Quantity
                        </div>
                        <Input
                          type="number"
                          placeholder="Enter quantity"
                          value={item.quantity}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'quantity', Number(e.target.value))}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        />
                      </div>
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Total Cost
                        </div>
                        <div 
                          className="h-10 px-3 flex items-center bg-muted/10 border border-border text-card-foreground" 
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          {item.cost && item.quantity 
                            ? `$${(parseFloat(item.cost.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}`
                            : '-'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Fourth Row: Reporting Site */}
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <div 
                          className="text-foreground mb-1" 
                          style={{ fontSize: 'var(--text-xs)' }}
                        >
                          Reporting Site
                        </div>
                        {!isCustomReportingSite ? (
                          <div className="flex gap-2">
                            <select
                              value={item.reportingSite}
                              onChange={(e) => handleUpdateResourceItem(item.id, 'reportingSite', e.target.value)}
                              className="flex-1 h-9 px-3 bg-input-background border border-border text-foreground"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              <option value="">Select reporting site</option>
                              {REPORTING_SITE_OPTIONS.map((site) => (
                                <option key={site} value={site}>
                                  {site}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsCustomReportingSite(true)}
                              className="border-border text-foreground hover:bg-muted/10 h-9 px-3 whitespace-nowrap"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              Use Custom Location
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Enter custom reporting site"
                              value={item.reportingSite}
                              onChange={(e) => handleUpdateResourceItem(item.id, 'reportingSite', e.target.value)}
                              className="flex-1 bg-input-background border-border text-foreground"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsCustomReportingSite(false);
                                handleUpdateResourceItem(item.id, 'reportingSite', '');
                              }}
                              className="border-border text-foreground hover:bg-muted/10 h-9 px-3 whitespace-nowrap"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              Use Dropdown
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Resource Button */}
                {newResource.resourceItems.length < 6 && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddResourceItem}
                      className="border-border text-foreground hover:bg-muted/10 h-8"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                    >
                      + Add Resource
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Left aligned below */}
            <div className="flex gap-2 ml-12 mt-4">
              <Button
                size="sm"
                onClick={handleSaveNewResource}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelNewResource}
                className="border-border text-foreground hover:bg-muted/10 h-8"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {filteredResources.map((resource) => (
            <div
              key={resource.id}
              data-resource-id={resource.id}
              className={`border ${editingResourceId === resource.id ? 'border-2 border-primary' : 'border-border bg-card/30'}`}
              style={{ 
                borderRadius: 'var(--radius)', 
                backgroundColor: editingResourceId === resource.id && viewMode === 'requests' ? '#000000' : editingResourceId === resource.id ? 'var(--card)' : undefined 
              }}
            >
              {/* Resource Need Card */}
              <div className={`p-4 ${editingResourceId === resource.id ? '' : 'cursor-pointer'}`} onClick={editingResourceId === resource.id ? undefined : () => toggleRowExpansion(resource.id)}>
                <div className="flex items-center gap-4">
                  {/* Expand Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingResourceId !== resource.id) {
                        toggleRowExpansion(resource.id);
                      }
                    }}
                    className="hover:bg-muted/10 h-8 w-8 p-0"
                    disabled={editingResourceId === resource.id}
                  >
                    {expandedRows.has(resource.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {editingResourceId === resource.id ? (
                    /* Edit Mode */
                    <div className="flex-1 grid gap-4 items-center" style={{ gridTemplateColumns: viewMode === 'requests' ? '0.63fr 0.7fr 0.42fr 2fr' : viewMode === 'assigned' ? '0.9fr 1fr 1fr 1fr 1fr 0.8fr 0.8fr' : '0.9fr 0.6fr 1fr 1fr 1fr 0.8fr 0.8fr' }}>
                      {/* Check if this is a new resource request (add state) */}
                      {viewMode === 'requests' && resource.id.startsWith('req-new-') ? (
                        /* Add State - Show Request Name Input */
                        <>
                          <Input
                            type="text"
                            placeholder="Enter request name"
                            value={editedResource.resource}
                            onChange={(e) => setEditedResource({ ...editedResource, resource: e.target.value })}
                            className="bg-input-background border-border text-foreground"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            autoFocus
                          />
                          <div className="text-card-foreground flex items-center" style={{ fontSize: 'var(--text-sm)' }}>
                            {resource.resourceRequests?.[0]?.requestCreator || 'Current User'}
                          </div>
                          <select
                            value={(() => {
                              // If in add state, show "-"
                              if (resource.id.startsWith('req-new-')) return '-';
                              
                              const request = editedResource.resourceItems?.[0];
                              if (!request) return 'Submitted';
                              
                              // Check if all steps are completed
                              const allStepsCompleted = 
                                request.approvalSteps?.requestResource?.status === 'completed' &&
                                request.approvalSteps?.sectionChief?.status === 'completed' &&
                                request.approvalSteps?.reslReview?.status === 'completed' &&
                                request.approvalSteps?.logistics?.status === 'completed' &&
                                request.approvalSteps?.finance?.status === 'completed';
                              
                              if (allStepsCompleted) return 'Approved';
                              
                              // Check if RESL Review step has started or completed
                              if (request.approvalSteps?.requestResource?.status === 'completed' || 
                                  request.approvalSteps?.sectionChief?.status === 'completed') {
                                return 'RESL Review';
                              }
                              
                              return 'Submitted';
                            })()}
                            disabled={true}
                            className="h-10 px-3 bg-input-background border border-border text-foreground opacity-60"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            <option value="-">-</option>
                            <option value="Submitted">Submitted</option>
                            <option value="RESL Review">RESL Review</option>
                            <option value="Approved">Approved</option>
                          </select>
                          <div className="text-card-foreground space-y-2" style={{ fontSize: 'var(--text-sm)' }}>
                            {(() => {
                              const items = editedResource.resourceItems || [];
                              if (items.length === 0) return <div>-</div>;
                              
                              // Format: Quantity: [value], Kind: [value], Type: [value], Priority: [value]
                              // Description: [value] (on its own line)
                              return items.map((item, index) => {
                                const parts = [];
                                if (item.quantity) parts.push(`Quantity: ${item.quantity}`);
                                if (item.kind) parts.push(`Kind: ${item.kind}`);
                                if (item.type) parts.push(`Type: ${item.type}`);
                                if (item.priority) parts.push(`Priority: ${item.priority}`);
                                
                                return (
                                  <div key={index} className={index > 0 ? 'pt-2 border-t border-white/20' : ''}>
                                    <div>{parts.join(', ')}</div>
                                    {item.description && <div>Description: {item.description}</div>}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </>
                      ) : (
                        /* Edit State - Show Original Fields */
                        <>
                      <div className="relative">
                        {isAddingNewResource ? (
                          <div className="flex gap-1">
                            <Input
                              type="text"
                              placeholder="Enter new resource"
                              value={newResourceName}
                              onChange={(e) => setNewResourceName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddNewResource();
                                } else if (e.key === 'Escape') {
                                  setIsAddingNewResource(false);
                                  setNewResourceName('');
                                }
                              }}
                              className="bg-input-background border-border text-foreground flex-1"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={handleAddNewResource}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsAddingNewResource(false);
                                setNewResourceName('');
                              }}
                              className="bg-card border-border text-foreground hover:bg-muted/10 h-10 px-2"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <select
                            value={editedResource.resource}
                            onChange={(e) => {
                              if (e.target.value === '__add_new__') {
                                setIsAddingNewResource(true);
                              } else {
                                setEditedResource({ ...editedResource, resource: e.target.value });
                              }
                            }}
                            className="h-10 px-3 bg-input-background border border-border text-foreground w-full"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            <option value="">Select Resource</option>
                            {resourceOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                            <option value="__add_new__" className="text-primary">+ New Resource</option>
                          </select>
                        )}
                      </div>
                      {viewMode === 'requests' && (
                      <>
                      <div className="text-card-foreground flex items-center" style={{ fontSize: 'var(--text-sm)' }}>
                        {resource.resourceRequests?.[0]?.requestCreator || 'Current User'}
                      </div>
                      <div className="text-card-foreground flex items-center" style={{ fontSize: 'var(--text-sm)' }}>
                        {(() => {
                          const request = resource.resourceRequests?.[0];
                          if (!request || !request.approvalSteps) return 'Submitted';
                          
                          const allStepsCompleted = 
                            request.approvalSteps.requestResource?.status === 'completed' &&
                            request.approvalSteps.sectionChief?.status === 'completed' &&
                            request.approvalSteps.reslReview?.status === 'completed' &&
                            request.approvalSteps.logistics?.status === 'completed' &&
                            request.approvalSteps.finance?.status === 'completed';
                          
                          if (allStepsCompleted) return 'Approved';
                          
                          if (request.approvalSteps.requestResource?.status === 'completed' || 
                              request.approvalSteps.sectionChief?.status === 'completed') {
                            return 'RESL Review';
                          }
                          
                          return 'Submitted';
                        })()}
                      </div>
                      <div className="text-card-foreground space-y-2" style={{ fontSize: 'var(--text-sm)' }}>
                        {(() => {
                          const items = editedResource.resourceItems || [];
                          if (items.length === 0) return <div>-</div>;
                          
                          // Format: Quantity: [value], Kind: [value], Type: [value], Priority: [value]
                          // Description: [value] (on its own line)
                          return items.map((item, index) => {
                            const parts = [];
                            if (item.quantity) parts.push(`Quantity: ${item.quantity}`);
                            if (item.kind) parts.push(`Kind: ${item.kind}`);
                            if (item.type) parts.push(`Type: ${item.type}`);
                            if (item.priority) parts.push(`Priority: ${item.priority}`);
                            
                            return (
                              <div key={index} className={index > 0 ? 'pt-2 border-t border-white/20' : ''}>
                                <div>{parts.join(', ')}</div>
                                {item.description && <div>Description: {item.description}</div>}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      </>
                      )}
                      {viewMode === 'assigned' && (
                      <select
                        value={editedResource.kind}
                        onChange={(e) => setEditedResource({ ...editedResource, kind: e.target.value })}
                        className="h-10 px-3 bg-input-background border border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                      >
                        <option value="">Select Kind</option>
                        {KIND_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      )}
                      {viewMode !== 'requests' && (
                      <div className="relative">
                        {isAddingNewType ? (
                          <div className="flex gap-1">
                            <Input
                              type="text"
                              placeholder="Enter new type"
                              value={newTypeName}
                              onChange={(e) => setNewTypeName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddNewType();
                                } else if (e.key === 'Escape') {
                                  setIsAddingNewType(false);
                                  setNewTypeName('');
                                }
                              }}
                              className="bg-input-background border-border text-foreground flex-1"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={handleAddNewType}
                              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setIsAddingNewType(false);
                                setNewTypeName('');
                              }}
                              className="bg-card border-border text-foreground hover:bg-muted/10 h-10 px-2"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <select
                            value={editedResource.type}
                            onChange={(e) => {
                              if (e.target.value === '__add_new__') {
                                setIsAddingNewType(true);
                              } else {
                                setEditedResource({ ...editedResource, type: e.target.value });
                              }
                            }}
                            className="h-10 px-3 bg-input-background border border-border text-foreground w-full"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            <option value="">Select Type</option>
                            {typeOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                            <option value="__add_new__" className="text-primary">+ New Type</option>
                          </select>
                        )}
                      </div>
                      )}
                      {viewMode !== 'requests' && (
                      <select
                        value={editedResource.aor}
                        onChange={(e) => setEditedResource({ ...editedResource, aor: e.target.value })}
                        className="h-10 px-3 bg-input-background border border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                      >
                        <option value="">Select AOR</option>
                        {AOR_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      )}
                      {viewMode !== 'requests' && (
                        <select
                          value={editedResource.incident}
                          onChange={(e) => setEditedResource({ ...editedResource, incident: e.target.value })}
                          className="h-10 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="">Select Incident</option>
                          {INCIDENT_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {viewMode === 'requests' ? (
                        <select
                          value={(() => {
                            const request = editedResource.resourceItems?.[0];
                            if (!request) return 'Submitted';
                            
                            // Check if all steps are completed
                            const allStepsCompleted = 
                              request.approvalSteps?.requestResource?.status === 'completed' &&
                              request.approvalSteps?.sectionChief?.status === 'completed' &&
                              request.approvalSteps?.reslReview?.status === 'completed' &&
                              request.approvalSteps?.logistics?.status === 'completed' &&
                              request.approvalSteps?.finance?.status === 'completed';
                            
                            if (allStepsCompleted) return 'Approved';
                            
                            // Check if RESL Review step has started or completed
                            if (request.approvalSteps?.requestResource?.status === 'completed' || 
                                request.approvalSteps?.sectionChief?.status === 'completed') {
                              return 'RESL Review';
                            }
                            
                            return 'Submitted';
                          })()}
                          disabled={true}
                          className="h-10 px-3 bg-input-background border border-border text-foreground opacity-60"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="RESL Review">RESL Review</option>
                          <option value="Approved">Approved</option>
                        </select>
                      ) : (
                        <select
                          value={editedResource.checkInStatus}
                          onChange={(e) => setEditedResource({ ...editedResource, checkInStatus: e.target.value as 'checked-in' | 'not-checked-in' })}
                          className="h-10 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          {CHECK_IN_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                        </>
                      )}

                      {/* Request Status */}
                      {viewMode !== 'requests' && viewMode !== 'all' && (
                        <select
                          value={editedResource.requestStatus || 'Not Requested'}
                          onChange={(e) => setEditedResource({ ...editedResource, requestStatus: e.target.value })}
                          className="h-10 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                        >
                          <option value="Not Requested">Not Requested</option>
                          <option value="Requested: RESL Review">Requested: RESL Review</option>
                        </select>
                      )}
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex-1 grid gap-4 items-center" style={{ gridTemplateColumns: viewMode === 'requests' ? '0.63fr 0.7fr 0.42fr 2fr' : '0.9fr 1fr 1fr 1fr 1fr 0.8fr 0.8fr' }}>
                      <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {viewMode === 'requests' 
                          ? (resource.resource || '-')
                          : resource.resource
                        }
                      </div>
                      {viewMode === 'requests' && (
                        <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {resource.resourceRequests?.[0]?.requestCreator || '-'}
                        </div>
                      )}
                      {viewMode === 'assigned' && (
                        <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {resource.kind || '-'}
                        </div>
                      )}
                      {viewMode !== 'requests' && (
                        <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {resource.type}
                        </div>
                      )}
                      {viewMode !== 'requests' && (
                        <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {resource.aor || '-'}
                        </div>
                      )}
                      {viewMode !== 'requests' && viewMode !== 'all' && (
                        <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {resource.incident || '-'}
                        </div>
                      )}
                      {viewMode === 'requests' && (
                      <div>
                        <span className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {(() => {
                            // Determine status based on approval progress
                            const request = resource.resourceRequests?.[0];
                            if (!request || !request.approvalSteps) return 'Submitted';
                            
                            // Check if all approval steps are completed
                            const allStepsCompleted = 
                              request.approvalSteps.requestResource?.status === 'completed' &&
                              request.approvalSteps.sectionChief?.status === 'completed' &&
                              request.approvalSteps.reslReview?.status === 'completed' &&
                              request.approvalSteps.logistics?.status === 'completed' &&
                              request.approvalSteps.finance?.status === 'completed';
                            
                            if (allStepsCompleted) return 'Approved';
                            
                            // Check if RESL Review step has started or completed
                            if (request.approvalSteps.requestResource?.status === 'completed' || 
                                request.approvalSteps.sectionChief?.status === 'completed') {
                              return 'RESL Review';
                            }
                            
                            return 'Submitted';
                          })()}
                        </span>
                      </div>
                      )}
                      {viewMode === 'requests' && (
                      <div className="text-card-foreground space-y-2" style={{ fontSize: 'var(--text-sm)' }}>
                        {(() => {
                          // Generate detailed summary of Requested Resources
                          const items = resource.resourceRequests || [];
                          if (items.length === 0) return <div>-</div>;
                          
                          // Format: Quantity: [value], Kind: [value], Type: [value], Priority: [value]
                          // Description: [value] (on its own line)
                          return items.map((item, index) => {
                            const parts = [];
                            if (item.quantity) parts.push(`Quantity: ${item.quantity}`);
                            if (item.kind) parts.push(`Kind: ${item.kind}`);
                            if (item.type) parts.push(`Type: ${item.type}`);
                            if (item.priority) parts.push(`Priority: ${item.priority}`);
                            
                            return (
                              <div key={index} className={index > 0 ? 'pt-2 border-t border-white/20' : ''}>
                                <div>{parts.join(', ')}</div>
                                {item.description && <div>Description: {item.description}</div>}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      )}
                      {viewMode !== 'requests' && viewMode !== 'all' && (
                        <div 
                          className={getCheckInStatusColor(resource.checkInStatus)} 
                          style={{ fontSize: 'var(--text-sm)' }}
                        >
                          {resource.checkInStatus === 'checked-in' ? 'Available: Unassigned' : 'Unavailable: In Use by Division Alpha'}
                        </div>
                      )}

                      {/* Request Status */}
                      {viewMode !== 'requests' && viewMode !== 'all' && (
                        <div 
                          style={{ 
                            fontSize: 'var(--text-sm)',
                            color: (resource.id === 'ic-001' || resource.id === '14573') ? '#22c55e' : '#ef4444'
                          }}
                        >
                          {resource.requestStatus || (
                            (resource.id === 'ic-001' || resource.id === '14573') 
                              ? 'Not Requested' 
                              : 'Requested: RESL Review'
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {viewMode === 'requests' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDocumentPreviewModalOpen(true)}
                        className="hover:bg-muted/10 h-8 w-8 p-0"
                        disabled={editingResourceId === resource.id}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    {viewMode !== 'requests' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {}}
                        className="hover:bg-muted/10 h-8 w-8 p-0"
                        disabled={editingResourceId === resource.id}
                      >
                        <Map className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditResource(resource)}
                      className="hover:bg-muted/10 h-8 w-8 p-0"
                      disabled={editingResourceId === resource.id}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {viewMode !== 'assigned' && viewMode !== 'requests' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteResource(resource.id)}
                        className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                        disabled={editingResourceId === resource.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedRows.has(resource.id) && (
                <div className="px-6 py-4 bg-muted/5">
                  {viewMode === 'requests' ? (
                    /* Resource Requests Mode - Show different fields */
                    editingResourceId === resource.id ? (
                      /* Edit Mode for Resource Requests */
                      <div className="space-y-4">
                        {/* Approval Progress - Show in Edit Mode */}
                        <ApprovalProgressSection
                          resource={resource}
                          setSelectedApprovalRequest={setSelectedApprovalRequest}
                          setApproverName={setApproverName}
                          setApproverPosition={setApproverPosition}
                          setApprovalComments={setApprovalComments}
                          setIsViewMode={setIsViewMode}
                          setApprovalModalOpen={setApprovalModalOpen}
                          setReslTactical={setReslTactical}
                          setReslPersonnel={setReslPersonnel}
                          setReslResourceStatus={setReslResourceStatus}
                          setLogisticsOrderNumber={setLogisticsOrderNumber}
                          setLogisticsEtaDate={setLogisticsEtaDate}
                          setLogisticsEtaTime={setLogisticsEtaTime}
                          setLogisticsTimeZone={setLogisticsTimeZone}
                        />

                        {/* Attach Resources Button - Show BEFORE Capability when in add state */}
                        {resource.id.startsWith('req-new-') && editedResource.resourceItems.length === 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-[10px]">
                              <div 
                                className="text-foreground" 
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                Requested Resources
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowAddItemRow(true);
                                }}
                                className="border-border text-foreground hover:bg-muted/10 h-8"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              >
                                + Add Item to Request
                              </Button>
                              <Select>
                                <SelectTrigger 
                                  className="h-8 w-[240px] border-border text-foreground hover:bg-muted/10 [&>svg]:text-white"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', padding: '0 8px', minHeight: '2rem', height: '2rem' }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-white" />
                                    <span className="text-white">Autofill From Work Assignment</span>
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="placeholder" disabled>Select work assignment...</SelectItem>
                                  {Object.keys(WORK_ASSIGNMENT_DETAILS).map((key) => (
                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Add Item Row */}
                            {showAddItemRow && (
                            <div className="p-4 border border-border w-full" style={{ borderRadius: 'var(--radius)', backgroundColor: '#000000' }}>
                              <div className="flex items-end gap-4">
                                <div className="w-16">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Quantity
                                  </div>
                                  <Input
                                    type="number"
                                    value={addItemQuantity}
                                    onChange={(e) => setAddItemQuantity(e.target.value)}
                                    placeholder="Enter quantity"
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-24">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Kind
                                  </div>
                                  <select
                                    value={addItemKind}
                                    onChange={(e) => setAddItemKind(e.target.value)}
                                    className="w-full h-10 px-3 border border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  >
                                    <option value="">Select kind</option>
                                    {KIND_OPTIONS.map((kind) => (
                                      <option key={kind} value={kind}>
                                        {kind}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="w-24">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Type
                                  </div>
                                  <select
                                    value={addItemType}
                                    onChange={(e) => setAddItemType(e.target.value)}
                                    className="w-full h-10 px-3 border border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  >
                                    <option value="">Select type</option>
                                    {TYPE_OPTIONS.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="w-20">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Priority
                                  </div>
                                  <select
                                    value={addItemPriority}
                                    onChange={(e) => setAddItemPriority(e.target.value)}
                                    className="w-full h-10 px-3 border border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                  </select>
                                </div>
                                <div style={{ width: '400px' }}>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Description
                                  </div>
                                  <Input
                                    type="text"
                                    value={addItemDescription}
                                    onChange={(e) => setAddItemDescription(e.target.value)}
                                    placeholder="Enter description"
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-32">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Requested Reporting Location
                                  </div>
                                  <Input
                                    type="text"
                                    value={addItemReportingLocation}
                                    onChange={(e) => setAddItemReportingLocation(e.target.value)}
                                    placeholder="Enter location"
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-48">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Requested Reporting Datetime
                                  </div>
                                  <Input
                                    type="datetime-local"
                                    value={addItemReportingDatetime}
                                    onChange={(e) => setAddItemReportingDatetime(e.target.value)}
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-48">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Requested Demobilization Datetime
                                  </div>
                                  <Input
                                    type="datetime-local"
                                    value={addItemDemobilizationDatetime}
                                    onChange={(e) => setAddItemDemobilizationDatetime(e.target.value)}
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-24">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Order # (LSC)
                                  </div>
                                  <Input
                                    type="text"
                                    value={addItemOrderNumber}
                                    onChange={(e) => setAddItemOrderNumber(e.target.value)}
                                    placeholder="Enter order number"
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-48">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    ETA (LSC)
                                  </div>
                                  <Input
                                    type="datetime-local"
                                    value={addItemETA}
                                    onChange={(e) => setAddItemETA(e.target.value)}
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                                <div className="w-20">
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Cost (LSC)
                                  </div>
                                  <Input
                                    type="number"
                                    value={addItemCost}
                                    onChange={(e) => setAddItemCost(e.target.value)}
                                    placeholder="0.00"
                                    className="border-border text-white"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000' }}
                                  />
                                </div>
                              </div>
                              
                              {/* Attach Resources to Request - Left-aligned below ETA */}
                              <div className="mt-4 flex items-center gap-3">
                                <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                                  Attached Resources
                                </span>
                                <Popover open={attachResourcesPopoverOpen} onOpenChange={setAttachResourcesPopoverOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-border text-foreground hover:bg-muted/10 h-8 min-w-[15rem]"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                    >
                                      + Attach Resources to Request
                                      <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent 
                                    className="w-[75rem] p-0 bg-card border-border" 
                                    style={{ borderRadius: 'var(--radius)' }}
                                    align="start"
                                  >
                                    <div className="p-3 border-b border-border space-y-3">
                                      <div 
                                        className="text-foreground" 
                                        style={{ fontSize: 'var(--text-sm)' }}
                                      >
                                        Select Resources
                                      </div>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          type="text"
                                          placeholder="Search resources by name, kind, or type..."
                                          className="pl-9 bg-input-background border-border text-foreground"
                                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                        />
                                      </div>
                                    </div>
                                    <ScrollArea className="h-64">
                                      <div className="border-b border-border p-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setAddNewResourceModalOpen(true)}
                                          className="w-full justify-start text-foreground hover:text-[#60a5fa] hover:bg-muted/10 h-9"
                                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                        >
                                          + Add New Resource
                                        </Button>
                                      </div>
                                      {selectedResourcesToAttach.size > 0 && (
                                        <div className="p-2 border-b border-border">
                                          <Button
                                            size="sm"
                                            className="justify-start bg-primary text-primary-foreground hover:bg-primary/90 h-9"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                            onClick={() => {
                                              const mockResources = [
                                                { id: 'res-1', name: 'MH-65 Dolphin Helicopter', kind: 'Aircraft', type: 'Helicopter', quantity: 2, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '01/28/2026 1800', location: 'Air Station Kodiak' },
                                                { id: 'res-2', name: 'HC-130J Super Hercules', kind: 'Aircraft', type: 'Fixed Wing', quantity: 1, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '02/05/2026 2200', location: 'Air Station Sacramento' },
                                                { id: 'res-3', name: 'USCGC Bertholf (WMSL-750)', kind: 'Vessel', type: 'Cutter', quantity: 1, availability: 'In Use by Division Alpha', requestStatus: 'Requested: RESL Review', availabilityUntil: '01/25/2026 1200', location: 'Alameda, CA' },
                                                { id: 'res-4', name: 'Response Boat - Medium', kind: 'Vessel', type: 'Small Boat', quantity: 4, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '02/10/2026 0800', location: 'Station Cape Disappointment' },
                                                { id: 'res-5', name: 'Marine Safety Specialist', kind: 'Personnel', type: 'MST', quantity: 3, availability: 'In Use by Division Alpha', requestStatus: 'Requested: RESL Review', availabilityUntil: '01/24/2026 0600', location: 'Sector Puget Sound' },
                                                { id: 'res-6', name: 'Marine Science Technician', kind: 'Personnel', type: 'MST', quantity: 2, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '01/31/2026 1600', location: 'Sector Columbia River' }
                                              ];
                                              const resourcesToAdd = mockResources.filter(r => selectedResourcesToAttach.has(r.id));
                                              setBadgeResources([...badgeResources, ...resourcesToAdd]);
                                              setSelectedResourcesToAttach(new Set());
                                              setAttachResourcesPopoverOpen(false);
                                            }}
                                          >
                                            + Attach {selectedResourcesToAttach.size} Resource{selectedResourcesToAttach.size !== 1 ? 's' : ''} to Request
                                          </Button>
                                        </div>
                                      )}
                                      <div className="p-2 space-y-1">
                                        {[
                                          { id: 'res-1', name: 'MH-65 Dolphin Helicopter', kind: 'Aircraft', type: 'Helicopter', quantity: 2, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '01/28/2026 1800', location: 'Air Station Kodiak' },
                                          { id: 'res-2', name: 'HC-130J Super Hercules', kind: 'Aircraft', type: 'Fixed Wing', quantity: 1, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '02/05/2026 2200', location: 'Air Station Sacramento' },
                                          { id: 'res-3', name: 'USCGC Bertholf (WMSL-750)', kind: 'Vessel', type: 'Cutter', quantity: 1, availability: 'In Use by Division Alpha', requestStatus: 'Requested: RESL Review', availabilityUntil: '01/25/2026 1200', location: 'Alameda, CA' },
                                          { id: 'res-4', name: 'Response Boat - Medium', kind: 'Vessel', type: 'Small Boat', quantity: 4, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '02/10/2026 0800', location: 'Station Cape Disappointment' },
                                          { id: 'res-5', name: 'Marine Safety Specialist', kind: 'Personnel', type: 'MST', quantity: 3, availability: 'In Use by Division Alpha', requestStatus: 'Requested: RESL Review', availabilityUntil: '01/24/2026 0600', location: 'Sector Puget Sound' },
                                          { id: 'res-6', name: 'Marine Science Technician', kind: 'Personnel', type: 'MST', quantity: 2, availability: 'Unassigned', requestStatus: 'Not Requested', availabilityUntil: '01/31/2026 1600', location: 'Sector Columbia River' }
                                        ].map((existingResource) => (
                                          <div
                                            key={existingResource.id}
                                            className="flex items-center space-x-2 p-2 hover:bg-muted/10 cursor-pointer"
                                            style={{ borderRadius: 'var(--radius)' }}
                                          >
                                            <Checkbox
                                              id={`attach-${existingResource.id}`}
                                              checked={selectedResourcesToAttach.has(existingResource.id)}
                                              onCheckedChange={(checked) => {
                                                const newSelected = new Set(selectedResourcesToAttach);
                                                if (checked) {
                                                  newSelected.add(existingResource.id);
                                                } else {
                                                  newSelected.delete(existingResource.id);
                                                }
                                                setSelectedResourcesToAttach(newSelected);
                                              }}
                                            />
                                            <label
                                              htmlFor={`attach-${existingResource.id}`}
                                              className="flex-1 cursor-pointer flex items-center gap-2"
                                            >
                                              <div 
                                                className="text-foreground flex-1" 
                                                style={{ fontSize: 'var(--text-sm)' }}
                                              >
                                                {existingResource.name}
                                              </div>
                                              <div 
                                                className="text-foreground w-24" 
                                                style={{ fontSize: 'var(--text-sm)' }}
                                              >
                                                {existingResource.kind}
                                              </div>
                                              <div 
                                                className="text-foreground w-28" 
                                                style={{ fontSize: 'var(--text-sm)' }}
                                              >
                                                {existingResource.type}
                                              </div>
                                              <div 
                                                className="text-foreground w-16" 
                                                style={{ fontSize: 'var(--text-sm)' }}
                                              >
                                                Qty: {existingResource.quantity}
                                              </div>
                                              <div 
                                                className="w-52" 
                                                style={{ 
                                                  fontSize: 'var(--text-sm)',
                                                  color: existingResource.availability === 'Unassigned' ? '#22c55e' : 
                                                         existingResource.availability === 'In Use by Division Alpha' ? '#ef4444' : 'var(--foreground)'
                                                }}
                                              >
                                                {existingResource.availability}
                                              </div>
                                              <div 
                                                className="w-52" 
                                                style={{ 
                                                  fontSize: 'var(--text-sm)',
                                                  color: existingResource.requestStatus === 'Not Requested' ? '#22c55e' : '#ef4444'
                                                }}
                                              >
                                                {existingResource.requestStatus}
                                              </div>
                                              <div 
                                                className="text-foreground w-48" 
                                                style={{ fontSize: 'var(--text-sm)' }}
                                              >
                                                {existingResource.location}
                                              </div>
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              
                              {/* Badge Resources Display */}
                              {badgeResources.length > 0 && (
                                <div className="flex flex-col gap-2 mt-4">
                                  {badgeResources.map((resource) => (
                                    <div
                                      key={resource.id}
                                      className="p-4 bg-card border border-border w-1/2"
                                      style={{ borderRadius: 'var(--radius)' }}
                                    >
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1 grid gap-4 items-center" style={{ gridTemplateColumns: '1.5fr 0.8fr 0.8fr 0.5fr 0.8fr 1fr' }}>
                                          <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                                            <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Resource Name</div>
                                            {resource.name}
                                          </div>
                                          <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                                            <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Kind</div>
                                            {resource.kind}
                                          </div>
                                          <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                                            <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Type</div>
                                            {resource.type}
                                          </div>
                                          <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                                            <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Quantity</div>
                                            {resource.quantity}
                                          </div>
                                          <div style={{ fontSize: 'var(--text-sm)' }}>
                                            <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Availability</div>
                                            <span style={{ 
                                              color: resource.availability === 'Available' ? '#22c55e' : 
                                                     resource.availability === 'Limited' ? '#f59e0b' : 
                                                     resource.availability === 'Unavailable' ? '#ef4444' : 'var(--foreground)'
                                            }}>
                                              {resource.availability}
                                            </span>
                                          </div>
                                          <div className="text-card-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                                            <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>Location</div>
                                            {resource.location}
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setBadgeResources(badgeResources.filter(r => r.id !== resource.id));
                                          }}
                                          className="text-foreground hover:text-destructive h-8 w-8 p-0"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            )}
                            
                            {/* Display Attached Resources */}
                            {attachedResources.length > 0 && (
                              <div className="space-y-2">
                                {attachedResources.map((resource) => (
                                  <div 
                                    key={resource.id}
                                    className="flex items-start gap-3 p-4 bg-card border border-border min-h-[120px]"
                                    style={{ borderRadius: 'var(--radius)', width: '50%' }}
                                  >
                                    <div className="flex-1 flex flex-col gap-3">
                                      <div className="flex items-start gap-3">
                                      <div className="min-w-[12rem] space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Name
                                        </div>
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-sm)' }}
                                        >
                                          {resource.name}
                                        </div>
                                      </div>
                                      <div className="w-24 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Kind
                                        </div>
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-sm)' }}
                                        >
                                          {resource.kind}
                                        </div>
                                      </div>
                                      <div className="w-28 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Type
                                        </div>
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-sm)' }}
                                        >
                                          {resource.type}
                                        </div>
                                      </div>
                                      <div className="w-20 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Quantity
                                        </div>
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-sm)' }}
                                        >
                                          {resource.quantity}
                                        </div>
                                      </div>
                                      <div className="w-28 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Availability
                                        </div>
                                        <div 
                                          style={{ 
                                            fontSize: 'var(--text-sm)',
                                            color: resource.availability === 'Available' ? '#22c55e' : 
                                                   resource.availability === 'Limited' ? '#f59e0b' : 
                                                   resource.availability === 'Unavailable' ? '#ef4444' : 'var(--foreground)'
                                          }}
                                        >
                                          {resource.availability}
                                        </div>
                                      </div>
                                      <div className="w-48 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Location
                                        </div>
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-sm)' }}
                                        >
                                          {resource.location}
                                        </div>
                                      </div>
                                      <div className="w-32 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Priority
                                        </div>
                                        <Select
                                          value={resource.priority}
                                          onValueChange={(value) => {
                                            setAttachedResources(attachedResources.map(r => 
                                              r.id === resource.id ? { ...r, priority: value } : r
                                            ));
                                          }}
                                        >
                                          <SelectTrigger 
                                            className="h-8 bg-input-background border-border text-foreground"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                          >
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent 
                                            className="bg-card border-border"
                                            style={{ borderRadius: 'var(--radius)' }}
                                          >
                                            <SelectItem 
                                              value="Low" 
                                              className="text-foreground"
                                              style={{ fontSize: 'var(--text-sm)' }}
                                            >
                                              Low
                                            </SelectItem>
                                            <SelectItem 
                                              value="Medium" 
                                              className="text-foreground"
                                              style={{ fontSize: 'var(--text-sm)' }}
                                            >
                                              Medium
                                            </SelectItem>
                                            <SelectItem 
                                              value="High" 
                                              className="text-foreground"
                                              style={{ fontSize: 'var(--text-sm)' }}
                                            >
                                              High
                                            </SelectItem>
                                            <SelectItem 
                                              value="Critical" 
                                              className="text-foreground"
                                              style={{ fontSize: 'var(--text-sm)' }}
                                            >
                                              Critical
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="w-48 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Requested Reporting Location
                                        </div>
                                        <Input
                                          value={resource.requestedReportingLocation}
                                          onChange={(e) => {
                                            setAttachedResources(attachedResources.map(r => 
                                              r.id === resource.id ? { ...r, requestedReportingLocation: e.target.value } : r
                                            ));
                                          }}
                                          placeholder="Enter location"
                                          className="h-8 bg-input-background border-border text-foreground"
                                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                        />
                                      </div>
                                      <div className="w-56 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Requested Reporting Datetime
                                        </div>
                                        <Input
                                          type="datetime-local"
                                          value={resource.requestedReportingDatetime}
                                          onChange={(e) => {
                                            setAttachedResources(attachedResources.map(r => 
                                              r.id === resource.id ? { ...r, requestedReportingDatetime: e.target.value } : r
                                            ));
                                          }}
                                          className="h-8 bg-input-background border-border text-foreground"
                                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                        />
                                      </div>
                                      <div className="w-32 space-y-1">
                                        <div 
                                          className="text-foreground" 
                                          style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                          Order #
                                        </div>
                                        <Input
                                          value={resource.orderNumber}
                                          onChange={(e) => {
                                            setAttachedResources(attachedResources.map(r => 
                                              r.id === resource.id ? { ...r, orderNumber: e.target.value } : r
                                            ));
                                          }}
                                          placeholder="Enter order #"
                                          className="h-8 bg-input-background border-border text-foreground"
                                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                        />
                                      </div>
                                      </div>
                                      <div className="flex items-start gap-3">
                                        <div className="w-56 space-y-1">
                                          <div 
                                            className="text-foreground" 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            ETA
                                          </div>
                                          <Input
                                            type="datetime-local"
                                            value={resource.eta}
                                            onChange={(e) => {
                                              setAttachedResources(attachedResources.map(r => 
                                                r.id === resource.id ? { ...r, eta: e.target.value } : r
                                              ));
                                            }}
                                            className="h-8 bg-input-background border-border text-foreground"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                          />
                                        </div>
                                        <div className="w-32 space-y-1">
                                          <div 
                                            className="text-foreground" 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            Cost
                                          </div>
                                          <Input
                                            value={resource.cost}
                                            onChange={(e) => {
                                              setAttachedResources(attachedResources.map(r => 
                                                r.id === resource.id ? { ...r, cost: e.target.value } : r
                                              ));
                                            }}
                                            placeholder="Enter cost"
                                            className="h-8 bg-input-background border-border text-foreground"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                          />
                                        </div>
                                        <div className="w-56 space-y-1">
                                          <div 
                                            className="text-foreground" 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            Projected Demobilization Datetime
                                          </div>
                                          <Input
                                            type="datetime-local"
                                            value={resource.projectedDemobilizationDatetime}
                                            onChange={(e) => {
                                              setAttachedResources(attachedResources.map(r => 
                                                r.id === resource.id ? { ...r, projectedDemobilizationDatetime: e.target.value } : r
                                              ));
                                            }}
                                            className="h-8 bg-input-background border-border text-foreground"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setAttachedResources(attachedResources.filter(r => r.id !== resource.id));
                                      }}
                                      className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Suggested Sources of Supply & Substitutes Section */}
                        <div className="border border-border p-4" style={{ borderRadius: 'var(--radius)', backgroundColor: '#000000' }}>
                          <div 
                            className="text-foreground mb-3" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Suggested Sources of Supply & Substitutes
                          </div>
                          <Textarea
                            value={editedResource.suggestedSourcesAndSubstitutes || ''}
                            onChange={(e) => setEditedResource({ ...editedResource, suggestedSourcesAndSubstitutes: e.target.value })}
                            placeholder="Enter suggested sources and substitutes..."
                            className="bg-input-background border-border text-foreground min-h-[120px]"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          />
                        </div>

                        {/* Capability Enabled Section */}
                        <div className="border border-border p-4" style={{ borderRadius: 'var(--radius)', backgroundColor: '#000000' }}>
                          <div 
                            className="text-foreground mb-3" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Capability Enabled
                          </div>
                          <Textarea
                            value={editedResource.capabilityEnabled || ''}
                            onChange={(e) => setEditedResource({ ...editedResource, capabilityEnabled: e.target.value })}
                            placeholder="Enter capability enabled description..."
                            className="bg-input-background border-border text-foreground min-h-[120px]"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          />
                        </div>

                        {/* RESL Section */}
                        <div className="bg-card border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
                          <div 
                            className="text-foreground mb-3" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Plans/RESL
                          </div>
                          <div className="grid grid-cols-4 gap-6">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="resl-tactical"
                                checked={editedResource.reslTactical || false}
                                onCheckedChange={(checked) => setEditedResource({ ...editedResource, reslTactical: checked as boolean })}
                              />
                              <label
                                htmlFor="resl-tactical"
                                className="text-foreground cursor-pointer"
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                Tactical
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="resl-personnel"
                                checked={editedResource.reslPersonnel || false}
                                onCheckedChange={(checked) => setEditedResource({ ...editedResource, reslPersonnel: checked as boolean })}
                              />
                              <label
                                htmlFor="resl-personnel"
                                className="text-foreground cursor-pointer"
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                Personnel
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="resl-available"
                                checked={editedResource.reslAvailable || false}
                                onCheckedChange={(checked) => setEditedResource({ ...editedResource, reslAvailable: checked as boolean })}
                              />
                              <label
                                htmlFor="resl-available"
                                className="text-foreground cursor-pointer"
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                Available
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="resl-not-available"
                                checked={editedResource.reslNotAvailable || false}
                                onCheckedChange={(checked) => setEditedResource({ ...editedResource, reslNotAvailable: checked as boolean })}
                              />
                              <label
                                htmlFor="resl-not-available"
                                className="text-foreground cursor-pointer"
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                Not Available
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Logistics Section */}
                        <div className="bg-card border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
                          <div 
                            className="text-foreground mb-3" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Logistics
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Requisition/Purchase Order Number
                                </div>
                                <Input
                                  value={editedResource.logisticsRequisitionNumber || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, logisticsRequisitionNumber: e.target.value })}
                                  placeholder="Enter requisition or purchase order number..."
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Supplier (Name/Phone/Fax/Email)
                                </div>
                                <Input
                                  value={editedResource.logisticsSupplier || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, logisticsSupplier: e.target.value })}
                                  placeholder="Enter supplier information..."
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                            </div>
                            <div>
                              <div 
                                className="text-foreground mb-1" 
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Notes
                              </div>
                              <Textarea
                                value={editedResource.logisticsNotes || ''}
                                onChange={(e) => setEditedResource({ ...editedResource, logisticsNotes: e.target.value })}
                                placeholder="Enter notes..."
                                className="bg-input-background border-border text-foreground min-h-[120px]"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                            </div>
                            <div>
                              <div 
                                className="text-foreground mb-3" 
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Order Placed by
                              </div>
                              <div className="grid grid-cols-3 gap-6">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="logistics-order-placed-by-spul"
                                    checked={editedResource.logisticsOrderPlacedBySpul || false}
                                    onCheckedChange={(checked) => setEditedResource({ ...editedResource, logisticsOrderPlacedBySpul: checked as boolean })}
                                  />
                                  <label
                                    htmlFor="logistics-order-placed-by-spul"
                                    className="text-foreground cursor-pointer"
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    SPUL
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="logistics-order-placed-by-proc"
                                    checked={editedResource.logisticsOrderPlacedByProc || false}
                                    onCheckedChange={(checked) => setEditedResource({ ...editedResource, logisticsOrderPlacedByProc: checked as boolean })}
                                  />
                                  <label
                                    htmlFor="logistics-order-placed-by-proc"
                                    className="text-foreground cursor-pointer"
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    PROC
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="logistics-order-placed-by-other"
                                    checked={editedResource.logisticsOrderPlacedByOther || false}
                                    onCheckedChange={(checked) => setEditedResource({ ...editedResource, logisticsOrderPlacedByOther: checked as boolean })}
                                  />
                                  <label
                                    htmlFor="logistics-order-placed-by-other"
                                    className="text-foreground cursor-pointer"
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    Other
                                  </label>
                                  {editedResource.logisticsOrderPlacedByOther && (
                                    <Input
                                      type="text"
                                      value={editedResource.logisticsOrderPlacedByOtherText || ''}
                                      onChange={(e) => setEditedResource({ ...editedResource, logisticsOrderPlacedByOtherText: e.target.value })}
                                      placeholder="Specify other"
                                      className="border-border text-white ml-2"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', backgroundColor: '#000000', width: '200px' }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Finance Section */}
                        <div className="bg-card border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
                          <div 
                            className="text-foreground mb-3" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Finance
                          </div>
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Reply/Comments from Finance
                            </div>
                            <Textarea
                              value={editedResource.financeComments || ''}
                              onChange={(e) => setEditedResource({ ...editedResource, financeComments: e.target.value })}
                              placeholder="Enter reply or comments from finance..."
                              className="bg-input-background border-border text-foreground min-h-[120px]"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            />
                          </div>
                        </div>

                        {/* Attach Resources Button - Show AFTER Capability when NOT in add state */}
                        {!resource.id.startsWith('req-new-') && editedResource.resourceItems.length === 0 && (
                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleAddEditedResourceItem}
                              className="border-border text-foreground hover:bg-muted/10 h-8"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              + Attach Resources to Request
                            </Button>
                          </div>
                        )}

                        {editedResource.resourceItems.length > 0 && (
                          <>
                            {/* Attached Resources Header */}
                            <div className="pt-2 pb-2">
                              <div 
                                className="text-foreground" 
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                {editedResource.resourceItems.length} Attached Resource{editedResource.resourceItems.length !== 1 ? 's' : ''}
                              </div>
                            </div>

                            {editedResource.resourceItems.map((item, index) => (
                          <div key={item.id} className="border border-border bg-card p-4" style={{ borderRadius: 'var(--radius)' }}>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  Resource {index + 1}: {item.kind || 'Not specified'} - {item.type || 'Not specified'}
                                </div>
                                {editedResource.resourceItems.length > 1 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveEditedResourceItem(item.id)}
                                    className="border-border text-destructive hover:bg-destructive/10 h-7 px-2"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>

                              {/* Resource Name */}
                            <div>
                              <div 
                                className="text-foreground mb-1" 
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Resource Name
                              </div>
                              <Input
                                type="text"
                                placeholder="Enter resource name"
                                value={item.name}
                                onChange={(e) => handleUpdateEditedResourceItem(item.id, 'name', e.target.value)}
                                className="bg-input-background border-border text-foreground"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                            </div>

                            {/* First Row: Kind, Type, Unit, Description - Editable */}
                            <div className="grid grid-cols-4 gap-6">
                              {/* Kind */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Kind
                                </div>
                                <select
                                  value={item.kind}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'kind', e.target.value)}
                                  className="w-full h-9 px-3 bg-input-background border border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                >
                                  <option value="">Select kind</option>
                                  {KIND_OPTIONS.map((kind) => (
                                    <option key={kind} value={kind}>
                                      {kind}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Type */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Type
                                </div>
                                <select
                                  value={item.type}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'type', e.target.value)}
                                  className="w-full h-9 px-3 bg-input-background border border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                >
                                  <option value="">Select type</option>
                                  {TYPE_OPTIONS.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Unit */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Unit
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter unit"
                                  value={item.unit}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'unit', e.target.value)}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>

                              {/* Description */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Description
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter description"
                                  value={item.description}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'description', e.target.value)}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                            </div>

                            {/* Second Row: Suggested Sources and Substitutes - Editable */}
                            <div className="grid grid-cols-2 gap-6">
                              {/* Suggested Sources of Supply */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Suggested Sources of Supply
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter suggested sources"
                                  value={item.suggestedSourcesOfSupply}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'suggestedSourcesOfSupply', e.target.value)}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>

                              {/* Acceptable Substitutes */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Acceptable Substitutes
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter acceptable substitutes"
                                  value={item.acceptableSubstitutes}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'acceptableSubstitutes', e.target.value)}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                            </div>

                            {/* Third Row: Cost Per Unit, Quantity, Total Cost - Editable */}
                            <div className="grid grid-cols-3 gap-6">
                              {/* Cost Per Unit */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Cost Per Unit
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter cost per unit"
                                  value={item.cost}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'cost', e.target.value)}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>

                              {/* Quantity */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Quantity
                                </div>
                                <Input
                                  type="number"
                                  placeholder="Enter quantity"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'quantity', Number(e.target.value))}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>

                              {/* Total Cost */}
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Total Cost
                                </div>
                                <div 
                                  className="h-10 px-3 flex items-center bg-muted/10 border border-border text-card-foreground" 
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                >
                                  {item.cost && item.quantity 
                                    ? `$${(parseFloat(item.cost.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}`
                                    : '-'
                                  }
                                </div>
                              </div>
                            </div>

                            {/* Fourth Row: Reporting Site - Editable */}
                            <div className="grid grid-cols-1 gap-6">
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Reporting Site
                                </div>
                                {!isEditCustomReportingSite ? (
                                  <div className="flex gap-2">
                                    <select
                                      value={item.reportingSite}
                                      onChange={(e) => handleUpdateEditedResourceItem(item.id, 'reportingSite', e.target.value)}
                                      className="flex-1 h-9 px-3 bg-input-background border border-border text-foreground"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                    >
                                      <option value="">Select reporting site</option>
                                      {REPORTING_SITE_OPTIONS.map((site) => (
                                        <option key={site} value={site}>
                                          {site}
                                        </option>
                                      ))}
                                    </select>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setIsEditCustomReportingSite(true)}
                                      className="border-border text-foreground hover:bg-muted/10 h-9 px-3 whitespace-nowrap"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                    >
                                      Use Custom Location
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      placeholder="Enter custom reporting site"
                                      value={item.reportingSite}
                                      onChange={(e) => handleUpdateEditedResourceItem(item.id, 'reportingSite', e.target.value)}
                                      className="flex-1 bg-input-background border-border text-foreground"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditCustomReportingSite(false);
                                        handleUpdateEditedResourceItem(item.id, 'reportingSite', '');
                                      }}
                                      className="border-border text-foreground hover:bg-muted/10 h-9 px-3 whitespace-nowrap"
                                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                    >
                                      Use Dropdown
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Fifth Row: Status - Editable */}
                            <div className="grid grid-cols-1 gap-6">
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Status
                                </div>
                                <select
                                  value={item.status || 'pending-approval'}
                                  onChange={(e) => handleUpdateEditedResourceItem(item.id, 'status', e.target.value)}
                                  className="w-full h-9 px-3 bg-input-background border border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                >
                                  {REQUEST_STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          </div>
                        ))}

                            {/* Add Resource Button */}
                            {editedResource.resourceItems.length < 6 && (
                              <div className="pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleAddEditedResourceItem}
                                  className="border-border text-foreground hover:bg-muted/10 h-8"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                >
                                  + Add Resource
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      /* View Mode for Resource Requests */
                      <div className="space-y-4">

                        {/* Approval Progress - Top Level (Single for all resources) */}
                        <ApprovalProgressSection
                          resource={resource}
                          setSelectedApprovalRequest={setSelectedApprovalRequest}
                          setApproverName={setApproverName}
                          setApproverPosition={setApproverPosition}
                          setApprovalComments={setApprovalComments}
                          setIsViewMode={setIsViewMode}
                          setApprovalModalOpen={setApprovalModalOpen}
                          setReslTactical={setReslTactical}
                          setReslPersonnel={setReslPersonnel}
                          setReslResourceStatus={setReslResourceStatus}
                          setLogisticsOrderNumber={setLogisticsOrderNumber}
                          setLogisticsEtaDate={setLogisticsEtaDate}
                          setLogisticsEtaTime={setLogisticsEtaTime}
                          setLogisticsTimeZone={setLogisticsTimeZone}
                        />

                        {/* Attached Resources Header */}
                        <div className="pt-2 pb-2">
                          <div 
                            className="text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            {resource.resourceRequests.length} Attached Resource{resource.resourceRequests.length !== 1 ? 's' : ''}
                          </div>
                        </div>

                        {resource.resourceRequests.map((request, index) => {
                          const isExpanded = expandedIndividualRequests.has(request.id);
                          return (
                          <div key={request.id} className="space-y-4">
                            {index > 0 && <div className="h-2" />}
                            
                            {/* Bordered container for each resource */}
                            <div className="border border-border bg-card p-4" style={{ borderRadius: 'var(--radius)' }}>
                              <div 
                                className="flex items-center gap-2" 
                              >
                                  <div 
                                    onClick={() => toggleIndividualRequest(request.id)}
                                    className="flex items-center gap-2 flex-1 cursor-pointer"
                                  >
                                    <ChevronDown 
                                      className={`h-4 w-4 text-foreground transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                                    />
                                    <div 
                                      className="text-foreground flex-1" 
                                      style={{ fontSize: 'var(--text-sm)' }}
                                    >
                                      Resource {index + 1}: {request.kind || 'Not specified'} - {request.type || 'Not specified'}
                                    </div>
                                  </div>
                            </div>

                            {/* Approval Progress - MOVED TO TOP LEVEL */}
                            {false && request.approvalSteps && (
                              <div className="bg-card border border-border p-4 mt-4 mb-4" style={{ borderRadius: 'var(--radius)' }}>
                                <div 
                                  className="text-foreground mb-4" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  Approval Progress
                                </div>
                                <div className="flex items-start gap-2">
                                  {/* Step 1: Request Resource */}
                                  <div className="flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                          request.approvalSteps.requestResource.status === 'completed'
                                            ? 'bg-status-success border-status-success'
                                            : request.approvalSteps.requestResource.status === 'rejected'
                                            ? 'bg-status-error border-status-error'
                                            : request.currentApprovalStep === 'requestResource'
                                            ? 'bg-status-warning border-status-warning'
                                            : 'bg-card border-border'
                                        }`}
                                      >
                                        {request.approvalSteps.requestResource.status === 'completed' ? (
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        ) : (
                                          <span 
                                            className={request.currentApprovalStep === 'requestResource' ? 'text-background' : 'text-muted-foreground'} 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            1
                                          </span>
                                        )}
                                      </div>
                                      <div 
                                        className="text-center text-card-foreground" 
                                        style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
                                      >
                                        Request Resource
                                      </div>
                                      {request.approvalSteps.requestResource.status === 'completed' && (
                                        <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                                          {request.approvalSteps.requestResource.approver}
                                        </div>
                                      )}
                                      {/* Review button for Step 1 */}
                                      {request.status === 'pending-approval' && request.currentApprovalStep === 'requestResource' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: '',
                                                approverPosition: '',
                                                currentStep: 'requestResource',
                                                stepLabel: 'Request Resource'
                                              });
                                              setApproverName('');
                                              setApproverPosition('');
                                              setApprovalComments('');
                                              setIsViewMode(false);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            Sign Approval
                                          </Button>
                                        </div>
                                      )}
                                      {/* View button for Step 1 after approval */}
                                      {request.approvalSteps.requestResource.status === 'completed' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: request.approvalSteps.requestResource.approver || '',
                                                approverPosition: '',
                                                currentStep: 'requestResource',
                                                stepLabel: 'Request Resource',
                                                approvalTimestamp: request.approvalSteps.requestResource.timestamp
                                              });
                                              setApproverName(request.approvalSteps.requestResource.approver || '');
                                              setApproverPosition(request.approvalSteps.requestResource.position || '');
                                              setApprovalComments(request.approvalSteps.requestResource.comments || '');
                                              setIsViewMode(true);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="border-border text-foreground hover:bg-muted h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Connector Line */}
                                  <div className="flex-1 pt-4">
                                    <div 
                                      className={`h-0.5 ${
                                        request.approvalSteps.sectionChief.status === 'completed'
                                          ? 'bg-status-success'
                                          : 'bg-border'
                                      }`}
                                    />
                                  </div>

                                  {/* Step 2: Section Chief */}
                                  <div className="flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                          request.approvalSteps.sectionChief.status === 'completed'
                                            ? 'bg-status-success border-status-success'
                                            : request.approvalSteps.sectionChief.status === 'rejected'
                                            ? 'bg-status-error border-status-error'
                                            : request.currentApprovalStep === 'sectionChief'
                                            ? 'bg-status-warning border-status-warning'
                                            : 'bg-card border-border'
                                        }`}
                                      >
                                        {request.approvalSteps.sectionChief.status === 'completed' ? (
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        ) : (
                                          <span 
                                            className={request.currentApprovalStep === 'sectionChief' ? 'text-background' : 'text-muted-foreground'} 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            2
                                          </span>
                                        )}
                                      </div>
                                      <div 
                                        className="text-center text-card-foreground" 
                                        style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
                                      >
                                        Section Chief
                                      </div>
                                      {request.approvalSteps.sectionChief.status === 'completed' && (
                                        <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                                          {request.approvalSteps.sectionChief.approver}
                                        </div>
                                      )}
                                      {/* Review button for Step 2 */}
                                      {request.status === 'pending-approval' && request.currentApprovalStep === 'sectionChief' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: '',
                                                approverPosition: '',
                                                currentStep: 'sectionChief',
                                                stepLabel: 'Section Chief'
                                              });
                                              setApproverName('');
                                              setApproverPosition('');
                                              setApprovalComments('');
                                              setIsViewMode(false);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            Sign Approval
                                          </Button>
                                        </div>
                                      )}
                                      {/* View button for Step 2 after approval */}
                                      {request.approvalSteps.sectionChief.status === 'completed' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: request.approvalSteps.sectionChief.approver || '',
                                                approverPosition: '',
                                                currentStep: 'sectionChief',
                                                stepLabel: 'Section Chief',
                                                approvalTimestamp: request.approvalSteps.sectionChief.timestamp
                                              });
                                              setApproverName(request.approvalSteps.sectionChief.approver || '');
                                              setApproverPosition(request.approvalSteps.sectionChief.position || '');
                                              setApprovalComments(request.approvalSteps.sectionChief.comments || '');
                                              setIsViewMode(true);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="border-border text-foreground hover:bg-muted h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Connector Line */}
                                  <div className="flex-1 pt-4">
                                    <div 
                                      className={`h-0.5 ${
                                        request.approvalSteps.reslReview.status === 'completed'
                                          ? 'bg-status-success'
                                          : 'bg-border'
                                      }`}
                                    />
                                  </div>

                                  {/* Step 3: RESL Review */}
                                  <div className="flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                          request.approvalSteps.reslReview.status === 'completed'
                                            ? 'bg-status-success border-status-success'
                                            : request.approvalSteps.reslReview.status === 'rejected'
                                            ? 'bg-status-error border-status-error'
                                            : request.currentApprovalStep === 'reslReview'
                                            ? 'bg-status-warning border-status-warning'
                                            : 'bg-card border-border'
                                        }`}
                                      >
                                        {request.approvalSteps.reslReview.status === 'completed' ? (
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        ) : (
                                          <span 
                                            className={request.currentApprovalStep === 'reslReview' ? 'text-background' : 'text-muted-foreground'} 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            3
                                          </span>
                                        )}
                                      </div>
                                      <div 
                                        className="text-center text-card-foreground" 
                                        style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
                                      >
                                        RESL Review
                                      </div>
                                      {request.approvalSteps.reslReview.status === 'completed' && (
                                        <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                                          {request.approvalSteps.reslReview.approver}
                                        </div>
                                      )}
                                      {/* Review button for Step 3 */}
                                      {request.status === 'pending-approval' && request.currentApprovalStep === 'reslReview' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: '',
                                                approverPosition: '',
                                                currentStep: 'reslReview',
                                                stepLabel: 'RESL Review'
                                              });
                                              setApproverName('');
                                              setApproverPosition('');
                                              setApprovalComments('');
                                              setIsViewMode(false);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            Sign Approval
                                          </Button>
                                        </div>
                                      )}
                                      {/* View button for Step 3 after approval */}
                                      {request.approvalSteps.reslReview.status === 'completed' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: request.approvalSteps.reslReview.approver || '',
                                                approverPosition: '',
                                                currentStep: 'reslReview',
                                                stepLabel: 'RESL Review',
                                                approvalTimestamp: request.approvalSteps.reslReview.timestamp
                                              });
                                              setApproverName(request.approvalSteps.reslReview.approver || '');
                                              setApproverPosition(request.approvalSteps.reslReview.position || '');
                                              setApprovalComments(request.approvalSteps.reslReview.comments || '');
                                              if (request.approvalSteps.reslReview.data) {
                                                setReslTactical(request.approvalSteps.reslReview.data.tactical || false);
                                                setReslPersonnel(request.approvalSteps.reslReview.data.personnel || false);
                                                setReslResourceStatus(request.approvalSteps.reslReview.data.resourceStatus || 'available');
                                              }
                                              setIsViewMode(true);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="border-border text-foreground hover:bg-muted h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Connector Line */}
                                  <div className="flex-1 pt-4">
                                    <div 
                                      className={`h-0.5 ${
                                        request.approvalSteps.logistics.status === 'completed'
                                          ? 'bg-status-success'
                                          : 'bg-border'
                                      }`}
                                    />
                                  </div>

                                  {/* Step 4: Logistics */}
                                  <div className="flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                          request.approvalSteps.logistics.status === 'completed'
                                            ? 'bg-status-success border-status-success'
                                            : request.approvalSteps.logistics.status === 'rejected'
                                            ? 'bg-status-error border-status-error'
                                            : request.currentApprovalStep === 'logistics'
                                            ? 'bg-status-warning border-status-warning'
                                            : 'bg-card border-border'
                                        }`}
                                      >
                                        {request.approvalSteps.logistics.status === 'completed' ? (
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        ) : (
                                          <span 
                                            className={request.currentApprovalStep === 'logistics' ? 'text-background' : 'text-muted-foreground'} 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            4
                                          </span>
                                        )}
                                      </div>
                                      <div 
                                        className="text-center text-card-foreground" 
                                        style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
                                      >
                                        Logistics
                                      </div>
                                      {request.approvalSteps.logistics.status === 'completed' && (
                                        <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                                          {request.approvalSteps.logistics.approver}
                                        </div>
                                      )}
                                      {/* Review button for Step 4 */}
                                      {request.status === 'pending-approval' && request.currentApprovalStep === 'logistics' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: '',
                                                approverPosition: '',
                                                currentStep: 'logistics',
                                                stepLabel: 'Logistics'
                                              });
                                              setApproverName('');
                                              setApproverPosition('');
                                              setApprovalComments('');
                                              setIsViewMode(false);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            Sign Approval
                                          </Button>
                                        </div>
                                      )}
                                      {/* View button for Step 4 after approval */}
                                      {request.approvalSteps.logistics.status === 'completed' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: request.approvalSteps.logistics.approver || '',
                                                approverPosition: '',
                                                currentStep: 'logistics',
                                                stepLabel: 'Logistics',
                                                approvalTimestamp: request.approvalSteps.logistics.timestamp
                                              });
                                              setApproverName(request.approvalSteps.logistics.approver || '');
                                              setApproverPosition(request.approvalSteps.logistics.position || '');
                                              setApprovalComments(request.approvalSteps.logistics.comments || '');
                                              if (request.approvalSteps.logistics.data) {
                                                setLogisticsOrderNumber(request.approvalSteps.logistics.data.orderNumber || '');
                                                setLogisticsEtaDate(request.approvalSteps.logistics.data.etaDate || '');
                                                setLogisticsEtaTime(request.approvalSteps.logistics.data.etaTime || '');
                                                setLogisticsCost(request.approvalSteps.logistics.data.cost || '');
                                                setLogisticsSupplierName(request.approvalSteps.logistics.data.supplierName || '');
                                                setLogisticsPhone(request.approvalSteps.logistics.data.phone || '');
                                                setLogisticsEmail(request.approvalSteps.logistics.data.email || '');
                                                setLogisticsUseCustomSource(request.approvalSteps.logistics.data.useCustomSource || false);
                                                setLogisticsSourceLocation(request.approvalSteps.logistics.data.sourceLocation || '');
                                                setLogisticsOrderPlacedBy(request.approvalSteps.logistics.data.orderPlacedBy || 'SPUL');
                                                setLogisticsOrderPlacedByOther(request.approvalSteps.logistics.data.orderPlacedByOther || '');
                                                setLogisticsNotes(request.approvalSteps.logistics.data.notes || '');
                                              }
                                              setIsViewMode(true);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="border-border text-foreground hover:bg-muted h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Connector Line */}
                                  <div className="flex-1 pt-4">
                                    <div 
                                      className={`h-0.5 ${
                                        request.approvalSteps.finance.status === 'completed'
                                          ? 'bg-status-success'
                                          : 'bg-border'
                                      }`}
                                    />
                                  </div>

                                  {/* Step 5: Finance */}
                                  <div className="flex-1">
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                          request.approvalSteps.finance.status === 'completed'
                                            ? 'bg-status-success border-status-success'
                                            : request.approvalSteps.finance.status === 'rejected'
                                            ? 'bg-status-error border-status-error'
                                            : request.currentApprovalStep === 'finance'
                                            ? 'bg-status-warning border-status-warning'
                                            : 'bg-card border-border'
                                        }`}
                                      >
                                        {request.approvalSteps.finance.status === 'completed' ? (
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        ) : (
                                          <span 
                                            className={request.currentApprovalStep === 'finance' ? 'text-background' : 'text-muted-foreground'} 
                                            style={{ fontSize: 'var(--text-xs)' }}
                                          >
                                            5
                                          </span>
                                        )}
                                      </div>
                                      <div 
                                        className="text-center text-card-foreground" 
                                        style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}
                                      >
                                        Finance
                                      </div>
                                      {request.approvalSteps.finance.status === 'completed' && (
                                        <div className="text-center text-muted-foreground caption" style={{ fontSize: 'var(--text-xs)', maxWidth: '100px' }}>
                                          {request.approvalSteps.finance.approver}
                                        </div>
                                      )}
                                      {/* Review button for Step 5 */}
                                      {request.status === 'pending-approval' && request.currentApprovalStep === 'finance' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: '',
                                                approverPosition: '',
                                                currentStep: 'finance',
                                                stepLabel: 'Finance'
                                              });
                                              setApproverName('');
                                              setApproverPosition('');
                                              setApprovalComments('');
                                              setIsViewMode(false);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            Sign Approval
                                          </Button>
                                        </div>
                                      )}
                                      {/* View button for Step 5 after approval */}
                                      {request.approvalSteps.finance.status === 'completed' && (
                                        <div className="mt-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedApprovalRequest({
                                                resourceId: resource.id,
                                                requestId: request.id,
                                                requestName: resource.resource,
                                                approverName: request.approvalSteps.finance.approver || '',
                                                approverPosition: '',
                                                currentStep: 'finance',
                                                stepLabel: 'Finance',
                                                approvalTimestamp: request.approvalSteps.finance.timestamp
                                              });
                                              setApproverName(request.approvalSteps.finance.approver || '');
                                              setApproverPosition(request.approvalSteps.finance.position || '');
                                              setApprovalComments(request.approvalSteps.finance.comments || '');
                                              setIsViewMode(true);
                                              setShowIcsPreview(false);
                                              setApprovalModalOpen(true);
                                            }}
                                            className="border-border text-foreground hover:bg-muted h-7 px-2"
                                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-xs)' }}
                                          >
                                            View
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {isExpanded && (
                              <>

                            {/* First Row: Kind, Type, Unit, Description */}
                            <div className="space-y-3 pt-4 order-2">
                              <div className="grid grid-cols-4 gap-6">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Kind
                                </div>
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Type
                                </div>
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Unit
                                </div>
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Description
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-6">
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.kind || '-'}
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.type || '-'}
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.unit || '-'}
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.description || '-'}
                                </div>
                              </div>
                            </div>

                            {/* Second Row: Suggested Sources and Substitutes */}
                            <div className="space-y-3 order-3">
                              <div className="grid grid-cols-2 gap-6">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Suggested Sources of Supply
                                </div>
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Acceptable Substitutes
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-6">
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.suggestedSourcesOfSupply || '-'}
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.acceptableSubstitutes || '-'}
                                </div>
                              </div>
                            </div>

                            {/* Third Row: Cost Per Unit, Quantity, Total Cost */}
                            <div className="space-y-3 order-4">
                              <div className="grid grid-cols-3 gap-6">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Cost Per Unit
                                </div>
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Quantity
                                </div>
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Total Cost
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-6">
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.cost || '-'}
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {resource.quantity || '-'}
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.cost && resource.quantity
                                    ? `$${(parseFloat(request.cost.replace(/[^0-9.]/g, '')) * resource.quantity).toFixed(2)}`
                                    : '-'
                                  }
                                </div>
                              </div>
                            </div>

                            {/* Fourth Row: Reporting Site */}
                            <div className="space-y-3 order-5">
                              <div className="grid grid-cols-1 gap-6">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Reporting Site
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-6">
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  {request.reportingSite || '-'}
                                </div>
                              </div>
                            </div>
                              </>
                            )}
                            </div>
                          </div>
                        );
                        })}

                        {/* Work Assignments Section */}
                        <div className="pt-4 pb-2">
                          <div 
                            className="text-foreground" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Work Assignments
                          </div>
                        </div>

                        {/* Work Assignment 1: Marine Environmental Response */}
                        <div className="border border-border bg-card p-4" style={{ borderRadius: 'var(--radius)' }}>
                          <div 
                            onClick={() => {
                              const isExpanded = expandedIndividualRequests.has('wa-1');
                              if (isExpanded) {
                                const newSet = new Set(expandedIndividualRequests);
                                newSet.delete('wa-1');
                                setExpandedIndividualRequests(newSet);
                              } else {
                                setExpandedIndividualRequests(new Set([...expandedIndividualRequests, 'wa-1']));
                              }
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ChevronDown 
                              className={`h-4 w-4 text-foreground transition-transform ${expandedIndividualRequests.has('wa-1') ? 'rotate-0' : '-rotate-90'}`}
                            />
                            <div 
                              className="text-foreground flex-1" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              Marine Environmental Response - Prevention Division
                            </div>
                          </div>

                          {expandedIndividualRequests.has('wa-1') && (
                            <>
                              <div className="space-y-3 pt-4">
                                <div className="grid grid-cols-3 gap-6">
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Assigned To
                                  </div>
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Status
                                  </div>
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Priority
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    LCDR Sarah Martinez
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    Active
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    High
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Start Date
                                  </div>
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Estimated Completion
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    01/20/2026 0800 UTC
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    01/27/2026 1800 UTC
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Description
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  Coordinate oil spill response operations including containment boom deployment, wildlife protection measures, and environmental impact assessment. Liaise with EPA and state environmental agencies for compliance monitoring and reporting.
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Work Assignment 2: Incident Command Support */}
                        <div className="border border-border bg-card p-4 mt-2" style={{ borderRadius: 'var(--radius)' }}>
                          <div 
                            onClick={() => {
                              const isExpanded = expandedIndividualRequests.has('wa-2');
                              if (isExpanded) {
                                const newSet = new Set(expandedIndividualRequests);
                                newSet.delete('wa-2');
                                setExpandedIndividualRequests(newSet);
                              } else {
                                setExpandedIndividualRequests(new Set([...expandedIndividualRequests, 'wa-2']));
                              }
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <ChevronDown 
                              className={`h-4 w-4 text-foreground transition-transform ${expandedIndividualRequests.has('wa-2') ? 'rotate-0' : '-rotate-90'}`}
                            />
                            <div 
                              className="text-foreground flex-1" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              Incident Command Support - Operations Division
                            </div>
                          </div>

                          {expandedIndividualRequests.has('wa-2') && (
                            <>
                              <div className="space-y-3 pt-4">
                                <div className="grid grid-cols-3 gap-6">
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Assigned To
                                  </div>
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Status
                                  </div>
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Priority
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    CDR Michael Chen
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    Active
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    Critical
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Start Date
                                  </div>
                                  <div 
                                    className="text-foreground" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Estimated Completion
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    01/19/2026 0600 UTC
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    01/30/2026 2000 UTC
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-4">
                                <div 
                                  className="text-foreground" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Description
                                </div>
                                <div 
                                  className="text-card-foreground" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                >
                                  Maintain 24/7 incident command post operations, coordinate multi-agency response activities, and ensure unified command structure compliance. Facilitate daily operational briefings and manage resource deployment through ICS-214 activity logs.
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Capability Enabled Section */}
                        <div className="bg-card border border-border p-4" style={{ borderRadius: 'var(--radius)' }}>
                          <div 
                            className="text-foreground mb-3" 
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Capability Enabled
                          </div>
                          {resource.id.startsWith('req-new-') ? (
                            <Textarea
                              value={resource.resourceRequests?.[0]?.capabilityEnabled || ''}
                              onChange={(e) => {
                                // Update capability enabled for the new resource request
                                const updatedResources = resources.map(r => {
                                  if (r.id === resource.id && r.resourceRequests && r.resourceRequests.length > 0) {
                                    return {
                                      ...r,
                                      resourceRequests: r.resourceRequests.map((req, idx) => 
                                        idx === 0 ? { ...req, capabilityEnabled: e.target.value } : req
                                      )
                                    };
                                  }
                                  return r;
                                });
                                setResources(updatedResources);
                              }}
                              placeholder="Enter capability enabled description..."
                              className="bg-input-background border-border text-foreground min-h-[120px]"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            />
                          ) : (
                            <div 
                              className="text-card-foreground" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {resource.resourceRequests && resource.resourceRequests.length > 0 ? (
                                resource.resourceRequests[0].kind === 'Aircraft' ? 
                                  'Aerial reconnaissance and surveillance capability for incident area assessment, search patterns, and real-time situational awareness. Enables rapid response coordination and victim location identification across extended maritime zones.' :
                                resource.resourceRequests[0].kind === 'Vessel' ?
                                  'Enhanced maritime patrol and interdiction capability for incident response operations. Provides on-water platform for search and rescue, pollution response, and law enforcement activities within designated operational areas.' :
                                resource.resourceRequests[0].kind === 'Personnel' ?
                                  'Augmented operational staffing capacity to maintain 24/7 incident command structure and support sustained response operations. Enables specialized skill deployment for technical operations, planning, logistics, and operational coordination.' :
                                resource.resourceRequests[0].kind === 'Equipment' ?
                                  'Specialized equipment deployment enhancing incident response effectiveness and operational safety. Provides critical tools for containment, cleanup, rescue operations, and environmental protection activities.' :
                                resource.resourceRequests[0].kind === 'Vehicle' ?
                                  'Ground transportation and logistics capability supporting incident command mobility, personnel deployment, and equipment staging operations. Enables rapid response positioning and sustained operational tempo.' :
                                  'Mission-critical resource deployment enabling enhanced incident response capability, operational effectiveness, and sustained emergency operations support across all phases of the incident lifecycle.'
                              ) : 'Mission-critical resource deployment enabling enhanced incident response capability and operational effectiveness.'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    /* All Resources / Resources Assigned Mode */
                    <>
                      {editingResourceId === resource.id ? (
                        /* Edit Mode - Editable Fields */
                        <>
                          <div className="grid grid-cols-4 gap-6">
                          {/* Assignee - Only for Incident Commander and Resource Unit Leader */}
                          {(resource.id === 'ic-001' || resource.id === 'rul-001') && (
                            <>
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Assignee
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter assignee"
                                  value={editedResource.assignee || 'CAPT John Smith'}
                                  onChange={(e) => setEditedResource({ ...editedResource, assignee: e.target.value })}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Linked Incident Roster Position
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter position"
                                  value={editedResource.linkedIncidentRosterPosition || resource.linkedIncidentRosterPosition || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, linkedIncidentRosterPosition: e.target.value })}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                            </>
                          )}

                          {/* Current Location */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Current Location
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder="Enter location"
                                value={editedResource.currentLocation}
                                onChange={(e) => setEditedResource({ ...editedResource, currentLocation: e.target.value })}
                                className="bg-input-background border-border text-foreground"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <Input
                                  type="text"
                                  placeholder="Latitude"
                                  value={editedResource.latitude || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, latitude: e.target.value })}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                                <Input
                                  type="text"
                                  placeholder="Longitude"
                                  value={editedResource.longitude || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, longitude: e.target.value })}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Datetime Ordered */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Datetime Ordered
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="datetime-local"
                                value={editedResource.datetimeOrdered}
                                onChange={(e) => setEditedResource({ ...editedResource, datetimeOrdered: e.target.value })}
                                className="bg-input-background border-border text-foreground flex-1"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                              <select
                                value={editedResource.datetimeOrderedTimezone}
                                onChange={(e) => setEditedResource({ ...editedResource, datetimeOrderedTimezone: e.target.value })}
                                className="h-10 px-3 bg-input-background border border-border text-foreground w-24"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              >
                                <option value="UTC">UTC</option>
                                <option value="EST">EST</option>
                                <option value="CST">CST</option>
                                <option value="MST">MST</option>
                                <option value="PST">PST</option>
                              </select>
                            </div>
                          </div>

                          {/* Point of Contact */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Point of Contact
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder="Enter POC name"
                                value={editedResource.poc}
                                onChange={(e) => setEditedResource({ ...editedResource, poc: e.target.value })}
                                className="bg-input-background border-border text-foreground"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                              <Input
                                type="email"
                                placeholder="Enter POC email"
                                value={editedResource.pocEmail || ''}
                                onChange={(e) => setEditedResource({ ...editedResource, pocEmail: e.target.value })}
                                className="bg-input-background border-border text-foreground"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                            </div>
                          </div>

                          {/* Owner */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Owner
                            </div>
                            <select
                              value={editedResource.owner || ''}
                              onChange={(e) => setEditedResource({ ...editedResource, owner: e.target.value })}
                              className="h-10 px-3 bg-input-background border border-border text-foreground w-full"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            >
                              <option value="">Select Owner</option>
                              <option value="Sector">Sector</option>
                              <option value="District">District</option>
                              <option value="Area">Area</option>
                              <option value="National Strike Force (NSF)">National Strike Force (NSF)</option>
                              <option value="Deployable Specialized Forces (DSF)">Deployable Specialized Forces (DSF)</option>
                            </select>
                          </div>
                          </div>

                          {/* Location Row - Edit Mode */}
                        <div className="grid grid-cols-2 gap-6 mt-6">
                          {/* Latitude */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Latitude
                            </div>
                            <Input
                              type="text"
                              placeholder="e.g., 42.3601"
                              value={editedResource.latitude || ''}
                              onChange={(e) => setEditedResource({ ...editedResource, latitude: e.target.value })}
                              className="bg-input-background border-border text-foreground"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            />
                          </div>

                          {/* Longitude */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Longitude
                            </div>
                            <Input
                              type="text"
                              placeholder="e.g., -71.0589"
                              value={editedResource.longitude || ''}
                              onChange={(e) => setEditedResource({ ...editedResource, longitude: e.target.value })}
                              className="bg-input-background border-border text-foreground"
                              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            />
                          </div>
                          </div>

                          {/* Capabilities Row - Edit Mode */}
                          <div className="grid grid-cols-1 gap-6 mt-6">
                            <div>
                              <div 
                                className="text-foreground mb-1" 
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Capabilities
                              </div>
                              <Textarea
                                value={editedResource.capabilities || ''}
                                onChange={(e) => setEditedResource({ ...editedResource, capabilities: e.target.value })}
                                placeholder="Enter resource capabilities..."
                                className="bg-input-background border-border text-foreground min-h-[100px]"
                                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                              />
                            </div>
                          </div>

                          {/* Boston Harbor Oil Spill Response Incident Details - Edit Mode */}
                          <div className="mt-6">
                            <div 
                              className="text-foreground mb-3" 
                              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                            >
                              Boston Harbor Oil Spill Response Incident Details
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Current Op Period
                                  </div>
                                  <Input
                                    type="text"
                                    value={editedResource.currentOpPeriod || ''}
                                    onChange={(e) => setEditedResource({ ...editedResource, currentOpPeriod: e.target.value })}
                                    placeholder="Enter op period..."
                                    className="bg-input-background border-border text-foreground"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                  />
                                </div>
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Current Op Period Assignment
                                  </div>
                                  <Input
                                    type="text"
                                    value={editedResource.currentOpPeriodAssignment || ''}
                                    onChange={(e) => setEditedResource({ ...editedResource, currentOpPeriodAssignment: e.target.value })}
                                    placeholder="Enter assignment..."
                                    className="bg-input-background border-border text-foreground"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-4" style={{ marginLeft: '-200px' }}>
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Next Op Period
                                  </div>
                                  <Input
                                    type="text"
                                    value={editedResource.nextOpPeriod || ''}
                                    onChange={(e) => setEditedResource({ ...editedResource, nextOpPeriod: e.target.value })}
                                    placeholder="Enter next op period..."
                                    className="bg-input-background border-border text-foreground"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                  />
                                </div>
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Next Op Period Assignment
                                  </div>
                                  <Input
                                    type="text"
                                    value={editedResource.nextOpPeriodAssignment || ''}
                                    onChange={(e) => setEditedResource({ ...editedResource, nextOpPeriodAssignment: e.target.value })}
                                    placeholder="Enter next assignment..."
                                    className="bg-input-background border-border text-foreground"
                                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                  />
                                </div>
                              </div>
                              {resource.id !== 'rul-001' && (
                                <div style={{ marginLeft: '-400px' }}>
                                  <div className="flex gap-0 border border-border" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', width: '50%' }}>
                                    <button
                                      onClick={() => {
                                        setResources(resources.map(r => 
                                          r.id === resource.id ? { ...r, checkInStatus: 'not-checked-in' } : r
                                        ));
                                      }}
                                      className={resource.checkInStatus !== 'checked-in'
                                        ? 'flex-1 px-4 py-2 bg-slate-700 text-primary-foreground hover:bg-slate-600 whitespace-normal border-l-2 border-t-2 border-b-2 border-r-2 border-white'
                                        : 'flex-1 px-4 py-2 bg-card text-foreground hover:bg-muted/10 border-r border-border whitespace-normal'}
                                      style={{ fontSize: 'var(--text-sm)' }}
                                    >
                                      Checked-Out of Incident: Boston Harbor Oil Spill Response
                                    </button>
                                    <button
                                      onClick={() => {
                                        setResources(resources.map(r => 
                                          r.id === resource.id ? { ...r, checkInStatus: 'checked-in' } : r
                                        ));
                                      }}
                                      className={resource.checkInStatus === 'checked-in'
                                        ? 'flex-1 px-4 py-2 bg-status-success hover:bg-status-success/90 whitespace-normal border-l-2 border-r-2 border-t-2 border-b-2 border-white'
                                        : 'flex-1 px-4 py-2 bg-card text-foreground hover:bg-muted/10 whitespace-normal'}
                                      style={{ fontSize: 'var(--text-sm)', color: resource.checkInStatus === 'checked-in' ? '#000000' : undefined }}
                                    >
                                      Checked-In to Incident: Boston Harbor Oil Spill Response
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Work Assignment List Attachment Row - Edit Mode */}
                          <div className="grid grid-cols-1 gap-6 mt-6">
                            <div className="space-y-3">
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Attached to Resource Request
                                </div>
                                <Input
                                  type="text"
                                  value={editedResource.attachedToResourceRequest || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, attachedToResourceRequest: e.target.value })}
                                  placeholder="Enter resource request..."
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Requested Reporting Datetime
                                </div>
                                <Input
                                  type="datetime-local"
                                  value={editedResource.requestedReportingDatetime || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, requestedReportingDatetime: e.target.value })}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Requested Demobilization Datetime
                                </div>
                                <Input
                                  type="datetime-local"
                                  value={editedResource.requestedDemobilizationDatetime || ''}
                                  onChange={(e) => setEditedResource({ ...editedResource, requestedDemobilizationDatetime: e.target.value })}
                                  className="bg-input-background border-border text-foreground"
                                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* View Mode - Display Only */
                        <>
                          <div className={resource.id === 'rul-001' ? 'grid gap-6' : 'grid grid-cols-4 gap-6'} style={resource.id === 'rul-001' ? { gridTemplateColumns: '2fr 1fr 1fr 1fr' } : {}}>
                          {/* Assignee - Only for Incident Commander and Resource Unit Leader */}
                          {(resource.id === 'ic-001' || resource.id === 'rul-001') && (
                            <>
                              <div>
                                {resource.id === 'rul-001' ? (
                                  <div style={{ fontSize: 'var(--text-sm)' }}>
                                    <div className="flex gap-4 mb-1">
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-xs)', minWidth: '130px' }}>Assignee</span>
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-xs)', minWidth: '95px' }}>Activation Status</span>
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-xs)', minWidth: '95px' }}>Check-In Status</span>
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-xs)' }}>Sign-In Status</span>
                                    </div>
                                    {[
                                      { name: 'CAPT John Smith', activationStatus: 'Activated', checkInStatus: 'Checked-In', signInStatus: 'Signed In' },
                                      { name: 'LT Sarah Johnson', activationStatus: 'Activated', checkInStatus: 'Checked-In', signInStatus: 'Signed In' },
                                      { name: 'CDR Michael Brown', activationStatus: 'Deactivated', checkInStatus: 'Demobilized', signInStatus: 'Signed Out' },
                                    ].map((a, i) => (
                                      <div key={i} className="flex gap-4 text-card-foreground mb-1">
                                        <span style={{ minWidth: '130px' }}>{a.name}</span>
                                        <span style={{ minWidth: '95px', color: a.activationStatus === 'Activated' ? 'var(--status-success)' : 'var(--status-error, #ef4444)' }}>
                                          {a.activationStatus}
                                        </span>
                                        <span style={{ minWidth: '95px', color: a.checkInStatus === 'Checked-In' ? 'var(--status-success)' : 'var(--status-error, #ef4444)' }}>
                                          {a.checkInStatus}
                                        </span>
                                        <span style={{ color: a.signInStatus === 'Signed In' ? 'var(--status-success)' : 'var(--status-error, #ef4444)' }}>
                                          {a.signInStatus}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <>
                                    <div 
                                      className="text-foreground mb-1" 
                                      style={{ fontSize: 'var(--text-xs)' }}
                                    >
                                      Assignee
                                    </div>
                                    <div 
                                      className="text-card-foreground" 
                                      style={{ fontSize: 'var(--text-sm)' }}
                                    >
                                      {resource.assignee || 'CAPT John Smith'}
                                    </div>
                                  </>
                                )}
                              </div>
                              <div>
                                <div 
                                  className="text-foreground mb-1" 
                                  style={{ fontSize: 'var(--text-xs)' }}
                                >
                                  Linked Incident Roster Position
                                </div>
                                <div 
                                  className="text-card-foreground cursor-pointer hover:underline" 
                                  style={{ fontSize: 'var(--text-sm)' }}
                                  onClick={() => setRosterPositionModalOpen(true)}
                                >
                                  {resource.linkedIncidentRosterPosition || 'Incident Commander'}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Current Location */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Current Location
                            </div>
                            <div 
                              className="text-card-foreground space-y-1" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              <div>{resource.currentLocation || '-'}</div>
                              <div>Latitude: {resource.latitude || '41.6688'}</div>
                              <div>Longitude: {resource.longitude || '-70.2962'}</div>
                            </div>
                          </div>

                          {/* Datetime Ordered */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Datetime Ordered
                            </div>
                            <div 
                              className="text-card-foreground" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {resource.datetimeOrdered && resource.datetimeOrderedTimezone 
                                ? `${new Date(resource.datetimeOrdered).toLocaleString('en-US', { 
                                    hour12: false, 
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} ${resource.datetimeOrderedTimezone}`
                                : '-'
                              }
                            </div>
                          </div>

                          {/* Point of Contact */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Point of Contact
                            </div>
                            <div 
                              className="text-card-foreground" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {resource.poc && resource.pocEmail 
                                ? `${resource.poc} (${resource.pocEmail})`
                                : resource.poc || resource.pocEmail || '-'
                              }
                            </div>
                          </div>

                          {/* Owner */}
                          <div>
                            <div 
                              className="text-foreground mb-1" 
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Owner
                            </div>
                            <div 
                              className="text-card-foreground" 
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {resource.owner || '-'}
                            </div>
                          </div>
                          </div>

                          {/* Capabilities Row - View Mode */}
                          <div className="grid grid-cols-1 gap-6 mt-6">
                            <div>
                              <div 
                                className="text-foreground mb-1" 
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Capabilities
                              </div>
                              <div 
                                className="text-card-foreground" 
                                style={{ fontSize: 'var(--text-sm)' }}
                              >
                                {resource.capabilities || (
                                  resource.type === 'Aircraft' ? 
                                    'Search and rescue operations, maritime patrol surveillance, medical evacuation capability, long-range detection and tracking, aerial reconnaissance, communications relay, law enforcement support, logistics transport.' :
                                  resource.type === 'Vessel' ?
                                    'Maritime patrol and interdiction, search and rescue operations, law enforcement boarding capability, pollution response platform, towing and salvage operations, communications relay, logistics support, multi-mission operational flexibility.' :
                                  resource.type === 'Boat' ?
                                    'Nearshore search and rescue, rapid response deployment, law enforcement operations, port security patrols, shallow water navigation, personnel transport, limited towing capability, coastal surveillance.' :
                                  resource.type === 'Personnel Team' ?
                                    'Specialized operational expertise, incident command support, multi-agency coordination, technical operations capability, planning and logistics functions, sustained 24/7 operations, training and advisory services, field assessment and reporting.' :
                                  resource.type === 'Equipment' ?
                                    'Mission-specific operational support, environmental response capability, safety and rescue equipment deployment, communications infrastructure, specialized technical tools, hazmat response capacity, operational sustainment resources.' :
                                  resource.type === 'Support Unit' ?
                                    'Logistics and supply chain management, maintenance and technical support, administrative and documentation services, communications support, facility operations, personnel sustainment, equipment staging and distribution.' :
                                  'Multi-mission operational capability, rapid response deployment, sustained operations support, inter-agency coordination, safety and security enforcement, environmental protection, search and rescue operations, maritime law enforcement.'
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Boston Harbor Oil Spill Response Incident Details - View Mode */}
                          <div className="mt-6">
                            <div 
                              className="text-foreground mb-3" 
                              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
                            >
                              Boston Harbor Oil Spill Response Incident Details
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Current Op Period
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    {resource.currentOpPeriod || 'Period 3: 2025-10-24 0800 - 2025-10-25 0800'}
                                  </div>
                                </div>
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Current Op Period Assignment
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    {resource.currentOpPeriodAssignment || 'Available: Unassigned'}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4" style={{ marginLeft: '-200px' }}>
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Next Op Period
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    {resource.nextOpPeriod || 'Period 4: 2025-10-25 0800 - 2025-10-26 0800'}
                                  </div>
                                </div>
                                <div>
                                  <div 
                                    className="text-foreground mb-1" 
                                    style={{ fontSize: 'var(--text-xs)' }}
                                  >
                                    Next Op Period Assignment
                                  </div>
                                  <div 
                                    className="text-card-foreground" 
                                    style={{ fontSize: 'var(--text-sm)' }}
                                  >
                                    {resource.nextOpPeriodAssignment || 'ICS-204: Division Alpha'}
                                  </div>
                                </div>
                              </div>
                              {resource.id !== 'rul-001' && (
                                <div style={{ marginLeft: '-400px' }}>
                                  <div className="flex gap-0 border border-border" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', width: '50%' }}>
                                    <button
                                      onClick={() => {
                                        setResources(resources.map(r => 
                                          r.id === resource.id ? { ...r, checkInStatus: 'not-checked-in' } : r
                                        ));
                                      }}
                                      className={resource.checkInStatus !== 'checked-in'
                                        ? 'flex-1 px-4 py-2 bg-slate-700 text-primary-foreground hover:bg-slate-600 whitespace-normal border-l-2 border-t-2 border-b-2 border-r-2 border-white'
                                        : 'flex-1 px-4 py-2 bg-card text-foreground hover:bg-muted/10 border-r border-border whitespace-normal'}
                                      style={{ fontSize: 'var(--text-sm)' }}
                                    >
                                      Checked-Out of Incident: Boston Harbor Oil Spill Response
                                    </button>
                                    <button
                                      onClick={() => {
                                        setResources(resources.map(r => 
                                          r.id === resource.id ? { ...r, checkInStatus: 'checked-in' } : r
                                        ));
                                      }}
                                      className={resource.checkInStatus === 'checked-in'
                                        ? 'flex-1 px-4 py-2 bg-status-success hover:bg-status-success/90 whitespace-normal border-l-2 border-r-2 border-t-2 border-b-2 border-white'
                                        : 'flex-1 px-4 py-2 bg-card text-foreground hover:bg-muted/10 whitespace-normal'}
                                      style={{ fontSize: 'var(--text-sm)', color: resource.checkInStatus === 'checked-in' ? '#000000' : undefined }}
                                    >
                                      Checked-In to Incident: Boston Harbor Oil Spill Response
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Work Assignment List Attachment Row - View Mode */}
                          <div className="grid grid-cols-1 gap-6 mt-6">
                            <div>
                              <div 
                                className="text-foreground mb-1" 
                                style={{ fontSize: 'var(--text-xs)' }}
                              >
                                Attached to Resource Request
                              </div>
                              <div 
                                className="text-card-foreground space-y-1 border border-white p-3" 
                                style={{ fontSize: 'var(--text-sm)', borderRadius: 'var(--radius)' }}
                              >
                                <div>{resource.attachedToResourceRequest || 'Helicopter Request: RESL Review'}</div>
                                <div>Requested Reporting Datetime: {resource.requestedReportingDatetime || '10/24/2025 14:00 UTC'}</div>
                                <div>Requested Demobilization Datetime: {resource.requestedDemobilizationDatetime || '10/26/2025 18:00 UTC'}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Save/Cancel buttons for edit mode - positioned after all inputs including expanded content */}
              {editingResourceId === resource.id && (
                <div className="px-4 pb-4 pt-4 flex gap-2">
                  <Button
                    onClick={() => setSubmitConfirmationModalOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    Submit to Section Chief
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="bg-card border-border text-foreground hover:bg-muted/10"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* Resource Details Modal */}
      <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="bg-card border-border max-w-2xl" style={{ borderRadius: 'var(--radius)' }}>
          <DialogHeader>
            <DialogTitle className="text-card-foreground" style={{ fontSize: 'var(--text-lg)' }}>
              Resource Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              View detailed information about this resource
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Unit</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{selectedItem.unit}</div>
                </div>
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Point of Contact</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{selectedItem.poc}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Hull/Tail Number</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{selectedItem.hullTailNumber}</div>
                </div>
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Phone</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{selectedItem.phone}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Area of Responsibility</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{selectedItem.aor}</div>
                </div>
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Status</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    {selectedItem.status.charAt(0).toUpperCase() + selectedItem.status.slice(1).replace('-', ' ')}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Persons on Board</div>
                <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>{selectedItem.personsOnBoard}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Ordered</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    {formatDateTimeMilitary(selectedItem.ordered, selectedItem.orderedTimezone)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>ETA</div>
                  <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                    {formatDateTimeMilitary(selectedItem.eta, selectedItem.etaTimezone)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Work Assignment Details Modal */}
      <Dialog open={workAssignmentModalOpen} onOpenChange={setWorkAssignmentModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl" style={{ borderRadius: 'var(--radius)' }}>
          <DialogHeader>
            <DialogTitle className="text-card-foreground" style={{ fontSize: 'var(--text-lg)' }}>
              Work Assignment Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              View detailed information about this work assignment
            </DialogDescription>
          </DialogHeader>
          {selectedWorkAssignment && (
            <div className="space-y-6 py-4">
              {/* Work Assignment Title */}
              <div className="pb-4 border-b border-border">
                <div className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-xs)' }}>
                  Assignment
                </div>
                <div 
                  className="inline-block"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    backgroundColor: getWorkAssignmentStyle(selectedWorkAssignment.title).bg,
                    color: getWorkAssignmentStyle(selectedWorkAssignment.title).text,
                    border: `1px solid ${getWorkAssignmentStyle(selectedWorkAssignment.title).border}`,
                  }}
                >
                  {selectedWorkAssignment.title}
                </div>
              </div>

              {/* Assignment Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      Resource Assigned
                    </div>
                    <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {selectedWorkAssignment.resource}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      Resource Type
                    </div>
                    <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {selectedWorkAssignment.type}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      Incident
                    </div>
                    <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {selectedWorkAssignment.incident}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      Area of Responsibility
                    </div>
                    <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {selectedWorkAssignment.aor}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      Unit
                    </div>
                    <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {selectedWorkAssignment.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                      Point of Contact
                    </div>
                    <div className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                      {selectedWorkAssignment.poc}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Description */}
              <div className="pt-4 border-t border-border">
                <div className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-xs)' }}>
                  Mission Description
                </div>
                <div className="text-foreground" style={{ fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
                  {selectedWorkAssignment.title === 'Deploy Boom in AOR 5' && (
                    <>Deploy and position containment boom in Area of Responsibility 5 to establish oil spill containment perimeter. Coordinate with environmental response team and maintain position until relieved.</>
                  )}
                  {selectedWorkAssignment.title === 'Offshore Medical Evacuation' && (
                    <>Conduct medical evacuation operation for injured personnel from offshore vessel or platform. Maintain ready status, coordinate with medical facilities, and ensure safe patient transport to designated medical facility.</>
                  )}
                  {selectedWorkAssignment.title === 'Vessel Traffic Control - Boston Harbor' && (
                    <>Monitor and direct vessel traffic in Boston Harbor shipping lanes. Enforce navigation rules, coordinate vessel movements during high-traffic periods, and ensure safe passage through restricted waters.</>
                  )}
                  {selectedWorkAssignment.title === 'Oil Spill Containment - Sector 7' && (
                    <>Execute containment and recovery operations for oil spill in Sector 7. Deploy skimmers and recovery equipment, coordinate with cleanup contractors, and monitor environmental impact.</>
                  )}
                  {selectedWorkAssignment.title === 'Port State Control Inspection' && (
                    <>Conduct Port State Control inspection of foreign-flagged vessel to ensure compliance with international maritime conventions. Verify vessel safety equipment, crew certifications, and operational readiness.</>
                  )}
                  {!['Deploy Boom in AOR 5', 'Offshore Medical Evacuation', 'Vessel Traffic Control - Boston Harbor', 'Oil Spill Containment - Sector 7', 'Port State Control Inspection'].includes(selectedWorkAssignment.title) && (
                    <>Execute assigned mission tasks in accordance with operational orders. Maintain situational awareness, coordinate with command center, and report mission status at regular intervals.</>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resource Request Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={(open) => {
        setIsDrawerOpen(open);
        if (!open) {
          setEditingResourceId(null);
        }
      }}>
        <SheetContent 
          side="right" 
          className="bg-card border-border w-full sm:max-w-2xl overflow-y-auto"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <SheetHeader className="border-b border-border pb-4 px-6">
            <SheetTitle className="text-foreground">
              {editingResourceId ? 'Edit Resource Request' : 'Add Resource Request'}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {editingResourceId 
                ? 'Update the details below to edit the resource request'
                : 'Fill in the details below to create a new resource request'
              }
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] pr-4 pl-6">
            <div className="space-y-6 py-6">
              {/* Request Details Header */}
              <div className="border-b border-border pb-3">
                <h3 
                  className="text-foreground" 
                  style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Request Details
                </h3>
              </div>

              {/* Request Name Input */}
              <div>
                <label 
                  className="text-foreground mb-2 block" 
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Request Name
                </label>
                <input
                  type="text"
                  value={newResource.requestName}
                  onChange={(e) => setNewResource({ ...newResource, requestName: e.target.value })}
                  className="w-full h-10 px-3 bg-input-background border border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                  placeholder="Enter request name"
                />
              </div>

              {/* Select Work Assignment Dropdown */}
              <div>
                <label 
                  className="text-foreground mb-2 block" 
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Select Work Assignment
                </label>
                <select
                  value={newResource.workAssignment}
                  onChange={(e) => setNewResource({ ...newResource, workAssignment: e.target.value })}
                  className="w-full h-10 px-3 bg-input-background border border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                >
                  <option value="">Select Work Assignment</option>
                  {WORK_ASSIGNMENT_OPTIONS.map((assignment) => (
                    <option key={assignment} value={assignment}>
                      {assignment}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capability Enabled Section */}
              <div>
                <label 
                  className="text-foreground mb-2 block" 
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Capability Enabled <span className="text-muted-foreground">(Optional)</span>
                </label>
                <textarea
                  value={newResource.capabilityEnabled}
                  onChange={(e) => setNewResource({ ...newResource, capabilityEnabled: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-border text-foreground resize-none"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                  placeholder="Enter capability details..."
                  rows={4}
                />
              </div>

              {/* Resource Requested Header */}
              <div className="border-b border-border pb-3 pt-2 flex items-center justify-between">
                <h3 
                  className="text-foreground" 
                  style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  Resource Requested ({newResource.resourceItems.length})
                </h3>
                {newResource.resourceItems.length < 6 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddResourceItem}
                    className="border-border text-foreground hover:bg-muted/10 h-8 px-3"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  >
                    + Add Resource
                  </Button>
                )}
              </div>

              {newResource.resourceItems.map((item, index) => {
                const isExpanded = expandedResourceItems.has(item.id);
                return (
                <div key={item.id}>
                  {index > 0 && <div className="h-2" />}
                  
                  {/* Bordered container for each resource */}
                  <div className="border border-border bg-card p-4" style={{ borderRadius: 'var(--radius)' }}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleResourceItemExpanded(item.id)}
                      className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
                      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {item.name || `Resource ${index + 1}`}{item.kind && ` - ${item.kind}`}
                    </button>
                    {newResource.resourceItems.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveResourceItem(item.id)}
                        className="text-foreground hover:bg-muted/10 h-8 w-8 p-0"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </div>

                  {isExpanded && (
                  <div className="space-y-4 pl-6 mt-6">

                  {/* Resource Name */}
                  <div>
                    <label 
                      className="text-foreground mb-2 block" 
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Resource Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter resource name"
                      value={item.name}
                      onChange={(e) => handleUpdateResourceItem(item.id, 'name', e.target.value)}
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    />
                  </div>

                  {/* First Row: Kind, Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Kind
                      </label>
                      {isAddingCustomKind[item.id] ? (
                        <div className="flex gap-1">
                          <Input
                            type="text"
                            placeholder="Enter custom kind"
                            value={customKindValue[item.id] || ''}
                            onChange={(e) => setCustomKindValue({ ...customKindValue, [item.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customKindValue[item.id]?.trim()) {
                                const newKind = customKindValue[item.id].trim();
                                if (!kindOptions.includes(newKind)) {
                                  setKindOptions([...kindOptions, newKind]);
                                }
                                handleUpdateResourceItem(item.id, 'kind', newKind);
                                setIsAddingCustomKind({ ...isAddingCustomKind, [item.id]: false });
                                setCustomKindValue({ ...customKindValue, [item.id]: '' });
                              } else if (e.key === 'Escape') {
                                setIsAddingCustomKind({ ...isAddingCustomKind, [item.id]: false });
                                setCustomKindValue({ ...customKindValue, [item.id]: '' });
                              }
                            }}
                            className="bg-input-background border-border text-foreground flex-1"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (customKindValue[item.id]?.trim()) {
                                const newKind = customKindValue[item.id].trim();
                                if (!kindOptions.includes(newKind)) {
                                  setKindOptions([...kindOptions, newKind]);
                                }
                                handleUpdateResourceItem(item.id, 'kind', newKind);
                                setIsAddingCustomKind({ ...isAddingCustomKind, [item.id]: false });
                                setCustomKindValue({ ...customKindValue, [item.id]: '' });
                              }
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingCustomKind({ ...isAddingCustomKind, [item.id]: false });
                              setCustomKindValue({ ...customKindValue, [item.id]: '' });
                            }}
                            className="bg-card border-border text-foreground hover:bg-muted/10 h-10 px-2"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <select
                          value={item.kind}
                          onChange={(e) => {
                            if (e.target.value === '__add_custom__') {
                              setIsAddingCustomKind({ ...isAddingCustomKind, [item.id]: true });
                            } else {
                              handleUpdateResourceItem(item.id, 'kind', e.target.value);
                            }
                          }}
                          className="w-full h-10 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        >
                          <option value="">Select kind</option>
                          {kindOptions.map((kind) => (
                            <option key={kind} value={kind}>
                              {kind}
                            </option>
                          ))}
                          <option value="__add_custom__" className="text-primary">+ Add Custom</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Type
                      </label>
                      {isAddingCustomType[item.id] ? (
                        <div className="flex gap-1">
                          <Input
                            type="text"
                            placeholder="Enter custom type"
                            value={customTypeValue[item.id] || ''}
                            onChange={(e) => setCustomTypeValue({ ...customTypeValue, [item.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customTypeValue[item.id]?.trim()) {
                                const newType = customTypeValue[item.id].trim();
                                if (!typeOptions.includes(newType)) {
                                  setTypeOptions([...typeOptions, newType]);
                                }
                                handleUpdateResourceItem(item.id, 'type', newType);
                                setIsAddingCustomType({ ...isAddingCustomType, [item.id]: false });
                                setCustomTypeValue({ ...customTypeValue, [item.id]: '' });
                              } else if (e.key === 'Escape') {
                                setIsAddingCustomType({ ...isAddingCustomType, [item.id]: false });
                                setCustomTypeValue({ ...customTypeValue, [item.id]: '' });
                              }
                            }}
                            className="bg-input-background border-border text-foreground flex-1"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              if (customTypeValue[item.id]?.trim()) {
                                const newType = customTypeValue[item.id].trim();
                                if (!typeOptions.includes(newType)) {
                                  setTypeOptions([...typeOptions, newType]);
                                }
                                handleUpdateResourceItem(item.id, 'type', newType);
                                setIsAddingCustomType({ ...isAddingCustomType, [item.id]: false });
                                setCustomTypeValue({ ...customTypeValue, [item.id]: '' });
                              }
                            }}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-2"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddingCustomType({ ...isAddingCustomType, [item.id]: false });
                              setCustomTypeValue({ ...customTypeValue, [item.id]: '' });
                            }}
                            className="bg-card border-border text-foreground hover:bg-muted/10 h-10 px-2"
                            style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <select
                          value={item.type}
                          onChange={(e) => {
                            if (e.target.value === '__add_custom__') {
                              setIsAddingCustomType({ ...isAddingCustomType, [item.id]: true });
                            } else {
                              handleUpdateResourceItem(item.id, 'type', e.target.value);
                            }
                          }}
                          className="w-full h-10 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        >
                          <option value="">Select type</option>
                          {typeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                          <option value="__add_custom__" className="text-primary">+ Add Custom</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Second Row: Unit, Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Unit
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter unit"
                        value={item.unit}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'unit', e.target.value)}
                        className="bg-input-background border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      />
                    </div>
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Priority
                      </label>
                      <select
                        value={item.priority}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'priority', e.target.value)}
                        className="w-full bg-input-background border border-border text-foreground px-3 py-2"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      >
                        <option value="">Select priority</option>
                        <option value="Routine">Routine</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Third Row: Description */}
                  <div>
                    <label 
                      className="text-foreground mb-2 block" 
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Description
                    </label>
                    <textarea
                      placeholder="Enter description"
                      value={item.description}
                      onChange={(e) => handleUpdateResourceItem(item.id, 'description', e.target.value)}
                      className="w-full min-h-[80px] px-3 py-2 bg-input-background border border-border text-foreground resize-y"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    />
                  </div>

                  {/* Fourth Row: Suggested Sources of Supply */}
                  <div>
                    <label 
                      className="text-foreground mb-2 block" 
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Suggested Sources of Supply
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter suggested sources"
                      value={item.suggestedSourcesOfSupply}
                      onChange={(e) => handleUpdateResourceItem(item.id, 'suggestedSourcesOfSupply', e.target.value)}
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    />
                  </div>

                  {/* Fourth Row: Acceptable Substitutes */}
                  <div>
                    <label 
                      className="text-foreground mb-2 block" 
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Acceptable Substitutes
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter acceptable substitutes"
                      value={item.acceptableSubstitutes}
                      onChange={(e) => handleUpdateResourceItem(item.id, 'acceptableSubstitutes', e.target.value)}
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    />
                  </div>

                  {/* Fifth Row: Order # (LSC) and ETA (LSC) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Order # (LSC)
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter order number"
                        value={item.orderNumberLSC || ''}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'orderNumberLSC', e.target.value)}
                        className="bg-input-background border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      />
                    </div>
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        ETA (LSC)
                      </label>
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                        <Input
                          type="date"
                          placeholder="mm/dd/yyyy"
                          value={item.etaLSC?.split('T')[0] || ''}
                          onChange={(e) => {
                            const timeValue = item.etaLSC?.split('T')[1] || '00:00';
                            handleUpdateResourceItem(item.id, 'etaLSC', e.target.value ? `${e.target.value}T${timeValue}` : '');
                          }}
                          className="bg-input-background border-border text-foreground placeholder:text-muted-foreground [&::-webkit-calendar-picker-indicator]:invert"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                        <Input
                          type="time"
                          placeholder="--:-- --"
                          value={item.etaLSC?.split('T')[1] || ''}
                          onChange={(e) => {
                            const dateValue = item.etaLSC?.split('T')[0] || new Date().toISOString().split('T')[0];
                            handleUpdateResourceItem(item.id, 'etaLSC', `${dateValue}T${e.target.value}`);
                          }}
                          className="bg-input-background border-border text-foreground placeholder:text-muted-foreground [&::-webkit-calendar-picker-indicator]:invert"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                        <select
                          value={item.etaLSCTimezone || 'UTC'}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'etaLSCTimezone', e.target.value)}
                          className="h-10 px-3 bg-input-background border border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">EST</option>
                          <option value="CST">CST</option>
                          <option value="MST">MST</option>
                          <option value="PST">PST</option>
                          <option value="AKST">AKST</option>
                          <option value="HST">HST</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sixth Row: Cost Per Unit, Quantity, Total Cost */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Cost Per Unit
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter cost per unit"
                        value={item.cost}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'cost', e.target.value)}
                        className="bg-input-background border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      />
                    </div>
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Quantity
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'quantity', Number(e.target.value))}
                        className="bg-input-background border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      />
                    </div>
                    <div>
                      <label 
                        className="text-foreground mb-2 block" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Total Cost
                      </label>
                      <div 
                        className="h-10 px-3 flex items-center bg-muted/10 border border-border text-card-foreground" 
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      >
                        {item.cost && item.quantity 
                          ? `$${(parseFloat(item.cost.replace(/[^0-9.]/g, '')) * item.quantity).toFixed(2)}`
                          : '-'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Seventh Row: Reporting Site */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label 
                        className="text-foreground" 
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Reporting Site
                      </label>
                      <div className="flex items-center gap-2">
                        <label 
                          htmlFor="custom-location-toggle"
                          className="text-foreground cursor-pointer"
                          style={{ fontSize: 'var(--text-sm)' }}
                        >
                          Use custom location
                        </label>
                        <Switch
                          id="custom-location-toggle"
                          checked={isCustomReportingSite}
                          onCheckedChange={(checked) => {
                            setIsCustomReportingSite(checked);
                            if (!checked) {
                              handleUpdateResourceItem(item.id, 'reportingSite', '');
                            }
                          }}
                        />
                      </div>
                    </div>
                    {!isCustomReportingSite ? (
                      <select
                        value={item.reportingSite}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'reportingSite', e.target.value)}
                        className="w-full h-10 px-3 bg-input-background border border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      >
                        <option value="">Select reporting site</option>
                        {REPORTING_SITE_OPTIONS.map((site) => (
                          <option key={site} value={site}>
                            {site}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Enter location title"
                          value={item.reportingSite}
                          onChange={(e) => handleUpdateResourceItem(item.id, 'reportingSite', e.target.value)}
                          className="bg-input-background border-border text-foreground"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground hover:bg-muted/10 w-full"
                          style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        >
                          Edit Geolocation
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Eighth Row: Reporting Date/Time */}
                  <div>
                    <label 
                      className="text-foreground mb-2 block" 
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Reporting Date/Time
                    </label>
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        type="date"
                        value={item.reportingDateTime?.split('T')[0] || ''}
                        onChange={(e) => {
                          const timeValue = item.reportingDateTime?.split('T')[1] || '00:00';
                          handleUpdateResourceItem(item.id, 'reportingDateTime', e.target.value ? `${e.target.value}T${timeValue}` : '');
                        }}
                        className="bg-input-background border-border text-foreground [&::-webkit-calendar-picker-indicator]:invert"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      />
                      <Input
                        type="time"
                        value={item.reportingDateTime?.split('T')[1] || ''}
                        onChange={(e) => {
                          const dateValue = item.reportingDateTime?.split('T')[0] || new Date().toISOString().split('T')[0];
                          handleUpdateResourceItem(item.id, 'reportingDateTime', `${dateValue}T${e.target.value}`);
                        }}
                        className="bg-input-background border-border text-foreground [&::-webkit-calendar-picker-indicator]:invert"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      />
                      <select
                        value={item.reportingDateTimeTimezone}
                        onChange={(e) => handleUpdateResourceItem(item.id, 'reportingDateTimeTimezone', e.target.value)}
                        className="h-10 px-3 bg-input-background border border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">EST</option>
                        <option value="CST">CST</option>
                        <option value="MST">MST</option>
                        <option value="PST">PST</option>
                        <option value="AKST">AKST</option>
                        <option value="HST">HST</option>
                      </select>
                    </div>
                  </div>
                  </div>
                  )}
                  </div>
                </div>
                );
              })}
            </div>
          </ScrollArea>

          <SheetFooter className="border-t border-border pt-4 flex flex-row gap-2">
            <Button
              onClick={handleSaveNewResource}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex-1"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelNewResource}
              className="border-border text-foreground hover:bg-muted/10 h-10 flex-1"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
            >
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Check-In Drawer */}
      <Sheet open={isCheckInDrawerOpen} onOpenChange={setIsCheckInDrawerOpen}>
        <SheetContent 
          side="right" 
          className="bg-card border-border w-full sm:max-w-2xl overflow-y-auto"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle 
              className="text-card-foreground"
              style={{ fontSize: 'var(--text-xl)' }}
            >
              ICS 211 Check-In Form
            </SheetTitle>
            <SheetDescription 
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Complete the check-in information for this resource.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Checked In By Information */}
            <div className="bg-muted/30 p-4 space-y-4" style={{ borderRadius: 'var(--radius)' }}>
              <div 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Check-In Performed By
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    Name
                  </label>
                  <Input
                    type="text"
                    value={checkInFormData.checkedInByName}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, checkedInByName: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    Position
                  </label>
                  <Input
                    type="text"
                    value={checkInFormData.checkedInByPosition}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, checkedInByPosition: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    placeholder="Enter your position"
                  />
                </div>
              </div>
            </div>

            {/* Jurisdiction and Agency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Jurisdiction
                </label>
                <div className="relative">
                  <select
                    value={checkInFormData.jurisdiction}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, jurisdiction: e.target.value })}
                    className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                    style={{ 
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="local">Local</option>
                    <option value="county">County</option>
                    <option value="parish">Parish</option>
                    <option value="state">State</option>
                    <option value="federal">Federal</option>
                    <option value="tribal">Tribal</option>
                    <option value="private">Private</option>
                    <option value="other">Other/Custom</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Agency
                </label>
                <Input
                  type="text"
                  value={checkInFormData.agency}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, agency: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                />
              </div>
            </div>

            {/* Category (CAT) */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Category (CAT)
              </label>
              <Input
                type="text"
                value={checkInFormData.category}
                onChange={(e) => setCheckInFormData({ ...checkInFormData, category: e.target.value })}
                className="bg-input-background border-border text-foreground"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
              />
            </div>

            {/* Resource Kind and Resource Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Resource Kind
                </label>
                <div className="relative">
                  <select
                    value={checkInFormData.resourceKind}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, resourceKind: e.target.value })}
                    className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                    style={{ 
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Personnel">Personnel</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Teams">Teams</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Epidemiological Supplies">Epidemiological Supplies</option>
                    <option value="Epidemiologists">Epidemiologists</option>
                    <option value="Epidemiological Equipment">Epidemiological Equipment</option>
                    <option value="Epidemiological Response Teams">Epidemiological Response Teams</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Resource Type
                </label>
                <div className="relative">
                  <select
                    value={checkInFormData.resourceType}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, resourceType: e.target.value })}
                    className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                    style={{ 
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    <option value="">Select...</option>
                    <option value="Type 1">Type 1</option>
                    <option value="Type 2">Type 2</option>
                    <option value="Type 3">Type 3</option>
                    <option value="Type 4">Type 4</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ST/TF */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                ST/TF
              </label>
              <div className="relative">
                <select
                  value={checkInFormData.stTf}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, stTf: e.target.value })}
                  className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                  style={{ 
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  <option value="">Select...</option>
                  <option value="Strike Team">Strike Team</option>
                  <option value="Task Force">Task Force</option>
                  <option value="Single Resource">Single Resource</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Resource Name/Identifier */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Resource Name/Identifier
              </label>
              <Input
                type="text"
                value={checkInFormData.resourceNameIdentifier}
                onChange={(e) => setCheckInFormData({ ...checkInFormData, resourceNameIdentifier: e.target.value })}
                className="bg-input-background border-border text-foreground"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
              />
            </div>

            {/* Order Request Number and Leader Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Order Request Number
                </label>
                <Input
                  type="text"
                  value={checkInFormData.orderRequestNumber}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, orderRequestNumber: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                />
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Leader Name
                </label>
                <Input
                  type="text"
                  value={checkInFormData.leaderName}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, leaderName: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                />
              </div>
            </div>

            {/* Number of Personnel and Incident Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Number of Personnel
                </label>
                <div className="relative">
                  <select
                    value={checkInFormData.numberOfPersonnel}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      setCheckInFormData({ ...checkInFormData, numberOfPersonnel: e.target.value });
                      // Update personnel details array
                      const newDetails = Array.from({ length: count }, (_, i) => 
                        personnelDetails[i] || { name: '', contact: '' }
                      );
                      setPersonnelDetails(newDetails);
                    }}
                    className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                    style={{ 
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Incident Contact Info
                </label>
                <Input
                  type="text"
                  value={checkInFormData.incidentContactInfo}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, incidentContactInfo: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                />
              </div>
            </div>

            {/* Personnel Details - shown when numberOfPersonnel > 0 */}
            {parseInt(checkInFormData.numberOfPersonnel) > 0 && (
              <div className="space-y-4">
                <div 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Personnel Details
                </div>
                {personnelDetails.map((person, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-4 bg-background border border-border" style={{ borderRadius: 'var(--radius)' }}>
                    <div className="space-y-2">
                      <label 
                        className="text-muted-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Personnel {index + 1} - Name
                      </label>
                      <Input
                        type="text"
                        value={person.name}
                        onChange={(e) => {
                          const updated = [...personnelDetails];
                          updated[index] = { ...updated[index], name: e.target.value };
                          setPersonnelDetails(updated);
                        }}
                        className="bg-input-background border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label 
                        className="text-muted-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Contact Information
                      </label>
                      <Input
                        type="text"
                        value={person.contact}
                        onChange={(e) => {
                          const updated = [...personnelDetails];
                          updated[index] = { ...updated[index], contact: e.target.value };
                          setPersonnelDetails(updated);
                        }}
                        className="bg-input-background border-border text-foreground"
                        style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                        placeholder="Phone or email"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Home Unit/Agency */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Home Unit/Agency
              </label>
              <Input
                type="text"
                value={checkInFormData.homeUnitAgency}
                onChange={(e) => setCheckInFormData({ ...checkInFormData, homeUnitAgency: e.target.value })}
                className="bg-input-background border-border text-foreground"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
              />
            </div>

            {/* Use Custom Departure Location Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={checkInFormData.useCustomDeparture}
                onClick={() => setCheckInFormData({ ...checkInFormData, useCustomDeparture: !checkInFormData.useCustomDeparture })}
                className={`relative inline-flex h-6 w-11 items-center transition-colors ${
                  checkInFormData.useCustomDeparture ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                    checkInFormData.useCustomDeparture ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  style={{ borderRadius: 'var(--radius)' }}
                />
              </button>
              <label 
                className="text-foreground cursor-pointer"
                style={{ fontSize: 'var(--text-base)' }}
                onClick={() => setCheckInFormData({ ...checkInFormData, useCustomDeparture: !checkInFormData.useCustomDeparture })}
              >
                Use Custom Departure Location
              </label>
            </div>

            {/* Departure Site */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Departure Site
              </label>
              <div className="relative">
                <select
                  value={checkInFormData.departureSite}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, departureSite: e.target.value })}
                  className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                  style={{ 
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  <option value="">Select...</option>
                  <option value="Home Base">Home Base</option>
                  <option value="Field Location">Field Location</option>
                  <option value="Other Site">Other Site</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Departure Date/Time and Method of Travel */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Departure Date/Time
                </label>
                <Input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={checkInFormData.departureDate}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, departureDate: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                />
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Time:
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={checkInFormData.departureTime}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, departureTime: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Method of Travel
                </label>
                <Input
                  type="text"
                  value={checkInFormData.methodOfTravel}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, methodOfTravel: e.target.value })}
                  className="bg-input-background border-border text-foreground"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                />
              </div>
            </div>

            {/* Use Custom Incident Assignment Location Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={checkInFormData.useCustomIncidentAssignment}
                onClick={() => setCheckInFormData({ ...checkInFormData, useCustomIncidentAssignment: !checkInFormData.useCustomIncidentAssignment })}
                className={`relative inline-flex h-6 w-11 items-center transition-colors ${
                  checkInFormData.useCustomIncidentAssignment ? 'bg-primary' : 'bg-muted'
                }`}
                style={{ borderRadius: 'var(--radius)' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                    checkInFormData.useCustomIncidentAssignment ? 'translate-x-6' : 'translate-x-1'
                  }`}
                  style={{ borderRadius: 'var(--radius)' }}
                />
              </button>
              <label 
                className="text-foreground cursor-pointer"
                style={{ fontSize: 'var(--text-base)' }}
                onClick={() => setCheckInFormData({ ...checkInFormData, useCustomIncidentAssignment: !checkInFormData.useCustomIncidentAssignment })}
              >
                Use Custom Incident Assignment Location
              </label>
            </div>

            {/* Incident Assignment Location */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Incident Assignment Location
              </label>
              <div className="relative">
                <select
                  value={checkInFormData.incidentAssignmentLocation}
                  onChange={(e) => setCheckInFormData({ ...checkInFormData, incidentAssignmentLocation: e.target.value })}
                  className="w-full bg-input-background border border-border text-foreground p-3 pr-10 appearance-none"
                  style={{ 
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  <option value="">Select...</option>
                  <option value="Incident Command Post">Incident Command Post</option>
                  <option value="Base Camp">Base Camp</option>
                  <option value="Staging Area">Staging Area</option>
                  <option value="Other Location">Other Location</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Other Qualifications */}
            <div className="space-y-2">
              <label 
                className="text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Other Qualifications
              </label>
              <textarea
                value={checkInFormData.otherQualifications}
                onChange={(e) => setCheckInFormData({ ...checkInFormData, otherQualifications: e.target.value })}
                className="w-full bg-input-background border border-border text-foreground p-3 min-h-[120px] resize-y"
                style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
              />
            </div>

            {/* Data Transmission Section */}
            <div className="pt-4 border-t border-border">
              <h4 
                className="text-foreground mb-4"
                style={{ fontSize: 'var(--text-base)' }}
              >
                Data Transmission
              </h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    Data Sent to RESL
                  </label>
                  <Input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={checkInFormData.dataSentToRESL}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, dataSentToRESL: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    Time:
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={checkInFormData.dataSentTime}
                      onChange={(e) => setCheckInFormData({ ...checkInFormData, dataSentTime: e.target.value })}
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    Sent by (Initials)
                  </label>
                  <Input
                    type="text"
                    value={checkInFormData.sentByInitials}
                    onChange={(e) => setCheckInFormData({ ...checkInFormData, sentByInitials: e.target.value })}
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-border pt-4 flex gap-2">
            <Button
              onClick={() => {
                if (checkInResourceId) {
                  setResources(resources.map(r => 
                    r.id === checkInResourceId ? { ...r, checkInStatus: 'checked-in' as const } : r
                  ));
                }
                setIsCheckInDrawerOpen(false);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex-1"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
            >
              Check-In
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsCheckInDrawerOpen(false)}
              className="border-border text-foreground hover:bg-muted/10 h-10 flex-1"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-base)' }}
            >
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Approval Modal */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent 
          className="bg-card border-border max-w-2xl max-h-[90vh] flex flex-col"
          style={{
            borderRadius: 'var(--radius)',
          }}
        >
          <DialogHeader className="border-b border-border pb-4 flex-shrink-0">
            <DialogTitle 
              className="text-foreground flex items-center gap-2"
              style={{ fontSize: 'var(--text-xl)' }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {selectedApprovalRequest?.stepLabel || 'Section Chief'} Approval
            </DialogTitle>
            <DialogDescription 
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Review and approve the resource request for {selectedApprovalRequest?.requestName || 'this resource'}.
            </DialogDescription>
            
            {/* Toggle for ICS-213RR Preview */}
            <div className="flex items-center gap-3 pt-4">
              <Label 
                htmlFor="ics-preview-toggle"
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                ICS-213RR Preview
              </Label>
              <Switch
                id="ics-preview-toggle"
                checked={showIcsPreview}
                onCheckedChange={setShowIcsPreview}
              />
            </div>
          </DialogHeader>

          {/* Note about approving all resources */}
          {selectedApprovalRequest && (() => {
            const currentResource = resources.find(r => r.id === selectedApprovalRequest.resourceId);
            if (currentResource && currentResource.resourceRequests && currentResource.resourceRequests.length > 0) {
              return (
                <div className="px-6 pt-4 pb-2">
                  <div 
                    className="bg-muted/30 border border-border p-4 space-y-3"
                    style={{ borderRadius: 'var(--radius)' }}
                  >
                    <div 
                      className="text-foreground"
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      You are approving all resources in this request:
                    </div>
                    <ul className="space-y-2">
                      {currentResource.resourceRequests.map((req, index) => (
                        <li 
                          key={req.id}
                          className="text-foreground flex items-start gap-2"
                          style={{ fontSize: 'var(--text-sm)' }}
                        >
                          <span className="text-muted-foreground">•</span>
                          <span>
                            Resource {index + 1}: {req.kind || 'Not specified'} - {req.type || 'Not specified'}
                            {req.unit && ` (${req.unit})`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <ScrollArea className="flex-1 overflow-y-auto">
            {showIcsPreview ? (
              // ICS-213RR Preview Placeholder
              <div className="space-y-6 py-6 pr-4">
                <div 
                  className="bg-muted/30 border border-border p-8 text-center"
                  style={{ borderRadius: 'var(--radius)' }}
                >
                  <div className="space-y-4">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <div 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
                      >
                        ICS-213RR Form Preview
                      </div>
                      <div 
                        className="text-muted-foreground mt-2"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        In production, a fully rendered ICS-213RR PDF form will be displayed here.
                      </div>
                    </div>
                    <div 
                      className="bg-card border border-border p-6 text-left space-y-3"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <div 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        The ICS-213RR form will include:
                      </div>
                      <ul className="space-y-2 text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Resource Request details (Kind, Type, Quantity)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Reporting Location and DateTime</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Requestor and Recipient information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Approval signatures and timestamps</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Logistics and Finance details</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>All approval workflow steps and status</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Approval Form Content
            <div className="space-y-6 py-6 pr-4">
            {/* Name and Position Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Name
                </label>
                {isViewMode ? (
                  <div 
                    className="text-foreground bg-card border border-border px-3 py-2"
                    style={{ 
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    {approverName || '-'}
                  </div>
                ) : (
                  <Input
                    value={approverName}
                    onChange={(e) => setApproverName(e.target.value)}
                    className="bg-input-background border-border text-foreground h-10"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                    placeholder="Enter name..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Position
                </label>
                {isViewMode ? (
                  <div 
                    className="text-foreground bg-card border border-border px-3 py-2"
                    style={{ 
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    {approverPosition || '-'}
                  </div>
                ) : (
                  <select
                    value={approverPosition}
                    onChange={(e) => setApproverPosition(e.target.value)}
                    className="w-full h-10 px-3 bg-input-background border border-border text-foreground"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  >
                    <option value="">Select position...</option>
                    {USCG_POSITIONS.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Approval Date/Time - Only show in view mode */}
            {isViewMode && selectedApprovalRequest?.approvalTimestamp && (
              <div className="space-y-2">
                <label 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Approval Date/Time
                </label>
                <div 
                  className="text-foreground bg-card border border-border px-3 py-2"
                  style={{ 
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  {new Date(selectedApprovalRequest.approvalTimestamp).toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                    timeZoneName: 'short'
                  })}
                </div>
              </div>
            )}

            {/* Section Chief Specific Fields */}
            {selectedApprovalRequest?.currentStep === 'sectionChief' && (
              <>
                {/* Comments Textarea */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Comments
                  </label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    disabled={isViewMode}
                    className="w-full bg-input-background border border-border text-foreground px-3 py-2 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                    placeholder={isViewMode ? "" : "Enter comments..."}
                  />
                </div>
              </>
            )}

            {/* RESL Review Specific Fields */}
            {selectedApprovalRequest?.currentStep === 'reslReview' && (
              <>
                {/* Checkbox for Tactical Resources or Personnel */}
                <div className="space-y-3">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Check Box (a) if request is for tactical resources or personnel
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="tactical"
                        checked={reslTactical}
                        onCheckedChange={(checked) => setReslTactical(checked === true)}
                        disabled={isViewMode}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="tactical"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        Tactical
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="personnel"
                        checked={reslPersonnel}
                        onCheckedChange={(checked) => setReslPersonnel(checked === true)}
                        disabled={isViewMode}
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="personnel"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        Personnel
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Resource Status */}
                <div className="space-y-3">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Resource Status
                  </label>
                  <RadioGroup
                    value={reslResourceStatus}
                    onValueChange={(value) => setReslResourceStatus(value as 'available' | 'not-available')}
                    disabled={isViewMode}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="available"
                        id="available"
                        disabled={isViewMode}
                        className="border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="available"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        b. Available
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="not-available"
                        id="not-available"
                        disabled={isViewMode}
                        className="border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="not-available"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        c. Not available
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Comments Textarea */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Comments
                  </label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    disabled={isViewMode}
                    className="w-full bg-input-background border border-border text-foreground px-3 py-2 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                    placeholder={isViewMode ? "" : "Enter comments..."}
                  />
                </div>
              </>
            )}
            
            {/* Logistics Specific Fields */}
            {selectedApprovalRequest?.currentStep === 'logistics' && (
              <>
                {/* Requisition/Purchase Order # */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Requisition/Purchase Order #
                  </label>
                  <Input
                    value={logisticsOrderNumber}
                    onChange={(e) => setLogisticsOrderNumber(e.target.value)}
                    disabled={isViewMode}
                    className="bg-input-background border-border text-foreground h-10 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  />
                </div>

                {/* Supplier Name */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Supplier Name
                  </label>
                  <Input
                    value={logisticsSupplierName}
                    onChange={(e) => setLogisticsSupplierName(e.target.value)}
                    disabled={isViewMode}
                    className="bg-input-background border-border text-foreground h-10 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                  />
                </div>

                {/* Phone and Email Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label 
                      className="text-foreground"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Supplier Phone
                    </label>
                    <Input
                      type="tel"
                      value={logisticsPhone}
                      onChange={(e) => setLogisticsPhone(e.target.value)}
                      disabled={isViewMode}
                      className="bg-input-background border-border text-foreground h-10 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)'
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label 
                      className="text-foreground"
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      Supplier Email
                    </label>
                    <Input
                      type="email"
                      value={logisticsEmail}
                      onChange={(e) => setLogisticsEmail(e.target.value)}
                      disabled={isViewMode}
                      className="bg-input-background border-border text-foreground h-10 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        borderRadius: 'var(--radius)',
                        fontSize: 'var(--text-base)'
                      }}
                    />
                  </div>
                </div>

                {/* Order Placed By Radio Buttons */}
                <div className="space-y-3">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Order Placed By
                  </label>
                  <RadioGroup
                    value={logisticsOrderPlacedBy}
                    onValueChange={(value) => setLogisticsOrderPlacedBy(value as 'SPUL' | 'PROC' | 'Other')}
                    disabled={isViewMode}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="SPUL"
                        id="SPUL"
                        disabled={isViewMode}
                        className="border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="SPUL"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        SPUL
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="PROC"
                        id="PROC"
                        disabled={isViewMode}
                        className="border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="PROC"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        PROC
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem
                        value="Other"
                        id="Other"
                        disabled={isViewMode}
                        className="border-border text-primary disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                      <Label
                        htmlFor="Other"
                        className="text-foreground cursor-pointer"
                        style={{ fontSize: 'var(--text-base)' }}
                      >
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* "Other" Input Field */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Specify Other
                  </label>
                  <Input
                    value={logisticsOrderPlacedByOther}
                    onChange={(e) => setLogisticsOrderPlacedByOther(e.target.value)}
                    disabled={isViewMode}
                    className="bg-input-background border-border text-foreground h-10 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                    placeholder={isViewMode ? "" : "Enter other order placer..."}
                  />
                </div>

                {/* Comments Textarea */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Comments
                  </label>
                  <textarea
                    value={logisticsNotes}
                    onChange={(e) => setLogisticsNotes(e.target.value)}
                    disabled={isViewMode}
                    className="w-full bg-input-background border border-border text-foreground px-3 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                    placeholder={isViewMode ? "" : "Enter comments..."}
                  />
                </div>
              </>
            )}

            {/* Finance Specific Fields */}
            {selectedApprovalRequest?.currentStep === 'finance' && (
              <>
                {/* Comments Textarea */}
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Comments
                  </label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    disabled={isViewMode}
                    className="w-full bg-input-background border border-border text-foreground px-3 py-2 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      borderRadius: 'var(--radius)',
                      fontSize: 'var(--text-base)'
                    }}
                    placeholder={isViewMode ? "" : "Enter comments..."}
                  />
                </div>
              </>
            )}

            {/* Approve and Deny Buttons */}
            {!isViewMode && (
            <div className="flex justify-start gap-2">
              <Button
                onClick={() => {
                  if (selectedApprovalRequest) {
                    handleRequestStatusChange(
                      selectedApprovalRequest.resourceId,
                      selectedApprovalRequest.requestId,
                      'approved'
                    );
                    setApprovalModalOpen(false);
                    setApprovalComments('');
                    setShowIcsPreview(false);
                    // Reset RESL Review fields
                    setReslTactical(false);
                    setReslPersonnel(false);
                    setReslResourceStatus('available');
                    // Reset Logistics fields
                    setLogisticsOrderNumber('');
                    setLogisticsEtaDate('');
                    setLogisticsEtaTime('');
                    setLogisticsCost('');
                    setLogisticsSupplierName('');
                    setLogisticsPhone('');
                    setLogisticsEmail('');
                    setLogisticsUseCustomSource(false);
                    setLogisticsSourceLocation('');
                    setLogisticsOrderPlacedBy('SPUL');
                    setLogisticsNotes('');
                  }
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                style={{ 
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  padding: '8px 24px'
                }}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedApprovalRequest) {
                    handleRequestStatusChange(
                      selectedApprovalRequest.resourceId,
                      selectedApprovalRequest.requestId,
                      'rejected'
                    );
                    setApprovalModalOpen(false);
                    setApprovalComments('');
                    setShowIcsPreview(false);
                    // Reset RESL Review fields
                    setReslTactical(false);
                    setReslPersonnel(false);
                    setReslResourceStatus('available');
                    // Reset Logistics fields
                    setLogisticsOrderNumber('');
                    setLogisticsEtaDate('');
                    setLogisticsEtaTime('');
                    setLogisticsCost('');
                    setLogisticsSupplierName('');
                    setLogisticsPhone('');
                    setLogisticsEmail('');
                    setLogisticsUseCustomSource(false);
                    setLogisticsSourceLocation('');
                    setLogisticsOrderPlacedBy('SPUL');
                    setLogisticsNotes('');
                  }
                }}
                className="border-border text-destructive hover:bg-destructive/10"
                style={{ 
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--text-base)',
                  padding: '8px 24px'
                }}
              >
                Deny
              </Button>
            </div>
            )}
          </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Modal */}
      <Dialog open={submitConfirmationModalOpen} onOpenChange={setSubmitConfirmationModalOpen}>
        <DialogContent className="bg-card border-border max-w-3xl" style={{ borderRadius: 'var(--radius)' }}>
          <DialogHeader>
            <DialogTitle 
              className="text-foreground"
              style={{ fontSize: 'var(--text-lg)' }}
            >
              Confirm Resource Request Submission
            </DialogTitle>
            <div className="pt-3 pb-1 border-t border-border mt-3">
              <div className="flex items-center">
                <span 
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  Submitting to <span className="font-medium">Section Chief: CAPT Jose Ramos</span>
                  {editedResource.requestRecipient && (
                    <span className="text-foreground font-normal"> • {editedResource.requestRecipient}</span>
                  )}
                </span>
              </div>
            </div>
            
            {/* Toggle for ICS-213RR Preview */}
            <div className="flex items-center gap-3 pt-4">
              <Label 
                htmlFor="ics-preview-toggle-confirm"
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                ICS-213RR Preview
              </Label>
              <Switch
                id="ics-preview-toggle-confirm"
                checked={showIcsPreview}
                onCheckedChange={setShowIcsPreview}
              />
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(100vh-300px)]">
            <div className="space-y-4 pr-4">
              {editedResource.resourceItems.length > 0 && (
                <div className="space-y-3">
                  <div 
                    className="text-foreground font-medium"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Attached Resources ({editedResource.resourceItems.length})
                  </div>
                  
                  {editedResource.resourceItems.map((item, index) => (
                    <div 
                      key={item.id}
                      className="border border-border rounded p-4 space-y-3"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div 
                            className="text-foreground font-medium"
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Resource #{index + 1}
                          </div>
                          {item.kind && (
                            <div 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {item.kind}
                            </div>
                          )}
                        </div>
                        {item.priority && (
                          <div 
                            className="px-2 py-1 bg-primary/10 text-primary rounded"
                            style={{ fontSize: 'var(--text-xs)', borderRadius: 'var(--radius)' }}
                          >
                            {item.priority}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {item.type && (
                          <div className="space-y-1">
                            <div 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Type
                            </div>
                            <div 
                              className="text-foreground"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {item.type}
                            </div>
                          </div>
                        )}
                        
                        {item.unit && (
                          <div className="space-y-1">
                            <div 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Unit
                            </div>
                            <div 
                              className="text-foreground"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {item.unit}
                            </div>
                          </div>
                        )}
                        
                        {item.reportingSite && (
                          <div className="space-y-1">
                            <div 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Reporting Location
                            </div>
                            <div 
                              className="text-foreground"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {item.reportingSite}
                            </div>
                          </div>
                        )}
                        
                        {item.reportingDateTime && (
                          <div className="space-y-1">
                            <div 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Reporting Date/Time
                            </div>
                            <div 
                              className="text-foreground"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              {new Date(item.reportingDateTime).toLocaleString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })} {item.reportingDateTimeTimezone || 'UTC'}
                            </div>
                          </div>
                        )}
                        
                        {item.cost && (
                          <div className="space-y-1">
                            <div 
                              className="text-muted-foreground"
                              style={{ fontSize: 'var(--text-xs)' }}
                            >
                              Cost
                            </div>
                            <div 
                              className="text-foreground"
                              style={{ fontSize: 'var(--text-sm)' }}
                            >
                              ${item.cost}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {item.description && (
                        <div className="space-y-1 pt-2">
                          <div 
                            className="text-muted-foreground"
                            style={{ fontSize: 'var(--text-xs)' }}
                          >
                            Description
                          </div>
                          <div 
                            className="text-foreground"
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setSubmitConfirmationModalOpen(false)}
              className="border-border text-foreground hover:bg-muted/10"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSaveEdit();
                setSubmitConfirmationModalOpen(false);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            >
              Confirm & Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add New Resource Modal */}
      <Dialog open={addNewResourceModalOpen} onOpenChange={setAddNewResourceModalOpen}>
        <DialogContent className="bg-card border-border w-[3584px] max-w-[95vw]" style={{ borderRadius: 'var(--radius)' }}>
          <DialogHeader>
            <DialogTitle 
              className="text-foreground"
              style={{ fontSize: 'var(--text-lg)' }}
            >
              Add New Resource
            </DialogTitle>
            <DialogDescription 
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Enter the details for the new resource
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {/* Row 1: Name, Kind, Type */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Name
                  </label>
                  <Input
                    placeholder="Enter name"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Kind
                  </label>
                  <Input
                    placeholder="Enter kind"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Type
                  </label>
                  <Input
                    placeholder="Enter type"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Row 2: Quantity, Availability, Location */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Availability
                  </label>
                  <Select>
                    <SelectTrigger 
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                    >
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-card border-border"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <SelectItem 
                        value="Available" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Available
                      </SelectItem>
                      <SelectItem 
                        value="Limited" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Limited
                      </SelectItem>
                      <SelectItem 
                        value="Unavailable" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Unavailable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Location
                  </label>
                  <Input
                    placeholder="Enter location"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Row 3: Priority, Requested Reporting Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Priority
                  </label>
                  <Select>
                    <SelectTrigger 
                      className="bg-input-background border-border text-foreground"
                      style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent 
                      className="bg-card border-border"
                      style={{ borderRadius: 'var(--radius)' }}
                    >
                      <SelectItem 
                        value="Low" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Low
                      </SelectItem>
                      <SelectItem 
                        value="Medium" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Medium
                      </SelectItem>
                      <SelectItem 
                        value="High" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        High
                      </SelectItem>
                      <SelectItem 
                        value="Critical" 
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-sm)' }}
                      >
                        Critical
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Requested Reporting Location
                  </label>
                  <Input
                    placeholder="Enter location"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Row 4: Requested Reporting Datetime, Order # */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Requested Reporting Datetime
                  </label>
                  <Input
                    type="datetime-local"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Order #
                  </label>
                  <Input
                    placeholder="Enter order #"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Row 5: ETA, Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    ETA
                  </label>
                  <Input
                    type="datetime-local"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Cost
                  </label>
                  <Input
                    placeholder="Enter cost"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Row 6: Owning Organization */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label 
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    Owning Organization
                  </label>
                  <Input
                    placeholder="Enter owning organization"
                    className="bg-input-background border-border text-foreground"
                    style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setAddNewResourceModalOpen(false)}
                  className="border-border text-foreground hover:bg-muted/10"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
                >
                  Add Resource
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Document Preview Modal - ICS-213RR */}
      <Dialog open={documentPreviewModalOpen} onOpenChange={setDocumentPreviewModalOpen}>
        <DialogContent className="bg-card border-border max-w-4xl" style={{ borderRadius: 'var(--radius)' }}>
          <DialogHeader>
            <DialogTitle 
              className="text-foreground"
              style={{ fontSize: 'var(--text-lg)' }}
            >
              ICS-213RR Preview
            </DialogTitle>
            <DialogDescription 
              className="text-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Preview of the ICS-213RR General Message form
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div 
              className="text-center text-foreground py-12 border border-border bg-muted/5"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            >
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground mb-2" style={{ fontSize: 'var(--text-base)' }}>
                ICS-213RR Document Preview
              </p>
              <p className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                In production, this will display the ICS-213RR General Message form with all resource request details.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDocumentPreviewModalOpen(false)}
              className="border-border text-foreground hover:bg-muted/10"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            >
              Close
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            >
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Roster Position Modal */}
      <Dialog open={rosterPositionModalOpen} onOpenChange={setRosterPositionModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl" style={{ borderRadius: 'var(--radius)' }}>
          <DialogHeader>
            <DialogTitle 
              className="text-foreground"
              style={{ fontSize: 'var(--text-lg)' }}
            >
              Incident Roster Position Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <div 
                className="text-foreground mb-2" 
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Position
              </div>
              <div 
                className="text-card-foreground" 
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Placeholder for position
              </div>
            </div>
            <div>
              <div 
                className="text-foreground mb-2" 
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Assignees
              </div>
              <div 
                className="text-card-foreground" 
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Placeholder for assignees
              </div>
            </div>
            <div>
              <div 
                className="text-foreground mb-2" 
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Permissions
              </div>
              <div 
                className="text-card-foreground" 
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Placeholder for permissions
              </div>
            </div>
            <div>
              <div 
                className="text-foreground mb-2" 
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Parent Position(s)
              </div>
              <div 
                className="text-card-foreground" 
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Placeholder for parent position(s)
              </div>
            </div>
            <div>
              <div 
                className="text-foreground mb-2" 
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Child Position(s)
              </div>
              <div 
                className="text-card-foreground" 
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Placeholder for child position(s)
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setRosterPositionModalOpen(false)}
              className="border-border text-foreground hover:bg-muted/10"
              style={{ borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)' }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
