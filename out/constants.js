"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH_ID = exports.CAT_SVG = void 0;
exports.CAT_SVG = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g id="cat-main" style="transform-origin: center bottom;">
    <!-- 몸통 (둥글둥글한 화이트/크림색) -->
    <path d="M20 80 Q20 40 50 40 Q80 40 80 80 Z" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
    
    <!-- 귀 (안쪽은 핑크) -->
    <path d="M33 44 L28 36 L40 42 Z" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
    <path d="M33 41 L30 38 L37 41 Z" fill="#FFD1DC"/>

    <path d="M67 44 L72 36 L60 42 Z" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="2"/>
    <path d="M67 41 L70 38 L63 41 Z" fill="#FFD1DC"/>

    <!-- 얼굴 구성 요소 -->
    <g id="face">
      <!-- 눈 (반짝이는 검은 눈) -->
      <circle cx="40" cy="55" r="4" fill="#333333"/>
      <circle cx="39" cy="54" r="1.5" fill="white"/> <!-- 눈광 -->
      
      <circle cx="60" cy="55" r="4" fill="#333333"/>
      <circle cx="59" cy="54" r="1.5" fill="white"/> <!-- 눈광 -->
      
      <!-- 볼터치 (부끄부끄) -->
      <circle cx="32" cy="62" r="5" fill="#FFD1DC" opacity="0.8"/>
      <circle cx="68" cy="62" r="5" fill="#FFD1DC" opacity="0.8"/>
      
      <!-- 입 (ㅅ 모양) -->
      <path d="M45 65 Q50 70 55 65" fill="none" stroke="#333333" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- 앞발 -->
    <circle cx="35" cy="80" r="5" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>
    <circle cx="65" cy="80" r="5" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>
  </g>
</svg>
`;
exports.PATCH_ID = 'CAT_PET_PATCH_V6';
//# sourceMappingURL=constants.js.map