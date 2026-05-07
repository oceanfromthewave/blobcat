export enum PetState {
    Idle,
    Walking,
    Typing,
    Sleeping
}

export class CatPet {
    private frames = {
        [PetState.Idle]: ['🐱', '😸'],
        [PetState.Walking]: ['🐾 🐱', ' 🐾🐱', '  🐾🐱', '   🐾🐱'],
        [PetState.Typing]: ['😺⚡', '😸⚡', '😻⚡'],
        [PetState.Sleeping]: ['💤🐱', '💤😺']
    };

    private currentState: PetState = PetState.Idle;
    private frameIndex = 0;
    private position = 0;
    private direction = 1;

    // 현재 프레임 텍스트 가져오기
    public getNextFrame(): string {
        const currentFrames = this.frames[this.currentState];
        this.frameIndex = (this.frameIndex + 1) % currentFrames.length;
        
        let prefix = "".padStart(this.position, " ");
        return `${prefix}${currentFrames[this.frameIndex]}`;
    }

    // 상태 변경
    public setState(state: PetState) {
        if (this.currentState !== state) {
            this.currentState = state;
            this.frameIndex = 0;
        }
    }

    // 걷기 위치 업데이트
    public updatePosition() {
        if (this.currentState === PetState.Walking) {
            this.position += this.direction;
            if (this.position > 15 || this.position < 0) {
                this.direction *= -1; // 벽에 닿으면 방향 전환
            }
        }
    }

    public getState() { return this.currentState; }
}
