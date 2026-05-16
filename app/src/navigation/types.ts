import type { AnalysisStatusCompleted } from '../services/api';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Upload: { videoUri: string };
  Processing: { analysisId: string };
  Result: { result: AnalysisStatusCompleted };
  Dashboard: undefined;
  MemberSelect: undefined;
};
