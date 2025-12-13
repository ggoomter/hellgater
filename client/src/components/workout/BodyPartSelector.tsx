import { useState } from 'react';
import { muscleBodySvg } from '../../assets/muscleBody';

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

  // SVG 문자열을 DOM으로 파싱하여 직접 조작할 수 있도록 함
  // React에서는 dangerouslySetInnerHTML을 사용하거나 컴포넌트화 해야 함. 
  // 여기서는 SVG 내부의 data-part 속성을 활용할 수 있도록 이벤트 위임을 사용.

  // 코드 매핑 (SVG data-part -> DB code)
  // SVG에는 일반적인 명칭(chest, back...)이 있고 DB에도 코드가 있으므로 매핑 필요
  const partMapping: Record<string, string> = {
    'chest': 'chest',
    'back': 'back',
    'shoulders': 'shoulders',
    'arms': 'arms',
    'abs': 'abs',
    'legs': 'legs',
    'cardio': 'cardio' // cardio는 SVG에 없을 수 있음
  };

  const getBodyPartByCode = (code: string) => {
    // DB의 code와 매핑된 code가 일치하는지 확인
    return bodyParts.find((bp) => bp.code === code);
  };

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // muscle-part 클래스를 가진 요소를 클릭했을 때
    if (target.classList.contains('muscle-part')) {
      const partCode = target.getAttribute('data-part');
      if (partCode && partMapping[partCode]) {
        const dbCode = partMapping[partCode];
        const bodyPart = getBodyPartByCode(dbCode);
        if (bodyPart) {
          onSelect(bodyPart.id);
        }
      }
    }
  };

  const handleSvgHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('muscle-part')) {
      const partCode = target.getAttribute('data-part');
      if (partCode && partMapping[partCode]) {
        setHoveredPart(partMapping[partCode]);
      }
    } else {
      setHoveredPart(null);
    }
  };

  // 선택된 부위 스타일링을 위한 CSS 클래스 주입
  // SVG가 문자열로 렌더링되므로, CSS로 제어
  const getSelectedCode = () => {
    const part = bodyParts.find(p => p.id === selectedBodyPartId);
    return part ? part.code : null;
  };

  const selectedCode = getSelectedCode();

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-lg font-bold text-white mb-4">운동 부위 선택</h3>

      <div 
        className="relative w-full max-w-2xl mx-auto cursor-pointer"
        onClick={handleSvgClick}
        onMouseMove={handleSvgHover}
        onMouseLeave={() => setHoveredPart(null)}
      >
        <style>{`
          /* 동적 스타일링 */
          ${selectedCode ? `
            .muscle-part[data-part="${selectedCode}"] {
              fill: #2979ff !important;
              stroke: #fff !important;
              stroke-width: 1.5px !important;
              filter: drop-shadow(0 0 10px #2979ff) !important;
            }
          ` : ''}
          ${hoveredPart ? `
            .muscle-part[data-part="${hoveredPart}"]:not([data-part="${selectedCode}"]) {
               fill: #00e5ff !important;
               filter: drop-shadow(0 0 6px #00e5ff) !important;
            }
          ` : ''}
        `}</style>
        
        {/* SVG 렌더링 */}
        <div dangerouslySetInnerHTML={{ __html: muscleBodySvg }} />
      </div>

      {/* 모바일 등의 환경을 위한 부위 버튼 목록 (선택 보조) */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg">
        {bodyParts.map((bodyPart) => {
          const selected = bodyPart.id === selectedBodyPartId;
          return (
            <button
              key={bodyPart.id}
              onClick={() => onSelect(bodyPart.id)}
              onMouseEnter={() => setHoveredPart(bodyPart.code)}
              onMouseLeave={() => setHoveredPart(null)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  selected
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{bodyPart.nameKo}</span>
                <span className="text-xs opacity-70 bg-black/20 px-1.5 py-0.5 rounded-full">{bodyPart.exerciseCount}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BodyPartSelector;
