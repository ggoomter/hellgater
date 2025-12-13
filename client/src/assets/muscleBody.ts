export const muscleBodySvg = `
<svg viewBox="0 0 450 400" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
    <style>
        .muscle-part {
            fill: #404040;
            stroke: #121212;
            stroke-width: 2px;
            stroke-linecap: round;
            stroke-linejoin: round;
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .muscle-part:hover {
            fill: #00e5ff;
            filter: drop-shadow(0 0 6px #00e5ff);
        }
        .muscle-part.selected {
            fill: #2979ff;
            stroke: #fff;
            stroke-width: 1.5px;
            filter: drop-shadow(0 0 10px #2979ff);
        }
        .static-part {
            fill: #888;
            pointer-events: none;
        }
        .hair-part {
            fill: #4a4a4a;
            stroke: #111111;
            stroke-width: 1px;
            pointer-events: none;
        }
        .face-feature {
            fill: rgba(255,255,255,0.9);
            pointer-events: none;
        }
        .ear-line {
            fill: none;
            stroke: #444;
            stroke-width: 1.5;
            stroke-linecap: round;
            pointer-events: none;
        }
    </style>

    <!-- 1. 남성 앞면 (좌측) -->
    <g transform="translate(10, 0)">
        <!-- 귀 -->
        <circle cx="76" cy="35" r="5" class="static-part" />
        <path d="M77 33 Q74 35 77 38" class="ear-line" />
        <circle cx="124" cy="35" r="5" class="static-part" />
        <path d="M123 33 Q126 35 123 38" class="ear-line" />

        <!-- 얼굴형 -->
        <circle cx="100" cy="35" r="20" class="static-part" />
        
        <!-- 남성 앞머리 -->
        <path d="M76 35 L76 28 Q76 10 100 8 Q124 10 124 28 L124 35 Q112 24 100 26 Q88 24 76 35 Z" class="hair-part" />
        
        <!-- 이목구비 -->
        <circle cx="94" cy="38" r="2" class="face-feature" />
        <circle cx="106" cy="38" r="2" class="face-feature" />
        <path d="M96 48 Q100 51 104 48" stroke="#fff" stroke-width="1.5" fill="none" />

        <!-- 신체 (기존 유지) -->
        <circle cx="40" cy="200" r="8" class="static-part" />
        <circle cx="160" cy="200" r="8" class="static-part" />
        <path d="M55 340 L85 340 L90 355 L50 355 Z" class="static-part" />
        <path d="M115 340 L145 340 L150 355 L110 355 Z" class="static-part" />

        <!-- 근육 패스 (앞면) -->
        <!-- 승모근 (shoulders) -->
        <path data-part="shoulders" class="muscle-part" d="M85 55 L115 55 L130 70 L70 70 Z" />
        
        <!-- 가슴 (chest) -->
        <path data-part="chest" class="muscle-part" d="M70 70 L130 70 L125 115 L100 120 L75 115 Z" />
        
        <!-- 어깨 (shoulders) -->
        <path data-part="shoulders" class="muscle-part" d="M130 70 L160 75 L155 110 L125 105 Z" />
        <path data-part="shoulders" class="muscle-part" d="M70 70 L40 75 L45 110 L75 105 Z" />
        
        <!-- 팔 (arms - 이두) -->
        <path data-part="arms" class="muscle-part" d="M155 110 L160 145 L135 145 L130 110 Z" />
        <path data-part="arms" class="muscle-part" d="M45 110 L40 145 L65 145 L70 110 Z" />
        
        <!-- 팔 (arms - 전완) -->
        <path data-part="arms" class="muscle-part" d="M160 145 L165 190 L145 195 L135 145 Z" />
        <path data-part="arms" class="muscle-part" d="M40 145 L35 190 L55 195 L65 145 Z" />
        
        <!-- 복근 (abs) -->
        <path data-part="abs" class="muscle-part" d="M75 115 L125 115 L125 170 L75 170 Z" />
        
        <!-- 다리 (legs - 대퇴사두) -->
        <path data-part="legs" class="muscle-part" d="M100 170 L135 170 L135 260 L105 260 Z" />
        <path data-part="legs" class="muscle-part" d="M100 170 L65 170 L65 260 L95 260 Z" />
        
        <!-- 다리 (legs - 종아리) -->
        <path data-part="legs" class="muscle-part" d="M105 260 L135 260 L130 340 L110 340 Z" />
        <path data-part="legs" class="muscle-part" d="M95 260 L65 260 L70 340 L90 340 Z" />
    </g>

    <!-- 2. 남성 뒷면 (우측) -->
    <g transform="translate(230, 0)">
        <!-- 귀 살짝 보임 -->
        <circle cx="76" cy="35" r="5" class="static-part" />
        <circle cx="124" cy="35" r="5" class="static-part" />

        <!-- 머리 (피부) -->
        <circle cx="100" cy="35" r="20" class="static-part" />
        
        <!-- 남성 뒷머리 -->
        <path d="M75 35 L75 28 Q75 8 100 8 Q125 8 125 28 L125 35 L120 50 Q100 55 80 50 L75 35 Z" class="hair-part" />

        <!-- 신체 -->
        <circle cx="40" cy="200" r="8" class="static-part" />
        <circle cx="160" cy="200" r="8" class="static-part" />
        <path d="M55 340 L85 340 L90 355 L50 355 Z" class="static-part" />
        <path d="M115 340 L145 340 L150 355 L110 355 Z" class="static-part" />

        <!-- 근육 패스 (뒷면) -->
        <!-- 승모근 (back) -->
        <path data-part="back" class="muscle-part" d="M85 55 L115 55 L125 80 L75 80 Z" />
        
        <!-- 어깨 (shoulders) -->
        <path data-part="shoulders" class="muscle-part" d="M130 70 L160 75 L155 110 L125 105 Z" />
        <path data-part="shoulders" class="muscle-part" d="M70 70 L40 75 L45 110 L75 105 Z" />
        
        <!-- 광배근 (back) -->
        <path data-part="back" class="muscle-part" d="M75 80 L125 80 L115 140 L85 140 Z" />
        
        <!-- 기립근 (back) -->
        <path data-part="back" class="muscle-part" d="M85 140 L115 140 L115 170 L85 170 Z" />
        
        <!-- 팔 (arms - 삼두) -->
        <path data-part="arms" class="muscle-part" d="M155 110 L160 145 L135 145 L130 110 Z" />
        <path data-part="arms" class="muscle-part" d="M45 110 L40 145 L65 145 L70 110 Z" />
        
        <!-- 팔 (arms - 전완) -->
        <path data-part="arms" class="muscle-part" d="M160 145 L165 190 L145 195 L135 145 Z" />
        <path data-part="arms" class="muscle-part" d="M40 145 L35 190 L55 195 L65 145 Z" />
        
        <!-- 둔근 (legs - 사실상 하체에 포함하거나 back에 포함하기도 하지만 여기선 legs로 매핑하거나 별도 처리 필요. 
             현재는 legs로 매핑) -->
        <path data-part="legs" class="muscle-part" d="M85 170 L115 170 L135 200 L100 210 L65 200 Z" />
        
        <!-- 다리 (legs - 햄스트링) -->
        <path data-part="legs" class="muscle-part" d="M100 210 L135 200 L135 260 L105 260 Z" />
        <path data-part="legs" class="muscle-part" d="M100 210 L65 200 L65 260 L95 260 Z" />
        
        <!-- 다리 (legs - 종아리) -->
        <path data-part="legs" class="muscle-part" d="M105 260 L135 260 L130 340 L110 340 Z" />
        <path data-part="legs" class="muscle-part" d="M95 260 L65 260 L70 340 L90 340 Z" />
    </g>
    
    <!-- 라벨 -->
    <text x="110" y="380" text-anchor="middle" fill="#9CA3AF" font-size="14" font-weight="bold">FRONT</text>
    <text x="330" y="380" text-anchor="middle" fill="#9CA3AF" font-size="14" font-weight="bold">BACK</text>
</svg>
`;
