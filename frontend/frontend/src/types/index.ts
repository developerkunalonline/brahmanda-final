// src/types/index.ts

// ENHANCEMENT: Centralized type definitions for API responses.

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Annotation {
  id: string;
  user_id: string;
  dataset_id: string;
  dataset_type: string;
  notes: string;
  tags: string[];
}

export interface KeplerPlanet {
  id: string; // This is the MongoDB _id
  kepid: number;
  koi_name: string;
  kepler_name: string;
  koi_disposition: string;
  koi_period: number;
}

export interface TessObject {
  id:string; // MongoDB _id
  tic_id: string;
  disposition: string;
  orbital_period: number;
  planet_radius: number;
}

// For useInfiniteQuery
export interface PaginatedKeplerResponse {
  data: KeplerPlanet[];
  nextCursor?: string;
}