"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatPet = exports.PetState = void 0;
var PetState;
(function (PetState) {
    PetState[PetState["Idle"] = 0] = "Idle";
    PetState[PetState["Walking"] = 1] = "Walking";
    PetState[PetState["Typing"] = 2] = "Typing";
    PetState[PetState["Sleeping"] = 3] = "Sleeping";
})(PetState = exports.PetState || (exports.PetState = {}));
class CatPet {
    constructor() {
        this.frames = {
            [PetState.Idle]: ['🐱', '😸'],
            [PetState.Walking]: ['🐾 🐱', ' 🐾🐱', '  🐾🐱', '   🐾🐱'],
            [PetState.Typing]: ['😺⚡', '😸⚡', '😻⚡'],
            [PetState.Sleeping]: ['💤🐱', '💤😺']
        };
        this.currentState = PetState.Idle;
        this.frameIndex = 0;
        this.position = 0;
        this.direction = 1;
    }
    // 현재 프레임 텍스트 가져오기
    getNextFrame() {
        const currentFrames = this.frames[this.currentState];
        this.frameIndex = (this.frameIndex + 1) % currentFrames.length;
        let prefix = "".padStart(this.position, " ");
        return `${prefix}${currentFrames[this.frameIndex]}`;
    }
    // 상태 변경
    setState(state) {
        if (this.currentState !== state) {
            this.currentState = state;
            this.frameIndex = 0;
        }
    }
    // 걷기 위치 업데이트
    updatePosition() {
        if (this.currentState === PetState.Walking) {
            this.position += this.direction;
            if (this.position > 15 || this.position < 0) {
                this.direction *= -1; // 벽에 닿으면 방향 전환
            }
        }
    }
    getState() { return this.currentState; }
}
exports.CatPet = CatPet;
//# sourceMappingURL=pet.js.map