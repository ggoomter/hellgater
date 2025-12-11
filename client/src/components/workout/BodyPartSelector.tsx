import { useState } from 'react';

<<<<<<< HEAD
interface BodyPart {
  id: number;
  code: string;
  nameKo: string;
  nameEn: string;
  displayOrder: number;
  exerciseCount: number;
}

interface BodyPartSelectorProps {
  bodyParts: BodyPart[];
  selectedBodyPartId: number | null;
  onSelect: (bodyPartId: number) => void;
}

const BodyPartSelector = ({ bodyParts, selectedBodyPartId, onSelect }: BodyPartSelectorProps) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // 부위 코드별 SVG path와 위치 매핑
  const bodyPartPaths: Record<string, { path: string; labelX: number; labelY: number }> = {
    shoulder: {
      path: 'M120 80 L140 90 L140 110 L120 105 Z M180 80 L160 90 L160 110 L180 105 Z',
      labelX: 150,
      labelY: 75,
    },
    chest: {
      path: 'M130 110 L170 110 L165 145 L135 145 Z',
      labelX: 150,
      labelY: 125,
    },
    back: {
      path: 'M320 110 L360 110 L365 145 L355 155 L335 155 L325 145 Z',
      labelX: 342,
      labelY: 125,
    },
    arm: {
      path: 'M110 110 L120 105 L115 165 L105 165 Z M180 105 L190 110 L195 165 L185 165 Z',
      labelX: 105,
      labelY: 135,
    },
    abdominal: {
      path: 'M135 145 L165 145 L162 185 L138 185 Z',
      labelX: 150,
      labelY: 165,
    },
    hip: {
      path: 'M138 185 L162 185 L160 210 L140 210 Z',
      labelX: 150,
      labelY: 197,
    },
    leg: {
      path: 'M138 210 L148 210 L145 280 L135 280 Z M152 210 L162 210 L165 280 L155 280 Z',
      labelX: 150,
      labelY: 245,
    },
  };

  const getBodyPartByCode = (code: string) => {
    return bodyParts.find((bp) => bp.code === code);
  };

  const isSelected = (code: string) => {
    const bodyPart = getBodyPartByCode(code);
    return bodyPart?.id === selectedBodyPartId;
  };

  const handlePartClick = (code: string) => {
    const bodyPart = getBodyPartByCode(code);
    if (bodyPart) {
      onSelect(bodyPart.id);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-bold text-white mb-4">운동 부위 선택</h3>

      <div className="relative">
        <svg
          viewBox="0 0 480 320"
          className="w-full max-w-md"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
        >
          {/* 전면 몸통 실루엣 */}
          <g id="front-body">
            {/* 머리 */}
            <circle cx="150" cy="50" r="20" fill="#4B5563" opacity="0.3" />

            {/* 목 */}
            <rect x="145" y="70" width="10" height="10" fill="#4B5563" opacity="0.3" />

            {/* 몸통 배경 */}
            <path
              d="M120 80 L180 80 L180 105 L190 110 L195 165 L185 165 L185 210 L165 210 L165 280 L135 280 L135 210 L115 210 L115 165 L105 165 L110 110 L120 105 Z"
              fill="#374151"
              opacity="0.2"
            />

            {/* 클릭 가능한 부위들 */}
            {Object.entries(bodyPartPaths).map(([code, { path, labelX, labelY }]) => {
              const bodyPart = getBodyPartByCode(code);
              const selected = isSelected(code);
              const hovered = hoveredPart === code;

              return (
                <g key={code}>
                  {/* 부위 영역 */}
                  <path
                    d={path}
                    fill={selected ? '#78E6C8' : hovered ? '#FF5B5B' : '#6B7280'}
                    opacity={selected ? 0.9 : hovered ? 0.7 : 0.5}
                    stroke={selected ? '#78E6C8' : hovered ? '#FF5B5B' : '#4B5563'}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPart(code)}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => handlePartClick(code)}
                  />

                  {/* 라벨 (호버 또는 선택 시) */}
                  {(hovered || selected) && bodyPart && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      className="pointer-events-none"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {bodyPart.nameKo}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 후면 몸통 실루엣 (작게 오른쪽에 배치) */}
          <g id="back-body" transform="translate(190, 0)">
            {/* 머리 */}
            <circle cx="152" cy="50" r="20" fill="#4B5563" opacity="0.3" />

            {/* 목 */}
            <rect x="147" y="70" width="10" height="10" fill="#4B5563" opacity="0.3" />

            {/* 몸통 배경 */}
            <path
              d="M122 80 L182 80 L182 105 L192 110 L197 165 L187 165 L187 210 L167 210 L167 280 L137 280 L137 210 L117 210 L117 165 L107 165 L112 110 L122 105 Z"
              fill="#374151"
              opacity="0.2"
            />

            {/* 등 부위만 클릭 가능 */}
            {bodyPartPaths.back && (() => {
              const { path } = bodyPartPaths.back;
              const selected = isSelected('back');
              const hovered = hoveredPart === 'back';
              const bodyPart = getBodyPartByCode('back');

              return (
                <g>
                  <path
                    d={path}
                    fill={selected ? '#78E6C8' : hovered ? '#FF5B5B' : '#6B7280'}
                    opacity={selected ? 0.9 : hovered ? 0.7 : 0.5}
                    stroke={selected ? '#78E6C8' : hovered ? '#FF5B5B' : '#4B5563'}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPart('back')}
                    onMouseLeave={() => setHoveredPart(null)}
                    onClick={() => handlePartClick('back')}
                  />

                  {(hovered || selected) && bodyPart && (
                    <text
                      x={152}
                      y={125}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      className="pointer-events-none"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {bodyPart.nameKo}
                    </text>
                  )}
                </g>
              );
            })()}
          </g>

          {/* 라벨 */}
          <text x="150" y="310" textAnchor="middle" fill="#9CA3AF" fontSize="11">
            전면
          </text>
          <text x="342" y="310" textAnchor="middle" fill="#9CA3AF" fontSize="11">
            후면
          </text>
        </svg>
      </div>

      {/* 부위 목록 (버튼 형태) */}
      <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-md">
        {bodyParts.map((bodyPart) => {
          const selected = bodyPart.id === selectedBodyPartId;
          return (
            <button
              key={bodyPart.id}
              onClick={() => onSelect(bodyPart.id)}
              onMouseEnter={() => setHoveredPart(bodyPart.code)}
              onMouseLeave={() => setHoveredPart(null)}
              className={`
                px-4 py-3 rounded-lg font-medium transition-all duration-200
                ${
                  selected
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{bodyPart.nameKo}</span>
                <span className="text-xs opacity-70">({bodyPart.exerciseCount})</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BodyPartSelector;
=======
interface BodyPartSelectorProps {
  onSelectBodyPart: (bodyPartId: number, bodyPartName: string, view: 'front' | 'back') => void;
  selectedBodyPartId: number | null;
}

type ViewType = 'front' | 'back';

// 근육별 상세 매핑 (UI에서 개별 선택용)
const MUSCLE_TO_BODYPART: Record<string, { id: number; name: string }> = {
  // 어깨 - 승모근
  'traps-front': { id: 1, name: '어깨' },
  'traps-back': { id: 1, name: '어깨' },

  // 어깨 - 삼각근
  'deltoid-left-front': { id: 1, name: '어깨' },
  'deltoid-right-front': { id: 1, name: '어깨' },
  'deltoid-left-back': { id: 1, name: '어깨' },
  'deltoid-right-back': { id: 1, name: '어깨' },

  // 가슴
  'chest': { id: 2, name: '가슴' },

  // 등
  'back-lats': { id: 3, name: '등' },
  'back-lower': { id: 3, name: '등' },

  // 팔 - 이두
  'bicep-left': { id: 4, name: '팔' },
  'bicep-right': { id: 4, name: '팔' },

  // 팔 - 삼두
  'tricep-left': { id: 4, name: '팔' },
  'tricep-right': { id: 4, name: '팔' },

  // 팔 - 전완
  'forearm-left-front': { id: 4, name: '팔' },
  'forearm-right-front': { id: 4, name: '팔' },
  'forearm-left-back': { id: 4, name: '팔' },
  'forearm-right-back': { id: 4, name: '팔' },

  // 복근
  'abs': { id: 5, name: '복근' },

  // 엉덩이
  'glutes': { id: 6, name: '엉덩이' },

  // 다리 - 대퇴
  'quad-left': { id: 7, name: '다리' },
  'quad-right': { id: 7, name: '다리' },

  // 다리 - 햄스트링
  'hamstring-left': { id: 7, name: '다리' },
  'hamstring-right': { id: 7, name: '다리' },

  // 다리 - 종아리
  'calf-left-front': { id: 7, name: '다리' },
  'calf-right-front': { id: 7, name: '다리' },
  'calf-left-back': { id: 7, name: '다리' },
  'calf-right-back': { id: 7, name: '다리' },
};

export default function BodyPartSelector({ onSelectBodyPart, selectedBodyPartId }: BodyPartSelectorProps) {
  const [view, setView] = useState<ViewType>('front');
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const handlePartClick = (muscleKey: string) => {
    const mapping = MUSCLE_TO_BODYPART[muscleKey];
    if (mapping) {
      onSelectBodyPart(mapping.id, mapping.name, view);
    }
  };

  const isPartSelected = (muscleKey: string): boolean => {
    const mapping = MUSCLE_TO_BODYPART[muscleKey];
    return mapping ? mapping.id === selectedBodyPartId : false;
  };

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

      {/* SVG 신체 이미지 */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex justify-center">
          {view === 'front' ? (
            <FrontBodySVG
              onPartClick={handlePartClick}
              isPartSelected={isPartSelected}
              hoveredPart={hoveredPart}
              setHoveredPart={setHoveredPart}
            />
          ) : (
            <BackBodySVG
              onPartClick={handlePartClick}
              isPartSelected={isPartSelected}
              hoveredPart={hoveredPart}
              setHoveredPart={setHoveredPart}
            />
          )}
        </div>

        {/* 현재 선택된 부위 표시 */}
        {selectedBodyPartId !== null && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">선택된 부위</p>
            <p className="text-lg font-bold text-cyan-400">
              {Object.values(MUSCLE_TO_BODYPART).find(m => m.id === selectedBodyPartId)?.name}
            </p>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <p className="text-xs text-gray-400 text-center">
        💡 운동할 부위를 클릭해주세요
      </p>
    </div>
  );
}

// 앞면 SVG 컴포넌트
interface BodySVGProps {
  onPartClick: (muscleKey: string) => void;
  isPartSelected: (muscleKey: string) => boolean;
  hoveredPart: string | null;
  setHoveredPart: (part: string | null) => void;
}

function FrontBodySVG({ onPartClick, isPartSelected, hoveredPart, setHoveredPart }: BodySVGProps) {
  const getPartClass = (muscleKey: string): string => {
    const baseClass = "muscle-part transition-all duration-200 cursor-pointer";
    const isSelected = isPartSelected(muscleKey);
    const isHovered = hoveredPart === muscleKey;

    if (isSelected) {
      return `${baseClass} fill-blue-500 stroke-white stroke-[2px]`;
    }
    if (isHovered) {
      return `${baseClass} fill-cyan-400 stroke-cyan-300 stroke-[1.5px]`;
    }
    return `${baseClass} fill-gray-600 stroke-gray-900 stroke-[2px] hover:fill-cyan-400/40`;
  };

  return (
    <svg
      viewBox="0 0 200 400"
      xmlns="http://www.w3.org/2000/svg"
      className="h-96 w-auto drop-shadow-lg"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
    >
      {/* 정적 요소들 (귀, 얼굴, 손, 발) */}
      <circle cx="76" cy="35" r="5" className="fill-gray-500 pointer-events-none" />
      <circle cx="124" cy="35" r="5" className="fill-gray-500 pointer-events-none" />
      <circle cx="100" cy="35" r="20" className="fill-gray-500 pointer-events-none" />

      {/* 머리카락 */}
      <path d="M76 35 L76 28 Q76 10 100 8 Q124 10 124 28 L124 35 Q112 24 100 26 Q88 24 76 35 Z" className="fill-gray-700 stroke-gray-900 stroke-[1px] pointer-events-none" />

      {/* 얼굴 특징 */}
      <circle cx="94" cy="38" r="2" className="fill-white/90 pointer-events-none" />
      <circle cx="106" cy="38" r="2" className="fill-white/90 pointer-events-none" />
      <path d="M96 48 Q100 51 104 48" stroke="#fff" strokeWidth="1.5" fill="none" className="pointer-events-none" />

      {/* 손과 발 */}
      <circle cx="40" cy="200" r="8" className="fill-gray-500 pointer-events-none" />
      <circle cx="160" cy="200" r="8" className="fill-gray-500 pointer-events-none" />
      <path d="M55 340 L85 340 L90 355 L50 355 Z" className="fill-gray-500 pointer-events-none" />
      <path d="M115 340 L145 340 L150 355 L110 355 Z" className="fill-gray-500 pointer-events-none" />

      {/* 클릭 가능한 근육 부위들 */}

      {/* 승모근 (Trapezius) */}
      <path
        d="M85 55 L115 55 L130 70 L70 70 Z"
        className={getPartClass('traps-front')}
        onClick={() => onPartClick('traps-front')}
        onMouseEnter={() => setHoveredPart('traps-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 삼각근 좌측 */}
      <path
        d="M130 70 L160 75 L155 110 L125 105 Z"
        className={getPartClass('deltoid-left-front')}
        onClick={() => onPartClick('deltoid-left-front')}
        onMouseEnter={() => setHoveredPart('deltoid-left-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 삼각근 우측 */}
      <path
        d="M70 70 L40 75 L45 110 L75 105 Z"
        className={getPartClass('deltoid-right-front')}
        onClick={() => onPartClick('deltoid-right-front')}
        onMouseEnter={() => setHoveredPart('deltoid-right-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 가슴 (Chest) */}
      <path
        d="M70 70 L130 70 L125 115 L100 120 L75 115 Z"
        className={getPartClass('chest')}
        onClick={() => onPartClick('chest')}
        onMouseEnter={() => setHoveredPart('chest')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 복근 (Abs) */}
      <path
        d="M75 115 L125 115 L125 170 L75 170 Z"
        className={getPartClass('abs')}
        onClick={() => onPartClick('abs')}
        onMouseEnter={() => setHoveredPart('abs')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 이두 우측 */}
      <path
        d="M45 110 L40 145 L65 145 L70 110 Z"
        className={getPartClass('bicep-right')}
        onClick={() => onPartClick('bicep-right')}
        onMouseEnter={() => setHoveredPart('bicep-right')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 이두 좌측 */}
      <path
        d="M155 110 L160 145 L135 145 L130 110 Z"
        className={getPartClass('bicep-left')}
        onClick={() => onPartClick('bicep-left')}
        onMouseEnter={() => setHoveredPart('bicep-left')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 전완 우측 */}
      <path
        d="M40 145 L35 190 L55 195 L65 145 Z"
        className={getPartClass('forearm-right-front')}
        onClick={() => onPartClick('forearm-right-front')}
        onMouseEnter={() => setHoveredPart('forearm-right-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 전완 좌측 */}
      <path
        d="M160 145 L165 190 L145 195 L135 145 Z"
        className={getPartClass('forearm-left-front')}
        onClick={() => onPartClick('forearm-left-front')}
        onMouseEnter={() => setHoveredPart('forearm-left-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 대퇴 우측 */}
      <path
        d="M100 170 L65 170 L65 260 L95 260 Z"
        className={getPartClass('quad-right')}
        onClick={() => onPartClick('quad-right')}
        onMouseEnter={() => setHoveredPart('quad-right')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 대퇴 좌측 */}
      <path
        d="M100 170 L135 170 L135 260 L105 260 Z"
        className={getPartClass('quad-left')}
        onClick={() => onPartClick('quad-left')}
        onMouseEnter={() => setHoveredPart('quad-left')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 종아리 우측 */}
      <path
        d="M95 260 L65 260 L70 340 L90 340 Z"
        className={getPartClass('calf-right-front')}
        onClick={() => onPartClick('calf-right-front')}
        onMouseEnter={() => setHoveredPart('calf-right-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 종아리 좌측 */}
      <path
        d="M105 260 L135 260 L130 340 L110 340 Z"
        className={getPartClass('calf-left-front')}
        onClick={() => onPartClick('calf-left-front')}
        onMouseEnter={() => setHoveredPart('calf-left-front')}
        onMouseLeave={() => setHoveredPart(null)}
      />
    </svg>
  );
}

// 뒷면 SVG 컴포넌트
function BackBodySVG({ onPartClick, isPartSelected, hoveredPart, setHoveredPart }: BodySVGProps) {
  const getPartClass = (muscleKey: string): string => {
    const baseClass = "muscle-part transition-all duration-200 cursor-pointer";
    const isSelected = isPartSelected(muscleKey);
    const isHovered = hoveredPart === muscleKey;

    if (isSelected) {
      return `${baseClass} fill-blue-500 stroke-white stroke-[2px]`;
    }
    if (isHovered) {
      return `${baseClass} fill-cyan-400 stroke-cyan-300 stroke-[1.5px]`;
    }
    return `${baseClass} fill-gray-600 stroke-gray-900 stroke-[2px] hover:fill-cyan-400/40`;
  };

  return (
    <svg
      viewBox="0 0 200 400"
      xmlns="http://www.w3.org/2000/svg"
      className="h-96 w-auto drop-shadow-lg"
      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}
    >
      {/* 정적 요소들 */}
      <circle cx="76" cy="35" r="5" className="fill-gray-500 pointer-events-none" />
      <circle cx="124" cy="35" r="5" className="fill-gray-500 pointer-events-none" />
      <circle cx="100" cy="35" r="20" className="fill-gray-500 pointer-events-none" />

      {/* 뒷머리 */}
      <path d="M75 35 L75 28 Q75 8 100 8 Q125 8 125 28 L125 35 L120 50 Q100 55 80 50 L75 35 Z" className="fill-gray-700 stroke-gray-900 stroke-[1px] pointer-events-none" />

      {/* 손과 발 */}
      <circle cx="40" cy="200" r="8" className="fill-gray-500 pointer-events-none" />
      <circle cx="160" cy="200" r="8" className="fill-gray-500 pointer-events-none" />
      <path d="M55 340 L85 340 L90 355 L50 355 Z" className="fill-gray-500 pointer-events-none" />
      <path d="M115 340 L145 340 L150 355 L110 355 Z" className="fill-gray-500 pointer-events-none" />

      {/* 클릭 가능한 근육 부위들 */}

      {/* 승모근 (뒷면) */}
      <path
        d="M85 55 L115 55 L125 80 L75 80 Z"
        className={getPartClass('traps-back')}
        onClick={() => onPartClick('traps-back')}
        onMouseEnter={() => setHoveredPart('traps-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 삼각근 좌측 (뒷면) */}
      <path
        d="M130 70 L160 75 L155 110 L125 105 Z"
        className={getPartClass('deltoid-left-back')}
        onClick={() => onPartClick('deltoid-left-back')}
        onMouseEnter={() => setHoveredPart('deltoid-left-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 삼각근 우측 (뒷면) */}
      <path
        d="M70 70 L40 75 L45 110 L75 105 Z"
        className={getPartClass('deltoid-right-back')}
        onClick={() => onPartClick('deltoid-right-back')}
        onMouseEnter={() => setHoveredPart('deltoid-right-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 등 - 광배근 */}
      <path
        d="M75 80 L125 80 L115 140 L85 140 Z"
        className={getPartClass('back-lats')}
        onClick={() => onPartClick('back-lats')}
        onMouseEnter={() => setHoveredPart('back-lats')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 등 - 하부 */}
      <path
        d="M85 140 L115 140 L115 170 L85 170 Z"
        className={getPartClass('back-lower')}
        onClick={() => onPartClick('back-lower')}
        onMouseEnter={() => setHoveredPart('back-lower')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 엉덩이 (Glutes) */}
      <path
        d="M85 170 L115 170 L135 200 L100 210 L65 200 Z"
        className={getPartClass('glutes')}
        onClick={() => onPartClick('glutes')}
        onMouseEnter={() => setHoveredPart('glutes')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 삼두 우측 */}
      <path
        d="M45 110 L40 145 L65 145 L70 110 Z"
        className={getPartClass('tricep-right')}
        onClick={() => onPartClick('tricep-right')}
        onMouseEnter={() => setHoveredPart('tricep-right')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 삼두 좌측 */}
      <path
        d="M155 110 L160 145 L135 145 L130 110 Z"
        className={getPartClass('tricep-left')}
        onClick={() => onPartClick('tricep-left')}
        onMouseEnter={() => setHoveredPart('tricep-left')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 전완 우측 */}
      <path
        d="M40 145 L35 190 L55 195 L65 145 Z"
        className={getPartClass('forearm-right-back')}
        onClick={() => onPartClick('forearm-right-back')}
        onMouseEnter={() => setHoveredPart('forearm-right-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 전완 좌측 */}
      <path
        d="M160 145 L165 190 L145 195 L135 145 Z"
        className={getPartClass('forearm-left-back')}
        onClick={() => onPartClick('forearm-left-back')}
        onMouseEnter={() => setHoveredPart('forearm-left-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 햄스트링 우측 */}
      <path
        d="M100 210 L65 200 L65 260 L95 260 Z"
        className={getPartClass('hamstring-right')}
        onClick={() => onPartClick('hamstring-right')}
        onMouseEnter={() => setHoveredPart('hamstring-right')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 햄스트링 좌측 */}
      <path
        d="M100 210 L135 200 L135 260 L105 260 Z"
        className={getPartClass('hamstring-left')}
        onClick={() => onPartClick('hamstring-left')}
        onMouseEnter={() => setHoveredPart('hamstring-left')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 종아리 우측 */}
      <path
        d="M95 260 L65 260 L70 340 L90 340 Z"
        className={getPartClass('calf-right-back')}
        onClick={() => onPartClick('calf-right-back')}
        onMouseEnter={() => setHoveredPart('calf-right-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />

      {/* 종아리 좌측 */}
      <path
        d="M105 260 L135 260 L130 340 L110 340 Z"
        className={getPartClass('calf-left-back')}
        onClick={() => onPartClick('calf-left-back')}
        onMouseEnter={() => setHoveredPart('calf-left-back')}
        onMouseLeave={() => setHoveredPart(null)}
      />
    </svg>
  );
}
>>>>>>> a14ba48b3ded447a7d81adc44ed6140ba9d425b9
