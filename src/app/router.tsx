import { Routes, Route } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomePage } from './HomePage';
import { SettingsPage } from './SettingsPage';
import { NotFoundPage } from './NotFoundPage';
import { TripsPage } from '../features/trips/TripsPage';
import { TripFormPage } from '../features/trips/TripFormPage';
import { TripDetailPage } from '../features/trips/TripDetailPage';
import { ChecklistPage } from '../features/trips/ChecklistPage';
import { SafetyPlanPage } from '../features/trips/SafetyPlanPage';
import { GuidancePage } from '../features/safety-rules/GuidancePage';
import { SharePage } from '../features/sharing/SharePage';
import { ReminderPage } from '../features/calendar/ReminderPage';
import { EmergencyPage } from '../features/emergency/EmergencyPage';
import { RoutePage } from '../features/gpx/RoutePage';
import { DataManagementPage } from '../features/data-management/DataManagementPage';
import { FutureFeaturesPage } from '../features/demo/FutureFeaturesPage';
import { FeatureStatusPage } from '../features/demo/FeatureStatusPage';
import { DemoDetailPage } from '../features/demo/DemoDetailPage';
import { TourPage } from '../features/tour/TourPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/new" element={<TripFormPage />} />
        <Route path="trips/:tripId" element={<TripDetailPage />} />
        <Route path="trips/:tripId/edit" element={<TripFormPage />} />
        <Route path="trips/:tripId/checklist" element={<ChecklistPage />} />
        <Route path="trips/:tripId/plan" element={<SafetyPlanPage />} />
        <Route path="trips/:tripId/guidance" element={<GuidancePage />} />
        <Route path="trips/:tripId/share" element={<SharePage />} />
        <Route path="trips/:tripId/reminder" element={<ReminderPage />} />
        <Route path="trips/:tripId/route" element={<RoutePage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="future" element={<FutureFeaturesPage />} />
        <Route path="status" element={<FeatureStatusPage />} />
        <Route path="future/:demoId" element={<DemoDetailPage />} />
        <Route path="tour" element={<TourPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/data" element={<DataManagementPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
