import { useState } from 'react';

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
