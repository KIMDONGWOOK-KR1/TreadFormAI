import { launchImageLibrary } from 'react-native-image-picker';
import { pick, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

export type PickResult =
  | { status: 'ok'; uri: string; width?: number; height?: number }
  | { status: 'cancelled' }
  | { status: 'portrait' }
  | { status: 'error'; message?: string };

/**
 * 갤러리(Photo Picker) 에서 영상 선택.
 *   - Android 13+ 에선 시스템 Photo Picker UI 사용 (썸네일/메타데이터 인덱싱된 항목만 노출).
 *   - 에뮬레이터에선 인덱싱 캐시 문제로 항목이 안 보일 수 있음 → pickVideoFromFiles 사용 권장.
 *   - PRD-5 함정 #9: width < height 이면 클라이언트에서 사전 차단.
 */
export async function pickVideoFromGallery(): Promise<PickResult> {
  try {
    const res = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
      includeExtra: true,
    });
    if (res.didCancel) {
      return { status: 'cancelled' };
    }
    if (res.errorCode) {
      return { status: 'error', message: res.errorMessage };
    }
    const asset = res.assets?.[0];
    if (!asset?.uri) {
      return { status: 'error' };
    }
    if (
      typeof asset.width === 'number' &&
      typeof asset.height === 'number' &&
      asset.width < asset.height
    ) {
      return { status: 'portrait' };
    }
    return {
      status: 'ok',
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  } catch (e) {
    return { status: 'error', message: String(e) };
  }
}

/**
 * Document Picker (Storage Access Framework) 로 영상 선택.
 *   - 갤러리 인덱싱과 무관하게 동작 → 에뮬레이터/외부 저장소 파일 호환성 우수.
 *   - 차원 메타데이터를 못 받기 때문에 portrait 사전 차단은 못 함 (서버 거부에 의존).
 */
export async function pickVideoFromFiles(): Promise<PickResult> {
  try {
    // mode: 'open' → ACTION_OPEN_DOCUMENT (SAF 파일 브라우저).
    //   기본값 ACTION_GET_CONTENT 는 Android 13+ 에서 미디어 타입을 Photo Picker 로 리다이렉트.
    //   SAF 는 갤러리 인덱싱과 무관하게 파일 시스템 직접 노출 → 에뮬레이터 + Downloads 폴더 호환.
    const [file] = await pick({
      type: ['video/*'],
      allowMultiSelection: false,
      mode: 'open',
    });
    if (!file?.uri) {
      return { status: 'error' };
    }
    // content:// URI 는 RN FormData 가 ContentResolver 로 자동 처리하므로 추가 복사 불필요.
    return { status: 'ok', uri: file.uri };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
      return { status: 'cancelled' };
    }
    return { status: 'error', message: String(e) };
  }
}
