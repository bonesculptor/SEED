/**
 * Geographical Context Protocol (GeoCP)
 */

export interface GeographicalContext {
  id: string;
  geocp_id: string;
  title: string;
  version: string;
  owner_name: string;
  location_data: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address?: Record<string, string>;
  };
  geographic_boundaries: Array<{
    boundary_id: string;
    name: string;
    type: string;
    coordinates: Array<{latitude: number; longitude: number}>;
  }>;
  service_areas: Array<{
    area_id: string;
    name: string;
    coverage_type: string;
  }>;
  created_at: string;
}
