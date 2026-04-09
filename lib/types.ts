export type ChickStatus = "Available" | "Reserved" | "Sold" | "Holdback";
export type BirdSex = "Male" | "Female" | "Unknown";
export type BirdStatus = "Active" | "Holdback" | "Retired" | "Sold";
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
  pairingId: string;
  setDate: string;
  hatchDate: string;
  eggsSet: number;
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
  createdAt: string;
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
