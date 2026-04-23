export type ChickStatus = "Available" | "Reserved" | "Sold" | "Holdback" | "Deceased";
export type BirdSex = "Male" | "Female" | "Unknown";
export type BirdStatus = "Active" | "Holdback" | "Retired" | "Sold";
export type ChickDeathReason =
  | "FailureToThrive"
  | "ShippedWeak"
  | "SplayLeg"
  | "Injury"
  | "Predator"
  | "UnabsorbedYolk"
  | "AssistedHatchComplications"
  | "Unknown"
  | "Other";
export type NoteEntityType =
  | "bird"
  | "flock"
  | "customer"
  | "pairing"
  | "hatchGroup"
  | "chick"
  | "order"
  | "reservation";
export type PhotoEntityType = "bird" | "chick" | "flock" | "hatchGroup";
export type DnaTestStatus = "Pending" | "Completed" | "Cancelled";
export type TaskStatus = "Open" | "InProgress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";
export type InventoryCategory = "Feed" | "Bedding" | "Medical" | "Other";
export type InventoryMovementType = "StockIn" | "Usage" | "Adjustment";
export type TaskRelatedEntityType =
  | "Bird"
  | "Chick"
  | "HatchGroup"
  | "Customer"
  | "Order"
  | "Reservation"
  | "Show"
  | "Other";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  isBetaUser?: boolean;
  isFounder?: boolean;
  isAdmin?: boolean;
  aiAccessEnabled?: boolean;
  subscriptionStatus?: string;
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  lastLoginAt?: string | null;
  accountDisabledAt?: string | null;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  status: string;
  createdAt: string;
}

export interface Flock {
  id: string;
  name: string;
  breed: string;
  variety: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export interface Bird {
  id: string;
  name: string;
  bandNumber: string;
  sex: BirdSex;
  breed: string;
  variety: string;
  color: string;
  genetics: string;
  flockId: string;
  status: BirdStatus;
  notes: string;
  photoUrl: string;
  visualTraits: string[];
  carriedTraits: string[];
  genotypeNotes: string;
  projectTags: string[];
  createdAt: string;
}

export interface Pairing {
  id: string;
  name: string;
  sireId: string;
  damId: string;
  goals: string;
  targetTraits: string[];
  avoidTraits: string[];
  projectGoal: string;
  notes: string;
  active: boolean;
  createdAt: string;
}

export interface HatchGroup {
  id: string;
  name: string;
  pairingId: string | null;
  breedDesignation: string;
  setDate: string;
  lockdownDate: string;
  hatchDate: string;
  eggsSet: number;
  eggsCleared: number;
  eggsQuitters: number;
  eggsHatched: number;
  producedTraitsSummary: string;
  notes: string;
  createdAt: string;
}

export interface Chick {
  id: string;
  bandNumber: string;
  hatchDate: string;
  flockId: string;
  hatchGroupId: string;
  status: ChickStatus;
  sex: BirdSex;
  color: string;
  observedTraits: string[];
  notes: string;
  photoUrl: string;
  dnaStatus?: "None" | DnaTestStatus;
  createdAt: string;
}

export interface DnaTestRequest {
  id: string;
  userId: string;
  chickId: string;
  bandNumber: string;
  testType: string;
  status: DnaTestStatus;
  externalOrderId?: string;
  resultSummary?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  requestedSex: string;
  requestedBreed: string;
  requestedVariety: string;
  requestedColor: string;
  quantity: number;
  status: "Waiting" | "Matched" | "Completed" | "Cancelled";
  notes: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  chickIds: string[];
  total: number;
  status: string;
  pickupDate: string;
  notes: string;
  createdAt: string;
}

export interface Trait {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Note {
  id: string;
  entityType: NoteEntityType;
  entityId: string;
  content: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  entityType: PhotoEntityType;
  entityId: string;
  url: string;
  caption: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  relatedEntityType: TaskRelatedEntityType;
  relatedEntityId: string;
  notes: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  currentQuantity: number;
  unit: string;
  lowStockThreshold: number | null;
  notes: string;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: InventoryCategory;
  type: InventoryMovementType;
  quantity: number;
  unit: string;
  occurredAt: string;
  notes: string;
  createdAt: string;
}

export interface Show {
  id: string;
  showName: string;
  location: string;
  date: string;
  notes: string;
  createdAt: string;
}

export interface ShowEntry {
  id: string;
  showId: string;
  birdId: string;
  entryClass: string;
  result: string;
  judgeNotes: string;
  placement: string;
  isWin: boolean;
  createdAt: string;
}
