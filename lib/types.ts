export type ChickStatus = "Available" | "Reserved" | "Sold" | "Holdback";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
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
  sex: string;
  breed: string;
  variety: string;
  color: string;
  genetics: string;
  flockId: string;
  status: string;
  notes: string;
  photoUrl: string;
  createdAt: string;
}

export interface Pairing {
  id: string;
  name: string;
  sireId: string;
  damId: string;
  goals: string;
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
  sex: string;
  color: string;
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
  entityType: string;
  entityId: string;
  content: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  entityType: string;
  entityId: string;
  url: string;
  caption: string;
  createdAt: string;
}
