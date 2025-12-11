import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Check } from 'lucide-react';
import { measurementApi } from '../../services/api/measurement.api';

interface ProgressPhotoUploadProps {
  weekNumber?: number;
  onUploadComplete: (photos: any[]) => void;
}

const ProgressPhotoUpload: React.FC<ProgressPhotoUploadProps> = ({
  weekNumber = 0,
  onUploadComplete,
}) => {
  const [photos, setPhotos] = useState<{
    front: File | null;
    side: File | null;
    back: File | null;
  }>({
    front: null,
    side: null,
    back: null,
  });

  const [previews, setPreviews] = useState<{
    front: string | null;
    side: string | null;
    back: string | null;
  }>({
    front: null,
    side: null,
    back: null,
  });

  const [uploading, setUploading] = useState(false);

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
  };

  const handleFileSelect = (
    type: 'front' | 'side' | 'back',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    // 이미지 파일 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setPhotos({ ...photos, [type]: file });

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({ ...previews, [type]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (type: 'front' | 'side' | 'back') => {
    setPhotos({ ...photos, [type]: null });
    setPreviews({ ...previews, [type]: null });
    if (fileInputRefs[type].current) {
      fileInputRefs[type].current!.value = '';
    }
  };

  const handleUpload = async () => {
    const uploadedPhotos = Object.entries(photos).filter(
      ([_, file]) => file !== null
    );

    if (uploadedPhotos.length === 0) {
      alert('최소 1장의 사진을 업로드해주세요.');
      return;
    }

    setUploading(true);

    try {
      // 이미지를 base64로 변환하여 업로드
      // 실제 프로덕션에서는 파일을 서버에 업로드하고 URL을 받아와야 함
      const uploadResults = await Promise.all(
        uploadedPhotos.map(async ([type, file]) => {
          // 이미지를 base64로 변환
          const base64Url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file!);
          });

          // 이미지 크기 정보 가져오기
          const imageSize = await new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            img.onload = () => {
              resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = base64Url;
          });

          // API 호출하여 진행 사진 저장
          const response = await measurementApi.uploadProgressPhoto({
            photoType: type as 'front' | 'side' | 'back',
            photoUrl: base64Url, // 실제로는 서버에서 받은 URL을 사용해야 함
            photoDate: new Date().toISOString().split('T')[0],
            weekNumber,
            fileSizeBytes: file!.size,
            imageWidth: imageSize.width,
            imageHeight: imageSize.height,
            isPublic: false,
          });

          return {
            photoType: type,
            photoUrl: response.data.photoUrl,
            photoDate: new Date().toISOString().split('T')[0],
            weekNumber,
            fileSizeBytes: file!.size,
          };
        })
      );

      onUploadComplete(uploadResults);
      alert('사진이 성공적으로 업로드되었습니다!');
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || '업로드 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const photoTypes = [
    {
      key: 'front' as const,
      label: '정면',
      icon: '🧍',
      description: '팔을 자연스럽게 내리고 정면을 바라보세요',
    },
    {
      key: 'side' as const,
      label: '측면',
      icon: '🚶',
      description: '왼쪽 또는 오른쪽 옆모습',
    },
    {
      key: 'back' as const,
      label: '후면',
      icon: '🙋',
      description: '등과 엉덩이 라인이 보이도록',
    },
  ];

  const allPhotosUploaded =
    photos.front !== null && photos.side !== null && photos.back !== null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Camera className="text-purple-400" size={32} />
          진행 사진 촬영
        </h2>
        <p className="text-gray-400 mb-6">
          {weekNumber === 0 ? 'Before 사진' : `${weekNumber}주차 진행 사진`}을
          촬영해주세요
        </p>

        {/* 촬영 가이드 */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-2 text-blue-400">📸 촬영 팁</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 아침 공복 상태에서 촬영하세요</li>
            <li>• 밝은 조명 아래에서 촬영하세요</li>
            <li>• 같은 장소, 같은 시간에 촬영하세요</li>
            <li>• 타이머를 사용하면 더 좋습니다</li>
          </ul>
        </div>

        {/* 사진 업로드 영역 */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {photoTypes.map(({ key, label, icon, description }) => (
            <div key={key}>
              <div className="text-center mb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-semibold">{label}</h3>
                <p className="text-xs text-gray-400">{description}</p>
              </div>

              {previews[key] ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-green-500"
                >
                  <img
                    src={previews[key]!}
                    alt={`${label} 사진`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(key)}
                    className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-green-500/90 rounded-lg p-2 flex items-center justify-center gap-2">
                    <Check size={16} />
                    <span className="text-sm font-semibold">완료</span>
                  </div>
                </motion.div>
              ) : (
                <div
                  onClick={() => fileInputRefs[key].current?.click()}
                  className="aspect-[3/4] border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-700/30 transition-all"
                >
                  <Upload className="text-gray-500 mb-2" size={32} />
                  <span className="text-sm text-gray-400">
                    클릭하여 업로드
                  </span>
                  <input
                    ref={fileInputRefs[key]}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(key, e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 진행 상황 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>
              {Object.values(photos).filter((p) => p !== null).length} / 3 완료
            </span>
            {allPhotosUploaded && (
              <span className="text-green-400 font-semibold">
                모든 사진 준비 완료!
              </span>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (Object.values(photos).filter((p) => p !== null).length / 3) *
                  100
                }%`,
              }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>

        {/* 업로드 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleUpload}
            disabled={
              uploading || Object.values(photos).every((p) => p === null)
            }
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload size={20} />
                업로드 완료
              </>
            )}
          </button>
        </div>

        {/* 주의사항 */}
        <div className="mt-6 bg-orange-500/20 border border-orange-500/50 rounded-xl p-4">
          <p className="text-sm text-gray-300">
            <strong className="text-orange-400">⚠️ 개인정보 보호:</strong> 업로드된
            사진은 암호화되어 저장되며, 본인만 볼 수 있습니다. 공개 설정을 하지
            않는 한 다른 사용자에게 노출되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressPhotoUpload;
