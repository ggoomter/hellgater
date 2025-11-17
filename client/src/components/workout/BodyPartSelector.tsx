import { useState } from 'react';

interface BodyPartSelectorProps {
  onSelectBodyPart: (bodyPartId: number, bodyPartName: string) => void;
  selectedBodyPartId: number | null;
}

type ViewType = 'front' | 'back';

// 부위 정의
const BODY_PARTS = {
  front: [
    { id: 1, name: '어깨', code: 'shoulder', color: '#FF5B5B' },
    { id: 2, name: '가슴', code: 'chest', color: '#78E6C8' },
    { id: 4, name: '팔', code: 'arm', color: '#FF5B5B' },
    { id: 5, name: '복근', code: 'abdominal', color: '#78E6C8' },
    { id: 7, name: '다리', code: 'leg', color: '#E6E6E6' },
  ],
  back: [
    { id: 1, name: '어깨', code: 'shoulder', color: '#FF5B5B' },
    { id: 3, name: '등', code: 'back', color: '#78E6C8' },
    { id: 4, name: '팔', code: 'arm', color: '#FF5B5B' },
    { id: 6, name: '엉덩이', code: 'hip', color: '#E6E6E6' },
    { id: 7, name: '다리', code: 'leg', color: '#E6E6E6' },
  ],
};

export default function BodyPartSelector({ onSelectBodyPart, selectedBodyPartId }: BodyPartSelectorProps) {
  const [view, setView] = useState<ViewType>('front');

  const currentParts = BODY_PARTS[view];

  return (
    <div className="space-y-4">
      {/* 앞면/뒷면 탭 */}
      <div className="flex gap-2 bg-gray-700/30 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setView('front')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            view === 'front'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          앞면
        </button>
        <button
          type="button"
          onClick={() => setView('back')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
            view === 'back'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          뒷면
        </button>
      </div>

      {/* 신체 이미지 */}
      <div className="relative bg-gray-800/50 rounded-lg p-6">
        <div className="flex justify-center">
          <div className="relative w-64" style={{
            clipPath: view === 'front'
              ? 'inset(0 66.6% 0 0)'  // 앞면만 표시
              : 'inset(0 0 0 66.6%)', // 뒷면만 표시
          }}>
            <img
              src={`/images/body-colored.jpg`}
              alt="Body Diagram"
              className="w-full h-auto"
            />

            {/* 클릭 가능한 영역 오버레이 - 앞면 */}
            {view === 'front' && (
              <>
                {/* 앞면 - 어깨 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(1, '어깨')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 1
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '8%', left: '10%', width: '27%', height: '8%' }}
                  title="어깨"
                />
                {/* 앞면 - 가슴 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(2, '가슴')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 2
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '18%', left: '12%', width: '23%', height: '12%' }}
                  title="가슴"
                />
                {/* 앞면 - 복근 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(5, '복근')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 5
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '32%', left: '14%', width: '20%', height: '18%' }}
                  title="복근"
                />
                {/* 앞면 - 다리 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(7, '다리')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 7
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '52%', left: '10%', width: '28%', height: '45%' }}
                  title="다리"
                />
                {/* 앞면 - 팔 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(4, '팔')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 4
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '20%', left: '0%', width: '10%', height: '25%' }}
                  title="팔"
                />
              </>
            )}

            {/* 클릭 가능한 영역 오버레이 - 뒷면 */}
            {view === 'back' && (
              <>
                {/* 뒷면 - 어깨 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(1, '어깨')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 1
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '8%', left: '10%', width: '27%', height: '8%' }}
                  title="어깨"
                />
                {/* 뒷면 - 등 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(3, '등')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 3
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '18%', left: '12%', width: '23%', height: '20%' }}
                  title="등"
                />
                {/* 뒷면 - 엉덩이 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(6, '엉덩이')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 6
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '40%', left: '14%', width: '20%', height: '12%' }}
                  title="엉덩이"
                />
                {/* 뒷면 - 다리 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(7, '다리')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 7
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '52%', left: '10%', width: '28%', height: '45%' }}
                  title="다리"
                />
                {/* 뒷면 - 팔 */}
                <button
                  type="button"
                  onClick={() => onSelectBodyPart(4, '팔')}
                  className={`absolute transition-all border-2 rounded ${
                    selectedBodyPartId === 4
                      ? 'bg-yellow-400/30 border-yellow-400'
                      : 'border-transparent hover:bg-white/10 hover:border-white/30'
                  }`}
                  style={{ top: '20%', left: '0%', width: '10%', height: '25%' }}
                  title="팔"
                />
              </>
            )}
          </div>
        </div>

        {/* 부위 선택 버튼 그리드 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {currentParts.map((part) => (
            <button
              type="button"
              key={part.id}
              onClick={() => onSelectBodyPart(part.id, part.name)}
              className={`py-3 px-4 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedBodyPartId === part.id
                  ? 'bg-primary-500 text-white ring-2 ring-primary-400'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: part.color }}
              />
              {part.name}
            </button>
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <p className="text-xs text-gray-400 text-center">
        💡 운동할 부위를 선택해주세요
      </p>
    </div>
  );
}
